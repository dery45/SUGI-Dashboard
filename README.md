# SUGIDash 🌾🏛️

**SUGIDash** is a premium, high-performance **End-to-End Agricultural Management & Food Security Intelligence System**. It provides real-time data visualization for agricultural pricing, national food security trends, complete farm lifecycle management, and AI-powered market intelligence across Indonesia.

## 🚀 Key Features

### Authentication & Role-Based Access
- JWT-based authentication with bcrypt password hashing
- Four roles: `superadmin`, `government`, `farmer_owner`, `farmer`
- Role-based route guarding and sidebar visibility

### Farmer Dashboard (Market Intelligence)
- **10 AI-Powered Insights**: Skor PPH Nasional, Cadangan Pangan Daerah, Komoditas Terbaik, Margin Produsen–Konsumen, Surplus/Defisit Pangan, Peringkat Surplus Komoditas, Peluang Pasar Bulanan, Provinsi Terbaik, Rekomendasi Tanam, Rekomendasi Jual
- **Commodity Price Analytics**: Producer & consumer price trends, commodity rankings, margin analysis
- **Interactive Indonesia Map**: Province-level price, margin, and opportunity heatmaps
- **Food Supply-Demand Tracking**: National and per-commodity balance sheets
- **Regional Food Reserve Monitoring**: Province-level CPPD data
- **Drill-down Modals**: Click any chart for full-size detail view

### Government Dashboard (National Food Security)
- **Policy Recommendation Engine**: AI-generated strategic policy recommendations
- **KPI Cards**: National food balance, PPH score, GPM activities, regional reserves
- **PoU (Prevalence of Undernourishment) Tracking**: National and province-level trends
- **Interactive Maps**: PoU, consumer/producer prices, food reserves, GPM distribution
- **Projection & Intervention**: Rice balance projections, donation tracking, food rescue monitoring
- **Provincial Rankings**: CPPD, PoU, and GPM performance rankings

### Management Dashboard (Company/Leader)
- **KPI Analytics**: Total Yield (Tons), ROI (%), Cost per Kg, Average Price
- **Yield Trends**: Comparative month-by-month analysis across Company, Groups, and Independent actors
- **Alert System**: Automated tracking of closing harvest windows and unassigned tasks

### Agricultural Lifecycle Management
- **Land Preparation**: Full CRUD for land opening/closing with cost tracking
- **Planting Log**: Crop variety, density (seeds/ha), area coverage
- **Maintenance Tracking**: Fertilization, spraying, pruning with labor hour and cost aggregation
- **Harvest Management**: Open/Close harvest windows with expected vs. actual yield comparison and overdue alerts

### Farmer & User Management
- Role-based Access Control (RBAC) with 4 roles
- Organization-specific user filtering, search, and deactivation
- Farmer-to-Block assignment system (Unit Management)

### Sales & Distribution
- Record sales to Mills, Middlemen, or Direct markets
- Expense tracking with auto-computed revenue and invoice reference tracking

### Master Data Management (15 Datasets)
Full CRUD pages for all national food security datasets:

| Dataset | Model |
|---------|-------|
| Ketidakcukupan Konsumsi Pangan (Nasional) | `ketidakcukupan-nasional` |
| Ketidakcukupan Konsumsi Pangan (Provinsi) | `ketidakcukupan-provinsi` |
| Konsumsi Pangan per Jenis | `konsumsi-per-jenis` |
| Penyaluran Donasi Pangan | `penyaluran-donasi` |
| Proyeksi Neraca Pangan | `proyeksi-neraca` |
| Gerakan Pangan Murah | `gerakan-pangan-murah` |
| Harga Konsumen (Provinsi) | `harga-konsumen-provinsi` |
| Harga Konsumen (Nasional) | `harga-konsumen-nasional` |
| Harga Produsen (Nasional) | `harga-produsen-nasional` |
| Harga Produsen (Provinsi) | `harga-produsen-provinsi` |
| Skor Pola Pangan Harapan (PPH) | `skor-pph` |
| Pangan Terselamatkan (Food Rescue) | `pangan-terselamatkan` |
| Cadangan Pangan Provinsi | `cadangan-pangan-provinsi` |
| Variasi Harga Produsen | `variasi-harga-produsen` |

### Bulk Data Import
- **Upsert-based import** via `POST /api/bulk-import/:modelName` for all 14 food security datasets
- Auto-detects unique keys per model for safe re-import
- Accepts JSON arrays directly in request body

### Insight Generation System
- **Farmer Insights**: 10 generated market intelligence items stored in `farmerinsights` collection
- **Government Insights**: Policy recommendations stored in `governmentinsights` collection
- **Versioned**: Each insight tracks version history and generation timestamp
- **Rich Metadata**: Numerical values, commodity names, province names attached to each insight

