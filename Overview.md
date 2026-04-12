# Shaadi Booking UI - Complete Overview

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Architecture](#project-architecture)
4. [Features & Modules](#features--modules)
5. [State Management](#state-management)
6. [API Integration](#api-integration)
7. [Routing & Navigation](#routing--navigation)
8. [Code Organization](#code-organization)
9. [Development Workflow](#development-workflow)
10. [Key Design Patterns](#key-design-patterns)

---

## Project Overview

**Shaadi Booking UI** is a comprehensive wedding hall booking management system built with React and TypeScript. The application serves three types of users:
- **Customers**: Browse and book wedding halls
- **Owners**: Manage halls, bookings, and availability
- **Admins**: User management and system oversight

### Base URL Configuration
```
Development: http://localhost:8086/api/shaadi-hall-booking/v1
Production: Configured via VITE_API_URL environment variable
```

---

## Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.0 | UI library for building component-based interfaces |
| **TypeScript** | 5.9.3 | Type-safe JavaScript for better code quality and developer experience |
| **Vite** | 7.2.4 | Fast build tool and dev server with HMR (Hot Module Replacement) |

### State Management

| Library | Version | Purpose |
|---------|---------|---------|
| **Zustand** | 5.0.10 | Lightweight state management for global app state (auth, halls) |

### Routing & Navigation

| Library | Version | Purpose |
|---------|---------|---------|
| **React Router DOM** | 7.13.0 | Client-side routing and navigation |

### HTTP Client

| Library | Version | Purpose |
|---------|---------|---------|
| **Axios** | 1.13.2 | HTTP client with interceptors for API calls and token management |

### UI & Utilities

| Library | Version | Purpose |
|---------|---------|---------|
| **Lucide React** | 0.563.0 | Modern icon library for UI elements |
| **React Hot Toast** | 2.6.0 | Toast notifications for user feedback |
| **date-fns** | 4.1.0 | Date manipulation and formatting utilities |
| **clsx** | 2.1.1 | Utility for conditionally joining classNames |

### Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **ESLint** | 9.39.1 | Code linting and quality checks |
| **TypeScript ESLint** | 8.46.4 | TypeScript-specific linting rules |

---

## Project Architecture

### Folder Structure

```
shaadi-booking-ui/
├── public/                      # Static assets
├── src/
│   ├── assets/                  # Images, fonts, and other assets
│   ├── components/              # Reusable UI components
│   │   ├── common/              # Shared components across all modules
│   │   ├── features/            # Feature-specific components
│   │   ├── layout/              # Layout components (Navbar, Footer)
│   │   └── owner/               # Owner-specific components
│   ├── context/                 # Zustand stores for global state
│   ├── hooks/                   # Custom React hooks
│   ├── pages/                   # Page components (routes)
│   │   ├── admin/               # Admin module pages
│   │   ├── auth/                # Authentication pages
│   │   ├── common/              # Common pages (Dashboard, Profile)
│   │   ├── dashboard/           # Dashboard-related pages
│   │   ├── owner/               # Owner module pages
│   │   └── public/              # Public pages (Landing, Hall Listing)
│   ├── services/                # API service layer
│   ├── styles/                  # Global CSS styles
│   ├── types/                   # TypeScript type definitions
│   ├── utils/                   # Utility functions
│   ├── App.tsx                  # Main app component with routing
│   └── main.tsx                 # App entry point
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
└── vite.config.ts               # Vite configuration
```

---

## Features & Modules

### 1. Authentication Module

**Location**: [`src/pages/auth/AuthPage.tsx`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/pages/auth/AuthPage.tsx)

**Features**:
- OTP-based authentication
- Phone number validation (10 digits, no leading zero)
- JWT token management (access + refresh tokens)
- Automatic token refresh on 401 errors
- User profile caching

**Service**: [`authService.ts`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/services/authService.ts)

**Store**: [`useAuthStore.ts`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/context/useAuthStore.ts)

**Key Validations**:
- Mobile number must be exactly 10 digits
- Must start with digits 1-9 (no leading 0)
- Sanitization removes non-digit characters

---

### 2. Hall Management Module (Owner)

**Location**: [`src/pages/owner/OwnerDashboard.tsx`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/pages/owner/OwnerDashboard.tsx)

**Features**:
- Create new halls with detailed information
- View all owned halls
- Edit hall details
- Activate/Deactivate halls
- Delete halls
- Upload hall media (images/videos)

**Components**:
- [`CreateHallModal.tsx`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/components/owner/CreateHallModal.tsx) - Modal for creating/editing halls with scrollable form
- Hall cards display with status badges

**Service**: [`hallService.ts`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/services/hallService.ts)

**Store**: [`useHallStore.ts`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/context/useHallStore.ts)

**Hall Properties**:
- Name, address (with city, state, zipcode)
- Latitude & longitude
- Capacity (maximum guests)
- Base price
- Facilities (array of amenities)
- Description
- Contact numbers
- Media gallery
- Status (ACTIVE/INACTIVE/DELETED)

---

### 3. Availability Calendar Module

**Location**: [`src/pages/owner/HallAvailabilityPage.tsx`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/pages/owner/HallAvailabilityPage.tsx)

**Features**:
- Interactive monthly calendar view
- Color-coded availability status:
  - **Green**: Available
  - **Blue**: In Progress (pending booking)
  - **Yellow**: Blocked (owner blocked)
  - **Red**: Confirmed booking
- Click on dates to view booking details
- Navigate between months
- Multi-month data prefetching
- Smart caching (10-second TTL)

**Components**:
- [`AvailabilityCalendar.tsx`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/components/owner/AvailabilityCalendar.tsx) - Calendar grid with date selection
- [`DayDetailsPanel.tsx`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/components/owner/DayDetailsPanel.tsx) - Shows booking details for selected date

**API**:
- Endpoint: `/booking/hall/{hallId}?month=YYYY-MM`
- Multi-month support: `?month=M1&month=M2`

**Availability Statuses**:
- `AVAILABLE` - No bookings, available for booking
- `IN_PROGRESS` - Booking request pending
- `BLOCKED` - Owner has blocked the date
- `CONFRIMED` - Confirmed booking exists

---

### 4. Booking Management Module

**Location**: [`src/pages/owner/BookingsPage.tsx`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/pages/owner/BookingsPage.tsx)

**Features**:
- View weekly bookings
- Filter bookings by date range
- View booking details in modal
- Edit booking information
- Read-only view for past bookings
- Update booking status
- Card-based layout for better UX

**Components**:
- [`BookingCard.tsx`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/components/common/BookingCard.tsx) - Reusable booking card component
- [`BookingModal.tsx`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/components/common/BookingModal.tsx) - Modal with view/edit modes

**Service**: [`bookingService.ts`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/services/bookingService.ts)

**Booking Properties**:
- Customer name & phone
- Hall details
- Start & end dates
- Event type (Wedding, Reception, Engagement, Birthday, Anniversary, Other)
- Total guests (validated against hall capacity)
- Customer requirements (array of strings)
- Customer & owner notes
- Final price
- Status tracking
- Creation & update timestamps

**Event Types** (displayed with title case in UI):
- WEDDING → Wedding
- RECEPTION → Reception
- ENGAGEMENT → Engagement
- BIRTHDAY → Birthday
- ANNIVERSARY → Anniversary
- OTHER → Other

**Booking Statuses**:
- `REQUESTED` - Initial customer request
- `OWNER_RESPONDED` - Owner has responded
- `CONFIRMED` - Booking confirmed
- `CANCELLED_BY_OWNER` - Owner cancelled
- `CANCELLED_BY_CUSTOMER` - Customer cancelled
- `DECLINED_BY_OWNER` - Owner declined
- `REJECTED_BY_CUSTOMER` - Customer rejected
- `EXPIRED` - Booking expired
- `COMPLETED` - Event completed

**Booking Validations**:
- Total guests cannot exceed hall capacity
- End date must be >= start date
- Cannot select past dates
- Mobile number validation (10 digits, no leading 0)
- Past bookings are read-only

---

### 5. Public Pages Module

#### 5.1 Landing Page
**Location**: [`src/pages/public/LandingPage.tsx`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/pages/public/LandingPage.tsx)

**Features**:
- Hero section with CTA
- Featured halls showcase
- Quick search functionality

#### 5.2 Hall Listing Page
**Location**: [`src/pages/public/HallListingPage.tsx`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/pages/public/HallListingPage.tsx)

**Features**:
- Browse all available halls
- Filter by location, capacity, price
- Search functionality
- Sort options

#### 5.3 Hall Details Page
**Location**: [`src/pages/public/HallDetailsPage.tsx`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/pages/public/HallDetailsPage.tsx)

**Features**:
- Detailed hall information
- Media gallery
- Facilities list
- Request booking form

---

### 6. Common Pages

#### 6.1 Dashboard Page
**Location**: [`src/pages/common/DashboardPage.tsx`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/pages/common/DashboardPage.tsx)

**Features**:
- Role-based dashboard routing
- Customer: View bookings
- Owner: View weekly bookings
- Admin: System overview

#### 6.2 Profile Page
**Location**: [`src/pages/common/ProfilePage.tsx`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/pages/common/ProfilePage.tsx)

**Features**:
- View user profile
- Update personal information
- Manage address

---

### 7. Admin Module

**Location**: [`src/pages/admin/UserManagementPage.tsx`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/pages/admin/UserManagementPage.tsx)

**Features**:
- View all users
- Manage user roles
- Activate/Deactivate users

**Service**: [`userService.ts`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/services/userService.ts)

---

## State Management

### Zustand Stores

#### 1. Authentication Store
**File**: [`useAuthStore.ts`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/context/useAuthStore.ts)

**State**:
```typescript
{
  user: User | null,
  isAuthenticated: boolean,
  isLoading: boolean
}
```

**Actions**:
- `login(tokens)` - Login with JWT tokens
- `logout()` - Clear auth state
- `checkAuth()` - Validate session on app load
- `refreshProfile()` - Refresh user profile data

**Features**:
- LocalStorage caching (`user_cache`)
- Optimistic authentication
- Background profile validation
- Automatic logout on token expiry

#### 2. Hall Store
**File**: [`useHallStore.ts`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/context/useHallStore.ts)

**State**:
```typescript
{
  halls: Hall[],
  isLoading: boolean,
  isInitialLoaded: boolean,
  selectedHallId: string | null,
  availabilityCache: Record<string, Record<string, { data: any[], timestamp: number }>>
}
```

**Actions**:
- `fetchHalls(force?)` - Fetch owner's halls with smart caching
- `updateHallStatus(hallId, status)` - Update hall status (optimistic update)
- `setSelectedHallId(id)` - Set selected hall for availability view
- `fetchAvailability(hallId, month, force?)` - Fetch availability for single month
- `fetchMultiAvailability(hallId, months[], force?)` - Batch fetch for multiple months

**Caching Strategy**:
- Availability data cached per hall per month
- 10-second TTL (Time To Live)
- SessionStorage for selected hall ID persistence
- Silent background updates after initial load
- Force refresh option available

---

## API Integration

### API Client Configuration
**File**: [`src/services/api.ts`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/services/api.ts)

**Base Setup**:
```typescript
const api = axios.create({
  baseURL: getBaseURL(), // Dynamic based on environment
  headers: { 'Content-Type': 'application/json' }
})
```

### Request Interceptor
**Purpose**: Attach JWT token to all requests

```typescript
config.headers.Authorization = `Bearer ${accessToken}`
```

### Response Interceptor
**Purpose**: Handle token refresh on 401 errors

**Flow**:
1. Detect 401 Unauthorized response
2. Queue subsequent requests
3. Attempt token refresh using refresh token
4. Retry failed requests with new access token
5. If refresh fails, trigger global logout

**Anti-Recursion Protection**:
- `isRefreshing` flag prevents multiple simultaneous refresh attempts
- Failed requests queued and processed after successful refresh
- Direct axios call for refresh endpoint (bypasses interceptors)

**Logout Integration**:
- `injectLogout()` function allows App.tsx to register logout handler
- Prevents hard redirects, uses React Router navigation
- Cleans up localStorage and Zustand state

### Service Layer

All API calls are abstracted into service modules:

#### 1. Auth Service
**File**: [`authService.ts`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/services/authService.ts)

**Methods**:
- `sendOTP(phone)` - Send OTP to phone number
- `verifyOTP(phone, otp)` - Verify OTP and login
- `refreshToken(refreshToken)` - Get new access token
- `getProfile()` - Fetch current user profile
- `updateProfile(data)` - Update user profile

#### 2. Hall Service
**File**: [`hallService.ts`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/services/hallService.ts)

**Methods**:
- `getOwnerHalls()` - Fetch halls owned by current user
- `createHall(data)` - Create new hall
- `updateHall(hallId, data)` - Update hall details
- `updateHallStatus(hallId, status)` - Change hall status
- `deleteHall(hallId)` - Delete hall
- `getAvailability(hallId, month)` - Fetch availability data

**Availability API**:
```
Single Month: GET /booking/hall/{hallId}?month=2026-01
Multiple Months: GET /booking/hall/{hallId}?month=2026-01&month=2026-02
```

#### 3. Booking Service
**File**: [`bookingService.ts`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/services/bookingService.ts)

**Methods**:
- `createBooking(data)` - Create new booking request
- `updateBooking(bookingId, data)` - Update booking details
- `respondToBooking(bookingId, response)` - Owner response to booking
- `cancelBooking(bookingId, reason)` - Cancel booking
- `getBookingsByDateRange(startDate, endDate)` - Fetch bookings for date range

#### 4. User Service
**File**: [`userService.ts`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/services/userService.ts)

**Methods**:
- `getAllUsers()` - Admin: Fetch all users
- `updateUserRole(userId, role)` - Admin: Update user role
- `updateUserStatus(userId, status)` - Admin: Activate/Deactivate user

---

## Routing & Navigation

### Route Configuration
**File**: [`App.tsx`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/App.tsx)

All routes wrapped in `MainLayout` component (includes Navbar + Footer):

| Route | Component | Access | Description |
|-------|-----------|--------|-------------|
| `/` | LandingPage | Public | Home page with hero and featured halls |
| `/halls` | HallListingPage | Public | Browse all available halls |
| `/halls/:id` | HallDetailsPage | Public | View hall details and book |
| `/auth` | AuthPage | Public | Login/Signup with OTP |
| `/dashboard` | DashboardPage | Protected | Role-based dashboard redirect |
| `/profile` | ProfilePage | Protected | User profile management |
| `/hall` | OwnerDashboard | Owner | Hall management (list/create/edit) |
| `/hall/availability` | HallAvailabilityPage | Owner | Calendar view with bookings |

### Layout Structure

**MainLayout Component**:
```
┌─────────────────────────────────┐
│         Navbar                  │
├─────────────────────────────────┤
│                                 │
│         Page Content            │
│         (Outlet)                │
│                                 │
├─────────────────────────────────┤
│         Footer                  │
└─────────────────────────────────┘
```

**Components**:
- [`Navbar.tsx`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/components/layout/Navbar.tsx) - Top navigation with auth state
- [`Footer.tsx`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/components/layout/Footer.tsx) - Footer links and info
- [`MainLayout.tsx`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/components/layout/MainLayout.tsx) - Layout wrapper component

### Navigation Flow

**Owner Workflow**:
1. Login → `/dashboard` → Redirects to `/hall` (Hall list)
2. Click Hall Card → `/hall/availability` (Calendar view)
3. Select Date → View booking details in DayDetailsPanel
4. Click "Back to Hall" → Returns to `/hall`
5. Click "Dashboard" → `/dashboard` (Weekly bookings view)

**Customer Workflow**:
1. Browse `/halls` → Select hall → `/halls/:id`
2. Request booking → Login if needed
3. View bookings in `/dashboard`

---

## Code Organization

### Component Structure

#### Common Components
**Location**: [`src/components/common/`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/components/common/)

**Reusable UI Components**:
- [`Button.tsx`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/components/common/Button.tsx) - Styled button with variants
- [`Input.tsx`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/components/common/Input.tsx) - Form input with validation
- [`BookingCard.tsx`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/components/common/BookingCard.tsx) - Booking display card
- [`BookingModal.tsx`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/components/common/BookingModal.tsx) - Booking view/edit modal

**Design Principles**:
- **Reusability**: Components used across multiple modules
- **Flexibility**: Props for customization
- **Consistency**: Shared styling and behavior

#### Owner Components
**Location**: [`src/components/owner/`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/components/owner/)

**Owner-Specific Components**:
- [`CreateHallModal.tsx`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/components/owner/CreateHallModal.tsx) - Hall creation/editing
- [`AvailabilityCalendar.tsx`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/components/owner/AvailabilityCalendar.tsx) - Interactive calendar
- [`DayDetailsPanel.tsx`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/components/owner/DayDetailsPanel.tsx) - Booking details panel

#### Layout Components
**Location**: [`src/components/layout/`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/components/layout/)

**Application Structure**:
- Navbar with role-based menu items
- Footer with links and information
- MainLayout wrapper for consistent structure

### Type Definitions

**File**: [`src/types/index.ts`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/types/index.ts)

**Key Types**:
- `User` - User account data
- `Hall` - Hall properties and metadata
- `Booking` - Booking request and status
- `Address` - Location information
- `HallMedia` - Media gallery items
- `DayAvailabilityResponse` - Calendar date status
- `MonthlyAvailabilityResponse` - Month availability data

**Enums**:
- `Role`: CUSTOMER, OWNER, ADMIN, HALL_MANAGER
- `UserStatus`: ACTIVE, INACTIVE
- `HallStatus`: ACTIVE, INACTIVE, DELETED
- `BookingStatus`: REQUESTED, CONFIRMED, CANCELLED, etc.
- `EventType`: WEDDING, RECEPTION, ENGAGEMENT, etc.
- `AvailabilityStatus`: AVAILABLE, CONFIRMED, BLOCKED, IN_PROGRESS

### Utility Functions

**File**: [`src/utils/validation.ts`](file:///Users/mohdafsanahmad/Documents/github-repos/shaadi-booking-ui/src/utils/validation.ts)

**Functions**:
- `validateMobile(phone)` - Strict 10-digit validation
- `sanitizeMobileInput(value)` - Clean and limit input

**Validation Rules**:
```typescript
// Must be exactly 10 digits, starting with 1-9
const regex = /^[1-9]\d{9}$/
```

---

## Development Workflow

### Setup & Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start with network access (for mobile testing)
npm run dev -- --host

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Development Server
- **Port**: Auto-assigned by Vite (typically 5173/5174)
- **Hot Module Replacement**: Enabled for instant updates
- **Network Access**: Use `--host` flag for testing on other devices

### Environment Variables

Create `.env` file in project root:

```env
VITE_API_URL=http://localhost:8086/api/shaadi-hall-booking/v1
```

**Dynamic Fallback**:
If `VITE_API_URL` not set, uses `http://{hostname}:8086/api/shaadi-hall-booking/v1`

### Build Process

1. **TypeScript Compilation**: `tsc -b` - Type checking
2. **Vite Build**: Bundle and optimize for production
3. **Output**: `dist/` directory with static assets

---

## Key Design Patterns

### 1. Service Layer Pattern
**Purpose**: Separate API logic from UI components

**Structure**:
```
Component → Service → API Client → Backend
```

**Benefits**:
- Easy to mock for testing
- Centralized API endpoint management
- Type-safe request/response handling

### 2. Store Pattern (Zustand)
**Purpose**: Global state management with minimal boilerplate

**Features**:
- Reactive state updates
- Direct store access (no providers)
- Middleware support (logging, persistence)
- TypeScript-first design

### 3. Smart/Dumb Component Pattern
**Purpose**: Separate business logic from presentation

**Smart Components** (Pages):
- Fetch data
- Manage local state
- Handle user interactions
- Pass data to dumb components

**Dumb Components** (Common):
- Pure presentational
- Receive data via props
- Emit events via callbacks
- Highly reusable

### 4. Interceptor Pattern
**Purpose**: Centralized request/response handling

**Use Cases**:
- Token attachment
- Automatic token refresh
- Error handling
- Request/response logging

### 5. Caching Strategy
**Purpose**: Optimize performance and reduce API calls

**Implementation**:
```typescript
{
  data: T[],           // Cached data
  timestamp: number,   // Cache creation time
  TTL: 10000          // Time to live in milliseconds
}
```

**Invalidation**:
- Time-based (TTL)
- Manual force refresh
- On data mutation

### 6. Optimistic Updates
**Purpose**: Improve perceived performance

**Example**: Hall status update
```typescript
// Update UI immediately
set({ halls: updatedHalls })

// Then sync with backend
await hallService.updateHallStatus(hallId, status)
```

**Rollback**: If API call fails, revert to previous state

### 7. Modal Pattern
**Purpose**: Reusable overlay dialogs

**Features**:
- View/Edit modes
- Form validation
- Close on escape/backdrop
- Scrollable content
- Mobile-responsive

**Example**: BookingModal, CreateHallModal

### 8. Validation Pattern
**Purpose**: Centralized input validation

**Implementation**:
- Utility functions for common validations
- Real-time validation in forms
- Server-side validation as fallback
- Clear error messages

---

## Mobile Responsiveness

### Key Considerations
- Touch-friendly tap targets
- Scrollable modals with proper height constraints
- Date pickers use native controls on mobile
- Bottom-sticky footers in modals
- Flexible grid layouts
- Responsive font sizes

### Modal Scrolling Fix
**Problem**: Forms not fully visible on mobile
**Solution**: 
- `max-height: calc(90vh - 100px)` for modal content
- `overflow-y: auto` for scrolling
- Fixed header and footer
- Scrollable body section

---

## Future Enhancements

### Planned Features
1. **Payment Integration**: Online payment for bookings
2. **Advanced Search**: Filters by amenities, location, price range
3. **Reviews & Ratings**: Customer feedback for halls
4. **Image Upload**: Direct media upload for halls
5. **Push Notifications**: Real-time booking updates
6. **Analytics Dashboard**: Owner insights and metrics
7. **Multi-language Support**: Internationalization
8. **Calendar Export**: iCal/Google Calendar integration
9. **Chat System**: In-app messaging between owner and customer
10. **Booking History**: Detailed audit log

---

## Best Practices Followed

### Code Quality
✅ **TypeScript**: Full type safety across the application  
✅ **ESLint**: Automated code quality checks  
✅ **Modular Architecture**: Clear separation of concerns  
✅ **Reusability**: DRY principle applied consistently  
✅ **Error Handling**: Try-catch blocks and user-friendly error messages  

### Performance
✅ **Code Splitting**: Route-based lazy loading potential  
✅ **Caching**: Smart caching with TTL  
✅ **Optimistic Updates**: Immediate UI feedback  
✅ **Debouncing**: Search and input optimization opportunities  

### Security
✅ **JWT Authentication**: Secure token-based auth  
✅ **Token Refresh**: Automatic session management  
✅ **HTTPS Ready**: Production-ready security  
✅ **Input Sanitization**: XSS prevention  

### User Experience
✅ **Toast Notifications**: Clear user feedback  
✅ **Loading States**: Skeleton screens and spinners  
✅ **Error Messages**: Helpful, actionable error text  
✅ **Responsive Design**: Mobile-first approach  
✅ **Accessibility**: Semantic HTML and ARIA labels  

---

## Common Workflows

### Adding a New Feature

1. **Define Types**: Add TypeScript interfaces in `types/index.ts`
2. **Create Service**: Add API methods in `services/`
3. **Add Store** (if needed): Create Zustand store in `context/`
4. **Build Components**: Create reusable components in `components/`
5. **Create Page**: Add page component in appropriate `pages/` subdirectory
6. **Add Route**: Register route in `App.tsx`
7. **Test**: Manual testing + edge cases

### Adding a New API Endpoint

1. **Update Service**: Add method to relevant service file
2. **Define Types**: Add request/response types
3. **Handle Errors**: Add try-catch and error messages
4. **Update Store** (if needed): Add action to fetch/update data
5. **Call from Component**: Integrate in UI component

### Debugging Common Issues

**401 Errors**:
- Check token in localStorage
- Verify token not expired
- Check interceptor logic
- Confirm backend is running

**Data Not Loading**:
- Check network tab for API calls
- Verify service methods are called
- Check store state in dev tools
- Confirm data structure matches types

**Calendar Not Showing Correct Status**:
- Check availability cache in store
- Verify date format (ISO 8601)
- Compare API response with expected format
- Check date comparison logic

**Modal Not Scrolling**:
- Verify `overflow-y: auto` on content container
- Check `max-height` calculation
- Confirm sticky footer CSS
- Test on actual mobile device

---

## Contact & Support

For questions or issues:
- Review this documentation first
- Check existing code patterns
- Follow established conventions
- Maintain consistency with current architecture

---

**Last Updated**: February 10, 2026  
**Version**: 1.0.0  
**Maintainer**: Development Team
