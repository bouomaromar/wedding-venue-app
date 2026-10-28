const lookupRepository = require("../repositories/lookup.repository");
const { REGIONS } = require("../config/constants");

const getStyles = () => lookupRepository.findAllStyles();

const getAmenities = () => lookupRepository.findAllAmenities();

const getRegions = () => REGIONS;

module.exports = {
    getStyles,
    getAmenities,
    getRegions
};
