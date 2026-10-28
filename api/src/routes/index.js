const express = require("express");
const authRoutes = require("./auth.route");
const venueRoutes = require("./venue.route");
const lookupRoutes = require("./lookup.route");

// Everything under /api/v1. To add a module (bookings, reviews, favorites,
// preferences, recommendations...), create its route file and mount it here.
const router = express.Router();

router.use("/auth", authRoutes);
router.use("/venues", venueRoutes);
router.use("/", lookupRoutes); // /styles, /amenities, /regions

module.exports = router;
