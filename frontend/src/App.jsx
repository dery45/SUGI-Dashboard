import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { FilterProvider } from './contexts/FilterContext';
import MainLayout from './components/layout/MainLayout';

import FarmerDashboard from './pages/FarmerDashboard';
import GovernmentDashboard from './pages/GovernmentDashboard';
import Login from './pages/Login';

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
