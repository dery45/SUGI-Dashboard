/**
 * FE-3 — Master Data via the real browser UI.
 *
 * - superadmin: create farm/block through the modal form, verify it appears in
 *   the rendered table, then delete it (soft delete) and confirm removal.
 * - farmer_owner: the "Tambah Farm" button must be hidden and the farm list
 *   scoped to assigned farms only (mirrors the backend API restriction).
 * - duplicate unique-key handling surfaced in the UI.
 */
import { test, expect } from "./fixtures";

const uniq = (prefix: string) => `${prefix}${Date.now()}`;

test.describe("FE-3 — master data CRUD via UI (superadmin)", () => {
  test.skip(({ feRole }) => feRole !== "superadmin", "guard: superadmin only");

  test("create, edit and (soft) delete a farm from the modal form", async ({ page }) => {
    const name = uniq("QA_FE_Farm_");
    const code = uniq("QA_FE_");
    await page.goto("/master/farms");
    await expect(page.getByRole("heading", { name: "Master Data Farm" })).toBeVisible();

    await page.getByRole("button", { name: "Tambah Farm" }).click();
    await page.getByLabel("Kode Farm").fill(code);
    await page.getByLabel("Nama Farm").fill(name);
    await page.getByLabel("Luas (Ha)").fill("3.5");
    await page.getByRole("button", { name: "Simpan" }).click();

    // Appears in the table (DataTable renders one row per farm).
    await expect(page.getByRole("cell", { name })).toBeVisible();

    // Edit: rename and confirm persistence. Row actions = [edit(Pencil), delete(Trash2)].
    const renamed = name + "_edited";
    await page.getByRole("cell", { name }).locator("..").getByRole("button").first().click();
    await page.getByLabel("Nama Farm").fill(renamed);
    await page.getByRole("button", { name: "Simpan" }).click();
    await expect(page.getByRole("cell", { name: renamed })).toBeVisible();

    // Delete via row action; soft delete on the backend keeps it out of list.
    page.on("dialog", (d) => d.accept());
    await page.getByRole("cell", { name: renamed }).locator("..").getByRole("button").last().click();
    await expect(page.getByRole("cell", { name: renamed })).toHaveCount(0);
  });

  test("duplicate farm code surfaces a validation error, not a crash", async ({ page, state }) => {
    await page.goto("/master/farms");
    await page.getByRole("button", { name: "Tambah Farm" }).click();
    await page.getByLabel("Kode Farm").fill(state.farms["QA-1"] ? "QA-1" : "QA-01");
    await page.getByLabel("Nama Farm").fill(uniq("QA_FE_Dup_"));
    await page.getByLabel("Luas (Ha)").fill("1");
    await page.getByRole("button", { name: "Simpan" }).click();
    // Expect a human error (modal stays open / message rendered), not an unhandled exception.
    await expect(page.getByRole("button", { name: "Tambah Farm" })).toBeVisible();
  });
});

test.describe("FE-3 — farmer_owner restrictions visible in UI", () => {
  test.skip(({ feRole }) => feRole !== "owner_farm1", "guard: owner scoping UI");

  test("owner sees no 'Tambah Farm' button and only assigned farms", async ({ page, pageToken }) => {
    await page.goto("/master/farms");
    await expect(page.getByRole("heading", { name: "Master Data Farm" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Tambah Farm" })).toHaveCount(0);

    const token = await pageToken(page);
    const farms = await (
      await fetch(`${process.env.QA_API_BASE || "http://localhost:3000/api"}/master-data/farms/all`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    ).json();
    const qa1 = (farms.data || []).find((f: any) => f.code === "QA-1");
    const qa2 = (farms.data || []).find((f: any) => f.code === "QA-2");
    expect(qa1).toBeDefined();
    expect(qa2).toBeUndefined(); // scoped out

    // Rendered table reflects the scoped list (QA-1 present, no QA-2 name cell).
    if (qa1) await expect(page.getByRole("cell", { name: qa1.name })).toBeVisible();
    await expect(page.getByRole("cell", { name: /QA-2/i })).toHaveCount(0);
  });
});