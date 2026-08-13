# Phase 2 Completion Report — Feature-Based Migration & JWT Enforcement (backend)

Phase 2 of 3. Scope: `backend/` (plus the two minimal frontend companion patches
required to keep the demo working when `/api/master` responses gained Auth +
envelope).

**STATUS DISCLOSURE:** Phase 2 is **partially complete as of this report**.
Tasks 0, 1, and 2 are fully done, committed on `dev` (`670f232`, `40ae413`,
`3ba326b`). Tasks 3–8 of the Phase 2 brief (feature relocation of the remaining
endpoints, services/repositories/kpiService move, old-`src/` deletion, and the
full multi-role regression sweep) are **NOT yet executed**. Sections below are
labeled `DONE` or `PENDING` accordingly; nothing in this report claims completed
work that has not been run.

---

## 0. TASK 0 RESOLUTION — status of every Phase 1 corrections item

All six Phase 1 open items were resolved in the pre-work addendum
(`backend/PHASE2_PREWORK_ADDENDUM.md`) and confirmed against the live server
before Phase 2 began.

| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | Unit Management decision + evidence | **DONE** | Frontend grep finds no caller of `/api/um`; `UMManagementPage.jsx` hits only mounted routes (`/assignments/farmer-assignments`, `/farmers?role=farmer`, `/master-data/blocks`, `/master-data/farms`). `UMAssignmentModal.jsx` is imported nowhere (orphan). Decision to keep `umRoutes.js` deleted stands; modal removal deferred to Phase 3. |
| 2 | Shim integrity | **DONE** | `src/middlewares/authMiddleware.js` → re-exports `authenticate`; `src/middlewares/rbacMiddleware.js` → re-exports `checkRole, isSuperAdmin, isGovernment, isManagement, isFarmerOwner, isFarmer`; `src/models/sugi_insights/index.js` → re-exports `insightsConnection` and still exposes `.model(...)`. Runtime `===` identity checks passed (`authMiddleware.authenticate === middleware/auth.js authenticate`, etc.). |
| 3 | Recomputed auth backlog total | **DONE** | Endpoint-level recompute: **73 endpoints / 17 route files** lack auth (was 33 at route-file level in Phase 1). Breakdown: 1 bulk-import, 2 dashboard, 2 insight, 16 chatbot-insight, 52 dataset (13 × POST/GET/PUT/DELETE). |
| 4 | v2 dashboard smoke test | **DONE** | `GET /api/dashboard/farmer/v2` → HTTP 200 (59,742 B); `GET /api/dashboard/govt` → HTTP 200 (40,727 B, `success=true`, 22 top-level keys). No regression from Phase 1. |
| 5 | `file_path` status | **DONE** | Deleted from `backend/.env` in Phase 1 Task 6; absent from `.env.example` (PORT, MONGO_URI, JWT_SECRET, NODE_ENV). Never read via `process.env.file_path`; no git-history evidence of a planned consumer. |
| 6 | Credential rotation status | **TESTS DONE / HUMAN ACTION ITEM OPEN** | Current `.env` values (`4tyxPCq9dbfbkPxd`, `JWT_SECRET="THISISSECRET"`) are distinct from the leaked historical values (`f392wbfmUsSn1QfF`, `supersecret`) and no git blob contains the current values. **ACTION ITEM (owner):** confirm at the provider level that the leaked values are revoked. Phase 2 commits no `.env` value. |

**Critical fallback removal + fail-fast (Task 0 commit `670f232`):**

- `backend/connection/db.js`: now fails fast when `MONGO_URI` is unset
  (no `mongodb://localhost:27017/...` fallback).
- `backend/middleware/auth.js`: now fails fast when `JWT_SECRET` is unset
  (no `'supersecret'` fallback).
- `backend/src/controllers/authController.js`: imported `{ JWT_SECRET }` from
  `../../middleware/auth` (single source of truth) instead of bundling its own
  duplicate fallback.

Failure behavior verified at startup (missing `JWT_SECRET`):

```
node -e "require('./middleware/auth')"
[FATAL] JWT_SECRET is not set in the environment. Refusing to start.
Set JWT_SECRET before starting the server (see backend/.env.example).
exit code = 1
```

Same pattern produces `[FATAL] MONGO_URI is not set in the environment. Refusing
to start.` (`connection/db.js`). With `.env` present, the server boots cleanly
(main + `sugi_insights` both connect).

