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

## 📁 Project Structure

```bash
SUGI-Dashboard-DEMO/
├── backend/                      # Node.js + Express API
│   ├── src/
│   │   ├── config/               # Database and environment configurations
│   │   ├── controllers/          # 26 request handlers (auth, dashboards, CRUD, insights)
│   │   ├── middlewares/          # Custom Express middlewares (RBAC, Auth)
│   │   ├── models/               # 35+ Mongoose schemas (master data, lifecycle, insights)
│   │   ├── routes/               # 31 modular API endpoint files
│   │   ├── scripts/              # Seed, reset, and maintenance scripts
│   │   ├── services/             # Business logic & complex aggregations (kpiService)
│   │   └── utils/                # Helper functions
│   ├── .env                      # Environment variables
│   ├── server.js                 # Main entry point (Express + MongoDB + static serving)
│   └── package.json
├── frontend/                     # Vite + React 19
│   ├── public/                   # Static assets (GeoJSON maps, icons)
│   ├── src/
│   │   ├── api/                  # 6 API client modules (dashboard, filter, insight, management)
│   │   ├── assets/               # Images, fonts, brand assets
│   │   ├── components/
│   │   │   ├── charts/           # Recharts wrappers (BarChart, LineChart, PieChart)
│   │   │   ├── common/           # Shared UI (Card, DataTable, Modal, ErrorBoundary, etc.)
│   │   │   ├── dashboard/        # 15 dashboard-specific components (KpiCard, ChartCard, etc.)
│   │   │   ├── layout/           # Sidebar, TopBar, MainLayout, BottomNav
│   │   │   ├── management/       # 12 management module components
│   │   │   └── map/              # IndonesiaMap (Leaflet)
│   │   ├── contexts/             # 4 React Contexts (Auth, Theme, Filter, DashboardFilter)
│   │   ├── hooks/                # 3 custom hooks (useMasterData, useManagementData, useGenericResource)
│   │   ├── pages/                # 26 page views (dashboards, management, 15 master data CRUD)
│   │   │   └── master/           # 17 master data CRUD pages
│   │   ├── styles/               # Global CSS and Tailwind theme extensions
│   │   ├── App.jsx               # Root component with routing
│   │   └── main.jsx              # React DOM entry point
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## ⚙️ Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (running locally or via Atlas)

### 2. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/sugi-dashboard-demo
JWT_SECRET=supersecret
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
npm start     # Production — http://localhost:5000
npm run dev   # Development with nodemon hot-reload
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev   # Dev server — http://localhost:5173
```

### 4. Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `superadmin@sugi.id` | `superadmin123` |
| Government | `government@sugi.id` | `government123` |
| Farmer Owner | `owner@sugi.id` | `owner123` |

### 5. Key API Endpoints

**Authentication:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with email & password, returns JWT |
| GET | `/api/auth/me` | Get current user profile |

**Dashboards:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/farmer/v2` | Farmer dashboard (prices, trends, maps, tables) |
| GET | `/api/dashboard/govt` | Government dashboard (KPIs, charts, rankings) |
| GET | `/api/insights/farmer` | Market Intelligence insights (10 items) |
| GET | `/api/insights?source=policy_recommendation` | Policy recommendation |
| GET | `/api/dashboard/management` | Management KPIs and analytics |

**Master Data CRUD (each follows same pattern):**
| Method | Endpoint Example | Description |
|--------|-----------------|-------------|
| GET | `/api/master/harga-produsen-nasional` | List records |
| POST | `/api/master/harga-produsen-nasional` | Create record |
| PUT | `/api/master/harga-produsen-nasional/:id` | Update record |
| DELETE | `/api/master/harga-produsen-nasional/:id` | Delete record |

**30+ RESTful endpoints** for lifecycle, sales, expenses, assignments, farmers, settings, filters, and bulk import.

### 6. Frontend Routes

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

---

Built with ❤️ for Indonesian Agricultural Excellence.
