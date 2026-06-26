# Client Intake & Case Progress Tracker

I worked as a licensed Realtor managing multiple active client pipelines simultaneously. The standard workflow — tracking deal stages, document checklists, and follow-up tasks — required either an over-engineered enterprise CRM or a spreadsheet. This tool is a purpose-built alternative for solo agents and small teams.

## Week 3 Status

Week 3 adds the client detail experience:

- `/clients/[id]` detail page with contact info, stage dropdown, document checklist, and activity log
- `GET /api/clients/:id` and `PUT /api/clients/:id` for reads and updates
- Stage changes and notes append to the activity log automatically
- Checklist items toggle complete/incomplete and persist to Firestore
- Real-time detail updates via Firestore listeners

## Week 2 Status

Week 2 adds the live dashboard experience:

- `ClientCard` component with urgency indicators (amber after 5 days, red after 10 days)
- Real-time dashboard via Firestore `onSnapshot` listeners
- Clerk-to-Firebase custom token bridge for secured client reads
- Jest + React Testing Library suite with 4 passing `ClientCard` tests

Run tests with:

```bash
npm test
```

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
| `latestNote` | `string` | Most recent note shown on dashboard cards |
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

### `GET /api/firebase/token`

Returns a Firebase custom auth token for the signed-in Clerk user. Used by the dashboard to establish secured Firestore listeners.

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

### `GET /api/clients/:id`

Returns a single client with activity log and document checklist items.

### `PUT /api/clients/:id`

Updates a client owned by the signed-in agent. Supported actions:

```json
{ "action": "updateStage", "stage": "propertySearch" }
```

```json
{ "action": "addNote", "note": "Follow-up call scheduled for Friday." }
```

```json
{ "action": "toggleDocument", "documentId": "abc123", "complete": true }
```

Stage changes and notes update `lastActivityAt`, `latestNote`, and append to the activity log.

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
    api/firebase/token/route.ts
    sign-in/[[...sign-in]]/   # Clerk sign-in
    sign-up/[[...sign-up]]/   # Clerk sign-up
    layout.tsx
    page.tsx                  # Dashboard entry
    dashboard-panel.tsx       # Real-time client grid
  components/
    ClientCard.tsx
    ClientCard.test.tsx
    site-header.tsx
  hooks/
    useFirebaseAuth.ts
    useClientsListener.ts
  lib/
    types.ts                  # Shared TypeScript interfaces
    schemas.ts                # Zod validation schemas
    clients.ts                # Mapping + seed helpers
    urgency.ts                # Urgency indicator logic
    stages.ts                 # Deal stage labels
    firebaseClient.ts         # Client SDK init
    firebaseAdmin.ts          # Admin SDK init
  middleware.ts               # Clerk route protection
firestore.rules
firestore.indexes.json
firebase.json
jest.config.mjs
jest.setup.ts
```

## Next Steps (Week 4+)

- Build `AddClientForm` with React Hook Form + Zod
- Add dashboard search and filter bar
- Expand test coverage to form and stage components
# Real-Estate-Project
