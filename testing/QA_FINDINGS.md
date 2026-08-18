
## Finding — Task 3 (2026-08-18T07:27:58.038Z)

**Severity:** major

**Title:** KPI avgYieldPerHa ignores the farm's actual area (fallback totalHa=1)

**Expected:** With farm_id=QA-1 (10 ha) and 0.1 t yield, avgYieldPerHa must be 0.01.

**Observed:** Observed avgYieldPerHa=0.1 (backend divides yield by fallback 1 because the farm-area aggregation matches a string _id and returns no rows).

**Detail:** backend/controller/managementDashboardController.js calculateOrganizationOverview: farmAreaAgg matches string farm_id; totalHa = agg[0]?.totalHa || 1.

---

## Finding — Task 3 (2026-08-18T07:27:58.123Z)

**Severity:** critical

**Title:** Date-filtered KPI drops all expense costs (expenses matched on sale_date)

**Expected:** With start_date..end_date covering the 300k expense, costPerKg must be 3000 and roi 66.7.

**Observed:** Observed costPerKg=0, roiPercentage=0, totalRevenue=500000. The Expense aggregate uses saleMatch, so expenses are filtered by the non-existent field sale_date.

**Detail:** backend/controller/managementDashboardController.js: buildMatch({...}) is passed to both Sale.aggregate and Expense.aggregate, but Expense has expense_date.

---

## Finding — Task 4 (2026-08-18T07:31:35.161Z)

**Severity:** major

**Title:** PUT /lifecycle/plantings/:id bypasses the stage gate (arbitrary status)

**Expected:** A cycle in Land_Preparation must not become Completed without passing plant -> maintain -> harvest.

**Observed:** Observed PUT {status:"Completed"} -> 200 with status=Completed. updatePlanting uses CropCycle.findByIdAndUpdate(req.body) with no eligibility check.

**Detail:** backend/controller/lifecycleController.js updatePlanting (and updateActivity/updateLand share the raw findByIdAndUpdate pattern).

---

## Finding — Task 5 (2026-08-18T07:35:42.028Z)

**Severity:** critical

**Title:** Any authenticated user can create a superadmin (role value not constrained)

**Expected:** POST /farmers with role=superadmin from a farmer must be rejected (403/400).

**Observed:** Observed farmer POST /farmers {role:"superadmin"} -> 201 role=superadmin. createUser validates name/email/password only; payload.role = role || 'farmer'.

**Detail:** backend/controller/farmerManagementController.js createUser: role is taken verbatim from req.body for non-farmer_owner callers.

---

## Finding — Task 5 (2026-08-18T07:35:42.090Z)

**Severity:** major

**Title:** Any authenticated user can soft-delete any other user

**Expected:** Only superadmin/government (or an owning farmer_owner) may deactivate a user.

**Observed:** Observed farmer DELETE /farmers/:victim -> 200 ("User dinonaktifkan"). deleteUser has no role guard beyond the farmer_owner branch.

**Detail:** backend/controller/farmerManagementController.js deleteUser.

---

## Finding — Task 5 (2026-08-18T07:35:42.141Z)

**Severity:** major

**Title:** getUserById leaks any user to any authenticated caller

**Expected:** A farmer must not be able to read superadmin/government accounts.

**Observed:** Observed farmer GET /farmers/:superadminId -> 200. getUserById has no ownership/role filter.

**Detail:** backend/controller/farmerManagementController.js getUserById.

---

## Finding — Task 6 (2026-08-18T07:42:07.089Z)

**Severity:** critical

**Title:** farmer_owner can create an assignment on a farm they do not own

**Expected:** Owner of QA-1 must not be able to assign a farmer to QA-2 blocks.

**Observed:** Observed owner_farm1 POST /assignments/farmer-assignments with farmer_f2 + block QA-2A -> 201. createFarmerAssignment only checks farmer/blocks presence, never the caller's farm scope.

**Detail:** backend/controller/assignmentController.js createFarmerAssignment.

---

## Finding — Task 6 (2026-08-18T07:42:07.292Z)

**Severity:** major

**Title:** farmer_owner assignment list is always empty (wrong scope query)

**Expected:** Owner of QA-1 who just assigned a farmer on QA-1 must see that assignment when listing.

**Observed:** Observed owner_farm1 POST assignment on QA-1 -> 201, then GET /assignments/farmer-assignments -> 0 rows. listFarmerAssignments derives owned farms from FarmerAssignment.find({farmer: ownerId}).distinct('farm'), which is empty for an owner.

**Detail:** backend/controller/assignmentController.js listFarmerAssignments lines 11-14.

---

## Finding — Task 6 (2026-08-18T07:42:07.357Z)

**Severity:** critical

**Title:** farmer_owner can create a land record / CropCycle on a farm they do not own

**Expected:** Owner of QA-1 must not create land (start a cycle) on QA-2.

**Observed:** Observed owner_farm1 POST /lifecycle/land {farm_id: QA-2} -> 201. createLand validates farm_id format only.

**Detail:** backend/controller/lifecycleController.js createLand.

---

## Finding — Task 6 (2026-08-18T07:44:02.923Z)

**Severity:** major

**Title:** Farmers can read any farm (master-data scoping ignores farmer role)

**Expected:** A farmer assigned to QA-1 must not read QA-2 farm data.

**Observed:** Observed farmer GET /master-data/farms/:QA2 -> 200. masterDataController getById only scopes req.user.role === 'farmer_owner'.

**Detail:** backend/controller/masterDataController.js scoping guards (getById/list/getAll).

---

## Finding — Task 6 (2026-08-18T07:44:03.001Z)

**Severity:** major

**Title:** Farmers can read blocks of any farm

**Expected:** A farmer assigned to QA-1 must not list QA-2 blocks.

