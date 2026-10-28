const express = require("express");
const cors = require("cors");
const env = require("./config/env");
const { pool } = require("./config/db");
const v1Routes = require("./routes");
const { notFoundHandler, errorHandler } = require("./middleware/error.middleware");

// Builds the Express app without starting it (server.js listens), so tests
// can import the app directly.
const app = express();

// Browsers may only call the API from the origins listed in CORS_ORIGINS.
// Requests without an Origin header (the mobile app, curl) are not affected.
app.use(cors({ origin: env.corsOrigins.length > 0 ? env.corsOrigins : false }));
app.use(express.json({ limit: "100kb" }));

// For the load balancer / uptime monitor: is the API up and can it reach the database?
app.get("/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");
        res.status(200).json({ status: "ok", database: "up" });
    } catch {
        res.status(503).json({ status: "degraded", database: "down" });
    }
});

app.use("/api/v1", v1Routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
