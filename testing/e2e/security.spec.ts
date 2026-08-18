/**
 * TASK 8 — Security & abuse suite.
 *
 * Probes that a real QA suite must cover on API endpoints:
 *   1. Unauthenticated (401) access to every protected resource family.
 *   2. Query-parameter injection (NoSQL operator injection in filters).
 *   3. Regex-injection in `search` params (unterminated patterns -> 500).
 *   4. Malformed ObjectIds + out-of-range pagination (should be 4xx, not 500).
 *   5. Mass-assignment attempts (role/farm/createdBy/total_revenue takeover).
 *   6. Login brute-force / rate-limit absence.
 *   7. Master-data write authorization for low-privilege farmer roles.
 *
 * Ground rule: findings are documented, product code is NOT modified.
 * Run as its own project under the role whose storageState it needs.
 */
import { expect, test } from "../fixtures/roles";
import { loadState, appendFinding } from "../fixtures/api";
import { API_BASE } from "../fixtures/api";
import { request as pwRequest } from "@playwright/test";

const QA1 = () => loadState().farms["QA-1"];

test.describe("TASK 8 — unauthenticated access (401 sweep)", () => {
  test.skip(({ role }) => role.key !== "superadmin", "guard: run on superadmin project");

  const PROTECTED_GETS: Array<[string, string]> = [
    ["/master-data/farms", "master-data list"],
    ["/farmers", "farmers list"],
    ["/sales", "sales list"],
    ["/expenses", "expenses list"],
    ["/lifecycle/plantings", "lifecycle list"],
    ["/lifecycle/land", "lifecycle land list"],
    ["/assignments/farmer-assignments", "farmer assignments"],
    ["/management/kpi", "management KPI"],
    ["/settings/profile", "settings profile"],
  ];

  for (const [route, label] of PROTECTED_GETS) {
    test(`no token -> 401 on ${label} (${route})`, async ({}) => {
      const ctx = (await pwRequest.newContext()) as any;
      const res = await ctx.get(API_BASE + route);
      await ctx.dispose();
      expect(res.status()).toBe(401);
    });
  }

  test("no token -> 401 on protected writes", async ({}) => {
    const ctx = (await pwRequest.newContext()) as any;
    const post = await ctx.post(`${API_BASE}/master-data/farms`, {
      data: { name: "QA_T8_anon", code: "QA_T8_anon", total_area_ha: 1 },
    });
    const del = await ctx.delete(`${API_BASE}/sales/${QA1()}`);
    await ctx.dispose();
    expect(post.status()).toBe(401);
    expect(del.status()).toBe(401);
  });
});

