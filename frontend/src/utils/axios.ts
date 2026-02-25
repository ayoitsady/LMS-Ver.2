import axios from "axios";
import { setAuthUser, getRefreshToken, isAccessTokenExpired } from "./auth";
import Cookie from "js-cookie";
import { API_BASE_URL } from "./constants";

const apiInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
    },
    withCredentials: false
});

apiInstance.interceptors.request.use(
    async (config) => {
        const accessToken = Cookie.get("access_token");

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        if (accessToken && isAccessTokenExpired(accessToken)) {
            const refreshToken = Cookie.get("refresh_token");
            if (refreshToken) {
                try {
                    const response = await getRefreshToken(refreshToken);
                    setAuthUser(response.data.access, response.data.refresh);
                    config.headers.Authorization = `Bearer ${response.data.access}`;
                } catch (error) {
                    console.error("Token refresh failed:", error);
                }
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default apiInstance;
