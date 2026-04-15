import React, { useEffect, useState } from 'react';
import { getDashboardSummary, getLoads } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { 
  Truck, 
  AlertTriangle, 
  DollarSign, 
  Layers, 
  ChevronRight, 
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Loader2,
  FileText,
  Activity,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { selectedTenantId, selectedTenant } = useApp();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [recentExceptions, setRecentExceptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const [summary, loads] = await Promise.all([
          getDashboardSummary(),
          getLoads({ state: 'EXCEPTION' })
        ]);
        setData(summary);
        setRecentExceptions(loads.slice(0, 4)); // Show up to 4 exceptions
      } catch (err) {
        if (err.response?.status !== 401) {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    };
    if (selectedTenantId && isAuthenticated) {
      fetchDashboard();
    }
  }, [selectedTenantId, isAuthenticated]);

  if (!selectedTenantId) return (
    <div style={{ padding: '6rem 2rem', textAlign: 'center', backgroundColor: 'white', borderRadius: '1rem', border: '1px solid var(--border)', maxWidth: '600px', margin: '4rem auto' }}>
      <Layers size={48} color="var(--border)" style={{ marginBottom: '1.5rem' }} />
      <h3 style={{ color: 'var(--text-main)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Select a Workspace</h3>
      <p style={{ color: 'var(--text-muted)' }}>Choose an organization from the sidebar to view its dashboard insights.</p>
    </div>
  );

  if (loading) return (
    <div style={{ padding: '6rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)' }}>
      <Loader2 size={32} className="animate-spin" color="var(--primary)" style={{ marginBottom: '1rem' }} />
      <span style={{ fontWeight: 500 }}>Loading workspace data...</span>
    </div>
  );

  if (error) return (
    <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#ef4444', backgroundColor: '#fef2f2', border: '1px solid #fecaca', maxWidth: '600px', margin: '2rem auto' }}>
      <AlertTriangle size={40} style={{ marginBottom: '1rem' }} />
      <h3 style={{ margin: '0 0 0.5rem 0' }}>Data Fetch Error</h3>
      <p style={{ margin: 0, color: '#991b1b' }}>{error.message || 'Failed to load dashboard metrics.'}</p>
      <button onClick={() => window.location.reload()} className="button-primary" style={{ marginTop: '1.5rem' }}>Try Again</button>
    </div>
  );

  const workflowStages = [
    { label: 'Ingested', key: 'DELIVERED', icon: <Truck size={16} /> },
    { label: 'Pending Docs', key: 'DOCS_PENDING', icon: <Clock size={16} /> },
    { label: 'Reviewing', key: 'INVOICE_READY', icon: <FileText size={16} /> },
    { label: 'Batched', key: 'BATCH_READY', icon: <Layers size={16} /> },
    { label: 'Settled', key: 'PAID', icon: <CheckCircle2 size={16} /> }
  ];

  return (
    <div className="animate-in" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            Dashboard Overview
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
            Metrics and operational standing for {selectedTenant?.name || 'the organization'}.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.875rem', background: '#ecfdf5', borderRadius: '2rem', border: '1px solid #a7f3d0', fontSize: '0.8125rem', fontWeight: '600', color: '#10b981' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
          System Operational
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Total Volumes Card */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <Truck size={20} />
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--success)', background: '#ecfdf5', padding: '0.25rem 0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
               <ArrowUpRight size={12} /> 12%
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500, margin: '0 0 0.25rem 0' }}>Processed Shipments</p>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1 }}>
            {data?.total_loads || 0}
          </div>
        </div>

        {/* Exceptions Card */}
        <div 
          className="card" 
          onClick={() => navigate('/exceptions')} 
          style={{ padding: '1.5rem', cursor: 'pointer', border: data?.exceptions_count > 0 ? '1px solid #fca5a5' : '1px solid var(--border)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500, margin: '0 0 0.25rem 0' }}>Action Required</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 700, color: data?.exceptions_count > 0 ? '#ef4444' : 'var(--text-main)', lineHeight: 1 }}>
              {data?.exceptions_count || 0}
            </span>
            {data?.exceptions_count > 0 && (
              <span style={{ fontSize: '0.8125rem', color: '#ef4444', fontWeight: 600 }}>Unresolved</span>
            )}
          </div>
        </div>

        {/* Revenue/Volume Card */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500, margin: '0 0 0.25rem 0' }}>Pipeline Revenue</p>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1 }}>
            ${data?.total_revenue?.toLocaleString() || '0.00'}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '1.5rem' }}>
        
        {/* Workflow Pulse */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} color="var(--primary)" />
              Automation Pipeline
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Updated Just Now</span>
          </div>
          
          <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'space-between', position: 'relative', padding: '0 1rem' }}>
             {/* Background Line Connector */}
             <div style={{ 
               position: 'absolute', top: '50%', left: '3rem', right: '3rem', 
               height: '2px', background: 'var(--border)', zIndex: 0, transform: 'translateY(-50%)'
             }} />
             
             {workflowStages.map((stage, idx) => {
               const count = data?.by_state?.[stage.key] || 0;
               const isActive = count > 0;
               return (
                 <div key={stage.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, background: 'white', padding: '0 0.5rem' }}>
                   <div style={{ 
                     width: '40px', height: '40px', borderRadius: '12px',
                     background: isActive ? 'var(--primary-light)' : '#f8fafc',
                     border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
                     display: 'flex', alignItems: 'center', justifyContent: 'center',
                     color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                     marginBottom: '0.75rem',
                     transition: 'all 0.2s',
                     boxShadow: isActive ? '0 4px 6px -1px rgba(37,99,235,0.1)' : 'none'
                   }}>
                     {stage.icon}
                   </div>
                   <div style={{ fontWeight: 700, fontSize: '1.125rem', color: isActive ? 'var(--text-main)' : 'var(--text-muted)', lineHeight: 1, marginBottom: '0.25rem' }}>
                     {count}
                   </div>
                   <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                     {stage.label}
                   </div>
                 </div>
               );
             })}
          </div>
        </div>

        {/* Action Panel */}
        <div className="card" style={{ padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.25rem 1rem 1.25rem', borderBottom: '1px solid var(--border)', background: '#f8fafc' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', fontSize: '1rem', fontWeight: 600 }}>
              <AlertTriangle size={16} />
              Needs Attention
            </h3>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {recentExceptions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {recentExceptions.map((ex, index) => (
                  <div key={ex.id} style={{ 
                    padding: '1rem 1.25rem', 
                    borderBottom: index !== recentExceptions.length - 1 ? '1px solid var(--border)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  onClick={() => navigate(`/loads/${ex.id}`)}
                  >
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>Load #{ex.reference_number}</div>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.125rem 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ex.exception_reason || 'Verification Required'}
                      </p>
                    </div>
                    <ChevronRight size={16} color="var(--text-muted)" />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <p style={{ margin: '0 0 0.25rem 0', fontWeight: 600, color: 'var(--text-main)' }}>All Clear</p>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>No active exceptions found.</p>
              </div>
            )}
          </div>

          {recentExceptions.length > 0 && (
             <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', background: 'white' }}>
               <button 
                onClick={() => navigate('/exceptions')}
                style={{ 
                  width: '100%', 
                  padding: '0.625rem',
                  background: 'white', 
                  border: '1px solid var(--border)',
                  borderRadius: '0.375rem',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}
                >
                View All Exceptions <ArrowRight size={16} />
              </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
