/**
 * API-level seed for the QA fixture matrix (called from global-setup.ts).
 *
 * Idempotency contract: every lookup is keyed on an existing unique/stable
 * field (farm code, block farm+code, user email, crop-type name, activity-type name).
 * If a fixture already exists under the same key, it is reused — never duplicated.
 */
import { QaState, Api, apiWith, login } from "./api";

const S = "QA_";

export interface SeedCtx {
  super: Api;
  state: QaState;
  log: (s: string) => void;
}

async function findFarm(ctx: Api, code: string): Promise<any | null> {
  const res = await ctx.get("/master-data/farms/all");
  const json = await res.json();
  if (!json.success) return null;
  return json.data.find((f: any) => f.code === code) || null;
}

async function findBlock(ctx: Api, code: string, farmId?: string): Promise<any | null> {
  const res = await ctx.get("/master-data/blocks/all");
  const json = await res.json();
  if (!json.success) return null;
  return json.data.find(
    (b: any) => b.code === code && (!farmId || String(b.farm?._id || b.farm) === farmId)
  ) || null;
}

async function findUserByEmail(ctx: Api, email: string): Promise<any | null> {
  const res = await ctx.get("/farmers?limit=500");
  const json = await res.json();
  if (!json.success) return null;
  return json.data.find((u: any) => u.email === email) || null;
}

async function findByName(ctx: Api, path: string, name: string): Promise<any | null> {
  const res = await ctx.get(path);
  const json = await res.json();
  if (!json.success) return null;
  return json.data.find((x: any) => x.name === name) || null;
}

async function ensureFarm(ctx: SeedCtx, code: string, name: string): Promise<string> {
  const existing = await findFarm(ctx.super, code);
  if (existing) return existing._id;
  const res = await ctx.super.post("/master-data/farms", {
    data: { name, code, total_area_ha: 10, province: "Jawa Timur", city: "Surabaya" },
  });
  const json = await res.json();
  if (!res.ok() || !json.success) throw new Error(`createFarm ${code} failed: ${res.status()} ${JSON.stringify(json)}`);
  ctx.log(`[seed] farm ${code} -> ${json.data._id}`);
  return json.data._id;
}

async function ensureBlock(ctx: SeedCtx, code: string, name: string, farmId: string): Promise<string> {
  const existing = await findBlock(ctx.super, code, farmId);
  if (existing) return existing._id;
  const res = await ctx.super.post("/master-data/blocks", {
    data: { name, code, farm: farmId, area_ha: 2.5 },
  });
  const json = await res.json();
  if (!res.ok() || !json.success) throw new Error(`createBlock ${code} failed: ${res.status()} ${JSON.stringify(json)}`);
  ctx.log(`[seed] block ${code} -> ${json.data._id}`);
  return json.data._id;
}

async function ensureSimple(
  ctx: SeedCtx,
  listPath: string,
  createPath: string,
  name: string,
  code: string
): Promise<string> {
  const existing = await findByName(ctx.super, listPath, name);
  if (existing) return existing._id;
  const res = await ctx.super.post(createPath, { data: { name, code } });
  const json = await res.json();
  if (!res.ok() || !json.success) throw new Error(`create ${createPath} ${code} failed: ${res.status()} ${JSON.stringify(json)}`);
  ctx.log(`[seed] ${createPath} ${code} -> ${json.data._id}`);
  return json.data._id;
}

async function ensureUser(
  ctx: SeedCtx,
  email: string,
  password: string,
  name: string,
  role: string,
  farmIds?: string[]
): Promise<{ id: string }> {
  const existing = await findUserByEmail(ctx.super, email);
  if (existing) {
    // The API soft-deletes users (status: Inactive); teardown leaves them in
    // the DB, so a reused account must be re-activated before it can be used.
    if (String(existing.status) === "Inactive") {
      const upd = await ctx.super.put(`/farmers/${existing._id}`, {
        data: { status: "Active" },
      });
      const updJson = await upd.json();
      if (!upd.ok() || !updJson.success) {
        throw new Error(`reactivate ${email} failed: ${upd.status()} ${JSON.stringify(updJson).slice(0, 200)}`);
      }
      ctx.log(`[seed] reactivated user ${email}`);
    }
    return { id: existing._id };
  }
  const res = await ctx.super.post("/farmers", {
    data: {
      name,
      email,
      password,
      role,
      ...(role === "farmer_owner" && farmIds ? { assigned_farms: farmIds } : {}),
    },
  });
  const json = await res.json();
  if (!res.ok() || !json.success) throw new Error(`create user ${email} failed: ${res.status()} ${JSON.stringify(json)}`);
  ctx.log(`[seed] user ${email} (${role}) -> ${json.data.id}`);
  return { id: json.data.id };
}

