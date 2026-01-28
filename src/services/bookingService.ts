import api from './api';
import type { Booking, BookingRequest, BookingResponseRequest } from '../types';



export const bookingService = {
    requestBooking: async (request: BookingRequest): Promise<Booking> => {
        const response = await api.post('/booking/request', request);
        return response.data;
    },

    getMyBookings: async (): Promise<Booking[]> => {
        const response = await api.get('/booking/my');
        return response.data;
    },

    confirmBooking: async (id: string): Promise<Booking> => {
        const response = await api.post(`/booking/${id}/confirm`);
        return response.data;
    },

    rejectBooking: async (id: string): Promise<Booking> => {
        const response = await api.post(`/booking/${id}/reject`);
        return response.data;
    },

    cancelBookingByCustomer: async (id: string): Promise<Booking> => {
        const response = await api.post(`/booking/${id}/cancel`);
        return response.data;
    },

    // Owner Endpoints
    directBooking: async (request: BookingRequest): Promise<Booking> => {
        const response = await api.post('/booking/direct', request);
        return response.data;
    },

    respondToBooking: async (id: string, response: BookingResponseRequest): Promise<Booking> => {
        const responseData = await api.post(`/booking/${id}/respond`, response);
        return responseData.data;
    },

    declineBooking: async (id: string, reason: string): Promise<Booking> => {
        const response = await api.post(`/booking/${id}/decline`, { reason });
        return response.data;
    },

    cancelBookingByOwner: async (id: string, reason: string): Promise<Booking> => {
        const response = await api.post(`/booking/${id}/owner-cancel`, { reason });
        return response.data;
    },

    getHallBookings: async (hallId: string): Promise<Booking[]> => {
        const response = await api.get(`/booking/hall/${hallId}`);
        return response.data;
    },

    getBookingDetails: async (id: string): Promise<Booking> => {
        const response = await api.get(`/booking/${id}`);
        return response.data;
    },

    getBookingsForMonth: async (hallId: string, month: string): Promise<Booking[]> => {
        const response = await api.get(`/booking/hall/${hallId}?month=${month}`);
        return response.data;
    }
};
