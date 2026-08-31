# TASK 0 — Audit Master Data (Phase 1: Simplify & Restructure)

Tanggal: 2026-08-31
Cabang: `master` (audit sebelum perubahan)
Perintah bukti: `node backend` query ke Mongo + `read` semua model/controller/route/pages

---

## 1. Ringkasan Eksekutif

- **CropType dan ActivityType keduanya memiliki field `code` (required, unique, indexed) — TERKONFIRMASI ADA.** Tidak ada no-op: Task 1 wajib menghapusnya.
- Semua 8 dokumen `croptypes` dan 12 dokumen `activitytypes` terisi penuh untuk setiap field (8/8, 12/12) — tidak ada field yang kosong.
- Index `code_1` unique dan `name_1` unique ada di kedua koleksi; penghapusan `code` wajib `dropIndex`.
- Lifecycle dan Dashboard **tidak membaca** sebagian besar field CropType/ActivityType — hanya `name`, `category` (parsial), dan `code` (hanya untuk lookup seeding — akan diganti `_id`). Field lain hanya ditampilkan di halaman master-data itu sendiri.
- Rekomendasi Task 3/6/8: pangkas ke `name + category + status` (+ `_id` implisit). Semua field lain direkomendasikan HAPUS.

---

## 2. Sumber yang Diaudit

### Backend
- `backend/connection/db.js` — `MONGO_URI`, `connectMainDB()`.
- `backend/model/CropType.js:1-18` dan `backend/model/ActivityType.js:1-17`.
- `backend/controller/masterDataController.js:1-284` — dispatch `getModel(type)` + `cropTypeValidation`/`activityTypeValidation` (hanya `name`+`code` required) + `list/getById/create/update/remove/getAll` generik.
- `backend/controller/_datasetCrud.factory.js:1-94` — pola generik kedua (buildRules dari schema) — tidak dipakai untuk CropType/ActivityType.
- `backend/controller/lifecycleController.js:1-405` — `cycle.crop_type` (String) + `cycle.crop_type_ref` (ObjectId→CropType), `activity.activity_type` + `activity_type_ref` → ActivityType.
- `backend/route/masterDataRoutes.js:1-362` — Swagger + `authenticate` + `isManagement`/`isManagementOrFarmer`.
- `backend/route/lifecycleRoutes.js:1-204`.
- `backend/scripts/seed.js:1-385` — 8 CropTypes + 12 ActivityTypes dengan `code` sebagai key lookup.
- `backend/scripts/seedLifecycle.js:1-749` — lookup `findOne({code:...})` untuk 3 CropType + 9 ActivityType, lalu `cycle.crop_type = cropType.name` dan `activity.activity_type = act.type.name`.
- `backend/scripts/reset.js:1-28` — hanya drop `users,croptypes,activitytypes,farmmasters,blocks,farmerassignments,taskassignments` — Task 9 Reset scope selaras.

### Frontend
- `frontend/src/pages/MasterData/CropTypes/CropTypeMasterPage.jsx:1-157` — form `code,name,category,scientific_name,duration_days,yield_per_ha,unit,description`; tabel `code,name,category,scientific_name,duration_days,yield+unit`.
- `frontend/src/pages/MasterData/ActivityTypes/ActivityTypeMasterPage.jsx:1-156` — form `code,name,category,unit,duration_hours,color,description`; tabel `code,name,category,unit,duration_hours,color`.
- Lifecycle:
  - `frontend/src/pages/Lifecycle/PersiapanLahanPage.jsx:1-254` — tidak refer CropType/ActivityType langsung.
  - `frontend/src/pages/Lifecycle/PenanamanPage.jsx:1-184` — `fetch /master-data/crop-types`, dropdown `c.name (c.code)`, kirim `crop_type` + `crop_type_ref = c._id`, kolom `crop_type_ref?.name || crop_type`.
  - `frontend/src/pages/Lifecycle/PerawatanPage.jsx:1-224` — `fetch /master-data/activity-types`, dropdown `a.name` value `_id`, kirim `activity_type` + `activity_type_ref`, filter chips per tipe.
  - `frontend/src/pages/Lifecycle/PanenPage.jsx:1-221` — tidak pakai master-data tanam/aktivitas (hanya eligible cycles).
