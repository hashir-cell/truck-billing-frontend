import React, { useState, useEffect } from 'react';
import { getLoads } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { FileUp, Search, FileSearch } from 'lucide-react';
import DocumentUploadModal from '../../components/layout/DocumentUploadModal';

const LoadsPage = () => {
  const { selectedTenantId } = useApp();
  const navigate = useNavigate();
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoadDocs, setSelectedLoadDocs] = useState(null);

  useEffect(() => {
    const fetchLoads = async () => {
      setLoading(true);
      setError(null);
      setLoads([]);
      try {
        const data = await getLoads();
        setLoads(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    if (selectedTenantId) {
      fetchLoads();
    }
  }, [selectedTenantId, selectedLoadDocs === null]); // Refresh if modal closed

  const filteredLoads = Array.isArray(loads) ? loads.filter(load => 
    (load.reference_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (load.origin?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (load.destination?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (load.customer_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (load.broker_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  ) : [];

  if (loading) return <div style={{ padding: '2rem' }}>Loading loads...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'var(--error)' }}>Error: {error.message}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Loads Management</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
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
                  <button 
                    onClick={() => navigate(`/loads/${load.id}`)}
                    style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}
                  >
                    View Details
                  </button>
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