async function ensureAssignment(
  ctx: SeedCtx,
  farmerId: string,
  blockIds: string[],
  farmId: string,
  accessStages: string[]
): Promise<string | null> {
  const listRes = await ctx.super.get("/assignments/farmer-assignments?limit=500");
  const listJson = await listRes.json();
  const existing = (listJson.success ? listJson.data : []) as any[];
  const hit = existing.find((a: any) => String(a.farmer?._id || a.farmer) === farmerId);
  if (hit) return hit._id;
  const res = await ctx.super.post("/assignments/farmer-assignments", {
    data: { farmer: farmerId, blocks: blockIds, farm: farmId, access_stages: accessStages },
  });
  const json = await res.json();
  if (!res.ok() || !json.success) throw new Error(`create assignment failed: ${res.status()} ${JSON.stringify(json)}`);
  ctx.log(`[seed] assignment ${farmerId} -> blocks ${blockIds.length}`);
  return json.data?.[0]?._id || json.data?._id || null;
}

async function post(ctx: Api, url: string, data: any, label: string): Promise<any> {
  const res = await ctx.post(url, { data });
  const json = await res.json().catch(() => ({}));
  if (!res.ok() || !json.success) throw new Error(`${label} failed (${res.status()}): ${JSON.stringify(json).slice(0, 300)}`);
  return json.data;
}

async function put(ctx: Api, url: string, data: any, label: string): Promise<any> {
  const res = await ctx.put(url, { data });
  const json = await res.json().catch(() => ({}));
  if (!res.ok() || !json.success) throw new Error(`${label} failed (${res.status()}): ${JSON.stringify(json).slice(0, 300)}`);
  return json.data;
}

async function ensureCycleFlow(
  ctx: SeedCtx,
  farmId: string,
  blockId: string,
  cropTypeName: string,
  tag: string
): Promise<{ cycleId: string; harvestId: string }> {
  // Idempotency: reuse a completed cycle if one already exists for this tag.
  const plantings = await ctx.super.get("/lifecycle/plantings?limit=500");
  const plantJson = await plantings.json();
  if (plantJson.success) {
    const reused = plantJson.data.find((c: any) => c.notes === tag || (c.farm_master === farmId && c.status === "Completed"));
    if (reused) return { cycleId: reused._id, harvestId: "" };
  }

  // 1. LandRecord = single entry point creating the CropCycle (Persiapan Lahan).
  const landRes = await ctx.super.post("/lifecycle/land", {
    data: {
      farm_id: farmId,
      farm_master: farmId,
      block: blockId,
      land_opening_date: "2026-01-15",
      notes: tag,
    },
  });
  const landJson = await landRes.json();
  if (!landRes.ok() || !landJson.success) {
    throw new Error(`createLand ${tag} failed: ${landRes.status()} ${JSON.stringify(landJson).slice(0, 300)}`);
  }
  const cycleId = landJson.crop_cycle?._id || landJson.data?.crop_cycle_id || landJson.data?.crop_cycle?._id;

  // 2. Planting selects the cycle (advances to Planted).
  await post(ctx.super, "/lifecycle/plantings", {
    crop_cycle_id: cycleId, crop_type: cropTypeName, planting_date: "2026-01-20",
  }, `planting ${tag}`);

  // 3. Two maintenance activities (advance to Maintenance).
  await post(ctx.super, "/lifecycle/activities", {
    crop_cycle_id: cycleId, date: "2026-02-01", activity_type: "Penyiangan", description: "QA_" + tag,
    labor_hours: 4, cost: 50000,
  }, `activity1 ${tag}`);
  await post(ctx.super, "/lifecycle/activities", {
    crop_cycle_id: cycleId, date: "2026-02-15", activity_type: "Pemupukan", description: "QA_" + tag,
    labor_hours: 3, cost: 75000,
  }, `activity2 ${tag}`);

  // 4. Open harvest window (advance to Harvesting).
  const harvest = await post(ctx.super, "/lifecycle/harvests", {
    crop_cycle_id: cycleId, harvest_opening_date: "2026-03-01", expected_end: "2026-03-15",
    expected_yield_kg: 5000, total_yield_kg: 100, farm_id: farmId, farm_master: farmId, notes: "QA_" + tag,
  }, `harvest-open ${tag}`);
  const harvestId = harvest._id;

  // 5. Close harvest (cycle -> Completed).
  await put(ctx.super, `/lifecycle/harvests/${harvestId}`, { status: "Closed" }, `harvest-close ${tag}`);

  return { cycleId, harvestId };
}

