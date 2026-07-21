export const AUTH_STORAGE_KEY = "shongkot_token";
export const USER_STORAGE_KEY = "shongkot_user";

export const getStoredToken = () => {
    if (typeof window === "undefined") {
        return null;
    }

    const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);

    if (!rawValue) {
        return null;
    }

    try {
        const parsed = JSON.parse(rawValue);
        if (parsed?.token) return parsed.token;
        if (parsed?.accessToken) return parsed.accessToken;
        if (typeof parsed === "string") return parsed;
        return rawValue;
    } catch {
        return rawValue;
    }
};

export const getCurrentUser = () => {
    if (typeof window === "undefined") {
        return null;
    }

    const rawValue = window.localStorage.getItem(USER_STORAGE_KEY);

    if (!rawValue) {
        return null;
    }

    try {
        return JSON.parse(rawValue);
    } catch {
        return null;
    }
};

export const setAuthData = (token, user) => {
    if (typeof window === "undefined") {
        return;
    }

    if (token && token.trim()) {
        window.localStorage.setItem(AUTH_STORAGE_KEY, token.trim());
    } else {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }

    if (user) {
        window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
        window.localStorage.removeItem(USER_STORAGE_KEY);
    }
};

export const clearAuthData = () => {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    window.localStorage.removeItem(USER_STORAGE_KEY);
};

export const isAuthenticated = () => Boolean(getStoredToken());

export const getDashboardPath = (role = "citizen") => {
    switch (role) {
        case "authority":
            return "/authority-dashboard";
        case "admin":
            return "/admin-dashboard";
        default:
            return "/citizen-dashboard";
    }
};