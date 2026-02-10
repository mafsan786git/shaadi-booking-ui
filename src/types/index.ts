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

export type BookingStatus = 'REQUESTED' | 'OWNER_RESPONDED' | 'CONFIRMED' | 'CANCELLED_BY_OWNER' | 'CANCELLED_BY_CUSTOMER' | 'DECLINED_BY_OWNER' | 'REJECTED_BY_CUSTOMER' | 'EXPIRED' | 'COMPLETED';

export type EventType = 'WEDDING' | 'RECEPTION' | 'ENGAGEMENT' | 'BIRTHDAY' | 'ANNIVERSARY' | 'OTHER';

export type AvailabilityStatus = 'AVAILABLE' | 'CONFRIMED' | 'BLOCKED' | 'IN_PROGRESS';

export interface Booking {
    id: string;
    hallId: string;
    hallName?: string;
    customerPhone: string;
    customerName: string;
    startDate: string;       // ISO timestamps
    endDate: string;         // ISO timestamps
    eventType: EventType;
    totalGuest: number;
    customerNote?: string;
    status: BookingStatus;
    finalPrice?: number;
    ownerNote?: string;
    createdBy: 'CUSTOMER_REQUEST' | 'OWNER_DIRECT';
    createdAt: string;
    updatedAt: string;
    cancelledBy?: 'OWNER' | 'CUSTOMER';
    cancelReason?: string;
}

export interface DayAvailabilityResponse {
    date: string; // ISO Date YYYY-MM-DD
    status: AvailabilityStatus;
    note?: string; // only for BLOCKED
    booking?: Booking; // If status is BOOKED or PENDING
}

export interface MonthlyAvailabilityResponse {
    hallId: string;
    month: string; // YYYY-MM
    nonAvailableDates: DayAvailabilityResponse[];
}

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

export interface BookingRequest {
    hallId: string;
    customerPhone: string;
    customerName: string;
    startDate: string;       // ISO date YYYY-MM-DD
    endDate?: string;        // ISO date YYYY-MM-DD
    eventType: EventType;
    totalGuest: number;
    customerNote?: string;
    status?: BookingStatus;
    finalPrice?: number;
    ownerNote?: string;
    requirements?: string[];
}

export interface BookingResponseRequest {
    status: 'CONFIRMED' | 'DECLINED_BY_OWNER';
    ownerNote?: string;
    finalPrice?: number;
}
