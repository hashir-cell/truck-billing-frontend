import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLoad, transitionLoad, updateLoad } from '../../services/api';
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  Calendar, 
  DollarSign, 
  FileText, 
  History, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Loader2,
  MoreVertical,
  Plus,
  Edit2,
  Save,
  XCircle
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import DocumentUploadModal from '../../components/layout/DocumentUploadModal';

const LoadDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [load, setLoad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchLoadData = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const data = await getLoad(id);
      setLoad(data);
      setError(null);
    } catch (err) {
      if (isInitial) setError('Failed to load shipment details.');
      console.error('Real-time sync error:', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoadData(true);

    // Setup real-time polling (every 5 seconds) - but only if not editing
    let interval;
    if (!isEditing) {
      interval = setInterval(() => {
        fetchLoadData(false);
      }, 5000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [id, isEditing]);

  const handleStartEdit = () => {
    setEditedData({
      origin: load.origin || '',
      destination: load.destination || '',
      customer_name: load.customer_name || '',
      broker_name: load.broker_name || '',
      total_revenue: load.total_revenue || 0,
      invoice_amount: load.invoice_amount || 0,
      invoice_number: load.invoice_number || ''
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedData({});
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await updateLoad(id, editedData);
      await fetchLoadData(true);
      setIsEditing(false);
      setEditedData({});
    } catch (err) {
      alert('Failed to update load: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <Loader2 size={40} className="animate-spin" color="var(--primary)" />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Retrieving deep-dive data...</p>
      </div>
    );
  }

  if (error || !load) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
        <AlertTriangle size={48} color="var(--error)" style={{ margin: '0 auto 1rem' }} />
        <h3>Error Loading Shipment</h3>
        <p style={{ color: 'var(--text-muted)' }}>{error || "Shipment not found."}</p>
        <button className="button-primary" style={{ marginTop: '1.5rem' }} onClick={() => navigate('/loads')}>
          Back to Loads
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.4s ease-out' }}>
      {/* Header / Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate('/loads')}
          style={{ 
            padding: '0.5rem', 
            borderRadius: '0.5rem', 
            border: '1px solid var(--border)', 
            backgroundColor: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Load #{load.reference_number}</h1>
              <StatusBadge status={load.state} />
            </div>

            {!isEditing ? (
              <button 
                onClick={handleStartEdit}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border)',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--text-main)',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <Edit2 size={16} />
                Edit Shipment
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={handleSaveEdit}
                  disabled={saving}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    backgroundColor: 'var(--success)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)'
                  }}
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save
                </button>
                <button 
                  onClick={handleCancelEdit}
                  disabled={saving}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--border)',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'var(--error)'
                  }}
                >
                  <XCircle size={16} />
                  Cancel
                </button>
              </div>
            )}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            System ID: <span style={{ fontFamily: 'monospace' }}>{load.id}</span>
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Main Content Pane */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Detailed Info Grid */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={20} color="var(--primary)" />
              Shipment Specifics
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={labelStyle}><MapPin size={14} /> Origin</label>
                  {isEditing ? (
                    <input 
                      style={inputStyle}
                      value={editedData.origin}
                      onChange={(e) => handleInputChange('origin', e.target.value)}
                    />
                  ) : (
                    <p style={valueStyle}>{load.origin || "N/A"}</p>
                  )}
                </div>
                <div>
                  <label style={labelStyle}><MapPin size={14} /> Destination</label>
                  {isEditing ? (
                    <input 
                      style={inputStyle}
                      value={editedData.destination}
                      onChange={(e) => handleInputChange('destination', e.target.value)}
                    />
                  ) : (
                    <p style={valueStyle}>{load.destination || "N/A"}</p>
                  )}
                </div>
              </div>
              <div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={labelStyle}><Calendar size={14} /> Delivery Date</label>
                  <p style={valueStyle}>{load.delivery_date ? new Date(load.delivery_date).toLocaleDateString() : "Pending"}</p>
                </div>
                <div>
                  <label style={labelStyle}><Clock size={14} /> Broker / Customer</label>
                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <input 
                        style={inputStyle}
                        placeholder="Customer Name"
                        value={editedData.customer_name}
                        onChange={(e) => handleInputChange('customer_name', e.target.value)}
                      />
                      <input 
                        style={inputStyle}
                        placeholder="Broker Name"
                        value={editedData.broker_name}
                        onChange={(e) => handleInputChange('broker_name', e.target.value)}
                      />
                    </div>
                  ) : (
                    <p style={valueStyle}>{load.customer_name || load.broker_name || "Unknown"}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Financials Deep Dive */}
          <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <DollarSign size={20} color="#059669" />
              Financial Breakdown
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              <div style={finItemStyle}>
                <span style={labelStyle}>Total Revenue</span>
                {isEditing ? (
                  <input 
                    type="number"
                    style={inputStyle}
                    value={editedData.total_revenue}
                    onChange={(e) => handleInputChange('total_revenue', parseFloat(e.target.value))}
                  />
                ) : (
                  <span style={{ ...valueStyle, fontSize: '1.25rem', color: '#059669' }}>${load.total_revenue?.toLocaleString() || '0.00'}</span>
                )}
              </div>
              <div style={finItemStyle}>
                <span style={labelStyle}>Invoice Amount</span>
                {isEditing ? (
                  <input 
                    type="number"
                    style={inputStyle}
                    value={editedData.invoice_amount}
                    onChange={(e) => handleInputChange('invoice_amount', parseFloat(e.target.value))}
                  />
                ) : (
                  <span style={{ ...valueStyle, fontSize: '1.25rem', color: 'var(--primary)' }}>${load.invoice_amount?.toLocaleString() || '0.00'}</span>
                )}
              </div>
              <div style={finItemStyle}>
                <span style={labelStyle}>Billed Invoice #</span>
                {isEditing ? (
                  <input 
                    style={inputStyle}
                    value={editedData.invoice_number}
                    onChange={(e) => handleInputChange('invoice_number', e.target.value)}
                  />
                ) : (
                  <span style={{ ...valueStyle, fontSize: '1.25rem' }}>{load.invoice_number || "—"}</span>
                )}
              </div>
            </div>
          </div>

          {/* Document Vault */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={20} color="var(--primary)" />
                Document Vault
              </h3>
              <button 
                className="button-primary" 
                style={{ 
                  fontSize: '0.75rem', 
                  padding: '0.5rem 1rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem',
                  background: '#f8fafc',
                  border: '1px solid var(--border)',
                  color: 'var(--primary)',
                  borderRadius: '0.5rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary-bg)';
                  e.currentTarget.style.borderColor = 'var(--primary)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
                onClick={() => setShowUploadModal(true)}
              >
                <Plus size={14} /> Add Document
              </button>
            </div>
            
            {load.documents?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {load.documents.map(doc => (
                  <div key={doc.id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '0.85rem',
                    borderRadius: '0.625rem',
                    backgroundColor: '#f8fafc',
                    border: '1px solid var(--border)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ backgroundColor: 'white', padding: '0.5rem', borderRadius: '0.4rem', border: '1px solid var(--border)' }}>
                        <FileText size={18} color="var(--primary)" />
                      </div>
                      <div>
                        <p style={{ fontWeight: '700', fontSize: '0.875rem' }}>{doc.doc_type}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Uploaded {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}>
                      <ExternalLink size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#f9fbfd', borderRadius: '0.75rem', border: '2px dashed var(--border)' }}>
                <FileText size={32} color="#cbd5e1" style={{ marginBottom: '0.75rem' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No documents found for this load.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar / Audit Trail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Quick Actions */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '800', marginBottom: '1rem' }}>Operator Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button 
                className="button-primary" 
                style={{ 
                  width: '100%', 
                  background: 'linear-gradient(135deg, var(--primary) 0%, #1e40af 100%)',
                  color: 'white', 
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2), 0 2px 4px -2px rgba(37, 99, 235, 0.1)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  fontWeight: '700'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(37, 99, 235, 0.3), 0 4px 6px -4px rgba(37, 99, 235, 0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(37, 99, 235, 0.2), 0 2px 4px -2px rgba(37, 99, 235, 0.1)';
                }}
                onClick={() => setShowUploadModal(true)}
              >
                <Plus size={18} />
                Ingest Supporting Docs
              </button>
              {load.state === 'EXCEPTION' && (
                <button 
                  className="button-primary" 
                  style={{ width: '100%', backgroundColor: 'var(--error)', color: 'white', borderRadius: '0.5rem' }}
                  onClick={() => navigate('/exceptions')}
                >
                  Resolve Exception
                </button>
              )}
            </div>
          </div>

          {/* Audit Trail Timeline */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={18} />
              Full Lifecycle Flow
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
              {/* Vertical Line */}
              <div style={{ position: 'absolute', left: '10px', top: '5px', bottom: '5px', width: '2px', backgroundColor: '#f1f5f9' }}></div>
              
              {[
                { key: 'DELIVERED', label: 'Delivery Verified' },
                { key: 'DOCS_PENDING', label: 'Document Collection' },
                { key: 'INVOICE_READY', label: 'Invoice Prepared' },
                { key: 'BATCH_READY', label: 'Batch Inclusion' },
                { key: 'PAID', label: 'Payment Settled' }
              ].map((stage, idx, arr) => {
                const historyItem = load.state_history?.find(h => h.to_state === stage.key);
                const isCurrent = load.state === stage.key;
                const isPast = load.state_history?.some(h => h.to_state === stage.key) || 
                             (idx < arr.findIndex(s => s.key === load.state) && load.state !== 'EXCEPTION');
                
                const getStatusColor = () => {
                  if (isCurrent) return 'var(--primary)';
                  if (isPast) return '#10b981'; // Success Green
                  return '#e2e8f0'; // Muted
                };

                return (
                  <div key={stage.key} style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1, opacity: isPast || isCurrent ? 1 : 0.5 }}>
                    <div style={{ 
                      width: '22px', 
                      height: '22px', 
                      borderRadius: '50%', 
                      backgroundColor: isCurrent ? 'white' : getStatusColor(),
                      border: `2px solid ${getStatusColor()}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isCurrent ? `0 0 0 4px rgba(37, 99, 235, 0.1)` : 'none',
                      transition: 'all 0.3s'
                    }}>
                      {isPast ? <CheckCircle2 size={12} color="white" /> : (isCurrent && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}></div>)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '700', fontSize: '0.8125rem', color: isCurrent ? 'var(--primary)' : 'var(--text-main)' }}>
                        {stage.label}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {isCurrent ? 'Currently in this stage' : 
                         historyItem ? (historyItem.reason || "Stage successfully completed") : 
                         isPast ? "Verified and processed" : "Pending completion"}
                      </p>
                      {(historyItem || (idx === 0 && !historyItem)) && (
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontFamily: 'monospace' }}>
                          {historyItem ? new Date(historyItem.created_at).toLocaleString() : new Date(load.created_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

              {load.state === 'EXCEPTION' && (
                <div style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1, marginTop: '0.5rem' }}>
                  <div style={{ 
                    width: '22px', 
                    height: '22px', 
                    borderRadius: '50%', 
                    backgroundColor: 'white',
                    border: '2px solid var(--error)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 0 4px rgba(239, 68, 68, 0.1)'
                  }}>
                    <AlertTriangle size={12} color="var(--error)" />
                  </div>
                  <div>
                    <p style={{ fontWeight: '700', fontSize: '0.8125rem', color: 'var(--error)' }}>EXCEPTION: Manual Review</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--error)' }}>{load.exception_reason}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showUploadModal && (
        <DocumentUploadModal 
          load={load} 
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={() => {
            setShowUploadModal(false);
            fetchLoadData();
          }}
        />
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

const labelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  fontSize: '0.75rem',
  fontWeight: '600',
  color: 'var(--text-muted)',
  marginBottom: '0.35rem',
  textTransform: 'uppercase',
  letterSpacing: '0.025em'
};

const valueStyle = {
  fontSize: '1rem',
  fontWeight: '700',
  color: 'var(--text-main)'
};

const finItemStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
  padding: '1rem',
  backgroundColor: 'white',
  borderRadius: '0.75rem',
  border: '1px solid var(--border)'
};

const inputStyle = {
  width: '100%',
  padding: '0.625rem 0.875rem',
  borderRadius: '0.5rem',
  border: '1px solid var(--border)',
  fontSize: '0.875rem',
  fontWeight: '500',
  outline: 'none',
  backgroundColor: 'white',
  transition: 'all 0.2s',
  borderColor: 'var(--primary-light)'
};

export default LoadDetailsPage;