- Dashboard:
  - `frontend/src/pages/ManagementDashboard/ManagementDashboard.jsx:1-346` — hanya `cycle.crop_type` (string dari CropCycle), tidak baca CropType/ActivityType master.
  - `frontend/src/pages/FarmerDashboard/FarmerDashboard.jsx:1-428` — market intelligence, tidak baca CropType/ActivityType.
  - `frontend/src/pages/GovernmentDashboard/*`, `ChatbotInsight/*` — tidak baca.

### Database (live)
```
sample croptypes[0]: { code:"PADI", name:"Padi", scientific_name:"Oryza sativa", category:"Padi", duration_days:120, yield_per_ha:5000, unit:"Kg", description:"Tanaman pangan utama Indonesia", status:"Active" }
sample activitytypes[0]: { code:"LAND_CLEAR", name:"Pembersihan Lahan", category:"Pengolahan Lahan", description:"...", duration_hours:16, color:"#f59e0b", unit:"HOK", status:"Active" }
indexes croptypes: [_id_, code_1 unique, name_1 unique]
indexes activitytypes: [_id_, code_1 unique, name_1 unique]
counts: croptypes 8, activitytypes 12
field fill-rate: 100% semua field (lihat Bagian 4)
```

---

## 3. Keputusan Arsitektur (Interpretation #5)

Pola existing:
- **Pola A**: `backend/controller/masterDataController.js:getModel(type)` dispatch — dipakai untuk 4 master operasional (farms/blocks/crop-types/activity-types).
- **Pola B**: `backend/controller/_datasetCrud.factory.js` + `backend/route/_datasetCrud.factory.js` — dipakai untuk 13 dataset ketahanan pangan.

Evaluasi: CropVariety butuh embedded Grades (array subdocument) + referensi ke CropType + Unit — pola generik tidak memberi validasi/populasi khusus. Unit/Fertilizer/Nutrient/Medicine berbentuk identik (Name+Unit+Description+status) dan cocok untuk pola generik.

**Keputusan:**
- **CropVariety → controller & model DEDICATED** (`cropVarietyController.js` + `CropVariety.js` dengan `GradeSchema` embedded). Alasan: grade CRUD inline (add/edit/delete tanpa resubmit seluruh variety) butuh handler khusus.
- **Unit / Fertilizer / Nutrient / Medicine → perpanjang Pola A** (tambah case di `masterDataController.getModel` + validasi). Alasan: bentuk seragam, reuse `list/getById/create/update/remove/getAll` generik, konsistensi dengan CropType/ActivityType, minim duplikasi. Tidak memakai Pola B agar operasional master-data tetap di satu controller/route file.

