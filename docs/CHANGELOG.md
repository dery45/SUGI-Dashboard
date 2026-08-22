# Changelog

All notable changes to the SUGI Dashboard project are documented here.

> **Versioning note:** The repository has no official git tags or releases. Milestones
> below are **derived** from logical clusters of the commit history
> (`1af4021` 2026-03-22 → Phase 4b TASK commits 2026-08-22), reconstructed from actual
> diffs. See [`VERSION.md`](./VERSION.md) for the methodology.

---

## [v0.14.0] — 2026-08-22 — RBAC Completion + Lifecycle Split (Phase 4b)

Fixed the two critical bugs Phase 4a found in itself, then rebuilt the sidebar,
Lifecycle UX, redirect logic, Settings visibility, and PWA config to the target
10-item structure. Completion report: `docs/PHASE4B_COMPLETION_REPORT.md`.

### Fixed (critical, live-tested)
- **Farmer-scoped lifecycle/sales guard was unreachable** — `isManagement` sent its own
  403 and never fell through to `isFarmerScoped`, so a correctly-assigned Petani still
  got `Required roles: superadmin, farmer_owner`. Replaced with role-direct
  `lifecycleAccess`/`salesAccess`; `isFarmerScoped` now maps URL sub-path → required
  stage and returns specific Indonesian 403s distinguishing "no active penugasan"
  (`Anda tidak memiliki penugasan aktif`) from stage/farm mismatch
  (`Penugasan Anda tidak mencakup akses tahap <Persiapan Lahan|Penanaman|Perawatan|Panen>`)
  and sales-flag mismatch (`Penugasan Anda tidak memiliki akses Penjualan & Distribusi`).
  Live-proven per stage: matching farmer 200; wrong-stage/unassigned/Government specific 403.
- **Rule D broken for Owner-created farmers** — validation rejected the request before
  the single-farm auto-copy applied, and the multi-farm picker never rendered for
  `role=farmer`. Backend now resolves owner farms pre-validation (auto-copy when body
  empty; subset check `Farm yang dipilih tidak termasuk dalam farm Anda` otherwise) and
  auto-creates a full-access `FarmerAssignment` per farm. Frontend shows the picker for
  superadmin/multi-farm-Owner creators and an auto-assign confirmation card for
  single-farm Owners. Both paths verified end-to-end incl. the resulting Penugasan row.
- **Raw-id populate bug** (found during Task 4 verification): owner user-list built farm-id
  arrays from populated docs (`f.toString()` → inspect strings), 500ing the query and
  silently disabling farm-sharing checks. New lean `getRawFarmIds()` across
  list/get/update/delete; positive farm-share case now passes.

### Added
- **10-item sidebar rebuild** with per-item role precision (Government Dashboard /
  Chatbot Insight / Government Data ▾13 catalogs / Farmer Dashboard / Master Data ▾
  Farm=superadmin-only / Analitik & KPI / Management Siklus Pertanian ▾4 stages /
  Penjualan dan Distribusi / Kelola User ▾(Penugasan, User Manajemen) / Pengaturan).
  Petani items derive from live `farmer-assignments` (stages + `sales_access`).
- **Backend guard tightening** to match: `/dashboard/farmer/v2` and all of
  `/master-data/*` now `isManagement` (farmer/government 403); assignment GETs behind
  new viewer guard excluding Pemerintah; `/farmers/*` behind Owner+Pemerintah+superadmin.
- **Four lifecycle pages split from LifecycleTabs**: `/management/lifecycle/
  persiapan-lahan|penanaman|perawatan|panen`, each individually reachable by Petani per
  their assignment, styled with shared Card/DataTable components.
- **Redirect policy change:** `homePathFor('farmer')` → Persiapan Lahan (Petani's first
  lifecycle stage) instead of `/farmer`; `/farmer` route excludes Petani (Owner +
  superadmin only). Zero-access fallback renders the backend's Indonesian 403 inline.
- **Settings "Farm Saya"**: hidden for Pemerintah; read-only for Petani (farms derived
  from assignments); Owner/superadmin unchanged.
- **PWA**: real emerald app icon replacing the social-media sprite (192+512 declared);
  shortcuts updated to the split routes (Persiapan Lahan, Panen, Penjualan).
- Real Playwright-driven offline smoke test executed against production preview:
  SW precaches exactly 5 shell URLs; offline reload hard-fails (`net::ERR_FAILED`) on
  every real route — app unusable offline until a navigation fallback + runtime caching
  lands (Phase 4c backlog).

### Changed
- Residual English in lifecycle UI fixed: `Edit`→`Ubah` (buttons + modal titles), status
  badge/select values mapped to Indonesian (Terbuka/Tertutup/Tertunda/Sedang Berlangsung/
  Selesai/Dibatalkan/Direncanakan/Ditanam + stage names), required markers removed (rule 10).
