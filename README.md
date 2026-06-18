# Client Intake & Case Progress Tracker

I worked as a licensed Realtor managing multiple active client pipelines simultaneously. The standard workflow — tracking deal stages, document checklists, and follow-up tasks — required either an over-engineered enterprise CRM or a spreadsheet. This tool is a purpose-built alternative for solo agents and small teams.

## Week 1 Status

Week 1 delivers the project foundation:

- Next.js (App Router) + TypeScript + Tailwind CSS
- Clerk authentication with protected routes
- Firebase Firestore data model and security rules
- Working API routes: `GET /api/clients` and `POST /api/clients`

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Clerk** (authentication)
- **Firebase Firestore** (database)
- **Zod** (API request validation)

## Data Model

### `clients` collection

Each client document is scoped to a signed-in agent via `ownerId` (Clerk user ID).

| Field | Type | Description |
| --- | --- | --- |
| `ownerId` | `string` | Clerk user ID of the agent who owns this record |
| `name` | `string` | Client full name |
| `email` | `string` | Client email |
| `phone` | `string` | Client phone number |
| `propertyType` | `"buyer" \| "seller" \| "both"` | Relationship type |
| `budgetMin` | `number` | Minimum budget |
| `budgetMax` | `number` | Maximum budget |
| `address` | `string?` | Property address (optional) |
| `searchCriteria` | `string?` | Search preferences (optional) |
| `stage` | `DealStage` | Current pipeline stage |
| `lastActivityAt` | `number` | Unix timestamp of most recent activity |
| `createdAt` | `number` | Unix timestamp when client was created |

### `DealStage` values

1. `inquiry`
2. `preQualification`
3. `propertySearch`
4. `offerSubmitted`
5. `underContract`
6. `pendingClose`
7. `closed`

### Subcollections

#### `clients/{clientId}/activity`

Chronological activity log entries.

| Field | Type | Description |
| --- | --- | --- |
| `clientId` | `string` | Parent client ID |
| `type` | `"note" \| "stageChange"` | Activity type |
| `message` | `string` | Activity message |
| `createdAt` | `number` | Unix timestamp |

#### `clients/{clientId}/documents`

Stage-based document checklist items.

| Field | Type | Description |
| --- | --- | --- |
| `clientId` | `string` | Parent client ID |
| `stage` | `DealStage` | Stage this checklist item belongs to |
| `label` | `string` | Document name |
| `complete` | `boolean` | Completion status |

## API Routes

### `GET /api/clients`

Returns all clients for the authenticated agent, ordered by most recent activity.

### `POST /api/clients`

Creates a new client with:

- Validated intake payload (Zod)
- Initial activity log entry
- Default document checklist items for all stages

Example body:

```json
{
  "name": "Jordan Lee",
  "email": "jordan.lee@example.com",
  "phone": "619-555-0142",
  "propertyType": "buyer",
  "budgetMin": 450000,
  "budgetMax": 650000,
  "searchCriteria": "3 bed, 2 bath near North Park",
  "firstNote": "Prefers move-in ready homes with a yard."
}
```

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your keys:

```bash
cp .env.example .env.local
```

Required services:

- [Clerk Dashboard](https://dashboard.clerk.com/) for auth keys
- [Firebase Console](https://console.firebase.google.com/) for Firestore + service account

For Firebase Admin, create a service account key and map:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

### 3. Deploy Firestore rules and indexes

Install Firebase CLI if needed:

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign in, and use **Add sample client** to verify the POST route.

## Project Structure

```text
src/
  app/
    api/clients/route.ts      # GET + POST clients
    sign-in/[[...sign-in]]/   # Clerk sign-in
    sign-up/[[...sign-up]]/   # Clerk sign-up
    layout.tsx
    page.tsx                  # Week 1 dashboard shell
  lib/
    types.ts                  # Shared TypeScript interfaces
    schemas.ts                # Zod validation schemas
    clients.ts                # Mapping + seed helpers
    firebaseClient.ts         # Client SDK init
    firebaseAdmin.ts          # Admin SDK init
  middleware.ts               # Clerk route protection
firestore.rules
firestore.indexes.json
firebase.json
```

## Next Steps (Week 2+)

- Build `ClientCard` with urgency indicators
- Connect dashboard to real-time Firestore listeners
- Add Jest + React Testing Library coverage
# Real-Estate-Project
