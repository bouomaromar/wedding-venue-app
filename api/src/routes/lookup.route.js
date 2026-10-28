const express = require("express");
const lookupController = require("../controllers/lookup.controller");

// Public lists the app uses to build filters and forms.
const router = express.Router();

router.get("/styles", lookupController.getStyles);
router.get("/amenities", lookupController.getAmenities);
router.get("/regions", lookupController.getRegions);

module.exports = router;