- All 25 `ResponsiveContainer` sites guarded against recharts' transient
  `width(-1)/height(-1)` warning (99% dims + minWidth/minHeight + debounce).
- Dead animation utilities removed (`page-enter/-exit`, `modal-*-exit`); empty dirs
  `component/chatbot|management`, `styles/` deleted; validation messages aligned with
  backend role-specific wording.

### Related Commits (Phase 4b)
- `63d1c0e` — Task 1 guard wiring fix · `0f76ef9` — Task 2 Rule D · `9f175ac` — Task 3 rename
- TASK 4–9 commits on top (sidebar rebuild, lifecycle split, redirects, settings, PWA, cleanup)
- Evidence: `docs/PHASE4B_COMPLETION_REPORT.md` (live transcripts per claim)

---

## [v0.13.0] — 2026-08-22 — RBAC Overhaul + PWA + Animations + Login Redesign

This milestone consolidates the Phase 3c/3d/3e work: RBAC overhaul with user-management CRUD scoping, PWA/service worker fixes, page/route and modal animations, a redesigned login page with hero.png, a full Indonesian-language audit, and final QA verification.

### Added
- **Role-name standardization** — All occurrences of "Pemilik Tani"/"Pemilik Petani" replaced with "Owner" across frontend and backend (TASK 1). Grep-verified zero remaining occurrences.
- **User-management CRUD scoping (TASK 2):**
  - Superadmin unrestricted
  - Government: 403 on any user with role != government (tested live)
  - Owner: 403 on users from other farms; 403 on read for other farms; single-farm Owner auto-assigns farm on farmer creation; multi-farm Owner requires explicit farm picker
  - `authController.login` now rejects login for farmer/farmer_owner with zero farm assignments (Indonesian message: "Akun Anda tidak memiliki farm yang ditugaskan. Hubungi administrator untuk mendapatkan akses farm.")
  - User list API now returns `assigned_farms_names` for Superadmin/Owner
- **Penugasan sales_access field (TASK 3):**
  - Added `sales_access: { type: Boolean, default: false }` to `FarmerAssignment` model
  - Exposed via `assignmentController` create/update/list
- **Lifecycle/Sales farmer-scoped guards (TASK 4):**
  - New `isFarmerScoped` middleware in `middleware/auth.js` checks `FarmerAssignment` for matching farm/block/crop_cycle + `sales_access` flag
  - Applied to all lifecycle routes (`/lifecycle/*`) and sales routes (`/sales/*`) via combined `isManagement || isFarmerScoped` guard
  - Verified: farmer with matching assignment gets 200; farmer without matching assignment gets 403
- **Farm master-data restriction (TASK 5):**
  - `createFarm`, `updateFarm`, `deleteFarm` in `masterDataController` now restricted to superadmin only (403 for farmer_owner)
  - Block/CropType/ActivityType remain accessible to Owner
- **UI renames (TASK 6-7):**
  - "Petani & Pengguna" → "User Manajemen" (Sidebar, App.jsx route, page title)
  - "Unit Manajemen (UM)" → "Penugasan" (Sidebar, page title)
  - Penugasan form adds `sales_access` toggle checkbox with "Akses Penjualan & Distribusi" label
- **Animations (TASK 3):**
  - Page/route fade-in (0.4s), modal scale-in (0.3s), staggered table row fade-in (`stagger-enter`), KPI card staggered slide-up (`kpi-stagger`)
  - All use existing `@keyframes` (fade-in, slide-up, scale-in) from `index.css`; respects `prefers-reduced-motion`; all under 300ms
- **Login redesign (TASK 4):**
  - Split-panel layout: left branded panel with hero.png (wired from `src/assets/hero.png`), right form panel
  - Uses app design language (emerald primary, `--ease-premium`, rounded-[2.5rem])
  - Indonesian text only; reuses validation messages
  - Auth flow unchanged (re-verified verify-redirect.js for all 4 roles)
- **Indonesian-language audit (TASK 5):**
  - LifecycleTabs status dropdowns: Pending→Tertunda, In_Progress→Sedang Berlangsung, Completed→Selesai, Cancelled→Dibatalkan
  - Farm/Block status: Active→Aktif, Inactive→Tidak Aktif
  - All user-facing text now Indonesian
- **PWA (TASK 1):**
  - Service worker updated with comment about hashed assets; `icons.svg` confirmed exists; `react.svg` deleted; `hero.png` wired into login redesign
- **Code-splitting (TASK 2):**
  - Route-level `React.lazy + Suspense` for ChatbotInsightDashboard, map pages (Govt/Farmer dashboards), all 17 MasterData/GovernmentData catalog pages (shared lazy-loading pattern)
  - Build passes; main bundle reduced from ~1.9MB to ~618KB; Chatbot (540KB), jspdf (399KB), html2canvas (199KB), LineChart (345KB) split into separate chunks
