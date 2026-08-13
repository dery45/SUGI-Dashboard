# Phase 2 Completion Report — Feature-Based Migration & JWT Enforcement (backend)

Phase 2 of 3. Scope: `backend/` (plus the two frontend companion patches
required to keep the Demo working when envelopes gained Auth + a `success`
wrapper).

**STATUS: COMPLETE.** Tasks 0–8 of the Phase 2 brief are executed and
smoke-verified on `dev`, plus a **FIX pass** (`8d3e6c8` FIX 2,
`974a7fb` guards, `aa77aaf` FIX 3, `9498205` companion, orphan cleanup):
final file-naming convention applied uniformly, `/api/master` aggregator
renamed, endpoint counts corrected, `dashboard/govt` + chatbot-insight guards
aligned with README roles. All legacy feature code has been relocated out of
`src/`, services/repositories live under `nlp/`, the response envelope is
standardized, a centralized error handler is wired, every non-public endpoint
carries `authenticate`, and old-`src/` has been deleted. Commits referenced
below are on `dev`.

---

## 0. TASK 0 RESOLUTION — every Phase 1 corrections item

All six Phase 1 open items resolved (see `PHASE2_PREWORK_ADDENDUM.md` for the
full pre-work detail).

| # | Item | Status |
|---|---|---|
| 1 | Unit Management decision + evidence | **DONE** — `umRoutes.js` stays deleted; `UMAssignmentModal.jsx` orphan deferred to Phase 3 |
| 2 | Shim integrity | **DONE** — `src/middlewares/` re-exported real `middleware/auth.js` guards (shims later deleted with `src/`) |
| 3 | Recomputed auth backlog total | **DONE** — 86 endpoints (73 original + 13 new `GET /:id` from the dataset factory) lacked auth; all closed (see §3) |
| 4 | v2 dashboard smoke test | **DONE** — `/api/dashboard/farmer/v2` and `/api/dashboard/govt` re-verified 200 after migration |
| 5 | `file_path` status | **DONE** — deleted from `.env`, absent from `.env.example`, never read |
| 6 | Credential rotation status | **TESTS DONE / HUMAN ACTION ITEM OPEN** — rotation confirmed at git level; owner must revoke leaked provider values |

Task 0 hardening (commit `670f232`) is unchanged and still verified: fail-fast
on missing `MONGO_URI` / `JWT_SECRET`, and `JWT_SECRET` exported from
`middleware/auth.js` (single source of truth — login works, verified end-to-end).

---

## 1. FOLDER MIGRATION MAP — old path → new path

**STATUS: DONE — `src/` deleted in Task 6 (commit `630caf6`).**

Every former `src/*` file moved to its feature triplet; nothing in the mounted
graph imports `src/` (import-sweep ran immediately before deletion).

| Feature | Controller | Route | Model |
|---|---|---|---|
| auth | `controller/authController.js` | `route/authRoutes.js` | `model/User.js` |
| farmer management | `controller/farmerManagementController.js` | `route/farmerManagementRoutes.js` | (reuses `model/User.js`) |
| master data (ops) | `controller/masterDataController.js` | `route/masterDataFeatureRoutes.js` | `model/{FarmMaster,Block,CropType,ActivityType}.js` |
| lifecycle | `controller/lifecycleController.js` | `route/lifecycleRoutes.js` | `model/{LandRecord,CropCycle,Activity,HarvestPeriod}.js` |
| sales | `controller/salesController.js` | `route/salesRoutes.js` | `model/Sale.js` |
| expenses | `controller/expenseController.js` | `route/expenseRoutes.js` | `model/Expense.js` |
| assignments | `controller/assignmentController.js` | `route/assignmentRoutes.js` | `model/{FarmerAssignment,TaskAssignment}.js` |
| settings | `controller/settingsController.js` | `route/settingsRoutes.js` | (reuses `model/User.js`) |
| filters | `controller/filterController.js` | `route/filterRoutes.js` | (reuses 13 dataset models) |
| insights | `controller/insightController.js` | `route/insightRoutes.js` | `model/{GovernmentInsight,FarmerInsight}.js` |
| dashboard govt | `controller/govtDashboardController.js` | `route/dashboardRoutes.js` | multi-model aggregator |
| dashboard farmer v2 | `controller/farmerDashboardController.js` | `route/dashboardRoutes.js` | multi-model aggregator |
| management dashboard | `controller/managementDashboardController.js` | `route/managementDashboardRoutes.js` | `model/UM.js` (+ FarmMaster…, kpiService folded) |
| bulk import | `controller/bulkImportController.js` | `route/bulkImportRoutes.js` | reuses 13 dataset models |
| chatbot insight | `controller/chatbotInsightController.js` | `route/chatbotInsightRoutes.js` | `model/sugi_insights/*` |

