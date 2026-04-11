# Bookit — Event Booking Web Application

A web-based event ticketing platform built for COMP 2154. Attendees can browse events, purchase tickets, and receive scannable QR codes. Organizers manage events and track sales. Venue staff validate tickets at the door via browser-based QR scanning.

**Live:** https://project-s0w2d.vercel.app/

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite |
| Styling | Tailwind CSS |
| Backend / Auth / DB | Supabase (BaaS) |
| Database | PostgreSQL with Row Level Security |
| QR Generation | qrcode.react |
| QR Scanning | html5-qrcode |
| Deployment | Vercel |

---

## Local Setup

**Prerequisites:** Node.js 18+, npm 9+, Git, a Supabase project

**1. Clone the repository**
```bash
git clone https://github.com/grxvy-y/2154-Bookit.git
cd 2154-Bookit
```

**2. Install dependencies**
```bash
npm install --legacy-peer-deps
```
> `--legacy-peer-deps` is required due to a peer dependency conflict between `html5-qrcode` and React 19. This is set in `.npmrc` so Vercel builds also use it.

**3. Configure environment variables**

Create a `.env.local` file in the project root:
```
VITE_SUPABASE_URL=<your Supabase project URL>
VITE_SUPABASE_ANON_KEY=<your Supabase anon/public key>
```
Values are found in your Supabase dashboard under **Settings → API**.

**4. Set up the database**

If using a new Supabase project, apply the schema via the Supabase SQL editor:
- Open `supabase/schema.sql`
- Paste the contents into **Supabase Dashboard → SQL Editor** and run

This creates all tables (`profiles`, `events`, `ticket_types`, `orders`, `tickets`), the `handle_new_user` trigger, and all RLS policies.

**5. Start the development server**
```bash
npm run dev
```
Opens at `http://localhost:5173`

---

## Deployment (Vercel)

The app auto-deploys from the `master` branch via Vercel.

1. Push changes to `master` on GitHub
2. Vercel detects the push and runs `npm run build`
3. Built output is served at the production URL
4. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under **Vercel → Project Settings → Environment Variables**

---

## User Roles

| Role | Access |
|---|---|
| **Attendee** | Browse events, purchase tickets, view QR codes on My Tickets |
| **Organizer** | All attendee access + create/manage events, organizer dashboard, staff scanner |
| **Venue Staff** | Staff QR scanner at `/staff/scan` |

Role is selected at registration and stored in the `profiles` table.

---

## Key Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Home page |
| `/Browse` | Public | Browse and search published events |
| `/login` | Public | Sign in |
| `/register` | Public | Create account |
| `/Cart` | Authenticated | Shopping cart |
| `/checkout` | Authenticated | Checkout and mock payment |
| `/my-tickets` | Attendee | View all purchased QR tickets |
| `/ticket/:id` | Ticket owner | Individual ticket detail and QR |
| `/Organizer` | Organizer | Event management dashboard |
| `/staff/scan` | Organizer / Venue Staff | QR ticket scanner |

---

## Project Structure

```
src/
├── components/
│   ├── auth/         ProtectedRoute.jsx
│   ├── events/       EventCard.jsx, Search.jsx
│   └── layout/       Layout.jsx, Navbar.jsx
├── context/          AuthContext.jsx, CartContext.jsx
├── lib/              supabase.js
├── pages/            Browse, Cart, Checkout, Home, Login,
│                     MyTickets, Organizer, Register,
│                     StaffScan, TicketView
├── utils/            ticketValidation.js, eventHelpers.js
└── assets/styles/    per-page CSS files
supabase/
└── schema.sql        Full DB schema + RLS policies
```

---

## Team

| Name | Role |
|---|---|
| Paul Yee | Frontend Lead, Project Coordinator |
| Ben Morrison | Backend Lead, Auth / RLS / QA |

COMP 2154 — Group 48
