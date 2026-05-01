import React from 'react';

const StatusBadge = ({ status }) => {
  const getLabel = (status) => {
    const s = status?.toLowerCase();
    if (s === 'batch_ready') return 'Pending Review';
    if (s === 'pending_confirmation') return 'Review Required';
    if (s === 'confirmed') return 'Confirmed';
    return status;
  };

  const getStatusStyles = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'completed':
      case 'delivered':
      case 'active':
      case 'paid':
        return { backgroundColor: 'var(--success-bg, #dcfce7)', color: 'var(--success, #166534)' };
      case 'pending':
      case 'loading':
      case 'arrived':
      case 'submitted':
        return { backgroundColor: 'var(--primary-bg, #dbeafe)', color: 'var(--primary, #1e40af)' };
      case 'confirmed':
        return { backgroundColor: '#e0f2fe', color: '#0369a1' }; // Sky blue
      case 'batch_ready':
      case 'pending_confirmation':
        return { backgroundColor: '#fef3c7', color: '#92400e' };
      case 'exception':
      case 'delayed':
      case 'failed':
      case 'rejected':
        return { backgroundColor: 'var(--error-bg, #fee2e2)', color: 'var(--error, #991b1b)' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  const styles = getStatusStyles(status);
  const label = getLabel(status);

  return (
    <span style={{
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600',
      textTransform: 'capitalize',
      display: 'inline-flex',
      alignItems: 'center',
      whiteSpace: 'nowrap',
      ...styles
    }}>
      {label}
    </span>
  );
};

export default StatusBadge;
