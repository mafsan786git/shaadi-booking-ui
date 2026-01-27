import { create } from 'zustand';
import type { Hall } from '../types';
import { hallService } from '../services/hallService';
import { toast } from 'react-hot-toast';

interface HallState {
    halls: Hall[];
    isLoading: boolean;
    isInitialLoaded: boolean;
    selectedHallId: string | null;
    availabilityCache: Record<string, Record<string, { data: any[], timestamp: number }>>; // hallId -> monthStr -> { data, timestamp }

    // Actions
    fetchHalls: (force?: boolean) => Promise<void>;
    updateHallStatus: (hallId: string, status: Hall['status']) => Promise<void>;
    setSelectedHallId: (id: string | null) => void;
    fetchAvailability: (hallId: string, month: string, force?: boolean) => Promise<any[]>;
    fetchMultiAvailability: (hallId: string, months: string[], force?: boolean) => Promise<void>;
}

export const useHallStore = create<HallState>((set, get) => ({
    halls: [],
    isLoading: false,
    isInitialLoaded: false,
    selectedHallId: sessionStorage.getItem('selected_available_hall_id'),
    availabilityCache: {},

    setSelectedHallId: (id) => {
        if (id) {
            sessionStorage.setItem('selected_available_hall_id', id);
        } else {
            sessionStorage.removeItem('selected_available_hall_id');
        }
        set({ selectedHallId: id });
    },

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
    },

    fetchAvailability: async (hallId, month, force = false) => {
        const { availabilityCache } = get();
        const CACHE_TTL = 10000; // 10 seconds

        const cachedEntry = availabilityCache[hallId]?.[month];
        const isExpired = cachedEntry && (Date.now() - cachedEntry.timestamp > CACHE_TTL);

        // Return cached data if available, not forced, and not expired
        if (!force && cachedEntry && !isExpired) {
            return cachedEntry.data;
        }

        try {
            const data = await hallService.getAvailability(hallId, month);

            // API might return:
            // 1. [{ month: '...', nonAvailableDates: [...] }] (Array of month object)
            // 2. { month: '...', nonAvailableDates: [...] } (Single month object)
            // 3. [...] (Flat array of dates)

            let nonAvailableDates: any[] = [];
            if (Array.isArray(data)) {
                if (data.length > 0 && (data[0] as any).nonAvailableDates) {
                    nonAvailableDates = (data[0] as any).nonAvailableDates;
                } else {
                    nonAvailableDates = data;
                }
            } else {
                nonAvailableDates = (data as any).nonAvailableDates || [];
            }

            if (month === '2025-01') {
                console.log(`[Store Debug] Fetched Jan 2025. Data length: ${nonAvailableDates.length}. Type: ${typeof data}`);
            }

            set((state) => ({
                availabilityCache: {
                    ...state.availabilityCache,
                    [hallId]: {
                        ...(state.availabilityCache[hallId] || {}),
                        [month]: {
                            data: nonAvailableDates,
                            timestamp: Date.now()
                        }
                    }
                }
            }));

            return nonAvailableDates;
        } catch (error) {
            console.error(`Failed to fetch availability for ${month}`, error);
            throw error;
        }
    },

    fetchMultiAvailability: async (hallId, months, force = false) => {
        const { availabilityCache } = get();
        const CACHE_TTL = 10000; // 10 seconds
        const now = Date.now();

        // Filter for months that need fetching
        const monthsToFetch = months.filter(month => {
            if (force) return true;
            const cachedEntry = availabilityCache[hallId]?.[month];
            if (!cachedEntry) return true;
            return (now - cachedEntry.timestamp > CACHE_TTL);
        });

        if (monthsToFetch.length === 0) return;

        try {
            // Service returns an array like [{month, nonAvailableDates, ...}]
            // User requested ?month=M1&month=M2 format which we handled in hallService
            const data = await hallService.getAvailability(hallId, monthsToFetch);

            // Map the response array to the cache structure
            set((state) => {
                const newHallCache = { ...(state.availabilityCache[hallId] || {}) };

                data.forEach((item: any) => {
                    newHallCache[item.month] = {
                        data: item.nonAvailableDates || [],
                        timestamp: now
                    };
                });

                return {
                    availabilityCache: {
                        ...state.availabilityCache,
                        [hallId]: newHallCache
                    }
                };
            });
        } catch (error) {
            console.error(`Failed to fetch multi-availability for ${monthsToFetch.join(', ')}`, error);
        }
    }
}));
