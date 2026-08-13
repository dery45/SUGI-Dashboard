# Phase 2 Completion Report — Feature-Based Migration & JWT Enforcement (backend)

**FINAL** (supersedes the partial Phase 2 report). Phase 2 of 3. Scope: `backend/`
plus every frontend companion patch required to keep the Demo working once
envelopes gained Auth and a `success` wrapper.

**STATUS: COMPLETE.** Tasks 0–8 of the Phase 2 brief are executed and
smoke-verified on `dev` (branch is 37 commits ahead of `origin/dev`), including a
FIX pass (FIX 1 naming convention, FIX 2 `masterDataRoutes.js` collision, FIX 3
endpoint counts) and one regression caught during this final pass
(`GET /dashboard/farmer/v2` briefly lost its guard; restored — commit `fd6b173`).

All legacy feature code has been relocated out of `src/`, services/repositories
live under `nlp/`, the response envelope is standardized, a centralized error
handler is wired, every non-public endpoint carries `authenticate` (with the
documented role guard), and old-`src/` has been deleted.

---

## 0. FIXES CONFIRMED

### FIX 1 — Final file-naming convention (adopted + verified)

Chosen convention (single, applied to every triplet in `controller/`, `route/`,
`model/`):

| Layer | Pattern | Example |
|---|---|---|
| Controller | `controller/<feature>Controller.js` (camelCase) | `controller/govtDashboardController.js` |
| Route | `route/<feature>Routes.js` (camelCase) | `route/govtDashboardRoutes.js` |
| Model | `model/<Model>.js` (PascalCase) | `model/GovernmentInsight.js` |

**Confirmation for the 13 dataset triplets:** the 13 dataset feature files were
created in Task 2 (commit `3ba326b`) already conforming to this convention —
`controller/<slug>Controller.js`, `route/<slug>Routes.js`, `model/<PascalCase>.js`
(e.g. `cadanganPanganProvinsiController.js` / `cadanganPanganProvinsiRoutes.js` /
`CadanganPanganProvinsi.js`). A FIX-pass sweep verified **all 27 triplets**
(14 features + 13 datasets) and all 30 models match; no retroactive renames were
required for the dataset set. The only files that needed renaming were the two
`masterData`-prefixed routers (FIX 2 below) and the orphan
`backend/utils/validate.js` (duplicate of `util/validate.js`) which was deleted.

### FIX 2 — `masterDataRoutes.js` collision resolved

Pre-fix, two routers collided: `route/masterDataRoutes.js` (the `/api/master`
13-dataset aggregator) and `route/masterDataFeatureRoutes.js` (the ops
master-data feature). Resolution (commit `8d3e6c8`):

| Before | After | Mounted at |
|---|---|---|
| `route/masterDataRoutes.js` (aggregator) | `route/foodSecurityDatasetsRoutes.js` | `/api/master/*` (URL unchanged) |
| `route/masterDataFeatureRoutes.js` (ops) | `route/masterDataRoutes.js` (reclaimed natural name) | `/api/master-data/*` (URL unchanged) |

`server.js` and `route/index.js` requires updated; `/api/master/*` and
`/api/master-data/*` URLs verified unchanged end-to-end.

### FIX 3 — Corrected endpoint totals

The Task 2 CRUD factory exposes **5 verbs per dataset** (POST, GET list,
GET `/:id`, PUT `/:id`, DELETE `/:id`), not 4:

- **Dataset-closed endpoints:** 13 datasets × 5 = **65** (previously mis-stated
  as 52).
- **App endpoints closed in Task 3:** 21 (bulk-import 1, dashboard 2, insights 2,
  chatbot-insight 16).
- **True total:** **86 endpoints** = 73 original + 13 new `GET /:id` handlers the
  factory added in Task 2. Closure count: **86/86 closed** (excluding the
  intentionally public `POST /api/auth/login`).
- Corrected in `PHASE2_PREWORK_ADDENDUM.md`, this report, and the README dataset
  table (commit `aa77aaf`).

