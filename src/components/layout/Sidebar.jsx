import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Truck, AlertCircle, Settings, Zap, LogOut, Bell } from 'lucide-react';
import TenantSelector from './TenantSelector';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
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
        <NavLink to="/notifications" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Bell size={20} />
          <span>Notifications</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
        <button onClick={logout} className="nav-link logout-btn">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
        {user && (
          <div className="user-profile">
            <div className="user-avatar">{user.full_name?.charAt(0) || 'U'}</div>
            <div className="user-info">
              <span className="user-name">{user.full_name}</span>
              <span className="user-email">{user.email}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
