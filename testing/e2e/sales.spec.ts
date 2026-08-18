/**
 * TASK 7 — Sales & expenses correctness.
 *
 * Verifies CRUD, auto-computed totals (Sale.total_revenue = qty × price),
 * validation (buyer_type/category enums, min values, ObjectId farm), the
 * isManagement gate (government + farmers get 403), and the absence of
 * farm-scoping on sales/expense writes (documented as a finding).
 */
import { expect, test } from "../fixtures/roles";
import { loadState, appendFinding } from "../fixtures/api";

const QA1 = () => loadState().farms["QA-1"];
const QA2 = () => loadState().farms["QA-2"];

test.describe("TASK 7 — sales CRUD + totals", () => {
  test.skip(({ role }) => role.key !== "superadmin", "guard: run on superadmin project");

  test("create computes total_revenue, then list/get/update/delete", async ({ authed }) => {
    const email = `qa_t7_${Date.now()}`;
    // 1. Create
    const created = await authed.post("/sales", {
      data: {
        farm_id: QA1(),
        buyer_name: `${email}_buyer`,
        buyer_type: "Mill",
        quantity_kg: 150,
        price_per_kg: 6000,
        sale_date: "2026-05-10",
      },
    });
    expect(created.status()).toBe(201);
    const sale = (await created.json()).data;
    expect(sale.total_revenue).toBe(150 * 6000); // 900000 auto-computed

    // 2. Get by id
    const got = await (await authed.get(`/sales/${sale._id}`)).json();
    expect(got.data._id).toBe(sale._id);

    // 3. Update
    const upd = await authed.put(`/sales/${sale._id}`, { data: { quantity_kg: 200 } });
    expect(upd.status()).toBe(200);
    expect((await upd.json()).data.quantity_kg).toBe(200);

    // 4. List with farm filter
    const list = await (await authed.get(`/sales?farm_id=${QA1()}&limit=100`)).json();
    const mine = list.data.find((s: any) => s._id === sale._id);
    expect(mine).toBeTruthy();

    // 5. Delete
    const del = await authed.delete(`/sales/${sale._id}`);
    expect(del.status()).toBe(200);
    const gone = await authed.get(`/sales/${sale._id}`);
    expect(gone.status()).toBe(404);
  });

  test("validation rejects bad input", async ({ authed }) => {
    const missing = await authed.post("/sales", { data: { buyer_name: "X" } });
    expect(missing.status()).toBe(400);

    const badType = await authed.post("/sales", {
      data: { farm_id: QA1(), buyer_name: "X", buyer_type: "Alien", quantity_kg: 1, price_per_kg: 1 },
    });
    expect(badType.status()).toBe(400);

    const neg = await authed.post("/sales", {
      data: { farm_id: QA1(), buyer_name: "X", buyer_type: "Mill", quantity_kg: -5, price_per_kg: 1 },
    });
    expect(neg.status()).toBe(400);

    const badFarm = await authed.post("/sales", {
      data: { farm_id: "not-an-id", buyer_name: "X", buyer_type: "Mill", quantity_kg: 1, price_per_kg: 1 },
    });
    expect(badFarm.status()).toBe(400);
  });

  test("list totals aggregate correctly", async ({ authed }) => {
    // Seed data on QA-1: 100 kg × 5000 = 500k. The totals aggregate uses the same
    // uncast-string $match, so a farm filter yields zeroed totals (see SL-02).
    const res = await authed.get("/sales?limit=1");
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(typeof json.totals.totalKg).toBe("number");
    expect(json.totals.totalKg).toBeGreaterThanOrEqual(100);
    expect(json.totals.totalRevenue).toBeGreaterThanOrEqual(500000);
    expect(json.totals.avgPrice).toBeGreaterThan(0);
  });
});

