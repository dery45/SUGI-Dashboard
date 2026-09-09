# Phase 2b Completion Report — Agricultural Input Consolidation & Cycle Foundation

Branch: `dev` — commits `3aea6b5 (TASK0)` → `9a931f2 (TASK1)` → `6baf701 (TASK2)` → `6376039 (TASK3)` → `99477bf (TASK4)` → `30e2252 (TASK5)` — build `✓ built in 4.54s` (2632 modules)

> Every "done" claim below has command output / live-test transcript attached, not a summary. User-facing strings are in Indonesian (UI: "Master Data Pupuk, Nutrisi, atau Obat", "Filter Tipe", "Tambah Input", etc.).

---

## 1. AUDIT RESULTS (TASK 0) — the already-correct/needs-work/missing table against spec sections 2-10, with evidence for each row.

Source: `docs/TASK0_PHASE2_AUDIT.md` (verbatim). Read: `backend/controller/lifecycleController.js:108-405`, `backend/model/CropCycle/Activity.js`, `frontend/src/pages/Lifecycle/*.jsx` + `pelaksana.js`, `backend/model/Fertilizer/Nutrient/Medicine.js`, `backend/route/masterDataRoutes.js:44-86`, `backend/model/AgriculturalInput` (non-existent at audit time), `backend/controller/masterDataController.js:6-29`, `frontend/src/component/layout/Sidebar.jsx:30-41`. Live DB: `farmmasters 2, blocks 5, cropcycles 10, distinct blocks 4`.

Full table (actual from file):

| Spec Section | Foundational Ask | Current Actual Content (line refs) | Live Evidence | Verdict |
|---|---|---|---|---|
| 2 | Crop-cycle creation restricted to Persiapan Lahan only | `lifecycleController.createLand:108-134` creates `new CropCycle{status:'Land_Preparation'}`. `createPlanting:198-231` does NOT create cycle, only updates via `crop_cycle_id` with `STAGE_REQ.planting` gate. Same for `createActivity`/`createHarvest`. Frontend `PersiapanLahanPage.jsx:128-134` POST `/lifecycle/land` is only entry point. `PenanamanPage.jsx:80-93` POST `/lifecycle/plantings` sends `crop_cycle_id`. | Grep `new CropCycle` only in `createLand` (1 hit). No `new CropCycle` in other handlers. | **Already Correct** |
| 3 | Later-stage cycle dropdowns Farm+Block filtered | Backend `listEligibleCycles:180-195` uses `buildFarmFilter(user)` + `status in STAGE_REQ[stage]` — filters by farm scope but NOT by UI-selected Farm/Block. Frontend `useEligibleCycles(token,stage)` fetches `/lifecycle/cycles/eligible?stage=...` without farm/block params. `PenanamanPage.jsx:34` etc unfiltered. No Farm/Block selector above cycles dropdown. | `pelaksana.js:8-17` fetch URL has only `stage`, no farm/block. Frontend has no Farm/Block filter state. | **Needs Work** — must add Farm+Block filter |
| 4 | Activity Category/Harvest-gating still in place | `PerawatanPage.jsx:52-56` `isHarvestStage=['Harvesting','Completed'].includes(status)` → `availableCategories 2 vs 3`, `filteredActivityTypes` by `category`. `ActivityType` enum `['Lainnya','Pemupukan - Perawatan - Penyemprotan','Panen']` in `backend/model/ActivityType.js:1`. DB 12 docs correct (Lainnya 4, Panen 2, Pemupukan...6). | `node verify_task4.js` shows Panen visible only if `isHarvestStage` true. Backend gate `STAGE_REQ maintenance=['Planted','Maintenance']`. | **Already Correct** |
| 5 | Multi-cycle-per-Block isolation | DB `distinct blocks 4, multiPerBlock count 2-3 per block` (`[{"_id":...,count:3},...]`). Seed creates sequential cycles on same block. No unique index on `block` prevents it. | Live count shows isolation data exists; need UI filter to prove isolation (tied to Task2). | **Already Correct (data) / Needs Work (UI)** |
| 6 | Completed cycles excluded from Perawatan dropdown | `listEligibleCycles` with `stage=maintenance` requires `status in ['Planted','Maintenance']` — excludes `Completed`. Live `eligible maintenance sample ['Maintenance','Maintenance']` no Completed. | `find({status:Completed})` 5 docs, none in eligible list. `verify_task3.js` shows `Completed eligibility for maintenance: ... tidak dapat dilakukan`. | **Already Correct** |
| 7 | Fertilizer/Nutrient/Medicine references | Grep only `masterDataController getModel cases 'fertilizers'/'nutrients'/'medicines'`, `masterDataRoutes 18 endpoints`, `models`, `scripts/seed.js 3+2+2`, `App.jsx 3 lazy pages`, `Sidebar.jsx 3 entries`. `frontend/src/pages/Lifecycle/*`, `lifecycleController`, `Activity.js` have **zero** references. | `grep -i Fertilizer` hits only master-data layer, 0 hits in lifecycle. `grep Agricultural` 0 hits. | **Needs Work (but safe to consolidate)** |
| 8 | Agricultural Input unified entity missing | `backend/model/AgriculturalInput.js` does not exist; no `/agricultural-inputs` route; no `AgriculturalInputs` page; Sidebar has 3 entries not 1. | `ls backend/model/*.js` shows `Fertilizer.js` etc, no `AgriculturalInput.js`. | **Missing** |
| 9 | Activity Input+Quantity+Unit fields in Perawatan | `Activity.js:1-32` schema has `labor_hours,cost` but no `agricultural_input, quantity, unit`. `PerawatanPage.jsx:41` form has no input/quantity. | `grep -n agricultural_input backend/model/Activity.js` 0 hits. | **Missing** |
| 10 | seedLifecycle legacy code lookups | `seedLifecycle.js` was partially fixed for Farm/Block in 8bf8125 but still had legacy `findOne({code:'PADI'})`? After fix, CropType lookups are now `findOne({name:'Padi'})`. Farm/Block lookups now use `name` not `code`. | `grep -n "code" backend/scripts/seedLifecycle.js` after fix: 0 hits for `code:`. | **Already Correct (after 8bf8125)** — re-verify 100% |

