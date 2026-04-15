import React, { useState, useEffect } from 'react';
import { getLoads, deleteLoad, assembleBatch } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { FileUp, Search, FileSearch, Trash2, Box, Loader2 } from 'lucide-react';
import DocumentUploadModal from '../../components/layout/DocumentUploadModal';

const LoadsPage = () => {
  const { selectedTenantId } = useApp();
  const navigate = useNavigate();
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [batching, setBatching] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoadDocs, setSelectedLoadDocs] = useState(null);

  const fetchLoads = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLoads();
      setLoads(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTenantId) {
      fetchLoads();
    }
  }, [selectedTenantId, selectedLoadDocs === null]); // Refresh if modal closed

  const handleDeleteLoad = async (loadId) => {
    if (window.confirm('Are you sure you want to delete this load?')) {
      try {
        await deleteLoad(loadId);
        await fetchLoads();
      } catch (err) {
        alert('Failed to delete load: ' + (err.response?.data?.detail || err.message));
      }
    }
  };

  const handleAssembleBatch = async () => {
    setBatching(true);
    try {
      const res = await assembleBatch();
      alert(`Successfully assembled batch ${res.batch_number} with ${res.invoice_count} invoices.`);
      await fetchLoads();
    } catch (err) {
      alert('Failed to assemble batch: ' + (err.response?.data?.detail || err.message));
    } finally {
      setBatching(false);
    }
  };

  const filteredLoads = Array.isArray(loads) ? loads.filter(load => 
    (load.reference_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (load.origin?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (load.destination?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (load.customer_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (load.broker_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  ) : [];

  if (loading && loads.length === 0) return <div style={{ padding: '2rem' }}>Loading loads...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'var(--error)' }}>Error: {error.message}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Loads Management</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={handleAssembleBatch}
            disabled={batching}
            className="button-secondary" 
            style={{ 
              backgroundColor: 'var(--success-bg)', 
              color: 'var(--success)', 
              border: '1px solid var(--success)', 
              padding: '0.625rem 1.25rem', 
              borderRadius: '0.5rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {batching ? <Loader2 size={18} className="animate-spin" /> : <Box size={18} />}
            Batch Ready Loads
          </button>
          
          <button 
            onClick={() => navigate('/ingestion')}
            className="button-secondary" 
            style={{ 
              backgroundColor: 'white', 
              color: 'var(--primary)', 
              border: '1px solid var(--primary)', 
              padding: '0.625rem 1.25rem', 
              borderRadius: '0.5rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <FileUp size={18} />
            Sync Dispatch
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
        <div style={{ 
          position: 'absolute', 
          left: '1rem', 
          top: '50%', 
          transform: 'translateY(-50%)', 
          color: 'var(--text-muted)' 
        }}>
          <Search size={18} />
        </div>
        <input 
          type="text" 
          placeholder="Search by reference, customer, or route..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '0.75rem 1rem 0.75rem 3rem', 
            borderRadius: '0.5rem', 
            border: '1px solid var(--border)', 
            fontSize: '0.875rem',
            outline: 'none',
            transition: 'border-color 0.2s ease'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
        />
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1rem' }}>Reference #</th>
              <th style={{ padding: '1rem' }}>Customer / Broker</th>
              <th style={{ padding: '1rem' }}>Destination</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Documents</th>
              <th style={{ padding: '1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLoads.map((load) => (
              <tr key={load.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--primary)' }}>
                  #{load.reference_number || 'N/A'}
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: '500' }}>{load.customer_name || 'Generic Customer'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{load.broker_name || 'N/A'}</div>
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-main)', fontSize: '0.875rem', fontWeight: '500' }}>
                  {load.destination || 'Unknown'}
                </td>
                <td style={{ padding: '1rem' }}>
                  <StatusBadge status={load.state} />
                </td>
                <td style={{ padding: '1rem' }}>
                  <button 
                    onClick={() => setSelectedLoadDocs(load)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.4rem', 
                      background: 'none', 
                      border: 'none', 
                      color: 'var(--primary)', 
                      cursor: 'pointer',
                      fontSize: '0.8125rem',
                      fontWeight: '700'
                    }}
                  >
                    <FileSearch size={16} />
                    Upload
                  </button>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button 
                      onClick={() => navigate(`/loads/${load.id}`)}
                      style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '0.875rem' }}
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => handleDeleteLoad(load.id)}
                      style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredLoads.length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  {searchTerm ? `No loads matching "${searchTerm}"` : 'No loads found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <DocumentUploadModal 
        load={selectedLoadDocs} 
        onClose={() => setSelectedLoadDocs(null)} 
      />
    </div>
  );
};

export default LoadsPage;
