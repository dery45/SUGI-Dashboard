/**
 * Per-role test fixtures for the QA suite.
 * Every project declares a storageState (.auth/<role>.json) written by
 * global-setup.ts; `role` resolves the current RoleFixture from that file name
 * and `authed` hands back an authenticated API client using the stored token.
 */
import { test as base } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { ROLES, RoleKey, RoleFixture, Api, apiWith } from "./api";

/** Read the localStorage token from this project's storageState file. */
export function storageToken(testInfo: {
  project: { use: { storageState?: any } };
}): { key: RoleKey; fixture: RoleFixture; token: string } {
  const ss = testInfo.project.use.storageState as string | undefined;
  const ssPath = ss || "";
  const raw = JSON.parse(fs.readFileSync(ssPath, "utf8"));
  const found = (raw.origins || [])[0]?.localStorage || [];
  const entry = found.find((x: { name: string }) => x.name === "token");
  if (!entry) throw new Error(`no token in storageState ${ssPath}`);
  const key = path.basename(ssPath, ".json") as RoleKey;
  if (!ROLES[key]) throw new Error(`unknown role project ${key}`);
  return { key, fixture: ROLES[key], token: entry.value };
}

type TestFixtures = {
  role: RoleFixture;
  token: string;
  authed: Api;
};

export const test = base.extend<TestFixtures>({
  role: async ({}, use, testInfo) => {
    await use(storageToken({ project: testInfo.project }).fixture);
  },
  token: async ({}, use, testInfo) => {
    await use(storageToken({ project: testInfo.project }).token);
  },
  authed: async ({ token }, use) => {
    const api = await apiWith(token);
    await use(api);
    await api.dispose();
  },
});

export { expect } from "@playwright/test";