import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Truck, AlertCircle, Settings, Zap, LogOut, Bell, CreditCard } from 'lucide-react';
import TenantSelector from './TenantSelector';
import { useAuth } from '../../context/AuthContext';

import { useApp } from '../../context/AppContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { selectedTenant } = useApp();
  
  const branding = selectedTenant?.config?.branding;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        {branding?.logo_url ? (
          <img 
            src={`http://127.0.0.1:8000${branding.logo_url}`} 
            alt="Logo" 
            style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'contain' }} 
          />
        ) : (
          <Truck size={24} color="var(--primary)" />
        )}
        <span style={{ color: 'white', fontWeight: '700' }}>
          {selectedTenant?.name || 'GNS Billing'}
        </span>
      </div>
      
      <TenantSelector />
      
      <nav className="nav-links">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/orchestration" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Zap size={20} />
          <span>Mission Control</span>
        </NavLink>
        <NavLink to="/loads" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Truck size={20} />
          <span>Loads</span>
        </NavLink>
        <NavLink to="/exceptions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <AlertCircle size={20} />
          <span>Exceptions</span>
        </NavLink>
        <NavLink to="/notifications" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Bell size={20} />
          <span>Notifications</span>
        </NavLink>
        <NavLink to="/payments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <CreditCard size={20} />
          <span>Payments</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
        
        {user && (
          <div className="user-profile" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="user-avatar">{user.full_name?.charAt(0) || 'U'}</div>
              <div className="user-info">
                <span className="user-name">{user.full_name}</span>
                <span className="user-email">{user.email}</span>
              </div>
            </div>
            <button 
              onClick={logout} 
              className="logout-icon-btn" 
              title="Logout"
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'rgba(255,255,255,0.4)', 
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'none'; }}
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
