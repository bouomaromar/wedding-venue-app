import { API_URL } from "../config";
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from "./tokenStorage";

// Lets the auth state know when the session can't be renewed, so the app
// returns to the login screen. (Like the course repo's SESSION_EXPIRED_EVENT,
// but React Native has no window events.)
const sessionExpiredListeners = new Set();

export const onSessionExpired = (listener) => {
    sessionExpiredListeners.add(listener);
    return () => sessionExpiredListeners.delete(listener);
};

const notifySessionExpired = () => sessionExpiredListeners.forEach((listener) => listener());

// If several requests fail at once, they all wait for the same refresh call.
let refreshInFlight = null;

const refreshTokens = () => {
    if (!refreshInFlight) {
        refreshInFlight = (async () => {
            const refreshToken = await getRefreshToken();
            if (!refreshToken) {
                return false;
            }

            const response = await fetch(`${API_URL}/auth/refresh`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken })
            });

            if (!response.ok) {
                await clearTokens();
                return false;
            }

            await saveTokens(await response.json());
            return true;
        })()
            .catch(() => false)
            .finally(() => {
                refreshInFlight = null;
            });
    }
    return refreshInFlight;
};

// fetch for the API: prefixes the base URL, sends JSON and the access token,
// and when the access token has expired (401), refreshes it once and retries.
const apiFetch = async (path, { body, headers, ...options } = {}) => {
    const send = async () => {
        const accessToken = await getAccessToken();
        return fetch(`${API_URL}${path}`, {
            ...options,
            headers: {
                Accept: "application/json",
                ...(body !== undefined && { "Content-Type": "application/json" }),
                ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
                ...headers
            },
            body: body !== undefined ? JSON.stringify(body) : undefined
        });
    };

    try {
        let response = await send();

        if (response.status === 401 && (await getRefreshToken())) {
            if (await refreshTokens()) {
                response = await send();
            } else {
                notifySessionExpired();
            }
        }

        return response;
    } catch {
        // fetch only throws when the request never reached the server
        throw new Error("Can't reach the server. Check your connection and the API address in .env.");
    }
};

export default apiFetch;
