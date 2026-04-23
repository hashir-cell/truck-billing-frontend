import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Settings, 
  MessageSquare, 
  Mail, 
  Globe, 
  ShieldCheck, 
  Save, 
  Eye, 
  EyeOff,
  Bell,
  Cpu,
  Lock,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap
} from 'lucide-react';
import { updateTenant, getGmailConnectUrl, getGmailStatus, disconnectGmail, getAutomationSettings, updateAutomationSettings } from '../../services/api';

const GoogleLogo = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.65 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

const SettingsPage = () => {
  const { selectedTenant, fetchTenants, selectedTenantId } = useApp();
  const [activeTab, setActiveTab] = useState('messaging');
  const [loading, setLoading] = useState(false);
  const [showToken, setShowToken] = useState(false);
  
  const [gmailStatus, setGmailStatus] = useState({ connected: false, email: null });
  const [gmailLoading, setGmailLoading] = useState(false);

  // Automation state
  const [automationSettings, setAutomationSettings] = useState({ interval_minutes: 0, is_active: false, next_run: null });
  const [automationLoading, setAutomationLoading] = useState(false);

  const fetchAutomationSettings = async () => {
    try {
      const settings = await getAutomationSettings();
      setAutomationSettings(settings);
    } catch { /* silent */ }
  };

  useEffect(() => {
    if (selectedTenantId) {
      fetchGmailStatus();
      fetchAutomationSettings();
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get('gmail') === 'connected') {
      window.history.replaceState({}, '', '/settings');
      setActiveTab('email');
    }
  }, [selectedTenantId]);

  const handleUpdateAutomation = async (interval) => {
    setAutomationLoading(true);
    try {
      const res = await updateAutomationSettings({ interval_minutes: interval });
      setAutomationSettings(prev => ({ ...prev, interval_minutes: interval, is_active: interval > 0 }));
    } catch (err) {
      alert('Failed to update automation: ' + (err.response?.data?.detail || err.message));
    } finally {
      setAutomationLoading(false);
    }
  };

  const handleGmailConnect = async () => {
    setGmailLoading(true);
    try {
      const { auth_url } = await getGmailConnectUrl();
      if (auth_url) window.location.href = auth_url;
    } catch {
      alert('Failed to start Gmail connection');
      setGmailLoading(false);
    }
  };

  const handleGmailDisconnect = async () => {
    if (!window.confirm('Disconnect Gmail? Email notifications will stop working.')) return;
    setGmailLoading(true);
    try {
      await disconnectGmail();
      setGmailStatus({ connected: false, email: null });
    } catch {
      alert('Failed to disconnect Gmail');
    } finally {
      setGmailLoading(false);
    }
  };

  // Local form state
  const [formData, setFormData] = useState({
    twilio: {
      account_sid: '',
      auth_token: '',
      from_number: ''
    },
    gmail: {
      client_id: '',
      client_secret: '',
      app_password: ''
    },
    general: {
      support_email: '',
      timezone: 'UTC',
      retention_days: '30'
    }
  });

  // Sync with selectedTenant config when it changes
  useEffect(() => {
    if (selectedTenant && selectedTenant.config) {
      let configData = JSON.parse(JSON.stringify(selectedTenant.config));
      
      if (configData.twilio && configData.twilio.auth_token) {
        configData.twilio.auth_token = "********";
      }

      setFormData(prev => ({
        ...prev,
        ...configData
      }));
    }
  }, [selectedTenant]);

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    if (!selectedTenantId) return;
    
    setLoading(true);
    try {
      await updateTenant(selectedTenantId, { config: formData });
      await fetchTenants();
      alert('Settings saved successfully!');
    } catch (err) {
      alert('Failed to save settings: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (!selectedTenant) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Please select an organization first</h2>
      </div>
    );
  }

  const sections = [
    { id: 'messaging', label: 'SMS & Messaging', icon: <MessageSquare size={18} /> },
    { id: 'email', label: 'Email & API', icon: <Mail size={18} /> },
    { id: 'general', label: 'General', icon: <Settings size={18} /> },
    { id: 'automation', label: 'Pipeline Automation', icon: <Zap size={18} /> },
    { id: 'security', label: 'Security', icon: <ShieldCheck size={18} /> }
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Organization Settings</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Configure integrations and system preferences for <strong>{selectedTenant.name}</strong>.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '2rem' }}>
        {/* Sidebar Nav */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveTab(section.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.875rem 1rem',
                borderRadius: '0.625rem',
                border: 'none',
                background: activeTab === section.id ? 'var(--primary-light)' : 'transparent',
                color: activeTab === section.id ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: activeTab === section.id ? '600' : '500',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
            >
              {section.icon}
              <span>{section.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="card" style={{ padding: '2rem', minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
          
          {activeTab === 'messaging' && (
            <div className="fade-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: '#fef2f2', color: '#ef4444' }}>
                  <Cpu size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>Twilio Integration</h3>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Configure SMS and voice notifications.</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label>Account SID</label>
                  <input 
                    type="text" 
                    placeholder="ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                    value={formData.twilio?.account_sid || ''}
                    onChange={(e) => handleInputChange('twilio', 'account_sid', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label>Auth Token</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showToken ? 'text' : 'password'} 
                      placeholder="Enter Twilio Auth Token"
                      value={formData.twilio?.auth_token || ''}
                      onChange={(e) => handleInputChange('twilio', 'auth_token', e.target.value)}
                      style={{ paddingRight: '2.5rem' }}
                    />
                    <button 
                      onClick={() => setShowToken(!showToken)}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer'
                      }}
                    >
                      {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>From Number</label>
                  <input 
                    type="text" 
                    placeholder="+1234567890"
                    value={formData.twilio?.from_number || ''}
                    onChange={(e) => handleInputChange('twilio', 'from_number', e.target.value)}
                  />
                  <small style={{ color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                    A purchased Twilio number in E.164 format.
                  </small>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Header */}
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  Email Integrations
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', margin: 0 }}>
                  Connect your organization’s email accounts to automatically send billing documents and receive rate confirmations.
                </p>
              </div>

              {/* Integration Card */}
              <div style={{
                background: 'white',
                border: `1px solid ${gmailStatus.connected ? 'rgba(16, 185, 129, 0.3)' : 'var(--border)'}`,
                borderRadius: '1rem',
                boxShadow: gmailStatus.connected 
                  ? '0 4px 20px -4px rgba(16, 185, 129, 0.1), 0 0 0 1px rgba(16, 185, 129, 0.05) inset' 
                  : '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.02)',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                {/* Card Top Section */}
                <div style={{ 
                  padding: '1.75rem', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  background: gmailStatus.connected ? 'linear-gradient(to bottom right, #ffffff, #f0fdf4)' : '#ffffff',
                  borderBottom: '1px solid var(--border)'
                }}>
                  <div style={{ display: 'flex', gap: '1.25rem' }}>
                    {/* App Icon */}
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '14px',
                      background: 'white',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                      flexShrink: 0
                    }}>
                      <GoogleLogo />
                    </div>

                    {/* App Info */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-main)' }}>
                          Google Workspace
                        </h3>
                        {gmailStatus.connected ? (
                          <span style={{ 
                            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                            padding: '0.25rem 0.625rem', borderRadius: '2rem',
                            background: '#ecfdf5', color: '#059669',
                            fontSize: '0.75rem', fontWeight: '600'
                          }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}/>
                            Connected
                          </span>
                        ) : (
                          <span style={{ 
                            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                            padding: '0.25rem 0.625rem', borderRadius: '2rem',
                            background: '#f3f4f6', color: '#4b5563',
                            fontSize: '0.75rem', fontWeight: '600'
                          }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#9ca3af' }}/>
                            Not Connected
                          </span>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                        Send invoices and rate confirmation requests securely via Gmail API.
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    {gmailStatus.connected ? (
                      <button
                        onClick={handleGmailDisconnect}
                        disabled={gmailLoading}
                        style={{
                          padding: '0.625rem 1rem',
                          borderRadius: '0.5rem',
                          border: '1px solid #e5e7eb',
                          background: 'white',
                          color: '#dc2626',
                          fontWeight: '600',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                          transition: 'all 0.2s',
                          opacity: gmailLoading ? 0.7 : 1
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fecaca'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
                      >
                        {gmailLoading ? 'Disconnecting...' : 'Disconnect'}
                      </button>
                    ) : (
                      <button
                        onClick={handleGmailConnect}
                        disabled={gmailLoading}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.75rem', 
                          padding: '0.625rem 1.25rem',
                          borderRadius: '0.5rem',
                          border: '1px solid #d1d5db',
                          background: 'white',
                          color: '#374151',
                          fontWeight: '600',
                          fontSize: '0.9375rem',
                          cursor: 'pointer',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                          transition: 'all 0.2s',
                          opacity: gmailLoading ? 0.7 : 1
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = '#f9fafb'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'white'; }}
                      >
                        <GoogleLogo />
                        {gmailLoading ? 'Connecting...' : 'Sign in with Google'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Card Bottom / Config Section */}
                {gmailStatus.connected && (
                  <div style={{ padding: '1.25rem 1.75rem', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <CheckCircle2 size={18} color="#10b981" />
                    <span style={{ fontSize: '0.875rem', color: '#334155' }}>
                      Operating securely as <strong>{gmailStatus.email}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Information / Disclaimer */}
              <div style={{
                padding: '1rem 1.25rem',
                borderRadius: '0.75rem',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start'
              }}>
                <div style={{ minWidth: '20px', color: '#3b82f6', marginTop: '2px' }}>
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.375rem 0', color: '#1e3a8a', fontSize: '0.9375rem' }}>How OAuth Works</h4>
                  <p style={{ margin: 0, color: '#1d4ed8', fontSize: '0.875rem', lineHeight: '1.5' }}>
                    Unlike basic SMTP, Google Workspace OAuth gives our platform specific API access to draft and send emails 
                    without storing your password. The connection issues a secure token that you can revoke at any time from your Google Account settings.
                  </p>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'general' && (
            <div className="fade-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: '#eff6ff', color: 'var(--primary)' }}>
                  <Globe size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>System Preferences</h3>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>General configuration for billing automation.</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label>Support Email Address</label>
                  <input 
                    type="email" 
                    placeholder="billing@company.com"
                    value={formData.general?.support_email || ''}
                    onChange={(e) => handleInputChange('general', 'support_email', e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>System Timezone</label>
                    <select 
                      value={formData.general?.timezone || 'UTC'}
                      onChange={(e) => handleInputChange('general', 'timezone', e.target.value)}
                    >
                      <option value="UTC">UTC (Default)</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Data Retention (Days)</label>
                    <select 
                      value={formData.general?.retention_days || '30'}
                      onChange={(e) => handleInputChange('general', 'retention_days', e.target.value)}
                    >
                      <option value="30">30 Days</option>
                      <option value="60">60 Days</option>
                      <option value="90">90 Days</option>
                      <option value="365">1 Year</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'automation' && (
            <div className="fade-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: '#fff7ed', color: '#f97316' }}>
                  <Zap size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>Pipeline Automation</h3>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Configure automatic document extraction and workflow execution.</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Status Card */}
                <div style={{ 
                  padding: '1.5rem', 
                  borderRadius: '1rem', 
                  background: automationSettings.is_active ? '#f0fdf4' : '#f9fafb',
                  border: `1px solid ${automationSettings.is_active ? '#bbf7d0' : 'var(--border)'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      width: '12px', height: '12px', borderRadius: '50%', 
                      background: automationSettings.is_active ? '#22c55e' : '#9ca3af',
                      boxShadow: automationSettings.is_active ? '0 0 10px #22c55e' : 'none'
                    }} />
                    <div>
                      <h4 style={{ margin: 0 }}>{automationSettings.is_active ? 'Auto-Processing Active' : 'Automation Disabled'}</h4>
                      <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        {automationSettings.is_active 
                          ? `Next run scheduled for: ${new Date(automationSettings.next_run).toLocaleTimeString()}`
                          : 'Manual trigger required to process pipeline.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Frequency Selector */}
                <div>
                  <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={16} /> Run Frequency
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
                    {[
                      { label: 'Off', val: 0 },
                      { label: '15 Mins', val: 15 },
                      { label: '30 Mins', val: 30 },
                      { label: '1 Hour', val: 60 },
                      { label: '4 Hours', val: 240 },
                      { label: 'Daily', val: 1440 }
                    ].map(opt => (
                      <button
                        key={opt.val}
                        onClick={() => handleUpdateAutomation(opt.val)}
                        disabled={automationLoading}
                        style={{
                          padding: '0.75rem',
                          borderRadius: '0.75rem',
                          border: `1px solid ${automationSettings.interval_minutes === opt.val ? 'var(--primary)' : 'var(--border)'}`,
                          background: automationSettings.interval_minutes === opt.val ? 'var(--primary-light)' : 'white',
                          color: automationSettings.interval_minutes === opt.val ? 'var(--primary)' : 'var(--text-main)',
                          fontWeight: automationSettings.interval_minutes === opt.val ? '600' : '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          opacity: automationLoading ? 0.5 : 1
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ 
                  padding: '1rem', 
                  borderRadius: '0.75rem', 
                  background: '#fffbeb', 
                  border: '1px solid #fef3c7',
                  fontSize: '0.875rem',
                  color: '#92400e',
                  display: 'flex',
                  gap: '0.75rem'
                }}>
                  <AlertCircle size={20} style={{ flexShrink: 0 }} />
                  <p style={{ margin: 0 }}>
                    Automation will automatically poll your Gmail for Rate Confirmations and evaluate all 
                    loads through the billing workflow steps.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="fade-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: '#f5f3ff', color: '#7c3aed' }}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>Access & Security</h3>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Manage API access and security policies.</p>
                </div>
              </div>

              <div style={{ padding: '2rem', textAlign: 'center', background: '#f9fafb', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                <Lock size={32} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }} />
                <h4 style={{ margin: '0 0 0.5rem 0' }}>Security Controls are Restricted</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '300px', margin: '0 auto' }}>
                  Only system administrators can modify security and encryption policies for this tenant.
                </p>
              </div>
            </div>
          )}

          {activeTab !== 'email' && (
            <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={handleSave}
                disabled={loading}
                className="button-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  minWidth: '140px',
                  justifyContent: 'center'
                }}
              >
                {loading ? (
                  <span className="loader-small">Saving...</span>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .form-group label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text-main);
        }
        .form-group input, .form-group select {
          padding: 0.625rem 0.875rem;
          border-radius: 0.5rem;
          border: 1px solid var(--border);
          font-size: 0.875rem;
          background: white;
          color: var(--text-main);
          outline: none;
          transition: all 0.2s ease;
        }
        .form-group input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .loader-small {
          font-size: 0.875rem;
        }
      `}} />
    </div>
  );
};

export default SettingsPage;