- **AuthContext timing fix:** Added 100ms delay before `fetchMe` to ensure token propagated to localStorage

### Fixed
- **Farm master-data restriction:** Owner now gets 403 on Farm endpoints; Block/CropType/ActivityType remain accessible
- **Expense flow double-submit:** SalesDistributionPage consolidated onto guarded RecordExpenseModal; deeper bug fixed (category enum was English keys rejected by backend; now Indonesian)
- **Farmer modal double-submit:** FarmerManagementPage inline modal guarded with `saving` state; deleted unused NewFarmerModal.jsx (broken roles)
- **Lifecycle modal double-submit:** All 4 inline sections in LifecycleTabs guarded with `saving` state; 3 redundant standalone modals deleted
- **Expense category default:** Fixed from "Labor"→"Bibit" accident to correct "Tenaga Kerja" (Indonesian equivalent of old Labor default)
- **AuthContext timing:** 100ms delay before fetchMe ensures token in localStorage

### Verified
- **Build:** `npm run build` passes (only chunk-size warnings)
- **verify-redirect.js:** 4 roles OK, zero bounces
- **verify-lifecycle.js:** Double-click → exactly 1 POST /api/lifecycle/land
- **verify-expense.js:** Double-click → exactly 1 POST /api/expenses (category "Tenaga Kerja")
- **verify-redirect.js:** 4 roles, zero bounces
- **verify-clickthrough.js:** 112/112 PASS (29 routes × 4 roles = 116 tests, correctly reconciled to 116)
- **/insights guard:** Farmer/farmer_owner → 403 on `/api/insights`, 200 on `/api/insights/farmer`
- **MasterData/GovernmentData Sidebar:** Two distinct sections confirmed ("Master Data" 4 items, "Government Data" 13 items)
- **ForceReauth:** Password change triggers forceReauth → login redirect with Indonesian message
- **Build:** Passes; main bundle 618KB (down from 1.9MB); Chatbot 540KB, jspdf/html2canvas/LineChart split

### Related Commits
- `f37cdf6` — Animations, Login redesign, Indonesian audit (TASK 3-5)
- `847ce2c` — TASK 0 open placement decisions (filterApi/insightApi→services, hooks→pages, contexts stay)
- `41c32e4` — TASK 4 farmer-scoped lifecycle/sales guards via isFarmerScoped
- `406fe23` — TASK 2 expense flow consolidation + farmer modal guard
- `40fda45` — TASK 1 /insights escalation: FIXED (403 on /insights, 200 on /insights/farmer)
- `4882181` — TASK 3 expense flow + farmer modal consolidation
- `79a9851` — TASK 2 Lifecycle inline modal guards + 3 redundant modals deleted
- `c62d79d` — TASK 1 farmer_owner redirect fix
- `b85f4f6` — Docs v0.12.0 + README
- `4882181` — TASK 3 expense + farmer modal
- `79a9851` — TASK 2 Lifecycle modals
- `0f15bcc` — TASK 4 component rename
- `4882181` — TASK 3 expense modal
- `483b654` — FarmerManagement migration
- `40fda45` — /insights escalation FIXED
- `747b9d6` — UMManagement migration
- `9681fd0` — GovernmentDashboard migration
- `e1d63a2` — ManagementDashboard migration
- `d358ef1` — ManagementDashboard feature
- `4882181` — TASK 3 expense modal
- `79a9851` — TASK 2 Lifecycle modals
- `f19cdd0` — TASK 4 component rename
- `c62d79d` — TASK 1 farmer_owner redirect
- `b85f4f6` — Docs v0.12.0
- `7d7bc1b` — forceReauth
- `a443887` — hardcoded dropdown fixes
- `a08bbb3` — orphan deletions
- `0325623` — API base URL standardization
- `4882181` — TASK 4 expense
- `79a9851` — TASK 2 Lifecycle modals
- `0325623` — API base URL
- `7d7bc1b` — forceReauth
- `a443887` — dropdown fixes
- `a08bbb3` — orphans
- `656043a` — docs update
- `8a7f238` — docs update
- `34b33b7` — delete Phase 3 report

---

## [v0.12.0] — 2026-08-20 — Frontend Bug-Fixing Phase

Frontend-focused fix phase (TASK 0–9) closing QA findings FE-REDIRECT, FE-9B-1, and
FE-9B-3 (frontend side), centralizing frontend auth, standardizing the API base URL,
and deleting orphaned files ahead of the Phase-2 folder restructure. Completion report:
`docs/PHASE1_COMPLETION_REPORT.md`.

