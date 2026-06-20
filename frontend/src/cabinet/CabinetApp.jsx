import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { I18nProvider } from '@/cabinet/i18n';
import { AuthProvider, useAuth } from '@/cabinet/context/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import AppShell from '@/cabinet/components/layout/AppShell';

import LoginPage from '@/cabinet/pages/LoginPage';
import RegisterWizard from '@/cabinet/pages/RegisterWizard';
import AuthCallback from '@/cabinet/pages/AuthCallback';
import DashboardPage from '@/cabinet/pages/DashboardPage';
import SubscriptionPage from '@/cabinet/pages/SubscriptionPage';
import CataloguePage from '@/cabinet/pages/CataloguePage';
import OffersPage from '@/cabinet/pages/OffersPage';
import PetsPage from '@/cabinet/pages/PetsPage';
import AddressesPage from '@/cabinet/pages/AddressesPage';
import OrdersPage from '@/cabinet/pages/OrdersPage';
import ProfilePage from '@/cabinet/pages/ProfilePage';
import NotificationsPage from '@/cabinet/pages/NotificationsPage';

import '@/cabinet/cabinet.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-muted-foreground">Loading…</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/cabinet/login" replace />;
  return children;
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/cabinet/dashboard" replace />;
  return children;
}

function CabinetRoutes() {
  const location = useLocation();
  // Allow returning Google OAuth (session_id in URL fragment) to short-circuit
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }
  return (
    <Routes>
      <Route path="login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="register" element={<PublicOnlyRoute><RegisterWizard /></PublicOnlyRoute>} />

      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route index element={<Navigate to="/cabinet/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="subscription" element={<SubscriptionPage />} />
        <Route path="subscriptions" element={<SubscriptionPage />} />
        <Route path="catalogue" element={<CataloguePage />} />
        <Route path="offers" element={<OffersPage />} />
        <Route path="pets" element={<PetsPage />} />
        <Route path="addresses" element={<AddressesPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/cabinet/dashboard" replace />} />
    </Routes>
  );
}

export default function CabinetApp() {
  return (
    <I18nProvider>
      <AuthProvider>
        <CabinetRoutes />
        <Toaster position="top-center" richColors closeButton />
      </AuthProvider>
    </I18nProvider>
  );
}
