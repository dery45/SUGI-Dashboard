/**
 * FE-9B — TASK 9b extras exercised through the real UI:
 *
 * - FE-9B-1: duplicate-submission / double-click on the sales save button.
 *   The guarded `RecordSaleModal` (disabled while saving) is dead code; the
 *   live SalesDistributionPage modal has no disable-on-save, so a fast
 *   double-click can fire two concurrent POSTs. We record what actually
 *   happens and log a finding if duplicate rows are created.
 * - FE-9B-2: concurrent edit of one master-data farm from two sessions
 *   (last-write-wins acceptable, corruption not).
 * - FE-9B-3: password change via the Settings UI — effect on old sessions
 *   and old JWT replay, with the fixture password restored afterward.
 * - FE-9B-4: CSV export scope — an exported file derives entirely from the
 *   already-fetched (role-scoped) payload, never extra rows.
 *
 * All API assertions are made directly against the backend, not only via UI
 * visibility (Ground rule: every access-control assertion checks the API).
 */
import * as fs from "fs";
import { test, expect } from "./fixtures";
import { API_BASE, appendFinding } from "./fe-api";

const uniq = (prefix: string) => `${prefix}${Date.now()}`;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Json = any;

async function api(
  token: string,
  method: string,
  rel: string,
  body?: Json
): Promise<Json> {
  const res = await fetch(`${API_BASE}${rel}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

async function loginRaw(email: string, password: string): Promise<{ status: number; json: Json }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

const SUPERADMIN = { email: "qa_superadmin@sugi.test", password: "qa_superadmin_1" };

// ══════════════════════════════════════════════════════════════════════════
// FE-9B-1 — duplicate submission / double-click (superadmin)
// ══════════════════════════════════════════════════════════════════════════
test.describe("FE-9B-1 — double-click on sales save (superadmin)", () => {
  test.skip(({ feRole }) => feRole !== "superadmin", "guard: superadmin only");

  test("rapid double-click submits exactly once OR logs duplicates with the marker surviving", async ({ page, pageToken }) => {
    await page.goto("/management/sales");
    await expect(page.getByRole("heading", { name: "Penjualan & Distribusi" })).toBeVisible();

    const marker = uniq("QA_FE_DBL_");
    const token = await pageToken(page);

    // Pick a real farm id from the live dropdown list.
    const farms = (await api(token, "GET", "/master-data/farms/all")).json.data || [];
    expect(farms.length).toBeGreaterThan(0);
    const farmId = farms[0]._id;

    await page.getByRole("button", { name: "+ Catat Penjualan" }).click();
    const modal = page.getByText("Catat Penjualan", { exact: true });
    await expect(modal).toBeVisible();

    await page.getByLabel("Farm").selectOption({ label: farms[0].name });
    await page.getByLabel("Nama Pembeli").fill(uniq("QA_FE_BUY_"));
    await page.getByLabel("Jumlah (Kg)").fill("2");
    await page.getByLabel("Harga/Kg").fill("5000");
    await page.getByLabel("Invoice").fill(marker);

    const saveBtn = page.getByRole("button", { name: "Simpan" });
    // The modal closes as soon as the first POST resolves, so a real second
    // browser click lands too late to double-submit. To probe the race we
    // dispatch two synchronous click events (both handlers fire before any
    // response arrives), the faithful reproduction of a fast double-click.
    await saveBtn.evaluate((btn) => {
      (btn as HTMLButtonElement).click();
      (btn as HTMLButtonElement).click();
    });

    // Wait for the App to register the sale(s), then reconcile against the API.
    let created: Json[] = [];
    for (let i = 0; i < 15; i++) {
      const list = (await api(token, "GET", "/sales")).json.data || [];
      created = list.filter((s: Json) => s.invoice_ref === marker);
      if (created.length >= 1) break;
      await sleep(300);
    }
    expect(created.length).toBeGreaterThanOrEqual(1);

    // Give any straggler second POST time to land before tallying.
    await sleep(1500);
    const list2 = (await api(token, "GET", "/sales")).json.data || [];
    const total = list2.filter((s: Json) => s.invoice_ref === marker);
    expect(total.length).toBeGreaterThanOrEqual(1);

    if (total.length > 1) {
      appendFinding(
        "FE-9B-1",
        "info",
        "Sales save button only guards double-submission by closing the modal, backend has no idempotency",
        "A fast double-click on 'Simpan' in the sales form creates exactly one sale record.",
        `Two synchronous submit events created ${total.length} identical sale records (invoice_ref '${marker}'). The guarded 'RecordSaleModal.jsx' (disabled={saving}) is unused dead code; SalesDistributionPage.jsx renders its own unguarded modal. In practice the modal closes when the first response resolves, so duplicate creation requires the two submits to race the server response.`,
        "Backend /sales has no idempotency key; defense-in-depth would be a unique constraint or client-side disable-on-save on the live form."
      );
    }

    // Cleanup rows this test created.
    for (const s of total) {
      await api(token, "DELETE", `/sales/${s._id}`);
    }
  });
});

// ══════════════════════════════════════════════════════════════════════════
// FE-9B-2 — concurrent edit of a single farm (superadmin)
// ══════════════════════════════════════════════════════════════════════════
test.describe("FE-9B-2 — concurrent edit last-write-wins (superadmin)", () => {
  test.skip(({ feRole }) => feRole !== "superadmin", "guard: superadmin only");

  test("two concurrent PUTs on QA-1 do not corrupt the record", async ({ page, pageToken, state }) => {
    await page.goto("/"); // app origin so the token is readable
    const token = await pageToken(page);
    const farmId = state.farms["QA-1"];
    expect(farmId).toBeTruthy();

    const before = (await api(token, "GET", `/master-data/farms/${farmId}`)).json.data;
    expect(before).toBeTruthy();

    const name1 = "QA_Farm One - ConcurrentA";
    const area1 = 88;

    // Minimal legal farm payloads (name + code required), each differing in
    // exactly one field so that both concurrent edits are valid.
    await Promise.all([
      api(token, "PUT", `/master-data/farms/${farmId}`, { name: name1, code: before.code, total_area_ha: before.total_area_ha }),
      api(token, "PUT", `/master-data/farms/${farmId}`, { name: before.name, code: before.code, total_area_ha: area1 }),
    ]);

    const after = (await api(token, "GET", `/master-data/farms/${farmId}`)).json.data;

    // No corruption: the unique key (code) is untouched and the record is intact.
    expect(after.code).toBe(before.code);
    expect(Number.isFinite(Number(after.total_area_ha))).toBe(true);
    // Last-write-wins (per field or whole doc): each field kept one of the
    // two proposed values and nothing was wiped or mangled.
    expect([name1, before.name]).toContain(after.name);
    expect([area1, Number(before.total_area_ha)]).toContain(Number(after.total_area_ha));

    // Restore original values.
    await api(token, "PUT", `/master-data/farms/${farmId}`, {
      name: before.name,
      total_area_ha: before.total_area_ha,
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════
// FE-9B-3 — password change via Settings UI + effect on sessions (superadmin)
// ══════════════════════════════════════════════════════════════════════════
test.describe("FE-9B-3 — password change via UI (superadmin)", () => {
  test.skip(({ feRole }) => feRole !== "superadmin", "guard: superadmin only");

  test("change password from the UI; old login fails, new login works, old JWT stays valid", async ({ page, pageToken }) => {
    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "Pengaturan" })).toBeVisible();

    const oldToken = await pageToken(page);
    const newPassword = uniq("qa_fe_sa_9b_");

    await page.getByRole("button", { name: "Keamanan" }).click();
    await page.getByLabel("Password Saat Ini").fill(SUPERADMIN.password);
    // Disambiguate: the confirm field's label also contains "Password Baru".
    await page.getByRole("textbox", { name: /^Password Baru/ }).fill(newPassword);
    await page.getByLabel("Konfirmasi Password Baru").fill(newPassword);
    await page.getByRole("button", { name: "Ubah Password" }).click();
    await expect(page.getByText("Password berhasil diubah")).toBeVisible();

    // Old password must no longer authenticate.
    const oldLogin = await loginRaw(SUPERADMIN.email, SUPERADMIN.password);
    expect(oldLogin.status).toBe(401);

    // New password authenticates.
    const newLogin = await loginRaw(SUPERADMIN.email, newPassword);
    expect(newLogin.status).toBe(200);
    expect(newLogin.json.token).toBeTruthy();

    // Pre-change JWT: stateless server, secret unchanged -> still valid. Document it.
    const me = await api(oldToken, "GET", "/auth/me");
    expect(me.status).toBe(200);
    if (me.status === 200) {
      appendFinding(
        "FE-9B-3",
        "info",
        "Password change via Settings UI leaves pre-change JWTs valid (stateless JWT)",
        "Rotating a password should invalidate already-issued sessions so a stolen pre-change token stops working.",
        "After changing qa_superadmin's password through the UI, a request with the pre-change JWT still returned 200 on /auth/me (server is stateless; the JWT secret is not rotated). Cross-referenced with backend 9B-01 (password change flow).",
        "Impact: sessions are not revoked on password rotation; acceptable if tokens are short-lived, but worth recording."
      );
    }

    // Restore the fixture password using the (still valid) old token.
    const restore = await api(oldToken, "PUT", "/settings/change-password", {
      current_password: newPassword,
      new_password: SUPERADMIN.password,
      confirm_password: SUPERADMIN.password,
    });
    expect(restore.status).toBe(200);

    const reLogin = await loginRaw(SUPERADMIN.email, SUPERADMIN.password);
    expect(reLogin.status).toBe(200);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// FE-9B-4 — CSV export scope (farmer + government)
// ══════════════════════════════════════════════════════════════════════════
function expectedCsvLines(rows: Json[]): { header: string; lines: Set<string> } {
  if (!rows.length) return { header: "", lines: new Set() };
  const keys = Object.keys(rows[0]);
  const header = keys.join(",");
  const lines = new Set(
    rows.map((r) =>
      keys.map((k) => {
        const v = r[k];
        return v !== null && v !== undefined ? String(v).replace(/,/g, "") : "";
      }).join(",")
    )
  );
  return { header, lines };
}

test.describe("FE-9B-4 — export derives from role-scoped payload", () => {
  test("farmer dashboard CSV export (peta-producer.csv) = fetched /dashboard/farmer/v2 rows", async ({ page, feRole, pageToken }) => {
    test.skip(!feRole.startsWith("farmer"), "farmer only");
    await page.goto("/farmer");
    await expect(page.getByRole("heading", { name: "Peta Interaktif" })).toBeVisible();

    const token = await pageToken(page);
    const data = (await api(token, "GET", "/dashboard/farmer/v2")).json.data || {};
    const rows = data.mapProducer || [];
    // Scope to the map toolbar (the button sits next to the 'Mode peta' select).
    const btn = page.getByLabel("Mode peta").locator("..").getByRole("button", { name: "Export CSV" });

    if (!rows.length) {
      await expect(btn).toBeDisabled();
      return; // nothing to leak even if enabled logic misfired: no data exists
    }

    await expect(btn).toBeEnabled();
    const dlPromise = page.waitForEvent("download", { timeout: 15000 }).catch(() => null);
    await btn.click();
    const dl = await dlPromise;

    expect(dl).not.toBeNull();
    expect(dl!.suggestedFilename()).toBe("peta-producer.csv");

    const csv = fs.readFileSync(await dl!.path(), "utf8");
    const [header, ...lines] = csv.replace(/^\uFEFF/, "").split("\n").filter(Boolean);
    const expected = expectedCsvLines(rows);
    expect(header).toBe(expected.header);
    expect(lines.length).toBe(rows.length);
    for (const line of lines) {
      expect(expected.lines.has(line), `exported line outside scoped payload: ${line}`).toBe(true);
    }
  });

  test("government dashboard CSV export (peta-pou.csv) = fetched /dashboard/govt rows", async ({ page, feRole, pageToken }) => {
    test.skip(feRole !== "government", "government only");
    await page.goto("/government");
    await expect(page.getByRole("heading", { name: "Peta Interaktif" })).toBeVisible();

    const token = await pageToken(page);
    const data = (await api(token, "GET", "/dashboard/govt")).json.data || {};
    const rows = data.mapPou || [];
    // Scope to the map toolbar (the button sits next to the 'Mode peta' select).
    const btn = page.getByLabel("Mode peta").locator("..").getByRole("button", { name: "Export CSV" });

    if (!rows.length) {
      await expect(btn).toBeDisabled();
      return;
    }

    await expect(btn).toBeEnabled();
    const dlPromise = page.waitForEvent("download", { timeout: 15000 }).catch(() => null);
    await btn.click();
    const dl = await dlPromise;

    expect(dl).not.toBeNull();
    expect(dl!.suggestedFilename()).toBe("peta-pou.csv");

    const csv = fs.readFileSync(await dl!.path(), "utf8");
    const [header, ...lines] = csv.replace(/^\uFEFF/, "").split("\n").filter(Boolean);
    const expected = expectedCsvLines(rows);
    expect(header).toBe(expected.header);
    expect(lines.length).toBe(rows.length);
    for (const line of lines) {
      expect(expected.lines.has(line), `exported line outside scoped payload: ${line}`).toBe(true);
    }
  });
});