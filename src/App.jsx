import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import ProtectedRoute from './components/layout/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import './styles/index.css';

const AuthenticatedLayout = () => {
  const { logout } = useAuth();
  return (
    <div className="dashboard-layout">
      <Sidebar onLogout={logout} />
      <NotificationCenter />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/loads" element={<LoadsPage />} />
          <Route path="/loads/:id" element={<LoadDetailsPage />} />
          <Route path="/orchestration" element={<OrchestrationPage />} />
          <Route path="/ingestion" element={<IngestionPage />} />
          <Route path="/exceptions" element={<ExceptionsPage />} />
          <Route path="/tenants" element={<Tenant />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/notifications" element={<NotificationHistoryPage />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
           <Route path="/*" element={<AuthenticatedLayout />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
