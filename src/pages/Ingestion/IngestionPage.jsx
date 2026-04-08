import React from 'react';
import FileUploader from '../../components/common/FileUploader';
import { ingestDispatch, ingestInvoice } from '../../services/api';
import { UploadCloud, CheckCircle2, History, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const IngestionPage = () => {
  const { selectedTenant } = useApp();
  const [history, setHistory] = React.useState([]);

  const addToHistory = (type, result) => {
    const newItem = {
      id: Date.now(),
      type,
      time: new Date().toLocaleTimeString(),
      status: 'Success',
      details: result.loads_ingested !== undefined 
        ? `${result.loads_ingested} loads processed` 
        : result.matched ? 'Document matched' : 'Upload finished'
    };
    setHistory(prev => [newItem, ...prev].slice(0, 5));
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2rem' }}>
          <UploadCloud size={32} color="var(--primary)" />
          Ingestion Center
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Managing data for <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{selectedTenant?.name}</span>
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 320px', 
        gap: '2rem',
        alignItems: 'start'
      }}>
        {/* Main Upload Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <FileUploader 
              title="Dispatch Synchronization" 
              subtitle="Drag & drop new dispatch sheets"
              onUpload={async (file) => {
                const res = await ingestDispatch(file);
                addToHistory('Dispatch', res);
                return res;
              }}
            />
            <FileUploader 
              title="Invoice Reconciliation" 
              subtitle="Upload invoice batch for matching"
              onUpload={async (file) => {
                const res = await ingestInvoice(file);
                addToHistory('Invoice', res);
                return res;
              }}
            />
          </div>

          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#fcfdff' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', marginBottom: '1rem' }}>
              <Info size={18} color="var(--primary)" />
              Ingestion Logic & Guidelines
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <h4 style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Dispatch Files</h4>
                <ul style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', paddingLeft: '1rem', lineHeight: '1.6' }}>
                  <li>Requires <strong>reference_number</strong> for matching.</li>
                  <li>Updates existing loads or creates new ones.</li>
                  <li>Transitions loads to <strong>DOCS_PENDING</strong>.</li>
                </ul>
              </div>
              <div>
                <h4 style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Invoice Files</h4>
                <ul style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', paddingLeft: '1rem', lineHeight: '1.6' }}>
                  <li>Requires <strong>invoice_amount</strong> and <strong>reference</strong>.</li>
                  <li>Matched loads move to <strong>INVOICE_READY</strong>.</li>
                  <li>Non-matches will flag an alert for review.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Activity */}
        <div className="card" style={{ padding: '1.25rem', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={16} />
            Recent Session Activity
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {history.length > 0 ? history.map(item => (
              <div key={item.id} style={{ 
                padding: '0.75rem', 
                borderRadius: '0.5rem', 
                backgroundColor: '#f8fafc',
                borderLeft: '3px solid var(--primary)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.75rem' }}>{item.type}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.time}</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.details}</p>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '0.8125rem' }}>No activity in this session.</p>
              </div>
            )}
          </div>
          
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>System Status</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></div>
              <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>Processors Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IngestionPage;
