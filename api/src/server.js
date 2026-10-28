const env = require("./config/env");
const app = require("./app");
const { pool } = require("./config/db");

// 0.0.0.0 so a phone on the same Wi-Fi (Expo Go) can reach the laptop
const server = app.listen(env.port, "0.0.0.0", () => {
    console.log(`API running on http://localhost:${env.port} (health: /health, API: /api/v1)`);
});

// finish in-flight requests and close database connections on Ctrl+C / container stop
const shutdown = () => {
    server.close(() => pool.end().then(() => process.exit(0)));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
