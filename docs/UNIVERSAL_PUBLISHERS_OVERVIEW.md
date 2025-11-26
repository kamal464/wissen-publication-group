## Universal Publishers - System Overview and Auth/Login Spec

### Purpose
This document captures the current state of the Universal Publishers application, with a focus on authentication/login flows, implemented backend/frontend functionality (articles, journals, manuscripts), known gaps, and a clear, actionable handoff so AI can complete the remaining flows end-to-end.

---

## Authentication and Login

### Login Flows
- Admin Login (API-backed)
  - Endpoint: POST `/api/admin/login`
  - Looks up `User` by `userName`, checks `isActive`, compares plaintext `password`, and returns a temporary token string.
  - Response shape (simplified):
    - `success: boolean`
    - `token: string` (placeholder, not JWT)
    - `user: { id, username, journalName }`
  - Frontend stores token in `localStorage.adminAuth` and username in `localStorage.adminUser`. Axios attaches `Authorization: Bearer <token>` if present.
  - Source:
    - Backend: `backend/src/admin/admin.controller.ts`, `backend/src/admin/admin.service.ts`
    - Frontend: `frontend/src/app/admin/login/page.tsx`, `frontend/src/lib/api.ts`

- Journal Admin Login (client-only demo)
  - No backend endpoint today. Frontend checks hardcoded credentials (`journal-admin` / `journal123`) and stores `localStorage.journalAdminAuth` and `localStorage.journalAdminUser`.
  - Axios will also attach this token string if present, though backend does not validate it.
  - Source:
    - Frontend: `frontend/src/app/journal-admin/login/page.tsx`, `frontend/src/lib/api.ts`

### Navigation, Screens, and Operations (by role)

#### Admin (after successful login)
- Menu (from `frontend/src/components/admin/AdminLayout.tsx`)
  - Welcome (/admin/dashboard)
    - Admin welcome/dashboard
    - Uses `/api/admin/dashboard/stats` for counts (users, submissions, shortcodes, pending fulltexts, web pages, board members)
  - Users (/admin/users)
    - List/search users (`GET /api/admin/users?search=...`)
    - View user (`GET /api/admin/users/:id`)
    - Create user (`POST /api/admin/users`)
    - Update user (`PUT /api/admin/users/:id`) — username, password, journalName/Short, category, isActive
    - Toggle status (`PUT /api/admin/users/:id/toggle`)
    - Delete user (`DELETE /api/admin/users/:id`)
  - Online Submissions (/admin/submissions)
    - List/search (`GET /api/admin/submissions`)
    - View submission (`GET /api/admin/submissions/:id`)
  - Create Journal Shortcode (/admin/journal-shortcode)
    - List (`GET /api/admin/journal-shortcodes`)
    - Create (`POST /api/admin/journal-shortcodes`)
    - Delete (`DELETE /api/admin/journal-shortcodes/:id`)
  - Pending Fulltexts (/admin/pending-fulltexts)
    - Intended to list articles with status PENDING (count supported in stats; listing UI present)
  - Manage Main Web Pages (/admin/web-pages)
    - Intended CRUD for site pages (WebPage model present)
  - Board Members (/admin/board-members)
    - Intended CRUD for editorial board (BoardMember model present)
- Articles (admin section)
  - All Articles (/admin/articles) — data via `GET /api/articles`
  - Search Articles (/admin/articles/search)
  - Review Articles (/admin/articles/review)
  - Pending Submissions (/admin/articles/pending)
  - Update status (`PUT /api/admin/articles/:id/status`) — sets `publishedAt` when PUBLISHED
- Analytics
  - Journals: `GET /api/admin/analytics/journals`
  - Articles: `GET /api/admin/analytics/articles`
  - Search: `GET /api/admin/analytics/search` (mock data)
- Notifications
  - Get unread: `GET /api/admin/notifications?unreadOnly=true`
  - Mark read: `PUT /api/admin/notifications/:id/read`
  - Mark all read: `PUT /api/admin/notifications/read-all`
- Global Search (top bar)
  - `GET /api/admin/search?query=...` → users/articles/journals/webPages