### Added
- **`frontend/src/services/authService.js`** — single source of truth for frontend auth
  and API access: `API_BASE_URL` (`VITE_API_URL || '/api'`), `getToken`/`setToken`/
  `clearToken` (sole `localStorage` auth access), `authHeaders` (Bearer added only when
  a token exists), `apiFetch` (errors carry `err.status`), `login`/`fetchMe`/`logout`.
- **`frontend/src/services/ProtectedRoutes.jsx`** — `homePathFor(role)` role→home map,
  `ProtectedRoute` (roles allow-list + `LoadingScreen`), `AppRedirect` at `/`.
- **`AuthContext.forceReauth()`** — clears token + user so `ProtectedRoute` redirects to
  `/login`; used by SettingsPage after a successful password change (Indonesian message
  "Kata sandi berhasil diubah. Silakan masuk kembali.").

### Fixed
- **FE-REDIRECT** — `Login.jsx` redirected every role to `/management`; now calls
  `homePathFor(userData.role)` (government→`/government`, farmer/owner→`/farmer`,
  superadmin→`/management`). Zero intermediate bounces verified live per role.
- **FE-9B-1 (sales double-submit)** — `RecordSaleModal.jsx` rewritten as a guarded
  component (`disabled={saving}`, validation via `utils/validation`, real farm dropdown
  from props, `buyer_type` defaults to Direct) and wired into `SalesDistributionPage.jsx`;
  the unguarded inline modal and its `saleForm`/`saleErrors` state were removed.
  Double-click now creates exactly one `POST /api/sales`.
- **Hardcoded dropdown placeholders** — `LandOpeningModal`, `HarvestOpeningModal`,
  `NewCycleModal`, `RecordExpenseModal` no longer render `farm_1/farm_2/farm_3/cycle_1`
  placeholder options; all render real `farms`/`cropCycles` from props.

### Refactored
- **Auth centralization** — AuthContext, all 6 API clients (`managementApi`, `filterApi`,
  `insightApi`, `farmerDashboardApi`, `govtDashboardApi`, `chatbotInsightApi`), all 3 hooks
  (`useMasterData`, `useGenericResource`, `useManagementData`), and the pages/components
  that fetch now route through `authService` instead of ad-hoc `localStorage` access.
  `/auth/me` semantics preserved (HTTP rejection clears session; network error nulls user).
- **API base URL** — every file imports `API_BASE_URL` from `authService`; the stale
  `http://localhost:5000/api` fallback in `LifecycleTabs.jsx` removed. Cross-checked:
  `VITE_API_URL=/api`, Vite proxy `/api`→`:3000`, backend serves under `/api`.

### Removed (dead code / orphans, grep-verified)
- `frontend/src/api/dashboardApi.js` — imported nowhere; hit legacy
  `/dashboard/farmer|government` endpoints.
- `frontend/src/contexts/FilterContext.jsx` — `useFilter`/`dateRange` never consumed;
  `FilterProvider` unwrapped from App.jsx.
- `frontend/src/App.css` (unimported), `frontend/src/assets/vite.svg` (unreferenced).
- `frontend/rewrite_lifecycletabs.cjs` (one-off generator).
- `frontend/generate_pages.js` (CJS twin broke under `"type": "module"`; kept
  `generate_pages.mjs`).

### Verified
- 51/51 AUTH OK across 17 master pages × 3 roles (`testing/e2e/verify-auth.js`),
  re-run after the authService refactor with zero regressions.
- Role-aware redirects tested live per role; sales double-submit guarded; password
  change forces re-login. `npm run build` passes (chunk-size warnings only).
- FRONTEND_STRUCTURE.md corrections recorded in the report: the "useMasterData sends no
  auth header" claim and the "duplicate DataImportModal" claim are both false; the
  dashboardApi "live" entry was stale.

### Related Commits
- `e32128b` — role-aware redirect + ProtectedRoutes (TASK 2)
- `0319769` — authService centralization (TASK 3)
- `6bce2a6` — RecordSaleModal wiring (TASK 4, FE-9B-1)
- `a443887` — hardcoded dropdown fixes (TASK 5)
- `a08bbb3` — orphan deletions (TASK 6)
- `0325623` — base-URL standardization (TASK 7)
- `7d7bc1b` — forceReauth after password change (TASK 8, FE-REPLAY/FE-9B-3 frontend)

---

## [v0.11.0] — 2026-08-18 — QA & Test Infrastructure

Playwright-based automated QA for backend APIs and frontend UI, with a documented
findings ledger and reports. No production application logic changed in this milestone.

### Added
- **Playwright backend QA suite** (`testing/e2e/`) — fixtures, idempotent seeding, and
  task-scoped suites: TASK 0 (setup), TASK 1 (auth & sessions), TASK 2 (master-data CRUD),
  TASK 3 (management-dashboard KPI correctness), TASK 4 (lifecycle state machine),
  TASK 5 (farmer/user-management RBAC), TASK 6 (cross-farm isolation),
  TASK 7 (sales/expenses correctness), TASK 8 (security & abuse), TASK 9 (performance/smoke).
