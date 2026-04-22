import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Building2, ChevronDown, Check } from 'lucide-react';

const TenantSelector = () => {
  const { tenants, selectedTenantId, setSelectedTenantId, loading, selectedTenant } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading || tenants.length === 0) return null;

  return (
    <div style={{ marginBottom: '2rem', padding: '0 0.5rem', position: 'relative' }} ref={dropdownRef}>
      <label style={{ 
        display: 'block', 
        fontSize: '0.625rem', 
        color: 'rgba(255, 255, 255, 0.4)', 
        marginBottom: '0.625rem',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        fontWeight: '800'
      }}>
        Organization Context
      </label>
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          borderRadius: '0.75rem',
          backgroundColor: isOpen ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.08)',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          outline: 'none',
          boxShadow: isOpen ? '0 0 0 4px rgba(255, 255, 255, 0.03)' : 'none'
        }}
        onMouseOver={(e) => {
          if (!isOpen) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
        }}
        onMouseOut={(e) => {
          if (!isOpen) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
          <Building2 size={16} color="var(--primary)" />
          <span style={{ 
            fontSize: '0.875rem', 
            fontWeight: '600', 
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis' 
          }}>
            {selectedTenant?.name || 'Select Tenant'}
          </span>
        </div>
        <ChevronDown 
          size={16} 
          style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'none', 
            transition: 'transform 0.3s ease',
            opacity: 0.5
          }} 
        />
      </button>

      {/* Custom Dropdown Menu */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: '155px', // Aligns with the sidebar button
          left: '20px',
          width: '220px',
          backgroundColor: 'white',
          borderRadius: '1rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          padding: '0.5rem',
          border: '1px solid var(--border)',
          animation: 'fadeInUp 0.2s ease-out'
        }}>
          {tenants.map((tenant) => {
            const isActive = tenant.id === selectedTenantId;
            return (
              <div 
                key={tenant.id}
                onClick={() => {
                  setSelectedTenantId(tenant.id);
                  setIsOpen(false);
                }}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '0.625rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-main)',
                  transition: 'all 0.2s ease',
                  fontSize: '0.8125rem',
                  fontWeight: isActive ? '700' : '500',
                  marginBottom: '2px'
                }}
                onMouseOver={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.color = 'var(--primary)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-main)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, overflow: 'hidden' }}>
                  <Building2 size={16} style={{ opacity: isActive ? 1 : 0.5, flexShrink: 0 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <span style={{ 
                      fontSize: '0.8125rem', 
                      fontWeight: isActive ? '700' : '600',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {tenant.name}
                    </span>
                    <span style={{ 
                      fontSize: '0.625rem', 
                      opacity: 0.5,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {tenant.slug}.truckbilling.com
                    </span>
                  </div>
                </div>
                {isActive && <Check size={14} style={{ flexShrink: 0, marginLeft: '0.5rem' }} />}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TenantSelector;
