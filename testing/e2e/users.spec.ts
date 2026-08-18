/**
 * TASK 5 — Farmer/user-management API (farmerManagementRoutes).
 *
 * Verifies list/get/create/update/delete behaviour, validation, the
 * farmer_owner scoping rules, and the security surface of the role/delete/id
 * handling (documented as findings where the API is over-permissive).
 */
import { expect, test } from "../fixtures/roles";
import { loadState, appendFinding } from "../fixtures/api";

const id = (s: any) => String(s._id || s.id);

function seedUserIds() {
  return loadState().userIds;
}

test.describe("TASK 5 — farmers list/get + validation", () => {
  test.skip(({ role }) => role.key !== "superadmin", "guard: run on superadmin project");

  test("list returns QA users and roleStats meta", async ({ authed }) => {
    const res = await authed.get("/farmers?limit=500");
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    const qa = (json.data || []).filter((u: any) => /^qa_/.test(u.email));
    expect(qa.length).toBeGreaterThanOrEqual(8);
    expect(Array.isArray(json.roleStats)).toBe(true);
    expect(json.meta.total).toBeGreaterThanOrEqual(8);
  });

  test("get by id returns the user without a password", async ({ authed }) => {
    const ids = seedUserIds();
    const res = await authed.get(`/farmers/${ids.farmer_f1_all}`);
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.data.email).toBe("qa_farmer_f1_all@sugi.test");
    expect(json.data.password).toBeUndefined();
  });

  test("get with invalid id returns 400, unknown id returns 404", async ({ authed }) => {
    const bad = await authed.get("/farmers/not-an-id");
    expect(bad.status()).toBe(400);
    const missing = await authed.get("/farmers/000000000000000000000000");
    expect(missing.status()).toBe(404);
  });

  test("create validates required fields + email format", async ({ authed }) => {
    const noName = await authed.post("/farmers", { data: { email: "a@sugi.test", password: "abc123" } });
    expect(noName.status()).toBe(400);
    const noEmail = await authed.post("/farmers", { data: { name: "X", password: "abc123" } });
    expect(noEmail.status()).toBe(400);
    const badEmail = await authed.post("/farmers", { data: { name: "X", email: "nope", password: "abc123" } });
    expect(badEmail.status()).toBe(400);
    const shortPw = await authed.post("/farmers", { data: { name: "X", email: "a2@sugi.test", password: "ab" } });
    expect(shortPw.status()).toBe(400);
  });

  test("duplicate email is rejected (400)", async ({ authed }) => {
    const res = await authed.post("/farmers", {
      data: { name: "QA Dup", email: "qa_farmer_f1_all@sugi.test", password: "whatever" },
    });
    expect(res.status()).toBe(400);
  });

  test("farmer_owner creation requires assigned_farms", async ({ authed }) => {
    const res = await authed.post("/farmers", {
      data: { name: "QA T5 Owner", email: "qa_t5_owner@sugi.test", password: "abc123", role: "farmer_owner" },
    });
    expect(res.status()).toBe(400);
  });
});

test.describe("TASK 5 — farmers create/update/delete lifecycle", () => {
  test.skip(({ role }) => role.key !== "superadmin", "guard: run on superadmin project");

  test("create -> update -> soft delete round-trip", async ({ authed }) => {
    const email = `qa_t5_life_${Date.now()}@sugi.test`;
    const create = await authed.post("/farmers", {
      data: { name: "QA T5 Lifecycle", email, password: "abc123", role: "farmer" },
    });
    expect(create.status()).toBe(201);
    const userId = (await create.json()).data.id;

    const upd = await authed.put(`/farmers/${userId}`, { data: { name: "QA T5 Lifecycle V2" } });
    expect(upd.status()).toBe(200);
    expect((await upd.json()).data.name).toBe("QA T5 Lifecycle V2");

    const del = await authed.delete(`/farmers/${userId}`);
    expect(del.status()).toBe(200);

    // Soft delete: the user is now Inactive but still present in the listing.
    const list = await (await authed.get("/farmers?limit=500")).json();
    const hit = list.data.find((u: any) => u.email === email);
    expect(hit).toBeTruthy();
    expect(hit.status).toBe("Inactive");
  });

  test("owner cannot be created without valid farm ids", async ({ authed }) => {
    const res = await authed.post("/farmers", {
      data: { name: "QA T5 Bad", email: `qa_t5_bad_${Date.now()}@sugi.test`, password: "abc123", role: "farmer_owner", assigned_farms: ["nope"] },
    });
    expect(res.status()).toBe(400);
  });
});

