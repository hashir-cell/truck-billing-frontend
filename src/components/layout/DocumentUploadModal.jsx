import React, { useState } from 'react';
import { X, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import FileUploader from '../common/FileUploader';
import { ingestDocument } from '../../services/api';

const DocumentUploadModal = ({ load, onClose, onUploadSuccess }) => {
  const [docType, setDocType] = useState('BOL');

  if (!load) return null;

  const allDocTypes = [
    { value: 'RATE_CONFIRMATION', label: 'Rate Confirmation' },
    { value: 'BOL', label: 'Bill of Lading' },
    { value: 'POD', label: 'Proof of Delivery' },
    { value: 'INVOICE', label: 'Invoice' },
    { value: 'ACCESSORIAL_RECEIPT', label: 'Lumper / Accessorial Receipt' },
    { value: 'OTHER', label: 'Other' },
  ];

  const docTypes = allDocTypes.filter(t => 
    t.value !== 'ACCESSORIAL_RECEIPT' || (load.accessorial_revenue > 0)
  );

  const handleDocumentUpload = async (file) => {
    return await ingestDocument(file, docType, load.id);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '500px',
        margin: '1rem',
        boxShadow: 'var(--shadow-md)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'white'
        }}>
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
              <FileText size={20} color="var(--primary)" />
              Manage Documents
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Load #{load.id} • Ref: {load.reference_number || 'N/A'}
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{ padding: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '600', 
              marginBottom: '0.5rem',
              color: 'var(--text-main)'
            }}>
              Select Document Type
            </label>
            <select 
              value={docType} 
              onChange={(e) => setDocType(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--border)',
                outline: 'none',
                fontSize: '0.875rem',
                backgroundColor: '#f9fbfd',
                cursor: 'pointer'
              }}
            >
              {docTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <FileUploader 
            onUpload={handleDocumentUpload}
            title={null}
            subtitle={`Upload ${docTypes.find(t => t.value === docType)?.label || 'Document'}`}
            noCard={true}
            accept=".pdf"
          />
          
          <div style={{ 
            marginTop: '1.5rem', 
            padding: '1rem', 
            backgroundColor: '#fdf4ff', 
            borderRadius: '0.5rem', 
            display: 'flex', 
            gap: '0.75rem',
            border: '1px solid rgba(217, 70, 239, 0.1)'
          }}>
            <div style={{ 
              width: '20px', 
              height: '20px', 
              borderRadius: '50%', 
              backgroundColor: '#d946ef', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 'bold'
            }}>!</div>
            <p style={{ fontSize: '0.75rem', color: '#701a75' }}>
              Documents are automatically scanned for compliance. Uploading a **POD** may move the load state to **INVOICE_READY** if an invoice also exists.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{ 
          padding: '1rem 1.5rem', 
          borderTop: '1px solid var(--border)', 
          backgroundColor: '#f8fafc',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button 
            onClick={onClose}
            style={{ 
              padding: '0.625rem 1.25rem', 
              borderRadius: '0.5rem', 
              border: '1px solid var(--border)', 
              backgroundColor: 'white', 
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Done
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default DocumentUploadModal;
