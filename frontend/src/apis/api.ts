import axios from "axios";
import { queryClient } from "../main";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    config.headers.Accept = "application/json";
    return config;
});

// Single-flight refresh: only one /auth/refresh is ever in flight. Concurrent
// 401s all await the same promise, so the rotating refresh token rotates once
// and no request is left holding a stale cookie (which would spuriously log out).
let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = (): Promise<string> => {
    if (!refreshPromise) {
        refreshPromise = api
            .get("/auth/refresh")
            .then((response) => {
                const token = response.data.access_token;
                localStorage.setItem("access_token", token);
                queryClient.invalidateQueries({ queryKey: ["user"] });
                return token;
            })
            .finally(() => {
                refreshPromise = null;
            });
    }
    return refreshPromise;
};

const logout = () => {
    localStorage.removeItem("access_token");
    queryClient.removeQueries({ queryKey: ["user"] });
    console.log("Logged Out!");
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;
        const isRefreshCall = original?.url?.includes("/auth/refresh");

        if (error.response?.status === 401 && !original?._retry && !isRefreshCall) {
            if (error.response.data?.detail === "Expired Token") {
                original._retry = true;
                try {
                    const token = await refreshAccessToken();
                    original.headers.Authorization = `Bearer ${token}`;
                    return await api(original);
                } catch {
                    logout();
                    return Promise.reject(error);
                }
            } else {
                logout();
            }
        }
        return Promise.reject(error);
    },
);

export default api;
