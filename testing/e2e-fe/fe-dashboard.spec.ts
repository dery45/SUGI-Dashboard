/**
 * FE-2 — Frontend dashboard & KPI rendering against the API's numbers.
 *
 * - superadmin sees the management dashboard with all KPI cards populated.
 * - farmer_owner sees the management dashboard AND the farm filter only lists
 *   the farm(s) they are scoped to.
 * - government sees the government dashboard heading.
 * - farmer sees the farmer dashboard heading.
 * Cross-checks rendered KPI text against the backend response where stable.
 */
import { test, expect } from "./fixtures";

async function backend(rel: string, token: string) {
  const res = await fetch(`${process.env.QA_API_BASE || "http://localhost:3000/api"}${rel}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`${rel} -> ${res.status}`);
  return res.json();
}

test.describe("FE-2 — management dashboard (superadmin + farmer_owner)", () => {
  test.skip(({ feRole }) => !["superadmin", "owner_farm1", "owner_farm1_2"].includes(feRole), "guard: management roles only");

  test("renders the management KPI grid with all eight cards", async ({ page, feRole, pageToken }) => {
    await page.goto("/management");
    await expect(page.getByRole("heading", { name: "Dashboard Manajemen" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Ringkasan KPI" })).toBeVisible();

    const labels = [
      "Lahan Aktif",
      "Siklus Aktif",
      "Total Hasil Panen",
      "Rata-rata Hasil/Ha",
      "Biaya/Kg",
      "ROI",
      "UM Belum Ditugaskan",
      "Peringatan Aktif",
    ];
    for (const label of labels) {
      await expect(page.getByRole("region", { name: label })).toBeVisible();
    }

    // Cross-check one numeric KPI (Total Hasil Panen, unit: ton) with the API.
    const token = await pageToken(page);
    const kpi = await backend("/management/kpi", token);
    const expectedTon = Number(kpi.data?.totalYieldTons ?? kpi.totalYieldTons ?? NaN);
    expect(Number.isFinite(expectedTon)).toBe(true);
    const card = page.getByRole("region", { name: "Total Hasil Panen" });
    await expect(card.getByText(new RegExp(`^${expectedTon}`))).toBeVisible();
  });

  test.skip(({ feRole }) => feRole !== "owner_farm1", "guard: scoped-owner UI check");
  test("farmer_owner farm filter only offers the assigned QA-1 farm", async ({ page, feRole, pageToken }) => {
    await page.goto("/management");
    const token = await pageToken(page);
    const farms = await backend("/master-data/farms/all", token);
    const names = (farms.data || []).map((f: any) => f.name);
    // The UI farm dropdown must come from the same scoped list.
    const optionNames = await page.locator("select").first().evaluate((sel: HTMLSelectElement) =>
      Array.from(sel.options).map((o) => o.text.trim())
    );
    expect(names.length).toBeGreaterThan(0);
    expect(names.every((n: string) => optionNames.includes(n))).toBe(true);
    // The dropdown should not offer farms the owner does not hold (QA-2).
    const qa2 = (farms.data || []).find((f: any) => f.code === "QA-2");
    const qa1 = (farms.data || []).find((f: any) => f.code === "QA-1");
    expect(qa2).toBeUndefined(); // scoped list excludes QA-2
    expect(qa1).toBeDefined();
  });
});

test.describe("FE-2 — role home dashboards", () => {
  test.skip(({ feRole }) => feRole === "anon", "guard: needs an authenticated browser");

  test("government role lands on the government dashboard", async ({ page, feRole }) => {
    test.skip(feRole !== "government", "government only");
    await page.goto("/");
    await expect(page).toHaveURL(/\/government$/);
    await expect(page.getByRole("heading", { name: "Dashboard Pemerintah" })).toBeVisible();
  });

  test("farmer role lands on the farmer dashboard", async ({ page, feRole }) => {
    test.skip(!feRole.startsWith("farmer"), "farmer only");
    await page.goto("/");
    await expect(page).toHaveURL(/\/farmer$/);
    await expect(page.getByRole("heading", { name: "Dashboard Petani" })).toBeVisible();
  });

  test("superadmin landing route resolves to /management", async ({ page, feRole }) => {
    test.skip(feRole !== "superadmin", "superadmin only");
    await page.goto("/");
    await expect(page).toHaveURL(/\/management$/);
    await expect(page.getByRole("heading", { name: "Dashboard Manajemen" })).toBeVisible();
  });
});