### UI/UX Features
- **Premium Glassmorphism UI**: Emerald & White aesthetic with smooth cubic-bezier transitions
- **Dark/Light Theme**: Full theme toggle with system preference detection
- **Responsive Design**: Mobile-first with bottom navigation for small screens
- **Interactive Charts**: Recharts-based (Line, Bar, Pie) with click-to-expand detail modals
- **Indonesia Map**: Province-level interactive choropleth with drill-down
- **Data Export**: CSV/Excel export for all chart and table data
- **In-Memory Caching**: 5-minute TTL cache for filter options (saves 24 `distinct()` queries per page load)
- **Response Compression**: Gzip/brotli compression on all API responses
- **Advanced DataTable**: Page size selector (5/10/20/50), first/last navigation, total entry count, smart page numbering
- **Error Boundary**: Graceful per-component error handling with retry
- **Loading Skeletons**: Animated placeholder during data fetch
- **Empty States**: Contextual messages when no data is available for current filters

## 🖼️ User Interface Preview

### 🔑 1. Authentication & Login Portal
A secure, role-based login interface providing distinct entry points for Farmers, Government, and Management roles.

![Login](image/login.png)

---

### 🌾 2. Farmer Dashboard
Empowering local agriculturalists with real-time market intelligence, commodity analytics, and interactive maps.

![Farmer Dashboard](image/farmer-dashboard.png)

---

### 🏛️ 3. Government & Security Dashboard
A macro-level dashboard tracking national food security indexes, regional pricing, and harvest projections.

![Government Dashboard](image/goverment-dashboard.png)

---

### 🔄 4. Agricultural Lifecycle Management
An end-to-end tracking tool covering land preparation, planting schedules, maintenance logging, and harvest optimization.

![Lifecycle Management](image/lifecycle-management.png)

## 🛠️ Tech Stack

### Frontend
- **React 19** (Vite 8, JSX-based)
- **Tailwind CSS 4** (with custom glassmorphism utilities)
- **Recharts 3** (Advanced business & yield analytics — Line, Bar, Pie charts)
- **Lucide React** (Modern iconography)
- **Leaflet & React-Leaflet** (Interactive Indonesia province map)
- **React Router 7** (Protected dashboard paths)
- **SheetJS (xlsx)** (Client-side CSV/Excel export)

### Backend
- **Node.js / Express 5** (REST API)
- **MongoDB / Mongoose 9** (Complex aggregation pipelines for real-time KPI computation)
- **JWT / bcryptjs** (Stateless authentication with password hashing)
- **RBAC Middleware** (Role-based security across all routes)
- **compression** (Gzip/brotli response compression)
- **Custom In-Memory Cache** (TTL-based filter options caching)

### Notables
- Komoditas name normalization for margin calculation (`normMarginKomoditas` strips `(Rp/Kg)`, `Tk. Petani`, `Tingkat...` suffixes for cross-collection matching)
- Dynamic year filter defaults to `'all'` (shows all available years on first load)
- Year dropdown populated dynamically from API (sorted descending, most recent first)

## 📁 Project Structure

```bash
SUGI-Dashboard-DEMO/
├── backend/                          # Node.js + Express REST API
│   ├── src/
│   │   ├── controllers/              # 26 request handlers (auth, dashboards, CRUD, insights)
│   │   ├── middlewares/              # Custom Express middlewares (RBAC, Auth)
│   │   ├── models/                   # 35+ Mongoose schemas (master data, lifecycle, insights)
│   │   ├── routes/                   # 31 modular API endpoint files
│   │   ├── scripts/                  # Seed, reset, and maintenance scripts
│   │   ├── services/                 # Business logic & complex aggregations (kpiService)
│   │   └── utils/                    # Helper functions (cache, validation)
│   ├── .env                          # Environment variables
│   ├── server.js                     # Entry point (Express + MongoDB + static serving)
│   └── package.json
├── frontend/                         # Vite + React 19 SPA
│   ├── public/                       # Static assets (GeoJSON maps, icons)
│   ├── src/
│   │   ├── api/                      # 6 API client modules
│   │   ├── assets/                   # Images, fonts, brand assets
│   │   ├── components/
│   │   │   ├── charts/               # Recharts wrappers (BarChart, LineChart, PieChart)
│   │   │   ├── common/               # Shared UI (Card, DataTable, Modal, ErrorBoundary)
│   │   │   ├── dashboard/            # 15 dashboard-specific components (KpiCard, ChartCard)
│   │   │   ├── layout/               # Sidebar, TopBar, MainLayout, BottomNav
│   │   │   ├── management/           # 12 management module components
│   │   │   └── map/                  # IndonesiaMap (Leaflet)
│   │   ├── contexts/                 # 4 React Contexts (Auth, Theme, Filter, DashboardFilter)
│   │   ├── hooks/                    # 3 custom hooks
│   │   ├── pages/                    # 26 page views
│   │   │   └── master/               # 17 master data CRUD pages
│   │   ├── App.jsx                   # Root component with routing
│   │   └── main.jsx                  # React DOM entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── docs/                             # Phase implementation documents
├── image/                            # Screenshot images for README
├── testing/                          # Playwright automated tests
└── README.md
```