- **Playwright frontend UI suite** (`testing/e2e-fe/`) — FE-1..FE-5 (auth redirects, role
  dashboards, master-data UI CRUD, mobile/theme, XSS render) plus FE TASK 9b (double-click
  submit, concurrent edit, password change, CSV export scope).
- **QA documentation** — `testing/README.md`, `testing/QA_REPORT.md`, `testing/QA_REPORT_FE.md`,
  `testing/QA_FINDINGS.md` (22 findings: 18 backend + 4 frontend info-level).

### Findings (see `testing/QA_FINDINGS.md`)
- KPI-01/02, LC-01, UM-01..03, ISO-01..04, SL-01/02, SEC-01..05 (backend).
- FE-REPLAY (logout is client-side only), FE-REDIRECT (login redirect hard-coded to
  `/management`), FE-9B-1 (sales double-submit), FE-9B-3 (password change leaves old JWTs valid).

### Related Commits
- `a248a4d` — TASK 0 suite setup
- `cf4d8ab` `cdd71eb` `415847d` `a90563f` `8ab92b9` `500941e` `7bd27b1` `490199c` `986f8ac` — TASK 1–9
- `5291859` — FE-1..FE-5 frontend suite
- `a0e1bad` — FE TASK 9b + findings FE-9B-1/FE-9B-3

---

## [v0.10.0] — 2026-08-18 — Single-Entry Lifecycle Flow

Reworked lifecycle data entry so a crop cycle is created once via the "Persiapan Lahan"
(opening land) flow, then subsequent stages reference eligible cycles.

### Added
- Backend per-stage **eligibility validation** for lifecycle transitions
  (`backend/controller/lifecycleController.js`).
- **Eligible-cycles dropdown endpoint** `GET /api/lifecycle/cycles/eligible`
  (`backend/route/lifecycleRoutes.js:174`).

### Changed
- **Backend:** `POST` crop-cycle creation folded into the Persiapan Lahan single-entry flow.
- **Frontend:** `LifecycleTabs.jsx` — Penanaman/Perawatan/Panen now use a **dropdown-only
  "Siklus Tanam" selector** fed by the eligible-cycles endpoint (removes free-text cycle
  entry for later stages).

### Related Commits
- `19f8ef6` — single-entry CropCycle creation via Persiapan Lahan flow (backend)
- `30f0c13` — per-stage eligibility validation (backend)
- `5962b77` — eligible-cycles dropdown endpoint (backend)
- `943c435` — dropdown-only Siklus Tanam selector (frontend)
- `8cd73f5` — single-entry Persiapan Lahan wire-up (frontend + backend)

---

## [v0.9.0] — 2026-08-14 — Backend Restructure (Phase 2) + API Documentation (Phase 3)

Major backend reorganization from the legacy `backend/src/` tree to a feature-based
`connection/ controller/ model/ route/ nlp/ util/ scripts/ docs/` layout, a standardized
response envelope, and full OpenAPI/Swagger + Postman documentation.

### Architecture
- ⚠️ **BREAKING CHANGE:** Legacy `backend/src/` tree deleted; all routes/controllers/models
  moved to top-level feature folders (`backend/route`, `backend/controller`, `backend/model`).
- Route/controller/model triplet migration (Task 3): auth, master-data, lifecycle, sales,
  expenses, farmer-management, assignments, settings, filters, insights, dashboards,
  management-dashboard, bulk-import, chatbot-insight (14 migrations).
- Service/repository/util relocation under `backend/util/` and feature folders (Task 4).
- ⚠️ **BREAKING CHANGE:** Standardized response envelope `{ status, message, data }` plus a
  centralized error middleware (Task 5) — clients that assumed the raw shape must adapt.
- `backend/route/index.js` becomes the single mount point; `server.js` mounts it (Task 6).
- Renamed `/api/master` aggregator to `backend/route/foodSecurityDatasetsRoutes.js` (FIX 2).

### API
- **Swagger UI** at `GET /api/docs` and raw spec at `GET /api/docs.json`
  (`backend/docs/swagger.js`, Phase 3 TASK 2). Spec: **88 paths / 16 tags** (26 dataset CRUD
  paths generated from a single documented `_datasetCrud.factory.js` block).
- **Postman collection** `backend/docs/SUGIDash.postman_collection.json` — 17 folders,
  158 requests, collection-level bearer token + login test script; regenerable via
  `node docs/generate-postman.js` (Phase 3 TASK 4).
