import axios from 'axios';

// Create axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8086/api/shaadi-hall-booking/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle Token Refresh (Optional/Advanced) or Errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Handle 401 Unauthorized
        if (error.response && error.response.status === 401) {
            // Clear token and redirect to login if necessary
            // localStorage.removeItem('accessToken');
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