## ⚙️ Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (local, Atlas, or Docker)

### 2. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/sugi-dashboard-demo
JWT_SECRET=supersecret
file_path="../../client/public/"
```

Seed default data (users, crop types, activity types):
```bash
npm run seed
```

Reset database and re-seed:
```bash
npm run reset
```

Start the server:
```bash
npm start     # Production — http://localhost:3000
npm run dev   # Development with nodemon hot-reload
```

### 3. Import Food Security Data
Price, projection, and consumption data is **not seeded** by default. Use the bulk import API:

```bash
# Import from a JSON file (example: HargaProdusenNasional)
curl -X POST http://localhost:3000/api/bulk-import/HargaProdusenNasional \
  -H "Content-Type: application/json" \
  -d '[{"komoditas":"Beras","tahun":"2025","bulan":"Januari","harga":12000}]'
```

Supported model names: `HargaProdusenNasional`, `HargaKonsumenNasional`, `HargaProdusenProvinsi`, `HargaKonsumenProvinsi`, `ProyeksiNeraca`, `KetidakcukupanNasional`, `KetidakcukupanProvinsi`, `KonsumsiPerJenis`, `PenyaluranDonasi`, `GerakanPanganMurah`, `SkorPPH`, `PanganTerselamatkan`, `CadanganPanganProvinsi`, `VariasiHargaProdusen`.

Data sources: [SatuHarga Kemendag](https://satuharga.kemendag.go.id/), [PIKOB BPS](https://www.bps.go.id/), or your own aggregation pipeline.

### 4. Setup Frontend
```bash
cd frontend
npm install
npm run dev   # Dev server — http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://localhost:3000`.

### 5. Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `superadmin@sugi.id` | `superadmin123` |
| Government | `government@sugi.id` | `government123` |
| Farmer Owner | `owner@sugi.id` | `owner123` |

### 6. Key API Endpoints

**Authentication:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with email & password, returns JWT |
| GET | `/api/auth/me` | Get current user profile |

**Dashboards:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/farmer/v2` | Farmer dashboard (KPIs, prices, trends, maps, tables) |
| GET | `/api/dashboard/govt` | Government dashboard (KPIs, PoU, PPH, charts, rankings) |
| GET | `/api/insights/farmer` | Market Intelligence insights (10 items) |
| GET | `/api/insights?source=policy_recommendation` | Policy recommendation |

**Filters & Metadata:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/filters` | Distinct years, months, commodities, provinces (cached 5 min) |

**Bulk Import:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bulk-import/:modelName` | Upsert array of records for any dataset |

**Master Data CRUD (each dataset follows the same pattern):**
| Method | Endpoint Example | Description |
|--------|-----------------|-------------|
| GET | `/api/master/harga-produsen-nasional` | List records |
| POST | `/api/master/harga-produsen-nasional` | Create record |
| PUT | `/api/master/harga-produsen-nasional/:id` | Update record |
| DELETE | `/api/master/harga-produsen-nasional/:id` | Delete record |

**30+ additional RESTful endpoints** for lifecycle management, sales, expenses, assignments, farmers, settings, and Unit Management.

### 7. Frontend Routes

| Path | Page | Roles |
|------|------|-------|
| `/login` | Login | Public |
| `/farmer` | Farmer Dashboard | All authenticated |
| `/government` | Government Dashboard | superadmin, government |
| `/management` | Management Dashboard | superadmin, farmer_owner |
| `/management/lifecycle` | Lifecycle Management | superadmin, farmer_owner |
| `/management/um` | Unit Management | superadmin, farmer_owner |
| `/management/farmers` | Farmer Management | superadmin, farmer_owner |
| `/management/sales` | Sales & Distribution | superadmin, farmer_owner |
| `/settings` | Settings | All authenticated |
| `/master/farms` | Farm Master Data | superadmin, farmer_owner |
| `/master/blocks` | Block Master Data | superadmin, farmer_owner |
| `/master/crop-types` | Crop Type Master | superadmin, farmer_owner |
| `/master/activity-types` | Activity Type Master | superadmin, farmer_owner |
| `/data/*` | 15 Food Security Datasets | superadmin, government |

## 🧠 Architectural Notes

- **Margin calculation** normalizes producer commodity names (strips `(Rp/Kg)`, `Tk. Petani`, `Tingkat...` suffixes) before matching against consumer names, since the two collections use different naming conventions.
- **Year filter defaults to `'all'`** to ensure first-time users see all available data regardless of which years are populated.
- **Filter options are cached in-memory** (300s TTL), reducing 24 concurrent `distinct()` queries to a single cache lookup per page load.
- **All API responses are compressed** via Express compression middleware.
- **Dashboard queries use MongoDB aggregation pipelines** with `Promise.all` for parallel execution — each dashboard request runs 10-15 aggregations concurrently.
- **Government dashboard** was restored to its original data shape after a refactor; it now runs all table queries in parallel while preserving the original response contract.

---

Built with ❤️ for Indonesian Agricultural Excellence.
