/**
 * Frontend (UI) QA fixtures.
 *
 * FeRole resolution differs from the backend suite: browser projects here are
 * named `fe_<role>` (or `fe_anon`), so we derive the fixture from the project
 * name instead of a storageState path. The token lives in localStorage under
 * the frontend origin (written by global-setup.ts), which AuthContext reads —
 * so no UI login is required for authenticated projects.
 */
import { test as base, expect } from "@playwright/test";
import { API_BASE, QaState, loadState } from "./fe-api";

type FeFixtures = {
  /** project short name: superadmin | government | owner_farm1 | ... | anon */
  feRole: string;
  state: QaState;
  /** localStorage token for authenticated projects ("" for anon). */
  pageToken: (page: import("@playwright/test").Page) => Promise<string>;
};

export const test = base.extend<FeFixtures>({
  feRole: async ({}, use, testInfo) => {
    const name = testInfo.project.name; // e.g. fe_superadmin
    await use(name.replace(/^fe_/, ""));
  },
  state: async ({}, use) => {
    await use(loadState());
  },
  pageToken: async ({}, use) => {
    await use(async (page) => {
      return await page.evaluate(() => localStorage.getItem("token") || "");
    });
  },
});

export { expect } from "@playwright/test";