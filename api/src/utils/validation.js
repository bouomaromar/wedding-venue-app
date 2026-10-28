// Small checks shared by every validator. Each validator returns an array of
// messages; an empty array means the input is valid.

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isMissing = (value) => value === undefined || value === null || value === "";

const isUuid = (value) => typeof value === "string" && UUID_PATTERN.test(value);

const isEmail = (value) => typeof value === "string" && EMAIL_PATTERN.test(value.trim());

const isText = (value, { min = 1, max = 255 } = {}) =>
    typeof value === "string" && value.trim().length >= min && value.trim().length <= max;

const isWholeNumber = (value, { min = 0, max = 2147483647 } = {}) => {
    const number = Number(value);
    return !isMissing(value) && Number.isInteger(number) && number >= min && number <= max;
};

const isNumberBetween = (value, min, max) => {
    const number = Number(value);
    return !isMissing(value) && Number.isFinite(number) && number >= min && number <= max;
};

const isUuidList = (value) => Array.isArray(value) && value.every(isUuid);

module.exports = {
    isMissing,
    isUuid,
    isEmail,
    isText,
    isWholeNumber,
    isNumberBetween,
    isUuidList
};
