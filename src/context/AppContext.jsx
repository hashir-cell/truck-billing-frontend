import React, { createContext, useState, useContext, useEffect } from 'react';
import { getTenants } from '../services/api';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [selectedTenantId, setSelectedTenantId] = useState(
    localStorage.getItem('selectedTenantId') || null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTenants = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await getTenants();
      setTenants(res);
      
      // Auto-select first tenant if none selected
      if (!selectedTenantId && res.length > 0) {
        handleSelectTenant(res[0].id);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTenants();
    } else {
      setTenants([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleSelectTenant = (id) => {
    setSelectedTenantId(id);
    localStorage.setItem('selectedTenantId', id);
  };

  const selectedTenant = tenants.find(t => t.id === selectedTenantId);

  useEffect(() => {
    if (selectedTenant && selectedTenant.config && selectedTenant.config.branding) {
      const { primary_color } = selectedTenant.config.branding;
      if (primary_color) {
        document.documentElement.style.setProperty('--primary', primary_color);
        // Generate a light version (10% opacity) for backgrounds
        document.documentElement.style.setProperty('--primary-light', `${primary_color}1a`);
        // Generate a hover version (darker) - for simplicity we just set a shadow or slight shift
        document.documentElement.style.setProperty('--primary-hover', primary_color);
      }
    } else {
      // Reset to defaults
      document.documentElement.style.setProperty('--primary', '#2563eb');
      document.documentElement.style.setProperty('--primary-light', '#eff6ff');
    }
  }, [selectedTenant]);

  const value = {
    tenants,
    selectedTenantId,
    selectedTenant,
    setSelectedTenantId: handleSelectTenant,
    loading,
    error,
    fetchTenants,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
