const bcrypt = require("bcryptjs");
const { pool, withTransaction } = require("../config/db");
const { ROLES } = require("../config/constants");
const userRepository = require("../repositories/user.repository");
const venueOwnerRepository = require("../repositories/venueOwner.repository");
const refreshTokenRepository = require("../repositories/refreshToken.repository");
const tokenService = require("./token.service");
const PG = require("../utils/pgErrors");
const { conflict, unauthorized, forbidden } = require("../utils/AppError");

const SALT_ROUNDS = 10;

// compared against when the email doesn't exist, so a wrong email takes as
// long as a wrong password and attackers can't tell which emails are registered
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", SALT_ROUNDS);

const invalidCredentials = () => unauthorized("Invalid email or password");

// Owners get their venue_owners profile attached; other roles get null.
const withOwnerProfile = async (user, db = pool) => ({
    ...user,
    ownerProfile: user.role === ROLES.OWNER ? (await venueOwnerRepository.findByUserId(user.id, db)) ?? null : null
});

const register = async ({ name, email, phone, password, role, companyName }) => {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    try {
        // user + owner profile + refresh token are saved together or not at all
        return await withTransaction(async (client) => {
            const user = await userRepository.create({ name, email, phone, passwordHash, role }, client);

            let ownerProfile = null;
            if (role === ROLES.OWNER) {
                ownerProfile = await venueOwnerRepository.create({
                    userId: user.id,
                    companyName,
                    contactEmail: email,
                    contactPhone: phone
                }, client);
            }

            const tokens = await tokenService.issueTokenPair(user, client);
            return { user: { ...user, ownerProfile }, ...tokens };
        });
    } catch (error) {
        if (error.code === PG.UNIQUE_VIOLATION) {
            throw conflict("An account with this email already exists");
        }
        throw error;
    }
};

const login = async ({ email, password }) => {
    const found = await userRepository.findByEmailWithPassword(email);
    const passwordMatches = await bcrypt.compare(password, found?.passwordHash ?? DUMMY_HASH);

    if (!found || !passwordMatches) {
        throw invalidCredentials();
    }

    if (!found.isActive) {
        throw forbidden("This account has been disabled");
    }

    const { passwordHash, ...user } = found;
    const tokens = await tokenService.issueTokenPair(user);
    return { user: await withOwnerProfile(user), ...tokens };
};

// Swaps a valid refresh token for a new pair. The old one is revoked (rotation).
// If a revoked token is used again it was probably stolen, so every session of
// that user is ended.
const refresh = async ({ refreshToken }) => {
    const tokenHash = tokenService.hashToken(refreshToken);

    const outcome = await withTransaction(async (client) => {
        const stored = await refreshTokenRepository.findByHashForUpdate(tokenHash, client);

        if (!stored) {
            return { error: "invalid" };
        }
        if (stored.revokedAt) {
            await refreshTokenRepository.revokeAllForUser(stored.userId, client);
            return { error: "reused" };
        }
        if (new Date(stored.expiresAt) <= new Date() || !stored.isActive) {
            return { error: "invalid" };
        }

        await refreshTokenRepository.revoke(stored.id, client);
        const user = { id: stored.userId, role: stored.role };
        return { tokens: await tokenService.issueTokenPair(user, client) };
    });

    // thrown after the transaction so the "revoke everything" above is committed
    if (outcome.error) {
        throw unauthorized("Your session has expired, please log in again");
    }

    return outcome.tokens;
};

const logout = async ({ refreshToken }) => {
    await refreshTokenRepository.revokeByHash(tokenService.hashToken(refreshToken));
};

const getCurrentUser = async (userId) => {
    const user = await userRepository.findById(userId);
    if (!user || !user.isActive) {
        throw unauthorized("Your account is no longer available");
    }
    return withOwnerProfile(user);
};

module.exports = {
    register,
    login,
    refresh,
    logout,
    getCurrentUser
};
