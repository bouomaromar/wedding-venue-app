const { withTransaction } = require("../config/db");
const { ROLES } = require("../config/constants");
const venueRepository = require("../repositories/venue.repository");
const venueOwnerRepository = require("../repositories/venueOwner.repository");
const PG = require("../utils/pgErrors");
const { getPagination, toPage } = require("../utils/pagination");
const { isUuid } = require("../utils/validation");
const { badRequest, conflict, forbidden, notFound } = require("../utils/AppError");

const venueNotFound = () => notFound("Venue not found");

// Admins see everything; an owner sees their own venue in any status.
const canManage = (venue, user) =>
    Boolean(user) && (user.role === ROLES.ADMIN || venue.ownerUserId === user.id);

// The owner's user id is only needed for permission checks, not by the app.
const toPublicVenue = ({ ownerUserId, ...venue }) => venue;

// A style/amenity id that doesn't exist fails the foreign key check.
const translateTagErrors = (error) => {
    if (error.code === PG.FOREIGN_KEY_VIOLATION) {
        return badRequest("One or more style or amenity ids don't exist");
    }
    return error;
};

const getOwnerProfile = async (user) => {
    const owner = await venueOwnerRepository.findByUserId(user.id);
    if (!owner) {
        throw forbidden("Your account has no venue owner profile");
    }
    return owner;
};

// Loads the venue and checks the caller may change it (404 if it doesn't exist, 403 if not theirs).
const assertCanManage = async (id, user) => {
    const venue = isUuid(id) ? await venueRepository.findOwnership(id) : null;
    if (!venue) {
        throw venueNotFound();
    }
    if (!canManage(venue, user)) {
        throw forbidden("You can only manage your own venues");
    }
    return venue;
};

const saveTags = async (venueId, { styleIds, amenityIds }, client) => {
    if (styleIds) {
        await venueRepository.setStyles(venueId, styleIds, client);
    }
    if (amenityIds) {
        await venueRepository.setAmenities(venueId, amenityIds, client);
    }
};

// Public search. Guests and couples only see approved venues; an admin can
// pass ?status= to see the moderation queue.
const listVenues = async (query, user) => {
    const pagination = getPagination(query);
    const isAdmin = user?.role === ROLES.ADMIN;

    const filters = {
        statuses: isAdmin && query.status ? [query.status] : ["approved"],
        region: query.region,
        guests: query.guests ? Number(query.guests) : undefined,
        budget: query.budget ? Number(query.budget) : undefined,
        styleId: query.styleId,
        amenityId: query.amenityId,
        featured: query.featured ? query.featured === "true" : undefined,
        search: query.search?.trim()
    };

    const { venues, total } = await venueRepository.findAll(filters, pagination);
    return toPage(venues, total, pagination);
};

// The signed-in owner's venues, in every status.
const listMyVenues = async (query, user) => {
    const owner = await getOwnerProfile(user);
    const pagination = getPagination(query);
    const { venues, total } = await venueRepository.findAll({ ownerId: owner.id }, pagination);
    return toPage(venues, total, pagination);
};

const getVenueById = async (id, user) => {
    const venue = isUuid(id) ? await venueRepository.findById(id) : null;

    // unapproved venues are hidden from everyone except their owner and admins
    if (!venue || (venue.status !== "approved" && !canManage(venue, user))) {
        throw venueNotFound();
    }

    return toPublicVenue(venue);
};

// New venues start as "pending" until an admin approves them.
const createVenue = async (data, user) => {
    const owner = await getOwnerProfile(user);

    try {
        const venueId = await withTransaction(async (client) => {
            const id = await venueRepository.create(owner.id, data, client);
            await saveTags(id, data, client);
            return id;
        });
        return getVenueById(venueId, user);
    } catch (error) {
        throw translateTagErrors(error);
    }
};

const updateVenue = async (id, data, user) => {
    await assertCanManage(id, user);

    try {
        await withTransaction(async (client) => {
            await venueRepository.update(id, data, client);
            await saveTags(id, data, client);
        });
    } catch (error) {
        throw translateTagErrors(error);
    }

    return getVenueById(id, user);
};

const moderateVenue = async (id, changes, user) => {
    const updatedId = isUuid(id) ? await venueRepository.updateModeration(id, changes) : null;
    if (!updatedId) {
        throw venueNotFound();
    }
    return getVenueById(id, user);
};

const deleteVenue = async (id, user) => {
    await assertCanManage(id, user);

    try {
        await venueRepository.remove(id);
    } catch (error) {
        // bookings reference the venue with ON DELETE RESTRICT so history is never lost
        if (error.code === PG.FOREIGN_KEY_VIOLATION) {
            throw conflict("This venue has bookings and can't be deleted");
        }
        throw error;
    }
};

module.exports = {
    listVenues,
    listMyVenues,
    getVenueById,
    createVenue,
    updateVenue,
    moderateVenue,
    deleteVenue
};
