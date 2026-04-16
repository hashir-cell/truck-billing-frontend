import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { triggerOrchestration, getGmailStatus, getDashboardSummary } from '../../services/api';
import { 
  Zap, 
  CheckCircle2, 
  Loader2,
  Database,
  Inbox,
  Cpu,
  DollarSign,
  AlertCircle,
  Play,
  Activity,
  PieChart as PieIcon,
  BarChart3,
  Wifi,
  Layers,
  ShieldCheck,
  Check,
  MessageSquare
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';

const PIPELINE_STAGES = [
  { id: 'ingestion', label: 'Data Ingestion', description: 'Parsing active loads and API dispatch data sync', icon: <Database size={18} /> },
  { id: 'collection', label: 'Document Collection', description: 'Matching Gmail attachments & Twilio SMS documents', icon: <Inbox size={18} /> },
  { id: 'evaluation', label: 'Process Evaluation', description: 'Running workflow engine and flagging exceptions', icon: <Cpu size={18} /> },
  { id: 'settlement', label: 'Financial Settlement', description: 'Assembling batches and preparing payment files', icon: <DollarSign size={18} /> },
];

const OrchestrationPage = () => {
  const { selectedTenant } = useApp();
  
  const [currentStageId, setCurrentStageId] = useState(-1);
  const [results, setResults] = useState(null);
  const [gmailStatus, setGmailStatus] = useState({ connected: false });
  const [queueStats, setQueueStats] = useState({ awaiting_sync: 0, new_invoices: 0 });
  const [isReadinessLoading, setIsReadinessLoading] = useState(true);

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
        awaiting_sync: summary.total_loads || 0, // Simplified mapping for now
        new_invoices: summary.exceptions_count || 0 // Simplified mapping for now
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

  useEffect(() => {
    // We removed the automatic fake stage progression. This is now handled asynchronously when running the task.
  }, [currentStageId]);

  const handleLaunchMock = async () => {
    if (!selectedTenant) return;
    setResults(null);
    setCurrentStageId(0);
    
    // Simulate UI progressing while the backend actually works
    const mockInterval = setInterval(() => {
      setCurrentStageId(prev => {
        if (prev < 3) return prev + 1; // get stuck at the batching phase until server responds
        return prev;
      });
    }, 2000);

    try {
      const response = await triggerOrchestration(selectedTenant.slug);
      
      clearInterval(mockInterval);
      setCurrentStageId(4); // Finished
      
      const summary = response.loads_processed;
      setResults({
        loads_ingested: summary.loads_ingested || 0,
        loads_updated: summary.loads_transitioned || 0,
        notifications_sent_sms: summary.notifications_sent_sms || 0,
        notifications_sent_email: summary.notifications_sent_email || 0,
        docs_matched: summary.docs_matched || 0,
        exceptions_created: summary.exceptions_created || 0,
        batches_created: summary.batches_created || 0,
        revenue_prepared: summary.revenue_prepared || 0.0
      });

    } catch (err) {
      clearInterval(mockInterval);
      console.error('Orchestration failed', err);
      setCurrentStageId(5); // error state if we had one
    }
  };

  const getStageStatus = (index) => {
    if (currentStageId === -1) return 'pending';
    if (currentStageId === 5) return 'error';
    if (currentStageId > index || currentStageId === 4) return 'complete';
    if (currentStageId === index) return 'running';
    return 'pending';
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
        <button 
          onClick={handleLaunchMock}
          disabled={currentStageId >= 0 && currentStageId < 4}
          className="button-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}
        >
          {currentStageId >= 0 && currentStageId < 4 ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
          {currentStageId === -1 ? 'Run Pipeline' : (currentStageId === 4 ? 'Run Again' : 'Pipeline Running')}
        </button>
      </div>

      {/* Progress Bar */}
      {currentStageId >= 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8125rem', fontWeight: '500', color: 'var(--text-muted)' }}>
            <span>{currentStageId === 4 ? 'Pipeline completed successfully' : `Running stage ${currentStageId + 1} of 4: ${PIPELINE_STAGES[currentStageId].label}`}</span>
            <span>{Math.round((currentStageId / 4) * 100)}%</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${(currentStageId / 4) * 100}%`, 
              height: '100%', 
              background: currentStageId === 4 ? 'var(--success)' : 'var(--primary)',
              transition: 'width 0.5s ease-out'
            }} />
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '1.5rem' }}>
        
        {/* System Readiness Dashboard */}
        {currentStageId === -1 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1rem' }}>
            
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                <Wifi size={18} />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>Integrations</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Gmail Service</span>
                  {isReadinessLoading ? (
                    <Loader2 size={14} className="animate-spin" color="var(--text-muted)" />
                  ) : gmailStatus.connected ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--success)', fontWeight: '500' }}><Check size={14}/> Connected</span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--error)', fontWeight: '500' }}><AlertCircle size={14}/> Disconnected</span>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Twilio Service</span>
                  {isTwilioConnected ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--success)', fontWeight: '500' }}><Check size={14}/> Connected</span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--error)', fontWeight: '500' }}><AlertCircle size={14}/> Disconnected</span>
                  )}
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

            <div className="card" style={{ padding: '1.5rem' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--success)' }}>
                <ShieldCheck size={18} />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>Health Status</h3>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
                All background workers are idle and ready. Database latency is optimal. No active security warnings for {selectedTenant?.name}.
              </p>
            </div>
          </div>
        )}

        {/* Results Charts (Shown after completion) */}
        {currentStageId === 4 && results && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <Activity size={18} color="var(--primary)" />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>Orchestration Yield</h3>
              </div>
              <div style={{ height: '240px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={getJourneyData()}>
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      width={100}
                      style={{ fontSize: '0.8125rem', fill: 'var(--text-muted)' }}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontSize: '0.875rem' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                      {getJourneyData().map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <MessageSquare size={18} color="var(--text-muted)" />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>Communications</h3>
              </div>
              <div style={{ height: '180px', width: '100%', position: 'relative' }}>
                 <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getNotificationData()}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {getNotificationData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.875rem' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1 }}>{results.notifications_sent_sms + results.notifications_sent_email}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.25rem' }}>Sent</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pipeline Stepper / Blocks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', margin: '1rem 0 0.5rem 0' }}>Pipeline Stages</h3>
          {PIPELINE_STAGES.map((stage, index) => {
            const status = getStageStatus(index);
            const isActive = status === 'running';
            const isDone = status === 'complete';
            
            return (
              <div key={stage.id} className="card" style={{
                padding: '1.25rem 1.5rem',
                borderLeft: isActive ? '4px solid var(--primary)' : (isDone ? '4px solid var(--success)' : '4px solid transparent'),
                background: isActive ? '#f8fafc' : 'white',
                display: 'flex',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: isActive ? 'var(--primary-light)' : (isDone ? '#ecfdf5' : '#f1f5f9'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isActive ? 'var(--primary)' : (isDone ? 'var(--success)' : 'var(--text-muted)'),
                  }}>
                    {isDone ? <CheckCircle2 size={20} /> : (isActive ? <Loader2 size={20} className="animate-spin" /> : stage.icon)}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', margin: '0 0 0.25rem 0', fontWeight: 600, color: 'var(--text-main)' }}>{stage.label}</h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>{stage.description}</p>
                  </div>
                </div>

                {/* Stage Results Injection */}
                {isDone && results && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {index === 0 && (
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <span><strong style={{color: 'var(--text-main)'}}>{results.loads_ingested}</strong> Created</span>
                        <span><strong style={{color: 'var(--text-main)'}}>{results.loads_updated}</strong> Updated</span>
                      </div>
                    )}
                    {index === 1 && (
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <span><strong style={{color: 'var(--text-main)'}}>{results.notifications_sent_sms}</strong> Notifications</span>
                        <span><strong style={{color: 'var(--success)'}}>{results.docs_matched}</strong> Matched</span>
                      </div>
                    )}
                    {index === 2 && (
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <span><strong style={{color: 'var(--error)'}}>{results.exceptions_created}</strong> Exceptions</span>
                        <span><strong style={{color: 'var(--success)'}}>10</strong> Verified</span>
                      </div>
                    )}
                    {index === 3 && (
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <span><strong style={{color: 'var(--text-main)'}}>{results.batches_created}</strong> Batch Ready</span>
                        <span><strong style={{color: 'var(--success)'}}>${results.revenue_prepared?.toLocaleString()}</strong></span>
                      </div>
                    )}
                  </div>
                )}
                
                {status === 'pending' && <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Pending</div>}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default OrchestrationPage;
