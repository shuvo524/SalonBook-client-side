# SalonBook — Client

SalonBook is a salon appointment booking platform (Programming Hero
Assignment 9, Category 002). Customers browse salon services, request
appointments online, and pay for confirmed appointments through Stripe.
Admins manage services, appointments, customers, and payments.

This repository holds the **client** (Next.js frontend). The server lives
in a separate repository.

## Live Website

Live site: https://salonbook-bd.vercel.app/

API server: https://salonbook-server-mu.vercel.app/

## Features

### Customers

- Browse services without signing in; search by name, filter by category,
  sort by price
- Service details with booking (date + time slot + optional message)
- My Appointments: track status, cancel pending requests, pay for confirmed
  appointments via Stripe Checkout
- Payment history and profile management (name, phone, photo by URL or upload)
- Customer dashboard with appointment and spending stats

### Admins

- Dashboard overview: customers, services, appointments, payments, revenue
- Service management: add, edit, delete, activate/deactivate (image upload)
- Appointment management: confirm pending requests, cancel requests
- User management: view customers, see appointment history, block/unblock
- Transaction history (read-only — records come from the Stripe webhook)

### Platform

- Better Auth: email/password + Google sign-in; JWT for API calls
- Role-based dashboards with route guards (customers cannot reach admin
  pages by URL, and vice versa)
- Blocked users cannot access protected features
- Fully responsive (desktop, tablet, mobile)
- Toast notifications for every action — no `alert()` popups

## Technology Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4
- **Auth:** Better Auth client (`better-auth`) + JWT session restore
- **Notifications:** React Hot Toast
- **API:** REST calls to the Express server (see the server repository)

## Installation

Requirements: Node.js 20+ and npm.

```bash
git clone https://github.com/shuvo524/SalonBook-client-side.git
cd SalonBook-client-side
npm install
```

## How to Run Locally

The SalonBook server must be running on `http://localhost:5000` first
(see the server repository for its own setup).

1. Create `.env.local` in the project root (see `.env.example`):

   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open http://localhost:3000

Other scripts:

```bash
npm run build   # production build (must pass with zero errors)
npm run start   # serve the production build
npm run lint    # ESLint
```

## Required Environment Variables

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL of the Express API server |

Only variable **names** are listed here — never actual secret values. No
secrets belong in this repository at all: Google OAuth credentials, Stripe
keys, the ImgBB key, and database credentials live only on the server.

## Admin Access

Admin accounts are never created through public registration. To make an
admin account: sign up through the app, then run this in the **server**
folder:

```bash
node scripts/promote-admin.js <email>
```

## Testing Payments

Use Stripe's test card on the checkout page: `4242 4242 4242 4242`, any
future expiry date, any CVC. The payment status updates only after the
server's Stripe webhook verifies the payment.

## Repositories

- Client: https://github.com/shuvo524/SalonBook-client-side
- Server: https://github.com/shuvo524/SalonBook-server-side
