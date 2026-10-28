const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const refreshTokenRepository = require("../repositories/refreshToken.repository");
const { unauthorized } = require("../utils/AppError");

const DAY_MS = 24 * 60 * 60 * 1000;

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

// Short-lived token sent with every request. Carries the id and role the API checks.
const createAccessToken = (user) =>
    jwt.sign({ role: user.role }, env.jwt.secret, {
        subject: user.id,
        expiresIn: env.jwt.accessExpiresIn
    });

// Returns { id, role } from a valid access token, or throws 401.
const verifyAccessToken = (token) => {
    try {
        const payload = jwt.verify(token, env.jwt.secret);
        return { id: payload.sub, role: payload.role };
    } catch {
        throw unauthorized("Your session has expired, please log in again");
    }
};

// Long-lived random token used only to get a new access token.
// Only its hash is stored, so the database alone can't be used to sign in.
const issueRefreshToken = async (userId, db) => {
    const token = crypto.randomBytes(48).toString("base64url");
    await refreshTokenRepository.create({
        userId,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + env.jwt.refreshTtlDays * DAY_MS)
    }, db);
    return token;
};

const issueTokenPair = async (user, db) => ({
    accessToken: createAccessToken(user),
    refreshToken: await issueRefreshToken(user.id, db)
});

module.exports = {
    hashToken,
    createAccessToken,
    verifyAccessToken,
    issueTokenPair
};