---

## 1. FOLDER MIGRATION MAP — old path → new path (complete)

Pre-migration tree read from git (`3ba326b^`: `backend/src/` held 115 files, and
`controller/`/`route/`/`model/` were empty except `.gitkeep`). Every file is
accounted for below.

### Controllers — `src/controllers/*` → `controller/*`

| Old (`src/controllers/`) | New | Notes |
|---|---|---|
| `assignmentController.js` | `controller/assignmentController.js` | 1:1 |
| `authController.js` | `controller/authController.js` | 1:1 |
| `bulkImportController.js` | `controller/bulkImportController.js` | 1:1 |
| `cadanganPanganProvinsiController.js` | `controller/cadanganPanganProvinsiController.js` | 1:1 (dataset) |
| `chatbotInsightController.js` | `controller/chatbotInsightController.js` | 1:1 |
| `farmerDashboardController.js` | `controller/farmerDashboardController.js` | 1:1 |
| `filterController.js` | `controller/filterController.js` | 1:1 |
| `gerakanPanganMurahController.js` | `controller/gerakanPanganMurahController.js` | 1:1 (dataset) |
| `govtDashboardController.js` | `controller/govtDashboardController.js` | 1:1 |
| `hargaKonsumenNasionalController.js` | `controller/hargaKonsumenNasionalController.js` | 1:1 (dataset) |
| `hargaKonsumenProvinsiController.js` | `controller/hargaKonsumenProvinsiController.js` | 1:1 (dataset) |
| `hargaProdusenNasionalController.js` | `controller/hargaProdusenNasionalController.js` | 1:1 (dataset) |
| `hargaProdusenProvinsiController.js` | `controller/hargaProdusenProvinsiController.js` | 1:1 (dataset) |
| `insightController.js` | `controller/insightController.js` | 1:1 |
| `ketidakcukupanNasionalController.js` | `controller/ketidakcukupanNasionalController.js` | 1:1 (dataset) |
| `ketidakcukupanProvinsiController.js` | `controller/ketidakcukupanProvinsiController.js` | 1:1 (dataset) |
| `konsumsiPerJenisController.js` | `controller/konsumsiPerJenisController.js` | 1:1 (dataset) |
| `masterDataController.js` | `controller/masterDataController.js` | 1:1 (ops) |
| `panganTerselamatkanController.js` | `controller/panganTerselamatkanController.js` | 1:1 (dataset) |
| `penyaluranDonasiController.js` | `controller/penyaluranDonasiController.js` | 1:1 (dataset) |
| `proyeksiNeracaController.js` | `controller/proyeksiNeracaController.js` | 1:1 (dataset) |
| `settingsController.js` | `controller/settingsController.js` | 1:1 |
| `skorPPHController.js` | `controller/skorPPHController.js` | 1:1 (dataset) |

### Controllers extracted from inline route files (Task 3)

These features had their handler logic **inline in `src/routes/*.js`** (no
`src/controllers/` file existed). Task 3 extracted them to a proper controller:

| Old location (inline handlers) | New controller | New route |
|---|---|---|
| `src/routes/lifecycleRoutes.js` (202 lines) | `controller/lifecycleController.js` | `route/lifecycleRoutes.js` (thin) |
| `src/routes/salesRoutes.js` (102 lines) | `controller/salesController.js` | `route/salesRoutes.js` (thin) |
| `src/routes/expenseRoutes.js` (89 lines) | `controller/expenseController.js` | `route/expenseRoutes.js` (thin) |
| `src/routes/farmerManagementRoutes.js` (157 lines) | `controller/farmerManagementController.js` | `route/farmerManagementRoutes.js` (thin) |
| `src/routes/managementDashboardRoutes.js` (35 lines) | `controller/managementDashboardController.js` (+ `kpiService` folded in) | `route/managementDashboardRoutes.js` (thin) |

### Routes — `src/routes/*` → `route/*`

