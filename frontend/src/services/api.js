import axios from "axios";

export const DEV_AUTH_STORAGE_KEY = "shongkot_token";

const getStoredToken = () => {
    if (typeof window === "undefined") {
        return null;
    }

    const rawValue = window.localStorage.getItem(DEV_AUTH_STORAGE_KEY);

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

export const setAuthToken = (token) => {
    if (typeof window === "undefined") {
        return;
    }

    if (token && token.trim()) {
        window.localStorage.setItem(DEV_AUTH_STORAGE_KEY, token.trim());
    } else {
        window.localStorage.removeItem(DEV_AUTH_STORAGE_KEY);
    }
};

if (typeof window !== "undefined") {
    window.__setShongkotToken = setAuthToken;
    window.__clearShongkotToken = () => setAuthToken("");
}

const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = getStoredToken();
    const fullUrl = `${config.baseURL || ""}${config.url || ""}`;

    console.log(`[api] request ${config.method?.toUpperCase()} ${fullUrl}`);
    console.log(`[api] token present: ${Boolean(token)}`);

    if (token) {
        config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
        };
    } else {
        console.warn("[api] no development token found; protected requests will fail with 401");
    }

    return config;
});

api.interceptors.response.use(
    (response) => {
        console.log(
            `[api] success ${response.config.method?.toUpperCase()} ${response.config.url} status ${response.status}`
        );
        return response;
    },
    (error) => {
        console.error("[api] request failed", {
            url: `${error.config?.baseURL || ""}${error.config?.url || ""}`,
            method: error.config?.method?.toUpperCase(),
            tokenPresent: Boolean(getStoredToken()),
            status: error.response?.status,
            backendError: error.response?.data,
            message: error.message,
        });
        return Promise.reject(error);
    }
);

export default api;