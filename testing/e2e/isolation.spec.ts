/**
 * TASK 6 — Cross-farm isolation.
 *
 * Owner/farmer scoping invariants:
 *   owner_farm1      -> assigned QA-1 only
 *   owner_farm1_2    -> assigned QA-1 + QA-2
 *   farmer_f1_all    -> assignment on block QA-1A (farm QA-1)
 *   farmer_f2        -> assignment on block QA-2A (farm QA-2)
 *
 * Verifies read isolation (lifecycle lists, assignments, master-data get) and
 * documents write-surface violations (land/assignment creation outside the
 * caller's farm scope).
 */
import { expect, test } from "../fixtures/roles";
import { loadState, appendFinding } from "../fixtures/api";

const S = () => loadState();
const farmOf = (rec: any) => String((rec.farm_master?._id || rec.farm_master || rec.farm?._id || rec.farm));

test.describe("TASK 6 — owner read isolation", () => {
  test.skip(
    ({ role }) => !["owner_farm1", "owner_farm1_2"].includes(role.key),
    "guard: run on owner_farm1 + owner_farm1_2 projects"
  );
  const owned = (r: string) => (r === "owner_farm1" ? ["QA-1"] : ["QA-1", "QA-2"]);

  test("lifecycle lists only expose the owner's assigned farms", async ({ authed, role }) => {
    const allowed = owned(role.key);
    const forbidden = ["QA-1", "QA-2"].filter((c) => !allowed.includes(c));

    for (const path of ["/lifecycle/land", "/lifecycle/plantings", "/lifecycle/harvests"]) {
      const list = await (await authed.get(path)).json();
      const codes = new Set(
        (list.data || []).map((x: any) => {
          const id = farmOf(x);
          const st = S();
          for (const [code, fid] of Object.entries(st.farms)) {
            if (fid === id) return code;
          }
          return "?";
        })
      );
      for (const b of allowed) expect(codes.has(b)).toBe(true);
      for (const b of forbidden) expect(codes.has(b)).toBe(false);
    }
  });

  test("master-data get on an unassigned farm is denied", async ({ authed, role }) => {
    if (role.key === "owner_farm1_2") return; // owns both QA farms; nothing to forbid within the matrix
    const forbidden = "QA-2";
    const res = await authed.get(`/master-data/farms/${S().farms[forbidden]}`);
    expect(res.status()).toBe(403);
  });
});

test.describe("TASK 6 — farmer access boundaries", () => {
  test.skip(
    ({ role }) => !["farmer_f1_all", "farmer_f2"].includes(role.key),
    "guard: run on farmer_f1_all + farmer_f2 projects"
  );

  test("farmers are denied lifecycle endpoints entirely (403)", async ({ authed }) => {
    for (const path of ["/lifecycle/land", "/lifecycle/plantings", "/lifecycle/harvests"]) {
      const res = await authed.get(path);
      expect(res.status()).toBe(403);
    }
  });

  test("farmers can read an unassigned farm via master-data (cross-farm leak)", async ({ authed, role }) => {
    const forbidden = role.key === "farmer_f1_all" ? "QA-2" : "QA-1";
    const res = await authed.get(`/master-data/farms/${S().farms[forbidden]}`);
    // FINDING (ISO-04): master-data get/list scoping applies ONLY to
    // farmer_owner (assigned_farms). Farmers see every farm in the org.
    if (res.status() === 200) {
      appendFinding(
        "6",
        "major",
        "Farmers can read any farm (master-data scoping ignores farmer role)",
        "A farmer assigned to QA-1 must not read QA-2 farm data.",
        `Observed farmer GET /master-data/farms/:QA2 -> 200. masterDataController getById only scopes req.user.role === 'farmer_owner'.`,
        "backend/controller/masterDataController.js scoping guards (getById/list/getAll)."
      );
    }
    expect(res.status()).toBe(200);
  });

  test("farmers can read an unassigned farm's blocks (cross-farm leak)", async ({ authed, role }) => {
    const forbidden = role.key === "farmer_f1_all" ? "QA-2" : "QA-1";
    const res = await authed.get(`/master-data/blocks?farm=${S().farms[forbidden]}`);
    if (res.status() === 200) {
      appendFinding(
        "6",
        "major",
        "Farmers can read blocks of any farm",
        "A farmer assigned to QA-1 must not list QA-2 blocks.",
        `Observed farmer GET /master-data/blocks?farm=:QA2 -> 200 with data. Block routes have no farmer scoping.`,
        "backend/controller/masterDataController.js blocks list."
      );
    }
    expect(res.status()).toBe(200);
  });
});

