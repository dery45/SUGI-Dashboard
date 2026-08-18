/**
 * TASK 4 — Lifecycle state machine.
 *
 * The cycle is created ONLY at POST /lifecycle/land (status Land_Preparation).
 * Each later stage advances the status via a strict gate:
 *   planting   requires [Planned, Land_Preparation]   -> Planted
 *   activity   requires [Planted, Maintenance]        -> Maintenance
 *   harvest    requires [Planted, Maintenance, Harvesting] -> Harvesting
 *   closing a harvest (Closed/Completed) finalizes the cycle -> Completed
 *
 * Verifies the happy path, the gate rejections, /cycles/eligible, the PUT
 * status-bypass surface, and the isManagement gate (government + farmer 403).
 */
import { expect, test } from "../fixtures/roles";
import { loadState, appendFinding } from "../fixtures/api";

const QA1 = () => loadState().farms["QA-1"];
const QA2 = () => loadState().farms["QA-2"];
const B1A = () => loadState().blocks["QA-1A"];

/** Create a fresh cycle via the single entry point; returns { cycleId, landId }. */
async function newCycle(api: any, farmId: string, tag: string) {
  const res = await api.post("/lifecycle/land", {
    data: {
      farm_id: farmId,
      farm_master: farmId,
      block: B1A(),
      land_opening_date: "2026-04-01",
      notes: `QA_T4_${tag}`,
    },
  });
  expect(res.status()).toBe(201);
  const json = await res.json();
  const cycleId = json.crop_cycle?._id;
  expect(cycleId).toBeTruthy();
  return { cycleId, landId: json.data?._id };
}

/** Remove a throwaway cycle so active-count KPIs in later projects stay clean. */
async function disposeCycle(api: any, cycleId: string) {
  await api.delete(`/lifecycle/plantings/${cycleId}`);
}

test.describe("TASK 4 — lifecycle state machine (happy path)", () => {
  test.skip(
    ({ role }) => !["superadmin", "owner_farm1"].includes(role.key),
    "guard: run on superadmin + owner_farm1 projects"
  );

  test("land -> planting -> maintenance -> harvest -> closed (Completed)", async ({ authed }) => {
    const { cycleId, landId } = await newCycle(authed, QA1(), "happy");

    // 1. Single entry point: POST /lifecycle/land created a LandRecord AND a cycle.
    expect(landId).toBeTruthy();
    const landList = await (await authed.get("/lifecycle/land")).json();
    expect(landList.data.map((l: any) => String(l._id))).toContain(landId);

    // Planting advances to Planted.
    const pl = await authed.post("/lifecycle/plantings", {
      data: { crop_cycle_id: cycleId, crop_type: "QA_Timun", planting_date: "2026-04-05" },
    });
    expect(pl.status()).toBe(201);
    expect((await pl.json()).data.status).toBe("Planted");

    // Activity advances to Maintenance.
    const ac = await authed.post("/lifecycle/activities", {
      data: { crop_cycle_id: cycleId, date: "2026-04-10", activity_type: "Penyiangan", description: "QA_T4_happy" },
    });
    expect(ac.status()).toBe(201);
    expect((await ac.json()).data._id).toBeTruthy();

    // Harvest open advances to Harvesting.
    const hv = await authed.post("/lifecycle/harvests", {
      data: { crop_cycle_id: cycleId, harvest_opening_date: "2026-05-01", expected_yield_kg: 100, notes: "QA_T4_happy" },
    });
    expect(hv.status()).toBe(201);
    const harvest = await hv.json();
    const harvestId = harvest.data._id;

    // Closing the harvest finalizes the cycle.
    const cl = await authed.put(`/lifecycle/harvests/${harvestId}`, { data: { status: "Closed" } });
    expect(cl.status()).toBe(200);

    const cycle = await (await authed.get("/lifecycle/plantings")).json();
    const hit = cycle.data.find((c: any) => String(c._id) === cycleId);
    expect(hit.status).toBe("Completed");
  });
});

