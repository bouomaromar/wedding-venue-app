// Values shared by validators, services and the seed script.

const ROLES = Object.freeze({
    COUPLE: "couple",
    OWNER: "owner",
    ADMIN: "admin"
});

// roles a person can pick when signing up; admins are created by hand
const SELF_REGISTER_ROLES = [ROLES.COUPLE, ROLES.OWNER];

const VENUE_STATUSES = ["pending", "approved", "rejected"];

// Lebanon's governorates
const REGIONS = [
    "Beirut",
    "Mount Lebanon",
    "Keserwan-Jbeil",
    "North Lebanon",
    "Akkar",
    "Bekaa",
    "Baalbek-Hermel",
    "South Lebanon",
    "Nabatieh"
];

const PAGINATION = Object.freeze({
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 50
});

module.exports = {
    ROLES,
    SELF_REGISTER_ROLES,
    VENUE_STATUSES,
    REGIONS,
    PAGINATION
};
