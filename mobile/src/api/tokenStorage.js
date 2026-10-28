import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

// Keeps the access and refresh tokens in the phone's secure storage
// (Keychain on iOS, Keystore on Android), plus a copy in memory so every
// request doesn't have to read storage.
// SecureStore doesn't exist on web, so there the tokens live in memory only.

const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";
const canPersist = Platform.OS !== "web";

let cache = { accessToken: null, refreshToken: null, loaded: false };

const load = async () => {
    if (cache.loaded) {
        return;
    }
    if (canPersist) {
        const [accessToken, refreshToken] = await Promise.all([
            SecureStore.getItemAsync(ACCESS_KEY),
            SecureStore.getItemAsync(REFRESH_KEY)
        ]);
        cache = { accessToken, refreshToken, loaded: true };
    } else {
        cache.loaded = true;
    }
};

export const getAccessToken = async () => {
    await load();
    return cache.accessToken;
};

export const getRefreshToken = async () => {
    await load();
    return cache.refreshToken;
};

export const saveTokens = async ({ accessToken, refreshToken }) => {
    cache = { accessToken, refreshToken, loaded: true };
    if (canPersist) {
        await Promise.all([
            SecureStore.setItemAsync(ACCESS_KEY, accessToken),
            SecureStore.setItemAsync(REFRESH_KEY, refreshToken)
        ]);
    }
};

export const clearTokens = async () => {
    cache = { accessToken: null, refreshToken: null, loaded: true };
    if (canPersist) {
        await Promise.all([
            SecureStore.deleteItemAsync(ACCESS_KEY),
            SecureStore.deleteItemAsync(REFRESH_KEY)
        ]);
    }
};
