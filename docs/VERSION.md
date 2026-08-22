# SUGI Dashboard — Version History

> **Methodology.** The repository has **no official git tags or GitHub releases**. All
> versions below are **derived milestones** — logical clusters of commits grouped by
> date and scope, reconstructed from the commit history between `1af4021`
> (2026-03-22) and `7d7bc1b` (2026-08-20). Versions are labeled `vX.Y.Z` only to give
> readers a stable reference; they are not published releases.
>
> `frontend/package.json` never bumped past `0.0.0` (unreleased placeholder) and
> `backend/package.json` is pinned at `1.0.0`. The milestone numbers in this file are
> the authoritative project timeline, not the package manifest values.

## Current Version

| Field | Value |
|---|---|
| **Version** | v0.15.1 (unreleased, on `dev` only) |
| **HEAD commit** | Phase-4b TASK commits on top of `9f175ac` (2026-08-22) |
| **Branch** | `dev` (active) — `main` frozen at `ee4faf7` (2026-03-22) |
| **Remote** | `origin` → `https://github.com/dery45/SUGI-Dashboard.git` |
| **Backend** | Express 5.2.1, Mongoose 9.3.1, natural 8.1.1 (NLP) — 88 documented endpoints |
| **Frontend** | React 19, Vite 8, Tailwind 4, Recharts 3, Leaflet, Cytoscape, React Router 7 |

## Release Timeline

| Milestone | Date | Region | Scope | Commits |
|---|---|---|---|---|
| v0.1.0 | 2026-03-22 | Initial scaffold | Food-security dashboards, master-data page, auth scaffolding | `1af4021` `c556452` `ee4faf7` |
| v0.2.0 | 2026-03-25 | Agricultural management | End-to-end lifecycle CRUD, RBAC, KPIs, seed data | `1f8b744` |
| v0.3.0 | 2026-04-24 | Master data | 14 dataset endpoints, bulk import, generated pages | `1c5e9a8` `d1d382e` `e6e87a1` `7d04b84` |
| v0.4.0 | 2026-06-03 | Documentation | README preview images (login / farmer / govt / lifecycle) | `1ff4359` `ede213e` |
| v0.5.0 | 2026-07-08 | Dashboard platform | Farmer/govt dashboard rework, RBAC v2, filter bar, PWA | `22713ff` |
| v0.6.0 | 2026-07-14 | AI insights | SUGI AI insight integration, TTL cache, dashboard fixes | `004a7e4` `a3cf883` |
| v0.7.0 | 2026-07-16 | NLP engine | Chatbot Insight Dashboard, NLP pipeline, knowledge graph | `c4333a7` |
| v0.8.0 | 2026-08-13 | Backend hardening | Phase-1 audit, dead-code removal, feature-dir scaffold, dataset CRUD factory | `30661ce` … `3ba326b` |
| v0.9.0 | 2026-08-14 | Backend restructure + API docs | Phase-2 restructure, response envelope, Swagger + Postman (Phase 3) | `792b84e` … `8e52237` |
| v0.10.0 | 2026-08-18 | Lifecycle UX | Single-entry "Persiapan Lahan" flow, per-stage eligibility validation | `19f8ef6` `30f0c13` `5962b77` `943c435` `8cd73f5` |
| v0.11.0 | 2026-08-18 | QA & test infrastructure | Playwright suites (TASK 0–9, FE-1..FE-5, TASK 9b), findings & reports | `a248a4d` … `a0e1bad` |
| v0.12.0 | 2026-08-20 | Frontend bug-fixing phase | Role-aware redirects, centralized authService, sale modal guard, hardcoded-dropdown fixes, orphan cleanup, `/api` base-URL standardization, forceReauth on password change | `e32128b` `0319769` `6bce2a6` `a443887` `a08bbb3` `0325623` `7d7bc1b` |
| v0.13.0 | 2026-08-22 | RBAC overhaul + UX polish | "Pemilik Petani"→"Owner" wording, user-mgmt CRUD scoping (Gov/Owner rules A–C,F,G), `sales_access` on FarmerAssignment, login rejects unassigned farmer/owner, UI renames (User Manajemen/Penugasan), animations, login redesign (hero.png), Indonesian audit, SW hashed-bundle note | `24dc71f` `730761e` `847ce2c` `41c32e4` `331b745` `f37cdf6` |
| v0.14.0 | 2026-08-22 | RBAC completion + Lifecycle split | Farmer-scoped guard fix (per-stage, specific 403s), Rule D Owner→Farmer auto-assign/picker, 10-item sidebar rebuild with per-item backend guards, Lifecycle split into 4 pages, farmer landing redirect, Settings farm-visibility, PWA icon/shortcuts, chart resize fix, raw-id populate bugfix | `63d1c0e` `0f76ef9` `9f175ac` + TASK 4–9 commits |
| v0.15.0 | 2026-08-22 | Phase 4 closeout | "Semua Tahapan" removed; assignment-driven Petani landing (per-stage priority); cascading cycle-closure UI lock (frontend-only); Pelaksana dropdown scoped via penugasan farm+block; Analitik & KPI redesign on shared kit; PWA offline fixed (nav fallback + runtime cache, offline reload verified 200/rendered); clickthrough rebuilt from App.jsx (124/124) + gov /management/farmers route fix | `bcd2629` `e1dff85` `6f2ac68` `090c9b7` `6197135` `28b7c1d` `8e77c43` |
| v0.15.1 | 2026-08-22 | Owner Penugasan scoping fix | Owner assignment lists were always empty (scope derived from FarmerAssignment-as-farmer instead of User.assigned_farms); Pelaksana dropdown empty for owners as a result. Fixed + mutation-scope hardening (create/update/delete limited to owner farms, Indonesian 403s) | `dab7881` |

