# StayScout (PGFinder, extended) — run guide & viva notes

## One-time setup (already done on this Mac)
MongoDB 9.1 is installed at `~/mongodb` (no sudo/Homebrew needed) and the
Express server is on **port 5001** (5000 is taken by macOS AirPlay — don't use it).

## Run the project (2 terminals)

```bash
# 1 · Database (if not already running)
~/mongodb/mongodb-macos-aarch64--9.1.0/bin/mongod --dbpath ~/mongodb/data --port 27017 --logpath ~/mongodb/mongod.log --logappend

# 2 · API server (Express + MongoDB)
cd server && npm start          # → http://localhost:5001

# 3 · Frontend
npm run dev                      # → http://localhost:5173
```

Production build: `npm run build` → single-file `dist/index.html`.
The frontend **works even without the server** (original localStorage mode); with
the server up it uses real database records. Nothing was removed to add the new features.

## Demo accounts (registered during testing)
| Role    | Email       | Password |
|---------|-------------|----------|
| Student | stu@t.com   | test123  |
| Owner   | own@t.com   | test123  |
| Admin   | adm@t.com   | test123  |

Or register fresh accounts at `#/auth?mode=register` (pick role there).

## The 5 features & where they live
1. **PG Price Change Tracker** — listing page → "📈 Price & planning" tab.
   Chart + table from the real `priceHistory` collection; owner panel
   "Update rent" (Owner dashboard) auto-records `propertyId, oldPrice, newPrice,
   effectiveDate, changedBy` and keeps the current rent synchronized.
2. **Budget Survival Planner** — same tab, right column. 8 categories, budget
   slider, stacked bar, total/remaining, over-budget warning. Explicitly labelled
   *an expense-planning tool — not financial advice*. Prefills rent from any PG
   you open it on ("Use This PG" via the detail page).
3. **Move-In Availability Predictor** — sidebar of every listing. Picks a date,
   calls the estimate API. If <3 history records: *"Not enough historical data to
   estimate future availability"* (never invents). With ≥3 records: trend estimate
   with 🟢/⚠/🔴 badge and "Based on N recent availability records."
   Owner panel "Update availability" auto-archives `propertyId, availableRooms, recordedAt`.
4. **Maintenance Complaint Tracker** — "🔧 Maintenance" tab on a listing
   (signed-in residents only). 8 categories, priority, room no., timeline
   Reported → In Progress → Resolved. Owner dashboard manages tickets with
   status/category/priority filters; each transition notifies the student
   (bell panel on `/dashboard`).
5. **PG Switching Assistant** — Student dashboard (first login → `/dashboard`).
   Notice-day math, earliest move-out date, estimated deposit refund,
   alternative PGs with honest availability wording, 8-step plan with tap-to-complete
   and live % progress. Saved per user in `switchingPlans`.

## Dashboards
- **Student** `#/dashboard` — MY STAY + quick actions (💰📈📅🔧🔄), notifications, my complaints, switching assistant.
- **Owner** `#/owner` — original analytics/listings kept, plus Property management (Update rent/availability) and Maintenance requests (DB tickets with filters).
- **Admin** `#/admin` — price changes, availability history, complaints, switching reports, users. Role-gated (403 otherwise).

## Data model (MongoDB `stayscout` DB)
`users` (name, email, passwordHash, role) · `properties` (seeded from listings) ·
`priceHistory` (propertyId, oldPrice, newPrice, effectiveDate, changedBy) ·
`availabilityHistory` (propertyId, availableRooms, recordedAt) ·
`complaints` (propertyId, roomNumber, category, title, description, priority, status, timeline[], reportedBy) ·
`switchingPlans` (userId, currentPGId, currentRent, deposit, noticePeriodDays, deductions, earliestMoveOut, estimatedRefund, steps[8]) ·
`notifications` (userId, text, read)

## API endpoints
```
POST /api/auth/register|login                 GET /api/listings[/:id]        (public)
POST /api/price-history/update         owner|admin   → auto priceHistory record + rent sync
GET  /api/price-history/:propertyId    public
POST /api/availability/update          owner|admin   → auto availabilityHistory record
GET  /api/availability-history/:propertyId · /estimate/:propertyId?days=N   public
POST /api/complaints/file · /:id/status  | GET /api/complaints/mine | /api/notifications   (auth)
POST /api/switching-plans · /:id/step  | GET /api/switching-plans/mine                    (auth)
GET  /api/admin/overview               admin only
```

## Honest-data guarantees (asked-for rules)
- Price/availability history is written **only** when an owner/admin records a change — nothing fabricated.
- Predictor shows "Not enough historical data…" instead of guessing.
- Budget planner says "not financial advice".
- Availability estimate says "estimate … can change any day; the owner's live count wins".
- Role-guarded: students can't touch owner endpoints (verified 403), users can't see each other's complaints/plans (queries scoped by the JWT user id, never client input).

## Viva explanation (30-second version)
"StayScout is a full-stack PG platform: React frontend, Express REST API, MongoDB
persistence with three roles. Five features share one data spine — when an owner
updates rent or availability, an immutable history record is written, so the price
tracker is always truthful and the availability estimator uses real trends, openly
declining to predict without data. Complaints and switching plans are private to
their owner via JWT-scoped queries. The frontend gracefully falls back to offline
mode, so the product is one cohesive journey: FIND → PERSONALIZE → COMPARE →
ESTIMATE → GROUP → BOOK/STAY → ANALYZE → SUPPORT."

## Known limitations
- JWT secret is a demo constant (`server/auth.js`) — rotate for real deployment.
- Availability estimator is deliberately a simple trend model (day-slope), labelled as an estimate.
- Listings are seeded from the demo dataset; a production system would move listing CRUD fully server-side.
