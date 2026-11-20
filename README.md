# SalonBook — Client

SalonBook is a salon appointment booking platform (Programming Hero
Assignment 9, Category 002). Customers browse salon services, request
appointments online, and pay for confirmed appointments through Stripe.
Admins manage services, appointments, customers, and payments.

This repository holds the **client** (Next.js frontend). The server lives
in a separate repository.

## Live Website

Live site: _TBD — deployment is still in progress._

## Technology Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Better Auth (email/password + Google sign-in; JWT for API calls)
- React Hot Toast for notifications

## How to Run Locally

Requirements: Node.js 20+, and the SalonBook server running on
`http://localhost:5000`.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` (see `.env.example`):

   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open http://localhost:3000

## Environment Variables

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL of the Express API server |

No secrets belong in this repository. Google OAuth credentials, Stripe
keys, the ImgBB key, and database credentials live only on the server.

## Repositories

- Client: https://github.com/shuvo524/SalonBook-client-side
- Server: https://github.com/shuvo524/SalonBook-server-side
