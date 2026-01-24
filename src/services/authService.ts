import api from './api';
import type { AuthResponse, LoginRequest, OtpResponse, User } from '../types';

export const authService = {
    // 1. Initiate Login (Sends OTP)
    initiateLogin: async (phone: string): Promise<OtpResponse> => {
        const response = await api.post('/auth/login', { phone });
        return response.data;
    },

    // 2. Resend OTP
    resendOtp: async (phone: string): Promise<OtpResponse> => {
        const response = await api.post('/auth/send-otp', { phone });
        return response.data;
    },

    // 2. Verify OTP -> Returns Tokens
    verifyOtp: async (phone: string, otp: string): Promise<AuthResponse> => {
        const response = await api.post('/auth/verify-otp', { phone, otp });
        return response.data;
    },

    // 3. Login with Password (Optional fallback)
    loginWithPassword: async (req: LoginRequest): Promise<AuthResponse> => {
        const response = await api.post('/auth/login', req);
        return response.data;
    },

    // 4. Register
    register: async (userData: Partial<User>): Promise<OtpResponse> => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    // 5. Get Current User Profile
    getProfile: async (): Promise<User> => {
        const response = await api.get('/user/profile');
        return response.data;
    },

    // 6. Refresh Token (Optional reuse)
    refreshToken: async (token: string): Promise<AuthResponse> => {
        const response = await api.post('/auth/refresh', { refreshToken: token });
        return response.data;
    }
};
