const lookupService = require("../services/lookup.service");

const getStyles = async (req, res) => {
    res.status(200).json(await lookupService.getStyles());
};

const getAmenities = async (req, res) => {
    res.status(200).json(await lookupService.getAmenities());
};

const getRegions = (req, res) => {
    res.status(200).json(lookupService.getRegions());
};

module.exports = {
    getStyles,
    getAmenities,
    getRegions
};
