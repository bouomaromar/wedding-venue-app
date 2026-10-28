const express = require("express");
const venueController = require("../controllers/venue.controller");
const validate = require("../middleware/validate.middleware");
const { requireAuth, optionalAuth, requireRole } = require("../middleware/auth.middleware");
const { ROLES } = require("../config/constants");
const { validateVenue, validateVenueStatus, validateVenueQuery } = require("../validators/venue.validator");

const router = express.Router();

const ownerOnly = [requireAuth, requireRole(ROLES.OWNER)];
const ownerOrAdmin = [requireAuth, requireRole(ROLES.OWNER, ROLES.ADMIN)];
const adminOnly = [requireAuth, requireRole(ROLES.ADMIN)];

// public (guests can browse; a token just unlocks extra visibility)
router.get("/", optionalAuth, validate(validateVenueQuery, "query"), venueController.listVenues);

// "/mine" must come before "/:id", otherwise "mine" would be read as an id
router.get("/mine", ...ownerOnly, venueController.listMyVenues);
router.get("/:id", optionalAuth, venueController.getVenueById);

router.post("/", ...ownerOnly, validate(validateVenue), venueController.createVenue);
router.put("/:id", ...ownerOrAdmin, validate(validateVenue), venueController.updateVenue);
router.patch("/:id/status", ...adminOnly, validate(validateVenueStatus), venueController.moderateVenue);
router.delete("/:id", ...ownerOrAdmin, venueController.deleteVenue);

module.exports = router;