Non-feature moves:

| Former | Target | Note |
|---|---|---|
| `src/nlp/*` (17 algorithm modules) | `nlp/*` | pipeline.js requires updated to `./repository` + `../model` |
| `src/services/{chatbotAdvanced,chatbotInsight,chatbotNlp}Service.js` | `nlp/service/` | cache dep now `../../util/cache` |
| `src/repositories/{chatbotInsight,chatbotNlp}Repository.js` | `nlp/repository/` | model deps now `../../model/sugi_insights/*` |
| `src/services/kpiService.js` | **folded** into `controller/managementDashboardController.js` | single-use; no longer a separate module |
| `src/models/sugi_insights/*` | `model/sugi_insights/*` | connection re-export path fixed |
| `src/utils/{validate,cache}.js` | `util/` | shared utilities |
| `src/scripts/{seed,reset,seedSuperAdmin}.js` | `scripts/` | deps → `../model/*`; `package.json` seed/reset paths updated |
| `src/routes/index.js` (aggregator) | `route/index.js` | server.js mounts `./route/index` |

Task 3 feature commits (one per feature): `792b84e` auth · `5ceb5fd`
farmer-management · `39abd82` master-data · `39e2f2d` lifecycle · `c2ee10c`
sales · `15497a1` expenses · `6f7a8b0` assignments · `773e637` settings ·
`89b3822` filters · `1d0ed66` insights · `846bea9` dashboards ·
`87f7c8d` management-dashboard · `b6ad37f` bulk-import · `70d227c`
chatbot-insight + NLP relocation.

---

## 2. FEATURE TRIPLET INVENTORY

**STATUS: DONE — all 14 remaining features relocated; 13 dataset features
already migrated in Task 2.**

1-feature-1-triplet holds everywhere except the **dataset CRUD factory**
(shared exception, documented §2 of the prior report): the 13 dataset features
are thin triplets over `controller/_datasetCrud.factory.js` +
`route/_datasetCrud.factory.js`, mounted by `route/foodSecurityDatasetsRoutes.js`
at `/api/master <slug>`.

**FIX 1 (final naming convention):** controllers `controller/<camelCase>Controller.js`,
routes `route/<camelCase>Routes.js`, models `model/<PascalCase>.js`. Retro-verified
across all 27 triplets (14 features + 13 datasets) and the 30 models — already
uniform, no renames needed.

**FIX 2 (name-space cleanup):** the `/api/master` 13-dataset aggregator moved out
of the `masterData` name space to `route/foodSecurityDatasetsRoutes.js`;
`route/masterDataFeatureRoutes.js` reclaimed the natural name
`route/masterDataRoutes.js` for the ops master-data feature. `/api/master/*` and
`/api/master-data/*` URLs unchanged.

All new `model/*.js` use idempotent registration
(`mongoose.models.X || mongoose.model('X', schema)`); the two
`model/sugi_insights/*` models register on the dedicated `insightsConnection`.

---

## 3. AUTH BACKLOG CLOSURE — endpoint-by-endpoint confirmation

**STATUS: COMPLETE — 86/86 endpoints closed (excluding the intentionally public
`POST /api/auth/login`).**

### Task-2 closures (13 dataset features, commit `3ba326b`)

All five verbs of `/api/master/<slug>` (POST, GET list, GET `/:id`, PUT, DELETE)
→ `authenticate` + `isGovernment` = 13 × 5 = **65 dataset endpoints**.
Guard-ambiguity flag (retained): the dataset set defaulted to `isGovernment`
`['superadmin','government']` per the frontend route roles; `farmer_owner`
write access was NOT granted.

### Task-3 closures (21 endpoints)