Sidebar & peran (Interpretation #6): Master Data submenu saat ini `Farm(superadmin-only)/Block/Jenis Tanaman/Jenis Aktivitas` untuk `farmer_owner+superadmin`. Lima katalog baru (Unit, Varietas, Pupuk, Nutrisi, Obat) **mengikuti hak yang sama: Owner + superadmin** — tidak ada yang superadmin-only (berbeda dari Farm). Tidak untuk `farmer` atau `government`.

---

## 4. Tabel Field → Actually Used Where

### 4A. CropType — `backend/model/CropType.js:3-14`

| Field | Tipe | Required/Unique/Index | Seed terisi | DIPAKAI DI MANA (bukti baris) | Benar-benar dibaca Lifecycle/Dashboard? | Rekomendasi Task 3/8 |
|-------|------|-----------------------|-------------|------------------------------|------------------------------------------|----------------------|
| `code` | String | required, unique, `code_1` | 8/8 | Model:3, masterDataController validation:51, seed.js:168 + findOne:250, seedLifecycle findOne kodé:37-39, CropTypeMasterPage form:t18 + validate:40 + kolom:83 + Input:121, PenanamanPage dropdown label:136 `({c.code})`, masterDataRoutes swagger:202,211,231 | Tidak — hanya key lookup (akan diganti `_id`) | **HAPUS** (Task 1). Drop index `code_1`. |
| `name` | String | required, unique, `name_1` | 8/8 | Model:6, controller validate, seed, seedLifecycle `cycle.crop_type = cropType.name`:478, PenanamanPage kolom:55 `crop_type_ref?.name`, tabel master:84 | Ya (Penanaman dropdown + kolom; Dashboard tampilkan `cycle.crop_type`) | **PERTAHANKAN** |
| `scientific_name` | String | — | 8/8 | Model:7, seed:171, CropTypeMasterPage Input:123 + kolom:86 | Tidak | **HAPUS** |
| `category` | String | — | 8/8 | Model:8, seed:169, master select:126, kolom:85 | Tidak langsung, tapi dipertahankan sebagai "Crop Type/Category" per Task 3 | **PERTAHANKAN** (menjadi satu-satunya classifier selain `name`) |
| `duration_days` | Number | — | 8/8 | Model:9, seed:172, Input:124 + kolom:87 | Tidak (tidak pernah dipakai perhitungan lifecycle/harvest/window) | **HAPUS** |
| `yield_per_ha` | Number | — | 8/8 | Model:10, seed:173, Input:125 + kolom:88 | Tidak | **HAPUS** |
| `unit` | String | — | 8/8 (semua `"Kg"`) | Model:11, seed:174, Select:129, kolom:88 | Tidak (CropCycle `expected_yield_kg` dalam Kg hardcoded) | **HAPUS** |
| `description` | String | — | 8/8 | Model:12, seed:175, textarea:133 | Tidak | **HAPUS** |
| `status` | String enum Active/Inactive | default Active | 8/8 Active | Model:13, controller list filter `?status`, getAll filter, masterDataRoutes | Ya (filter status generik; dipertahankan sebagai infra) | **PERTAHANKAN** |
| `_id,__v,timestamps` | — | — | — | Seluruh stack pakai `_id` sebagai identifier; `code` akan diganti `_id` di semua consumer | Ya | Pertahankan |

**Grep bukti tambahan:** `duration_days/scientific_name/yield_per_ha` hanya muncul di model+seed+master page+swagger — **nol** kemunculan di `lifecycleController`, `managementDashboardController`, `CropCycle`, `HarvestPeriod`, `farmerDashboard`, `government` controller/route/page.

### 4B. ActivityType — `backend/model/ActivityType.js:3-12`

| Field | Tipe | Required/Unique/Index | Seed terisi | DIPAKAI DI MANA (bukti baris) | Benar-benar dibaca Lifecycle/Dashboard? | Rekomendasi Task 6/8 |
|-------|------|-----------------------|-------------|------------------------------|------------------------------------------|----------------------|
| `code` | String | required, unique, `code_1` | 12/12 | Model:5, controller validate:57, seed:259 + findOne:370, seedLifecycle findOne:41-51, ActivityTypeMasterPage form:t18 + validate:40 + kolom:83 + Input:121, swagger:280 | Tidak — lookup akan `_id` | **HAPUS** (Task 1) |
| `name` | String | required, unique, `name_1` | 12/12 | Model:6, controller, seed, seedLifecycle `activity_type = act.type.name`:534, PerawatanPage dropdown:175, kolom:58 chips:137, master kolom:84 | Ya (Perawatan dropdown + tabel + filter) | **PERTAHANKAN** |
| `category` | String | — | 12/12 (9 varian: Pengolahan Lahan, Penanaman, Pemeliharaan, Pemupukan, Pengairan, Pengendalian Hama, Panen, Pasca Panen, Lainnya) | Model:7, seed:262, master Select:125, kolom:85, tidak dipakai filter Perawatan saat ini | Ya — akan dipangkas jadi 3 nilai tetap per Task 6; PerawatanPage akan pakai untuk cascading dropdown | **PERTAHANKAN** (migrasi ke enum 3 nilai) |
| `description` | String | — | 12/12 | Model:8, seed:263, textarea:133 | Tidak | **HAPUS** |
| `duration_hours` | Number | — | 12/12 | Model:9, seed:264, Input:123 + kolom:87 | Tidak | **HAPUS** |
| `color` | String | — | 12/12 | Model:10, seed:265, Input:124 + kolom:88 `backgroundColor` | Tidak (warna tidak pernah dipakai di Lifecycle/Dashboard) | **HAPUS** |
| `unit` | String | — | 12/12 (semua `HOK`) | Model:11, seed:266, Select:128, kolom:86 | Tidak | **HAPUS** |
| `status` | String enum | default Active | 12/12 Active | Model:12, controller list/getAll filter | Ya (infra filter) | **PERTAHANKAN** |
| `_id,__v,timestamps` | — | — | — | Identifier | Ya | Pertahankan |

**Grep:** `duration_hours/color/description` hanya di model+seed+master page+swagger; **nol** di `Activity` model, `lifecycleController`, `PerawatanPage` logic (selain `name/category`).

---

## 5. Implikasi untuk Task 1–8

- **Task 1 — Hapus `code`**: confirmed — eksekusi di keduanya. Replace: semua `findOne({code})` → `findOne({_id})` atau `name`; frontend: hapus kolom Kode, Input Kode, validasi `code` required, `({c.code})` label; seeder/seedLifecycle; swagger; `masterDataController` validation + `duplicate key code` handling; drop unique index.
- **Task 2 — Unit**: belum ada koleksi `units`; buat dari nol (`name,symbol,status`).
- **Task 3 — CropType**: keep `name,category,status`; drop 5 field + `code`.
- **Task 4 — CropVariety**: referensi `cropType: ObjectId→CropType` + `unit: ObjectId→Unit` + `grades: [{grade_name, estimated_price_per_unit}]` embedded tanpa batas.
- **Task 5 — Fertilizer/Nutrient/Medicine**: masing-masing `name,unit(ObjectId→Unit),description,status`.
- **Task 6 — ActivityType**: keep `name,category,status` + enum category baru `['Lainnya','Pemupukan - Perawatan - Penyemprotan','Panen']` (final wording konfirmasi di implementasi; konsisten dengan label Lifecycle `Persiapan Lahan/Penanaman/Perawatan/Panen`). Hapus `code,color,unit,duration_hours,description`.
- **Task 7 — Gating**: PerawatanPage baca satu field `CropCycle.status` / `HarvestPeriod` existing untuk decide tampilkan kategori `Panen`.
- **Task 8 — Scope reset**: hanya 7 koleksi (Unit, CropType, CropVariety, Fertilizer, Nutrient, Medicine, ActivityType). Farm/Block/User/Assignment/Cycle/LandRecord/Activity/HarvestPeriod/Sale/Expense tidak di-reset.

---

## 6. Verifikasi Perintah (Task 0 evidence)

```bash
node -e "findOne croptypes/activitytypes + indexes + counts" → 8/12 docs, code unique indexes ada
rg duration_days/scientific_name/yield_per_ha/duration_hours/color/unit → hanya model+seed+master page+swagger, nol di lifecycle/dashboard
read: CropTypeMasterPage.jsx:18,40,83,121 ; ActivityTypeMasterPage.jsx:18,40,83,121 ; PenanamanPage.jsx:136 ; PerawatanPage.jsx:175 ; lifecycleController.js:10-13,213
```

---

*Dokumen ini adalah deliverable Task 0. Implementasi Task 1+ tidak dimulai sebelum commit ini.*

