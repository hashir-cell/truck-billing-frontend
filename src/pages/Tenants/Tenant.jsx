import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/common/StatusBadge';
import { CheckCircle2, Building2, Globe, Settings2, Trash2 } from 'lucide-react';
import { deleteTenant } from '../../services/api';
import CreateTenantModal from '../../components/layout/CreateTenantModal';

const Tenant = () => {
  const { tenants, selectedTenantId, setSelectedTenantId, fetchTenants, loading, error } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);

  const handleEdit = (tenant) => {
    setEditingTenant(tenant);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTenant(null);
  };

  const handleDelete = async (tenantId) => {
    if (window.confirm('Are you sure you want to delete this organization? All associated data will be removed.')) {
      try {
        await deleteTenant(tenantId);
        await fetchTenants();
        if (selectedTenantId === tenantId) {
          setSelectedTenantId(null);
        }
      } catch (err) {
        alert('Failed to delete tenant: ' + (err.response?.data?.detail || err.message));
      }
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading tenants...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'var(--error)' }}>Error: {error.message}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Tenants Management</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '-1rem' }}>
            Manage organization accounts and their configurations.
          </p>
        </div>
        <button 
          onClick={() => {
            setEditingTenant(null);
            setIsModalOpen(true);
          }}
          className="button-primary" 
          style={{ 
            backgroundColor: 'var(--primary)', 
            color: 'white', 
            border: 'none', 
            padding: '0.75rem 1.5rem', 
            borderRadius: '0.625rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)'
          }}
        >
          <Building2 size={18} />
          <span>Add New Tenant</span>
        </button>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.875rem' }}>TENANT NAME</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.875rem' }}>SLUG / SUBDOMAIN</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.875rem' }}>STATUS</th>
              <th style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {(tenants || []).map((tenant) => {
              const isActive = tenant.id === selectedTenantId;
              return (
                <tr key={tenant.id} style={{ 
                  borderBottom: '1px solid var(--border)',
                  backgroundColor: isActive ? 'rgba(59, 130, 246, 0.02)' : 'transparent',
                  transition: 'background-color 0.2s ease'
                }}>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '0.5rem', 
                        backgroundColor: isActive ? 'var(--primary)' : '#f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isActive ? 'white' : 'var(--text-muted)'
                      }}>
                        <Building2 size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{tenant.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {tenant.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                      <Globe size={14} />
                      <span>{tenant.slug}.gnsbilling.com</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <StatusBadge status={tenant.active ? 'active' : 'inactive'} />
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                      {isActive ? (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.375rem', 
                          color: 'var(--success)', 
                          fontSize: '0.875rem', 
                          fontWeight: '600',
                          padding: '0.5rem 1rem'
                        }}>
                          <CheckCircle2 size={16} />
                          <span>Currently Active</span>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setSelectedTenantId(tenant.id)}
                          style={{ 
                            padding: '0.5rem 1rem', 
                            borderRadius: '0.5rem', 
                            border: '1px solid var(--border)',
                            background: 'white',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#f9fafb';
                            e.currentTarget.style.borderColor = 'var(--primary)';
                            e.currentTarget.style.color = 'var(--primary)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.borderColor = 'var(--border)';
                            e.currentTarget.style.color = 'inherit';
                          }}
                        >
                          Switch to Tenant
                        </button>
                      )}
                      
                      <button 
                        onClick={() => handleEdit(tenant)}
                        style={{ 
                          padding: '0.5rem', 
                          borderRadius: '0.5rem', 
                          border: 'none',
                          background: 'transparent',
                          color: 'var(--text-muted)',
                          cursor: 'pointer'
                        }}
                      >
                        <Settings2 size={18} />
                      </button>

                      <button 
                        onClick={() => handleDelete(tenant.id)}
                        style={{ 
                          padding: '0.5rem', 
                          borderRadius: '0.5rem', 
                          border: 'none',
                          background: 'transparent',
                          color: '#f87171',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(!tenants || tenants.length === 0) && (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Building2 size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
            <p>No tenants found. Create your first organization to get started.</p>
          </div>
        )}
      </div>

      <CreateTenantModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        tenant={editingTenant}
      />
    </div>
  );
};

export default Tenant;