export async function runSeed(adminToken: string, log: (s: string) => void): Promise<QaState> {
  const superCtx = await apiWith(adminToken);
  const state: QaState = {
    tokens: { admin: adminToken },
    userIds: {},
    farms: {},
    blocks: {},
    cropTypes: [],
    activityTypes: [],
    cycles: {},
    landRecords: [],
    harvestPeriods: [],
    activities: [],
    sales: [],
    expenses: [],
    assignments: [],
    cyclesByFarm: {},
  };
  const ctx: SeedCtx = { super: superCtx, state, log };

  // ── Master data ─────────────────────────────────────────────
  const farmA = await ensureFarm(ctx, "QA-1", `${S}Farm One`);
  const farmB = await ensureFarm(ctx, "QA-2", `${S}Farm Two`);
  state.farms["QA-1"] = farmA;
  state.farms["QA-2"] = farmB;

  const blockA1 = await ensureBlock(ctx, "QA-1A", `${S}Block 1A`, farmA);
  const blockA2 = await ensureBlock(ctx, "QA-1B", `${S}Block 1B`, farmA);
  const blockB1 = await ensureBlock(ctx, "QA-2A", `${S}Block 2A`, farmB);
  const blockB2 = await ensureBlock(ctx, "QA-2B", `${S}Block 2B`, farmB);
  state.blocks["QA-1A"] = blockA1;
  state.blocks["QA-1B"] = blockA2;
  state.blocks["QA-2A"] = blockB1;
  state.blocks["QA-2B"] = blockB2;

  const cropType = await ensureSimple(ctx, "/master-data/crop-types/all", "/master-data/crop-types", `${S}Timun`, "QA_TIMUN");
  const actType = await ensureSimple(ctx, "/master-data/activity-types/all", "/master-data/activity-types", `${S}Merawat`, "QA_ACT");
  state.cropTypes = [cropType];
  state.activityTypes = [actType];

  // ── Users ───────────────────────────────────────────────────
  state.userIds.superadmin = (
    await ensureUser(ctx, "qa_superadmin@sugi.test", "qa_superadmin_1", "QA Superadmin", "superadmin")
  ).id;
  state.userIds.government = (
    await ensureUser(ctx, "qa_government@sugi.test", "qa_government_1", "QA Government", "government")
  ).id;
  state.userIds.owner_farm1 = (
    await ensureUser(ctx, "qa_owner_farm1@sugi.test", "qa_owner_farm1_1", "QA Owner Farm1", "farmer_owner", [farmA])
  ).id;
  state.userIds.owner_farm1_2 = (
    await ensureUser(ctx, "qa_owner_farm1_2@sugi.test", "qa_owner_farm1_2_1", "QA Owner Farm1+2", "farmer_owner", [farmA, farmB])
  ).id;
  state.userIds.farmer_f1_all = (
    await ensureUser(ctx, "qa_farmer_f1_all@sugi.test", "qa_farmer_f1_all_1", "QA Farmer F1 All", "farmer")
  ).id;
  state.userIds.farmer_f1_partial = (
    await ensureUser(ctx, "qa_farmer_f1_partial@sugi.test", "qa_farmer_f1_partial_1", "QA Farmer F1 Partial", "farmer")
  ).id;
  state.userIds.farmer_f2 = (
    await ensureUser(ctx, "qa_farmer_f2@sugi.test", "qa_farmer_f2_1", "QA Farmer F2", "farmer")
  ).id;
  state.userIds.no_assignment = (
    await ensureUser(ctx, "qa_no_assignment@sugi.test", "qa_no_assignment_1", "QA Farmer No Assignment", "farmer")
  ).id;

  // ── Assignments ─────────────────────────────────────────────
  const ALL_STAGES = ["Land_Preparation", "Planting", "Maintenance", "Harvesting"];
  const a1 = await ensureAssignment(ctx, state.userIds.farmer_f1_all, [blockA1], farmA, ALL_STAGES);
  const a2 = await ensureAssignment(ctx, state.userIds.farmer_f1_partial, [blockA2], farmA, ["Land_Preparation", "Planting"]);
  const a3 = await ensureAssignment(ctx, state.userIds.farmer_f2, [blockB1], farmB, ALL_STAGES);
  if (a1) state.assignments.push(a1);
  if (a2) state.assignments.push(a2);
  if (a3) state.assignments.push(a3);

  // ── Crop cycles: one completed per farm (single entry + gated stages) ──
  const cA = await ensureCycleFlow(ctx, farmA, blockA1, cropType, `${S}CYCLE-A`);
  const cB = await ensureCycleFlow(ctx, farmB, blockB1, cropType, `${S}CYCLE-B`);
  state.cycles["QA-1"] = cA.cycleId;
  state.cycles["QA-2"] = cB.cycleId;
  state.cyclesByFarm["QA-1"] = [cA.cycleId];
  state.cyclesByFarm["QA-2"] = [cB.cycleId];
  if (cA.harvestId) state.harvestPeriods.push(cA.harvestId);
  if (cB.harvestId) state.harvestPeriods.push(cB.harvestId);

  // ── Sales + expenses per farm ───────────────────────────────
  const saleA = await post(superCtx, "/sales", {
    farm_id: farmA, buyer_name: `${S}Buyer One`, buyer_type: "Mill",
    quantity_kg: 100, price_per_kg: 5000, sale_date: "2026-03-05",
  }, "sale QA-1");
  const saleB = await post(superCtx, "/sales", {
    farm_id: farmB, buyer_name: `${S}Buyer Two`, buyer_type: "Middleman",
    quantity_kg: 200, price_per_kg: 4000, sale_date: "2026-03-08",
  }, "sale QA-2");
  const expA = await post(superCtx, "/expenses", {
    farm_id: farmA, category: "Pupuk", amount_idr: 300000, description: `${S}EXP`,
    expense_date: "2026-02-20",
  }, "expense QA-1");
  const expB = await post(superCtx, "/expenses", {
    farm_id: farmB, category: "Tenaga Kerja", amount_idr: 200000, description: `${S}EXP`,
    expense_date: "2026-02-22",
  }, "expense QA-2");
  state.sales = [saleA._id, saleB._id];
  state.expenses = [expA._id, expB._id];

  // Refresh login tokens for every QA role (also records them in state).
  for (const [key, email, password] of [
    ["superadmin", "qa_superadmin@sugi.test", "qa_superadmin_1"],
    ["government", "qa_government@sugi.test", "qa_government_1"],
    ["owner_farm1", "qa_owner_farm1@sugi.test", "qa_owner_farm1_1"],
    ["owner_farm1_2", "qa_owner_farm1_2@sugi.test", "qa_owner_farm1_2_1"],
    ["farmer_f1_all", "qa_farmer_f1_all@sugi.test", "qa_farmer_f1_all_1"],
    ["farmer_f1_partial", "qa_farmer_f1_partial@sugi.test", "qa_farmer_f1_partial_1"],
    ["farmer_f2", "qa_farmer_f2@sugi.test", "qa_farmer_f2_1"],
    ["no_assignment", "qa_no_assignment@sugi.test", "qa_no_assignment_1"],
  ] as [string, string, string][]) {
    const { token } = await login(email, password);
    state.tokens[key] = token;
  }

  await superCtx.dispose();
  log(`[seed] complete — farms 2, blocks 4, cycles 2, sales 2, expenses 2, users 8`);
  return state;
}