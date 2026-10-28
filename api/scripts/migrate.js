// Runs every file in sql/migrations in number order, once each.
// Applied files are recorded in schema_migrations so re-running is safe.
//
//   npm run db:migrate          apply new migrations
//   npm run db:reset            wipe the database, migrate, then seed (development only)

const fs = require("fs");
const path = require("path");
const env = require("../src/config/env");
const { pool } = require("../src/config/db");

const MIGRATIONS_DIR = path.join(__dirname, "..", "sql", "migrations");

const reset = async () => {
    if (env.nodeEnv === "production") {
        throw new Error("Refusing to reset a production database");
    }

    console.log(`Resetting database "${env.db.database}"...`);
    await pool.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
};

const migrate = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            filename    TEXT PRIMARY KEY,
            applied_at  TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    `);

    const applied = new Set(
        (await pool.query("SELECT filename FROM schema_migrations")).rows.map((row) => row.filename)
    );

    const files = fs.readdirSync(MIGRATIONS_DIR)
        .filter((file) => file.endsWith(".sql"))
        .sort();

    const pending = files.filter((file) => !applied.has(file));

    if (pending.length === 0) {
        console.log("Database is up to date.");
        return;
    }

    for (const file of pending) {
        const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
        const client = await pool.connect();

        // each file runs in its own transaction: it applies fully or not at all
        try {
            await client.query("BEGIN");
            await client.query(sql);
            await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [file]);
            await client.query("COMMIT");
            console.log(`  applied ${file}`);
        } catch (error) {
            await client.query("ROLLBACK");
            throw new Error(`Migration ${file} failed: ${error.message}`);
        } finally {
            client.release();
        }
    }

    console.log(`Applied ${pending.length} migration(s).`);
};

const main = async () => {
    try {
        if (process.argv.includes("--reset")) {
            await reset();
        }
        await migrate();
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
};

main();
