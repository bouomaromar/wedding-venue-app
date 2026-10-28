const { SELF_REGISTER_ROLES, ROLES } = require("../config/constants");
const { isMissing, isEmail, isText } = require("../utils/validation");

const MIN_PASSWORD = 8;
const MAX_PASSWORD = 72; // bcrypt ignores anything past 72 bytes

const validateRegister = (body) => {
    const errors = [];

    if (!isText(body.name, { min: 2, max: 100 })) {
        errors.push("Name must be between 2 and 100 characters");
    }

    if (!isEmail(body.email)) {
        errors.push("A valid email is required");
    }

    if (typeof body.password !== "string" || body.password.length < MIN_PASSWORD || body.password.length > MAX_PASSWORD) {
        errors.push(`Password must be between ${MIN_PASSWORD} and ${MAX_PASSWORD} characters`);
    }

    if (!isMissing(body.phone) && !isText(body.phone, { min: 6, max: 30 })) {
        errors.push("Phone must be between 6 and 30 characters");
    }

    if (!isMissing(body.role) && !SELF_REGISTER_ROLES.includes(body.role)) {
        errors.push(`Role must be one of: ${SELF_REGISTER_ROLES.join(", ")}`);
    }

    if (body.role === ROLES.OWNER && !isText(body.companyName, { min: 2, max: 150 })) {
        errors.push("Company name is required for venue owners (2 to 150 characters)");
    }

    return errors;
};

const validateLogin = (body) => {
    const errors = [];

    if (!isEmail(body.email)) {
        errors.push("A valid email is required");
    }

    if (typeof body.password !== "string" || body.password.length === 0) {
        errors.push("Password is required");
    }

    return errors;
};

const validateRefreshToken = (body) =>
    isText(body.refreshToken, { min: 20, max: 200 }) ? [] : ["refreshToken is required"];

module.exports = {
    validateRegister,
    validateLogin,
    validateRefreshToken
};