- Logout
  - Clears `adminAuth`/`adminUser` and redirects to `/admin/login`

#### Journal Admin (after successful login)
- Menu (from `frontend/src/components/journal-admin/JournalAdminLayout.tsx`)
  - Dashboard (/journal-admin/dashboard)
  - Journal Management
    - Manage Journal Information (/journal-admin/journals)
    - Manage Meta Information (/journal-admin/journals/meta)
    - Journal Home Page (/journal-admin/journals/home)
    - Aims & Scope (/journal-admin/journals/aims-scope)
    - Guidelines (/journal-admin/journals/guidelines)
    - Editorial Board (/journal-admin/journals/editorial-board)
    - Articles in Press (/journal-admin/journals/articles-press)
    - Current Issue (/journal-admin/journals/current-issue)
    - Archive Page (/journal-admin/journals/archive)
  - Article Management
    - All Articles (/journal-admin/articles)
    - Search Articles (/journal-admin/articles/search)
    - Review Articles (/journal-admin/articles/review)
    - Pending Submissions (/journal-admin/articles/pending)
  - Analytics (/journal-admin/analytics)
  - Settings (/journal-admin/settings)
- Backend status:
  - UI is scaffolded; many write endpoints for journal content management are not yet implemented (see AI brief).
- Logout
  - Clears `journalAdminAuth`/`journalAdminUser` and redirects to `/journal-admin/login`

#### Unauthenticated (public)
- Header navigation (from `frontend/src/components/layout/Header.tsx`)
  - Home (/)
  - About Us (/about)
  - Journals (/journals) — `GET /api/journals`
  - Articles (/articles) — `GET /api/articles`
  - Editorial Board (/editorial-board)
  - Instructions to Authors (/instructions)
  - Submit Manuscript (/submit-manuscript) — `POST /api/articles/manuscripts` (multipart)
  - Contact Us (/contact)
- Public flows:
  - Browse journals and articles
  - Submit manuscript (title, abstract, keywords, authors list, PDF)
  - View static/marketing content

### Data Model (Prisma)
- `User` (relevant fields)
  - `userName: String @unique`
  - `password: String?`
  - `isActive: Boolean @default(true)`
  - `journalShort: String?`
  - `journalName: String?`
  - Source: `backend/prisma/schema.prisma`

### Current Auth Limitations (to be addressed)
- Placeholder token (not JWT); no server-side guards enforce auth/roles.
- Plaintext password comparisons; no hashing/salting (bcrypt).
- Journal Admin flow is client-only; needs real server-backed auth and role.
- No token refresh, logout endpoint, or standardized error responses for auth.

---

## Implemented Backend Features (High-Level)

### Modules and Global Setup
- Global API prefix: `/api` (see `backend/src/main.ts`)
- CORS enabled for UI origins (configurable in `backend/src/config/app.config.ts`)
- Static file serving for uploads at `/uploads/`
- Prisma used for persistence (`backend/src/prisma/prisma.service.ts`)

### Journals
- Endpoints (public/admin mix currently):
  - `GET /api/journals` — list journals
  - `GET /api/journals/:id` — journal details
  - Admin endpoints:
    - `POST /api/admin/journals` — create journal
    - `PUT /api/admin/journals/:id` — update journal
    - `DELETE /api/admin/journals/:id` — delete journal (cascade delete articles for that journal in service)
  - Additional journal content-management endpoints are scaffolded in `frontend/src/lib/journalAPI` but not yet implemented on backend (`meta`, `content`, `home`, `aims-scope`, `guidelines`, `editorial-board`, `articles-press`, `current-issue`, `archive`).

### Articles
- Endpoints:
  - `GET /api/articles` — list articles (service-side includes authors and journal title in other contexts)
  - `GET /api/articles/:id` — article detail (with journal and authors)
  - `POST /api/articles/manuscripts` — submit manuscript (multipart; file processing via Multer; persists authors; attaches optional `pdfUrl`)
  - Admin actions:
    - `PUT /api/admin/articles/:id/status` — update article status (sets `publishedAt` when status moves to `PUBLISHED`)
    - Analytics (see below)

