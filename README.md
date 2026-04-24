# SUGIDash 🌾🏛️

**SUGIDash** (Sugi Dashboard) is a premium, high-performance **End-to-End Agricultural Management & Intelligence System**. It provides real-time data visualization for agricultural pricing, national food security trends, and complete farm lifecycle management across Indonesia.

## 🚀 Key Features

- **Management Dashboard (Company/Leader)**:
  - **KPI Analytics**: Real-time business metrics like Total Yield (Tons), ROI (%), Cost per Kg, and Average Price.
  - **Yield Trends**: Comparative month-by-month analysis of yields for Company, Groups, and Independent actors using **Recharts**.
  - **Alert & Notification System**: Automated tracking of closing harvest windows and unassigned tasks.
- **Agricultural Lifecycle Management**:
  - **Land Preparation**: Full CRUD for land opening/closing with cost tracking.
  - **Planting Log**: Track crop variety, density (seeds/ha), and area coverage.
  - **Maintenance tracking**: Detailed log for fertilization, spraying, and pruning with labor hour and cost aggregation.
  - **Harvest Management**: Open/Close harvest windows with expected vs. actual yield comparison and overdue alerts.
- **Farmer & User Management**:
  - Role-based Access Control (RBAC): Farmer, UM (Unit Manager), Group Admin, and Company Admin.
  - Organization-specific user filtering and bulk management.
- **Sales & Distribution**:
  - Record sales to Mills, Middlemen, or Direct markets.
  - Auto-computed revenue and invoice reference tracking.
- **Farmer & Government Dashboards**: Detailed pricing (GKP) visualization and national food security monitoring.
- **Premium Glassmorphism UI**: A cutting-edge, minimalist "Emerald & White" aesthetic with butter-smooth transitions (`cubic-bezier` easing) and high-end animations.

## 🛠️ Tech Stack

### Frontend
- **React 19** (Vite-based)
- **Tailwind CSS 4.0** (with custom glassmorphism utilities)
- **Recharts** (Advanced business & yield analytics)
- **Lucide React** (Modern iconography)
- **Leaflet & React-Leaflet** (Geographical data maps)
- **React Router 7** (Protected dashboard paths)

### Backend
- **Node.js** (Express)
- **MongoDB / Mongoose** (Complex aggregation pipelines for real-time KPI computation)
- **RBAC Middleware** (Role-based security across all routes)

## 📁 Project Structure

```bash
SUGI-Dashboard-DEMO/
├── backend/                # Node.js + Express API
│   ├── src/
│   │   ├── config/         # Database and environment configurations
│   │   ├── controllers/    # Request handlers (logic for specific routes)
│   │   ├── middlewares/    # Custom Express middlewares (RBAC, Auth)
│   │   ├── models/         # Mongoose schemas (Sale, Expense, UM, Cycle, Activity, etc.)
│   │   ├── routes/         # Modular API endpoints (lifecycle, sales, um, etc.)
│   │   ├── scripts/        # Utility and maintenance scripts
│   │   ├── services/       # Business logic & complex aggregations (kpiService)
│   │   └── utils/          # Helper functions
│   ├── .env                # Environment variables (Mongo URI, Port)
│   ├── server.js           # Main server entry point
│   └── package.json        # Backend dependencies and scripts
├── frontend/               # Vite + React source code
│   ├── public/             # Static assets (GeoJSON maps, public icons)
│   ├── src/
│   │   ├── api/            # Central managementApi client for backend communication
│   │   ├── assets/         # Images, fonts, and brand assets
│   │   ├── components/     # Reusable UI components
│   │   │   ├── charts/     # Recharts implementations
│   │   │   ├── common/     # Shared UI elements (Buttons, Inputs)
│   │   │   ├── layout/     # Page structural components (Sidebar, Navbar)
│   │   │   ├── management/ # Module-specific components
│   │   │   └── map/        # Leaflet map implementations
│   │   ├── contexts/       # React Context API for global state
│   │   ├── data/           # Reference data, types, and constants
│   │   ├── hooks/          # Custom React hooks (useManagementData)
│   │   ├── pages/          # Main dashboard views (Farmer, Gov, Management)
│   │   ├── styles/         # Global CSS and Tailwind theme extensions
│   │   ├── utils/          # Frontend helper functions and formatters
│   │   ├── App.jsx         # Main application component & routing
│   │   └── main.jsx        # React DOM entry point
│   ├── vite.config.js      # Vite configuration
│   └── package.json        # Frontend dependencies and scripts
└── README.md               # Main project documentation
```

## ⚙️ Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or via Atlas)

### 2. Setup Backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory with the following content:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/pangan_dashboard
JWT_SECRET=supersecret
```
Then start the server:
```bash
npm start # Server runs on http://localhost:5000
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev # App runs on http://localhost:5173
```

### 4. Credentials
- **Default Role**: `Company_Admin`
- **Username**: `admin`
- **Password**: `password`

---
Built with ❤️ for Indonesian Agricultural Excellence.
