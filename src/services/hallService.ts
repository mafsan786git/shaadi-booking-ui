import api from './api';
import type { Hall } from '../types';

export const hallService = {
    // Public: Get halls by zipcode (Landing Page)
    getHallsByZipcode: async (zipcode: string): Promise<Hall[]> => {
        const response = await api.get(`/public/hall/fetch/by-zipcode/${zipcode}`);
        return response.data;
    },

    getHallById: async (hallId: string): Promise<Hall> => {
        const response = await api.get(`/public/hall/fetch/${hallId}`);
        return response.data;
    },

    // Owner: Get own halls
    getOwnerHalls: async (): Promise<Hall[]> => {
        const response = await api.get('/hall/all');
        return response.data;
    },

    createHall: async (data: any): Promise<Hall> => {
        const response = await api.post('/hall/create', data);
        return response.data;
    }
};