### Admin Features (Analytics, Users, Notifications, Search)
- Dashboard and Analytics:
  - `GET /api/admin/dashboard/stats` — aggregates counts for users, submissions, shortcodes, pending fulltexts, web pages, board members
  - `GET /api/admin/analytics/journals` — per-journal article stats and average review time
  - `GET /api/admin/analytics/articles` — article counts by status, monthly submissions, category stats
  - `GET /api/admin/analytics/search` — mock popular terms/top viewed articles
- Users (Admin):
  - `GET /api/admin/users` — search by `userName`, `journalName`, `journalShort`
  - `GET /api/admin/users/:id`
  - `POST /api/admin/users` — create; validates unique `userName`; optional `password`
  - `PUT /api/admin/users/:id` — update (supports password, status toggles, journal mappings)
  - `DELETE /api/admin/users/:id`
  - `PUT /api/admin/users/:id/toggle` — toggle `isActive`
- Journal Shortcodes (Admin):
  - `GET /api/admin/journal-shortcodes`
  - `POST /api/admin/journal-shortcodes`
  - `DELETE /api/admin/journal-shortcodes/:id`
- Notifications (Admin):
  - `GET /api/admin/notifications` (optional `unreadOnly`)
  - `PUT /api/admin/notifications/:id/read`
  - `PUT /api/admin/notifications/read-all`
- Global Search (Admin):
  - `GET /api/admin/search?query=...` — finds users, articles, journals, web pages

---

## Implemented Frontend Features (High-Level)

### Admin Area (Next.js App Router)
- Login Page: `/admin/login` — calls API and stores token; fallback hardcoded credentials
- Dashboard/Analytics/Articles/Journals/Users pages scaffolded with data pulled via `frontend/src/lib/api.ts` (`adminAPI`)
- Axios request interceptor attaches token from either `adminAuth` or `journalAdminAuth`
- 401 response handling redirects to relevant login and clears storage

### Journal Admin Area
- Login Page: `/journal-admin/login` — client-only demo login; routes to `/journal-admin/dashboard`
- Layout and navigation present; endpoints not yet wired to role-based backend

### Public Area
- Core marketing and content pages: Home, About, Journals listing, Articles listing, Instructions, Contact
- Submit Manuscript flow: `/submit-manuscript` posts to `POST /api/articles/manuscripts` with multipart payload

---

## Gaps and Risks

### Auth/Security
- Replace placeholder token with signed JWT, add auth guards to protect admin routes.
- Hash passwords using bcrypt (store salted hashes, never plaintext).
- Add refresh tokens or reasonable expiry policies.
- Promote Journal Admin to a real role with separate login endpoint or role in the same endpoint.
- Consistent error handling and HTTP status codes for auth failures.

### Access Control
- Apply guards and role checks to all admin endpoints (Dashboard, Analytics, Users, Shortcodes, Notifications, Search, Journals CRUD, Article status updates).
- Decide which public endpoints need throttling or additional validation.

### Consistency and DX
- Standardize API response shapes with success/error payloads.
- Add OpenAPI/Swagger for discoverability.
- Add E2E tests for critical flows (login, manuscript submission, article status update).

### Content Management Extensions
- Implement the journal content-management endpoints currently only present in the frontend API client (`journalAPI`).
- Add upload handling for additional assets (cover images, board photos) with validation and storage conventions.

---

## Acceptance Criteria to “Complete All Flows”

### Authentication and Authorization
- Admin and Journal Admin can log in via API; receive JWTs (access, optional refresh).
- All `/api/admin/*` routes are protected by JWT guard and role guard.
- Passwords are stored as `bcrypt` hashes; plaintext password checks removed.
- Axios interceptor remains; 401 responses consistently handled.

### Articles
- Submit Manuscript end-to-end:
  - Multipart upload, validation, file storage paths, persisted authors.
  - UI success path and error states handled.
- Article Management (Admin):
  - List, filter, search, view details.
  - Update status with audit info (comments), publish date set correctly.
  - Reviewer assignment endpoint (if in UI) implemented and persisted.

