import { create } from 'zustand';
import type { Hall } from '../types';
import { hallService } from '../services/hallService';
import { toast } from 'react-hot-toast';

interface HallState {
    halls: Hall[];
    isLoading: boolean;
    isInitialLoaded: boolean;

    // Actions
    fetchHalls: (force?: boolean) => Promise<void>;
    updateHallStatus: (hallId: string, status: Hall['status']) => Promise<void>;
}

export const useHallStore = create<HallState>((set, get) => ({
    halls: [],
    isLoading: false,
    isInitialLoaded: false,

    fetchHalls: async (force = false) => {
        const { isInitialLoaded, isLoading } = get();

        // If already loading, don't trigger again
        if (isLoading) return;

        // If not forced and already initially loaded, we can skip public loading state
        // and just fetch in the background (silent update)
        const isSilent = !force && isInitialLoaded;

        if (!isSilent) {
            set({ isLoading: true });
        }

        try {
            const data = await hallService.getOwnerHalls();
            set({
                halls: data,
                isInitialLoaded: true,
                isLoading: false
            });
        } catch (error) {
            console.error("Failed to fetch halls", error);
            if (!isSilent) {
                toast.error('Failed to fetch halls');
            }
            set({ isLoading: false });
        }
    },

    updateHallStatus: async (hallId, status) => {
        try {
            await hallService.updateHallStatus(hallId, status);
            // Optimistic update or just re-fetch
            const currentHalls = get().halls;
            const updatedHalls = currentHalls.map(h =>
                h.hallId === hallId ? { ...h, status } : h
            );
            set({ halls: updatedHalls });
        } catch (error) {
            toast.error('Failed to update status');
            throw error;
        }
    }
}));
