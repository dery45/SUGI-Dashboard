import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DashboardFilterProvider } from './contexts/DashboardFilterContext';
import MainLayout from './component/layout/MainLayout';
import { ProtectedRoute, AppRedirect, homePathFor } from './services/ProtectedRoutes.jsx';

import FarmerDashboard from './pages/FarmerDashboard/FarmerDashboard';
import GovernmentDashboard from './pages/GovernmentDashboard/GovernmentDashboard';
import ManagementDashboard from './pages/ManagementDashboard/ManagementDashboard';
import LifecycleManagementPage from './pages/Lifecycle/LifecycleManagementPage';
import UMManagementPage from './pages/UMManagement/UMManagementPage';
import FarmerManagementPage from './pages/FarmerManagement/FarmerManagementPage';
import SalesDistributionPage from './pages/Sales/SalesDistributionPage';
import SettingsPage from './pages/SettingsPage';
import ChatbotInsightDashboard from './pages/ChatbotInsightDashboard';
import Login from './pages/Login/Login';

import FarmMasterPage from './pages/master/FarmMasterPage';
import BlockMasterPage from './pages/master/BlockMasterPage';
import CropTypeMasterPage from './pages/master/CropTypeMasterPage';
import ActivityTypeMasterPage from './pages/master/ActivityTypeMasterPage';

import KetidakcukupanNasionalPage from './pages/master/KetidakcukupanNasionalPage';
import KetidakcukupanProvinsiPage from './pages/master/KetidakcukupanProvinsiPage';
import KonsumsiPerJenisPage from './pages/master/KonsumsiPerJenisPage';
import PenyaluranDonasiPage from './pages/master/PenyaluranDonasiPage';
import ProyeksiNeracaPage from './pages/master/ProyeksiNeracaPage';
import GerakanPanganMurahPage from './pages/master/GerakanPanganMurahPage';
import HargaKonsumenProvinsiPage from './pages/master/HargaKonsumenProvinsiPage';
import HargaKonsumenNasionalPage from './pages/master/HargaKonsumenNasionalPage';
import HargaProdusenNasionalPage from './pages/master/HargaProdusenNasionalPage';
import HargaProdusenProvinsiPage from './pages/master/HargaProdusenProvinsiPage';
import SkorPPHPage from './pages/master/SkorPPHPage';
import PanganTerselamatkanPage from './pages/master/PanganTerselamatkanPage';
import CadanganPanganProvinsiPage from './pages/master/CadanganPanganProvinsiPage';

function AppContent() {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={homePathFor(user.role)} replace /> : <Login />} />
      <Route path="/" element={<AppRedirect />} />

      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="farmer" element={<DashboardFilterProvider><FarmerDashboard /></DashboardFilterProvider>} />
        <Route path="government" element={<ProtectedRoute roles={['superadmin', 'government']}><DashboardFilterProvider><GovernmentDashboard /></DashboardFilterProvider></ProtectedRoute>} />
        <Route path="management" element={<ProtectedRoute roles={['superadmin', 'farmer_owner']}><ManagementDashboard /></ProtectedRoute>} />
        <Route path="management/lifecycle" element={<ProtectedRoute roles={['superadmin', 'farmer_owner']}><LifecycleManagementPage /></ProtectedRoute>} />
        <Route path="management/um" element={<ProtectedRoute roles={['superadmin', 'farmer_owner']}><UMManagementPage /></ProtectedRoute>} />
        <Route path="management/farmers" element={<ProtectedRoute roles={['superadmin', 'farmer_owner']}><FarmerManagementPage /></ProtectedRoute>} />
        <Route path="management/sales" element={<ProtectedRoute roles={['superadmin', 'farmer_owner']}><SalesDistributionPage /></ProtectedRoute>} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="chatbot-insight" element={<ProtectedRoute roles={['superadmin', 'government']}><ChatbotInsightDashboard /></ProtectedRoute>} />
        <Route path="master/farms" element={<ProtectedRoute roles={['superadmin', 'farmer_owner']}><FarmMasterPage /></ProtectedRoute>} />
        <Route path="master/blocks" element={<ProtectedRoute roles={['superadmin', 'farmer_owner']}><BlockMasterPage /></ProtectedRoute>} />
        <Route path="master/crop-types" element={<ProtectedRoute roles={['superadmin', 'farmer_owner']}><CropTypeMasterPage /></ProtectedRoute>} />
        <Route path="master/activity-types" element={<ProtectedRoute roles={['superadmin', 'farmer_owner']}><ActivityTypeMasterPage /></ProtectedRoute>} />
        <Route path="data/ketidakcukupan-nasional" element={<ProtectedRoute roles={['superadmin', 'government']}><KetidakcukupanNasionalPage /></ProtectedRoute>} />
        <Route path="data/ketidakcukupan-provinsi" element={<ProtectedRoute roles={['superadmin', 'government']}><KetidakcukupanProvinsiPage /></ProtectedRoute>} />
        <Route path="data/konsumsi-per-jenis" element={<ProtectedRoute roles={['superadmin', 'government']}><KonsumsiPerJenisPage /></ProtectedRoute>} />
        <Route path="data/penyaluran-donasi" element={<ProtectedRoute roles={['superadmin', 'government']}><PenyaluranDonasiPage /></ProtectedRoute>} />
        <Route path="data/proyeksi-neraca" element={<ProtectedRoute roles={['superadmin', 'government']}><ProyeksiNeracaPage /></ProtectedRoute>} />
        <Route path="data/gerakan-pangan-murah" element={<ProtectedRoute roles={['superadmin', 'government']}><GerakanPanganMurahPage /></ProtectedRoute>} />
        <Route path="data/harga-konsumen-provinsi" element={<ProtectedRoute roles={['superadmin', 'government']}><HargaKonsumenProvinsiPage /></ProtectedRoute>} />
        <Route path="data/harga-konsumen-nasional" element={<ProtectedRoute roles={['superadmin', 'government']}><HargaKonsumenNasionalPage /></ProtectedRoute>} />
        <Route path="data/harga-produsen-nasional" element={<ProtectedRoute roles={['superadmin', 'government']}><HargaProdusenNasionalPage /></ProtectedRoute>} />
        <Route path="data/harga-produsen-provinsi" element={<ProtectedRoute roles={['superadmin', 'government']}><HargaProdusenProvinsiPage /></ProtectedRoute>} />
        <Route path="data/skor-pph" element={<ProtectedRoute roles={['superadmin', 'government']}><SkorPPHPage /></ProtectedRoute>} />
        <Route path="data/pangan-terselamatkan" element={<ProtectedRoute roles={['superadmin', 'government']}><PanganTerselamatkanPage /></ProtectedRoute>} />
        <Route path="data/cadangan-pangan-provinsi" element={<ProtectedRoute roles={['superadmin', 'government']}><CadanganPanganProvinsiPage /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
