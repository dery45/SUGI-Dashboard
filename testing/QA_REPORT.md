# SUGIDash API QA Report — TASK 0..9

**Suite:** Playwright (API-level), one project per fixture role.
**Run:** `npx playwright test` in `testing/` (backend :3000, frontend vite :5173).
**Latest result:** TASK 0..8 committed; TASK 9 suite green (144 + 31 passed, 0 failed).

---

## Coverage by task

| Task | Spec file | Verifies |
|------|-----------|----------|
| 0 | `e2e/setup.spec.ts` | Seed & setup idempotency (tolerant of accumulated QA_ rows) |
| 1 | `e2e/auth.spec.ts` | Login/session, token handling, 401 on public-endpoint abuse |
| 2 | `e2e/crud.spec.ts` | Master-data CRUD correctness (farms/blocks/crop-types/activity-types) |
| 3 | `e2e/kpi.spec.ts` | Management KPI known-answer calcs (avgYield, cost/ROI, yield-trend, um-performance) + role gate |
| 4 | `e2e/lifecycle.spec.ts` | Lifecycle state machine: happy path, stage gates, eligible cycles, RBAC |
| 5 | `e2e/users.spec.ts` | User/farmer management: create, role handling, soft-delete, RBAC, IDOR |
| 6 | `e2e/isolation.spec.ts` | Cross-farm isolation: assignments, land/cycle creation scope, master-data reads |
| 7 | `e2e/sales.spec.ts` | Sales/expenses CRUD, auto totals, validation, isManagement gate, farm scoping |
| 8 | `e2e/security.spec.ts` | 401 sweep, NoSQL/regex injection, pagination abuse, mass-assignment, rate-limit, farmer master-data writes |
| 9 | `e2e/extra.spec.ts` | Latency ceilings on warm read path, determinism, pagination math, role smoke |

## Findings (18 total) — see `QA_FINDINGS.md`

### Critical (4)
- **KPI-02** Date-filtered KPI zeroes all expense costs (`costPerKg=0, roi=0`): `buildMatch` reuses the sales filter (`sale_date`) against the `Expense` aggregate (`expense_date`).
- **UM-01** Any authenticated user can create a superadmin: `POST /farmers` accepts a client-supplied `role` verbatim.
- **ISO-01** Owner can create a FarmerAssignment on a farm they don't own (no farm-scope check).
- **ISO-03** Owner can create a Land/CropCycle record on a farm they don't own (no scope check).

### Major (12)
- **KPI-01** `avgYieldPerHa` wrong (fallback `totalHa=1` because farm-area agg `$match`es a string `_id`).
- **LC-01** `PUT /lifecycle/plantings/:id` bypasses the stage gate — arbitrary status accepted.
- **UM-02** Any user can soft-delete any other user (no role guard in `deleteUser`).
- **UM-03** `getUserById` leaks any user record to any authenticated caller.
- **ISO-02** Owner assignment list is always empty (scope query treats owner as a farmer).
- **ISO-04** Farmers can read any farm/block via master data (scoping only covers `farmer_owner`).
- **SL-01** Owner can log sales/expenses against farms they don't own (`isManagement` only, no farm-scope check).
- **SL-02** Expense `breakdown` and sales `totals` are empty when a farm filter is used (uncast string `farm_id` in `$match`).
- **SEC-01** NoSQL operator injection in list filters (`farm_id[$ne]`) bypasses the filter.
- **SEC-02** Unvalidated `search` regex reaches `new RegExp()` and crashes list handlers (500).
- **SEC-05** Any authenticated farmer can create/update/delete master-data entities.

### Minor (2)
- **SEC-03** Invalid ObjectId path params return raw 500 `CastError` on several controllers.
- **SEC-04** No rate limiting / lockout on `POST /auth/login` (brute-force surface).

## Guardrail notes
- QA_/qa_ tagged data is torn down by `testing/global-teardown.ts`.
- `appendFinding()` is deduped by title; findings are documented, product code is untouched.
- `ApiClient` must be constructed with `base=API_BASE` so the `/api` prefix is not dropped by URL resolution.