import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { triggerOrchestration, getGmailStatus, getDashboardSummary, getRunStatus } from '../../services/api';
import { 
  Zap, 
  CheckCircle2, 
  Loader2,
  Wifi,
  Layers,
  Check,
  Bell,
  AlertCircle,
  Play,
  Activity
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';

const OrchestrationPage = () => {
  const { selectedTenant } = useApp();
  
  const [status, setStatus] = useState(() => localStorage.getItem('orch_status') || 'idle');
  const [results, setResults] = useState(() => {
    const saved = localStorage.getItem('orch_results');
    return saved ? JSON.parse(saved) : null;
  });
  const [gmailStatus, setGmailStatus] = useState({ connected: false });
  const [queueStats, setQueueStats] = useState({ awaiting_sync: 0, new_invoices: 0 });
  const [isReadinessLoading, setIsReadinessLoading] = useState(true);

  // Persist state changes
  useEffect(() => {
    localStorage.setItem('orch_status', status);
  }, [status]);

  useEffect(() => {
    if (results) localStorage.setItem('orch_results', JSON.stringify(results));
    else localStorage.removeItem('orch_results');
  }, [results]);

  // Resume polling on mount if needed
  useEffect(() => {
    const activeRunId = localStorage.getItem('orch_active_run_id');
    if (status === 'running' && activeRunId) {
      pollRunStatus(activeRunId).then(handleSuccess).catch(handleFailure);
    }
  }, []);

  const handleSuccess = (response) => {
    const summary = response.loads_processed;
    const newResults = {
      loads_ingested: summary.loads_ingested || 0,
      loads_updated: summary.loads_transitioned || 0,
      notifications_sent_sms: summary.notifications_sent_sms || 0,
      notifications_sent_email: summary.notifications_sent_email || 0,
      docs_matched: summary.docs_matched || 0,
      exceptions_created: summary.exceptions_created || 0,
      batches_created: summary.batches_created || 0,
      revenue_prepared: summary.revenue_prepared || 0.0
    };
    setResults(newResults);
    setStatus('success');
    localStorage.removeItem('orch_active_run_id');
    fetchReadiness();
  };

  const handleFailure = (err) => {
    console.error('Orchestration failed', err);
    setStatus('failed');
    localStorage.removeItem('orch_active_run_id');
  };

  const fetchReadiness = async () => {
    if (!selectedTenant) return;
    setIsReadinessLoading(true);
    try {
      const [gmail, summary] = await Promise.all([
        getGmailStatus(),
        getDashboardSummary()
      ]);
      setGmailStatus(gmail);
      setQueueStats({
        awaiting_sync: summary.total_loads || 0,
        new_invoices: summary.exceptions_count || 0
      });
    } catch (err) {
      console.error('Failed to fetch readiness data', err);
    } finally {
      setIsReadinessLoading(false);
    }
  };

  useEffect(() => {
    fetchReadiness();
  }, [selectedTenant]);

  const isTwilioConnected = !!(
    selectedTenant?.config?.twilio?.account_sid && 
    selectedTenant?.config?.twilio?.from_number
  );

  const getJourneyData = () => {
    if (!results) return [];
    return [
      { name: 'Raw Ingested', value: results.loads_ingested + results.loads_updated, color: '#3b82f6' },
      { name: 'Docs Matched', value: results.docs_matched, color: '#10b981' },
      { name: 'Verified', value: results.loads_ingested - results.exceptions_created, color: '#6366f1' },
      { name: 'Funded', value: results.batches_created * 10, color: '#8b5cf6' }
    ];
  };

  const getNotificationData = () => {
    if (!results) return [];
    return [
      { name: 'SMS Alerts', value: results.notifications_sent_sms, color: '#f59e0b' },
      { name: 'Email Reports', value: results.notifications_sent_email, color: '#3b82f6' }
    ];
  };

  const pollRunStatus = async (runId) => {
    let retryCount = 0;
    let pollCount = 0;
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          pollCount++;
          const statusRes = await getRunStatus(runId);
          console.log(`[Poll #${pollCount}] Status:`, statusRes.status);
          
          if (statusRes.status === 'completed' || statusRes.status === 'success') {
            console.log('Orchestration finished successfully:', statusRes);
            clearInterval(interval);
            resolve(statusRes);
          } else if (statusRes.status === 'failed') {
            console.error('Orchestration reported failure:', statusRes);
            clearInterval(interval);
            reject(new Error('Run reported failure on server'));
          }
          retryCount = 0; // Reset network retry count on successful response
        } catch (err) {
          retryCount++;
          console.warn(`[Poll #${pollCount}] Network attempt ${retryCount} failed:`, err.message);
          if (retryCount > 20) { // Allow 1 minute of total network failure (20 * 3s)
            clearInterval(interval);
            reject(new Error('Persistent network error while polling status'));
          }
        }
        
        // Safety timeout: If it takes more than 10 minutes (200 polls), fail it.
        if (pollCount > 200) {
          clearInterval(interval);
          reject(new Error('Orchestration timed out after 10 minutes'));
        }
      }, 3000);
    });
  };

  const handleLaunch = async () => {
    if (!selectedTenant) return;
    setResults(null);
    setStatus('running');
    
    try {
      const initialResponse = await triggerOrchestration(selectedTenant.slug);
      
      if (initialResponse.status === 'accepted') {
        localStorage.setItem('orch_active_run_id', initialResponse.run_id);
        pollRunStatus(initialResponse.run_id).then(handleSuccess).catch(handleFailure);
      } else {
        handleSuccess(initialResponse);
      }
    } catch (err) {
      handleFailure(err);
    }
  };

  return (
    <div className="animate-in" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            System Orchestration
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
            Execute the automated billing pipeline for {selectedTenant?.name || 'your organization'}.
          </p>
        </div>
        {status !== 'running' && (
          <button 
            onClick={handleLaunch}
            className={status === 'failed' ? "button-danger" : "button-primary"}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              fontSize: '0.875rem',
              backgroundColor: status === 'failed' ? '#ef4444' : undefined
            }}
          >
            {status === 'idle' ? <Play size={16} /> : (status === 'failed' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />)}
            {status === 'idle' ? 'Run Pipeline' : (status === 'failed' ? 'Retry Pipeline' : 'Run Again')}
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '1.5rem' }}>
        
        {/* Running State */}
        {status === 'running' && (
          <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ position: 'relative' }}>
              <Loader2 size={64} className="animate-spin" color="var(--primary)" />
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <Zap size={24} color="var(--primary)" fill="var(--primary)" />
              </div>
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Pipeline Processing</h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>
                We are currently ingesting documents, matching loads, and evaluating financial discrepancies. This may take a minute...
              </p>
            </div>
            <div style={{ width: '100%', maxWidth: '300px', height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
              <div className="animate-shimmer" style={{ 
                width: '100%', 
                height: '100%', 
                background: 'linear-gradient(90deg, var(--primary) 0%, #60a5fa 50%, var(--primary) 100%)',
                backgroundSize: '200% 100%'
              }} />
            </div>
            <button 
              onClick={() => {
                const activeRunId = localStorage.getItem('orch_active_run_id');
                if (activeRunId) {
                  getRunStatus(activeRunId).then(handleSuccess).catch(handleFailure);
                } else {
                  setStatus('idle');
                }
              }}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: 'var(--primary)', 
                fontSize: '0.75rem', 
                fontWeight: 600, 
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Still loading? Force refresh status
            </button>
          </div>
        )}

        {/* Failed State */}
        {status === 'failed' && (
          <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', borderLeft: '4px solid #ef4444' }}>
            <div style={{ display: 'inline-flex', padding: '1rem', background: '#fee2e2', borderRadius: '50%', color: '#ef4444', marginBottom: '1.5rem' }}>
              <AlertCircle size={48} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Execution Failed</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto', marginBottom: '2rem' }}>
              Something went wrong during the background run. Please check your connection or contact support if the issue persists.
            </p>
            <button onClick={handleLaunch} className="button-primary">Try Again Now</button>
          </div>
        )}

        {/* Readiness Dashboard (Only if idle or failed) */}
        {(status === 'idle' || status === 'failed') && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                <Wifi size={18} />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>Integrations</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Gmail Service</span>
                  {isReadinessLoading ? <Loader2 size={14} className="animate-spin" /> : (gmailStatus.connected ? <span style={{ color: 'var(--success)' }}>Connected</span> : <span style={{ color: 'var(--error)' }}>Disconnected</span>)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Twilio Service</span>
                  {isTwilioConnected ? <span style={{ color: 'var(--success)' }}>Connected</span> : <span style={{ color: 'var(--error)' }}>Disconnected</span>}
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#f59e0b' }}>
                <Layers size={18} />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>Work Queue</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--text-main)' }}>{isReadinessLoading ? '...' : queueStats.awaiting_sync}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Active Loads</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--text-main)' }}>{isReadinessLoading ? '...' : queueStats.new_invoices}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Exceptions</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Charts (Shown after success) */}
        {status === 'success' && results && (
          <div className="animate-in">
             <div className="card" style={{ padding: '2rem', textAlign: 'center', marginBottom: '1.5rem', background: 'linear-gradient(to right, #f0fdf4, #ffffff)', border: '1px solid #dcfce7' }}>
                <div style={{ display: 'inline-flex', padding: '0.75rem', background: '#dcfce7', borderRadius: '50%', color: 'var(--success)', marginBottom: '1rem' }}>
                  <CheckCircle2 size={32} />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Execution Successful</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  Processed <strong>{results.loads_ingested + results.loads_updated}</strong> shipments and matched <strong>{results.docs_matched}</strong> documents.
                </p>
             </div>

             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                <div className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <Activity size={18} color="var(--primary)" />
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>Orchestration Yield</h3>
                  </div>
                  <div style={{ height: '240px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={getJourneyData()}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} style={{ fontSize: '0.8125rem', fill: 'var(--text-muted)' }} />
                        <Tooltip cursor={{ fill: '#f8fafc' }} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                          {getJourneyData().map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <Bell size={18} color="var(--text-muted)" />
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>Automated Alerts</h3>
                  </div>
                  <div style={{ height: '200px', width: '100%', position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={getNotificationData()} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                          {getNotificationData().map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-main)' }}>{results.notifications_sent_sms + results.notifications_sent_email}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sent</div>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        )}

      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default OrchestrationPage;
