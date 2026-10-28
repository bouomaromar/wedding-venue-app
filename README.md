# Wedding Venue Booking App

CSIS290 senior project: Omar Bouomar (A2212459), Ihsan Adraa (A2020163).

Couples in Lebanon browse wedding venues, get AI-ranked recommendations, preview venues through 360° / Gaussian Splatting tours, and send booking requests. Venue owners manage their venues and bookings from the same mobile app.

This repository is the **foundation**: the full database, the API's authentication and venue modules, and the mobile app skeleton. The remaining modules are built on top of it by following the same pattern (see [Adding a module](#adding-a-module)).

```
wedding-venue-app/
├── api/                    Node.js + Express + PostgreSQL (hand-written SQL)
│   ├── sql/migrations/     numbered .sql files that build the 16 tables
│   ├── sql/seeds/          style tags and amenities
│   ├── scripts/            migrate.js, seed.js
│   └── src/
│       ├── config/         env, database pool, constants
│       ├── routes/         URL → middleware → controller
│       ├── controllers/    HTTP in/out only
│       ├── services/       business rules and permission checks
│       ├── repositories/   SQL queries (the only place SQL lives)
│       ├── validators/     input checks, return a list of messages
│       ├── middleware/     auth, roles, validation, rate limit, errors
│       └── utils/          AppError, pagination, shared checks
└── mobile/                 React Native + Expo
    └── src/
        ├── navigation/     root navigator, couple tabs, owner tabs
        ├── screens/        one file per screen
        ├── components/     reusable UI (VenueCard, Button, TextField...)
        ├── api/            one function per API call + token handling
        ├── hooks/          useFetch, useForm, useAsyncAction, useVenues...
        ├── store/          auth state (AuthProvider, useAuth)
        └── theme/          colours, spacing, type
```

## Running it locally

