import { useCallback, useEffect, useMemo, useState } from "react";
import AuthContext from "./AuthContext";
import * as authApi from "../api/authApi";
import { onSessionExpired } from "../api/apiFetch";
import { getRefreshToken, saveTokens, clearTokens } from "../api/tokenStorage";

// Holds the signed-in user for the whole app. The navigator reads `user.role`
// to decide which tabs to show.
const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // restore the session when the app opens
    useEffect(() => {
        let cancelled = false;

        const restore = async () => {
            try {
                if (await getRefreshToken()) {
                    // apiFetch renews the access token by itself if it expired
                    const currentUser = await authApi.getCurrentUser();
                    if (!cancelled) {
                        setUser(currentUser);
                    }
                }
            } catch {
                await clearTokens();
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        restore();

        return () => {
            cancelled = true;
        };
    }, []);

    // the refresh token expired or was revoked: back to login
    useEffect(() => onSessionExpired(() => setUser(null)), []);

    const login = useCallback(async (email, password) => {
        const { user: signedIn, accessToken, refreshToken } = await authApi.login(email.trim(), password);
        await saveTokens({ accessToken, refreshToken });
        setUser(signedIn);
    }, []);

    const register = useCallback(async (data) => {
        const { user: created, accessToken, refreshToken } = await authApi.register(data);
        await saveTokens({ accessToken, refreshToken });
        setUser(created);
    }, []);

    const logout = useCallback(async () => {
        const refreshToken = await getRefreshToken();
        try {
            if (refreshToken) {
                await authApi.logout(refreshToken);
            }
        } catch {
            // signing out locally still works if the server can't be reached
        }
        await clearTokens();
        setUser(null);
    }, []);

    const value = useMemo(
        () => ({ user, loading, login, register, logout }),
        [user, loading, login, register, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
