const tokenService = require("../services/token.service");
const { unauthorized, forbidden } = require("../utils/AppError");

const readBearerToken = (req) => {
    const [scheme, token] = (req.headers.authorization || "").split(" ");
    return scheme === "Bearer" && token ? token : null;
};

// Requires a valid access token and sets req.user = { id, role }.
const requireAuth = (req, res, next) => {
    const token = readBearerToken(req);
    if (!token) {
        throw unauthorized();
    }

    req.user = tokenService.verifyAccessToken(token);
    next();
};

// For public routes that show more to signed-in users (e.g. an owner viewing
// their own unapproved venue). A missing or bad token just means "guest".
const optionalAuth = (req, res, next) => {
    const token = readBearerToken(req);
    if (token) {
        try {
            req.user = tokenService.verifyAccessToken(token);
        } catch {
            req.user = undefined;
        }
    }
    next();
};

// Use after requireAuth: requireRole("owner"), requireRole("owner", "admin")
const requireRole = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        throw forbidden();
    }
    next();
};

module.exports = { requireAuth, optionalAuth, requireRole };
