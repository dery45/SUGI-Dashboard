import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DashboardFilterProvider } from './contexts/DashboardFilterContext';
import MainLayout from './component/layout/MainLayout';
import { ProtectedRoute, AppRedirect, homePathFor } from './services/ProtectedRoutes.jsx';
import LoadingSkeleton from './component/common/LoadingSkeleton';
import Login from './pages/Login/Login';
import SettingsPage from './pages/Settings/SettingsPage';

// Feature pages - lazy loaded
const FarmerDashboard = lazy(() => import('./pages/FarmerDashboard/FarmerDashboard'));
const GovernmentDashboard = lazy(() => import('./pages/GovernmentDashboard/GovernmentDashboard'));
const ManagementDashboard = lazy(() => import('./pages/ManagementDashboard/ManagementDashboard'));
const LifecycleManagementPage = lazy(() => import('./pages/Lifecycle/LifecycleManagementPage'));
const UMManagementPage = lazy(() => import('./pages/UMManagement/UMManagementPage'));
const FarmerManagementPage = lazy(() => import('./pages/FarmerManagement/FarmerManagementPage'));
const SalesDistributionPage = lazy(() => import('./pages/Sales/SalesDistributionPage'));
const ChatbotInsightDashboard = lazy(() => import('./pages/ChatbotInsight/ChatbotInsightDashboard'));

// MasterData catalogs - lazy loaded
const FarmMasterPage = lazy(() => import('./pages/MasterData/Farms/FarmMasterPage'));
const BlockMasterPage = lazy(() => import('./pages/MasterData/Blocks/BlockMasterPage'));
const CropTypeMasterPage = lazy(() => import('./pages/MasterData/CropTypes/CropTypeMasterPage'));
const ActivityTypeMasterPage = lazy(() => import('./pages/MasterData/ActivityTypes/ActivityTypeMasterPage'));

// GovernmentData catalogs - lazy loaded
const KetidakcukupanNasionalPage = lazy(() => import('./pages/GovernmentData/KetidakcukupanNasional/KetidakcukupanNasionalPage'));
const KetidakcukupanProvinsiPage = lazy(() => import('./pages/GovernmentData/KetidakcukupanProvinsi/KetidakcukupanProvinsiPage'));
const KonsumsiPerJenisPage = lazy(() => import('./pages/GovernmentData/KonsumsiPerJenis/KonsumsiPerJenisPage'));
const PenyaluranDonasiPage = lazy(() => import('./pages/GovernmentData/PenyaluranDonasi/PenyaluranDonasiPage'));
const ProyeksiNeracaPage = lazy(() => import('./pages/GovernmentData/ProyeksiNeraca/ProyeksiNeracaPage'));
const GerakanPanganMurahPage = lazy(() => import('./pages/GovernmentData/GerakanPanganMurah/GerakanPanganMurahPage'));
const HargaKonsumenProvinsiPage = lazy(() => import('./pages/GovernmentData/HargaKonsumenProvinsi/HargaKonsumenProvinsiPage'));
const HargaKonsumenNasionalPage = lazy(() => import('./pages/GovernmentData/HargaKonsumenNasional/HargaKonsumenNasionalPage'));
const HargaProdusenNasionalPage = lazy(() => import('./pages/GovernmentData/HargaProdusenNasional/HargaProdusenNasionalPage'));
const HargaProdusenProvinsiPage = lazy(() => import('./pages/GovernmentData/HargaProdusenProvinsi/HargaProdusenProvinsiPage'));
const SkorPPHPage = lazy(() => import('./pages/GovernmentData/SkorPPH/SkorPPHPage'));
const PanganTerselamatkanPage = lazy(() => import('./pages/GovernmentData/PanganTerselamatkan/PanganTerselamatkanPage'));
const CadanganPanganProvinsiPage = lazy(() => import('./pages/GovernmentData/CadanganPanganProvinsi/CadanganPanganProvinsiPage'));

// Reusable Suspense fallback
const PageSkeleton = () => (
  <div className="flex flex-col gap-8 animate-fade-in pb-16">
    <div className="bg-gradient-to-br from-surface/60 via-surface/30 to-transparent backdrop-blur-xl p-8 rounded-[2.5rem] border border-border/30 shadow-lg">
      <div className="w-48 h-6 bg-border/40 rounded-full animate-pulse" />
      <div className="w-80 h-3 bg-border/20 rounded-full animate-pulse mt-2" />
    </div>
    <LoadingSkeleton variant="kpi" count={4} />
    <LoadingSkeleton variant="map" count={1} />
    <LoadingSkeleton variant="chart" count={10} />
  </div>
);

const DashboardSkeleton = () => (
  <div className="flex flex-col gap-8 animate-fade-in pb-16">
    <div className="bg-gradient-to-br from-surface/60 via-surface/30 to-transparent backdrop-blur-xl p-8 rounded-[2.5rem] border border-border/30 shadow-lg">
      <div className="w-48 h-6 bg-border/40 rounded-full animate-pulse" />
      <div className="w-80 h-3 bg-border/20 rounded-full animate-pulse mt-2" />
    </div>
    <LoadingSkeleton variant="kpi" count={4} />
    <LoadingSkeleton variant="map" count={1} />
    <LoadingSkeleton variant="chart" count={8} />
  </div>
);

const MasterDataSkeleton = () => (
  <div className="flex flex-col gap-8 animate-fade-in pb-16">
    <div className="bg-gradient-to-br from-surface/60 via-surface/30 to-transparent backdrop-blur-xl p-8 rounded-[2.5rem] border border-border/30 shadow-lg">
      <div className="w-48 h-6 bg-border/40 rounded-full animate-pulse" />
      <div className="w-80 h-3 bg-border/20 rounded-full animate-pulse mt-2" />
    </div>
    <LoadingSkeleton variant="kpi" count={4} />
    <LoadingSkeleton variant="table" count={1} />
  </div>
);

