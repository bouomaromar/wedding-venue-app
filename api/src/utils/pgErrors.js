// PostgreSQL error codes the services translate into friendly API errors.
// Full list: https://www.postgresql.org/docs/current/errcodes-appendix.html
module.exports = Object.freeze({
    UNIQUE_VIOLATION: "23505",
    FOREIGN_KEY_VIOLATION: "23503",
    CHECK_VIOLATION: "23514"
});
