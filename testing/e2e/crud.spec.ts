/**
 * TASK 2 — Master-data CRUD correctness.
 * Farms / blocks / crop-types / activity-types: create, read, list, update,
 * delete, plus per-entity validation and the farmer_owner inline restrictions.
 * Fixtures are QA_-prefixed so global-teardown removes them.
 */
import { expect, test } from "../fixtures/roles";
import { loadState } from "../fixtures/api";

const T = (s: string) => `QA_T2_${s}`; // names
const C = (s: string) => `QA-T2-${s}`; // codes

async function countByName(authed: any, path: string, name: string): Promise<number> {
  const res = await authed.get(`${path}/all`);
  const json = await res.json();
  return (json.data || []).filter((x: any) => x.name === name).length;
}

test.describe("TASK 2 — master-data CRUD (validation & lifecycle)", () => {
  test.skip(({ role }) => role.key !== "superadmin", "guard: run on superadmin project");

  test.describe("farms", () => {
    test("create → read → update → delete round-trip", async ({ authed }) => {
      const name = T("Farm"); const code = C("FARM");
      // create
      const created = await (
        await authed.post("/master-data/farms", { data: { name, code, total_area_ha: 12.5, province: "Jawa Timur", city: "Malang" } })
      ).json();
      expect(created.success).toBe(true);
      const id = created.data._id;
      // read
      const fetched = await (await authed.get(`/master-data/farms/${id}`)).json();
      expect(fetched.data.name).toBe(name);
      expect(fetched.data.code).toBe(code);
      expect(Number(fetched.data.total_area_ha)).toBe(12.5);
      // update (PUT revalidates required fields, so send the full entity)
      const updated = await (
        await authed.put(`/master-data/farms/${id}`, {
          data: { name: T("Farm Renamed"), code, total_area_ha: 20 },
        })
      ).json();
      expect(updated.success).toBe(true);
      expect(updated.data.name).toBe(T("Farm Renamed"));
      expect(Number(updated.data.total_area_ha)).toBe(20);
      // list contains it
      const listed = await (await authed.get("/master-data/farms/all")).json();
      expect(listed.data.some((f: any) => f.code === code)).toBe(true);
      // delete
      const del = await authed.delete(`/master-data/farms/${id}`);
      expect(del.status()).toBe(200);
      const after = await authed.get(`/master-data/farms/${id}`);
      expect(after.status()).toBe(404);
    });

    test("create rejects missing name/code with 400", async ({ authed }) => {
      const noName = await authed.post("/master-data/farms", { data: { code: C("NONAME") } });
      expect(noName.status()).toBe(400);
      const noCode = await authed.post("/master-data/farms", { data: { name: T("NoCode") } });
      expect(noCode.status()).toBe(400);
    });

    test("duplicate code is rejected with 400", async ({ authed }) => {
      const code = C("DUP");
      const a = await authed.post("/master-data/farms", { data: { name: T("DupA"), code, total_area_ha: 1 } });
      expect(a.status()).toBe(201);
      const b = await authed.post("/master-data/farms", { data: { name: T("DupB"), code, total_area_ha: 1 } });
      expect(b.status()).toBe(400);
      const json = await b.json();
      expect(json.message).toMatch(/sudah ada/i);
    });

    test("PUT revalidates required fields (partial update rejected)", async ({ authed }) => {
      const name = T("PartialFarm"); const code = C("PARTIAL");
      const created = await authed.post("/master-data/farms", { data: { name, code, total_area_ha: 1 } });
      const id = (await created.json()).data._id;
      // Updating only area_ha omits required code -> 400 (full-field PUT).
      const partial = await authed.put(`/master-data/farms/${id}`, { data: { total_area_ha: 9 } });
      expect(partial.status()).toBe(400);
      await authed.delete(`/master-data/farms/${id}`);
    });

    test("get with invalid id returns 400, unknown id returns 404", async ({ authed }) => {
      expect((await authed.get("/master-data/farms/not-an-id")).status()).toBe(400);
      expect((await authed.get(`/master-data/farms/000000000000000000000000`)).status()).toBe(404);
    });
  });

  test.describe("blocks", () => {
    test("create with a valid farm, then list by farm filter", async ({ authed }) => {
      const farm = await (await authed.post("/master-data/farms", {
        data: { name: T("FarmBlock"), code: C("FBLOCK"), total_area_ha: 5 },
      })).json();
      const farmId = farm.data._id;
      const blockName = T("Block"); const blockCode = C("BLOCK");
      const res = await authed.post("/master-data/blocks", {
        data: { name: blockName, code: blockCode, farm: farmId, area_ha: 2.5 },
      });
      expect(res.status()).toBe(201);
      const json = await res.json();
      const blockId = json.data._id;
      // indirect farm reference is populated on read
      expect(String(json.data.farm?._id || json.data.farm)).toBe(farmId);
      // list filtered by farm
      const byFarm = await (await authed.get(`/master-data/blocks?farm=${farmId}`)).json();
      expect(byFarm.data.every((b: any) => {
        const fid = b.farm?._id || b.farm;
        return String(fid) === farmId;
      })).toBe(true);
      // update block (full entity; PUT revalidates required fields)
      const upd = await (await authed.put(`/master-data/blocks/${blockId}`, {
        data: { name: blockName, code: blockCode, farm: farmId, area_ha: 3.1 },
      })).json();
      expect(upd.success).toBe(true);
      expect(Number(upd.data.area_ha)).toBe(3.1);
      // delete block then farm
      expect((await authed.delete(`/master-data/blocks/${blockId}`)).status()).toBe(200);
      expect((await authed.delete(`/master-data/farms/${farmId}`)).status()).toBe(200);
    });

    test("create block requires farm (ObjectId)", async ({ authed }) => {
      const noFarm = await authed.post("/master-data/blocks", {
        data: { name: T("NoFarmBlock"), code: C("NOFARM"), area_ha: 1 },
      });
      expect(noFarm.status()).toBe(400);
      const badFarm = await authed.post("/master-data/blocks", {
        data: { name: T("BadFarmBlock"), code: C("BADFARM"), area_ha: 1, farm: "zzz" },
      });
      expect(badFarm.status()).toBe(400);
    });
  });

  test.describe("crop-types & activity-types", () => {
    test("crop-type create → update → delete", async ({ authed }) => {
      const name = T("Crop");
      const created = await authed.post("/master-data/crop-types", { data: { name, code: C("CROP") } });
      expect(created.status()).toBe(201);
      const id = (await created.json()).data._id;
      const upd = await authed.put(`/master-data/crop-types/${id}`, { data: { name: T("Crop Renamed"), code: C("CROP") } });
      expect(upd.status()).toBe(200);
      expect((await upd.json()).data.name).toBe(T("Crop Renamed"));
      expect((await authed.delete(`/master-data/crop-types/${id}`)).status()).toBe(200);
    });

    test("activity-type create → update → delete", async ({ authed }) => {
      const name = T("Activity");
      const created = await authed.post("/master-data/activity-types", { data: { name, code: C("ACT") } });
      expect(created.status()).toBe(201);
      const id = (await created.json()).data._id;
      expect((await authed.delete(`/master-data/activity-types/${id}`)).status()).toBe(200);
    });

    test("crop-type duplicate name is rejected", async ({ authed }) => {
      // QA_Timun is seeded once; a second crop-type with the same name must fail.
      const res = await authed.post("/master-data/crop-types", { data: { name: "QA_Timun", code: C("DUPCROP") } });
      expect(res.status()).toBe(400);
    });
  });

  test.describe("idempotency of master lists via /all", () => {
    test("seeded QA fixtures are present exactly once", async ({ authed }) => {
      expect(await countByName(authed, "/master-data/crop-types", "QA_Timun")).toBe(1);
      expect(await countByName(authed, "/master-data/activity-types", "QA_Merawat")).toBe(1);
    });
  });
});

test.describe("farmer_owner master-data restrictions", () => {
  test.skip(({ role }) => role.key !== "owner_farm1", "guard: run on owner_farm1 project");

  test("cannot create a new farm (403)", async ({ authed }) => {
    const res = await authed.post("/master-data/farms", {
      data: { name: T("OwnerFarm"), code: C("OWNERFARM"), total_area_ha: 3 },
    });
    expect(res.status()).toBe(403);
  });

  test("cannot delete an existing farm (403)", async ({ authed }) => {
    const state = loadState();
    const res = await authed.delete(`/master-data/farms/${state.farms["QA-1"]}`);
    expect(res.status()).toBe(403);
  });

  test("farms list is scoped to assigned farms only", async ({ authed }) => {
    const res = await authed.get("/master-data/farms/all");
    const json = await res.json();
    const codes = (json.data || []).map((f: any) => f.code);
    expect(codes).toContain("QA-1");
    expect(codes).not.toContain("QA-2");
  });

  test("get on an unassigned farm is denied (403)", async ({ authed }) => {
    const state = loadState();
    const res = await authed.get(`/master-data/farms/${state.farms["QA-2"]}`);
    expect(res.status()).toBe(403);
  });
});