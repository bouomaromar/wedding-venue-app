const { PAGINATION } = require("../config/constants");

// Reads ?page=&limit= and clamps them to safe values.
const getPagination = (query = {}) => {
    const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
    const requested = Number.parseInt(query.limit, 10) || PAGINATION.DEFAULT_LIMIT;
    const limit = Math.min(Math.max(1, requested), PAGINATION.MAX_LIMIT);

    return { page, limit, offset: (page - 1) * limit };
};

// The response shape every list endpoint uses.
const toPage = (data, total, { page, limit }) => ({
    data,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
});

module.exports = { getPagination, toPage };
