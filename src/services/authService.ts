import api from './api';
import type { AuthResponse, LoginRequest, OtpResponse, User } from '../types';

export const authService = {
    // 1. Initiate Login (Sends OTP)
    initiateLogin: async (phone: string): Promise<OtpResponse> => {
        const response = await api.post('/v1/auth/login', { phone });
        return response.data;
    },

    // 2. Resend OTP
    resendOtp: async (phone: string): Promise<OtpResponse> => {
        const response = await api.post('/v1/auth/send-otp', { phone });
        return response.data;
    },

    // 2. Verify OTP -> Returns Tokens
    verifyOtp: async (phone: string, otp: string): Promise<AuthResponse> => {
        const response = await api.post('/v1/auth/verify-otp', { phone, otp });
        return response.data;
    },

    // 3. Login with Password (Optional fallback)
    loginWithPassword: async (req: LoginRequest): Promise<AuthResponse> => {
        const response = await api.post('/v1/auth/login', req);
        return response.data;
    },

    // 4. Register
    register: async (userData: Partial<User>): Promise<OtpResponse> => {
        const response = await api.post('/v1/auth/register', userData);
        return response.data;
    },

    // 5. Get Current User Profile
    getProfile: async (): Promise<User> => {
        const response = await api.get('/v1/user/profile');
        return response.data;
    },

    // 6. Refresh Token (Optional reuse)
    refreshToken: async (token: string): Promise<AuthResponse> => {
        const response = await api.post('/v1/auth/refresh', { refreshToken: token });
        return response.data;
    }
};