> **Note found during Task 0 verification:** `middleware/auth.js` computed
> `JWT_SECRET` internally but did not export it, so `authController`'s import
> destructured `undefined` and `jwt.sign` threw `secretOrPrivateKey must have a
> value` at login. Fixed in Task 2 by adding `JWT_SECRET` to the module's
> exports; login re-verified end-to-end (see Section 7).

---

## 1. FOLDER MIGRATION MAP — old path → new path, for every file moved

**STATUS: PENDING (Tasks 3–4 of the Phase 2 brief not yet executed).**

As of this report, **no legacy feature files have been moved yet.** The only
files in the new feature-based directories are new creations from Tasks 1–2.
`src/controllers/`, `src/models/`, `src/routes/`, `src/middlewares/`,
`src/services/`, `src/repositories/` all still exist and remain the live mount
points for every non-dataset route.

Current new-location contents (created, not moved):

| New path | Files |
|---|---|
| `backend/controller/` | `_datasetCrud.factory.js`, 13 thin dataset controllers |
| `backend/model/` | 13 dataset models (KetidakcukupanNasional … CadanganPanganProvinsi) |
| `backend/route/` | `_datasetCrud.factory.js`, 13 dataset route files, `masterDataRoutes.js` |
| `backend/utils/` | `validate.js` (copy of shared validator; legacy copy still at `src/utils/validate.js`) |

Planned (per brief, to be executed) mapping table — recorded here because the
brief requires it per-file; it will be reconciled at the end of relocation:

| Former (`src/…`) | Target (`backend/…`) | Content |
|---|---|---|
| `controllers/authController.js` | `controller/auth.controller.js` | auth |
| `controllers/masterDataController.js` + `models/FarmMaster.js`, `Block.js`, `CropType.js`, `ActivityType.js` | `controller/master-data.controller.js` + `model/…` | operational master data |
| `controllers/farmerDashboardController.js` + models | `controller/farmer-dashboard.controller.js` + models | farmer dashboard v2 |
| `controllers/govtDashboardController.js` + models | `controller/govt-dashboard.controller.js` + models | government dashboard v2 |
| `controllers/dashboardDataController.js` etc. | 1-feature-1-triplet targets | legacy dashboards |
| `controllers/{lifecycle,farmerManagement,sales,production,expense,assignment,settings,filter,insight,chatbotInsight,bulkImport}*Controller.js` + routes + models | corresponding `controller/route/model` triplets | remaining features |
| `middlewares/*` | (shims; superseded by `middleware/auth.js`) | auth + rbac |
| `services/{chatbotAdvancedService,chatbotInsightService,chatbotNlpService}.js` | `nlp/service/` | NLP services (Task 4) |
| `repositories/{chatbotInsightRepository,chatbotNlpRepository}.js` | `nlp/repository/` | NLP repositories (Task 4) |
| `services/kpiService.js` | folded into `controller/management-dashboard.controller.js` or model helpers (decision pending in Task 4) | KPI service |
| `utils/{cache,validate}.js` | `utils/` | shared utilities |
| `scripts/*.js` | `scripts/` (or as decided) | seed/reset tooling |

---

## 2. FEATURE TRIPLET INVENTORY — table of every feature and its files

**STATUS: PARTIAL — DONE for the 13 dataset features (Task 2); PENDING for the
remaining ~16 features.**

The 1-feature-1-triplet rule is confirmed for the migrated dataset features.
The **dataset CRUD factory** is the documented shared-factory exception: the 13
dataset features each get a thin triplet (explicitly listed), while all of their
CRUD logic lives in the two shared factory modules noted below.

### DONE — 13 dataset features (1-feature-1-triplet)