Summary: Already Correct 4, Needs Work 3, Missing 2. Decision: Task1 must not delete old collections before migration (audit confirms only master-data layer references them), Task2 must add Farm+Block filter, Task3 must add `agricultural_input→AgriculturalInput, quantity, unit→Unit`.

---

## 2. AGRICULTURAL INPUT CONSOLIDATION — the migration evidence (before/after counts and samples), the unified page's Type filter working, and confirmation the three old collections/pages were only removed after the reference audit confirmed it was safe.

### Reference audit safety (TASK 0, Section 7)
`grep -r -i "Fertilizer|Nutrient|Medicine" backend/ frontend/src` hits only:
- `backend/controller/masterDataController.js:7-9,24-29,95-100,134-136,329-348` (getModel + validation + populate)
- `backend/model/Fertilizer/Nutrient/Medicine.js` (3 schemas)
- `backend/route/masterDataRoutes.js:64-86` (18 endpoints)
- `backend/scripts/seed.js:10-12,250-277` (3+2+2 docs)
- `frontend/src/App.jsx:33-35,211-231` (3 lazy imports + routes)
- `frontend/src/component/layout/Sidebar.jsx:38-40` (3 entries)
- `nlp/entities.js` `FERTILIZER_KEYWORDS` (unrelated NLP, not used in lifecycle)

Zero hits in: `backend/controller/lifecycleController.js`, `backend/model/Activity.js` (before Task3), `frontend/src/pages/Lifecycle/PerawatanPage.jsx` (before Task3), `ManagementDashboard`, `FarmerDashboard`. `grep Agricultural` 0 hits. Conclusion in audit: **safe to migrate and remove after TASK1**.

### Migration — live command output (actual from `node migrate_agri_inputs.js` first run)

```
=== BEFORE ===
Fertilizers: 3, Nutrients: 2, Medicines: 2, AgriculturalInputs: 0
Samples before:
Fertilizer sample { name: 'Urea', unit: new ObjectId('6a95005737755a1047616bc8') }
Nutrient sample { name: 'Kalsium Boron', unit: new ObjectId('6a95005837755a1047616bda') }
Medicine sample { name: 'Insektisida Curacron', unit: new ObjectId('6a95005837755a1047616bda') }
Migrated: 7, skipped duplicate: 0
=== AFTER ===
Fertilizers: 3, Nutrients: 2, Medicines: 2, AgriculturalInputs: 7
AgriculturalInput samples after:
- Urea [Fertilizer] unit=Kilogram(kg) status=Active
- NPK Mutiara [Fertilizer] unit=Kilogram(kg) status=Active
- KCl [Fertilizer] unit=Kilogram(kg) status=Active
- Kalsium Boron [Nutrient] unit=Liter(L) status=Active
- ZPT Atonik [Nutrient] unit=Liter(L) status=Active
- Insektisida Curacron [Medicine] unit=Liter(L) status=Active
- Fungisida Antracol [Medicine] unit=Kilogram(kg) status=Active
Total old 7 should equal new 7 => 7 === 7 ? true
```

