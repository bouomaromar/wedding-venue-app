const { badRequest } = require("../utils/AppError");

// Runs a validator (input => array of messages) before the controller.
// Usage in a route:
//   router.post("/", validate(validateVenue), controller.create)            checks req.body
//   router.get("/", validate(validateVenueQuery, "query"), controller.list)  checks req.query
const validate = (validator, source = "body") => (req, res, next) => {
    const errors = validator(req[source] ?? {});
    if (errors.length > 0) {
        throw badRequest("Some fields are invalid", errors);
    }
    next();
};

module.exports = validate;
