/**
 * Playwright QA suite for SUGIDash.
 * One project per fixture role — each uses its role's saved storageState
 * (written by global-setup.ts), so role switching never re-logs in.
 */
import { defineConfig } from "@playwright/test";
import type { ReporterDescription } from "@playwright/test";

const FRONTEND = process.env.QA_FRONTEND_BASE || "http://localhost:5173";

const rolesSpecs: Record<string, string[]> = {
  superadmin: [
    "**/auth.spec.ts",
    "**/crud.spec.ts",
    "**/kpi.spec.ts",
    "**/lifecycle.spec.ts",
    "**/um.spec.ts",
    "**/users.spec.ts",
    "**/sales.spec.ts",
    "**/security.spec.ts",
    "**/extra.spec.ts",
  ],
  government: ["**/auth.spec.ts", "**/kpi.spec.ts", "**/users.spec.ts", "**/security.spec.ts", "**/extra.spec.ts"],
  owner_farm1: [
    "**/auth.spec.ts",
    "**/crud.spec.ts",
    "**/kpi.spec.ts",
    "**/lifecycle.spec.ts",
    "**/um.spec.ts",
    "**/users.spec.ts",
    "**/sales.spec.ts",
    "**/security.spec.ts",
    "**/extra.spec.ts",
  ],
  owner_farm1_2: [
    "**/auth.spec.ts",
    "**/crud.spec.ts",
    "**/kpi.spec.ts",
    "**/lifecycle.spec.ts",
    "**/users.spec.ts",
    "**/security.spec.ts",
  ],
  farmer_f1_all: ["**/auth.spec.ts", "**/lifecycle.spec.ts", "**/kpi.spec.ts", "**/security.spec.ts"],
  farmer_f1_partial: ["**/auth.spec.ts", "**/lifecycle.spec.ts", "**/security.spec.ts"],
  farmer_f2: ["**/auth.spec.ts", "**/lifecycle.spec.ts", "**/security.spec.ts"],
  no_assignment: ["**/auth.spec.ts", "**/security.spec.ts"],
};

const reporters: ReporterDescription[] = [
  ["list"],
  ["html", { open: "never", outputFolder: "playwright-report" }],
];

export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  expect: { timeout: 15_000 },
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
      name: "setup-superadmin",
      testDir: "./e2e",
      testMatch: ["**/setup.spec.ts"],
      use: { storageState: "./.auth/superadmin.json" },
    },
    ...Object.entries(rolesSpecs).map(([role, specs]) => ({
      name: role,
      testDir: "./e2e",
      testMatch: specs,
      use: { storageState: `./.auth/${role}.json` },
    })),
  ],
});