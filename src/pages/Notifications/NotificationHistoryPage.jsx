import React, { useState, useEffect } from 'react';
import {
  Search, Filter, RefreshCw, ExternalLink,
  ChevronLeft, ChevronRight, AlertCircle, CheckCircle,
  Clock, Info, RotateCcw, Mail, MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationRead, retryNotification } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PAGE_SIZE = 15;

const NotificationHistoryPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [page, setPage] = useState(1);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filterType === 'unread') params.unread_only = true;
      const data = await getNotifications(params);
      setNotifications(data);
    } catch (err) {
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchNotifications();
  }, [isAuthenticated, filterType]);

  const handleMarkRead = async (id) => {
    await markNotificationRead(id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleRetry = async (id, e) => {
    e.stopPropagation();
    try {
      await retryNotification(id);
      fetchNotifications(); 
    } catch {
      // Ignore
    }
  };

  const getTypeIcon = (notif) => {
    if (notif.status === 'failed') return <AlertCircle size={24} style={{ color: '#ef4444' }} />;
    if (notif.status === 'sent') return <CheckCircle size={24} style={{ color: '#10b981' }} />;
    if (notif.status === 'pending') return <Clock size={24} style={{ color: '#f59e0b' }} />;
    return <Info size={24} style={{ color: '#3b82f6' }} />;
  };

  const getStatusStyle = (notif) => {
    if (notif.status === 'failed') return { bg: '#fef2f2', border: '#fecaca', color: '#ef4444' };
    if (notif.status === 'sent') return { bg: '#ecfdf5', border: '#a7f3d0', color: '#10b981' };
    if (notif.status === 'pending') return { bg: '#fffbeb', border: '#fde68a', color: '#f59e0b' };
    return { bg: '#eff6ff', border: '#bfdbfe', color: '#3b82f6' };
  };

  const getChannelIcon = (channel) => {
    if (channel === 'email') return <Mail size={14} />;
    if (channel === 'sms') return <MessageSquare size={14} />;
    return <Info size={14} />;
  };

  const filtered = notifications.filter(n => {
    const term = searchTerm.toLowerCase();
    return (
      (n.subject || '').toLowerCase().includes(term) ||
      (n.body || '').toLowerCase().includes(term) ||
      (n.load_id || '').toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="animate-in" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            Notification Center
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
            Track and monitor critical outbound communications and automated workflows.
          </p>
        </div>
        <button
          onClick={fetchNotifications}
          className="button-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', padding: '0.5rem 1rem' }}
        >
          <RefreshCw size={16} /> Sync Logs
        </button>
      </div>

      {/* Filters Bar */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1rem 1.25rem', display: 'flex', gap: '1.5rem', alignItems: 'center', border: '1px solid var(--border)' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
          <input
            type="text"
            placeholder="Search by Load ID, subject, or message content..."
            style={{ 
              width: '100%', 
              padding: '0.625rem 1rem 0.625rem 2.5rem', 
              borderRadius: '0.5rem', 
              border: 'none', 
              outline: 'none', 
              fontSize: '0.875rem',
              background: '#f8fafc'
            }}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Filter size={18} color="var(--text-muted)" />
          <select
            style={{ 
              padding: '0.5rem 1rem', 
              borderRadius: '0.5rem', 
              border: '1px solid var(--border)', 
              outline: 'none', 
              background: 'white', 
              cursor: 'pointer',
              fontSize: '0.875rem',
              color: 'var(--text-main)'
            }}
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread Only</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="card" style={{ padding: '6rem', display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={32} className="animate-spin" style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
          <p style={{ margin: 0, fontWeight: 500 }}>Synchronizing logs...</p>
        </div>
      ) : error ? (
        <div className="card" style={{ padding: '4rem', textAlign: 'center', color: '#ef4444', border: '1px solid #fecaca', background: '#fef2f2' }}>
          <AlertCircle size={40} style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Sync Failed</h3>
          <p style={{ margin: 0, color: '#991b1b' }}>{error}</p>
          <button 
            onClick={fetchNotifications} 
            style={{ marginTop: '1.5rem', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            Try Again
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {paginated.length === 0 ? (
            <div className="card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CheckCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>All Caught Up</h3>
              <p style={{ margin: 0 }}>No notifications matched your search criteria.</p>
            </div>
          ) : paginated.map((notif) => {
            const style = getStatusStyle(notif);
            return (
              <div
                key={notif.id}
                onClick={() => handleMarkRead(notif.id)}
                className="card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1.5rem',
                  cursor: 'pointer',
                  border: `1px solid ${notif.is_read ? 'var(--border)' : 'var(--primary-light)'}`,
                  background: notif.is_read ? 'white' : '#f8fafc',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.05)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Unread dot indicator */}
                {!notif.is_read && (
                  <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: 'var(--primary)' }} />
                )}

                {/* Big Status Icon */}
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: style.bg,
                  border: `1px solid ${style.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {getTypeIcon(notif)}
                </div>

                {/* Content Body */}
                <div style={{ flex: 1, minWidth: 0 }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <h3 style={{ 
                        margin: 0, 
                        fontSize: '1.125rem', 
                        fontWeight: notif.is_read ? 600 : 700, 
                        color: 'var(--text-main)',
                      }}>
                        {notif.subject || 'System Notification'}
                      </h3>
                      
                      {/* Channel Badge */}
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                        padding: '0.25rem 0.6rem', borderRadius: '4px',
                        background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569',
                        fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase'
                      }}>
                        {getChannelIcon(notif.channel)}
                        {notif.channel || 'Internal'}
                      </span>

                      {/* Load Badge */}
                      {notif.load_id && (
                        <span 
                          onClick={(e) => { e.stopPropagation(); navigate(`/loads/${notif.load_id}`); }}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                            padding: '0.25rem 0.6rem', borderRadius: '4px',
                            background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--primary)',
                            fontSize: '0.75rem', fontWeight: 700,
                            cursor: 'pointer'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-light)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-main)'}
                        >
                          Load #{notif.load_id.slice(-6)}
                          <ExternalLink size={12} />
                        </span>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                        {new Date(notif.created_at).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                         {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <p style={{ 
                    margin: 0, 
                    fontSize: '0.9375rem', 
                    color: notif.is_read ? 'var(--text-muted)' : '#334155',
                    lineHeight: '1.5',
                    fontWeight: notif.is_read ? 400 : 500
                  }}>
                    {notif.body || 'No detailed message provided.'}
                  </p>

                  {/* Actions row */}
                  {notif.status === 'failed' && (
                    <div style={{ marginTop: '1rem', display: 'flex' }}>
                       <button 
                        onClick={(e) => handleRetry(notif.id, e)}
                        style={{ 
                          display: 'flex', alignItems: 'center', gap: '0.5rem',
                          background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626',
                          padding: '0.375rem 0.875rem', borderRadius: '0.375rem',
                          fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                        onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}
                      >
                        <RotateCcw size={14} />
                        Retry Message
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {filtered.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', padding: '0 0.5rem' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Showing <strong style={{ color: 'var(--text-main)' }}>{Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}</strong> to <strong style={{ color: 'var(--text-main)' }}>{Math.min(page * PAGE_SIZE, filtered.length)}</strong> of <strong style={{ color: 'var(--text-main)' }}>{filtered.length}</strong> events
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="card"
                  style={{ 
                    padding: '0.5rem', background: 'white', border: '1px solid var(--border)', borderRadius: '0.5rem', 
                    cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1, display: 'flex', alignItems: 'center' 
                  }}>
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="card"
                  style={{ 
                    padding: '0.5rem', background: 'white', border: '1px solid var(--border)', borderRadius: '0.5rem', 
                    cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.5 : 1, display: 'flex', alignItems: 'center' 
                  }}>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationHistoryPage;
