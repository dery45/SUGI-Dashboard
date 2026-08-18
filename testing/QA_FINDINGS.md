
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