- All route files annotated with `@swagger` blocks, per-slug dataset paths (Phase 3 TASK 3).
- Endpoint-count correction across reports/README: **65 dataset endpoints + 21 app endpoints
  = 86 closed**, plus 2 docs endpoints (FIX 3, commit `aa77aaf`).

### Changed
- **Security:** `GET /dashboard/farmer/v2` authenticate guard restored (`fd6b173`);
  dashboard/govt + chatbot-insight guards aligned with README role matrix (`974a7fb`).
- **Insights:** sugi_insights models relocated to `backend/model/insights/` (Phase 3 TASK 1);
  dashboard routes split + insight endpoints guarded (Addendum A, `a74e0dd`).
- **Frontend companion patches** for guarded `/insights` and the bulk-import envelope
  (`9498205`).
- **Code quality:** ESLint + Prettier pass applied project-wide (129 files in TASK 5 diff);
  duplicate `backend/utils/validate.js` removed (TASK 4 cleanup).

### Documentation
- Phase 2 completion report (`backend/PHASE2_COMPLETION_REPORT.md`), Addendum A
  (`backend/PHASE2_PREWORK_ADDENDUM.md`), Phase 3 completion report
  (`backend/PHASE3_COMPLETION_REPORT.md`), README refresh with API Testing section
  (Phase 3 TASK 6).

### Related Commits
- `792b84e` `5ceb5fd` `39abd82` `39e2f2d` `c2ee10c` `15497a1` `6f7a8b0` `773e637` `89b3822`
  `1d0ed66` `846bea9` `87f7c8d` `b6ad37f` `70d227c` — Task 3 triplet migrations
- `d192bb1` — Task 4 service/repository/util relocation
- `35a21b4` — Task 5 envelope + error middleware
- `630caf6` — Task 6 delete `src/`
- `4ea5246` `f6dbebc` `d2b3aff` — PHASE2 report regeneration (Tasks 7/8, FIX pass, final)
- `8d3e6c8` `aa77aaf` `fd6b173` `974a7fb` `9498205` `a5c2184` — FIX pass
- `d59582d` `a74e0dd` — Addendum A
- `2cb2c8f` `7e6ed36` `52a6146` `9e74e03` `3f83b03` `31f5e76` `8e52237` — Phase 3 TASK 1–6 + report

---

## [v0.8.0] — 2026-08-13 — Backend Hardening & Phase-2 Kickoff

Security and hygiene pass on the backend, plus the scaffold for the Phase-2 restructure
that lands in v0.9.0.

### Security
- ⚠️ **BREAKING CHANGE:** Server **fails fast at startup** when `JWT_SECRET` or `MONGO_URI`
  is missing (`670f232`).
- Single source of truth for auth: `backend/middleware/auth.js` stands up, replacing logic
  duplicated across legacy `authMiddleware.js` / `rbacMiddleware.js` (`b07d35b`).
- Single DB connection module `backend/connection/db.js` replaces per-model connections
  (`b6a19f9`).

### Removed (dead code / legacy)
- Dummy-data controllers (`farmerController`, `governmentController`, `sharedController`)
  and their routes (`7fd976a`).
- Legacy dashboard endpoints + orphaned `VariasiHargaProdusen` model (`bafbcf7`).
- Retired broken unmounted `umRoutes.js` (`f411bf6`).
- Unused models (FoodInsecurity, FoodPrice, KPI) and dev generators `generate_crud.js` /
  `write_routes.js` (`b295f6a`).
- Consolidated duplicate TTL cache implementations into `backend/utils/cache.js` (`e0957d1`).

### Added
- `backend/.env.example` tracked; env/dependency hygiene on `backend/package.json`
  (`86712a8`, `c131bc8`).
- Feature-based directory scaffold `backend/controller|model|route` (Task 1, `40ae413`).
- **Generic dataset CRUD factory** `_datasetCrud.factory.js` + 13 authenticated master-data
  controllers/models/routes (Task 2, `3ba326b`).
- Phase 1 report `backend/PHASE1_REPORT.md` with the authoritative Phase-2 auth backlog
  (`c99ba0d`).

### Frontend (minor)
- BottomNav links re-routed to `/management` and `/settings`; sidebar default state and
  Login/vite tweaks (`30661ce`).
- `.gitignore` extended for docs/testing artifacts (`30661ce`).

### Related Commits
- `30661ce` `b295f6a` `f411bf6` `e0957d1` `bafbcf7` `7fd976a` `c131bc8` `86712a8`
- `b6a19f9` `b07d35b` `c99ba0d` `670f232` `40ae413` `3ba326b`

---

## [v0.7.0] — 2026-07-16 — Chatbot Insight Dashboard + NLP Pipeline

Added the AI chatbot insight feature with a full Indonesian NLP subsystem and a dedicated
knowledge-graph dashboard.

