import React, { useState, useRef } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const FileUploader = ({ 
  onUpload, 
  accept = ".csv,.xlsx,.xls", 
  title = "Upload File", 
  subtitle = "Drag and drop your file here, or click to browse",
  noCard = false
}) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, uploading, success, warning, error
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setStatus('idle');
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatus('idle');
    }
  };

  const reset = () => {
    setFile(null);
    setStatus('idle');
    setMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus('uploading');
    try {
      const result = await onUpload(file);
      
      if (result.mismatch_detected) {
        setStatus('warning');
        setMessage(result.message);
      } else {
        setStatus('success');
        setMessage(result.message || 'The system has successfully imported and synchronized the data.');
      }
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.detail || err.message || 'Upload failed');
    }
  };

  const content = (
    <>
      {title && !noCard && <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>{title}</h3>}
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: '0.75rem',
          padding: '2rem',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragging ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
          transition: 'all 0.2s ease',
          position: 'relative'
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept={accept}
          style={{ display: 'none' }}
        />
        
        {!file ? (
          <>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '50%', 
              backgroundColor: '#f3f4f6', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 1rem' 
            }}>
              <Upload size={24} color="var(--text-muted)" />
            </div>
            <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{subtitle}</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Supported formats: {accept}</p>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '0.5rem', 
              backgroundColor: 'var(--primary-bg)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <File size={20} color="var(--primary)" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontWeight: '600', fontSize: '0.875rem' }}>{file.name}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); reset(); }}
              style={{ 
                marginLeft: '1rem', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                color: 'var(--text-muted)'
              }}
            >
              <X size={18} />
            </button>
          </div>
        )}
      </div>

      {file && status === 'idle' && (
        <button 
          onClick={handleUpload}
          className="button-primary"
          style={{ 
            width: '100%', 
            marginTop: '1.25rem',
            padding: '0.75rem',
            backgroundColor: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Start Ingestion
        </button>
      )}

      {status === 'uploading' && (
        <div style={{ 
          marginTop: '1.25rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '0.5rem',
          color: 'var(--primary)',
          fontWeight: '600'
        }}>
          <Loader2 size={20} className="animate-spin" />
          <span>Processing File...</span>
        </div>
      )}

      {status === 'success' && (
        <div style={{ 
          marginTop: '1.25rem', 
          padding: '1rem', 
          backgroundColor: '#dcfce7', 
          borderRadius: '0.75rem',
          display: 'flex',
          gap: '0.75rem',
          border: '1px solid #bbf7d0',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <CheckCircle size={20} color="#16a34a" />
          <div style={{ flex: 1 }}>
            <p style={{ color: '#15803d', fontWeight: '700', fontSize: '0.875rem' }}>Processing Complete</p>
            <p style={{ color: '#166534', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
              {message}
            </p>
            <button 
              onClick={reset}
              style={{ 
                marginTop: '0.75rem', 
                background: 'white', 
                border: '1px solid #bbf7d0', 
                color: '#15803d',
                padding: '0.375rem 1rem',
                borderRadius: '0.375rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Upload Another
            </button>
          </div>
        </div>
      )}

      {status === 'warning' && (
        <div style={{ 
          marginTop: '1.25rem', 
          padding: '1rem', 
          backgroundColor: '#fffbeb', 
          borderRadius: '0.75rem',
          display: 'flex',
          gap: '0.75rem',
          border: '1px solid #fde68a',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <AlertCircle size={20} color="#d97706" />
          <div style={{ flex: 1 }}>
            <p style={{ color: '#92400e', fontWeight: '700', fontSize: '0.875rem' }}>Validation Warning</p>
            <p style={{ color: '#b45309', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
              {message}
            </p>
            <button 
              onClick={reset}
              style={{ 
                marginTop: '0.75rem', 
                background: 'white', 
                border: '1px solid #fde68a', 
                color: '#92400e',
                padding: '0.375rem 1rem',
                borderRadius: '0.375rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Try Another File
            </button>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div style={{ 
          marginTop: '1.25rem', 
          padding: '1rem', 
          backgroundColor: '#fee2e2', 
          borderRadius: '0.5rem',
          display: 'flex',
          gap: '0.75rem'
        }}>
          <AlertCircle size={20} color="#991b1b" />
          <div>
            <p style={{ color: '#991b1b', fontWeight: 'bold', fontSize: '0.875rem' }}>Upload Failed</p>
            <p style={{ color: '#991b1b', fontSize: '0.875rem' }}>{message}</p>
            <button onClick={reset} style={{ marginTop: '0.5rem', textDecoration: 'underline', border: 'none', background: 'none', cursor: 'pointer', color: '#991b1b', fontSize: '0.875rem' }}>Try again</button>
          </div>
        </div>
      )}
    </>
  );

  return noCard ? (
    <div style={{ padding: '0' }}>{content}</div>
  ) : (
    <div className="card" style={{ padding: '1.5rem' }}>
      {content}
    </div>
  );
};

export default FileUploader;