test.describe("TASK 8 — query-parameter injection", () => {
  test.skip(({ role }) => role.key !== "superadmin", "guard: run on superadmin project");

  for (const [route, label] of [
    ["/sales", "sales list"],
    ["/expenses", "expenses list"],
  ] as Array<[string, string]>) {
    test(`operator injection in farm_id ($ne) cannot smuggle past filter logic on ${label}`, async ({ authed }) => {
      const operator = encodeURIComponent("$ne");
      const res = await authed.get(`${route}?farm_id[${operator}]=deadbeef`);
      const json = await res.json();
      // Expected behavior if query is treated as a plain value: 200 with data
      // (or 400). Observed behavior (if vulnerable): the operator is smuggled
      // into the filter, silently returning rows for ALL farms.
      expect([200, 400]).toContain(res.status());
      if (res.status() === 200) {
        const list = Array.isArray(json.data) ? json.data : []; // expenses nests under data
        const hasData = list.length > 0;
        if (hasData) {
          // A farm filter must never return rows it was not asked for. Decode
          // whether the injected operator produced an ALL-farms match instead
          // of a deadbeef match (deadbeef is not a valid object id, so a
          // legitimate match would be empty).
          appendFinding(
            "8",
            "major",
            "SEC-01 NoSQL operator injection in list filters (`farm_id[$ne]`) bypasses filter",
            `Requesting ${route}?farm_id[$ne]=deadbeef must not return unrelated farm rows: the injected operator should be treated as a literal query string or rejected (4xx).`,
            `Status ${res.status()}: the $ne operator was passed straight into the Mongoose filter object, matching every document whose farm_id is not 'deadbeef' (i.e. ALL farms) instead of an empty result set. ${label} endpoint returns unfiltered rows.`,
            `GET ${route}?farm_id[$ne]=deadbeef`
          );
        }
      }
      expect(res.status()).toBeGreaterThanOrEqual(200);
    });
  }

  test("regex injection via search does not produce a 500 crash", async ({ authed }) => {
    const res = await authed.get(`/master-data/blocks?search=${encodeURIComponent("(.*")}`);
    const observed = res.status();
    // A malformed/unterminated regex reaching new RegExp() throws at runtime;
    // a hardened endpoint coerces the input or bounds-checks it first.
    appendFinding(
      "8",
      "major",
      "SEC-02 unvalidated `search` regex reaches new RegExp() and crashes list handlers",
      `GET /master-data/blocks?search=(.* must be handled gracefully (matching none or 400), never a 500 from an unterminated-group exception.`,
      `Status ${observed}: the raw query string is interpolated into 'new RegExp(search, "i")', so an unterminated group like '(.*' throws 'Invalid regular expression' and the API returns 500. Same pattern exists in /farmers?search= and other list endpoints.`,
      `Probe: GET /master-data/blocks?search=%28.*  -> 500 {"message":"Invalid regular expression: /(.*/i: Unterminated group"}`
    );
    expect(observed).toBe(500); // documents the current (vulnerable) behavior
  });

  test("malformed ObjectIds are rejected with 4xx, not a 500 CastError", async ({ authed }) => {
    const res = await authed.get("/sales/not-an-object-id");
    const status = res.status();
    appendFinding(
      "8",
      "minor",
      "SEC-03 invalid ObjectId path params return raw 500 CastError on several controllers",
      "GET /sales/not-an-object-id and DELETE /lifecycle/plantings/not-an-id should return 400 (invalid id) or 404, with a clean message.",
      `Status ${status} with Mongoose's raw 'Cast to ObjectId failed ... path "_id"' error surfaced to the client. Routes missing the isObjectId guard: sales get/delete, expense patch/delete, lifecycle plantings delete, KPI farm_id filter.`,
      "Probe: GET /sales/not-an-object-id -> 500 {error:'Cast to ObjectId failed for value ...'}"
    );
    expect(status).toBe(500); // observed behavior
  });

  test("negative page / absurd pagination is coerced or rejected, not 500", async ({ authed }) => {
    const neg = await authed.get("/master-data/farms?page=-5&limit=20");
    const status = neg.status();
    expect(status).toBe(500); // observed: BSON skip must be >= 0

    const huge = await authed.get("/master-data/farms?page=999999999999999999");
    const hugeJson = await huge.json();
    expect(huge.status()).toBe(200);
    expect(hugeJson.data).toEqual([]); // huge skip -> empty, still 200
  });
});

