const { AppError } = require("../utils/AppError");

// Any URL that no router matched.
const notFoundHandler = (req, res) => {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "Route not found" } });
};

// Every error ends up here (Express 5 also forwards errors thrown in async
// handlers), so all failures share one shape: { error: { code, message } }.
// eslint-disable-next-line no-unused-vars
const errorHandler = (error, req, res, next) => {
    if (error instanceof AppError) {
        return res.status(error.status).json({
            error: {
                code: error.code,
                message: error.message,
                ...(error.details && { details: error.details })
            }
        });
    }

    // malformed JSON in the request body
    if (error.type === "entity.parse.failed") {
        return res.status(400).json({ error: { code: "INVALID_JSON", message: "Request body is not valid JSON" } });
    }

    // anything unexpected: log the details, but never send them to the client
    console.error(error);
    res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Something went wrong" } });
};

module.exports = { notFoundHandler, errorHandler };
