import apiFetch from "./apiFetch";
import handleResponse from "./handleResponse";

export const getRegions = async () => handleResponse(await apiFetch("/regions"));

export const getStyles = async () => handleResponse(await apiFetch("/styles"));

export const getAmenities = async () => handleResponse(await apiFetch("/amenities"));
