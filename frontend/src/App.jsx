import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { FilterProvider } from './contexts/FilterContext';
import MainLayout from './components/layout/MainLayout';

import FarmerDashboard from './pages/FarmerDashboard';
import GovernmentDashboard from './pages/GovernmentDashboard';
import ManagementDashboard from './pages/ManagementDashboard';
import LifecycleManagementPage from './pages/LifecycleManagementPage';
import UMManagementPage from './pages/UMManagementPage';
import FarmerManagementPage from './pages/FarmerManagementPage';
import SalesDistributionPage from './pages/SalesDistributionPage';
import Login from './pages/Login';
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
import VariasiHargaProdusenPage from './pages/master/VariasiHargaProdusenPage';
import SkorPPHPage from './pages/master/SkorPPHPage';
import PanganTerselamatkanPage from './pages/master/PanganTerselamatkanPage';
import CadanganPanganProvinsiPage from './pages/master/CadanganPanganProvinsiPage';
function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  );

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  };

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/farmer" replace /> : <Login onLogin={handleLogin} />
      } />
      
      <Route path="/" element={<Navigate to={isAuthenticated ? "/farmer" : "/login"} replace />} />
      
      <Route element={
        <ProtectedRoute>
          <MainLayout onLogout={handleLogout} />
        </ProtectedRoute>
      }>
        <Route path="farmer" element={<FarmerDashboard />} />
        <Route path="government" element={<GovernmentDashboard />} />
        <Route path="management" element={<ManagementDashboard />} />
        <Route path="management/lifecycle" element={<LifecycleManagementPage />} />
        <Route path="management/um" element={<UMManagementPage />} />
        <Route path="management/farmers" element={<FarmerManagementPage />} />
        <Route path="management/sales" element={<SalesDistributionPage />} />
        <Route path="data/ketidakcukupan-nasional" element={<KetidakcukupanNasionalPage />} />
        <Route path="data/ketidakcukupan-provinsi" element={<KetidakcukupanProvinsiPage />} />
        <Route path="data/konsumsi-per-jenis" element={<KonsumsiPerJenisPage />} />
        <Route path="data/penyaluran-donasi" element={<PenyaluranDonasiPage />} />
        <Route path="data/proyeksi-neraca" element={<ProyeksiNeracaPage />} />
        <Route path="data/gerakan-pangan-murah" element={<GerakanPanganMurahPage />} />
        <Route path="data/harga-konsumen-provinsi" element={<HargaKonsumenProvinsiPage />} />
        <Route path="data/harga-konsumen-nasional" element={<HargaKonsumenNasionalPage />} />
        <Route path="data/harga-produsen-nasional" element={<HargaProdusenNasionalPage />} />
        <Route path="data/harga-produsen-provinsi" element={<HargaProdusenProvinsiPage />} />
        <Route path="data/variasi-harga-produsen" element={<VariasiHargaProdusenPage />} />
        <Route path="data/skor-pph" element={<SkorPPHPage />} />
        <Route path="data/pangan-terselamatkan" element={<PanganTerselamatkanPage />} />
        <Route path="data/cadangan-pangan-provinsi" element={<CadanganPanganProvinsiPage />} />
      </Route>
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/farmer" : "/login"} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <FilterProvider>
        <Router>
          <AppContent />
        </Router>
      </FilterProvider>
    </ThemeProvider>
  );
}

export default App;
