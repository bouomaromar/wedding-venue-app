const { REGIONS, VENUE_STATUSES } = require("../config/constants");
const {
    isMissing,
    isText,
    isWholeNumber,
    isNumberBetween,
    isUuid,
    isUuidList
} = require("../utils/validation");

const MAX_TAGS = 20;
const MAX_PRICE = 10000000; // USD

// Used for both create (POST) and update (PUT): the client sends the full venue.
const validateVenue = (body) => {
    const errors = [];

    if (!isText(body.name, { min: 2, max: 150 })) {
        errors.push("Name must be between 2 and 150 characters");
    }

    if (!isMissing(body.description) && !isText(body.description, { min: 0, max: 2000 })) {
        errors.push("Description must be text of at most 2000 characters");
    }

    if (!REGIONS.includes(body.region)) {
        errors.push(`Region must be one of: ${REGIONS.join(", ")}`);
    }

    if (!isMissing(body.address) && !isText(body.address, { min: 0, max: 255 })) {
        errors.push("Address must be text of at most 255 characters");
    }

    const hasLatitude = !isMissing(body.latitude);
    const hasLongitude = !isMissing(body.longitude);
    if (hasLatitude !== hasLongitude) {
        errors.push("Latitude and longitude must be given together");
    } else if (hasLatitude && (!isNumberBetween(body.latitude, -90, 90) || !isNumberBetween(body.longitude, -180, 180))) {
        errors.push("Latitude must be between -90 and 90 and longitude between -180 and 180");
    }

    const capacityOk = isWholeNumber(body.capacityMin) && isWholeNumber(body.capacityMax, { min: 1 });
    if (!capacityOk) {
        errors.push("Minimum and maximum capacity must be whole numbers (maximum at least 1)");
    } else if (Number(body.capacityMax) < Number(body.capacityMin)) {
        errors.push("Maximum capacity can't be less than minimum capacity");
    }

    const priceOk = isWholeNumber(body.priceMin, { max: MAX_PRICE }) && isWholeNumber(body.priceMax, { max: MAX_PRICE });
    if (!priceOk) {
        errors.push(`Minimum and maximum price must be whole numbers between 0 and ${MAX_PRICE}`);
    } else if (Number(body.priceMax) < Number(body.priceMin)) {
        errors.push("Maximum price can't be less than minimum price");
    }

    if (!isMissing(body.styleIds) && (!isUuidList(body.styleIds) || body.styleIds.length > MAX_TAGS)) {
        errors.push(`styleIds must be a list of up to ${MAX_TAGS} style ids`);
    }

    if (!isMissing(body.amenityIds) && (!isUuidList(body.amenityIds) || body.amenityIds.length > MAX_TAGS)) {
        errors.push(`amenityIds must be a list of up to ${MAX_TAGS} amenity ids`);
    }

    return errors;
};

// Admin moderation: approve/reject a venue and/or feature it.
const validateVenueStatus = (body) => {
    const errors = [];
    const hasStatus = !isMissing(body.status);
    const hasFeatured = !isMissing(body.isFeatured);

    if (!hasStatus && !hasFeatured) {
        errors.push("Send status and/or isFeatured");
    }
    if (hasStatus && !VENUE_STATUSES.includes(body.status)) {
        errors.push(`Status must be one of: ${VENUE_STATUSES.join(", ")}`);
    }
    if (hasFeatured && typeof body.isFeatured !== "boolean") {
        errors.push("isFeatured must be true or false");
    }

    return errors;
};

// Filters on GET /venues. Every filter is optional.
const validateVenueQuery = (query) => {
    const errors = [];

    if (!isMissing(query.region) && !REGIONS.includes(query.region)) {
        errors.push(`region must be one of: ${REGIONS.join(", ")}`);
    }
    if (!isMissing(query.guests) && !isWholeNumber(query.guests, { min: 1 })) {
        errors.push("guests must be a whole number of at least 1");
    }
    if (!isMissing(query.budget) && !isWholeNumber(query.budget)) {
        errors.push("budget must be a whole number");
    }
    if (!isMissing(query.styleId) && !isUuid(query.styleId)) {
        errors.push("styleId must be a valid id");
    }
    if (!isMissing(query.amenityId) && !isUuid(query.amenityId)) {
        errors.push("amenityId must be a valid id");
    }
    if (!isMissing(query.featured) && !["true", "false"].includes(query.featured)) {
        errors.push("featured must be true or false");
    }
    if (!isMissing(query.status) && !VENUE_STATUSES.includes(query.status)) {
        errors.push(`status must be one of: ${VENUE_STATUSES.join(", ")}`);
    }
    if (!isMissing(query.search) && !isText(query.search, { min: 1, max: 100 })) {
        errors.push("search must be at most 100 characters");
    }

    return errors;
};

module.exports = {
    validateVenue,
    validateVenueStatus,
    validateVenueQuery
};
