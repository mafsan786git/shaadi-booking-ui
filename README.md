# 💍 Shaadi Booking — Web UI

The React + TypeScript frontend for **Shaadi Hall Booking**, a platform for finding and booking wedding venues (*shaadi halls*). Customers search halls by pincode and view hall details. Hall owners manage their halls, bookings and calendar. Admins manage users.

> ⚙️ **Backend:** this app talks to the Spring Boot API in [`shaadi-hall-booking`](https://github.com/mafsan786git/shaadi-hall-booking). Set that up first, or point the UI at a deployed instance.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [Running the Full Stack Locally](#-running-the-full-stack-locally)
- [Available Scripts](#-available-scripts)
- [Using the App](#-using-the-app)
- [Routes](#-routes)
- [Project Structure](#-project-structure)
- [How It Works](#-how-it-works)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Roadmap](#️-roadmap)
- [Further Documentation](#-further-documentation)

---

## ✨ Features

**For everyone (no login)**
- 🔎 Search wedding halls by **pincode**
- 🏛️ Hall detail page with capacity, price, facilities, contacts and description

**For customers**
- 📲 Passwordless **phone + OTP** sign-in, with a resend countdown
- 👤 Profile page with your account details
- 🚧 Requesting a booking and the public availability calendar are coming soon (see [Roadmap](#️-roadmap))

**For hall owners**
- 🏗️ Create and edit halls, and toggle them active/inactive
- 📆 Per-hall **availability calendar** with color-coded statuses and a day-details side panel
- ✅ Respond to requests: quote a price, confirm, reject, cancel or complete
- 🚶 Add **walk-in / offline bookings** directly as `CONFIRMED`
- 📋 Bookings dashboard with the week's upcoming events across all halls

**For admins**
- 👥 User management: list owners, update user details, activate/deactivate accounts

**Under the hood**
- 🔐 Automatic JWT refresh with request queueing, so you aren't logged out mid-session
- 🍞 Toast notifications for every action
- 📱 Responsive layout with a shared navbar and footer

---

## 🛠️ Tech Stack

| Concern | Library |
|---|---|
| UI | [React 19](https://react.dev/) |
| Language | TypeScript 5.9 |
| Build / dev server | [Vite 7](https://vite.dev/) |
| Routing | React Router 7 |
| State | [Zustand 5](https://github.com/pmndrs/zustand) |
| HTTP | Axios (with auth + refresh interceptors) |
| Dates | date-fns 4 |
| Icons | lucide-react |
| Notifications | react-hot-toast |
| Linting | ESLint 9 + typescript-eslint |

---

## 🚀 Quick Start

**Prerequisites:** Node.js **20.19+** or **22.12+** (required by Vite 7) and npm.

```bash
git clone https://github.com/mafsan786git/shaadi-booking-ui.git
cd shaadi-booking-ui
npm install
npm run dev
```

Open **http://localhost:5173**.

> ℹ️ The committed `.env` points to the **hosted beta backend** on Render, so `npm run dev` works without running the API locally. The free Render instance may take 30–60 seconds to wake up on the first request. To use your own backend, see [Configuration](#-configuration).

---

## 🔧 Configuration

The app reads one environment variable:

| Variable | Description | Default when unset |
|---|---|---|
| `VITE_API_URL` | Full base URL of the API, **including** `/api/shaadi-hall-booking/v1` | `http://<current-hostname>:8086/api/shaadi-hall-booking/v1` |

**Recommended:** keep personal settings in **`.env.local`**. Vite gives it priority over `.env`, and it's git-ignored.

```bash
# .env.local — use a backend running on your machine
VITE_API_URL=http://localhost:8086/api/shaadi-hall-booking/v1
```

```bash
# .env.local — use the hosted beta backend
VITE_API_URL=https://backend-shaadi-app.onrender.com/api/shaadi-hall-booking/v1
```

When `VITE_API_URL` is unset, the UI uses the hostname it was opened on (`window.location.hostname`). This makes testing from a phone on the same Wi-Fi easy: open `http://<your-LAN-IP>:5173` and the UI calls `http://<your-LAN-IP>:8086/...`.

> Restart `npm run dev` after changing any `.env*` file. `VITE_*` values are baked in at build time.

---

## 🧩 Running the Full Stack Locally

1. **Start the backend** by following the [backend README](https://github.com/mafsan786git/shaadi-hall-booking#-getting-started). Run it on port **8086** (`PORT=8086`).
2. **Point the UI at it** by creating `.env.local` with `VITE_API_URL=http://localhost:8086/api/shaadi-hall-booking/v1`.
3. **Start the UI:** `npm run dev`, then open http://localhost:5173.
4. **Create an account.** The UI doesn't have a sign-up screen yet, so create a customer through the backend's Swagger UI (`POST /v1/auth/register`). For an owner or admin, follow [Create your first admin](https://github.com/mafsan786git/shaadi-hall-booking#5-create-your-first-admin).
5. **Log in.** Enter the 10-digit mobile number, then read the OTP from the **backend console**. No SMS provider is connected yet, so the backend logs a line like `OTP for 98xxxxxxxx: 1234`.

> CORS: the backend allows `http://localhost:5173` and `https://shaadibooking.onrender.com`. If you serve the UI from another origin, add it to the backend's `SecurityConfig`.

---

## 📜 Available Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server with hot reload on port 5173 |
| `npm run build` | Type-check (`tsc -b`) and build a production bundle into `dist/` |
| `npm run preview` | Serve the built `dist/` locally to check the production build |
| `npm run lint` | Run ESLint over the project |

---

## 🧑‍💻 Using the App

### Customer
1. On the landing page, enter a **pincode** to see halls in that area.
2. Open a hall to see its details and contact numbers.
3. Click **Login**, enter your phone number and verify the OTP. The account must already exist; sign-up from the UI is pending.
4. Online booking requests are coming soon. For now, contact the owner, who can add your booking as a walk-in.

### Hall owner
Owner accounts are created by an admin.

1. Log in with your phone + OTP. You land on the **Bookings** dashboard.
2. Go to **Hall** in the navbar to see your halls, or add one with **Add Hall**.
3. Open a hall's **availability** view to see the month calendar. Click a day to see its bookings.
4. Change a booking's status (`REQUESTED → OWNER_RESPONDED → CONFIRMED → COMPLETED`, or `REJECTED`/`CANCELLED`), or add a walk-in booking.

### Admin
Sign in to open **User Management**, where you can list owners and edit or deactivate users.

---

## 🧭 Routes

| Path | Page | Who |
|---|---|---|
| `/` | Landing page with pincode search | Everyone |
| `/halls?zipcode=XXXXXX` | Hall search results | Everyone |
| `/halls/:id` | Hall details | Everyone |
| `/auth` | Phone + OTP login | Everyone |
| `/dashboard` | Role-based: **Admin** → User Management, **Owner** → Bookings, **Customer** → welcome | Signed in |
| `/profile` | View profile | Signed in |
| `/hall` | Owner's halls | Owner |
| `/hall/availability` | Calendar + day panel for a hall | Owner |

---

## 📂 Project Structure

```
src/
├── main.tsx                 # App bootstrap
├── App.tsx                  # Router + global toaster
├── components/
│   ├── common/              # Button, Input, BookingCard, BookingModal
│   ├── layout/              # MainLayout, Navbar, Footer
│   └── owner/               # AvailabilityCalendar, CreateHallModal, DayDetailsPanel
├── context/                 # Zustand stores: useAuthStore, useHallStore
├── pages/
│   ├── public/              # LandingPage, HallListingPage, HallDetailsPage
│   ├── auth/                # AuthPage (phone → OTP)
│   ├── common/              # DashboardPage, ProfilePage
│   ├── owner/               # OwnerDashboard, BookingsPage, HallAvailabilityPage
│   └── admin/               # UserManagementPage
├── services/                # API layer: api.ts (axios), auth/hall/booking/user services, notifications
├── styles/global.css        # Design tokens & global styles
├── types/index.ts           # Shared TypeScript types (User, Hall, Booking, …)
└── utils/                   # formatters, validation
```

---

## ⚙️ How It Works

### API client and token refresh (`src/services/api.ts`)
- A shared Axios instance attaches `Authorization: Bearer <accessToken>` from `localStorage` to every request.
- When a request returns **401**, the client calls `POST /auth/refresh` once. Any other requests that fail while the refresh is running wait in a queue, then retry with the new token.
- If the refresh fails, the auth store logs the user out and sends them to `/auth`.

### State (`src/context`)
- **`useAuthStore`** holds the current user, login/logout and `checkAuth()` on app start. The profile is cached in `localStorage` (`user_cache`) for a fast first paint.
- **`useHallStore`** holds the owner's halls and the selected hall.

### Services → backend endpoints

| Service | Calls |
|---|---|
| `authService` | `/auth/login`, `/auth/send-otp`, `/auth/verify-otp`, `/auth/register`, `/auth/refresh`, `/user/profile` |
| `hallService` | `/public/hall/fetch/by-zipcode/{zip}`, `/public/hall/fetch/{id}`, `/public/hall/{id}/availability`, `/hall/all`, `/hall/create`, `/hall/{id}`, `/hall/{id}/status` |
| `bookingService` | `/booking/request`, `/booking/hall/{id}?month=`, `/booking/fetch/all`, `/booking/{id}` (PUT/DELETE) |
| `userService` | `/admin/users/owner`, `/admin/user/{id}` |

The [backend README](https://github.com/mafsan786git/shaadi-hall-booking#-api-reference) has the full API reference.

---

## 🌐 Deployment

The production build is a static site:

```bash
VITE_API_URL=https://your-api.example.com/api/shaadi-hall-booking/v1 npm run build
# deploy the dist/ folder
```

The app uses client-side routing, so the host must **rewrite all paths to `/index.html`**. Otherwise a page refresh on `/halls/123` returns a 404.

| Host | Settings |
|---|---|
| **Render** (Static Site) | Build: `npm install && npm run build` · Publish dir: `dist` · Add a rewrite `/*` → `/index.html` · Set `VITE_API_URL` env var |
| **Vercel** | Framework preset *Vite*. Add `vercel.json` with `{"rewrites":[{"source":"/(.*)","destination":"/index.html"}]}` |
| **Netlify** | Build `npm run build`, publish `dist`. Add `public/_redirects` with `/* /index.html 200` |

Remember to add your deployed UI's origin to the backend's CORS list.

---

## 🩺 Troubleshooting

| Problem | Fix |
|---|---|
| **CORS error** in the browser console | Your UI origin isn't allowed by the backend. Add it in `SecurityConfig.corsConfigurationSource()` |
| **Network Error** / requests hang | Check `VITE_API_URL`, and that the backend runs on port 8086. Render's free tier may be waking up, so wait and retry |
| **Changed `.env` but nothing happened** | Restart `npm run dev`. Env vars are read at startup |
| **"Failed to send OTP"** | The number isn't registered (login needs an existing user), or the backend can't reach Google Sheets. Check the backend logs |
| **Never received the OTP SMS** | Expected. OTPs are printed in the backend console until SMS is integrated |
| **Logged out unexpectedly** | The refresh token expired or the backend's `JWT_SECRET` changed. Sign in again |
| **404 on page refresh in production** | Configure the SPA rewrite to `/index.html` (see [Deployment](#-deployment)) |

---

## 🗺️ Roadmap

- [ ] Customer **booking request** form and availability calendar on the hall details page (the backend already supports both)
- [ ] Customer **sign-up** screen (backend `/auth/register` exists)
- [ ] Customer **My Bookings** page (the navbar link exists, but the route and backend endpoint are pending)
- [ ] Profile editing (backend `PUT /user/profile` exists)
- [ ] Photo/video gallery once backend media upload is implemented
- [ ] Search by city, capacity, price and facilities
- [ ] Hall manager (`HALL_MANAGER`) views
- [ ] Unit/component tests and CI

---

## 📚 Further Documentation

| File | Contents |
|---|---|
| [`Overview.md`](Overview.md) | In-depth architecture, modules, state and patterns |
| [`BookingServiceDoc.md`](BookingServiceDoc.md) | Booking service API usage from the UI |
| [Backend README](https://github.com/mafsan786git/shaadi-hall-booking#readme) | Server setup, roles, booking lifecycle, API reference, sheet schema |
