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

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            if (error.response.data?.detail === "Expired Token"){
                const response = await api("/auth/refresh")
                localStorage.setItem("access_token",response.data.access_token)
                queryClient.invalidateQueries({queryKey:["user"]})
                return await api(error.config)
            }
            else{
                localStorage.removeItem("access_token");
                queryClient.removeQueries({ queryKey: ["user"] });
                console.log("Logged Out!")
            }
        }
        return Promise.reject(error);
    },
);

export default api;