All 1:1 name-preserving moves (`assignmentRoutes`, `authRoutes`,
`bulkImportRoutes`, `chatbotInsightRoutes`, `dashboardRoutes`, `expenseRoutes`,
`farmerManagementRoutes`, `filterRoutes`, `gerakanPanganMurahRoutes`,
`hargaKonsumen*`, `hargaProdusen*`, `insightRoutes`, `ketidakcukupan*`,
`konsumsiPerJenisRoutes`, `lifecycleRoutes`, `managementDashboardRoutes`,
`panganTerselamatkanRoutes`, `penyaluranDonasiRoutes`, `proyeksiNeracaRoutes`,
`salesRoutes`, `settingsRoutes`, `skorPPHRoutes`, `cadanganPanganProvinsiRoutes`,
13 dataset routers) **except**:

| Old (`src/routes/`) | New | Notes |
|---|---|---|
| `index.js` | `route/index.js` | aggregator re-wired in `server.js` |
| `masterDataRoutes.js` (ops: farms/blocks/crop-types/activity-types) | `route/masterDataRoutes.js` | reclaimed natural name via FIX 2 |
| *(new in Task 2)* | `route/foodSecurityDatasetsRoutes.js` | `/api/master` 13-dataset aggregator |
| *(new in Task 2)* | `route/_datasetCrud.factory.js` | shared CRUD factory |

### Models — `src/models/*` → `model/*`

All 1:1, PascalCase preserved: `Activity`, `ActivityType`, `Block`,
`CadanganPanganProvinsi`, `CropCycle`, `CropType`, `Expense`, `Farm`,
`FarmMaster`, `FarmerAssignment`, `FarmerInsight`, `GerakanPanganMurah`,
`GovernmentInsight`, `HargaKonsumenNasional`, `HargaKonsumenProvinsi`,
`HargaProdusenNasional`, `HargaProdusenProvinsi`, `HarvestPeriod`,
`KetidakcukupanNasional`, `KetidakcukupanProvinsi`, `KonsumsiPerJenis`,
`LandRecord`, `PanganTerselamatkan`, `PenyaluranDonasi`, `ProyeksiNeraca`,
`Sale`, `SkorPPH`, `TaskAssignment`, `UM`, `User`.

- `Organization.js` existed in `src/models/` but is **not imported by any
  mounted module** — it was not carried over (dead model; flagged §9).
- `model/sugi_insights/{NlpResult,SessionSummary}.js` re-export the dedicated
  `insightsConnection` via `model/sugi_insights/index.js` (reads
  `connection/db.js`), preserving the isolated `sugi_insights` database.

### Middleware — `src/middlewares/*` → `middleware/`

| Old | New | Notes |
|---|---|---|
| `src/middlewares/authMiddleware.js` | `middleware/auth.js` (the real one) | shim was a re-export; consolidated to single source |
| `src/middlewares/rbacMiddleware.js` | `middleware/auth.js` | `checkRole, isSuperAdmin, isGovernment, isManagement, isFarmerOwner, isFarmer` all live in `middleware/auth.js` |

### NLP — `src/nlp/*` → `nlp/*`

17 modules moved 1:1 (`coverage`, `entities`, `insights`, `intent`,
`knowledgeGraph`, `optimization`, `pipeline`, `preprocessor`, `problems`,
`recommendations`, `relations`, `semanticSearch`, `sentiment`, `stemmer`,
`stopwords`, `topics`, `trends`). `pipeline.js` deps re-pointed to
`./repository` + `../model`.

### Services / Repositories / Utils / Scripts

