const { Pool } = require("pg");
const env = require("./env");

const pool = new Pool(env.db);

pool.on("error", (error) => {
    console.error("Unexpected PostgreSQL error:", error);
});

// Runs `work(client)` inside BEGIN/COMMIT and rolls back if it throws.
// Repositories accept an optional client so they can join the transaction.
const withTransaction = async (work) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");
        const result = await work(client);
        await client.query("COMMIT");
        return result;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

module.exports = { pool, withTransaction };
