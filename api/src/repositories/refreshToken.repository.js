const { pool } = require("../config/db");

const create = async ({ userId, tokenHash, expiresAt }, db = pool) => {
    await db.query(
        `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
         VALUES ($1, $2, $3)`,
        [userId, tokenHash, expiresAt]
    );
};

// Locks the row (FOR UPDATE) so two refreshes with the same token can't both succeed.
const findByHashForUpdate = async (tokenHash, db) => {
    const result = await db.query(
        `SELECT rt.id,
                rt.user_id AS "userId",
                rt.expires_at AS "expiresAt",
                rt.revoked_at AS "revokedAt",
                u.role,
                u.is_active AS "isActive"
         FROM refresh_tokens rt
         JOIN users u ON u.id = rt.user_id
         WHERE rt.token_hash = $1
         FOR UPDATE OF rt`,
        [tokenHash]
    );
    return result.rows[0];
};

const revoke = async (id, db = pool) => {
    await db.query("UPDATE refresh_tokens SET revoked_at = now() WHERE id = $1 AND revoked_at IS NULL", [id]);
};

const revokeByHash = async (tokenHash, db = pool) => {
    await db.query("UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = $1 AND revoked_at IS NULL", [tokenHash]);
};

const revokeAllForUser = async (userId, db = pool) => {
    await db.query("UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL", [userId]);
};

module.exports = {
    create,
    findByHashForUpdate,
    revoke,
    revokeByHash,
    revokeAllForUser
};
