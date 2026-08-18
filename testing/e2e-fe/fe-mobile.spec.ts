/**
 * FE-4 — Mobile viewport smoke + lifecycle page + theme toggle (sanity).
 *
 * The app is mobile-first (bottom-nav). Verify:
 * - the bottom nav renders on a phone viewport and navigates,
 * - the lifecycle page loads for management roles on mobile,
 * - the theme toggle flips the `dark` class without losing data scoping.
 */
import { test, expect } from "./fixtures";

const MOBILE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true };

test.describe("FE-4 — mobile bottom-nav smoke (superadmin)", () => {
  test.use(MOBILE);
  test.skip(({ feRole }) => feRole !== "superadmin", "guard: superadmin only");

  test("bottom nav is visible and navigates to the lifecycle page", async ({ page }) => {
    await page.goto("/management");
    await expect(page.getByRole("heading", { name: "Dashboard Manajemen" })).toBeVisible();

    // Bottom nav lives on small screens (lg:hidden); Sidebar is hidden on mobile.
    const nav = page.locator("nav.lg\\:hidden");
    await expect(nav).toBeVisible();
    await expect(nav.getByText("Siklus")).toBeVisible();

    await nav.getByText("Siklus").click();
    await expect(page.getByRole("heading", { name: "Manajemen Siklus Pertanian" })).toBeVisible();
  });

  test("theme toggle flips dark mode and keeps the dashboard renderable", async ({ page }) => {
    await page.goto("/management");
    const html = page.locator("html");
    const before = await html.getAttribute("class");
    await page.getByLabel("Toggle Theme").click();
    const after = await html.getAttribute("class");
    expect(before !== after).toBe(true); // class flipped (dark <-> light)
    // Data still renders after theme change.
    await expect(page.getByRole("region", { name: "Ringkasan KPI" })).toBeVisible();
  });
});

test.describe("FE-4 — lifecycle page surface (management roles)", () => {
  test.skip(({ feRole }) => !["superadmin", "owner_farm1"].includes(feRole), "guard: management roles");

  test("lifecycle page renders and offers a farm selector", async ({ page, feRole }) => {
    await page.goto("/management/lifecycle");
    await expect(page.getByRole("heading", { name: "Manajemen Siklus Pertanian" })).toBeVisible();
    if (feRole === "superadmin") {
      await expect(page.getByText("Persiapan Lahan").first()).toBeVisible();
    }
  });
});