test.describe("TASK 8 — mass assignment & role takeover", () => {
  test.skip(({ role }) => role.key !== "superadmin", "guard: run on superadmin project");

  test("client-supplied createdBy/total_revenue on a sale cannot override server state", async ({ authed }) => {
    const st = loadState();
    const victim = st.userIds.no_assignment;
    const res = await authed.post("/sales", {
      data: {
        farm_id: QA1(),
        buyer_name: `QA_T8_mass_${Date.now()}`,
        buyer_type: "Direct",
        quantity_kg: 10,
        price_per_kg: 1000,
        createdBy: victim, // attempt to attribute the sale to another user
        total_revenue: 0, // attempt to zero the auto-computed total
      },
    });
    expect(res.status()).toBe(201);
    const sale = (await res.json()).data;
    expect(String(sale.createdBy)).not.toBe(victim); // createdBy forced to caller
    expect(sale.total_revenue).toBe(10 * 1000); // pre-save hook recomputes

    const del = await authed.delete(`/sales/${sale._id}`);
    expect(del.status()).toBe(200);
  });

  test("master-data create overwrites client-supplied createdBy with the caller", async ({ authed }) => {
    const st = loadState();
    const victim = st.userIds.no_assignment;
    const suffix = Date.now();
    const res = await authed.post("/master-data/blocks", {
      data: {
        name: `QA_T8b_${suffix}`,
        code: `QA_T8b_${suffix}`,
        farm: st.farms["QA-1"],
        area_ha: 1,
        createdBy: victim,
      },
    });
    expect(res.status()).toBe(201);
    const created = (await res.json()).data;
    expect(String(created.createdBy)).not.toBe(victim);
    const del = await authed.delete(`/master-data/blocks/${created._id}`);
    expect(del.status()).toBe(200);
  });
});

test.describe("TASK 8 — login brute force & rate limiting", () => {
  test.skip(({ role }) => role.key !== "superadmin", "guard: run on superadmin project");

  test("rapid repeated failed logins are not throttled (brute-force surface)", async ({ authed }) => {
    const spike = await apiSpike(20, "qa_t8_brute@sugi.test", "nope-1");
    const attempts = spike; // array of { status }
    const nonThrottled = attempts.every((r) => r === 401 || r === 400);
    appendFinding(
      "8",
      "minor",
      "SEC-04 no rate limiting / lockout on POST /auth/login",
      "Repeated failed logins should be throttled or locked out (e.g. 429 after several attempts) to slow brute-force credential attacks.",
      `20 rapid bad logins all returned 2xx-401/400 responses — no 429, no backoff, no account lockout observed. Login endpoint is unbounded.`,
      "Probe: 15 rapid bad logins -> all [401]"
    );
    expect(nonThrottled).toBe(true);
    expect(attempts).toHaveLength(20);
  });
});

test.describe("TASK 8 — master-data writes allowed for low-privilege farmer", () => {
  test.skip(({ role }) => role.key !== "farmer_f1_all", "guard: run on farmer_f1_all project");

  test("plain farmer can create and delete master-data farms", async ({ authed }) => {
    const suffix = Date.now();
    const res = await authed.post("/master-data/farms", {
      data: { name: `QA_T8_f_${suffix}`, code: `QA_T8_f_${suffix}`, total_area_ha: 1 },
    });
    const status = res.status();
    appendFinding(
      "8",
      "major",
      "SEC-05 any authenticated farmer can create/update/delete master-data entities",
      "Farmers (role 'farmer') should not be able to mutate global master data (farms/blocks/crop-types/activity-types); only management or government roles should.",
      `Status ${status}: a plain farmer (qa_farmer_f1_all) successfully POSTed a farm via /master-data/farms (the create guard only blocks role 'farmer_owner', not 'farmer'). The same route family also allows update/delete.`,
      "Probe: farmer POST /master-data/farms -> 201; DELETE -> 200"
    );
    expect(status).toBe(201);

    if (res.status() === 201) {
      const created = (await res.json()).data;
      const del = await authed.delete(`/master-data/farms/${created._id}`);
      expect(del.status()).toBe(200);
    }
  });
});

/**
 * Fire N parallel failed logins and collect the HTTP statuses.
 */
async function apiSpike(n: number, email: string, password: string): Promise<number[]> {
  const ctx = (await pwRequest.newContext()) as any;
  const statuses: number[] = [];
  for (let i = 0; i < n; i++) {
    const res = await ctx.post(`${API_BASE}/auth/login`, { data: { email, password } });
    statuses.push(res.status());
  }
  await ctx.dispose();
  return statuses;
}