| Feature (dataset) | Controller | Model | Route |
|---|---|---|---|
| KetidakcukupanNasional | `controller/ketidakcukupanNasionalController.js` | `model/KetidakcukupanNasional.js` | `route/ketidakcukupanNasionalRoutes.js` |
| KetidakcukupanProvinsi | `controller/ketidakcukupanProvinsiController.js` | `model/KetidakcukupanProvinsi.js` | `route/ketidakcukupanProvinsiRoutes.js` |
| KonsumsiPerJenis | `controller/konsumsiPerJenisController.js` | `model/KonsumsiPerJenis.js` | `route/konsumsiPerJenisRoutes.js` |
| PenyaluranDonasi | `controller/penyaluranDonasiController.js` | `model/PenyaluranDonasi.js` | `route/penyaluranDonasiRoutes.js` |
| ProyeksiNeraca | `controller/proyeksiNeracaController.js` | `model/ProyeksiNeraca.js` | `route/proyeksiNeracaRoutes.js` |
| GerakanPanganMurah | `controller/gerakanPanganMurahController.js` | `model/GerakanPanganMurah.js` | `route/gerakanPanganMurahRoutes.js` |
| HargaKonsumenProvinsi | `controller/hargaKonsumenProvinsiController.js` | `model/HargaKonsumenProvinsi.js` | `route/hargaKonsumenProvinsiRoutes.js` |
| HargaKonsumenNasional | `controller/hargaKonsumenNasionalController.js` | `model/HargaKonsumenNasional.js` | `route/hargaKonsumenNasionalRoutes.js` |
| HargaProdusenNasional | `controller/hargaProdusenNasionalController.js` | `model/HargaProdusenNasional.js` | `route/hargaProdusenNasionalRoutes.js` |
| HargaProdusenProvinsi | `controller/hargaProdusenProvinsiController.js` | `model/HargaProdusenProvinsi.js` | `route/hargaProdusenProvinsiRoutes.js` |
| SkorPPH | `controller/skorPPHController.js` | `model/SkorPPH.js` | `route/skorPPHRoutes.js` |
| PanganTerselamatkan | `controller/panganTerselamatkanController.js` | `model/PanganTerselamatkan.js` | `route/panganTerselamatkanRoutes.js` |
| CadanganPanganProvinsi | `controller/cadanganPanganProvinsiController.js` | `model/CadanganPanganProvinsi.js` | `route/cadanganPanganProvinsiRoutes.js` |

**Shared-factory exception (documented):** `controller/_datasetCrud.factory.js`
(schema-derived validation, opt-in pagination, `{success,data,total,page,
totalPages}` envelope) and `route/_datasetCrud.factory.js` (auth + role-guard
wiring). All 13 features consume these two modules.

Router mounts: `route/masterDataRoutes.js` is mounted at `/api/master` in
`server.js`; the 13 legacy `/master/*` mounts were removed from
`src/routes/index.js` (Task 2).

### PENDING — remaining features (still in `src/`, to be relocated in Task 3)

auth, operational master-data (farms/blocks/crop-types/activity-types),
farmer dashboard v2, government dashboard v2, legacy dashboards, lifecycle,
farmer management, sales, expenses, assignments, settings, filters, insights,
chatbot-insight, bulk-import, management dashboard. Triplets will be enumerated
in the updated report once relocated.

Models in `src/models/` remain registered in-process via the still-mounted
dashboard controllers; the new dataset models therefore use idempotent
registration (`mongoose.models.X || mongoose.model('X', schema)`) to avoid
`OverwriteModelError` — verified at boot in Task 2.

---

## 3. AUTH BACKLOG CLOSURE — endpoint-by-endpoint confirmation

**STATUS: PARTIAL — 52 of 73 endpoints closed (the 13 dataset features);
21 endpoints still open (Tasks 3).**

### CLOSED — 13 dataset feature routes (Task 2, commit `3ba326b`)

Guard used: `authenticate` (router-level) + `isGovernment`
(`superadmin|government`) on every handler.

For each dataset slug `ketidakcukupan-nasional, ketidakcukupan-provinsi,
konsumsi-per-jenis, penyaluran-donasi, proyeksi-neraca, gerakan-pangan-murah,
harga-konsumen-provinsi, harga-konsumen-nasional, harga-produsen-nasional,
harga-produsen-provinsi, skor-pph, pangan-terselamatkan, cadangan-pangan-provinsi`:

| Method + path | `authenticate` | Role guard |
|---|---|---|
| `POST /api/master/<slug>` | ✅ | `isGovernment` |
| `GET /api/master/<slug>` | ✅ | `isGovernment` |
| `GET /api/master/<slug>/:id` | ✅ | `isGovernment` |
| `PUT /api/master/<slug>/:id` | ✅ | `isGovernment` |
| `DELETE /api/master/<slug>/:id` | ✅ | `isGovernment` |