### Added
- **Backend NLP subsystem** under `backend/src/nlp/`: preprocessor, Indonesian stemmer,
  stopwords, entities (11 types), intent (12), sentiment/emotion, topics, relations,
  knowledge graph, semantic search, coverage, trends, insights, recommendations, problems,
  optimization, and the orchestrating `pipeline.js`.
- Chatbot insight controllers/services/repositories
  (`chatbotInsightController`, `chatbotInsightService`, `chatbotNlpService`,
  `chatbotAdvancedService`, `chatbotInsightRepository`, `chatbotNlpRepository`).
- `sugi_insights` DB models (`NlpResult`, `SessionSummary`) on a **separate database
  connection** (`backend/src/models/sugi_insights/`).
- `GET /api/chatbot-insight` route cluster.
- **Frontend `ChatbotInsightDashboard.jsx`** (~650 lines) with 15 insight tabs,
  `KnowledgeGraph.jsx` (Cytoscape), `InsightPanel.jsx`, `ExportModal.jsx`,
  `chatbotInsightApi.js`.
- `natural` npm dependency (NLP tokenization/stemming) added to backend.

### Integration
`ChatbotInsightDashboard → chatbotInsightApi → /api/chatbot-insight → NLP pipeline →
sugi_insights (separate Mongo DB)`

### Related Commits
- `c4333a7` — Add Chatbot Insight Dashboard

---

## [v0.6.0] — 2026-07-14 — SUGI AI Insight Integration

Wired dashboards to an external SUGI AI insight source and fixed dashboard rendering issues.

### Added
- Backend `insightController`, `FarmerInsight` / `GovernmentInsight` models,
  `insightRoutes` (`/api/insights`).
- Frontend `insightApi.js`; insight cards rendered on Farmer and Government dashboards;
  TopBar updates.
- Backend TTL cache utility (`backend/src/utils/cache.js`) for insight/dashboard data.

### Fixed
- Farmer/government dashboard controllers rewritten for correct aggregation and filtering;
  master-data models aligned; `DashboardFilterContext` fixes.

### Related Commits
- `004a7e4` — Add Insight Integration with SUGI AI
- `a3cf883` — Fix Dashboard

---

## [v0.5.0] — 2026-07-08 — Complete Farmer & Government Dashboards + Backend Restructure

Large milestone: rewrote both dashboards with a reusable component library, introduced
auth/RBAC v2, filter context, and PWA support.

### Added
- **Backend controllers:** auth, assignment, dashboard-data, farmer-dashboard,
  govt-dashboard, filter, master-data, settings, bulk-import.
- **Backend models:** `ActivityType`, `Block`, `CropType`, `FarmMaster`, `FarmerAssignment`,
  `TaskAssignment`; `User` gained role field (4 roles: superadmin/admin/farmer/government).
- `seedSuperAdmin.js`, `reset.js` scripts; `backend/src/utils/validate.js`; rbacMiddleware v2.
- **Frontend dashboard component library:** `KpiCard`, `ChartCard`, `ChartContainer`,
  `FilterBar`, `DateFilter`, `CommodityFilter`, `ProvinceFilter`, `DashboardSection`,
  `EmptyState`, `LoadingSkeleton`, `RefreshButton`, `ExportButton`, `ErrorBoundary`,
  `FormField`, `ChartDetailModal`.
- **Contexts:** `AuthContext`, `DashboardFilterContext`.
- **PWA:** `public/manifest.json` + `public/sw.js` service worker.
- Master-data pages for Farm/Block/CropType/ActivityType; `SettingsPage`.

### Changed
- `App.jsx` grew to a routed multi-role app (login → role-based landing).
- Charts (`BarChart`, `LineChart`, `PieChart`) refactored to shared components.
- Backend `server.js` rewired to new route/controller split; removed `variasiHargaProdusen`
  route/controller.

### Integration
`FarmerDashboard/GovtDashboard → dashboardApi → /api/dashboard/farmer|govt → controllers →
MongoDB`, filtered by `DashboardFilterContext` → `filterApi`.

### Related Commits
- `22713ff` — feat: complete farmer & government dashboards with backend restructure

---

## [v0.4.0] — 2026-06-03 — Documentation & Preview Images

