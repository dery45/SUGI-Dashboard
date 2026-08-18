/**
 * Shared test data: role matrix, credentials, entity ids and API helpers.
 * The state file is written by global-setup.ts and read by every spec.
 *
 * Everything created by this suite is tagged QA_/qa_ so global-teardown.ts
 * can remove it without touching real demo/dev data.
 */
import { APIRequestContext, request as pwRequest } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

export const API_BASE = process.env.QA_API_BASE || "http://localhost:3000/api";
export const FRONTEND_BASE = process.env.QA_FRONTEND_BASE || "http://localhost:5173";

export const ADMIN_SEED = {
  email: process.env.QA_ADMIN_EMAIL || "superadmin@sugi.id",
  password: process.env.QA_ADMIN_PASSWORD || "superadmin123",
};

/** Append-only findings log (Ground Rule: document, don't fix). */
export const FINDINGS_FILE = path.join(__dirname, "..", "QA_FINDINGS.md");

export type RoleKey =
  | "superadmin"
  | "government"
  | "owner_farm1"
  | "owner_farm1_2"
  | "farmer_f1_all"
  | "farmer_f1_partial"
  | "farmer_f2"
  | "no_assignment";

export interface RoleFixture {
  key: RoleKey;
  name: string;
  email: string;
  password: string;
  role: "superadmin" | "government" | "farmer_owner" | "farmer";
  /** Farm scope for the role's baseline assertions (superadmin/government = org-wide). */
  scopedFarm: string | null;
}

export const ROLES: Record<RoleKey, RoleFixture> = {
  superadmin: {
    key: "superadmin",
    name: "QA Superadmin",
    email: "qa_superadmin@sugi.test",
    password: "qa_superadmin_1",
    role: "superadmin",
    scopedFarm: null,
  },
  government: {
    key: "government",
    name: "QA Government",
    email: "qa_government@sugi.test",
    password: "qa_government_1",
    role: "government",
    scopedFarm: null,
  },
  owner_farm1: {
    key: "owner_farm1",
    name: "QA Owner Farm1",
    email: "qa_owner_farm1@sugi.test",
    password: "qa_owner_farm1_1",
    role: "farmer_owner",
    scopedFarm: "QA-1",
  },
  owner_farm1_2: {
    key: "owner_farm1_2",
    name: "QA Owner Farm1+2",
    email: "qa_owner_farm1_2@sugi.test",
    password: "qa_owner_farm1_2_1",
    role: "farmer_owner",
    scopedFarm: "QA-2",
  },
  farmer_f1_all: {
    key: "farmer_f1_all",
    name: "QA Farmer F1 All",
    email: "qa_farmer_f1_all@sugi.test",
    password: "qa_farmer_f1_all_1",
    role: "farmer",
    scopedFarm: "QA-1",
  },
  farmer_f1_partial: {
    key: "farmer_f1_partial",
    name: "QA Farmer F1 Partial",
    email: "qa_farmer_f1_partial@sugi.test",
    password: "qa_farmer_f1_partial_1",
    role: "farmer",
    scopedFarm: "QA-1",
  },
  farmer_f2: {
    key: "farmer_f2",
    name: "QA Farmer F2",
    email: "qa_farmer_f2@sugi.test",
    password: "qa_farmer_f2_1",
    role: "farmer",
    scopedFarm: "QA-2",
  },
  no_assignment: {
    key: "no_assignment",
    name: "QA Farmer No Assignment",
    email: "qa_no_assignment@sugi.test",
    password: "qa_no_assignment_1",
    role: "farmer",
    scopedFarm: null,
  },
};

