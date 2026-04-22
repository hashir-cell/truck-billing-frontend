import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard/Dashboard';
import LoadsPage from './pages/Loads/LoadsPage';
import Tenant from './pages/Tenants/Tenant';
import IngestionPage from './pages/Ingestion/IngestionPage';
import ExceptionsPage from './pages/Exceptions/ExceptionsPage';
import OrchestrationPage from './pages/Orchestration/OrchestrationPage';
import LoadDetailsPage from './pages/Loads/LoadDetailsPage';
import SettingsPage from './pages/Settings/SettingsPage';
import NotificationCenter from './components/common/NotificationCenter';
import NotificationHistoryPage from './pages/Notifications/NotificationHistoryPage';

import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import LandingPage from './pages/Landing/LandingPage';
import OnboardingPage from './pages/Auth/OnboardingPage';
import ProtectedRoute from './components/layout/ProtectedRoute';
import PaymentsPage from './pages/Payments/PaymentsPage';
import DriverUploadPage from './pages/Public/DriverUploadPage';
import './styles/index.css';

const AuthenticatedLayout = () => {
  const { logout } = useAuth();
  const { selectedTenant, loading } = useApp();

  if (!loading && selectedTenant && selectedTenant.config?.branding?.onboarding_completed === false) {
    if (window.location.pathname !== '/onboarding') {
      return <Navigate to="/onboarding" replace />;
    }
  }

  return (
    <div className="dashboard-layout">
      <Sidebar onLogout={logout} />
      <NotificationCenter />
      <main className="main-content">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/loads" element={<LoadsPage />} />
          <Route path="/loads/:id" element={<LoadDetailsPage />} />
          <Route path="/orchestration" element={<OrchestrationPage />} />
          <Route path="/ingestion" element={<IngestionPage />} />
          <Route path="/exceptions" element={<ExceptionsPage />} />
          <Route path="/tenants" element={<Tenant />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/notifications" element={<NotificationHistoryPage />} />

          <Route path="/payments" element={<PaymentsPage />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/driver-upload/:token" element={<DriverUploadPage />} />
        <Route element={<ProtectedRoute />}>
           <Route path="/onboarding" element={<OnboardingPage />} />
           <Route path="/*" element={<AuthenticatedLayout />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