## Current Implementation Snapshot

### Backend (`backend/`, Express 5 + Mongoose 9)

- **Layout (post v0.9.0 restructure):** `connection/ controller/ middleware/ model/
  route/ nlp/ util/ scripts/ docs/` — feature-based route→controller→model triplets,
  no legacy `src/` tree.
- **Endpoints:** **88 documented paths / 16 tags** served at `GET /api/docs` (Swagger UI)
  and raw at `/api/docs.json`; Postman collection regenerable via `docs/generate-postman.js`.
- **Auth / RBAC:** JWT bearer (single public route `POST /api/auth/login`), 4 roles
  (`superadmin`, `admin`, `farmer`, `government`), centralized `middleware/auth.js`.
- **Master data:** 13 dataset groups × CRUD (65 dataset endpoints, generated from a
  `route/_datasetCrud.factory.js`), plus management domain (lifecycle, sales, expenses,
  assignments, UM, farmer/task management).
- **NLP (v0.7.0):** Indonesian stemmer, stopwords, intent, entities, sentiment, topics,
  relations, knowledge graph, semantic search, coverage, trends, insights, optimization —
  wired into the chatbot insight service, backed by a separate `sugi_insights` DB models.
- **Security hardening (v0.8.0/v0.9.0):** fail-fast on missing `JWT_SECRET`/`MONGO_URI`,
  `.env.example` tracked, response envelope `{ status, message, data }`, centralized
  error middleware, login throttling via express-rate-limit.
- **QA (v0.11.0):** Playwright suite **175 passed / 407 skipped** across TASK 0–9; documented
  findings live in `testing/QA_FINDINGS.md`.

### Frontend (`frontend/`, React 19 + Vite 8 + Tailwind 4)

- **Structure (post v0.14.0):** `component/` (shared: charts, common, dashboard, layout,
  map) + feature folders under `pages/<Feature>/` with local `api/ component/ hooks/`,
  `services/` (authService, filterService, insightService, ProtectedRoutes), 3 contexts,
  shared `hooks/useMasterData.js`. MasterData = 4 operational catalogs; GovernmentData =
  13 government-facing catalogs.
- **Lifecycle pages (v0.14.0):** tab-based LifecycleTabs kept for Owner/superadmin
  ("Semua Tahapan") plus four per-stage pages — Persiapan Lahan, Penanaman, Perawatan,
  Panen — individually reachable by Petani when their penugasan grants the stage.
- **Sidebar (v0.14.0):** exact 10-item structure with per-item role gates; Petani items
  derive from live farmer-assignments (stages + sales_access).
- **Components:** dashboard primitives (KpiCard, ChartCard, ChartContainer, FilterBar,
  DateFilter, CommodityFilter, ProvinceFilter), layout (Sidebar, TopBar, BottomNav,
  MainLayout), chatbot (KnowledgeGraph, InsightPanel, ExportModal), common
  (DataTable, DataPageTemplate, ErrorBoundary, ExportButton, …).
- **Services (v0.12.0):** `services/authService.js` (single source of truth for token
  storage, auth headers, base URL, login/me/logout) + `services/ProtectedRoutes.jsx`
  (role-aware `homePathFor`/`ProtectedRoute`/`AppRedirect`; farmer lands on their first
  lifecycle stage since v0.14.0).
- **Contexts (v0.12.0):** AuthContext, DashboardFilterContext, ThemeContext
  (FilterContext removed as dead code).
- **PWA:** `public/manifest.json` + `public/sw.js` (added v0.5.0; real emerald app icon
  v0.14.0 — offline precache still shell-only, see Phase 4c backlog).
- **Discovery table (`src/data/`):** `allData.js` + `dataColumns.js` drive the dataset
  pages.
- **API clients:** feature-local (`pages/<Feature>/api/`) for dashboards/chatbot +
  `services/filterService|insightService` shared — all route through `authService`.

## Versioning Conventions Going Forward

- Bump the milestone in **both** `docs/VERSION.md` and `docs/CHANGELOG.md` when a
  user-visible or API-visible change lands.
- Keep `main` for stable reachable snapshots; do active work on `dev` (matches current
  practice).
- Any new Playwright task (TASK 10+, FE-…) should be recorded under the matching
  milestone and its findings appended to `testing/QA_FINDINGS.md`.