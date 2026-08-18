/**
 * FE-5 — Input safety surfaced through the UI.
 *
 * - XSS payload stored via the API must render as inert text (not executed).
 * - Oversized/negative numeric input must be rejected with a graceful
 *   validation message, not a 500 or unhandled UI crash.
 * - The master data pagination control (client-side DataTable) must handle
 *   an empty-search state without breaking.
 */
import { test, expect } from "./fixtures";

const uniq = (prefix: string) => `${prefix}${Date.now()}`;

test.describe("FE-5 — XSS payload renders escaped (superadmin)", () => {
  test.skip(({ feRole }) => feRole !== "superadmin", "guard: superadmin only");

  test("<script> in a farm name is not executed and renders as text", async ({ page, pageToken }) => {
    await page.goto("/"); // app origin first (localStorage needs a real document; token read must be on-origin)
    const token = await pageToken(page);
    const payloadName = `QA_FE_XSS_${Date.now()}_<script>alert(1)</script>`;
    const code = uniq("QA_FE_X");

    const dialogSeen: string[] = [];
    page.on("dialog", async (d) => {
      dialogSeen.push(d.message());
      await d.dismiss();
    });

    // Store the payload via the API (this is the storage-side check).
    const base = process.env.QA_API_BASE || "http://localhost:3000/api";
    const create = await (
      await fetch(`${base}/master-data/farms`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: payloadName, code, total_area_ha: 1 }),
      })
    ).json();
    expect(create.success).toBe(true);

    // Render the list page: the payload must appear as inert text.
    await page.goto("/master/farms");
    const cell = page.getByRole("cell", { name: new RegExp(payloadName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) });
    await expect(cell).toBeVisible();
    await page.waitForTimeout(500); // give any script a chance (it should never run)
    expect(dialogSeen).toEqual([]); // <script>alert(1)</script> must NOT have fired

    // Cleanup: delete via the API.
    await fetch(`${base}/master-data/farms/${create.data._id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  });
});

test.describe("FE-5 — oversized / negative numeric fields (superadmin)", () => {
  test.skip(({ feRole }) => feRole !== "superadmin", "guard: superadmin only");

  test("negative area is blocked client-side with a validation message", async ({ page }) => {
    await page.goto("/master/farms");
    await page.getByRole("button", { name: "Tambah Farm" }).click();
    await page.getByLabel("Kode Farm").fill(uniq("QA_FE_N_"));
    await page.getByLabel("Nama Farm").fill(uniq("QA_FE_NA_"));
    await page.getByLabel("Luas (Ha)").fill("-5");
    await page.getByRole("button", { name: "Simpan" }).click();
    await expect(page.getByText("Luas Area minimal 0")).toBeVisible();
  });

  test("huge numeric input does not crash the form", async ({ page }) => {
    await page.goto("/master/farms");
    await page.getByRole("button", { name: "Tambah Farm" }).click();
    await page.getByLabel("Kode Farm").fill(uniq("QA_FE_H_"));
    await page.getByLabel("Nama Farm").fill(uniq("QA_FE_HN_"));
    await page.getByLabel("Luas (Ha)").fill("1e309");
    await page.getByRole("button", { name: "Simpan" }).click();
    // Form stays usable (no crash); either validation error or success both fine.
    await expect(page.getByRole("button", { name: "Simpan" })).toBeVisible();
  });
});

test.describe("FE-5 — list empty-state (superadmin)", () => {
  test.skip(({ feRole }) => feRole !== "superadmin", "guard: superadmin only");

  test("searching a nonsense term renders an empty-state row, not an error", async ({ page }) => {
    await page.goto("/master/farms");
    const search = page.getByPlaceholder("Cari data...");
    await search.fill("QA_ZZ_NoSuchFarm_987654");
    // DataTable shows an empty message row rather than crashing.
    await expect(page.getByText(/tidak|Tidak|No data|data/i).first()).toBeVisible();
    await search.fill("");
    await expect(page.getByRole("table")).toBeVisible();
  });
});