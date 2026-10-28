const venueService = require("../services/venue.service");

const optionalText = (value) => (typeof value === "string" && value.trim() ? value.trim() : null);
const optionalNumber = (value) => (value === undefined || value === null || value === "" ? null : Number(value));

// Clean the validated body into the shape the service expects.
const toVenue = (body) => ({
    name: body.name.trim(),
    description: optionalText(body.description),
    region: body.region,
    address: optionalText(body.address),
    latitude: optionalNumber(body.latitude),
    longitude: optionalNumber(body.longitude),
    capacityMin: Number(body.capacityMin),
    capacityMax: Number(body.capacityMax),
    priceMin: Number(body.priceMin),
    priceMax: Number(body.priceMax),
    // undefined = "leave the tags as they are" on update
    styleIds: body.styleIds,
    amenityIds: body.amenityIds
});

const listVenues = async (req, res) => {
    res.status(200).json(await venueService.listVenues(req.query, req.user));
};

const listMyVenues = async (req, res) => {
    res.status(200).json(await venueService.listMyVenues(req.query, req.user));
};

const getVenueById = async (req, res) => {
    res.status(200).json(await venueService.getVenueById(req.params.id, req.user));
};

const createVenue = async (req, res) => {
    const venue = await venueService.createVenue(toVenue(req.body), req.user);
    res.status(201).json(venue);
};

const updateVenue = async (req, res) => {
    const venue = await venueService.updateVenue(req.params.id, toVenue(req.body), req.user);
    res.status(200).json(venue);
};

const moderateVenue = async (req, res) => {
    const { status, isFeatured } = req.body;
    const venue = await venueService.moderateVenue(req.params.id, { status, isFeatured }, req.user);
    res.status(200).json(venue);
};

const deleteVenue = async (req, res) => {
    await venueService.deleteVenue(req.params.id, req.user);
    res.status(204).send();
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
