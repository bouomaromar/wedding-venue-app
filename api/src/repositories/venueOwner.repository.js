const { pool } = require("../config/db");

const ownerColumns = `
    id,
    user_id AS "userId",
    company_name AS "companyName",
    contact_email AS "contactEmail",
    contact_phone AS "contactPhone",
    created_at AS "createdAt"
`;

const findByUserId = async (userId, db = pool) => {
    const result = await db.query(`SELECT ${ownerColumns} FROM venue_owners WHERE user_id = $1`, [userId]);
    return result.rows[0];
};

const create = async ({ userId, companyName, contactEmail, contactPhone }, db = pool) => {
    const result = await db.query(
        `INSERT INTO venue_owners (user_id, company_name, contact_email, contact_phone)
         VALUES ($1, $2, $3, $4)
         RETURNING ${ownerColumns}`,
        [userId, companyName, contactEmail, contactPhone]
    );
    return result.rows[0];
};

module.exports = {
    findByUserId,
    create
};