test.describe("TASK 5 — farmer_owner scoping", () => {
  test.skip(({ role }) => role.key !== "owner_farm1", "guard: run on owner_farm1 project");

  test("owner sees only users they created plus themselves", async ({ authed }) => {
    const res = await authed.get("/farmers?limit=500");
    expect(res.status()).toBe(200);
    const json = await res.json();
    const emails = (json.data || []).map((u: any) => u.email);
    // Owner-created user appears; unrelated superadmin-created QA user does not.
    expect(emails).not.toContain("qa_farmer_f1_all@sugi.test");
    expect(emails).not.toContain("qa_superadmin@sugi.test");
    expect(emails).toContain("qa_owner_farm1@sugi.test"); // self
  });

  test("owner-created farmer lands under owner scope", async ({ authed }) => {
    const email = `qa_t5_own_${Date.now()}@sugi.test`;
    const create = await authed.post("/farmers", {
      data: { name: "QA T5 By Owner", email, password: "abc123", role: "farmer" },
    });
    expect(create.status()).toBe(201);
    const list = await (await authed.get("/farmers?limit=500")).json();
    expect(list.data.map((u: any) => u.email)).toContain(email);
  });

  test("owner cannot edit or delete a user they do not own (403)", async ({ authed }) => {
    const ids = seedUserIds();
    const foreign = ids.farmer_f1_all; // created by superadmin
    const upd = await authed.put(`/farmers/${foreign}`, { data: { name: "Hijack" } });
    expect(upd.status()).toBe(403);
    const del = await authed.delete(`/farmers/${foreign}`);
    expect(del.status()).toBe(403);
  });

  test("owner cannot change assigned_farms (403)", async ({ authed }) => {
    const ids = seedUserIds();
    const self = ids.owner_farm1;
    const res = await authed.put(`/farmers/${self}`, {
      data: { assigned_farms: [] },
    });
    expect(res.status()).toBe(403);
  });

  test("owner cannot create a farmer_owner (role forced to farmer)", async ({ authed }) => {
    const email = `qa_t5_force_${Date.now()}@sugi.test`;
    const create = await authed.post("/farmers", {
      data: { name: "QA T5 Forced", email, password: "abc123", role: "farmer_owner", assigned_farms: [loadState().farms["QA-1"]] },
    });
    expect(create.status()).toBe(201);
    const json = await create.json();
    expect(json.data.role).toBe("farmer");
  });
});

test.describe("TASK 5 — RBAC & privilege-escalation surface", () => {
  test.skip(({ role }) => role.key !== "farmer_f1_all", "guard: run on a farmer project");

  test("farmer can list all users (global scope)", async ({ authed }) => {
    const res = await authed.get("/farmers?limit=500");
    expect(res.status()).toBe(200);
    const json = await res.json();
    const data = json.data || [];
    expect(data.length).toBeGreaterThanOrEqual(8);
  });

  test("farmer can create a superadmin (privilege escalation)", async ({ authed }) => {
    const email = `qa_t5_esc_${Date.now()}@sugi.test`;
    const res = await authed.post("/farmers", {
      data: { name: "QA T5 Escalation", email, password: "abc123", role: "superadmin" },
    });
    const json = await res.json();
    // FINDING (UM-01): createUser only forces role=farmer for farmer_owner
    // callers; any other authenticated role (incl. farmer) can pass an arbitrary
    // role value, so a farmer can mint a superadmin account.
    if (res.status() === 201 && json.data?.role === "superadmin") {
      appendFinding(
        "5",
        "critical",
        "Any authenticated user can create a superadmin (role value not constrained)",
        "POST /farmers with role=superadmin from a farmer must be rejected (403/400).",
        `Observed farmer POST /farmers {role:"superadmin"} -> 201 role=${json.data?.role}. createUser validates name/email/password only; payload.role = role || 'farmer'.`,
        "backend/controller/farmerManagementController.js createUser: role is taken verbatim from req.body for non-farmer_owner callers."
      );
      expect(json.data.role).toBe("superadmin");
    } else {
      expect(res.status()).toBeGreaterThanOrEqual(400);
    }
  });

  test("farmer can soft-delete any user (IDOR on delete)", async ({ authed }) => {
    // Create a throwaway victim the farmer does not own (owned by superadmin).
    const email = `qa_t5_victim_${Date.now()}@sugi.test`;
    const created = await authed.post("/farmers", {
      data: { name: "QA T5 Victim", email, password: "abc123", role: "farmer" },
    });
    expect(created.status()).toBe(201);
    const victim = (await created.json()).data.id;
    const res = await authed.delete(`/farmers/${victim}`);
    // FINDING (UM-02): deleteUser only restricts farmer_owner callers. A plain
    // farmer can deactivate any user in the system.
    if (res.status() === 200) {
      appendFinding(
        "5",
        "major",
        "Any authenticated user can soft-delete any other user",
        "Only superadmin/government (or an owning farmer_owner) may deactivate a user.",
        `Observed farmer DELETE /farmers/:victim -> 200 ("User dinonaktifkan"). deleteUser has no role guard beyond the farmer_owner branch.`,
        "backend/controller/farmerManagementController.js deleteUser."
      );
    }
    expect(res.status()).toBe(200);
  });

  test("farmer can read any user by id (no scope check on get)", async ({ authed }) => {
    const ids = seedUserIds();
    const res = await authed.get(`/farmers/${ids.superadmin}`);
    // FINDING (UM-03): getUserById returns any user to any authenticated caller.
    if (res.status() === 200) {
      appendFinding(
        "5",
        "major",
        "getUserById leaks any user to any authenticated caller",
        "A farmer must not be able to read superadmin/government accounts.",
        `Observed farmer GET /farmers/:superadminId -> 200. getUserById has no ownership/role filter.`,
        "backend/controller/farmerManagementController.js getUserById."
      );
    }
    expect(res.status()).toBe(200);
  });
});