function AppContent() {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={homePathFor(user.role)} replace /> : <Login />} />
      <Route path="/" element={<AppRedirect />} />

      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="farmer" element={
          <Suspense fallback={<DashboardSkeleton />}>
            <DashboardFilterProvider><FarmerDashboard /></DashboardFilterProvider>
          </Suspense>
        } />
        <Route path="government" element={
          <ProtectedRoute roles={['superadmin', 'government']}>
            <Suspense fallback={<DashboardSkeleton />}>
              <DashboardFilterProvider><GovernmentDashboard /></DashboardFilterProvider>
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="management" element={
          <ProtectedRoute roles={['superadmin', 'farmer_owner']}>
            <Suspense fallback={<DashboardSkeleton />}>
              <ManagementDashboard />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="management/lifecycle" element={
          <ProtectedRoute roles={['superadmin', 'farmer_owner']}>
            <Suspense fallback={<DashboardSkeleton />}>
              <LifecycleManagementPage />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="management/um" element={
          <ProtectedRoute roles={['superadmin', 'farmer_owner']}>
            <Suspense fallback={<DashboardSkeleton />}>
              <UMManagementPage />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="management/farmers" element={
          <ProtectedRoute roles={['superadmin', 'farmer_owner']}>
            <Suspense fallback={<MasterDataSkeleton />}>
              <FarmerManagementPage />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="management/sales" element={
          <ProtectedRoute roles={['superadmin', 'farmer_owner']}>
            <Suspense fallback={<MasterDataSkeleton />}>
              <SalesDistributionPage />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="chatbot-insight" element={
          <ProtectedRoute roles={['superadmin', 'government']}>
            <Suspense fallback={<DashboardSkeleton />}>
              <ChatbotInsightDashboard />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="master/farms" element={
          <ProtectedRoute roles={['superadmin', 'farmer_owner']}>
            <Suspense fallback={<MasterDataSkeleton />}>
              <FarmMasterPage />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="master/blocks" element={
          <ProtectedRoute roles={['superadmin', 'farmer_owner']}>
            <Suspense fallback={<MasterDataSkeleton />}>
              <BlockMasterPage />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="master/crop-types" element={
          <ProtectedRoute roles={['superadmin', 'farmer_owner']}>
            <Suspense fallback={<MasterDataSkeleton />}>
              <CropTypeMasterPage />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="master/activity-types" element={
          <ProtectedRoute roles={['superadmin', 'farmer_owner']}>
            <Suspense fallback={<MasterDataSkeleton />}>
              <ActivityTypeMasterPage />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="data/ketidakcukupan-nasional" element={
          <ProtectedRoute roles={['superadmin', 'government']}>
            <Suspense fallback={<MasterDataSkeleton />}>
              <KetidakcukupanNasionalPage />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="data/ketidakcukupan-provinsi" element={
          <ProtectedRoute roles={['superadmin', 'government']}>
            <Suspense fallback={<MasterDataSkeleton />}>
              <KetidakcukupanProvinsiPage />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="data/konsumsi-per-jenis" element={
          <ProtectedRoute roles={['superadmin', 'government']}>
            <Suspense fallback={<MasterDataSkeleton />}>
              <KonsumsiPerJenisPage />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="data/penyaluran-donasi" element={
          <ProtectedRoute roles={['superadmin', 'government']}>
            <Suspense fallback={<MasterDataSkeleton />}>
              <PenyaluranDonasiPage />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="data/proyeksi-neraca" element={
          <ProtectedRoute roles={['superadmin', 'government']}>
            <Suspense fallback={<MasterDataSkeleton />}>
              <ProyeksiNeracaPage />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="data/gerakan-pangan-murah" element={
          <ProtectedRoute roles={['superadmin', 'government']}>
            <Suspense fallback={<MasterDataSkeleton />}>
              <GerakanPanganMurahPage />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="data/harga-konsumen-provinsi" element={
          <ProtectedRoute roles={['superadmin', 'government']}>
            <Suspense fallback={<MasterDataSkeleton />}>
              <HargaKonsumenProvinsiPage />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="data/harga-konsumen-nasional" element={
          <ProtectedRoute roles={['superadmin', 'government']}>
            <Suspense fallback={<MasterDataSkeleton />}>
              <HargaKonsumenNasionalPage />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="data/harga-produsen-nasional" element={
          <ProtectedRoute roles={['superadmin', 'government']}>
            <Suspense fallback={<MasterDataSkeleton />}>
              <HargaProdusenNasionalPage />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="data/harga-produsen-provinsi" element={
          <ProtectedRoute roles={['superadmin', 'government']}>
            <Suspense fallback={<MasterDataSkeleton />}>
              <HargaProdusenProvinsiPage />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="data/skor-pph" element={
          <ProtectedRoute roles={['superadmin', 'government']}>
            <Suspense fallback={<MasterDataSkeleton />}>
              <SkorPPHPage />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="data/pangan-terselamatkan" element={
          <ProtectedRoute roles={['superadmin', 'government']}>
            <Suspense fallback={<MasterDataSkeleton />}>
              <PanganTerselamatkanPage />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="data/cadangan-pangan-provinsi" element={
          <ProtectedRoute roles={['superadmin', 'government']}>
            <Suspense fallback={<MasterDataSkeleton />}>
              <CadanganPanganProvinsiPage />
            </Suspense>
          </ProtectedRoute>
        } />
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