### Added
- Preview screenshots to README: `image/login.png`, `image/farmer-dashboard.png`,
  `image/goverment-dashboard.png`, `image/lifecycle-management.png` (commit `1ff4359`,
  merged via PR #2, `ede213e`).

### Related Commits
- `1ff4359` — Add Image preview
- `ede213e` — Merge pull request #2 from dery45/dev

---

## [v0.3.0] — 2026-04-24 — Master Data Datasets + Bulk Import

Added 14 food-security dataset endpoints and pages, generated via CRUD/pages generators.

### Added
- **Backend:** 14 dataset controllers/models/routes (cadanganPanganProvinsi,
  gerakanPanganMurah, hargaKonsumenNasional/Provinsi, hargaProdusenNasional/Provinsi,
  ketidakcukupanNasional/Provinsi, konsumsiPerJenis, panganTerselamatkan,
  penyaluranDonasi, proyeksiNeraca, skorPPH, variasiHargaProdusen).
- **Bulk import:** `bulkImportController`, `bulkImportRoutes` (`/api/bulk-import`),
  frontend `DataImportModal.jsx`.
- **Frontend:** 14 generated `pages/master/*` pages, `LiveDataPage.jsx`,
  `MasterDataModal.jsx`, `useGenericResource.js` / `useMasterData.js` hooks,
  `DataTable.jsx` upgrade, `generate_pages.js`/`generate_pages.mjs` generators.
- `LifecycleTabs.jsx` rewritten (~344-line diff); IndonesiaMap updated.

### Changed
- ⚠️ **BREAKING CHANGE:** `backend/.env` removed from version control (commits `d1d382e` +
  `e6e87a1`); secrets must now be configured locally.

### Related Commits
- `1c5e9a8` — Update add backend for master data and lifecycle
- `d1d382e` `e6e87a1` — Delete backend/.env
- `7d04b84` — Merge pull request #1 from dery45/dev

---

## [v0.2.0] — 2026-03-25 — End-to-End Agricultural Management System

Backend domain models + CRUD for lifecycle/management, and matching frontend management
pages. This was the largest single diff in the project to that point.

### Added
- **Backend models:** `Activity`, `CropCycle`, `Expense`, `Farm`, `HarvestPeriod`, `KPI`,
  `LandRecord`, `Organization`, `Sale`, `UM`, `User`.
- **Backend routes:** `lifecycleRoutes`, `salesRoutes`, `expenseRoutes`, `umRoutes`,
  `farmerManagementRoutes`, `managementDashboardRoutes`, unified `routes/index.js`.
- `services/kpiService.js` (~200 lines, KPI computation), `middlewares/rbacMiddleware.js`,
  `scripts/seed.js`.
- **Frontend pages:** `ManagementDashboard.jsx`, `LifecycleManagementPage.jsx`,
  `FarmerManagementPage.jsx`, `SalesDistributionPage.jsx`, `UMManagementPage.jsx`.
- **Frontend components:** `LifecycleTabs.jsx` (~878 lines), `AlertsPanel`,
  `ComparativeChart`, `HarvestOpeningModal`, `LandOpeningModal`, `NewCycleModal`,
  `NewFarmerModal`, `RecordExpenseModal`, `RecordSaleModal`, `UMAssignmentModal`,
  `KPISection`.
- `hooks/useManagementData.js`, `api/managementApi.js`; Sidebar expanded.

### Related Commits
- `1f8b744` — Complete End-to-End Agricultural Management System with Lifecycle CRUD and
  Documentation

---

## [v0.1.0] — 2026-03-22 — Initial Project (First Commits)

First push to GitHub. Scaffolded the monorepo (`frontend/` + `backend/`) with food-security
dashboards and a master-data page.

### Added
- **Frontend:** React 19 + Vite + Tailwind + Recharts + Leaflet app with `Login.jsx`,
  `FarmerDashboard.jsx`, `GovernmentDashboard.jsx`, `MasterDataPage.jsx`, Sidebar layout,
  chart components, `src/data/allData.js` + `dataColumns.js` (dataset discovery config).
- **Backend:** Express + Mongoose server with farmer/government/shared controllers + routes,
  `FoodInsecurity`/`FoodPrice` models, and auth scaffolding.
- README with project overview.
- `.gitignore` files (`c556452`).

### Known historical debt (later cleaned up)
- `backend/node_modules/` and `backend/.env` were committed with the first commit
  (`1af4021`); removed/ignored in later milestones (v0.3.0 `.env`, v0.8.0 hygiene).

### Related Commits
- `1af4021` — first commit
- `c556452` — first commit (adds .gitignore)
- `ee4faf7` — add master data and insight card

---

## Discrepancies & Notes

- **Version numbers:** `frontend/package.json` stayed at `0.0.0` and
  `backend/package.json` at `1.0.0` throughout — neither tracks the milestones above.
  Milestone numbers are a documentation convention, not package-manifest truth.
- **Branches:** `dev` is the active development branch (HEAD `a0e1bad`). `main` is frozen
  at `ee4faf7` (2026-03-22) and does not reflect later milestones.
- **Endpoint counts:** Phase 2 report counts 86 closed endpoints (65 dataset + 21 app);
  the Phase 3 Swagger spec reports 88 paths (includes the 2 docs endpoints `/api/docs` +
  `/api/docs.json`).
- **Untracked artifacts:** `testing/e2e/t9b.spec.ts` and the generated QA reports are
  present but not committed to git.