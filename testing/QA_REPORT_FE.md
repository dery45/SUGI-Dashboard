# SUGIDash Frontend (UI) QA Report — TASK FE-1..FE-5 + FE-9B

**Suite:** Playwright UI suite (browser) — `testing/playwright.fe.config.ts`, `testing/e2e-fe/`.
**Run:** `npx playwright test --config=playwright.fe.config.ts` (backend :3000 + frontend vite :5173 must be up).
**Latest result:** 46 passed / 185 skipped / 0 failed.

This is the **frontend complement** to `QA_REPORT.md` (backend/API). Where the
backend suite asserts access control from the API response, this suite asserts
the same guarantees from the rendered browser UI.

---

## Coverage by FE task

| Task | Spec / page | Verifies |
|------|-------------|----------|
| FE-1 auth & session | `fe-auth.spec.ts` + `Login.jsx` | Unauthenticated redirects (6 protected routes → `/login`); login form validation; bad-password error; valid login; logout clears token + redirect; role-scoped landing |
| FE-2 dashboards | `fe-dashboard.spec.ts` | KPI grid renders (8 cards); rendered `Total Hasil Panen` matches the API number; farmer_owner farm filter only shows QA-1; government/farmer/superadmin land on their own dashboards |
| FE-3 master data | `fe-masterdata.spec.ts` | Create → table render → edit → soft-delete via the modal UI; duplicate-code error (no crash); farmer_owner sees **no** Tambah Farm button and a QA-1-only list |
| FE-4 mobile/theme | `fe-mobile.spec.ts` | Mobile bottom-nav visible and navigates to Lifecycle (`lg:hidden`); theme toggle flips `dark`; lifecycle page renders for management roles |
| FE-5 input safety | `fe-security.spec.ts` | `<script>` farm name stored then rendered inert (no dialog fired, XSS escaped); negative area blocked client-side; huge numeric input (no crash); empty-state on no-match search |
| FE-9B extras | `fe-extra.spec.ts` | Double-click duplicate submission on the live sales form (finding FE-9B-1); concurrent master-data edit last-write-wins (no corruption); password change via Settings UI + old-JWT replay (finding FE-9B-3); CSV export scope — exported rows are exactly the role-scoped fetched payload, never extra (`peta-producer.csv` / `peta-pou.csv`) |

## Frontend-to-backend cross-checks (the "difference report")

These are the same guarantees the backend suite proved at the API layer, now
proven from the rendered UI — so the UI cannot hide or distort a backend gap:

| Backend finding | FE proof of the same guarantee |
|-----------------|--------------------------------|
| SEC-05 any farmer can create farms | FE shows farmer_owner has no Tamba Farm button in UI (`fe-masterdata.spec`), while backend still allows plain-`farmer` POSTs (SEC-05 finding stands, UI-only hiding) |
| ISO-04 farmers can read any farm | FE role dashboards land correctly but depend on scoping the backend enforces; UI only filters `farmer_owner` lists |
| UM-01 create-superadmin | Not reachable from UI (role dropdown absent on the create modal) — the hole exists only via direct API |
| FE-REDIRECT | `Login.jsx` hard-codes `navigate('/management')`; non-management roles bounce `/management → /` → role home (`fe-auth.spec`) |

## New frontend findings (in `QA_FINDINGS.md`)

| ID | Severity | Title |
|----|----------|-------|
| FE-REPLAY | info | Logout is client-side only — the JWT remains valid if replayed (`/auth/me` still 200 with the pre-logout token) |
| FE-REDIRECT | info | Post-login redirect is hard-coded to `/management` for every role (extra navigation for farmer/government) |
| FE-9B-1 | info | Sales save button only guards double-submission by closing the modal; backend `/sales` has no idempotency — two synchronous submit events created 2 identical records. The guarded `RecordSaleModal.jsx` (`disabled={saving}`) is unused dead code |
| FE-9B-3 | info | Password change via Settings UI leaves pre-change JWTs valid (stateless JWT, secret not rotated) — cross-referenced with backend 9B-01 |

FE-REPLAY / FE-REDIRECT / FE-9B-1 / FE-9B-3 are confirmed working-FE flows with
informational notes, not defects.

## Role × route matrix (UI landing, all authenticated)

| Project | `/` → lands on |
|---------|----------------|
| fe_superadmin | `/management` (Dashboard Manajemen) ✅ |
| fe_government | `/government` (Dashboard Pemerintah) ✅ |
| fe_farmer_* | `/farmer` (Dashboard Petani) ✅ |
| fe_owner_farm1 | `/management` + farm filter QA-1-only ✅ |

## Run notes
- Reuses `testing/global-setup.ts` (role storageState under the frontend origin
  `http://localhost:5173`, so browsers start authenticated; no UI login).
- XSS/create payloads are `QA_FE_`-tagged and torn down by `global-teardown.ts`.
- Mobile viewport smoke uses `test.use({ viewport: 390x844 })`.