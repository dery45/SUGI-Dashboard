# Phase 1 Report — Audit, Cleanup & Foundation (backend)

Scope: `backend/`. Phase 1 of 3. No feature-by-feature file migration was performed
(that's Phase 2). No route file was renamed or moved except where a task explicitly
deleted confirmed-dead or retired files. No response JSON shapes the frontend
depends on were changed; where a shape could have changed (Task 4/5 deletions), the
endpoints were first confirmed unused by any frontend caller.

---

## Task 1 — Remove confirmed dead code (DONE)

Deleted:

- `src/models/FoodPrice.js` — no importer anywhere (verified by repo-wide search).
- `src/models/FoodInsecurity.js` — no importer anywhere.
- `src/models/KPI.js` — no importer anywhere. (`kpiService.js`'s "KPI Error" is only
  a log string; README/frontend "KPI" hits are feature names, not the model.)
- `generate_crud.js` and `write_routes.js` (backend root) — one-shot dev generators,
  output already checked in; never referenced by code.
- Empty dirs `backend/scripts/` and `backend/src/config/` (real scripts live in
  `src/scripts/`; `config/database.js` referenced in the README does not exist).
- Verified no remaining references before deletion. No surprises.

## Task 2 — Retire umRoutes.js (DONE — retired)

Decision: **delete** `src/routes/umRoutes.js` rather than fix it.

Why:

- The Unit Management feature **is** delivered and consumed by the frontend — but
  through already-mounted, working routes that umRoutes.js merely duplicates or
  conflicts with:
  - Frontend `UMManagementPage.jsx` calls `/assignments/farmer-assignments`,
    `/farmers?role=farmer`, `/master-data/blocks`, `/master-data/farms`
    (all mounted, all work).
  - UM performance is served by `/management/um-performance` →
    `KPIService.getUMPerformance()` (mounted in `managementDashboardRoutes.js`).
- `umRoutes.js` was **never mounted** in `routes/index.js` (no `/um` entry) and no
  frontend/backend code references `/api/um` at all.
- It was internally broken: imported non-existent `isCompanyAdmin` from
  `rbacMiddleware.js`, and read `req.user._id` / `req.user.organization_id` while
  the JWT payload only contains `{ id, role, email, name }`.
- Fixing it would mean resurrecting a duplicate endpoint set the app never used.

Because Task 2 concluded its deletion, **no `isCompanyAdmin` alias was added**
(Task 8 note honored).

## Task 3 — Consolidate duplicate caches (DONE)

- `src/utils/cache.js` now ships the more-capable implementation
  (get/set/has/invalidate(pattern)/memoize) as a default-export singleton instance,
  plus named exports `Cache` and `globalCache`.
- `filterController.js` keeps `require('../utils/cache')` and its `cache.get/set`
  calls still work (module.exports IS the instance).
- `chatbotAdvancedService.js` now imports `globalCache` from `'../utils/cache'`;
  `workerQueue`/`globalMemoizer` stay in `src/nlp/optimization.js` (unchanged).
- `src/nlp/optimization.js` no longer defines/exporting Cache or globalCache.
- Runtime smoke-test passed; only the plain TTL cache was deduplicated
  (WorkerQueue and Memoizer left as-is).

## Task 4 — Legacy dashboard duplication (DONE — legacy deleted)

- Frontend search confirmed: the only dashboard consumers are `farmerDashboardApi.js`
  (`/dashboard/farmer/v2`) and `govtDashboardApi.js` (`/dashboard/govt`).
  `frontend/src/api/dashboardApi.js` (which hits `/dashboard/farmer` and
  `/dashboard/government`) has **zero importers**.
- Therefore deleted:
  - `src/controllers/dashboardDataController.js`
  - The `/farmer` and `/government` entries in `dashboardRoutes.js` (v2 kept)
  - `src/models/VariasiHargaProdusen.js` (only used by the legacy controller; no
    CRUD route; **not** in bulkImport's `modelUniqueKeys`, despite a stale README
    mention — README will need updating in Phase 2).
- No blocker: legacy endpoints were fully unreachable from the app.

## Task 5 — Dummy-data controllers (DONE — deleted)

- `farmerController.js`, `governmentController.js`, `sharedController.js` and their
  route files returned hard-coded fake data. Repo-wide search found **no** frontend
  or backend consumer of `/api/farmer/*`, `/api/government/*`, `/api/shared/*`
  (the `/farmers` calls hit DB-backed `farmerManagementRoutes`; `/farmer` and
  `/government` in the frontend are client-side route paths).
- Deleted all three controllers, their route files, and their mounts in
  `routes/index.js`.
- No ownership ambiguity: these were NOT the DB-backed farmer/government dashboards
  (those live in `farmerDashboardController.js` / `govtDashboardController.js`).

## Task 6 — Environment & dependency hygiene (DONE)

- `backend/.env` was already untracked (removed from git in commit `d1d382e`) and is
  correctly ignored by `backend/.gitignore` → no `git rm --cached` was needed.
- Added `backend/.env.example` with variable NAMES only: PORT, MONGO_URI, JWT_SECRET,
  NODE_ENV. (Root `.gitignore`'s `.env.*` was excluding it; added a negation rule
  `!backend/.env.example` so the example file is tracked.)
- Removed the unused `file_path` variable from `.env`. It was introduced in commit
  `a3cf883` as a legacy screenshot/export path (`../../client/public/`), never read
  via `process.env.file_path` anywhere in code, only echoed in README's sample env
  block. No git-history evidence of an upcoming feature needing it.
- Removed the unused `stopword` dependency from `package.json` (code uses the custom
  `src/nlp/stopwords.js`); ran `npm install` to update the lockfile. (`stopwords-iso`
  remains as a transitive dependency of `natural`.)
- Confirmed `natural` is genuinely used: `require('natural')` in
  `src/nlp/topics.js` and `src/nlp/semanticSearch.js`.
- Note: `.env`'s `.env.example`/local values intentionally left without NODE_ENV in
  the real `.env` to avoid changing server.js's production-branch behavior.

## Task 7 — connection/db.js (DONE)

- Created `backend/connection/db.js` exporting:
  - `connectMainDB()` — the previous inline `mongoose.connect(...)` from server.js.
  - `insightsConnection` + `connectInsightsDB()` — the sugi_insights
    `createConnection` moved from `src/models/sugi_insights/index.js`, keeping
    `dbName: 'sugi_insights'` reading the same `MONGO_URI`.
- `server.js` now calls `connectMainDB()` instead of connecting inline.
- `src/models/sugi_insights/index.js` is now a thin re-export of
  `insightsConnection`, so `NlpResult.js` / `SessionSummary.js` / repositories keep
  working unchanged. Verified the re-exports resolve to the same connection instance.

## Task 8 — middleware/auth.js (DONE)

- Created `backend/middleware/auth.js` as the single source of truth, exporting:
  `authenticate`, `authorize(...allowedRoles)`, `isSuperAdmin`, `isGovernment`,
  `isManagement`, `isFarmerOwner`, `isFarmer`, and `checkRole` (alias of authorize
  to preserve the old module's public surface).
- `src/middlewares/authMiddleware.js` and `src/middlewares/rbacMiddleware.js` are now
  thin re-exports pointing at `middleware/auth.js`; all existing importers keep
  working without edits.
- No `isCompanyAdmin` added (Task 2 retired umRoutes.js; nothing else needs it).

## Task 9 — Routes missing authentication (AUDIT ONLY — no code changed)

Verified against current source on the `dev` branch after all Task 1–8 changes.
The previously listed `farmerRoutes.js`, `governmentRoutes.js`, and
`sharedRoutes.js` are **no longer in the codebase** (deleted in Task 5); the legacy
`/dashboard/farmer` and `/dashboard/government` routes are gone (Task 4). The list
below is the corrected, authoritative **Phase 2 auth backlog** — Phase 2 must reduce
it to zero.

### Already authenticated (NOT in backlog)

- `authRoutes.js` — `POST /auth/login` public (by design); `GET /auth/me` uses
  `authenticate`.
- `assignmentRoutes.js` — `router.use(authenticate)` + role guards (isFarmerOwner).
- `expenseRoutes.js`, `lifecycleRoutes.js`, `managementDashboardRoutes.js`,
  `salesRoutes.js` — `router.use(authenticate)` + `isManagement` per route.
- `farmerManagementRoutes.js`, `masterDataRoutes.js`, `settingsRoutes.js` —
  `router.use(authenticate)`.
- `filterRoutes.js` — `GET /` uses `authenticate`.

### Missing authentication (Phase 2 backlog)

1. **`bulkImportRoutes.js`** — `POST /:modelName` (bulk import / upsert writes).
2. **`dashboardRoutes.js`** — `GET /farmer/v2`, `GET /govt` (both v2 endpoints).
3. **`insightRoutes.js`** — `GET /`, `GET /farmer`.
4. **`chatbotInsightRoutes.js`** — 15 endpoints:
   `/dashboard`, `/filters`, `/activity`, `/topics`, `/entities`, `/ner`,
   `POST /process`, `/intent`, `/semantic-network`, `/knowledge-graph`,
   `/recommendations`, `/problems`, `/trends`, `/coverage`, `/insights`,
   `/semantic-search`.
5. **13 generic `/master/*` dataset routes** (each exposing full CRUD, several
   unauthenticated writes):
   - `ketidakcukupanNasionalRoutes.js` (`/master/ketidakcukupan-nasional`)
   - `ketidakcukupanProvinsiRoutes.js` (`/master/ketidakcukupan-provinsi`)
   - `konsumsiPerJenisRoutes.js` (`/master/konsumsi-per-jenis`)
   - `penyaluranDonasiRoutes.js` (`/master/penyaluran-donasi`)
   - `proyeksiNeracaRoutes.js` (`/master/proyeksi-neraca`)
   - `gerakanPanganMurahRoutes.js` (`/master/gerakan-pangan-murah`)
   - `hargaKonsumenProvinsiRoutes.js` (`/master/harga-konsumen-provinsi`)
   - `hargaKonsumenNasionalRoutes.js` (`/master/harga-konsumen-nasional`)
   - `hargaProdusenNasionalRoutes.js` (`/master/harga-produsen-nasional`)
   - `hargaProdusenProvinsiRoutes.js` (`/master/harga-produsen-provinsi`)
   - `skorPPHRoutes.js` (`/master/skor-pph`)
   - `panganTerselamatkanRoutes.js` (`/master/pangan-terselamatkan`)
   - `cadanganPanganProvinsiRoutes.js` (`/master/cadangan-pangan-provinsi`)

Total: 2 dashboard + 2 insight + 1 bulk-import + 15 chatbot + 13 master = **33
endpoints across 17 route files** to be secured in Phase 2.

### Recommended role mapping for Phase 2 (proposal, not implemented)

- Master dataset routes + bulk import: `authenticate` + `isSuperAdmin`/`isGovernment`
  for writes, readable at least by government/superadmin (matches how fronts share
  these datasets).
- Chatbot insight + insights + dashboards: `authenticate` + role guard matching the
  UI gating in `BACKEND_STRUCTURE.md` (farmer vs government dashboards are separate).
- Final mapping to be decided with the product owner during Phase 2 route migration.

---

## Cross-cutting constraints honored

- No response JSON shape used by the frontend was changed.
- Commits are one per numbered task (8 functional commits in this phase + 1 follow-up
  commit for `.env.example` tracking).
- Items flagged for Phase 2 follow-through: README's stale model list / env block and
  route table (mentions `VariasiHargaProdusen`, `file_path`, removed endpoints); and
  `frontend/src/api/dashboardApi.js` remains checked-in but unused.
