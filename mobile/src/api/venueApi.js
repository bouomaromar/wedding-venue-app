import apiFetch from "./apiFetch";
import handleResponse from "./handleResponse";

// builds "?region=Beirut&page=2", leaving out empty filters
const toQuery = (params = {}) => {
    const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "");
    return entries.length > 0 ? `?${new URLSearchParams(entries).toString()}` : "";
};

// filters: { page, limit, region, guests, budget, styleId, amenityId, featured, search }
export const getVenues = async (filters) =>
    handleResponse(await apiFetch(`/venues${toQuery(filters)}`));

export const getVenue = async (id) =>
    handleResponse(await apiFetch(`/venues/${encodeURIComponent(id)}`));

export const getMyVenues = async (filters) =>
    handleResponse(await apiFetch(`/venues/mine${toQuery(filters)}`));

export const createVenue = async (venue) =>
    handleResponse(await apiFetch("/venues", { method: "POST", body: venue }));

export const updateVenue = async (id, venue) =>
    handleResponse(await apiFetch(`/venues/${encodeURIComponent(id)}`, { method: "PUT", body: venue }));

export const deleteVenue = async (id) =>
    handleResponse(await apiFetch(`/venues/${encodeURIComponent(id)}`, { method: "DELETE" }));
