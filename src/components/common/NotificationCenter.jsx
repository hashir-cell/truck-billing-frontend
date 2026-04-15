import React, { useState, useEffect, useRef } from 'react';
import { Bell, AlertTriangle, Clock, CheckCircle2, ChevronRight, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationRead, retryNotification } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const panelRef = useRef(null);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await getNotifications({ unread_only: false });
      setNotifications(data);
    } catch (err) {
      // Silently fail — don't disrupt the UI
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      // Poll for new notifications every 60 seconds
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Close panel on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    await Promise.all(unread.map(n => markNotificationRead(n.id)));
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      await markNotificationRead(notif.id);
      setNotifications(notifications.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
    }
    setIsOpen(false);
    if (notif.load_id) {
      navigate(`/loads/${notif.load_id}`);
    }
  };

  const getIcon = (notif) => {
    if (notif.channel === 'SMS' || notif.channel === 'email') return <Clock size={20} color="var(--warning)" />;
    if (notif.status === 'failed') return <AlertTriangle size={20} color="var(--error)" />;
    return <AlertTriangle size={20} color="var(--warning)" />;
  };

  const getBg = (notif) => {
    if (notif.is_read) return 'transparent';
    if (notif.status === 'failed') return 'var(--error-bg)';
    return 'var(--warning-bg)';
  };

  return (
    <div ref={panelRef} style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 1000 }}>
      {/* Floating Bell Button */}
      <button
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) fetchNotifications(); }}
        style={{
          width: '48px', height: '48px', borderRadius: '50%',
          backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer', position: 'relative', transition: 'all 0.2s',
        }}
      >
        <Bell size={20} color="var(--text-main)" />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '0px', right: '0px',
            backgroundColor: 'var(--error)', color: 'white',
            fontSize: '0.7rem', fontWeight: 800, width: '20px', height: '20px',
            borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', boxShadow: '0 0 0 2px var(--bg-main)'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="card" style={{
          position: 'absolute', bottom: '60px', right: '0', width: '380px',
          padding: 0, overflow: 'hidden', animation: 'fadeInUp 0.2s ease-out'
        }}>
          {/* Header */}
          <div style={{
            padding: '1rem', borderBottom: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'rgba(255,255,255,0.8)'
          }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
              Notifications {loading && <RefreshCw size={14} style={{ marginLeft: '6px', opacity: 0.5, animation: 'spin 1s linear infinite' }} />}
            </h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>
                Mark all as read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {loading && notifications.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <RefreshCw size={24} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                <p style={{ fontSize: '0.875rem' }}>Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                <p>You're all caught up!</p>
              </div>
            ) : (
              notifications.slice(0, 10).map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  style={{
                    padding: '1rem', borderBottom: '1px solid var(--border)',
                    backgroundColor: getBg(notif), display: 'flex', gap: '1rem',
                    cursor: 'pointer', transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => { if (notif.is_read) e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)'; }}
                  onMouseLeave={(e) => { if (notif.is_read) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <div style={{ paddingTop: '0.2rem' }}>{getIcon(notif)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {notif.subject || notif.channel || 'Notification'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 0.5rem 0', lineHeight: 1.4 }}>
                      {notif.body || notif.status}
                    </p>
                    {notif.load_id && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>
                        View Load <ChevronRight size={14} />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '0.75rem', textAlign: 'center',
            borderTop: '1px solid var(--border)', background: 'rgba(255,255,255,0.8)', fontSize: '0.85rem'
          }}>
            <button
              onClick={() => { setIsOpen(false); navigate('/notifications'); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 }}
            >
              View Full History (Audit Trail)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