test.describe("TASK 6 — assignment scoping & cross-farm write surface", () => {
  test.skip(
    ({ role }) => !["owner_farm1", "farmer_f2"].includes(role.key),
    "guard: run on owner_farm1 + farmer_f2 projects"
  );

  test("farmer sees only their own assignments", async ({ authed, role }) => {
    if (role.key !== "farmer_f2") return;
    const list = await (await authed.get("/assignments/farmer-assignments?limit=500")).json();
    // Seed gives qa_farmer_f2 an assignment on block QA-2A.
    for (const a of list.data || []) {
      expect(a.farmer?.email).toBe("qa_farmer_f2@sugi.test");
    }
  });

  test("owner can create a farmer_assignment on a farm they do not own (cross-farm write)", async ({ authed, role }) => {
    if (role.key !== "owner_farm1") return;
    const st = S();
    const res = await authed.post("/assignments/farmer-assignments", {
      data: {
        farmer: st.userIds.farmer_f2,
        blocks: [st.blocks["QA-2A"]],
        farm: st.farms["QA-2"],
        access_stages: ["Planting"],
      },
    });
    // FINDING (ISO-01): createFarmerAssignment has no check that the farm/block
    // belongs to the caller's assigned farms. An owner of QA-1 can wire a farmer
    // to QA-2 and grant them access stages.
    if (res.status() === 201) {
      appendFinding(
        "6",
        "critical",
        "farmer_owner can create an assignment on a farm they do not own",
        "Owner of QA-1 must not be able to assign a farmer to QA-2 blocks.",
        `Observed owner_farm1 POST /assignments/farmer-assignments with farmer_f2 + block QA-2A -> 201. createFarmerAssignment only checks farmer/blocks presence, never the caller's farm scope.`,
        "backend/controller/assignmentController.js createFarmerAssignment."
      );
    }
    expect(res.status()).toBe(201);
    // cleanup
    const list = await (await authed.get("/assignments/farmer-assignments?limit=500")).json();
    let gone = false;
    for (const a of list.data || []) {
      if (String(a.farmer?._id || a.farmer) === st.userIds.farmer_f2) {
        await authed.delete(`/assignments/farmer-assignments/${a._id}`);
        gone = true;
      }
    }
    void gone;
  });

  test("owner assignment list is empty despite owned assignments (scoping bug)", async ({ authed, role }) => {
    if (role.key !== "owner_farm1") return;
    const st = S();
    // Create an assignment the owner does own (QA-1 block) first.
    const created = await authed.post("/assignments/farmer-assignments", {
      data: {
        farmer: st.userIds.farmer_f1_all,
        blocks: [st.blocks["QA-1A"]],
        farm: st.farms["QA-1"],
        access_stages: ["Planting", "Maintenance"],
      },
    });
    expect(created.status()).toBe(201);
    const list = await (await authed.get("/assignments/farmer-assignments?limit=500")).json();
    // FINDING (ISO-02): listFarmerAssignments scopes farmer_owner with
    // `FarmerAssignment.find({farmer: ownerId}).distinct('farm')` — treating the
    // owner as a *farmer* they assigned themselves — so `owned` is empty and the
    // query returns nothing even for assignments the owner just created.
    if (list.data && list.data.length === 0) {
      appendFinding(
        "6",
        "major",
        "farmer_owner assignment list is always empty (wrong scope query)",
        "Owner of QA-1 who just assigned a farmer on QA-1 must see that assignment when listing.",
        `Observed owner_farm1 POST assignment on QA-1 -> 201, then GET /assignments/farmer-assignments -> 0 rows. listFarmerAssignments derives owned farms from FarmerAssignment.find({farmer: ownerId}).distinct('farm'), which is empty for an owner.`,
        "backend/controller/assignmentController.js listFarmerAssignments lines 11-14."
      );
    }
    expect(list.data ? list.data.length : 0).toBe(0);
    // cleanup
    for (const a of list.data || []) {
      if (String(a.farmer?._id || a.farmer) === st.userIds.farmer_f1_all) {
        await authed.delete(`/assignments/farmer-assignments/${a._id}`);
      }
    }
  });

  test("owner can create a land record on a farm they do not own (cross-farm write)", async ({ authed, role }) => {
    if (role.key !== "owner_farm1") return;
    const st = S();
    const res = await authed.post("/lifecycle/land", {
      data: {
        farm_id: st.farms["QA-2"],
        farm_master: st.farms["QA-2"],
        block: st.blocks["QA-2A"],
        land_opening_date: "2026-04-01",
        notes: "QA_T6_XFARM",
      },
    });
    // FINDING (ISO-03): createLand stores farm_id verbatim with no ownership
    // check, so an owner of QA-1 can open land on QA-2 (and start a CropCycle).
    if (res.status() === 201) {
      appendFinding(
        "6",
        "critical",
        "farmer_owner can create a land record / CropCycle on a farm they do not own",
        "Owner of QA-1 must not create land (start a cycle) on QA-2.",
        `Observed owner_farm1 POST /lifecycle/land {farm_id: QA-2} -> 201. createLand validates farm_id format only.`,
        "backend/controller/lifecycleController.js createLand."
      );
      const json = await res.json();
      // cleanup: remove the cycle + land record
      const cycleId = json.crop_cycle?._id;
      const landId = json.data?._id;
      if (cycleId) await authed.delete(`/lifecycle/plantings/${cycleId}`);
      if (landId) await authed.delete(`/lifecycle/land/${landId}`);
    }
    expect(res.status()).toBe(201);
  });
});