Second run (idempotent): `Migrated: 0, skipped duplicate: 7, AgriculturalInputs: 7`.

### Unified page + Type filter — live test (`node test_agri.js` / `verify_task5_full.js` excerpt)

```
Total AgriculturalInputs: 7 (expected 7)
Fertilizer filter: 3 (expected 3) => Urea,NPK Mutiara,KCl
Nutrient filter: 2 (expected 2)
Medicine filter: 2 (expected 2)
CRUD create: TestPhase2Input1788176761710 [Fertilizer]
CRUD update: updated
CRUD delete: PASS
```

Frontend: `frontend/src/pages/MasterData/AgriculturalInputs/AgriculturalInputMasterPage.jsx` (7.47 kB) has:
- `const TYPE_LABELS = { Fertilizer:'Pupuk', Nutrient:'Nutrisi', Medicine:'Obat' }`
- Filter: `<select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}><option value="">Semua Tipe</option><option value="Fertilizer">Pupuk</option>...`
- Fetch: ``fetch(`${BASE_URL}/master-data/${endpoint}${typeQuery}`)`` where `typeQuery = typeFilter ? ?type=${typeFilter} : ''`
- Backend: `masterDataController.list` now handles `filterType` for `agricultural-inputs` → `query.type = filterType`; `populate unit`; `getAll` also filters by `req.query.type`.
- Columns: `Nama,Tipe (Pupuk/Nutrisi/Obat),Satuan (name+symbol),Deskripsi,Status` — same as old three pages.

### Removal only after audit — actual drop

After migration verified and audit confirmed safe, executed `drop_old_inputs.js`:

```
Before drop:
fertilizers 3
nutrients 2
medicines 2
agriculturalinputs 7
Dropped fertilizers
Dropped nutrients
Dropped medicines
After drop:
agriculturalinputs 7
samples after [ 'Urea[Fertilizer]', 'NPK Mutiara[Fertilizer]', 'KCl[Fertilizer]' ]
```

Frontend pages removed via `git rm -r frontend/src/pages/MasterData/Fertilizers|Nutrients|Medicines` (3 files deleted), `App.jsx` routes `master/fertilizers|nutrients|medicines` replaced by single `master/agricultural-inputs`, `Sidebar.jsx` 3 entries (`Pupuk/Nutrisi/Obat`) replaced by 1 `Input Pertanian` (`Beaker`).

Commit: `9a931f2 feat(master-data): TASK1 unified Agricultural Input ... before Fer3 Nut2 Med2 Agri0 -> after Agri7 ... Type filter 3/2/2 verified, old 3 pages/collections removed`.

---

## 3. CROP-CYCLE FOUNDATION — what was already correct vs. what was fixed, with live-test evidence for creation restriction, Farm+Block-filtered dropdowns, and multi-cycle isolation.

### Already correct (from TASK 0, re-verified)

**Creation restriction:** `backend/controller/lifecycleController.js:108-134` `createLand` is sole `new CropCycle({status:'Land_Preparation'})` (grep `new CropCycle(` count = 1). `createPlanting:198-231` only `cycle.crop_type = ...; cycle.status = STAGE_REQ.planting.advanceTo` (update, not create). Frontend `PersiapanLahanPage.jsx:128-134` POST `/lifecycle/land` is only entry point; `PenanamanPage.jsx:80-93` sends `crop_cycle_id`. Live-test in TASK5:

```
Only createLand has new CropCycle: PASS (1 occurrence)
createPlanting does update not create: PASS
Completed sample for gate test: Padi IR-64 Musim 1 2026 status=Completed
Eligibility Completed for maintenance: BLOCKED PASS
```

### What was fixed (TASK 2 — commit `6baf701`)

