/**
 * Shared data access for the frontend QA suite: reads the QA state file and
 * provides API constants. Browsers are authenticated via storageState; the
 * fixture `page.request` can still hit the backend through the vite proxy.
 */
import * as fs from "fs";
import * as path from "path";

export const API_BASE = process.env.QA_API_BASE || "http://localhost:3000/api";
export const FRONTEND_BASE = process.env.QA_FRONTEND_BASE || "http://localhost:5173";
export const FINDINGS_FILE = path.join(__dirname, "..", "QA_FINDINGS.md");

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
  cyclesByFarm: Record<string, string[]>;
}

export const STATE_FILE = path.join(__dirname, "..", ".state", "qa-state.json");

export function loadState(): QaState {
  if (!fs.existsSync(STATE_FILE)) {
    throw new Error(`QA state file not found at ${STATE_FILE}. Run the setup project first.`);
  }
  return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
}

/** Append a findings entry (append-only, deduped by title). */
export function appendFinding(
  task: string,
  severity: "critical" | "major" | "minor" | "info",
  title: string,
  expected: string,
  observed: string,
  detail?: string
): void {
  fs.mkdirSync(path.dirname(FINDINGS_FILE), { recursive: true });
  if (fs.existsSync(FINDINGS_FILE) && fs.readFileSync(FINDINGS_FILE, "utf8").includes(`**Title:** ${title}`)) {
    console.log(`[FAI] FE Task ${task} | ${severity} | ${title} (already logged)`);
    return;
  }
  const block = [
    "",
    `## Finding — FE Task ${task} (${new Date().toISOString()})`,
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
  console.log(`[FAI] FE Task ${task} | ${severity} | ${title}`);
}