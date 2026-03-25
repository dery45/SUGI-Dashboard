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
├── frontend/          # Vite + React source code
│   ├── src/
│   │   ├── api/       # Central managementApi client
│   │   ├── components/ # Reusable UI (KPI, Alerts, Charts, Modals)
│   │   ├── hooks/      # useManagementData custom hook
│   │   ├── pages/      # Management, Lifecycle, Sales, Farmer dashboards
│   │   └── data/       # Geography and map configurations
├── backend/           # Node.js + Express API
│   ├── src/
│   │   ├── models/    # Mongoose schemas (Sale, Expense, UM, Cycle, Activity)
│   │   ├── routes/    # Modular API routes for all modules
│   │   └── services/  # KPIService with aggregation pipelines
│   └── server.js      # Main server entry point
└── README.md          # Project documentation
```

## ⚙️ Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or via Atlas)

### 2. Setup Backend
```bash
cd backend
npm install
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
