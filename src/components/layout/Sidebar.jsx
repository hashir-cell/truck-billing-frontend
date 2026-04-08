import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Truck, AlertCircle, Users, Settings, Zap } from 'lucide-react';
import TenantSelector from './TenantSelector';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Truck size={24} color="#3b82f6" />
        <span>GNS Billing</span>
      </div>
      
      <TenantSelector />
      
      <nav className="nav-links">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
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
        <NavLink to="/tenants" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Users size={20} />
          <span>Tenants</span>
        </NavLink>
      </nav>

      <div style={{ marginTop: 'auto' }}>
        <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
