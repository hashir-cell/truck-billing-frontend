import React, { useState, useEffect } from 'react';
import { triggerOrchestration, getRunStatus } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { 
  Zap, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Package,
  FileText,
  AlertTriangle,
  History
} from 'lucide-react';

const OrchestrationPage = () => {
  const { selectedTenant } = useApp();
  const [status, setStatus] = useState('idle'); // idle, running, success, error
  const [runId, setRunId] = useState(null);
  const [results, setResults] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleTrigger = async () => {
    if (!selectedTenant) return;
    
    setStatus('running');
    setErrorMsg(null);
    setResults(null);
    
    try {
      const data = await triggerOrchestration(selectedTenant.slug);
      setRunId(data.run_id);
      setResults(data.loads_processed);
      setStatus('success');
    } catch (err) {
      console.error("Orchestration failed:", err);
      setErrorMsg(err.response?.data?.detail || "System failed to trigger orchestration run.");
      setStatus('error');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '64px', 
          height: '64px', 
          borderRadius: '20px', 
          backgroundColor: 'var(--primary-light)', 
          color: 'var(--primary)',
          marginBottom: '1.5rem'
        }}>
          <Zap size={32} fill="currentColor" />
        </div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Billing Orchestration</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>
          Execute holistic billing logic for <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{selectedTenant?.name}</span>
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        {/* Main Action Card */}
        <div className="card" style={{ 
          padding: '3rem', 
          textAlign: 'center', 
          border: '2px solid' + (status === 'running' ? ' var(--primary)' : ' var(--border)'),
          transition: 'all 0.3s ease'
        }}>
          {status === 'idle' && (
            <>
              <h2 style={{ marginBottom: '1.5rem' }}>Ready to Process?</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
                This will trigger the full billing engine to synchronize dispatches, match documents, and detect exceptions for the current tenant.
              </p>
              <button 
                onClick={handleTrigger}
                className="button-primary"
                style={{ 
                  padding: '1rem 2.5rem', 
                  fontSize: '1.125rem', 
                  borderRadius: '0.75rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <Activity size={20} />
                Launch Orchestration Run
              </button>
            </>
          )}

          {status === 'running' && (
            <div style={{ padding: '2rem' }}>
              <Loader2 size={48} className="animate-spin" color="var(--primary)" style={{ margin: '0 auto 1.5rem' }} />
              <h2 style={{ marginBottom: '0.5rem' }}>Orchestration in Progress</h2>
              <p style={{ color: 'var(--text-muted)' }}>Executing core billing loops and data synchronization...</p>
            </div>
          )}

          {status === 'success' && (
            <div>
              <CheckCircle2 size={48} color="var(--success)" style={{ margin: '0 auto 1.5rem' }} />
              <h2 style={{ marginBottom: '0.5rem' }}>Run Completed Successfully</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Billing engine has finished processing for {selectedTenant?.name}.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
                <MetricCard title="Ingested" count={results?.loads_ingested} icon={<Package size={18} />} color="#3b82f6" />
                <MetricCard title="MatchedDocs" count={results?.docs_matched} icon={<FileText size={18} />} color="#10b981" />
                <MetricCard title="Exceptions" count={results?.exceptions_created} icon={<AlertTriangle size={18} />} color="#f59e0b" />
                <MetricCard title="Batches" count={results?.batches_created} icon={<History size={18} />} color="#8b5cf6" />
              </div>

              <button 
                onClick={() => setStatus('idle')}
                style={{ 
                  background: 'none', border: '1px solid var(--border)', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600'
                }}>
                New Orchestration Run
              </button>
            </div>
          )}

          {status === 'error' && (
            <div style={{ padding: '2rem' }}>
              <AlertCircle size={48} color="var(--error)" style={{ margin: '0 auto 1.5rem' }} />
              <h2 style={{ marginBottom: '0.5rem' }}>Orchestration Failed</h2>
              <p style={{ color: 'var(--error)', marginBottom: '2rem' }}>{errorMsg}</p>
              <button onClick={handleTrigger} className="button-primary" style={{ padding: '0.75rem 1.5rem' }}>Retry Run</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, count, icon, color }) => (
  <div style={{ 
    padding: '1.25rem', 
    backgroundColor: '#f8fafc', 
    borderRadius: '0.75rem', 
    border: '1px solid var(--border)',
    textAlign: 'left'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: color, marginBottom: '0.5rem' }}>
      {icon}
      <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>{title}</span>
    </div>
    <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{count || 0}</div>
  </div>
);

export default OrchestrationPage;
