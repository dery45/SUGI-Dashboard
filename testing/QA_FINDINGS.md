
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
