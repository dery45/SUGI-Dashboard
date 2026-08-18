/**
 * Playwright global-setup: log in all 8 fixture roles via the real login
 * endpoint, seed the QA fixture matrix via direct API calls, and persist
 * a storageState per role + a shared qa-state.json for all specs.
 */
import * as fs from "fs";
import * as path from "path";
import { FullConfig } from "@playwright/test";
import { ADMIN_SEED, AUTH_DIR, QaState, ROLES, STATE_FILE, saveState, login } from "./fixtures/api";
import { runSeed } from "./fixtures/seed";

export default async function globalSetup(config: FullConfig): Promise<void> {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
  const log = (s: string) => process.stdout.write(`  ${s}\n`);

  log("Logging in seed admin…");
  const admin = await login(ADMIN_SEED.email, ADMIN_SEED.password);

  log("Seeding QA fixture matrix…");
  let state = await runSeed(admin.token, log);

  // Ensure tokens exist for every role (runSeed already refreshes all role tokens).
  for (const [key, fixture] of Object.entries(ROLES)) {
    if (!state.tokens[key]) {
      const { token } = await login(fixture.email, fixture.password);
      state.tokens[key] = token;
    }
  }

  state = { ...state, tokens: state.tokens };
  saveState(state);

  // Write a storageState per role so browser projects never log in again.
  for (const [key] of Object.entries(ROLES)) {
    const token = state.tokens[key];
    if (!token) continue;
    const storage = {
      cookies: [],
      origins: [
        {
          origin: process.env.QA_FRONTEND_BASE || "http://localhost:5173",
          localStorage: [{ name: "token", value: token }],
        },
      ],
    };
    fs.writeFileSync(path.join(AUTH_DIR, `${key}.json`), JSON.stringify(storage, null, 2));
    log(`[auth] storageState saved for ${key}`);
  }

  log(`[setup] done — ${Object.keys(state.farms).length} farms, ${Object.keys(state.cyclesByFarm).length} farms cycled`);
}