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
    refreshProfile: () => Promise<void>;
}

const getUserFromStorage = (): User | null => {
    try {
        const userStr = localStorage.getItem('user_cache');
        return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
        return null;
    }
};

export const useAuthStore = create<AuthState>((set) => {
    const cachedUser = getUserFromStorage();

    return {
        user: cachedUser,
        isAuthenticated: !!cachedUser,
        isLoading: !cachedUser, // If we have a user, don't block. Background checkAuth will validate.

        login: async (tokens) => {
            localStorage.setItem('accessToken', tokens.accessToken);
            localStorage.setItem('refreshToken', tokens.refreshToken);

            try {
                const user = await authService.getProfile();
                localStorage.setItem('user_cache', JSON.stringify(user));
                set({ user, isAuthenticated: true });
            } catch (error) {
                console.error("Failed to fetch profile after login", error);
                set({ isAuthenticated: true });
            }
        },

        logout: () => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user_cache');
            set({ user: null, isAuthenticated: false });
        },

        checkAuth: async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                localStorage.removeItem('user_cache');
                set({ user: null, isLoading: false, isAuthenticated: false });
                return;
            }

            // Optimization: If we have a cached user, use it immediately
            // We TRUST the token is valid if it exists. 
            // The API calls will fail with 401 if it's invalid, handling the logout then.
            // Explicit profile refresh happens only on specific actions (like opening profile menu).

            const cachedUser = getUserFromStorage();
            if (cachedUser) {
                set({ user: cachedUser, isAuthenticated: true, isLoading: false });
                return;
            }

            // Fallback: If no cache but we have token, try to fetch profile
            try {
                const user = await authService.getProfile();
                localStorage.setItem('user_cache', JSON.stringify(user));
                set({ user, isAuthenticated: true, isLoading: false });
            } catch (error) {
                console.error("Auth check failed", error);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user_cache');
                set({ user: null, isAuthenticated: false, isLoading: false });
            }
        },

        refreshProfile: async () => {
            try {
                const user = await authService.getProfile();
                localStorage.setItem('user_cache', JSON.stringify(user));
                set({ user });
            } catch (error) {
                console.error("Failed to refresh profile", error);
            }
        }
    };
});