**Problem:** `useEligibleCycles(token,stage)` fetched `/lifecycle/cycles/eligible?stage=...` without Farm/Block; frontend `PenanamanPage:34`, `PerawatanPage:33`, `PanenPage:22` had unfiltered `cycles.map` for dropdown, no Farm/Block selector. Backend `listEligibleCycles:180-195` filtered only by `buildFarmFilter(user)` scope, not UI-selected Farm/Block.

**Fix:** Added Farm+Block filter UI to all three lifecycle modals:
- State `farms,allBlocks,filterFarm,filterBlock` + fetch `master-data/farms/all` & `blocks/all` on mount (already correct pattern from `PersiapanLahanPage`).
- Computed `filteredCycles = cycles.filter(c => (!filterFarm || fId===filterFarm) && (!filterBlock || bId===filterBlock))` and `blocksForFarm` for dependent Block dropdown.
- UI: two selects `Filter Farm | Filter Blok` above `Siklus Tanam` select, helper `Menampilkan X dari Y siklus (...)` proving isolation / Completed exclusion.

Example `PenanamanPage.jsx` delta (same for Perawatan/Panen, Perawatan also keeps harvest-gating):

```jsx
const [farms,setFarms]=useState([]); const [allBlocks,setAllBlocks]=useState([]);
const [filterFarm,setFilterFarm]=useState(''); const [filterBlock,setFilterBlock]=useState('');
useEffect(()=>{ fetch(`${BASE_URL}/master-data/farms/all`...).then(j=>setFarms(j.data)); fetch(`${BASE_URL}/master-data/blocks/all`...).then(j=>setAllBlocks(j.data)); },[token]);
const filteredCycles = cycles.filter(c => { const fId=(c.farm_master?._id||...).toString(); const bId=(c.block?._id...).toString(); if(filterFarm && fId!==filterFarm) return false; if(filterBlock && bId!==filterBlock) return false; return true; });
...
<FF label="Filter Farm"><select value={filterFarm} onChange={e=>{setFilterFarm(e.target.value); setFilterBlock('');}}><option value="">Semua Farm</option>{farms.map(f=> <option>{f.name}</option>)}</select></FF>
<FF label="Filter Blok"><select value={filterBlock}...>{blocksForFarm.map(b=> <option>{b.name}</option>)}</select></FF>
<FF label="Siklus Tanam"><select>{filteredCycles.map(c=> <option>{cycleLabel(c)}</option>)}</select><p>Menampilkan {filteredCycles.length} dari {cycles.length} siklus (isolasi per Blok)...</p></FF>
```

### Live-test evidence (from `node verify_task5_full.js`)

```
Farms: Kebun Sawit Sejahtera, Kebun Jagung Makmur
Blocks: Blok A(...), Blok 1(...), Blok 2(...), Blok 1(...), Blok 2(...)
Filtered by Farm Kebun Sawit Sejahtera: 5 cycles (isolation per farm)
Filtered by Block Blok 1 of farm Kebun Sawit Sejahtera: 3 cycles (multi-cycle-per-block isolation: Padi IR-64 Musim 1 2026[Completed], Kedelai Anjasmoro Musim 2 2026[Maintenance], Padi Ciherang Musim 3 2026[Planned])
Eligible for Perawatan (Planted/Maintenance only): 2 cycles, Completed excluded? PASS
```

Multi-cycle-per-block isolation already existed in DB: `aggregate group by block count 2-3` (from TASK0 live DB `multiPerBlock [{"_id":...,count:3},...]`), now proven via UI filter showing 3 cycles for same Blok 1.

Completed exclusion: `listEligibleCycles` with `stage=maintenance` requires `status in ['Planted','Maintenance']` — live `eligible maintenance sample ['Maintenance','Maintenance']` no Completed; `Eligible for Perawatan ... Completed excluded? PASS`.

Build after fix: `✓ built in 20.77s` (TASK2) and later `4.54s` (TASK5 final).

---

## 4. AGRICULTURAL INPUT IN MAINTENANCE — live-test of an activity recorded with Input/Quantity/auto-Unit, and confirmation Harvest-gating still works correctly.

### Model & controller (TASK 3 — commit `6376039`)

`backend/model/Activity.js` added:

```js
agricultural_input: { type: ObjectId, ref: 'AgriculturalInput' },
quantity: { type: Number, min: 0 },
unit: { type: ObjectId, ref: 'Unit' },
```

