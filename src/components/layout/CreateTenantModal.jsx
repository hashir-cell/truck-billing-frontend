import React, { useState, useEffect } from 'react';
import { X, Building2, Globe, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createTenant, updateTenant } from '../../services/api';
import { useApp } from '../../context/AppContext';

const CreateTenantModal = ({ isOpen, onClose, tenant = null }) => {
  const { fetchTenants } = useApp();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Initialize from tenant if provided (Edit Mode)
  useEffect(() => {
    if (tenant) {
      setName(tenant.name || '');
      setSlug(tenant.slug || '');
    } else {
      setName('');
      setSlug('');
    }
  }, [tenant, isOpen]);

  // Auto-generate slug from name (only if not in Edit Mode or slug is empty)
  useEffect(() => {
    if (!tenant && name && !slug) {
      setSlug(name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''));
    }
  }, [name, tenant]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (tenant) {
        await updateTenant(tenant.id, { name, slug });
        setSuccess(true);
      } else {
        await createTenant({ name, slug, config: {} });
        setSuccess(true);
      }
      
      await fetchTenants();
      setTimeout(() => {
        onClose();
        setSuccess(false);
        if (!tenant) {
          setName('');
          setSlug('');
        }
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || `Failed to ${tenant ? 'update' : 'create'} organization.`);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div style={overlayStyle}>
      <div className="card" style={modalStyle}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={iconBoxStyle}>
              <Building2 size={20} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>{tenant ? 'Edit Organization' : 'Register Organization'}</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{tenant ? 'Modify organization details and configuration.' : 'Setup a new tenant for the billing engine.'}</p>
            </div>
          </div>
          <button onClick={onClose} style={closeButtonStyle}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {error && (
            <div style={errorStyle}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div style={successStyle}>
              <CheckCircle2 size={32} color="var(--success)" />
              <p style={{ fontWeight: '700', marginTop: '0.75rem' }}>Organization {tenant ? 'Updated' : 'Created'}!</p>
              <p style={{ fontSize: '0.875rem' }}>Refreshing system dashboard...</p>
            </div>
          ) : (
            <>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Organization Name</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Logistics"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              <div style={inputGroupStyle}>
                <label style={labelStyle}>Subdomain / Slug</label>
                <div style={slugContainerStyle}>
                  <Globe size={16} color="var(--text-muted)" />
                  <input
                    type="text"
                    placeholder="acme-logistics"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    style={slugInputStyle}
                    required
                  />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>.truckbilling.com</span>

                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  This creates a unique partitioned data slice for this client.
                </p>
              </div>

              <div style={{ marginTop: '2rem' }}>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="button-primary"
                  style={{ 
                    width: '100%', 
                    padding: '0.875rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: '0.5rem',
                    borderRadius: '0.75rem'
                  }}
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : (tenant ? 'Save Changes' : 'Complete Registration')}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.4)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2000,
  animation: 'fadeIn 0.2s ease-out'
};

const modalStyle = {
  width: '100%',
  maxWidth: '480px',
  padding: '0',
  overflow: 'hidden',
  boxShadow: 'var(--shadow-lg)'
};

const headerStyle = {
  padding: '1.25rem 1.5rem',
  borderBottom: '1px solid var(--border)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const iconBoxStyle = {
  width: '40px',
  height: '40px',
  borderRadius: '0.75rem',
  backgroundColor: 'var(--primary-bg)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const closeButtonStyle = {
  padding: '0.5rem',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--text-muted)'
};

const inputGroupStyle = {
  marginBottom: '1.5rem'
};

const labelStyle = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: '700',
  marginBottom: '0.5rem',
  color: 'var(--text-main)'
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '0.625rem',
  border: '1px solid var(--border)',
  outline: 'none',
  transition: 'border-color 0.2s'
};

const slugContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.75rem 1rem',
  borderRadius: '0.625rem',
  border: '1px solid var(--border)',
  backgroundColor: '#f9fafb'
};

const slugInputStyle = {
  border: 'none',
  background: 'none',
  outline: 'none',
  fontSize: '0.875rem',
  flex: 1,
  fontWeight: '600'
};

const errorStyle = {
  padding: '0.75rem',
  backgroundColor: 'var(--error-bg)',
  color: 'var(--error)',
  borderRadius: '0.5rem',
  marginBottom: '1.5rem',
  fontSize: '0.875rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem'
};

const successStyle = {
  padding: '2rem',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
};

const successTextStyle = {
  fontWeight: '700',
  marginTop: '0.75rem',
  fontSize: '1.125rem'
};

export default CreateTenantModal;
