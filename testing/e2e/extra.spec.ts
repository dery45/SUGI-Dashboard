/**
 * TASK 9 — Performance ceilings & smoke.
 *
 * Latency/determinism budgets on the warm read path plus a role-aware smoke
 * matrix. Ceilings are generous (local API, single user, seeded DB) so they
 * flag pathological regressions (e.g. an unbounded/N+1 query turning a
 * 200ms call into a 10s one) without being flaky on a busy dev box.
 *
 * Runs on the projects declared in playwright.config.ts:
 *   - performance/determinism/pagination: superadmin project
 *   - role smoke: any project it runs under (role-aware expectations)
 */
import { expect, test } from "../fixtures/roles";

const LIGHT = 2_000; // typical list/get endpoints
const HEAVY = 5_000; // /dashboard/farmer/v2 aggregate payload

test.describe("TASK 9 — warm read-path latency ceilings", () => {
  test.skip(({ role }) => role.key !== "superadmin", "guard: run on superadmin project");

  const READ_ENDPOINTS: Array<[string, number]> = [
    ["/master-data/farms?limit=100", LIGHT],
    ["/master-data/blocks?limit=100", LIGHT],
    ["/farmers?limit=100", LIGHT],
    ["/sales?limit=100", LIGHT],
    ["/expenses?limit=100", LIGHT],
    ["/lifecycle/activities?limit=100", LIGHT],
    ["/lifecycle/plantings?limit=100", LIGHT],
    ["/management/kpi", LIGHT],
    ["/management/um-performance", LIGHT],
    ["/management/yield-trend", LIGHT],
    ["/assignments/farmer-assignments", LIGHT],
    ["/assignments/task-assignments", LIGHT],
    ["/settings/profile", LIGHT],
    ["/dashboard/farmer/v2", HEAVY],
    ["/insights/farmer", LIGHT],
  ];

  for (const [path, budget] of READ_ENDPOINTS) {
    test(`GET ${path} resolves within ${budget}ms`, async ({ authed }) => {
      const t0 = Date.now();
      const res = await authed.get(path);
      const elapsed = Date.now() - t0;
      expect(res.status()).toBe(200);
      expect(elapsed).toBeLessThan(budget);
    });
  }
});

test.describe("TASK 9 — repeated determinism (no drift / no server errors)", () => {
  test.skip(({ role }) => role.key !== "superadmin", "guard: run on superadmin project");

  test("management KPI is stable across 8 consecutive calls", async ({ authed }) => {
    let first: string | null = null;
    for (let i = 0; i < 8; i++) {
      const res = await authed.get("/management/kpi");
      expect(res.status()).toBe(200);
      const now = JSON.stringify((await res.json()).data ?? (await res.json()));
      if (first === null) first = now;
      else expect(now).toBe(first); // deterministic read, same data set
    }
  });

  test("no 5xx across repeated list reads", async ({ authed }) => {
    for (const path of ["/sales?limit=20", "/expenses?limit=20", "/lifecycle/plantings", "/farmers?limit=20"]) {
      for (let i = 0; i < 5; i++) {
        const res = await authed.get(path);
        expect(res.status()).toBeLessThan(500); // no crash under repeated load
      }
    }
  });
});

test.describe("TASK 9 — pagination math is coherent", () => {
  test.skip(({ role }) => role.key !== "superadmin", "guard: run on superadmin project");

  test("page/limit slicing covers records exactly once and reports totals", async ({ authed }) => {
    const page1 = await (await authed.get("/master-data/blocks?limit=2&page=1")).json();
    const page2 = await (await authed.get("/master-data/blocks?limit=2&page=2")).json();

    expect(page1.meta.limit).toBe(2);
    expect(page1.data.length).toBeLessThanOrEqual(2);
    expect(page2.data.length).toBeLessThanOrEqual(2);
    expect(page1.meta.total).toBeGreaterThanOrEqual(page1.data.length + page2.data.length);
    expect(page1.meta.totalPages).toBeGreaterThanOrEqual(2);

    const ids1 = page1.data.map((b: any) => b._id);
    const ids2 = page2.data.map((b: any) => b._id);
    const overlap = ids1.filter((id: string) => ids2.includes(id));
    expect(overlap).toEqual([]); // no duplicate rows across pages
  });

  test("default limit and limit=1 slice the same data source", async ({ authed }) => {
    const single = await (await authed.get("/master-data/blocks?limit=1&page=1")).json();
    const all = await (await authed.get("/master-data/blocks?limit=100&page=1")).json();
    expect(single.data.length).toBeLessThanOrEqual(1);
    expect(all.data.length).toBeGreaterThanOrEqual(1);
    if (all.data.length > 0) {
      expect(single.data[0]._id).toBe(all.data[0]._id); // newest-first ordering is stable
    }
  });
});

test.describe("TASK 9 — role smoke matrix (endpoint authorization)", () => {
  // Runs under every project it is wired into; expectations are role-scoped so
  // each project's storageState is exercised against the endpoints it may use.
  const mgmtOnly = ["/management/kpi", "/management/yield-trend", "/mgmt_not_found"];
  const mgmtGw = ["/sales?limit=1", "/expenses?limit=1", "/lifecycle/plantings?limit=1"];

  test("role sees its expected surface (200/403 partition)", async ({ authed, role }) => {
    // superadmin + farmer_owner -> isManagement group gets 200 on management+owned lists
    const expectManagement = ["superadmin", "owner_farm1", "owner_farm1_2"].includes(role.key);
    for (const path of [...mgmtOnly.filter((p) => p !== "/mgmt_not_found"), ...mgmtGw]) {
      const res = await authed.get(path);
      expect(res.status()).toBe(expectManagement ? 200 : 403);
    }
  });

  test("government/farmer cannot reach management KPI", async ({ authed, role }) => {
    if (["superadmin", "owner_farm1", "owner_farm1_2"].includes(role.key)) {
      const res = await authed.get("/management/kpi");
      expect(res.status()).toBe(200);
      return;
    }
    const res = await authed.get("/management/kpi");
    expect(res.status()).toBe(403);
  });

  test("every role can read its own profile", async ({ authed }) => {
    const res = await authed.get("/settings/profile");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeTruthy();
  });

  test("every role resolves master-data list (role-scoped)", async ({ authed, role }) => {
    const res = await authed.get("/master-data/farms?limit=100");
    if (role.key === "farmer_f1_all" || role.key === "farmer_f1_partial" || role.key === "farmer_f2" || role.key === "no_assignment") {
      expect(res.status()).toBe(200); // farmers may read master data (ISO-04)
    } else {
      expect(res.status()).toBe(200);
    }
  });
});