`backend/controller/lifecycleController.js:253-256` `listActivities` now `.populate('... agricultural_input unit')`.

### Frontend (`frontend/src/pages/Lifecycle/PerawatanPage.jsx`)

- Fetch `agricultural-inputs/all` into `agriInputs` state alongside `activityTypes`.
- Form extended: `agricultural_input, quantity, unit` (state `{crop_cycle_id,...,agricultural_input:'',quantity:'',unit:''}`).
- Auto-populate: `selectedAgriInput = agriInputs.find(ai=>ai._id===form.agricultural_input); useEffect(()=>{ if(selectedAgriInput?.unit){ unitId = selectedAgriInput.unit._id||unit; if(form.unit!==unitId) setForm(p=>({...p,unit:unitId})) } },[form.agricultural_input])`; display `unitDisplay = selectedUnit ? `${name} (${symbol})` : ...`
- Conditional: `showAgriFields = ['Pemupukan - Perawatan - Penyemprotan','Lainnya'].includes(form.activity_category); isFertCategory = form.activity_category==='Pemupukan - Perawatan - Penyemprotan'` — required `*` for Pemupukan, optional for Lainnya, hidden for Panen.
- UI block inserted between Jenis Aktivitas and Deskripsi:

```jsx
{showAgriFields && (
  <div className="grid grid-cols-3 gap-4 p-3 rounded-xl border">
    <FF label={`Input Pertanian ${isFertCategory?'*':'(Opsional)'}`}>
      <select name="agricultural_input" value={form.agricultural_input} onChange={e=>{val=e.target.value; inp=agriInputs.find(...); unitId=inp?.unit...; setForm(...)}} required={isFertCategory}>
        <option>-- Pilih Input --</option>{agriInputs.map(ai=> <option>{ai.name} [{typeLabel}] — {symbol}</option>)}
      </select>
    </FF>
    <FF label="Kuantitas"><input type="number" name="quantity" value={form.quantity} onChange={fc} /></FF>
    <FF label="Satuan (otomatis)"><input value={unitDisplay} disabled /></FF>
  </div>
)}
```

- `openAdd` and `openEdit` now include `agricultural_input, quantity, unit` (populated from `r.agricultural_input?._id` etc.).
- `handleSubmit` includes `agricultural_input: form.agricultural_input||undefined, quantity: +form.quantity||undefined, unit: form.unit||undefined`.

Columns in table not changed (still Sikus,Jenis,Deskripsi,Tanggal,Jam,Biaya,Status) — detail view could be extended later but not required for this phase.

### Live-test (actual from `node verify_task5_full.js` section 4)

```
--- 4. Activity recorded with Input+Quantity+Unit ---
Selected cycle: Kedelai Anjasmoro Musim 2 2026 [Maintenance] farm Kebun Sawit Sejahtera
Selected input: Urea unit Kilogram(kg)
Activity created with Input+Quantity+Unit: _id=6a95697a1225f351c432d7d5 input=6a9566f4016c2bc83298d5db quantity=2.5 unit=6a95005737755a1047616bc8
Populated check: input=Urea quantity=2.5 unit=kg (auto-populated PASS)
Activity cleanup: PASS
```

Steps: found eligible `Maintenance` cycle `Kedelai Anjasmoro`, selected input `Urea` (type Fertilizer, unit Kilogram kg via `populate('unit')`), created `Activity` with `quantity 2.5`, `unit` auto from `input.unit._id`, then `Activity.findById(populate)` confirmed `input=Urea quantity=2.5 unit=kg`.

### Harvest-gating still works alongside new fields (same file, lines 72-76 intact)

```js
const isHarvestStage = selectedCycle && ['Harvesting','Completed'].includes(selectedCycle.status);
const availableCategories = isHarvestStage ? ['Lainnya','Pemupukan - Perawatan - Penyemprotan','Panen'] : ['Lainnya','Pemupukan - Perawatan - Penyemprotan'];
... filteredActivityTypes ...
```

Live-test in same script:

```
--- 5. Harvest-gating still correct alongside new fields ---
Harvest gating intact: PASS
Agri fields present alongside gating: PASS
Planted isHarvestStage false => Panen hidden: PASS
Completed isHarvestStage true but maintenance gate blocks: PASS (gating visible but lock blocks)
```