### Journals
- Public listing and detail backed by consistent endpoints.
- Admin CRUD for journals fully functional with validation.
- Journal Content Management:
  - Implement endpoints for `meta`, `content` (aims-scope, guidelines, editorial-board, articles-in-press), `home`, `current-issue`, `archive`.
  - Frontend reads/writes via `journalAPI`, with confirmation toasts and optimistic UI where appropriate.

### Users (Admin)
- Create, update (including password change with hashing), toggle active, delete.
- Search by `userName`, `journalName`, `journalShort`.
- Duplicate usernames prevented at DB level and gracefully handled in API.

### Analytics and Notifications
- Dashboard, Articles/Journals Analytics respond with real data.
- Notifications list, mark-as-read, mark-all-read work with proper permissions.

### Global Search
- Returns slices for users, articles, journals, web pages; paginated or capped.
- Safe search; input validated/sanitized.

---

## AI Implementation Brief (Step-by-Step)

1) Harden Authentication
   - Add `bcrypt` password hashing for user creation and updates.
   - Replace placeholder token with JWT (use `config.jwt.secret` and `expiresIn`).
   - Create `AuthGuard` and `RolesGuard` (NestJS) and apply to `/api/admin/*`.
   - Extend `User` with a `role` enum (`ADMIN`, `JOURNAL_ADMIN`, …), or introduce a roles table.
   - Add Journal Admin login endpoint (or shared `/admin/login` returning role) and enforce role on journal admin routes.

2) Secure Routes
   - Add guards to Admin endpoints (Dashboard, Analytics, Users, Shortcodes, Notifications, Search, Articles status updates, Journals CRUD).
   - Ensure 401/403 codes and error payloads are consistent.

3) Journal Content Management Endpoints
   - Implement all endpoints referenced by `journalAPI`:
     - `GET/PUT /api/admin/journals/:id/meta`
     - `GET/PUT /api/admin/journals/:id/content/:contentType`
     - `GET/PUT /api/admin/journals/:id/home`
     - `GET/PUT /api/admin/journals/:id/aims-scope`
     - `GET/PUT /api/admin/journals/:id/guidelines`
     - `GET/PUT /api/admin/journals/:id/editorial-board`
     - `GET/PUT /api/admin/journals/:id/articles-press`
     - `GET/PUT /api/admin/journals/:id/current-issue`
     - `GET/PUT /api/admin/journals/:id/archive`
   - Define DTOs and Prisma schema fields as needed; add migrations.

4) Articles Enhancements
   - Validate manuscript fields, enforce file type/size, virus scan hooks if required.
   - Implement reviewer assignment endpoint/persistence if present in UI.
   - Add activity logs/audit for status transitions with comments.

5) Users Enhancements
   - Ensure password change flow updates hashed password only when provided.
   - Add server-side validation (class-validator) on DTOs.

6) Analytics and Notifications
   - Replace mock analytics with real aggregation queries.
   - Confirm notifications read/unread status transitions and permission checks.

7) Global Search
   - Add pagination and limits; return consistent result structure and counts.
   - Input validation and indexing strategy where necessary.

8) Developer Experience and Quality
   - Add Swagger/OpenAPI for all routes.
   - Add seed data for demo environments (admin user, journal admin user).
   - Add E2E tests for: admin login, journal admin login, manuscript submit, article publish, journals CRUD.

---

## What We’ve Achieved So Far (Summary)
- Core domain models for Users, Journals, Articles, Authors, Shortcodes, Notifications, Web Pages.
- Manuscript submission endpoint with file upload.
- Admin dashboard stats and analytics endpoints.
- Admin CRUD for Users and Journals; Shortcodes and Notifications management.
- Global search across key entities.
- Admin login (API) and Journal Admin login (client demo).
- Frontend admin and journal admin UIs scaffolded with Axios integration and basic routing/guards (client-side).

---

## Immediate Next Steps
- Implement JWT auth with guards and roles; hash passwords.
- Convert Journal Admin login to API-backed and protect routes.
- Implement journal content-management endpoints to match frontend API client.
- Add tests and Swagger for traceability and maintainability.