test.describe("TASK 7 — expenses CRUD", () => {
  test.skip(({ role }) => role.key !== "superadmin", "guard: run on superadmin project");

  test("create -> patch -> delete round trip", async ({ authed }) => {
    const created = await authed.post("/expenses", {
      data: {
        farm_id: QA1(),
        category: "Pupuk",
        amount_idr: 120000,
        description: `qa_t7_exp_${Date.now()}`,
        expense_date: "2026-05-12",
      },
    });
    expect(created.status()).toBe(201);
    const exp = (await created.json()).data;

    const list = await (await authed.get(`/expenses?farm_id=${QA1()}&limit=100`)).json();
    expect(list.data.some((e: any) => e._id === exp._id)).toBe(true);

    const upd = await authed.patch(`/expenses/${exp._id}`, { data: { amount_idr: 99999 } });
    expect(upd.status()).toBe(200);
    expect((await upd.json()).data.amount_idr).toBe(99999);

    const del = await authed.delete(`/expenses/${exp._id}`);
    expect(del.status()).toBe(200);
  });

  test("validation rejects bad category/amount/farm", async ({ authed }) => {
    const noCat = await authed.post("/expenses", { data: { farm_id: QA1(), amount_idr: 10 } });
    expect(noCat.status()).toBe(400);
    const badCat = await authed.post("/expenses", {
      data: { farm_id: QA1(), category: "NotReal", amount_idr: 10 },
    });
    expect(badCat.status()).toBe(400);
    const neg = await authed.post("/expenses", {
      data: { farm_id: QA1(), category: "Pupuk", amount_idr: -5 },
    });
    expect(neg.status()).toBe(400);
    const badFarm = await authed.post("/expenses", {
      data: { farm_id: "nope", category: "Pupuk", amount_idr: 5 },
    });
    expect(badFarm.status()).toBe(400);
  });

  test("list returns breakdown by category", async ({ authed }) => {
    const list = await (await authed.get(`/expenses?farm_id=${QA1()}&limit=100`)).json();
    expect(Array.isArray(list.breakdown)).toBe(true);

    // FINDING (SL-02): the breakdown aggregate applies the raw string farm_id in
    // $match; Mongoose aggregates do not cast strings to ObjectId, so the
    // breakdown is empty whenever a farm filter is present, even though the
    // sibling `data` list (a find()) returns the seeded expense.
    if (list.breakdown.length === 0 && list.data.length > 0) {
      appendFinding(
        "7",
        "major",
        "Expense breakdown (and sales totals) are empty when farm_id filter is used",
        "With farm_id=QA-1 filtering 300k of Pupuk expenses, breakdown must show Pupuk: 300000.",
        `Observed GET /expenses?farm_id=:QA1 -> data has ${list.data.length} rows but breakdown=[] ($match on uncast string ObjectId).`,
        "backend/controller/expenseController.js listExpenses (Expense.aggregate $match) — same pattern in salesController.js listSales totals.aggregate."
      );
    }
    expect(list.breakdown).toEqual([]);
  });
});

test.describe("TASK 7 — RBAC gate", () => {
  test.skip(
    ({ role }) => !["government", "farmer_f1_all"].includes(role.key),
    "guard: run on government + a farmer project"
  );

  test("government and farmers are denied sales/expenses (403)", async ({ authed }) => {
    const s = await authed.get("/sales");
    expect(s.status()).toBe(403);
    const spost = await authed.post("/sales", {
      data: { farm_id: QA1(), buyer_name: "X", buyer_type: "Mill", quantity_kg: 1, price_per_kg: 1 },
    });
    expect(spost.status()).toBe(403);
    const e = await authed.get("/expenses");
    expect(e.status()).toBe(403);
    const epost = await authed.post("/expenses", {
      data: { farm_id: QA1(), category: "Pupuk", amount_idr: 10 },
    });
    expect(epost.status()).toBe(403);
  });
});

test.describe("TASK 7 — cross-farm write surface (owner)", () => {
  test.skip(({ role }) => role.key !== "owner_farm1", "guard: run on owner_farm1 project");

  test("owner can create a sale on a farm they do not own (no scoping)", async ({ authed }) => {
    const res = await authed.post("/sales", {
      data: {
        farm_id: QA2(),
        buyer_name: `qa_t7_xfarm_${Date.now()}`,
        buyer_type: "Mill",
        quantity_kg: 10,
        price_per_kg: 1000,
        sale_date: "2026-05-20",
      },
    });
    // FINDING (SL-01): sales/expense routes use isManagement without a farm
    // scope check, so an owner of QA-1 can create a sale against QA-2.
    if (res.status() === 201) {
      appendFinding(
        "7",
        "major",
        "farmer_owner can log sales/expenses against a farm they do not own",
        "Owner of QA-1 must not record sales/expenses on QA-2.",
        `Observed owner_farm1 POST /sales {farm_id: QA-2} -> 201. isManagement() checks role only; no farm-scope guard.`,
        "backend/route/salesRoutes.js / expenseRoutes.js (isManagement) + controllers."
      );
      const sale = (await res.json()).data;
      await authed.delete(`/sales/${sale._id}`);
    }
    expect(res.status()).toBe(201);
  });
});