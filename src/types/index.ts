export type Role = 'CUSTOMER' | 'OWNER' | 'ADMIN' | 'HALL_MANAGER';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface Address {
    address: string;
    city: string;
    state: string;
    zipcode: string;
}

export interface User {
    id: string;
    phone: string;
    name: string;
    role: Role;
    permissions?: string[];
    address?: Address;
    status: UserStatus;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
}

export interface OtpResponse {
    message: string;
    retryAfter?: string; // ISO Timestamp e.g., "2026-01-24T20:40:54.295514Z"
}

export interface LoginRequest {
    phone: string;
    password?: string;
    otp?: string;
}

export interface HallMedia {
    id: string;
    hallId: string;
    driveUrl: string;
    thumbnailUrl: string;
    type: 'IMAGE' | 'VIDEO';
    description?: string;
    sortOrder: number;
}

export interface Hall {
    hallId: string;
    name: string;
    address: Address;
    lat: string;
    lng: string;
    capacity: number;
    basePrice: number;
    facilities: string[];
    description: string;
    contacts: string[];
    media?: HallMedia[];
    status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
}

export type HallStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED';

export interface HallRequest {
    name: string;
    address: Address;
    lat: string;
    lng: string;
    capacity: number;
    basePrice: number;
    facilities: string[];
    description: string;
    contacts: string[];
}