| Old | New | Notes |
|---|---|---|
| `src/services/chatbotAdvancedService.js` | `nlp/service/chatbotAdvancedService.js` | cache dep → `../../util/cache` |
| `src/services/chatbotInsightService.js` | `nlp/service/chatbotInsightService.js` | |
| `src/services/chatbotNlpService.js` | `nlp/service/chatbotNlpService.js` | |
| `src/services/kpiService.js` | **folded** into `controller/managementDashboardController.js` | Task 4 decision; module deleted |
| `src/repositories/chatbotInsightRepository.js` | `nlp/repository/chatbotInsightRepository.js` | model deps → `../../model/sugi_insights/*` |
| `src/repositories/chatbotNlpRepository.js` | `nlp/repository/chatbotNlpRepository.js` | |
| `src/utils/validate.js` | `util/validate.js` | `isPhone` added (Task 5) |
| `src/utils/cache.js` | `util/cache.js` | |
| *(orphan duplicate)* | — | `backend/utils/validate.js` deleted (FIX pass) |
| `src/scripts/{seed,reset,seedSuperAdmin}.js` | `scripts/` | deps → `../model/*`; `package.json` paths updated |

---

## 2. FEATURE TRIPLET INVENTORY

**STATUS: DONE — 1-feature-1-triplet confirmed for all 14 features + 13 dataset
features (27 triplets), one consistent naming convention (§0 FIX 1).**

| Feature | Controller | Route | Model |
|---|---|---|---|
| auth | `controller/authController.js` | `route/authRoutes.js` | `model/User.js` |
| farmer management | `controller/farmerManagementController.js` | `route/farmerManagementRoutes.js` | (reuses `model/User.js`) |
| master data (ops) | `controller/masterDataController.js` | `route/masterDataRoutes.js` | `model/{FarmMaster,Block,CropType,ActivityType}.js` |
| lifecycle | `controller/lifecycleController.js` | `route/lifecycleRoutes.js` | `model/{LandRecord,CropCycle,Activity,HarvestPeriod}.js` |
| sales | `controller/salesController.js` | `route/salesRoutes.js` | `model/Sale.js` |
| expenses | `controller/expenseController.js` | `route/expenseRoutes.js` | `model/Expense.js` |
| assignments | `controller/assignmentController.js` | `route/assignmentRoutes.js` | `model/{FarmerAssignment,TaskAssignment}.js` |
| settings | `controller/settingsController.js` | `route/settingsRoutes.js` | (reuses `model/User.js`) |
| filters | `controller/filterController.js` | `route/filterRoutes.js` | (reuses 13 dataset models) |
| insights | `controller/insightController.js` | `route/insightRoutes.js` | `model/{GovernmentInsight,FarmerInsight}.js` |
| dashboard farmer v2 | `controller/farmerDashboardController.js` | `route/dashboardRoutes.js` | multi-model aggregator |
| dashboard govt | `controller/govtDashboardController.js` | `route/dashboardRoutes.js` | multi-model aggregator |
| management dashboard | `controller/managementDashboardController.js` | `route/managementDashboardRoutes.js` | `model/UM.js` (+ FarmMaster…; kpiService folded) |
| bulk import | `controller/bulkImportController.js` | `route/bulkImportRoutes.js` | reuses 13 dataset models |
| chatbot insight | `controller/chatbotInsightController.js` | `route/chatbotInsightRoutes.js` | `model/sugi_insights/*` |

**13 dataset features** (`ketidakcukupan-nasional`, `ketidakcukupan-provinsi`,
`konsumsi-per-jenis`, `penyaluran-donasi`, `proyeksi-neraca`,
`gerakan-pangan-murah`, `harga-konsumen-provinsi`, `harga-konsumen-nasional`,
`harga-produsen-nasional`, `harga-produsen-provinsi`, `skor-pph`,
`pangan-terselamatkan`, `cadangan-pangan-provinsi`): each is a thin triplet over
`controller/_datasetCrud.factory.js` + `route/_datasetCrud.factory.js`, mounted
by `route/foodSecurityDatasetsRoutes.js` at `/api/master/<slug>`. Model names
match PascalCase (§0 FIX 1).

All `model/*.js` use idempotent registration
(`mongoose.models.X || mongoose.model('X', schema)`); the two
`model/sugi_insights/*` models register on the dedicated `insightsConnection`.

---

## 3. AUTH BACKLOG CLOSURE — corrected backlog, closed to zero

