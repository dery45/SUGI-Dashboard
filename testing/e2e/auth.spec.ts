/**
 * TASK 1 — Auth & session.
 * Exercises /auth/login (public), /auth/me (authenticated), and the 401/400
 * failure modes. Both functional (per-role) and security (once) coverage.
 */
import { expect, test } from "../fixtures/roles";
import { API_BASE } from "../fixtures/api";

test.describe("TASK 1 — auth & session", () => {
  test("login returns token + user with matching role and identity", async ({ role, request }) => {
    const res = await request.post(`${API_BASE}/auth/login`, {
      data: { email: role.email, password: role.password },
    });
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.token).toBeTruthy();
    expect(json.user.email).toBe(role.email);
    expect(json.user.role).toBe(role.role);
    expect(json.user.password).toBeUndefined();
  });

  test("me returns the current user without exposing password", async ({ authed }) => {
    const res = await authed.get(`${API_BASE}/auth/me`);
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.user._id).toBeTruthy();
    expect(json.user.password).toBeUndefined();
    expect(json.user.email).toBeTruthy();
  });

  test("me works with the token handed out by login", async ({ role, request }) => {
    const login = await (await request.post(`${API_BASE}/auth/login`, { data: { email: role.email, password: role.password } })).json();
    const me = await request.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${login.token}` },
    });
    expect(me.status()).toBe(200);
    const json = await me.json();
    expect(json.user.email).toBe(role.email);
  });

  test("storageState token (UI session) is accepted by the API", async ({ token, request }) => {
    const res = await request.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
  });

  test.describe("public endpoint abuse (runs on superadmin project)", () => {
    test.skip(({ role }) => role.key !== "superadmin", "guard: run once");

    test("wrong password is rejected with 401", async ({ role, request }) => {
      const res = await request.post(`${API_BASE}/auth/login`, {
        data: { email: role.email, password: "definitely-wrong" },
      });
      expect(res.status()).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
    });

    test("unknown email is rejected with 401", async ({ request }) => {
      const res = await request.post(`${API_BASE}/auth/login`, {
        data: { email: "nobody@does.not.exist", password: "whatever" },
      });
      expect(res.status()).toBe(401);
      expect((await res.json()).success).toBe(false);
    });

    test("missing credentials are rejected with 400", async ({ request }) => {
      const missingPassword = await request.post(`${API_BASE}/auth/login`, { data: { email: "x@y.z" } });
      expect(missingPassword.status()).toBe(400);
      const missingEmail = await request.post(`${API_BASE}/auth/login`, { data: { password: "p" } });
      expect(missingEmail.status()).toBe(400);
      const emptyBody = await request.post(`${API_BASE}/auth/login`, { data: {} });
      expect(emptyBody.status()).toBe(400);
    });

    test("me without a token is rejected with 401", async ({ request }) => {
      const res = await request.get(`${API_BASE}/auth/me`);
      expect(res.status()).toBe(401);
      expect((await res.json()).message).toMatch(/Token/);
    });

    test("me with a forged/invalid token is rejected with 401", async ({ request }) => {
      const res = await request.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: "Bearer not.a.jwt.token" },
      });
      expect(res.status()).toBe(401);
      expect((await res.json()).message).toMatch(/Token/);
    });

    test("me with a non-bearer Authorization header is rejected with 401", async ({ request }) => {
      const res = await request.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: "Basic dXNlcjpwYXNz" },
      });
      expect(res.status()).toBe(401);
    });
  });
});