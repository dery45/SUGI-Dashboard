/**
 * Playwright UI (frontend) QA config for SUGIDash.
 *
 * Reuses the role storageState files written by testing/global-setup.ts
 * (tokens live under the frontend origin http://localhost:5173), so each
 * browser project starts authenticated without a UI login. The fe_anon
 * project carries no storageState — it drives the login/redirect flows.
 *
 * Run: npx playwright test --config=playwright.fe.config.ts
 */
import { defineConfig } from "@playwright/test";
import type { ReporterDescription } from "@playwright/test";

const FRONTEND = process.env.QA_FRONTEND_BASE || "http://localhost:5173";

const feRoleProjects = [
  "superadmin",
  "government",
  "owner_farm1",
  "owner_farm1_2",
  "farmer_f1_all",
  "farmer_f2",
].map((role) => ({
  name: `fe_${role}`,
  testDir: "./e2e-fe",
  testMatch: ["**/*.spec.ts"],
  use: { storageState: `./.auth/${role}.json` },
}));

const reporters: ReporterDescription[] = [["list"]];

export default defineConfig({
  testDir: "./e2e-fe",
  timeout: 60_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: reporters,
  globalSetup: "./global-setup.ts",
  globalTeardown: "./global-teardown.ts",
  use: {
    baseURL: FRONTEND,
    channel: "chrome",
    trace: "retain-on-failure",
    video: "off",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "fe_anon",
      testDir: "./e2e-fe",
      testMatch: ["**/*.spec.ts"],
      use: {}, // no storageState -> unauthenticated browser
    },
    ...feRoleProjects,
  ],
});