**Guard ambiguity flag:** The correct guard for the dataset CRUD endpoints was
ambiguous between `isGovernment` (`superadmin|government`) and `isManagement`
(`superadmin|farmer_owner`). The frontend routes the master/data pages under
`roles={['superadmin','government']}` (`App.jsx`), and these are government
food-security datasets — so **I defaulted to the restrictive `isGovernment`**
per the "default to restrictive when ambiguous" rule. Any future business need
for `farmer_owner` write access to these tables must be raised explicitly.

### OPEN — 21 endpoints (deferred to Task 3)

| Route file | Endpoints still missing `authenticate` | Count |
|---|---|---|
| `bulkImportRoutes.js` | `POST /api/bulk-import/:modelName` | 1 |
| `dashboardRoutes.js` | `GET /api/dashboard/farmer/v2`, `GET /api/dashboard/govt` | 2 |
| `insightRoutes.js` | `GET /api/insights`, `GET /api/insights/farmer` | 2 |
| `chatbotInsightRoutes.js` | `/dashboard, /filters, /activity, /topics, /entities, /ner, /process(POST), /intent, /semantic-network, /knowledge-graph, /recommendations, /problems, /trends, /coverage, /insights, /semantic-search` | 16 |

`POST /api/auth/login` remains intentionally public (true entry point) and is
excluded. All other routes (assignments, expenses, lifecycle, management,
sales, farmers, master-data, settings, filters at `src/routes/index.js`)
already had `authenticate` from Phase 1 and remain unchanged.

---

## 4. RESPONSE ENVELOPE & ERROR HANDLING

**STATUS: PARTIAL.**

**DONE — dataset factory (Task 2).** `controller/_datasetCrud.factory.js`
emits the standardized shape everywhere it serves:

- List: `{ success: true, data, total, page, totalPages }`
- Single (GET by id): `{ success: true, data }`
- Create: `201 { success: true, data }`
- Update: `{ success: true, data }`
- Delete: `{ success: true }`
- Validation failures: `400 { success: false, message: 'Validasi gagal', errors }`
- 404: `{ success: false, message: 'Data tidak ditemukan' }`
- Server/other errors: `5xx { success: false, error: <message> }`

**Frontend-contract exception (documented, Task 2 companion fix).** The former
`GET /api/master/*` handlers returned a **bare array**, and the frontend hook
`frontend/src/hooks/useMasterData.js` did `setData(result)` directly on that
bare array with no auth header (only import/delete flows sent a token). Because
the envelope + `authenticate` would break the master-data UI, the required
companion change was applied to the frontend: `useMasterData` now sends
`Authorization: Bearer</token>` on all four verbs and unwraps the envelope
(`Array.isArray(result) ? result : result?.data ?? []`). `MasterDataPage.jsx`
(unrouted; only its `dataRegistry` export feeds the Sidebar) was patched
defensively to read `result.data`. This is the one documented exception where
the backend shape change is paired with a client change rather than a server
exception.

**PENDING — every non-dataset endpoint.** Legacy controllers at
`src/controllers/` still return heterogenous shapes (bare arrays, `{error}`,
`{message}`, mixed key casing). Buried in the brief as envelope standardization
task; not yet applied. `src/routes/index.js` carries the other mounted routes.

---

## 5. SERVICES / REPOSITORIES / KPI SERVICE DECISION

**STATUS: PENDING (Task 4 of the brief not yet executed).**

Recorded decision (from the Phase 2 brief) — to be executed and then reflected
verbatim here:

- `src/services/chatbotAdvancedService.js`, `chatbotInsightService.js`,
  `chatbotNlpService.js` → **`backend/nlp/service/`** (they are NLP-domain
  logic, colocated with `src/nlp/*`).
- `src/repositories/chatbotInsightRepository.js`, `chatbotNlpRepository.js` →
  **`backend/nlp/repository/`**.
- `src/services/kpiService.js` → **folded into
  `controller/management-dashboard.controller.js` or model helpers** — final
  single choice (controller vs. model helper) pending execution.
- Rationale for colocating services/repositories under `nlp/`: keeps the
  feature's data-access + business-logic directly beside its model/controller
  in the same feature directory, which is the point of the feature-based
  structure.

Current location while pending: `backend/src/services/` and
`backend/src/repositories/` (unchanged).

---

## 6. OLD DIRECTORIES REMOVED

