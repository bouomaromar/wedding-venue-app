const express = require("express");
const authController = require("../controllers/auth.controller");
const validate = require("../middleware/validate.middleware");
const { requireAuth } = require("../middleware/auth.middleware");
const { loginLimiter, registerLimiter } = require("../middleware/rateLimit.middleware");
const { validateRegister, validateLogin, validateRefreshToken } = require("../validators/auth.validator");

const router = express.Router();

router.post("/register", registerLimiter, validate(validateRegister), authController.register);
router.post("/login", loginLimiter, validate(validateLogin), authController.login);
router.post("/refresh", validate(validateRefreshToken), authController.refresh);
router.post("/logout", validate(validateRefreshToken), authController.logout);
router.get("/me", requireAuth, authController.me);

module.exports = router;
