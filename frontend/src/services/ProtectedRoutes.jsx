import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const homePathFor = (role) => {
  if (role === 'government') return '/government';
  // Petani lands on their first lifecycle stage (Phase 4b policy change).
  // Persiapan Lahan is the entry point of every cycle, so it is the sensible
  // first-stage default; per-stage visibility is enforced by the backend guard
  // (Task 1) and the page itself renders an Indonesian no-access message when
  // the farmer's assignment does not cover this stage — no redirect loop.
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

export function AppRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return <Navigate to={user ? homePathFor(user.role) : '/login'} replace />;
}