test.describe("TASK 4 — lifecycle gates (negative)", () => {
  test.skip(
    ({ role }) => !["superadmin", "owner_farm1"].includes(role.key),
    "guard: run on superadmin + owner_farm1 projects"
  );

  test("planting a second time on a Planted cycle is rejected (400)", async ({ authed }) => {
    const { cycleId } = await newCycle(authed, QA1(), "g-replant");
    await authed.post("/lifecycle/plantings", { data: { crop_cycle_id: cycleId } });
    const again = await authed.post("/lifecycle/plantings", { data: { crop_cycle_id: cycleId } });
    expect(again.status()).toBe(400);
    await disposeCycle(authed, cycleId);
  });

  test("activity on a Land_Preparation cycle is rejected (400)", async ({ authed }) => {
    const { cycleId } = await newCycle(authed, QA1(), "g-act");
    const res = await authed.post("/lifecycle/activities", {
      data: { crop_cycle_id: cycleId, date: "2026-04-10" },
    });
    expect(res.status()).toBe(400);
    await disposeCycle(authed, cycleId);
  });

  test("harvest on a Land_Preparation cycle is rejected (400)", async ({ authed }) => {
    const { cycleId } = await newCycle(authed, QA1(), "g-hv");
    const res = await authed.post("/lifecycle/harvests", {
      data: { crop_cycle_id: cycleId, harvest_opening_date: "2026-05-01" },
    });
    expect(res.status()).toBe(400);
    await disposeCycle(authed, cycleId);
  });

  test("planting with a bogus cycle id is rejected (400/404)", async ({ authed }) => {
    const bad = await authed.post("/lifecycle/plantings", {
      data: { crop_cycle_id: "not-an-object-id" },
    });
    expect(bad.status()).toBe(400);
    const missing = await authed.post("/lifecycle/plantings", {
      data: { crop_cycle_id: "000000000000000000000000" },
    });
    expect(missing.status()).toBe(404);
  });
});

test.describe("TASK 4 — /cycles/eligible", () => {
  test.skip(
    ({ role }) => !["superadmin", "owner_farm1"].includes(role.key),
    "guard: run on superadmin + owner_farm1 projects"
  );

  test("eligible listing reflects the current stage only", async ({ authed }) => {
    const { cycleId } = await newCycle(authed, QA1(), "elig");

    const planting = await (await authed.get("/lifecycle/cycles/eligible?stage=planting")).json();
    expect(planting.data.map((c: any) => String(c._id))).toContain(cycleId);

    const maintenance = await (await authed.get("/lifecycle/cycles/eligible?stage=maintenance")).json();
    expect(maintenance.data.map((c: any) => String(c._id))).not.toContain(cycleId);

    const bad = await authed.get("/lifecycle/cycles/eligible?stage=nonsense");
    expect(bad.status()).toBe(400);
    await disposeCycle(authed, cycleId);
  });
});

test.describe("TASK 4 — PUT status bypass surface", () => {
  test.skip(
    ({ role }) => !["superadmin", "owner_farm1"].includes(role.key),
    "guard: run on superadmin + owner_farm1 projects"
  );

  test("PUT /lifecycle/plantings/:id accepts an arbitrary status (gate bypass)", async ({ authed }) => {
    const { cycleId } = await newCycle(authed, QA1(), "bypass");
    // A fresh cycle is Land_Preparation. A direct PUT should only allow
    // planting data edits, never a jump to a later status.
    const res = await authed.put(`/lifecycle/plantings/${cycleId}`, {
      data: { status: "Completed", notes: "QA_T4_bypass" },
    });
    if (res.status() === 200) {
      const json = await res.json();
      // FINDING (LC-01): PUT /lifecycle/plantings/:id is a raw findByIdAndUpdate
      // with no STAGE_REQ gate, so a caller can force any status directly,
      // skipping planted/maintenance/harvest stages.
      appendFinding(
        "4",
        "major",
        "PUT /lifecycle/plantings/:id bypasses the stage gate (arbitrary status)",
        "A cycle in Land_Preparation must not become Completed without passing plant -> maintain -> harvest.",
        `Observed PUT {status:"Completed"} -> 200 with status=${json.data?.status}. updatePlanting uses CropCycle.findByIdAndUpdate(req.body) with no eligibility check.`,
        "backend/controller/lifecycleController.js updatePlanting (and updateActivity/updateLand share the raw findByIdAndUpdate pattern)."
      );
      expect(json.data.status).toBe("Completed");
    } else {
      expect(res.status()).toBe(400);
    }
  });
});

test.describe("TASK 4 — RBAC gate", () => {
  test.skip(
    ({ role }) => !["government", "farmer_f1_all"].includes(role.key),
    "guard: run on government + a farmer project"
  );

  test("government and farmers get 403 on lifecycle endpoints", async ({ authed }) => {
    const list = await authed.get("/lifecycle/land");
    expect(list.status()).toBe(403);
    const create = await authed.post("/lifecycle/land", {
      data: { farm_id: QA1(), land_opening_date: "2026-04-01" },
    });
    expect(create.status()).toBe(403);
    const elig = await authed.get("/lifecycle/cycles/eligible?stage=planting");
    expect(elig.status()).toBe(403);
  });
});
