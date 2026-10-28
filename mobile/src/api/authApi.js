import apiFetch from "./apiFetch";
import handleResponse from "./handleResponse";

// Each function is one API call. Screens never call fetch directly.

export const login = async (email, password) =>
    handleResponse(await apiFetch("/auth/login", { method: "POST", body: { email, password } }));

export const register = async (data) =>
    handleResponse(await apiFetch("/auth/register", { method: "POST", body: data }));

export const getCurrentUser = async () =>
    handleResponse(await apiFetch("/auth/me"));

export const logout = async (refreshToken) =>
    handleResponse(await apiFetch("/auth/logout", { method: "POST", body: { refreshToken } }));
