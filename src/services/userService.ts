import api from './api';
import type { User, UserStatus } from '../types';

export const userService = {
    // Admin: Get all owners
    getAllOwners: async (): Promise<User[]> => {
        const response = await api.get('/admin/users/owner');
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

        const response = await api.put(`/admin/user/${user.id}`, payload);
        return response.data;
    }
};
