import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { resolveFarmerLanding } from './farmerLanding';

// Static role→home map. For Petani this is only a *fallback* — the real landing
// is resolved asynchronously from their assignments (see FarmerRedirect).
export const homePathFor = (role) => {
  if (role === 'government') return '/government';
  if (role === 'farmer') return '/management/lifecycle/persiapan-lahan';
  return '/management';
};

export const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

export function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={homePathFor(user.role)} replace />;
  return children;
}

/**
 * Petani redirect: routes to the farmer's ACTUAL first accessible stage in
 * Persiapan Lahan → Penanaman → Perawatan → Panen order, resolved from their
 * active penugasan. Falls back to Persiapan Lahan (which renders the backend
 * guard's Indonesian no-access message) when nothing is accessible.
 */
function FarmerRedirect() {
  const { token } = useAuth();
  const [path, setPath] = useState(null);
  useEffect(() => {
    let cancelled = false;
    resolveFarmerLanding(token).then(p => { if (!cancelled) setPath(p); });
    return () => { cancelled = true; };
  }, [token]);
  if (!path) return <LoadingScreen />;
  return <Navigate to={path} replace />;
}

export function AppRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'farmer') return <FarmerRedirect />;
  return <Navigate to={homePathFor(user.role)} replace />;
}
