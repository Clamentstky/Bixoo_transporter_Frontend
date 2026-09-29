import axios from "axios";
import { clearSession, storeTokens } from "./session";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1",
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token && !config.skipAuth) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let refreshing;
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const config = error.config;
    // Failed credentials belong to the form, not a page reload.
    if (error.response?.status !== 401 || config?.skipAuth) throw error;
    const currentAccess = localStorage.getItem("access_token");
    // A late failure may be for an older token, after another request refreshed it.
    if (!config._retried && currentAccess && config.headers.Authorization !== `Bearer ${currentAccess}`) {
      config._retried = true;
      return api(config);
    }
    const refreshToken = localStorage.getItem("refresh_token");
    if (!config?._retried && refreshToken) {
      config._retried = true;
      try {
        if (!refreshing) {
          refreshing = api.post("/auth/refresh", { refresh_token: refreshToken }, { skipAuth: true })
            .then(response => {
              if (localStorage.getItem("refresh_token") !== refreshToken) throw new Error("Session ended. Please sign in again.");
              storeTokens(response.data);
            }).finally(() => { refreshing = null; });
        }
        await refreshing;
        return await api(config);
      } catch (refreshError) {
        if (![401, 403].includes(refreshError.response?.status)) throw refreshError;
        // Never let an old refresh response sign out a newly authenticated account.
        if (localStorage.getItem("refresh_token") !== refreshToken) {
          if (localStorage.getItem("access_token")) return api(config);
          throw refreshError;
        }
      }
    }
    clearSession();
    window.dispatchEvent(new Event("auth:expired"));
    throw error;
  }
);

export default api;