**STATUS: COMPLETE — 86/86 endpoints closed** (65 dataset + 21 app), excluding
the intentionally public `POST /api/auth/login`.

**Guard source legend:** **R** = README Frontend Routes table · **B** =
`BACKEND_STRUCTURE.md` · **both** = both agree.

### Dataset endpoints (Task 2) — 65 endpoints

| Routes | Verbs | Guard | Source |
|---|---|---|---|
| `/api/master/<slug>` ×13 | POST, GET list, GET `/:id`, PUT `/:id`, DELETE `/:id` | `authenticate` + `isGovernment` (`superadmin`,`government`) | **R** (`/data/*` = superadmin, government) |

Flag (retained): dataset set defaulted to `isGovernment`; `farmer_owner` write
access was NOT granted (can be added deliberately — §9).

### App endpoints (Task 3) — 21 endpoints

| Feature | Endpoints | Guard | Source |
|---|---|---|---|
| bulk-import | `POST /api/bulk-import/:modelName` | `authenticate` + `isGovernment` | **R** (`/data/*`); consistent with datasets it writes |
| dashboard | `GET /api/dashboard/farmer/v2` | `authenticate` | **R** (`/farmer` = All authenticated) |
| dashboard | `GET /api/dashboard/govt` | `authenticate` + `isGovernment` | **R** (`/government` = superadmin, government) |
| insights | `GET /api/insights`, `GET /api/insights/farmer` | `authenticate` | **R** (fed to all-authenticated dashboards); restrictive default |
| chatbot-insight | 16 routes (`/dashboard` … `/semantic-search`, `POST /process`) | `authenticate` + `isGovernment` | **R** (`/chatbot-insight` = superadmin, government) |

### Phase-1 routes — retained guards, now from real `middleware/auth.js`

| Feature | Guard | Source |
|---|---|---|
| auth `/me` | `authenticate` | **B** (JWT auth) |
| farmers (farmer management) | `authenticate` (router) + inline role checks | **B** |
| master-data (ops) | `authenticate` (owner farm-scoping inline) | **B** |
| lifecycle | `authenticate` + `isManagement` | **R** (`/management/*`) |
| sales | `authenticate` + `isManagement` | **R** (`/management/sales`) |
| expenses | `authenticate` + `isManagement` | **R** (`/management` family) |
| assignments | `authenticate` router; mutations `isFarmerOwner`; GETs scoped | **B** |
| settings | `authenticate` | **R** (`/settings` = All authenticated) |
| filters | `authenticate` | **B** |
| management dashboard | `authenticate` + `isManagement` | **R** (`/management` = superadmin, farmer_owner) |

### Preserved quirks (flagged, deliberately kept)

- `route/masterDataRoutes.js` (ops) keeps `authenticate`-only; owner farm-scoping
  is the guard.
- Assignments: government may list (authenticate-only), retained.
- Lifecycle POST `createdBy` `req.user.id` fix applied (Task 5).

---

## 4. FRONTEND COMPANION PATCHES — complete list

Precedent: `useMasterData.js` already unwraps the envelope
(`result?.data ?? []`) and sends the Bearer token. Every other client that hits
a now-guarded/unwrapped endpoint was patched:

| File | Patch | Why |
|---|---|---|
| `frontend/src/hooks/useMasterData.js` | (pre-existing) unwraps `result?.data ?? []` + sends Bearer | envelope + auth baseline |
| `frontend/src/api/filterApi.js` | Task 5 (`35a21b4`): returns `json.data ?? json` | `DashboardFilterContext` reads `data.years/…` |
| `frontend/src/api/insightApi.js` | FIX pass (`9498205`): added Bearer header + reads `message \|\| error` | `/insights` gained `authenticate`; client was headerless |
| `frontend/src/components/DataImportModal.jsx` | FIX pass (`9498205`): reads `message \|\| error` from bulk-import envelope | bulk-import now returns `{success,message}/…` |
| `frontend/src/api/govtDashboardApi.js` | verified already Bearer + `json.data` | `/dashboard/govt` guarded |
| `frontend/src/api/farmerDashboardApi.js` | verified already Bearer + `json.data` | `/dashboard/farmer/v2` guarded |
| `frontend/src/api/chatbotInsightApi.js` | verified already Bearer + `json.data` | `/chatbot-insight/*` guarded |
| `frontend/src/api/managementApi.js` | verified already Bearer + `message \|\| error` | management endpoints guarded |
| `frontend/src/api/dashboardApi.js` | **ORPHAN** — not imported by any page; hits legacy `/dashboard/farmer` + `/dashboard/government` (no longer exist). Flagged §9. | — |