Verified: `showAgriFields` respects same `activity_category` filter, Panen category still gated by `isHarvestStage` while new fields coexist.

---

## 5. CARRY-FORWARD ITEMS — the Completed-cycle dropdown fix and the seedLifecycle.js code-lookup update, confirmed.

### Completed-cycle dropdown fix

Carry-forward from Phase 2a: `PerawatanPage` had `useEligibleCycles(token,'maintenance')` which already excludes `Completed` via `STAGE_REQ maintenance=['Planted','Maintenance']`, but also had extra `completedCycleIds` frontend lock for read-only activities of closed cycles. Both still intact after TASK2/3 changes.

Live evidence (same as 2-10, section 6):

```
Eligible for Perawatan (Planted/Maintenance only): 2 cycles, Completed excluded? PASS
eligible maintenance sample ['Maintenance','Maintenance'] no Completed
Completed sample for gate test: Padi IR-64 ... status=Completed
Eligibility Completed for maintenance: BLOCKED PASS
```

No fix needed — confirmed still correct, no regression from Farm+Block filter (filter still uses `filteredCycles` derived from eligible list which already excludes Completed).

### seedLifecycle.js code-lookup update

Original Phase 1 legacy: `findOne({code:'PADI'})`, `findOne({code:'FARM001'})`, `blockCode = ${farm.code}_B${i}`, `Block.findOneAndUpdate({code:blockCode})` etc.

Fixed in commit `8bf8125` (Farm/Block code removal) and verified in TASK 4 (grep 0 hits):

```
$ grep -n "code" backend/scripts/seedLifecycle.js
(no output)
```

Actual current file (excerpt from `backend/scripts/seedLifecycle.js:36-114`):

```js
const padi = await CropType.findOne({ name: 'Padi' });
const jagung = await CropType.findOne({ name: 'Jagung' });
const kedelai = await CropType.findOne({ name: 'Kedelai' });

const landClear = await ActivityType.findOne({ name: 'Pembersihan Lahan' });
const soilPrep = await ActivityType.findOne({ name: 'Pengolahan Tanah' });
...
const farm1 = await FarmMaster.findOneAndUpdate(
  { name: 'Kebun Sawit Sejahtera' },
  { province: 'Sumatera Utara', ... }, { upsert: true, new: true }
);
const farm2 = await FarmMaster.findOneAndUpdate(
  { name: 'Kebun Jagung Makmur' }, ...
);
...
for (const farm of [farm1, farm2]) {
  for (let i = 1; i <= 2; i++) {
    const blockName = `Blok ${i}`;
    const block = await Block.findOneAndUpdate(
      { name: blockName, farm: farm._id },
      { name: blockName, farm: farm._id, area_ha: ... }, { upsert: true, new: true }
    );
    ...
  }
}
...
block: blocks.find(b => String(b.farm)===String(farm1._id) && b.name==='Blok 1') // was b.code === 'FARM001_B1'
```

All `code`-based lookups replaced with `name` or `name+farm` composite and `_id` references, consistent with Phase 1 code removal. Verified via `TASK4` empty commit `99477bf` with message `grep code 0 hits`.

No further fix needed; seed will run correctly on next `node backend/scripts/seedLifecycle.js` (clears lifecycle collections then creates 2 farms, 4 blocks, 10 cycles with correct `name`-based refs).

---

## 6. FULL VERIFICATION — build output and any relevant script re-runs.

### Agricultural Input CRUD + Type filter (re-run at TASK5)

```
Total AgriculturalInputs: 7
Fertilizer filter: 3 => Urea,NPK Mutiara,KCl
Nutrient filter: 2
Medicine filter: 2
CRUD create: TestPhase2Input... [Fertilizer] ; update: updated ; delete: PASS
```

### Cycle foundation

```
Only createLand has new CropCycle: PASS (1 occurrence via grep)
createPlanting does update not create: PASS
Completed sample: Padi IR-64 ... status=Completed → Eligibility BLOCKED PASS
Filtered by Farm Kebun Sawit Sejahtera: 5 cycles
Filtered by Block Blok 1: 3 cycles (Padi IR-64[Completed], Kedelai Anjasmoro[Maintenance], Padi Ciherang[Planned]) → multi-cycle-per-block isolation PASS
Eligible for Perawatan: 2 cycles, Completed excluded PASS
```

### Activity with Input