| Feature | Guard applied | FLAG |
|---|---|---|
| bulk-import `POST /:modelName` | `authenticate` + `isGovernment` | restrictive default (legacy had none) |
| dashboard `GET /farmer/v2` | `authenticate` (README `/farmer` = All authenticated) | legacy had none → now 401 no-token |
| dashboard `GET /govt` | `authenticate` + `isGovernment` (README `/government` = superadmin, government) | **FIX** — was authenticate-only; owner now 403 |
| insights `GET /insights`, `GET /insights/farmer` | `authenticate` (+ role) | legacy had none → now 401 no-token |
| chatbot-insight (16 routes) | `authenticate` + `isGovernment` (README `/chatbot-insight` = superadmin, government) | **FIX** — was authenticate-only; owner now 403; all 16 verified 200 with govt token, 401 without |

Phase-1 routes (assignments, expenses, lifecycle, management, sales, farmers,
master-data, settings, filters) retained `authenticate` + their existing role
guards, now sourced from real `middleware/auth.js` (the `src/middlewares/`
shims are deleted).

### Preserved quirks (flagged, deliberately kept)

- `route/masterDataRoutes.js` keeps `authenticate` only (no role guard) on the
  ops master-data feature — owner farm-scoping retained.
- Assignments: government may list (authenticate-only), retained.
- Lifecycle POST `createdBy` used `req.user._id` while `authenticate` sets
  `req.user.id` — **FIXED in Task 5** (see §5).

---

## 4. RESPONSE ENVELOPE & ERROR HANDLING

**STATUS: COMPLETE (Task 5, commit `35a21b4`).**

Canonical envelope (matches the dataset factory from Task 2):

- List: `{ success: true, data, total, page, totalPages }` (meta tolerated)
- Single: `{ success: true, data }`
- Create: `201 { success: true, data }`
- Update: `{ success: true, data }`
- Delete: `{ success: true }`
- Validation: `400 { success: false, message: 'Validasi gagal', errors }`
- 404: `{ success: false, message: 'Data tidak ditemukan' }`
- 5xx: `{ success: false, error: <message> }`

Applied where legacy shapes deviated:

- `lifecycleController` — bare arrays/records/`{error}` → wrapped; create now
  `201`; all responses carry `success`.
- `filterController` — bare `{years,months,commodities,provinces}` →
  `{ success: true, data: {…} }`; error → `{ success: false, error }`.
- `bulkImportController` — added `success` to success + all 400/500 bodies.
- Auth/dashboard/insight/chatbot/master/sales/expense/settings/assignment/
  farmer controllers already emitted `success` + `data`/`message`/`error` and
  were left wire-compatible.

**Frontend companion patches** (the documented envelope-aware client changes):
`useMasterData.js` already unwraps (`result?.data ?? []`); Task 5 →
`api/filterApi.js` now returns `json.data ?? json` so `DashboardFilterContext`
keeps reading `data.years/commodities/provinces`; FIX pass → `api/insightApi.js`
gained a Bearer header (its `/insights` calls were otherwise 401 after the
authenticate guard) and `DataImportModal.jsx` now reads `message || error`
from the bulk-import envelope.

**Centralized error middleware** (new `middleware/errorHandler.js`, wired in
`server.js` after `/api` mounts): unknown `/api/*` → `404 { success:false,
message:'Endpoint tidak ditemukan' }`; unhandled errors → `5xx { success:false,
error }`. Verified: `GET /api/nonexistent-xyz → 404` envelope.

**Documented tolerance:** error text historically lives in `message` (most 4xx)
or `error` (5xx / sales / expense / management / factory). Both keys are read by
the frontend clients (`managementApi` reads `message || error`; dashboard/
chatbot/insight clients read `message`). Task 5 did not rename existing keys to
avoid degrading UI error display; the invariant (every response has `success`,
successes carry `data`) is enforced.

---

## 5. SERVICES / REPOSITORIES / KPI SERVICE — EXECUTED DECISION

**STATUS: DONE (Task 3 chatbot commit `70d227c` + Task 4 commit `d192bb1`).**

- `chatbotAdvancedService.js`, `chatbotInsightService.js`, `chatbotNlpService.js`
  → **`nlp/service/`** (NLP-domain logic colocated with `nlp/*`).
