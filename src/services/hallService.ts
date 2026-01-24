import api from './api';
import type { Hall } from '../types';

export const hallService = {
    // Public: Get halls by zipcode (Landing Page)
    getHallsByZipcode: async (zipcode: string): Promise<Hall[]> => {
        const response = await api.get(`/public/hall/fetch/by-zipcode/${zipcode}`);
        return response.data;
    },

    // Public: Get specific hall details
    getHallById: async (hallId: string): Promise<Hall> => {
        const response = await api.get(`/public/hall/fetch/${hallId}`);
        return response.data;
    }
};
