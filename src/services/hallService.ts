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
    },

    updateHallStatus: async (hallId: string, status: 'ACTIVE' | 'INACTIVE' | 'DELETED'): Promise<void> => {
        await api.put(`/hall/${hallId}/status`, { status });
    },

    updateHall: async (hallId: string, data: any): Promise<Hall> => {
        const response = await api.put(`/hall/${hallId}`, data);
        return response.data;
    },

    getAvailability: async (hallId: string, month: string | string[]): Promise<any> => {
        const response = await api.get(`/public/hall/${hallId}/availability`, {
            params: { month },
            // Ensure array params are formatted as ?month=V1&month=V2
            paramsSerializer: {
                indexes: null
            }
        });
        return response.data;
    }
};
