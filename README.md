# SUGIDash 🌾🏛️

**SUGIDash** (Sugi Dashboard) is a premium, high-performance Food Security Intelligence System. It provides real-time data visualization for agricultural pricing, national food security trends, and regional risk monitoring across Indonesia.

## 🚀 Key Features

- **Farmer Dashboard**: Focused on producer-level pricing (GKP), market stability, and localized data for rice farmers.
- **Government Dashboard**: High-level national security analysis, POUn trends, and regional food intervention monitoring.
- **Premium Glassmorphism UI**: A cutting-edge, minimalist "Emerald & White" aesthetic with butter-smooth transitions and high-end animations.
- **Interactive GeoJSON Maps**: Dynamic map of Indonesia with province-level data tooltips and clickable filtering.
- **Advanced Data Tables**: Robust multi-column sorting, real-time search, and pagination for large datasets.
- **Responsive & Accessible**: Optimized for both mobile and desktop with a collapsible sidebar and accessible semantic HTML.

## 🛠️ Tech Stack

### Frontend
- **React 19** (Vite-based)
- **Tailwind CSS 4.0** (with custom glassmorphism utilities)
- **Lucide React** (Modern iconography)
- **Recharts** (Interactive data visualization)
- **Leaflet & React-Leaflet** (Geographical data maps)
- **React Router 7** (Advanced routing and protected dashboard paths)

### Backend
- **Node.js** (Express)
- **Mongoose / MongoDB** (Data persistence)
- **CORS & Dotenv** (Infrastructure security and configuration)

## 📁 Project Structure

```bash
SUGI-Dashboard-DEMO/
├── frontend/          # Vite + React source code
│   ├── src/
│   │   ├── components/ # Reusable UI, Layout, Map components
│   │   ├── pages/      # Farmer, Government, and Login dashboards
│   │   ├── contexts/   # Theme and Filter state management
│   │   └── data/       # Mock datasets for food security metrics
├── backend/           # Node.js + Express API
│   ├── src/           # API routes, controllers, and models
│   └── server.js      # Main server entry point
└── README.md          # Project documentation
```

## ⚙️ Getting Started

### 1. Prerequisites
- Node.js (v18+)
- npm

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
- **Username**: `admin`
- **Password**: `password`

## 🎨 Design Philosophy
SUGIDash follows a **Minimalist Premium** approach, using a custom emerald green primary palette, high-end `cubic-bezier` easing functions, and translucent layers (`backdrop-blur`) to create a floating, "glass" user experience.

---
Built with ❤️ for Indonesian Food Security.
