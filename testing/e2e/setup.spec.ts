/**
 * TASK 0 verification: the seed is idempotent.
 * Re-running setup against already-seeded data must not fail nor duplicate.
 */
import { test, expect } from "@playwright/test";
import { ADMIN_SEED, API_BASE, ROLES, login } from "../fixtures/api";
import { runSeed } from "../fixtures/seed";

test.describe("TASK 0 — seed idempotency", () => {
  test("re-running global setup does not duplicate fixtures", async ({ request }) => {
    const admin = await login(ADMIN_SEED.email, ADMIN_SEED.password);

    // Run the seed once more on top of what global-setup already seeded.
    const state = await runSeed(admin.token, () => {});

    // Farms must be exactly 2 (QA-1, QA-2) — reusing, not duplicating.
    const farmsRes = await request.get(`${API_BASE}/master-data/farms/all`, {
      headers: { Authorization: `Bearer ${admin.token}` },
    });
    const farmsJson = await farmsRes.json();
    const qaFarms = (farmsJson.data || []).filter((f: any) => f.code.startsWith("QA-"));
    expect(qaFarms).toHaveLength(2);
    expect(qaFarms.map((f: any) => f.code).sort()).toEqual(["QA-1", "QA-2"]);

    // Blocks: 4 QA blocks, one per code.
    const blocksRes = await request.get(`${API_BASE}/master-data/blocks/all`, {
      headers: { Authorization: `Bearer ${admin.token}` },
    });
    const blocksJson = await blocksRes.json();
    const qaBlocks = (blocksJson.data || []).filter((b: any) => String(b.code).startsWith("QA-"));
    expect(qaBlocks.map((b: any) => b.code).sort()).toEqual(["QA-1A", "QA-1B", "QA-2A", "QA-2B"]);

    // Users: every role fixture exists exactly once (throwaway TASK-5 users may
    // accumulate from other specs, so assert on the canonical role emails).
    const usersRes = await request.get(`${API_BASE}/farmers?limit=500`, {
      headers: { Authorization: `Bearer ${admin.token}` },
    });
    const usersJson = await usersRes.json();
    const qaUsers = (usersJson.data || []).filter((u: any) => /^qa_[a-z0-9_]+@sugi\.test$/.test(u.email));
    const roleEmails = Object.values(ROLES).map((r) => r.email);
    for (const email of roleEmails) {
      const matches = qaUsers.filter((u: any) => u.email === email);
      expect(matches).toHaveLength(1);
    }

    // Every role can still log in.
    for (const fixture of Object.values(ROLES)) {
      const { token } = await login(fixture.email, fixture.password);
      expect(token).toBeTruthy();
    }

    // State file reflects stable ids.
    expect(state.farms["QA-1"]).toBeTruthy();
    expect(state.farms["QA-2"]).toBeTruthy();
    expect(state.cycles["QA-1"]).toBeTruthy();
    expect(state.cycles["QA-2"]).toBeTruthy();
    expect(state.sales.length).toBeGreaterThanOrEqual(2);
    expect(state.expenses.length).toBeGreaterThanOrEqual(2);
  });

  test("sales/expenses for QA farms are tagged", async ({ request }) => {
    const admin = await login(ADMIN_SEED.email, ADMIN_SEED.password);
    const headers = { Authorization: `Bearer ${admin.token}` };

    const salesRes = await request.get(`${API_BASE}/sales?limit=100`, { headers });
    const salesJson = await salesRes.json();
    const qaSales = (salesJson.data || []).filter((s: any) => String(s.buyer_name || "").startsWith("QA_"));
    expect(qaSales.length).toBeGreaterThanOrEqual(2);

    const expRes = await request.get(`${API_BASE}/expenses?limit=100`, { headers });
    const expJson = await expRes.json();
    const qaExps = (expJson.data || []).filter((e: any) => String(e.description || "").startsWith("QA_"));
    expect(qaExps.length).toBeGreaterThanOrEqual(2);
  });
});