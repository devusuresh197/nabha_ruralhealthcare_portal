# RuralCare Portal

RuralCare Portal is a role-based rural healthcare coordination platform built with Next.js.
It supports:

- Health workers submitting patient cases and medicine prebookings
- Doctors reviewing and deciding case outcomes
- Pharmacists managing stock and responding to prebookings
- AI-assisted triage (Gemini) with safe rule-based fallback

## Tech Stack

- Next.js 16 (App Router, API Routes)
- React 19 + TypeScript
- Tailwind CSS + shadcn/ui components
- MongoDB (auth, medicines, prebookings)
- Gemini API (optional, for case risk triage)

## Roles and Access Model

- `health_worker`
  - Submit patient cases
  - Search medicine availability
  - Create prebookings
- `doctor`
  - Review pending cases
  - Override AI risk
  - Provide advice and prescription
- `pharmacist`
  - View and update stock for assigned pharmacy only
  - View and respond to prebookings for assigned pharmacy only

## Project Structure

```txt
app/
  api/
    auth/login
    cases
    medicines
    prebookings
backend/
  ai-triage.ts
  auth-db.ts
  medicine-prebooking-db.ts
  data-store.ts
  scripts/grant-access.mjs
components/
  dashboards/
  modals/
  health-worker/
lib/
  api-client.ts
  auth-context.tsx
  types.ts
  mock-data.ts
public/
```

## Environment Variables

Create `.env.local` in project root:

```env
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=rural_health_portal

# Optional AI triage
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash
```

Notes:

- If `GEMINI_API_KEY` is missing, app still works (rule-based triage fallback).
- For Mongo Atlas, use your connection URI in `MONGODB_URI`.

## Install and Run

```bash
npm install
npm run dev
```

App runs at: `http://localhost:3000`

## Create/Update Allowed Users

Use the admin script:

```bash
npm run db:grant-access -- --name "Name" --email "mail@example.com" --password "Secret123" --role doctor
```

For pharmacists, `--pharmacyId` is required:

```bash
npm run db:grant-access -- --name "Gurpreet Singh" --email "gurpreet@ruralcare.in" --password "Pharma@123" --role pharmacist --pharmacyId pharmacy-1
```

Valid pharmacy IDs:

- `pharmacy-1` (Jan Aushadhi Kendra - Moga)
- `pharmacy-2` (Rural Health Pharmacy - Bathinda)
- `pharmacy-3` (Gram Seva Medical Store - Sangrur)

### Example onboarding commands

```bash
npm run db:grant-access -- --name "Dr Rajesh Kumar" --email "rajesh@ruralcare.in" --password "Doctor@123" --role doctor
npm run db:grant-access -- --name "Priya Sharma" --email "priya@ruralcare.in" --password "Worker@123" --role health_worker
npm run db:grant-access -- --name "Gurpreet Singh" --email "gurpreet@ruralcare.in" --password "Pharma@123" --role pharmacist --pharmacyId pharmacy-1
npm run db:grant-access -- --name "Sukhdeep Kaur" --email "sukhdeep@ruralcare.in" --password "Pharma2@123" --role pharmacist --pharmacyId pharmacy-2
npm run db:grant-access -- --name "Harpreet Gill" --email "harpreet@ruralcare.in" --password "Pharma3@123" --role pharmacist --pharmacyId pharmacy-3
```

## API Overview

### Auth

- `POST /api/auth/login`
  - body: `{ email, password }`
  - returns user or `null`

### Cases

- `GET /api/cases`
- `GET /api/cases?healthWorkerId=...`
- `GET /api/cases?status=pending|reviewed`
- `POST /api/cases`
  - creates case
  - computes AI risk via Gemini when configured
- `PATCH /api/cases/[caseId]/review`
  - doctor review + decision

### Medicines

- `GET /api/medicines`
- `GET /api/medicines?pharmacyId=...`
- `GET /api/medicines?query=...`
- `POST /api/medicines`
  - requires `actorId` (must be pharmacist, must match assigned pharmacy)
- `PATCH /api/medicines/[medicineId]`
  - requires `actorId` (pharmacist + same pharmacy)

### Prebookings

- `GET /api/prebookings`
- `GET /api/prebookings?healthWorkerId=...`
- `GET /api/prebookings?pharmacyId=...`
- `POST /api/prebookings`
  - requires `actorId` (must be health worker)
- `PATCH /api/prebookings/[prebookingId]/response`
  - requires `actorId` (must be pharmacist of same pharmacy)

## AI Triage Details

- File: `backend/ai-triage.ts`
- Input: case demographics, symptoms, vitals, notes
- Output: `Low | Medium | High`
- Fallback path:
  - If Gemini key missing/error -> `calculateRuleBasedRisk` in `backend/data-store.ts`
- Doctor can override AI risk during review (final authority preserved)

## Data Persistence

- MongoDB collections:
  - `users`
  - `medicines`
  - `prebookings`
- Cases are currently in-memory in `backend/data-store.ts` (seeded from mock data)
  - They reset on server restart unless migrated to DB.

## Sign-In Page and Branding

The sign-in page is customized (non-default v0 style) with:

- Official-style header and navigation
- Hero image banner
- Role-secure login form
- Footer mission statement

To set your banner image:

1. Place image at: `public/rural-health-banner.jpg`
2. Restart dev server if needed

## Scripts

- `npm run dev` - start development server
- `npm run build` - build app
- `npm run start` - start production server
- `npm run lint` - run ESLint
- `npm run db:grant-access` - create/update allowed user credentials

## Common Issues

- `Module not found: mongodb`
  - run `npm install`
- Login API returns `500`
  - verify `MONGODB_URI` and DB accessibility
- No prebookings visible for pharmacist
  - ensure prebooking was created for that pharmacist's `pharmacyId`
  - ensure pharmacist user has assigned `pharmacyId`
- AI not used
  - set `GEMINI_API_KEY` and restart server

## Security Notes

- Never commit `.env.local` or API keys
- Use strong passwords for production users
- AI triage is support only, not diagnosis
- Keep doctor review as final decision