---

## 5. RESPONSE ENVELOPE & ERROR HANDLING — confirmed uniform

Canonical envelope (matches the Task 2 dataset factory):

- List: `{ success: true, data, total, page, totalPages }` (meta tolerated)
- Single: `{ success: true, data }`
- Create: `201 { success: true, data }`
- Update: `{ success: true, data }`
- Delete: `{ success: true }`
- Validation: `400 { success: false, message: 'Validasi gagal', errors }`
- 404: `{ success: false, message: 'Data tidak ditemukan' }`
- 5xx: `{ success: false, error: <message> }`

Applied/confirmed across all controllers (Task 5, commit `35a21b4`):

- `lifecycleController` — bare arrays/records/`{error}` → wrapped; create `201`.
- `filterController` — bare object → `{ success:true, data:{…} }`.
- `bulkImportController` — added `success` to success + all 400/500 bodies.
- Auth/dashboard/insight/chatbot/master/sales/expense/settings/assignment/
  farmer controllers already emitted `success` + `data`/`message`/`error`;
  verified wire-compatible (no field renames).

**Centralized error middleware** — `middleware/errorHandler.js`, wired in
`server.js` after `/api` mounts: unknown `/api/*` → `404 { success:false,
message:'Endpoint tidak ditemukan' }`; unhandled → `5xx { success:false, error }`.
Verified: `GET /api/nonexistent-xyz → 404`.

**Documented tolerance:** error text lives in `message` (most 4xx) or `error`
(5xx / sales / expense / management / factory). Both keys are read by frontend
clients (`managementApi` reads `message || error`; dashboard/chatbot/insight
clients read `message`). Invariant: every response has `success`, successes carry
`data`.

---

## 6. SERVICES / REPOSITORIES / KPI SERVICE — final locations (confirmed)

| Module | Final location | Confirmed |
|---|---|---|
| `chatbotAdvancedService.js` | `nlp/service/` | ✓ (cache dep → `../../util/cache`) |
| `chatbotInsightService.js` | `nlp/service/` | ✓ |
| `chatbotNlpService.js` | `nlp/service/` | ✓ |
| `kpiService.js` | **folded** into `controller/managementDashboardController.js` | ✓ module deleted |
| `chatbotInsightRepository.js` | `nlp/repository/` | ✓ |
| `chatbotNlpRepository.js` | `nlp/repository/` | ✓ |
| `cache.js`, `validate.js` | `util/` | ✓ |

All 16 chatbot-insight endpoints re-verified 200 after the move.

---

## 7. OLD DIRECTORIES REMOVED — confirmed gone

**STATUS: DONE.** `backend/src/` **does not exist** (`Test-Path` → `False`).
Deleted in Task 6 (commit `630caf6`): `src/routes`, `src/controllers`,
`src/models`, `src/middlewares`, `src/services`, `src/repositories`,
`src/utils`, `src/nlp`, `src/scripts`. Import-sweep immediately before deletion:
**zero `require` of `src/`** in the mounted tree.

Also removed in the FIX pass:

- `backend/utils/` — orphan duplicate of `util/` (last `utils/` reference,
  `controller/_datasetCrud.factory.js`, re-pointed to `../util/validate`; commit
  `a5c2184`). Search evidence: `grep "utils/"` → **0 matches** in `backend/**/*.js`.
