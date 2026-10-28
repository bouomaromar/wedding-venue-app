const { rateLimit } = require("express-rate-limit");

const MINUTE = 60 * 1000;

const tooManyRequests = (message) => (req, res) => {
    res.status(429).json({ error: { code: "TOO_MANY_REQUESTS", message } });
};

// Slows down password guessing. Only failed logins count, so people who
// type their password correctly are never blocked.
const loginLimiter = rateLimit({
    windowMs: 15 * MINUTE,
    limit: 10,
    skipSuccessfulRequests: true,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: tooManyRequests("Too many failed attempts, please try again in a few minutes")
});

// Stops one device from creating accounts in bulk.
const registerLimiter = rateLimit({
    windowMs: 60 * MINUTE,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: tooManyRequests("Too many sign-ups from this device, please try again later")
});

module.exports = { loginLimiter, registerLimiter };
