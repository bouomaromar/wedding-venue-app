const { pool } = require("../config/db");

// Fixed lists (style tags, amenities) used for filtering and recommendations.

const findAllStyles = async () => {
    const result = await pool.query("SELECT id, name FROM style_tags ORDER BY name");
    return result.rows;
};

const findAllAmenities = async () => {
    const result = await pool.query("SELECT id, name FROM amenities ORDER BY name");
    return result.rows;
};

module.exports = {
    findAllStyles,
    findAllAmenities
};
