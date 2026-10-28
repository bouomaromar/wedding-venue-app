const { pool } = require("../config/db");

// Columns safe to send to the client. password_hash is never selected here.
const userColumns = `
    id,
    name,
    email,
    phone,
    role,
    is_active AS "isActive",
    created_at AS "createdAt"
`;

// Every function takes an optional `db` so a service can pass a transaction client.
const findById = async (id, db = pool) => {
    const result = await db.query(`SELECT ${userColumns} FROM users WHERE id = $1`, [id]);
    return result.rows[0];
};

// Only for login: the one place the password hash leaves the database.
const findByEmailWithPassword = async (email, db = pool) => {
    const result = await db.query(
        `SELECT ${userColumns}, password_hash AS "passwordHash"
         FROM users
         WHERE email = $1`,
        [email]
    );
    return result.rows[0];
};

const create = async ({ name, email, phone, passwordHash, role }, db = pool) => {
    const result = await db.query(
        `INSERT INTO users (name, email, phone, password_hash, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING ${userColumns}`,
        [name, email, phone, passwordHash, role]
    );
    return result.rows[0];
};

module.exports = {
    findById,
    findByEmailWithPassword,
    create
};