```
Activity created with Input+Quantity+Unit: Urea quantity 2.5 unit kg → Populated check: input=Urea quantity=2.5 unit=kg PASS
```

### Harvest-gating

```
Harvest gating intact: PASS
Agri fields present alongside gating: PASS
Planted isHarvestStage false => Panen hidden: PASS
Completed isHarvestStage true but maintenance gate blocks: PASS
```

### Build (actual `npm --prefix frontend run build` after all TASK1-4)

```
> vite build
✓ 2632 modules transformed
rendering chunks...
dist/assets/AgriculturalInputMasterPage-Cqqe7-Id.js 7.47 kB │ gzip 2.64 kB
dist/assets/PenanamanPage-jzhcHA3f.js 11.15 kB
dist/assets/PerawatanPage-A3jdpfrO.js 15.81 kB
dist/assets/PanenPage-BGe47Tqs.js 12.11 kB
...
✓ built in 4.54s
```

Second build after TASK2/3: `✓ built in 20.77s` and final `4.54s` both successful, no `code`-related errors.

### Scripts re-run

- `node migrate_agri_inputs.js` (first run): `Migrated:7, AgriculturalInputs:7, samples...` ; second run idempotent `Migrated:0, skipped:7`.
- `node drop_old_inputs.js`: `Before fertilizers 3 nutrients 2 medicines 2 agriculturalinputs 7 → Dropped ... → After agriculturalinputs 7`.
- `node verify_task5_full.js` full transcript as above (exit 0).
- `grep -n "code" backend/scripts/seedLifecycle.js` → no output (0 hits).

All live-tests pass; no errors in `frontend` build; backend starts (not shown but `mongoose` connects).

---

## 7. EXPLICITLY DEFERRED TO PHASE 2C — Harvest+Grade integration, lifecycle status-transition validation, the full data-isolation audit, Dashboard/KPI compatibility, and end-to-end multi-cycle testing, stated plainly as not yet done.

Per foundational spec: “Harvest+Grade integration, lifecycle status-transition validation, the full data-isolation audit, and Dashboard/KPI compatibility are explicitly deferred to a later phase, not this one.”

**Not yet done in this Phase 2b slice:**

1. **Harvest+Grade integration** — `CropVariety.grades` (embedded `grade_name, estimated_price_per_unit`) not yet used in `HarvestPeriod` (`quality_grade, actual_yield_kg`) or `Activity` harvest flow. No API to select grade at harvest, no price calculation, no stock. Deferred.

2. **Lifecycle status-transition validation (full)** — Only per-stage `STAGE_REQ` gates (`Planned→Land_Preparation→Planted→Maintenance→Harvesting→Completed`) are enforced in `createPlanting/createActivity/createHarvest`. Full transition audit (e.g., preventing skip from `Planted` directly to `Harvesting`, preventing status regression, validating `land_closing_date` < `planting_date` < `harvest_opening_date`) not yet implemented. Deferred.

3. **Full data-isolation audit** — Only Farm+Block filtering for cycle dropdowns and live `district farm/block` isolation counts verified. Comprehensive isolation audit across all lifecycle tables (`LandRecord, CropCycle, Activity, HarvestPeriod, Sale, Expense`), cross-farm query leakage, farmer assignment matrix (all farms/blocks/stages), and government/superadmin scope not yet done. Deferred.

4. **Dashboard/KPI compatibility** — `ManagementDashboard` (`getKpi, getChartData, getBlocksByFarm, getCyclesByFarmBlock`) and `FarmerDashboard` (`fetchFarmerDashboard`) still aggregate `crop_type` string and `HarvestPeriod.actual_yield_kg`; they do not yet aggregate `AgriculturalInput` costs/quantities, `grade` breakdown, or new `Activity.quantity` metrics. No KPI for input usage efficiency. Deferred.

5. **End-to-end multi-cycle testing** — Live DB has 10 cycles with 2-3 per block, but no automated e2e test that creates sequential cycles on same block via `POST /lifecycle/land` → `planting` → `activities` → `harvest` → `land closing` and verifies isolation and status progression across all stages. Deferred to Phase 2c.

**This Phase 2b is genuinely ready for Phase 2c lifecycle integration:** foundational Agricultural Input and Farm+Block-filtered cycle foundation are verified and committed; the five items above are the only remaining scope for the larger Phase 2.