You need **Node.js 20+**, **PostgreSQL**, and the **Expo Go** app on your phone (from the App Store / Google Play, kept up to date so it supports this project's Expo SDK).

### 1. API

```bash
cd api
npm install
cp .env.example .env          # Windows: copy .env.example .env
```

Fill in `.env` with your PostgreSQL password and a JWT secret (the file shows how to generate one). Create an empty database named `wedding_venues` (in pgAdmin, or `createdb -U postgres wedding_venues`), then:

```bash
npm run db:migrate            # creates the tables
npm run db:seed               # style tags, amenities, demo accounts and venues
npm run dev                   # starts the API on http://localhost:3000 and restarts on save
```

Check it works: open http://localhost:3000/health and http://localhost:3000/api/v1/venues in a browser.

Demo accounts (password `Password123!` for all three):

| Email | Role |
|---|---|
| `couple@demo.lb` | couple |
| `owner@demo.lb` | venue owner (owns the 4 demo venues) |
| `admin@demo.lb` | admin |

`npm run db:reset` wipes the database and runs migrate + seed again (refused when `NODE_ENV=production`).

### 2. Mobile app

```bash
cd mobile
npm install
cp .env.example .env          # Windows: copy .env.example .env
```

In `mobile/.env`, set `EXPO_PUBLIC_API_URL` to your laptop's Wi-Fi IP address, e.g. `http://192.168.1.20:3000/api/v1`. On the phone, `localhost` means the phone itself, so it won't work there. Then:

```bash
npx expo start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS). The phone and the laptop must be on the same Wi-Fi.

If the app says it can't reach the server: check the IP in `.env`, restart `npx expo start` after editing `.env`, and allow Node.js through the Windows firewall on private networks. If the campus Wi-Fi blocks device-to-device traffic, use a phone hotspot.

## How the API works

Every request goes **route → middleware → controller → service → repository**, the same layering as the CSIS279 course project:

- **route** lists the URLs and which middleware runs first (login required? which role? validate the body).
- **controller** reads the request, calls one service function, sends the response. No SQL, no rules.
- **service** holds the business rules: ownership checks, transactions, turning database errors into clear messages.
- **repository** holds the SQL. Every value goes in through `$1, $2` placeholders, never pasted into the SQL text, which prevents SQL injection.

Conventions every endpoint follows:

- Base URL `/api/v1`. JSON in and out.
- **Errors** always look like `{ "error": { "code": "...", "message": "...", "details": [...] } }`. Services `throw` an `AppError` (`notFound()`, `forbidden()`, `conflict()`...) and the error middleware sends it. Express 5 forwards errors from async handlers by itself, so controllers need no try/catch.
- **Lists** take `?page=&limit=` (default 20, max 50) and return `{ data, page, limit, total, totalPages }`.
- **Auth**: login returns an access token (15 minutes) and a refresh token (7 days, stored hashed in `refresh_tokens`). The app sends `Authorization: Bearer <accessToken>`. When it expires, the app calls `/auth/refresh` automatically. Each refresh token works once (rotation); reusing an old one ends all of that user's sessions.
- **Roles**: `couple`, `owner`, `admin`. `requireRole(...)` checks the role; services check ownership (an owner can only change their own venues).

### Endpoints built so far

| Method | Path | Who | What |
|---|---|---|---|
| POST | `/auth/register` | anyone | sign up as `couple` (default) or `owner` (needs `companyName`) |
| POST | `/auth/login` | anyone | returns `{ user, accessToken, refreshToken }` |
| POST | `/auth/refresh` | anyone | `{ refreshToken }` → new token pair |
| POST | `/auth/logout` | anyone | `{ refreshToken }` → revokes it |
| GET | `/auth/me` | signed in | current user (+ `ownerProfile` for owners) |
| GET | `/venues` | anyone | approved venues; filters `region`, `guests`, `budget`, `styleId`, `amenityId`, `featured`, `search`; admins can add `status=pending` |
| GET | `/venues/mine` | owner | own venues in every status |
| GET | `/venues/:id` | anyone | details with styles, amenities, media, contact; unapproved venues only for their owner and admins |
| POST | `/venues` | owner | create (starts as `pending`) |
| PUT | `/venues/:id` | owner of it, admin | update; `styleIds` / `amenityIds` replace the lists when sent |
| PATCH | `/venues/:id/status` | admin | `{ status, isFeatured }` approve / reject / feature |
| DELETE | `/venues/:id` | owner of it, admin | refused with 409 while the venue has bookings |
| GET | `/styles`, `/amenities`, `/regions` | anyone | lists for filters and forms |
| GET | `/health` (no `/api/v1`) | anyone | API and database status |

## Adding a module

Take **bookings** as the example. Copy the venue files and adapt them:

1. **Validator** `api/src/validators/booking.validator.js`: return a list of messages (event date in the future, guest count > 0...).
2. **Repository** `api/src/repositories/booking.repository.js`: SQL only, `$1` placeholders, functions take an optional `db` so they can run inside a transaction.
3. **Service** `api/src/services/booking.service.js`: rules and permissions. For bookings: run the create in `withTransaction`, check the date isn't blocked in `venue_availability`, write every status change to `booking_status_history`, and turn the unique-index error (`23505` on `uq_bookings_confirmed_venue_date`) into `conflict("This date is already booked")`.
4. **Controller** `api/src/controllers/booking.controller.js`: thin, like `venue.controller.js`.
5. **Route** `api/src/routes/booking.route.js`, then mount it in `api/src/routes/index.js`.
6. **App**: add functions to `mobile/src/api/bookingApi.js`, a hook in `mobile/src/hooks/`, and replace the matching `PlaceholderScreen` in `mobile/src/navigation/` with the real screen.

Modules still to build: bookings, booking requests for owners, blocked dates, reviews (only after a confirmed booking; update `venues.rating_avg` / `rating_count` in the same transaction), favorites, saved preferences, recommendations, media uploads, notifications. The venue create/edit form in the app is also next.

## Changes from the original ERD

The migrations fix gaps between the ERD and the system design document. Update the ERD diagram to match:

| Table | Change |
|---|---|
| `users` | added `role` (couple / owner / admin) and `is_active` |
| `venue_owners` | added `user_id` (unique) so owners sign in as users |
| `refresh_tokens` | **new**: hashed refresh tokens, so sessions can be revoked |
| `venues` | added `description`, `latitude`, `longitude`, `price_min`, `price_max`, `status` (pending / approved / rejected), `rating_avg`, `rating_count`, `updated_at` |
| `amenities`, `venue_amenities` | **new** (were in the design doc, missing from the ERD) |
| `venue_availability` | **new**: owner-blocked dates |
| `bookings` | added `notes`, `updated_at`; partial unique index stops two confirmed bookings for the same venue and date |
| `booking_status_history` | **new**: audit trail of status changes |
| `reviews` | one review per couple per venue (unique `user_id, venue_id`) |
| `favorites` | **new** |
| `user_preferences` | one row per user; added `region`, `updated_at`; free-text `preferred_style` replaced by the `user_preference_styles` bridge table to `style_tags` |

That makes 16 tables (14 from the design document plus `refresh_tokens` and `user_preference_styles`). All primary keys are UUIDs generated by PostgreSQL. Prices are whole US dollars for the whole event.
