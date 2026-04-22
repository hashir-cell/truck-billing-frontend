import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import FileUploader from '../../components/common/FileUploader';
import { publicUploadDocument, getPublicLoadDetails, addPublicLoadNote } from '../../services/api';
import { 
  Package, 
  MapPin, 
  Calendar, 
  FileText, 
  Clock, 
  CheckCircle, 
  Truck, 
  AlertTriangle,
  Loader2,
  Info,
  MessageSquare,
  Send,
  User
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

const DriverUploadPage = () => {
  const { token } = useParams();
  const [docType, setDocType] = useState('POD');
  const [isSuccess, setIsSuccess] = useState(false);
  const [load, setLoad] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Note related state
  const [newNote, setNewNote] = useState("");
  const [postingNote, setPostingNote] = useState(false);

  const fetchLoadData = useCallback(async () => {
    try {
      const data = await getPublicLoadDetails(token);
      setLoad(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid or expired link");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchLoadData();
  }, [fetchLoadData]);

  const handlePostNote = async () => {
    if (!newNote.trim()) return;
    setPostingNote(true);
    try {
      await addPublicLoadNote(token, { content: newNote, author: "Driver/Broker" });
      setNewNote("");
      await fetchLoadData(); // Refresh timeline
    } catch (err) {
      alert("Failed to post note: " + (err.response?.data?.detail || err.message));
    } finally {
      setPostingNote(false);
    }
  };

  // Styles reused from LoadDetailsPage
  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.025em',
    marginBottom: '0.5rem'
  };

  const valueStyle = {
    fontSize: '1rem',
    fontWeight: '600',
    color: 'var(--text-main)'
  };

  const pipelineItem = (label, type) => {
    const isDone = load?.uploaded_doc_types?.includes(type);
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.75rem', 
        padding: '0.75rem 0',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{
          width: '24px', 
          height: '24px', 
          borderRadius: '50%',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: isDone ? '#dcfce7' : '#f8fafc',
          color: isDone ? '#10b981' : '#cbd5e1',
        }}>
          {isDone ? <CheckCircle size={16} /> : <Clock size={14} />}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ 
            fontSize: '0.8125rem', 
            fontWeight: '600', 
            color: isDone ? 'var(--text-muted)' : 'var(--text-main)',
            textDecoration: isDone ? 'line-through' : 'none'
          }}>
            {label}
          </p>
        </div>
        {isDone && (
          <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#10b981', backgroundColor: '#ecfdf5', padding: '0.15rem 0.5rem', borderRadius: '1rem' }}>
            DOC RECEIVED
          </span>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <Loader2 size={40} className="animate-spin" color="var(--primary)" />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Retrieving shipment context...</p>
      </div>
    );
  }

  if (error || !load) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem' }}>
          <AlertTriangle size={48} color="var(--error)" style={{ margin: '0 auto 1rem' }} />
          <h3>Access Denied</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{error || "This link is no longer valid."}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem', animation: 'fadeIn 0.4s ease-out' }}>
      {/* Header Replicated from Internal View */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
        <div style={{ backgroundColor: 'var(--primary)', padding: '0.75rem', borderRadius: '0.75rem', color: 'white' }}>
          <Truck size={24} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Load #{load.reference_number}</h1>
            <StatusBadge status={load.state} />
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            External Document Portal • {load.customer_name}
          </p>
        </div>
      </div>

      {/* Main Grid Layout Replicated from Internal View */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* Left Column: Shipment Specifics & Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* 1. Shipment Specifics */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={20} color="var(--primary)" />
              Shipment Specifics
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={labelStyle}><MapPin size={14} /> Origin</label>
                  <p style={valueStyle}>{load.origin || "Not Specified"}</p>
                </div>
                <div>
                  <label style={labelStyle}><MapPin size={14} /> Destination</label>
                  <p style={valueStyle}>{load.destination || "Not Specified"}</p>
                </div>
              </div>
              <div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={labelStyle}><Calendar size={14} /> Schedule</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <p style={{ ...valueStyle, fontSize: '0.9rem' }}>Pickup: {load.pickup_date ? new Date(load.pickup_date).toLocaleDateString() : "TBD"}</p>
                    <p style={{ ...valueStyle, fontSize: '0.9rem' }}>Delivery: {load.delivery_date ? new Date(load.delivery_date).toLocaleDateString() : "TBD"}</p>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}><Info size={14} /> Broker / Customer</label>
                  <p style={valueStyle}>{load.customer_name || load.broker_name || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Document Pipeline Status */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} color="var(--primary)" />
              Submission Pipeline
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                {pipelineItem("Rate Confirmation", "RATE_CONFIRMATION")}
                {pipelineItem("Bill of Lading (BOL)", "BOL")}
              </div>
              <div>
                {pipelineItem("Proof of Delivery (POD)", "POD")}
                {pipelineItem("Invoice", "INVOICE")}
                {load?.accessorial_revenue > 0 && pipelineItem("Accessorial Receipt", "ACCESSORIAL_RECEIPT")}
              </div>
            </div>
          </div>

          {/* 3. Notes & Activity Section (NEW) */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={20} color="var(--primary)" />
              Activity & Communication
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Note Input */}
              <div style={{ 
                backgroundColor: 'var(--bg-main)', 
                padding: '1.25rem', 
                borderRadius: '0.75rem', 
                border: '1px solid var(--border)' 
              }}>
                <label style={{ ...labelStyle, marginBottom: '0.75rem' }}>Missing a document? Leave a note:</label>
                <textarea 
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="e.g. Shipper was closed, BOL will be available tomorrow at 9AM..."
                  style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--border)',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                    marginBottom: '1rem',
                    resize: 'vertical'
                  }}
                />
                <button 
                  onClick={handlePostNote}
                  disabled={postingNote || !newNote.trim()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.625rem 1.25rem',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '700',
                    fontSize: '0.875rem',
                    cursor: (postingNote || !newNote.trim()) ? 'not-allowed' : 'pointer',
                    opacity: (postingNote || !newNote.trim()) ? 0.7 : 1,
                    transition: 'all 0.2s'
                  }}
                >
                  {postingNote ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Post Update
                </button>
              </div>

              {/* Timeline Display */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {load.notes && load.notes.length > 0 ? (
                  load.notes.map((note) => (
                    <div key={note.id} style={{ 
                      display: 'flex', 
                      gap: '1rem',
                      padding: '1rem',
                      backgroundColor: 'white',
                      borderRadius: '0.75rem',
                      border: '1px solid var(--border)'
                    }}>
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        backgroundColor: note.author === 'Admin' ? 'var(--primary-light)' : '#f1f5f9',
                        color: note.author === 'Admin' ? 'var(--primary)' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <User size={16} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: '700', fontSize: '0.875rem' }}>{note.author}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(note.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                          {note.content}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                     No activity recorded yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Upload Center */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem', border: '2px solid var(--primary-light)', backgroundColor: 'var(--bg-main)' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', textAlign: 'center' }}>Upload Documents</h3>
            
            {!isSuccess ? (
              <>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ ...labelStyle, justifyContent: 'center', marginBottom: '1rem' }}>Select Document Type</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    {['BOL', 'POD', 'RATE_CONFIRMATION', 'INVOICE', 'ACCESSORIAL_RECEIPT', 'OTHER']
                      .filter(type => type !== 'ACCESSORIAL_RECEIPT' || load?.accessorial_revenue > 0)
                      .map(type => (
                      <button 
                        key={type}
                        onClick={() => setDocType(type)}
                        style={{
                          padding: '0.625rem',
                          borderRadius: '0.5rem',
                          border: '1px solid',
                          borderColor: docType === type ? 'var(--primary)' : 'var(--border)',
                          backgroundColor: docType === type ? 'var(--primary-light)' : 'white',
                          color: docType === type ? 'var(--primary)' : 'var(--text-main)',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {type.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <FileUploader 
                  noCard
                  onUpload={async (file) => {
                    const res = await publicUploadDocument(token, file, docType);
                    if (!res.mismatch_detected) {
                      setIsSuccess(true);
                      fetchLoadData(); // Refresh pipeline state
                    }
                    return res;
                  }}
                />
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <CheckCircle size={48} color="var(--success)" style={{ margin: '0 auto 1.25rem' }} />
                <h4 style={{ marginBottom: '0.5rem' }}>Successfully Uploaded!</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  The {docType === 'ACCESSORIAL_RECEIPT' ? 'Lumper Receipt' : docType.replace('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())} has been attached to Load #{load.reference_number}.
                </p>
                <button 
                  className="button-primary" 
                  style={{ width: '100%' }}
                  onClick={() => setIsSuccess(false)}
                >
                  Upload Another
                </button>
              </div>
            )}
          </div>

          <div style={{ padding: '1rem', backgroundColor: '#fff7ed', borderRadius: '0.75rem', border: '1px solid #ffedd5', display: 'flex', gap: '0.75rem' }}>
             <Clock size={20} color="#f59e0b" style={{ flexShrink: 0 }} />
             <div>
                <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#92400e', marginBottom: '0.25rem' }}>Required for Payment</p>
                <p style={{ fontSize: '0.75rem', color: '#b45309', lineHeight: '1.4' }}>
                  Please ensure all three core documents are uploaded to avoid payment delays.
                </p>
             </div>
          </div>
        </div>
      </div>

      <footer style={{ marginTop: '4rem', padding: '2rem 0', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
         <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            © 2026 Truck Logistics Command Center • Secure Document Ingestion

         </p>
      </footer>
    </div>
  );
};

export default DriverUploadPage;