**STATUS: NOT DONE — `src/` still exists.**

Verified present (all still exist):
`src/controllers/`, `src/models/`, `src/routes/`, `src/middlewares/`,
`src/services/`, `src/repositories/` (plus `src/nlp/`, `src/scripts/`,
`src/utils/`, `src/models/sugi_insights/`).

Because removal is a Task 3/4 outcome and those tasks have not run, the search
evidence expected here ("nothing imports from `src/...`") **cannot yet be
produced** — many live files still import from `src/`. That grep sweep will be
run and appended immediately before the directories are deleted. Nothing in
Section 6 should be treated as confirmation of removal.

---

## 7. REGRESSION CHECK — per-role login + representative calls

**STATUS: PARTIAL — superadmin + farmer_owner verified; government + farmer
not yet run.**

Verification performed against the live server (`node server.js`, main +
`sugi_insights` connected) in Task 2:

| Role | Login | Representative call | Result |
|---|---|---|---|
| `superadmin` | `superadmin@sugi.id` / `superadmin123` → ✅ token | `GET /api/master/ketidakcukupan-nasional` | 200 envelope, total=15 |
| `farmer_owner` | `owner@sugi.id` / `owner123` → ✅ token | `GET /api/master/ketidakcukupan-nasional` | **403** (expected — `isGovernment` guard) |
| `government` | not run | — | — |
| `farmer` | not run | — | — |

Additional Task 2 live checks (as superadmin):
- No token on any dataset route → `401 {success:false,message:'Token tidak
  ditemukan'}`.
- All 13 dataset slugs → 200 with token.
- Pagination `?page=2&limit=5` → total=15, page=2, totalPages=3, dataCount=5.
- Validation: missing `tahun` → errors on `tahun/jumlah_penduduk/
  penduduk_undernourish`; non-numeric `jumlah_penduduk` → type error.
- Full CRUD cycle on one dataset (create → get → update → delete → 404).
- `POST /api/auth/login` → token (verifies the `JWT_SECRET` export fix).

Pending per-role regression (Task 7 of the brief, to complete in Phase 2 endgame):
- `government@sugi.id` / `government123` login + a govt-dashboard or dataset
  call.
- `farmer` account login + a farmer-dashboard call (farmer accounts seeded via
  `seedSuperAdmin.js` / `seed.js`).
- Re-run the v2 dashboards (`/api/dashboard/government`, `/api/dashboard/farmer/v2`)
  after all routes gain guards.

---

## 8. OUTSTANDING ITEMS — deferred to later Phase 2 tasks or human review

1. **Tasks 3–4 (NOT YET DONE):** relocate remaining features into
   `controller/model/route` triplets; apply `authenticate` + role guards to the
   remaining 21 endpoints (bulk-import ×1, dashboard ×2, insight ×2,
   chatbot-insight ×16 — see Section 3); move services/repositories/kpiService
   per Section 5 decision.
2. **Task 5:** envelope standardization across legacy controllers (Section 4 —
   currently heterogeneous shapes remain).
3. **Task 6:** delete `src/controllers/, src/models/, src/routes/,
   src/middlewares/, src/services/, src/repositories/` after the import-sweep
   evidence is produced (Section 6).
4. **Task 7:** complete the government/farmer role regression (Section 7).
5. **Credential rotation (HUMAN ACTION ITEM):** confirm the leaked historical
   `MONGO_URI` password `f392wbfmUsSn1QfF` and `JWT_SECRET=supersecret` are
   revoked at the provider level; confirm the current live values are the
   intended rotation. Flagged in addendum §6 and Section 0 above.
6. **Frontend companion cleanup (Phase 3):** remove orphaned
   `frontend/src/components/management/UMAssignmentModal.jsx`; revisit whether
   `farmer_owner` needs write access to the 13 government datasets (Section 3
   guard-ambiguity flag).
7. **Dev-only scripts:** `_check_bulan.js` (repo root) and `src/scripts/*
   (seed/reset) still carry `mongodb://localhost:27017/...` fallbacks for
   local dev; runtime paths are hard-hardened (no fallback), so this is
   non-blocking but worth cleaning alongside Task 6.
8. **Docs:** this report is written at partial completion per the switching
   protocol; it must be regenerated/updated after Tasks 3–8 execute so the
   `DONE`/`PENDING` markers reflect reality.