- `_check_bulan.js` (repo root) — orphan dev script (local-mongo fallback).
- `frontend/src/components/management/UMAssignmentModal.jsx` — orphan component
  (Unit Management stayed deleted in Task 0).

Current `backend/` top-level dirs: `connection`, `controller`, `middleware`,
`model`, `nlp`, `route`, `scripts`, `util` (+ `node_modules`).

---

## 8. FULL REGRESSION CHECK — all four roles, end-to-end

Live server (main + `sugi_insights` DBs connected). A `farmer` role account was
created for the check; all calls used real JWTs from `POST /api/auth/login`.

| Role | Representative calls | Result |
|---|---|---|
| `superadmin` | auth/me, farmers, master-data/farms, master/skor-pph, lifecycle/plantings, sales, expenses, assignments, settings/profile, filters, insights, management/kpi, chatbot-insight/insights, dashboard/govt, dashboard/farmer/v2 | **all 200** |
| `government` | dashboard/govt 200, chatbot-insight/insights 200, master/skor-pph 200; management/kpi → **403** (isManagement excludes) | ✓ |
| `farmer_owner` | dashboard/farmer/v2 200, management/kpi 200, master-data/farms 200; dashboard/govt → **403**, chatbot-insight → **403** (isGovernment) | ✓ |
| `farmer` | dashboard/farmer/v2 200, filters 200, insights 200; dashboard/govt → **403**, chatbot-insight → **403**, management/kpi → **403** | ✓ |
| no token | dashboard/farmer/v2 → **401**, chatbot-insight → **401**, master/skor-pph → **401** | ✓ |
| mis-cased path | `/api/nonexistent-xyz` → **404** envelope | ✓ |

Envelope spot-checks: `settings/profile` `{success,data}`; `PUT settings/profile
{phone}` → **200** (`isPhone` exported); `filters` `{success,data:{years,…}}`;
lifecycle lists `{success,data:[…]}`; bulk-import empty → `400
{success:false,message}`; lifecycle POST `createdBy` populated (`req.user.id`
fix); DELETE → `{success:true}`; chatbot-insight GETs all `success=true`;
`semantic-search ?q=harga` 200.

**Regression caught & fixed in this final pass:** `GET /dashboard/farmer/v2`
was briefly public after the FIX-pass per-route guard refactor (the Task-3
`router.use(authenticate)` was dropped when `/govt` gained `isGovernment`).
Restored in commit `fd6b173`; re-verified 401 without token, 200 for all four
roles.

---

## 9. OUTSTANDING ITEMS — Phase 3 or human review

1. **Credential rotation (HUMAN ACTION ITEM):** confirm leaked historical
   `MONGO_URI` password `f392wbfmUsSn1QfF` and `JWT_SECRET=supersecret` are
   revoked at the provider level. Phase 2 commits no `.env` value.
2. **Orphan frontend client:** `frontend/src/api/dashboardApi.js` is not
   imported anywhere and targets legacy paths `/dashboard/farmer` +
   `/dashboard/government` (no longer mounted). Safe to delete in Phase 3.
3. **Dead model (pre-existing):** `Organization.js` was in `src/models/` but is
   not imported by any mounted module; not carried over. Verify nothing depends
   on it before Phase 3.
4. **Dev-only scripts:** `scripts/seed.js`/`reset.js`/`seedSuperAdmin.js` retain
   `mongodb://localhost:27017/sugi-dashboard-demo` fallbacks for local dev
   (runtime paths hardened; non-blocking).
5. **Envelope alias tolerance:** `message`/`error` dual-key convention (§5) is a
   documented pragmatic standard; revisit if the frontend migrates to a single
   error key.
6. **Flagged design decisions kept:** ops master-data `authenticate`-only (owner
   scoping); assignments allow government read; `isGovernment` restricts the 13
   datasets to `superadmin|government` (farmer_owner write can be added
   deliberately if a business need appears).