/** Persistent test-state written by global-setup.ts and consumed by specs. */
export interface QaState {
  tokens: Record<string, string>;
  userIds: Record<string, string>;
  farms: Record<string, string>;
  blocks: Record<string, string>;
  cropTypes: string[];
  activityTypes: string[];
  cycles: Record<string, string>;
  landRecords: string[];
  harvestPeriods: string[];
  activities: string[];
  sales: string[];
  expenses: string[];
  assignments: string[];
  /** farmCode -> [cycleId] to keep the sequential-cycle assertions cheap. */
  cyclesByFarm: Record<string, string[]>;
}

export const STATE_FILE = path.join(__dirname, "..", ".state", "qa-state.json");
export const AUTH_DIR = path.join(__dirname, "..", ".auth");

export function statePath(): string {
  return STATE_FILE;
}

export function loadState(): QaState {
  if (!fs.existsSync(STATE_FILE)) {
    throw new Error(`QA state file not found at ${STATE_FILE}. Run the setup project first.`);
  }
  return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
}

export function saveState(state: QaState): void {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

/**
 * Thin wrapper around APIRequestContext. Because Playwright's APIRequestContext
 * joins baseURL + path with standard URL rules, a leading-slash path (e.g.
 * "/auth/login") against baseURL "http://localhost:3000/api" resolves to
 * "http://localhost:3000/auth/login" (the /api prefix is dropped). To keep the
 * seed/teardown path literals readable, we strip leading slashes so every path
 * resolves relative to the /api base.
 */
export class ApiClient {
  constructor(
    private readonly ctx: APIRequestContext,
    private readonly base: string = ""
  ) {}
  private u(url: string, baseURLOverride?: string): string {
    const host = baseURLOverride ?? this.base;
    if (/^https?:\/\//.test(url)) return url;
    const trimmed = url.replace(/^\/+/, "");
    return host.endsWith("/") ? host + trimmed : host + "/" + trimmed;
  }
  get(url: string, options?: any) { return this.ctx.get(this.u(url), options); }
  post(url: string, options?: any) { return this.ctx.post(this.u(url), options); }
  put(url: string, options?: any) { return this.ctx.put(this.u(url), options); }
  patch(url: string, options?: any) { return this.ctx.patch(this.u(url), options); }
  delete(url: string, options?: any) { return this.ctx.delete(this.u(url), options); }
  async dispose(): Promise<void> { await this.ctx.dispose(); }
}

export type Api = ApiClient;

/** Create a raw API request context bound to a token. */
export async function apiWith(token: string): Promise<Api> {
  const ctx = await pwRequest.newContext({
    baseURL: API_BASE,
    extraHTTPHeaders: { Authorization: `Bearer ${token}` },
  });
  return new ApiClient(ctx, API_BASE);
}

/** Login via the real endpoint (used by global-setup). */
export async function login(
  email: string,
  password: string
): Promise<{ token: string; user: any }> {
  const api = new ApiClient(await pwRequest.newContext({ baseURL: API_BASE }), API_BASE);
  try {
    const res = await api.post("auth/login", { data: { email, password } });
    const text = await res.text();
    const json = JSON.parse(text);
    if (res.status() !== 200 || !json.success) {
      throw new Error(`Login failed for ${email}: ${res.status()} ${JSON.stringify(json)}`);
    }
    return { token: json.token, user: json.user };
  } finally {
    await api.dispose();
  }
}

/** Append a findings entry (append-only). */
export function appendFinding(
  task: string,
  severity: "critical" | "major" | "minor" | "info",
  title: string,
  expected: string,
  observed: string,
  detail?: string
): void {
  const block = [
    "",
    `## Finding — Task ${task} (${new Date().toISOString()})`,
    "",
    `**Severity:** ${severity}`,
    "",
    `**Title:** ${title}`,
    "",
    `**Expected:** ${expected}`,
    "",
    `**Observed:** ${observed}`,
    "",
  ];
  if (detail) block.push(`**Detail:** ${detail}`, "");
  block.push("---", "");
  fs.appendFileSync(FINDINGS_FILE, block.join("\n"), "utf8");
  console.log(`[FAI] Task ${task} | ${severity} | ${title}`);
}