- `chatbotInsightRepository.js`, `chatbotNlpRepository.js` → **`nlp/repository/`**.
- `kpiService.js` → **folded into `controller/managementDashboardController.js`**
  (final single choice: controller; the old module is deleted).
- Dead `src/services|repositories|utils|nlp` copies removed (Task 4). All 16
  chatbot-insight endpoints re-verified 200 after move.

---

## 6. OLD DIRECTORIES REMOVED

**STATUS: DONE (Task 6, commit `630caf6`).**

`backend/src/` does not exist. Deleted: `src/routes`, `src/controllers`,
`src/models`, `src/middlewares`, `src/services`, `src/repositories`,
`src/utils`, `src/nlp`, `src/scripts`. Import-sweep immediately before deletion:
**zero `require` of `src/`** in the mounted tree (server.js → `route/index.js` →
`route/*` → `controller|middleware|model|nlp|util`). Scripts relocated to
`backend/scripts/` with `../model/*` deps; `package.json` `seed`/`reset` paths
updated (`node --check` passed on all three scripts).

---

## 7. REGRESSION CHECK — per-role login + representative calls

**STATUS: COMPLETE.** Final sweep run after the last Task-6 deletion of `src/`
(superadmin / government / farmer_owner / management-403 / auth-failures).

| Role | Representative calls | Result |
|---|---|---|
| `superadmin` | auth/me, farmers, master-data/farms, master/skor-pph, lifecycle/plantings, sales, expenses, assignments, settings/profile, filters, insights, management/kpi, chatbot-insight/insights | all 200 |
| `government` | dashboard/govt 200; management/kpi → **403** (expected `isManagement` excludes); master/dataset read 200; chatbot-insight/insights 200 | ✓ |
| `farmer_owner` | dashboard/farmer/v2 200; dashboard/govt → **403** (isGovernment); chatbot-insight/insights → **403** (isGovernment) | ✓ |
| no token | chatbot-insight, dashboard, insights, bulk-import → **401** | ✓ |
| mis-cased path | `/api/nonexistent-xyz` → **404** envelope | ✓ |

Envelope spot-checks: `settings/profile` `{success,data}`; `PUT
settings/profile {phone}` → **200** (previously 500 — `isPhone` now exported);
`filters` `{success,data:{years,…}}`; lifecycle lists `{success,true,data:[…]}`;
bulk-import empty → `400 {success:false,message}`; lifecycle POST `createdBy`
populated (the `req.user.id` fix); DELETE → `{success:true}`; chatbot-insight 15
GETs all `success=true`; semantic-search `?q=harga` 200.

---

## 8. OUTSTANDING ITEMS — deferred to Phase 3 or human review

1. **Credential rotation (HUMAN ACTION ITEM):** confirm leaked historical
   `MONGO_URI` password `f392wbfmUsSn1QfF` and `JWT_SECRET=supersecret` are
   revoked at the provider level. Phase 2 commits no `.env` value.
2. **Frontend companion cleanup (FIX pass):** orphan
   `frontend/src/components/management/UMAssignmentModal.jsx` **removed** (dead
   code — Unit Management stayed deleted in Task 0).
3. **Dev-only scripts:** `scripts/seed.js`/`reset.js`/`seedSuperAdmin.js` retain
   `mongodb://localhost:27017/sugi-dashboard-demo` fallbacks for local dev
   (runtime paths are hardened; non-blocking). Orphan root-level `_check_bulan.js`
   **removed** in the FIX pass.
4. **Envelope alias tolerance:** `message`/`error` dual-key convention (§4) is a
   documented pragmatic standard, not a one-key canon; revisit if the frontend
   migrates to a single error key.
5. **Flagged design decisions kept:** master-data ops feature is
   `authenticate`-only (owner farm scoping is the guard); assignments allow
   government read; `isGovernment` restricts the 13 government datasets to
   `superadmin|government` (farmer_owner write access can be added deliberately
   if a business need appears).
6. **Docs:** this report supersedes the PARTIAL version for Phase 2 status;
   `PHASE1_COMPLETION_REPORT.md` and `PHASE2_PREWORK_ADDENDUM.md` remain as
   historical records of Phase 1 + pre-work.