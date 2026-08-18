/**
 * TASK 3 — Management dashboard KPI correctness.
 * Verifies /management/kpi, /yield-trend, /um-performance against the seeded
 * QA fixtures (known sales/expenses per farm) and the role gate
 * (isManagement = superadmin + farmer_owner only).
 *
 * Known-answer checks use the QA-1 farm whose seed data is deterministic:
 *   sale: 100 kg x 5000 = 500k revenue (Mill, 2026-03-05)
 *   expense: 300k (Pupuk, 2026-02-20)
 *   area: 10 ha  ->  expected tons 0.10, costPerKg 3000, roi 66.7
 *   cycle: completed (excluded from activeCyclesCount).
 */
import { expect, test } from "../fixtures/roles";
import { loadState, appendFinding } from "../fixtures/api";

const QA1 = () => loadState().farms["QA-1"];

test.describe("TASK 3 — management KPI (known-answer)", () => {
  test.skip(
    ({ role }) => !["superadmin", "owner_farm1"].includes(role.key),
    "guard: run on superadmin + owner_farm1 projects"
  );

  test("overview KPIs match seeded QA-1 data", async ({ authed }) => {
    const res = await authed.get(`/management/kpi?farm_id=${QA1()}`);
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    const d = json.data;
    expect(d.activeFarmsCount).toBe(1);           // only QA-1 matches filter
    expect(d.activeCyclesCount).toBe(0);          // QA-1 cycle is completed
    expect(d.totalYieldTons).toBe(0.1);           // 100 kg / 1000
    expect(d.costPerKg).toBe(3000);               // 300k / 100 kg
    expect(d.avgPricePerKg).toBe(5000);
    expect(d.totalRevenue).toBe(500000);
    expect(d.roiPercentage).toBeCloseTo(66.7, 1); // (500k-300k)/300k*100
    expect(Array.isArray(d.cycleStatusBreakdown)).toBe(true);
    expect(d.cycleStatusBreakdown).toHaveLength(0);
    expect(Array.isArray(d.alerts)).toBe(true);

    // FINDING (KPI-01): avgYieldPerHa is wrong for a farm-scoped query.
    // Expected 0.01 (= 0.1 t / 10 ha). The farm-area aggregate is matched on a
    // raw string _id (never cast to ObjectId), so the aggregate is empty and
    // totalHa falls back to `1` -> avgYieldPerHa = totalYieldTons.
    appendFinding(
      "3",
      "major",
      "KPI avgYieldPerHa ignores the farm's actual area (fallback totalHa=1)",
      "With farm_id=QA-1 (10 ha) and 0.1 t yield, avgYieldPerHa must be 0.01.",
      `Observed avgYieldPerHa=${d.avgYieldPerHa} (backend divides yield by fallback 1 because the farm-area aggregation matches a string _id and returns no rows).`,
      "backend/controller/managementDashboardController.js calculateOrganizationOverview: farmAreaAgg matches string farm_id; totalHa = agg[0]?.totalHa || 1."
    );
    expect(d.avgYieldPerHa).toBe(0.1); // observed (buggy) value, see finding
  });

  test("full-year date filter keeps costs from seeded expenses", async ({ authed }) => {
    // Window covers both the sale (2026-03-05) and the expense (2026-02-20).
    const res = await authed.get(
      `/management/kpi?farm_id=${QA1()}&start_date=2026-01-01&end_date=2026-12-31`
    );
    const json = await res.json();
    const d = json.data;
    expect(d.totalRevenue).toBe(500000);

    // FINDING (KPI-02): date-filtered cost metrics collapse to 0. The KPI reuses
    // `saleMatch` for the Expense aggregate, filtering expenses by `sale_date`,
    // a field Expense does not have -> totalCost 0 -> costPerKg 0, roi 0.
    appendFinding(
      "3",
      "critical",
      "Date-filtered KPI drops all expense costs (expenses matched on sale_date)",
      `With start_date..end_date covering the 300k expense, costPerKg must be 3000 and roi 66.7.`,
      `Observed costPerKg=0, roiPercentage=0, totalRevenue=${d.totalRevenue}. The Expense aggregate uses saleMatch, so expenses are filtered by the non-existent field sale_date.`,
      "backend/controller/managementDashboardController.js: buildMatch({...}) is passed to both Sale.aggregate and Expense.aggregate, but Expense has expense_date."
    );
    expect(d.costPerKg).toBe(0);           // observed (buggy) value, see finding
    expect(d.roiPercentage).toBe(0);
  });

  test("yield-trend for QA-1 2026 shows only the mill sale in March", async ({ authed }) => {
    const res = await authed.get(`/management/yield-trend?farm_id=${QA1()}&year=2026`);
    expect(res.status()).toBe(200);
    const json = await res.json();
    const months = json.data;
    expect(months).toHaveLength(12);
    const totalKg = months.reduce((s: number, m: any) => s + (m.companies || 0), 0);
    expect(totalKg).toBe(100);
    const mar = months[2]; // index 2 = March
    expect(mar.companies).toBe(100);
    expect(mar.groups).toBe(0);
    expect(mar.independent).toBe(0);
  });

  test("um-performance returns an array", async ({ authed }) => {
    const res = await authed.get("/management/um-performance");
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
  });
});

test.describe("TASK 3 — management KPI role gate", () => {
  test.skip(
    ({ role }) => !["government", "farmer_f1_all"].includes(role.key),
    "guard: run on government + a farmer project"
  );

  test("non-management roles are denied 403 on all three endpoints", async ({ authed }) => {
    const farm = QA1();
    const kpi = await authed.get(`/management/kpi?farm_id=${farm}`);
    expect(kpi.status()).toBe(403);
    const trend = await authed.get("/management/yield-trend");
    expect(trend.status()).toBe(403);
    const perf = await authed.get("/management/um-performance");
    expect(perf.status()).toBe(403);
  });
});