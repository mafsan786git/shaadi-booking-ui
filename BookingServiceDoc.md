# Booking Service API Documentation

> **Base URL:** `http://{hostname}:8086/api/shaadi-hall-booking/v1`
> **Auth:** JWT Bearer token (auto-attached via Axios interceptor)
> **Source:** [`bookingService.ts`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/services/bookingService.ts)

---

## Active APIs (Currently Used)

### 1. `requestBooking()`

| Property | Value |
|---|---|
| **Method** | `POST` |
| **Endpoint** | `/booking/request` |
| **Used In** | `BookingModal.tsx` (L178) |
| **Purpose** | Creates a new booking request (used by both Customer & Owner modes) |

**Request Payload (`BookingRequest`):**
```json
{
  "hallId": "string",
  "customerName": "string",
  "customerPhone": "string",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "eventType": "WEDDING | RECEPTION | ENGAGEMENT | BIRTHDAY | ANNIVERSARY | OTHER",
  "totalGuest": 100,
  "customerNote": "string (optional)",
  "requirements": ["string"] ,
  "finalPrice": 50000,
  "ownerNote": "string (optional, OWNER mode only)"
}
```

**Response:** `Booking` object

---

### 2. `getBookingsForMonth()`

| Property | Value |
|---|---|
| **Method** | `GET` |
| **Endpoint** | `/booking/hall/{hallId}?month=YYYY-MM` |
| **Used In** | `HallAvailabilityPage.tsx` (L123, L180) |
| **Purpose** | Fetches all bookings for a specific hall in a given month |

**Parameters:**
- `hallId` — Hall UUID (path param)
- `month` — Format `YYYY-MM` (query param)

**Response:** `Booking[]`

---

### 3. `getAllBookings()`

| Property | Value |
|---|---|
| **Method** | `GET` |
| **Endpoint** | `/booking/fetch/all` |
| **Used In** | `BookingsPage.tsx` (L35, L381) |
| **Purpose** | Fetches all bookings, optionally filtered by start date |

**Parameters:**
- `startDate` — Optional date filter (query param)

**Response:** `Booking[]`

---


