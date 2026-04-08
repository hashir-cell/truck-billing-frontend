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
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { selectedTenantId } = useApp();
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
        setRecentExceptions(loads.slice(0, 3));
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    if (selectedTenantId) {
      fetchDashboard();
    }
  }, [selectedTenantId]);

  if (!selectedTenantId) return (
    <div style={{ padding: '4rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '1rem', border: '2px dashed var(--border)' }}>
      <Truck size={48} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
      <h3 style={{ color: 'var(--text-main)' }}>No Tenant Selected</h3>
      <p style={{ color: 'var(--text-muted)' }}>Please select a tenant from the sidebar to view the Command Center.</p>
    </div>
  );

  if (loading) return (
    <div style={{ padding: '4rem', textAlign: 'center' }}>
      <div className="pulse" style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <Loader2 size={32} className="animate-spin" color="var(--primary)" />
        <span>Synchronizing Command Center...</span>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--error)' }}>
      <AlertTriangle size={48} style={{ marginBottom: '1rem' }} />
      <h3>Error Loading Dashboard</h3>
      <p>{error.message || 'Failed to fetch dashboard summary.'}</p>
      <button onClick={() => window.location.reload()} style={{ marginTop: '1rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--error)', color: 'var(--error)', cursor: 'pointer' }}>Retry</button>
    </div>
  );

  const workflowStages = [
    { label: 'Dispatch', key: 'DELIVERED', icon: <Truck size={18} /> },
    { label: 'Documents', key: 'DOCS_PENDING', icon: <Clock size={18} /> },
    { label: 'Invoiced', key: 'INVOICE_READY', icon: <FileText size={18} /> },
    { label: 'Batched', key: 'BATCH_READY', icon: <Layers size={18} /> },
    { label: 'Paid', key: 'PAID', icon: <CheckCircle2 size={18} /> }
  ];

  return (
    <div className="animate-in">
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Command Center</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>SaaS Intelligence & Billing Monitor</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'white', borderRadius: '2rem', border: '1px solid var(--border)', fontSize: '0.8125rem', fontWeight: '600' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }} />
            System Live
          </div>
        </div>
      </div>

      {/* Primary Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem', marginBottom: '2.5rem' }}>
        <div className="stat-card-premium">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Truck size={24} />
          </div>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Shipments</h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginTop: '0.75rem' }}>
            <span style={{ fontSize: '2.25rem', fontWeight: '900', letterSpacing: '-0.02em' }}>{data?.total_loads || 0}</span>
            <div style={{ fontSize: '0.8125rem', color: 'var(--success)', fontWeight: '700', padding: '0.25rem 0.5rem', background: '#ecfdf5', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <ArrowUpRight size={14} /> 12%
            </div>
          </div>
        </div>

        <div className="stat-card-premium" onClick={() => navigate('/exceptions')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={24} />
          </div>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Operational Blocks</h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginTop: '0.75rem' }}>
            <span style={{ fontSize: '2.25rem', fontWeight: '900', color: (data?.exceptions_count > 0 ? 'var(--error)' : 'inherit'), letterSpacing: '-0.02em' }}>
              {data?.exceptions_count || 0}
            </span>
            {data?.exceptions_count > 0 && (
              <span className="pulse" style={{ fontSize: '0.75rem', color: 'var(--error)', fontWeight: '800', textTransform: 'uppercase' }}>Requires Attention</span>
            )}
          </div>
        </div>

        <div className="stat-card-premium">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={24} />
          </div>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pipeline Volume</h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginTop: '0.75rem' }}>
            <span style={{ fontSize: '2.25rem', fontWeight: '900', letterSpacing: '-0.02em' }}>
              ${data?.total_revenue?.toLocaleString() || '0.00'}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.75rem' }}>
        {/* Workflow Pulse */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.125rem', fontWeight: '800' }}>
              <Clock size={20} color="var(--primary)" />
              Billing Velocity Path
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Updated 1m ago</span>
          </div>
          
          <div className="workflow-tracker">
             {/* Background Connector */}
             <div style={{ 
               position: 'absolute', top: '50px', left: '10%', right: '10%', 
               height: '3px', background: 'var(--border)', zIndex: 0,
               borderRadius: '4px'
             }}>
               {/* Progress Fill */}
               <div style={{ width: '65%', height: '100%', background: 'var(--primary)', borderRadius: '4px', opacity: 0.3 }} />
             </div>
             
             {workflowStages.map((stage, idx) => {
               const count = data?.by_state?.[stage.key] || 0;
               return (
                 <div key={stage.key} className={`workflow-node ${count > 0 ? 'active' : ''}`}>
                   <div className="node-circle">
                     {stage.icon}
                   </div>
                   <div style={{ fontWeight: '900', fontSize: '1.25rem', color: count > 0 ? 'var(--primary)' : 'var(--text-main)' }}>{count}</div>
                   <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.5rem' }}>
                     {stage.label}
                   </div>
                 </div>
               );
             })}
          </div>
        </div>

        {/* Attention Panel */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--error)', fontSize: '1.125rem', fontWeight: '800' }}>
            <AlertTriangle size={20} />
            Critical Intercepts
          </h3>
          <div style={{ flex: 1 }}>
            {recentExceptions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recentExceptions.map(ex => (
                  <div key={ex.id} style={{ 
                    padding: '1rem', 
                    backgroundColor: 'var(--error-bg)', 
                    borderRadius: '1rem',
                    border: '1px solid rgba(239, 68, 68, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '0.75rem', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--error)', boxShadow: '0 4px 6px rgba(239, 68, 68, 0.1)' }}>
                      <FileText size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '800', fontSize: '0.875rem' }}>Load #{ex.reference_number}</div>
                      <p style={{ fontSize: '0.75rem', color: '#991b1b', marginTop: '0.125rem', fontWeight: '600' }}>{ex.exception_reason || 'Manual Verification Required'}</p>
                    </div>
                    <ChevronRight size={18} color="#991b1b" />
                  </div>
                ))}
                <button 
                  onClick={() => navigate('/exceptions')}
                  className="nav-link"
                  style={{ 
                    width: '100%', 
                    marginTop: '0.5rem', 
                    background: 'white', 
                    border: '1px solid var(--border)',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: '700'
                  }}>
                  View Resolution Center
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <div style={{ marginBottom: '1.5rem', position: 'relative', display: 'inline-block' }}>
                  <CheckCircle2 size={56} color="var(--success)" style={{ opacity: 0.2 }} />
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80px', height: '80px', borderRadius: '50%', border: '2px solid var(--success)', opacity: 0.1 }} />
                </div>
                <p style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: '700' }}>Clear Operations</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>All load checkpoints are verified.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
