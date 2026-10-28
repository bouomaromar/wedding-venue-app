// Fills the database with reference data (style tags, amenities) and demo
// accounts and venues, so the app has something to show right away.
// Safe to run more than once: it skips the demo data if it already exists.
//
//   npm run db:seed

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const env = require("../src/config/env");
const { pool, withTransaction } = require("../src/config/db");
const { ROLES } = require("../src/config/constants");

const SEEDS_DIR = path.join(__dirname, "..", "sql", "seeds");
const SALT_ROUNDS = 10;
const DEMO_PASSWORD = "Password123!";

const demoUsers = [
    { name: "Admin", email: "admin@demo.lb", role: ROLES.ADMIN },
    { name: "Cedar Events", email: "owner@demo.lb", role: ROLES.OWNER, phone: "+961 3 000 000" },
    { name: "Rami & Lara", email: "couple@demo.lb", role: ROLES.COUPLE }
];

// placeholder photos until real venue media is uploaded to storage
const photo = (seed) => `https://picsum.photos/seed/${seed}/1200/800`;

const demoVenues = [
    {
        name: "Cedar Garden Estate",
        description: "Open-air garden venue surrounded by old olive trees, with an indoor hall as a backup.",
        region: "Mount Lebanon",
        address: "Broummana",
        latitude: 33.8820, longitude: 35.6200,
        capacityMin: 100, capacityMax: 450,
        priceMin: 15000, priceMax: 40000,
        isFeatured: true,
        styles: ["Garden", "Mountain View"],
        amenities: ["Parking", "Valet", "Outdoor Ceremony Area", "Indoor Backup", "Bridal Suite"],
        media: [{ type: "photo", url: photo("cedar-garden") }]
    },
    {
        name: "Batroun Shore Club",
        description: "Beachfront terrace for sunset ceremonies, steps from the old port.",
        region: "North Lebanon",
        address: "Batroun",
        latitude: 34.2553, longitude: 35.6581,
        capacityMin: 80, capacityMax: 300,
        priceMin: 12000, priceMax: 30000,
        isFeatured: false,
        styles: ["Beach", "Modern"],
        amenities: ["Parking", "Sound System", "Outdoor Ceremony Area", "Generator"],
        media: [{ type: "photo", url: photo("batroun-shore") }]
    },
    {
        name: "Gemmayzeh Rooftop",
        description: "City-view rooftop in the heart of Beirut for smaller, modern weddings.",
        region: "Beirut",
        address: "Gemmayzeh",
        latitude: 33.8950, longitude: 35.5150,
        capacityMin: 40, capacityMax: 180,
        priceMin: 8000, priceMax: 20000,
        isFeatured: false,
        styles: ["Rooftop", "Modern"],
        amenities: ["Valet", "Sound System", "In-house Catering"],
        media: [{ type: "photo", url: photo("gemmayzeh-rooftop") }]
    },
    {
        name: "Deir el Qamar Palace",
        description: "Restored Ottoman-era stone palace with arched courtyards.",
        region: "Mount Lebanon",
        address: "Deir el Qamar",
        latitude: 33.6960, longitude: 35.5630,
        capacityMin: 150, capacityMax: 600,
        priceMin: 25000, priceMax: 60000,
        isFeatured: true,
        styles: ["Heritage", "Ballroom"],
        amenities: ["Parking", "Bridal Suite", "Accommodation", "Generator", "In-house Catering"],
        media: [{ type: "photo", url: photo("deir-palace") }]
    }
];

const runSqlSeeds = async () => {
    const files = fs.readdirSync(SEEDS_DIR).filter((file) => file.endsWith(".sql")).sort();

    for (const file of files) {
        await pool.query(fs.readFileSync(path.join(SEEDS_DIR, file), "utf8"));
        console.log(`  ran ${file}`);
    }
};

const seedDemoData = async () => {
    const existing = await pool.query("SELECT 1 FROM users WHERE email = $1", [demoUsers[0].email]);
    if (existing.rowCount > 0) {
        console.log("  demo data already present, skipping");
        return;
    }

    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);

    await withTransaction(async (client) => {
        const userIds = {};
        for (const user of demoUsers) {
            const result = await client.query(
                `INSERT INTO users (name, email, phone, password_hash, role)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING id`,
                [user.name, user.email, user.phone ?? null, passwordHash, user.role]
            );
            userIds[user.role] = result.rows[0].id;
        }

        const owner = demoUsers.find((user) => user.role === ROLES.OWNER);
        const ownerResult = await client.query(
            `INSERT INTO venue_owners (user_id, company_name, contact_email, contact_phone)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            [userIds[ROLES.OWNER], owner.name, owner.email, owner.phone]
        );
        const ownerId = ownerResult.rows[0].id;

        for (const venue of demoVenues) {
            const result = await client.query(
                `INSERT INTO venues (owner_id, name, description, region, address, latitude, longitude,
                                     capacity_min, capacity_max, price_min, price_max, status, is_featured)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'approved', $12)
                 RETURNING id`,
                [ownerId, venue.name, venue.description, venue.region, venue.address, venue.latitude,
                    venue.longitude, venue.capacityMin, venue.capacityMax, venue.priceMin, venue.priceMax,
                    venue.isFeatured]
            );
            const venueId = result.rows[0].id;

            await client.query(
                `INSERT INTO venue_styles (venue_id, style_id)
                 SELECT $1, id FROM style_tags WHERE name = ANY($2::text[])`,
                [venueId, venue.styles]
            );
            await client.query(
                `INSERT INTO venue_amenities (venue_id, amenity_id)
                 SELECT $1, id FROM amenities WHERE name = ANY($2::text[])`,
                [venueId, venue.amenities]
            );

            for (const [index, media] of venue.media.entries()) {
                await client.query(
                    "INSERT INTO venue_media (venue_id, type, url, sort_order) VALUES ($1, $2, $3, $4)",
                    [venueId, media.type, media.url, index]
                );
            }
        }
    });

    console.log(`  created ${demoUsers.length} demo accounts and ${demoVenues.length} venues`);
    console.log(`  demo logins: ${demoUsers.map((user) => user.email).join(", ")} / password: ${DEMO_PASSWORD}`);
};

const main = async () => {
    if (env.nodeEnv === "production") {
        console.error("Refusing to seed demo data into production");
        process.exitCode = 1;
        return;
    }

    try {
        console.log("Seeding...");
        await runSqlSeeds();
        await seedDemoData();
        console.log("Done.");
    } catch (error) {
        console.error(`Seeding failed: ${error.message}`);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
};

main();
