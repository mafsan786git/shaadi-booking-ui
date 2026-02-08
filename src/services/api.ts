import axios from 'axios';

// Create axios instance
const getBaseURL = () => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
    const hostname = window.location.hostname || 'localhost';
    return `http://${hostname}:8086/api/shaadi-hall-booking/v1`;
};

const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Sync logout with Store to avoid hard redirects
let logoutHandler: (() => void) | null = null;
export const injectLogout = (handler: () => void) => {
    logoutHandler = handler;
};

// Variables for token refresh logic
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            delete config.headers.Authorization;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle Token Refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {

            // Handle recursive refresh failure or missing refresh token
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            return new Promise(async (resolve, reject) => {
                try {
                    const refreshToken = localStorage.getItem('refreshToken');
                    if (!refreshToken) {
                        throw new Error("No refresh token available");
                    }

                    // Use a clean axios call to avoid recursion with interceptors
                    const { data } = await axios.post(`${getBaseURL()}/auth/refresh`, { refreshToken });

                    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data;

                    localStorage.setItem('accessToken', newAccessToken);
                    localStorage.setItem('refreshToken', newRefreshToken);

                    // api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`; // REMOVED to avoid stale state
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                    processQueue(null, newAccessToken);
                    resolve(api(originalRequest));
                } catch (refreshError) {
                    processQueue(refreshError, null);

                    // Trigger global logout via store instead of hard redirect
                    if (logoutHandler) {
                        logoutHandler();
                    } else {
                        // Fallback if App hasn't injected handler yet
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        localStorage.removeItem('user_cache');
                        window.location.href = '/auth';
                    }

                    reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            });
        }
        return Promise.reject(error);
    }
);

export default api;
