import React, { createContext, useState, useContext, useEffect } from 'react';
import { getTenants } from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [tenants, setTenants] = useState([]);
  const [selectedTenantId, setSelectedTenantId] = useState(
    localStorage.getItem('selectedTenantId') || null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTenants = async () => {
    try {
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
    fetchTenants();
  }, []);

  const handleSelectTenant = (id) => {
    setSelectedTenantId(id);
    localStorage.setItem('selectedTenantId', id);
  };

  const selectedTenant = tenants.find(t => t.id === selectedTenantId);

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
