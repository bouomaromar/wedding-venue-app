// An error the API expects and knows how to answer. Anything else becomes a 500.
// The error middleware turns it into { error: { code, message, details? } }.
class AppError extends Error {
    constructor(status, code, message, details) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
    }
}

const badRequest = (message, details) => new AppError(400, "VALIDATION_ERROR", message, details);
const unauthorized = (message = "Please log in to continue") => new AppError(401, "UNAUTHORIZED", message);
const forbidden = (message = "You don't have permission to do this") => new AppError(403, "FORBIDDEN", message);
const notFound = (message = "Not found") => new AppError(404, "NOT_FOUND", message);
const conflict = (message) => new AppError(409, "CONFLICT", message);

module.exports = {
    AppError,
    badRequest,
    unauthorized,
    forbidden,
    notFound,
    conflict
};
