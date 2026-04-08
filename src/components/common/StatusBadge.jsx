import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusStyles = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'completed':
      case 'delivered':
      case 'active':
        return { backgroundColor: 'var(--success-bg, #dcfce7)', color: 'var(--success, #166534)' };
      case 'pending':
      case 'loading':
      case 'arrived':
        return { backgroundColor: 'var(--primary-bg, #dbeafe)', color: 'var(--primary, #1e40af)' };
      case 'exception':
      case 'delayed':
      case 'failed':
        return { backgroundColor: 'var(--error-bg, #fee2e2)', color: 'var(--error, #991b1b)' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  const styles = getStatusStyles(status);

  return (
    <span style={{
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600',
      textTransform: 'capitalize',
      display: 'inline-flex',
      alignItems: 'center',
      ...styles
    }}>
      {status}
    </span>
  );
};

export default StatusBadge;
