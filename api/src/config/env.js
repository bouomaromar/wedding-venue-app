require("dotenv").config({ quiet: true });

// Fail at startup with a clear message instead of failing on the first request.
const required = ["DB_HOST", "DB_PORT", "DB_USER", "DB_NAME", "JWT_SECRET"];
const missing = required.filter((name) => !process.env[name]);

if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}. Copy .env.example to .env and fill it in.`);
}

if (process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters long");
}

const env = {
    port: Number(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || "development",
    db: {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        accessExpiresIn: "15m",
        refreshTtlDays: 7
    },
    // comma-separated list of browser origins allowed to call the API.
    // The mobile app is not a browser, so it does not need to be listed.
    corsOrigins: (process.env.CORS_ORIGINS || "")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
};

module.exports = env;
