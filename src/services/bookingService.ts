import api from './api';
import type { Booking, BookingRequest } from '../types';

export const bookingService = {
    requestBooking: async (request: BookingRequest): Promise<Booking> => {
        const response = await api.post('/booking/request', request);
        return response.data;
    },

    getBookingsForMonth: async (hallId: string, month: string): Promise<Booking[]> => {
        const response = await api.get(`/booking/hall/${hallId}?month=${month}`);
        return response.data;
    },

    getAllBookings: async (startDate?: string): Promise<Booking[]> => {
        const params = startDate ? { startDate } : {};
        const response = await api.get('/booking/fetch/all', { params });
        return response.data;
    },

    updateBooking: async (id: string, request: BookingRequest): Promise<Booking> => {
        const response = await api.put(`/booking/${id}`, request);
        return response.data;
    }
};
