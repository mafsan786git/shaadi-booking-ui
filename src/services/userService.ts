import api from './api';
import type { User, UserStatus, Role } from '../types';

export interface CreateUserRequest {
    phone: string;
    name: string;
    role: Role;
    status: UserStatus;
    address: string;
    city: string;
    state: string;
    zipcode: string;
    lat: number;
    lng: number;
}

export const userService = {
    // Admin: Get all owners
    getAllOwners: async (): Promise<User[]> => {
        const response = await api.get('/v1/admin/users/owner');
        return response.data;
    },

    // Admin: Update user status
    updateUserStatus: async (user: User, status: UserStatus): Promise<User> => {
        // We must send the full object because backend validation typically requires phone, etc.
        // Flattening the User object to match RegisterRequest expected by backend
        const payload = {
            name: user.name,
            phone: user.phone,
            role: user.role,
            status: status,
            address: user.address?.address || "",
            city: user.address?.city || "",
            state: user.address?.state || "",
            zipcode: user.address?.zipcode || "",
            // Defaulting lat/lng to 0 as they are likely primitives in backend request DTO
            lat: 0,
            lng: 0
        };

        const response = await api.put(`/v1/admin/user/${user.id}`, payload);
        return response.data;
    },

    // Admin: Create a new user
    createUser: async (payload: CreateUserRequest): Promise<User> => {
        const response = await api.post('/v1/admin/create/user', payload);
        return response.data;
    },

    // Admin: Update full user details (Edit modal)
    updateUser: async (userId: string, payload: CreateUserRequest): Promise<User> => {
        const response = await api.put(`/v1/admin/user/${userId}`, payload);
        return response.data;
    }
};