**Observed:** Observed farmer GET /master-data/blocks?farm=:QA2 -> 200 with data. Block routes have no farmer scoping.

**Detail:** backend/controller/masterDataController.js blocks list.

---

## Finding — Task 7 (2026-08-18T07:46:37.244Z)

**Severity:** major

**Title:** farmer_owner can log sales/expenses against a farm they do not own

**Expected:** Owner of QA-1 must not record sales/expenses on QA-2.

**Observed:** Observed owner_farm1 POST /sales {farm_id: QA-2} -> 201. isManagement() checks role only; no farm-scope guard.

**Detail:** backend/route/salesRoutes.js / expenseRoutes.js (isManagement) + controllers.

---

## Finding — Task 7 (2026-08-18T07:48:08.134Z)

**Severity:** major

**Title:** Expense breakdown (and sales totals) are empty when farm_id filter is used

**Expected:** With farm_id=QA-1 filtering 300k of Pupuk expenses, breakdown must show Pupuk: 300000.

**Observed:** Observed GET /expenses?farm_id=:QA1 -> data has 1 rows but breakdown=[] ($match on uncast string ObjectId).

**Detail:** backend/controller/expenseController.js listExpenses (Expense.aggregate $match) — same pattern in salesController.js listSales totals.aggregate.

---

## Finding — Task 8 (2026-08-18T07:58:46.746Z)

**Severity:** major

**Title:** SEC-01 NoSQL operator injection in list filters (`farm_id[$ne]`) bypasses filter

**Expected:** Requesting /sales?farm_id[$ne]=deadbeef must not return unrelated farm rows: the injected operator should be treated as a literal query string or rejected (4xx).

**Observed:** Status 200: the $ne operator was passed straight into the Mongoose filter object, matching every document whose farm_id is not 'deadbeef' (i.e. ALL farms) instead of an empty result set. sales list endpoint returns unfiltered rows.

**Detail:** GET /sales?farm_id[$ne]=deadbeef

---

## Finding — Task 8 (2026-08-18T07:58:46.870Z)

**Severity:** major

**Title:** SEC-02 unvalidated `search` regex reaches new RegExp() and crashes list handlers

**Expected:** GET /master-data/blocks?search=(.* must be handled gracefully (matching none or 400), never a 500 from an unterminated-group exception.

**Observed:** Status 500: the raw query string is interpolated into 'new RegExp(search, "i")', so an unterminated group like '(.*' throws 'Invalid regular expression' and the API returns 500. Same pattern exists in /farmers?search= and other list endpoints.

**Detail:** Probe: GET /master-data/blocks?search=%28.*  -> 500 {"message":"Invalid regular expression: /(.*/i: Unterminated group"}

---

## Finding — Task 8 (2026-08-18T07:58:46.911Z)

**Severity:** minor

**Title:** SEC-03 invalid ObjectId path params return raw 500 CastError on several controllers

**Expected:** GET /sales/not-an-object-id and DELETE /lifecycle/plantings/not-an-id should return 400 (invalid id) or 404, with a clean message.

**Observed:** Status 500 with Mongoose's raw 'Cast to ObjectId failed ... path "_id"' error surfaced to the client. Routes missing the isObjectId guard: sales get/delete, expense patch/delete, lifecycle plantings delete, KPI farm_id filter.

**Detail:** Probe: GET /sales/not-an-object-id -> 500 {error:'Cast to ObjectId failed for value ...'}

---

## Finding — Task 8 (2026-08-18T07:58:47.344Z)

**Severity:** minor

**Title:** SEC-04 no rate limiting / lockout on POST /auth/login

**Expected:** Repeated failed logins should be throttled or locked out (e.g. 429 after several attempts) to slow brute-force credential attacks.

**Observed:** 20 rapid bad logins all returned 2xx-401/400 responses — no 429, no backoff, no account lockout observed. Login endpoint is unbounded.

**Detail:** Probe: 15 rapid bad logins -> all [401]

---

## Finding — Task 8 (2026-08-18T07:58:49.035Z)

**Severity:** major

**Title:** SEC-05 any authenticated farmer can create/update/delete master-data entities

**Expected:** Farmers (role 'farmer') should not be able to mutate global master data (farms/blocks/crop-types/activity-types); only management or government roles should.

**Observed:** Status 201: a plain farmer (qa_farmer_f1_all) successfully POSTed a farm via /master-data/farms (the create guard only blocks role 'farmer_owner', not 'farmer'). The same route family also allows update/delete.

**Detail:** Probe: farmer POST /master-data/farms -> 201; DELETE -> 200

---

## Finding — FE Task FE-1 (2026-08-18T08:25:56.025Z)

**Severity:** info

**Title:** FE-REPLAY Logout is client-side only; the JWT remains valid if replayed

**Expected:** (No hard requirement — JWTs are commonly stateless.) Record that a token captured before logout still satisfies /auth/me.

**Observed:** role=superadmin: POST-logout replay of the same JWT returned 200 — the token is NOT invalidated server-side by logout.

**Detail:** Observed via /auth/me with the pre-logout token after localStorage was cleared (no server logout call exists).

---

## Finding — FE Task FE-1 (2026-08-18T08:30:25.127Z)

**Severity:** info

**Title:** FE-REDIRECT post-login redirect is hard-coded to /management for every role

**Expected:** (Informational — the app works, but the redirect is role-blind.) On login the SPA calls navigate('/management'); for non-management roles the protected route then bounces to '/' before the role home.

**Observed:** farmer login: URL sequence went login -> /management (denied) -> / -> /farmer; the app recovered to the correct dashboard, but with an extra navigation round-trip for every non-management role.

**Detail:** frontend/src/pages/Login.jsx: handleLogin -> navigate('/management')

---
