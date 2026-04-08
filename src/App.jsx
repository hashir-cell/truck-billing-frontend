import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard/Dashboard';
import LoadsPage from './pages/Loads/LoadsPage';
import Tenant from './pages/Tenants/Tenant';
import IngestionPage from './pages/Ingestion/IngestionPage';
import ExceptionsPage from './pages/Exceptions/ExceptionsPage';
import OrchestrationPage from './pages/Orchestration/OrchestrationPage';
import LoadDetailsPage from './pages/Loads/LoadDetailsPage';
import './styles/index.css';


function App() {
  return (
    <Router>
      <div className="dashboard-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/loads" element={<LoadsPage />} />
            <Route path="/loads/:id" element={<LoadDetailsPage />} />
            <Route path="/orchestration" element={<OrchestrationPage />} />
            <Route path="/ingestion" element={<IngestionPage />} />
            <Route path="/exceptions" element={<ExceptionsPage />} />
            <Route path="/tenants" element={<Tenant />} />
            <Route path="/settings" element={<div>Settings Content (Coming Soon)</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
