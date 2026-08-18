/**
 * Playwright global-teardown: delete every QA_-tagged fixture created by the
 * suite via direct API calls. Runs after tests finish; best-effort so failures
 * don't mask real test results.
 */
import * as fs from "fs";
import { ADMIN_SEED, QaState, STATE_FILE, apiWith, login } from "./fixtures/api";

const QA_EMAIL_RE = /^qa_[a-z0-9_]+@sugi\.test$/;

export default async function globalTeardown(): Promise<void> {
  let adminToken: string;
  try {
    const admin = await login(ADMIN_SEED.email, ADMIN_SEED.password);
    adminToken = admin.token;
  } catch (e) {
    console.warn("[teardown] cannot login admin — skipping cleanup:", (e as Error).message);
    return;
  }

  let state: QaState | null = null;
  if (fs.existsSync(STATE_FILE)) {
    try {
      state = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
    } catch { /* ignore corrupt state file */ }
  }

  const api = await apiWith(adminToken);
  const tried: string[] = [];

  const del = async (method: "delete" | "put" | "patch", url: string) => {
    try {
      const res = await api[method](url);
      tried.push(`${method.toUpperCase()} ${url} -> ${res.status()}`);
    } catch (e) {
      tried.push(`${method.toUpperCase()} ${url} -> ERR ${(e as Error).message}`);
    }
  };

  // ── Sales / expenses (QA_-tagged only) ──
  if (state) {
    for (const id of state.sales) await del("delete", `/sales/${id}`);
    for (const id of state.expenses) await del("delete", `/expenses/${id}`);
  } else {
    for (const [path, key] of [["/sales", "buyer_name"], ["/expenses", "description"]] as const) {
      try {
        const res = await api.get(path);
        const json = await res.json();
        for (const item of json.data || []) {
          if (String(item[key] || "").startsWith("QA_")) {
            await del("delete", `${path}/${item._id}`);
          }
        }
      } catch { /* ignore */ }
    }
  }

  // ── Lifecycle: harvests, then activities, then plantings/cycles, then land ──
  for (const [listPath, deletePath, noteField] of [
    ["/lifecycle/harvests", "/lifecycle/harvests", "notes"],
    ["/lifecycle/activities", "/lifecycle/activities", "description"],
    ["/lifecycle/plantings", "/lifecycle/plantings", "notes"],
    ["/lifecycle/land", "/lifecycle/land", "notes"],
  ] as const) {
    try {
      const res = await api.get(listPath);
      const json = await res.json();
      for (const item of json.data || []) {
        const tag = JSON.stringify(item);
        if (
          tag.includes("QA_") ||
          (state && (state.cycles["QA-1"] === String(item._id) || state.cycles["QA-2"] === String(item._id)))
        ) {
          await del("delete", `${deletePath}/${item._id}`);
        }
      }
    } catch { /* ignore */ }
  }

  // ── Assignments tied to QA farmers ──
  if (state) {
    for (const id of state.assignments) await del("delete", `/assignments/farmer-assignments/${id}`);
  }
  try {
    const res = await api.get("/assignments/farmer-assignments?limit=500");
    const json = await res.json();
    for (const a of json.data || []) {
      const farmerEmail = a.farmer?.email || "";
      if (QA_EMAIL_RE.test(farmerEmail)) await del("delete", `/assignments/farmer-assignments/${a._id}`);
    }
  } catch { /* ignore */ }

  // ── QA users (soft delete is the API's behaviour) ──
  try {
    const res = await api.get("/farmers?limit=500");
    const json = await res.json();
    for (const u of json.data || []) {
      if (QA_EMAIL_RE.test(u.email)) await del("delete", `/farmers/${u._id}`);
    }
  } catch { /* ignore */ }

  // ── Blocks / farms / crop-types / activity-types named QA_ ──
  for (const [listPath, deletePath] of [
    ["/master-data/blocks", "/master-data/blocks"],
    ["/master-data/farms", "/master-data/farms"],
    ["/master-data/crop-types", "/master-data/crop-types"],
    ["/master-data/activity-types", "/master-data/activity-types"],
  ] as const) {
    try {
      const res = await api.get(`${listPath}/all`);
      const json = await res.json();
      for (const item of json.data || []) {
        if (String(item.name || "").startsWith("QA_") || String(item.code || "").startsWith("QA-")) {
          await del("delete", `${deletePath}/${item._id}`);
        }
      }
    } catch { /* ignore */ }
  }

  await api.dispose();
  if (process.env.QA_VERBOSE_TEARDOWN) {
    tried.forEach((l) => console.log(`[teardown] ${l}`));
  }
  console.log(`[teardown] cleanup complete (${tried.length} API calls)`);
}