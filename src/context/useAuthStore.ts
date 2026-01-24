import { create } from 'zustand';
import type { User, AuthResponse } from '../types';
import { authService } from '../services/authService';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Actions
    login: (tokens: AuthResponse) => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    login: async (tokens) => {
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);

        try {
            const user = await authService.getProfile();
            set({ user, isAuthenticated: true });
        } catch (error) {
            console.error("Failed to fetch profile after login", error);
            // Even if profile fails, we might still be 'authenticated' technically, 
            // but let's clear to be safe or handle gracefully.
            set({ isAuthenticated: true });
        }
    },

    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, isAuthenticated: false });
    },

    checkAuth: async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            set({ isLoading: false, isAuthenticated: false });
            return;
        }

        try {
            const user = await authService.getProfile();
            set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
            console.error("Auth check failed", error);
            localStorage.removeItem('accessToken');
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    }
}));
