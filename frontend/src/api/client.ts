import axios from "axios";
import { useAuthStore } from "../hooks/useAuthStore";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

/**
 * Axios instance configured for the LoveArt API.
 * Automatically attaches JWT access token and handles silent refresh.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request interceptor: attach access token ──────────────────────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: silent JWT refresh on 401 ──────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};

/**
 * Auth routes that should NEVER trigger a token refresh attempt.
 * A 401 from these endpoints means bad credentials, not an expired token.
 */
const AUTH_ROUTES = [
  "/users/login/",
  "/users/register/",
  "/users/google/",
  "/users/token/refresh/",
];

const isAuthRoute = (url: string = "") =>
  AUTH_ROUTES.some((route) => url.includes(route));

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh logic for auth endpoints — a 401 there means wrong credentials
    if (isAuthRoute(originalRequest?.url)) {
      return Promise.reject(error);
    }

    // Only attempt refresh on 401 and if we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      const { refresh_token, logout } = useAuthStore.getState();

      if (!refresh_token) {
        logout();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${API_BASE_URL}/users/token/refresh/`,
          {
            refresh: refresh_token,
          },
        );

        // Update the store state directly
        useAuthStore.setState({
          access_token: data.access,
          refresh_token: data.refresh ?? refresh_token,
        });

        processQueue(null, data.access);

        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
