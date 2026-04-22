import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems, 
  pageSize,
  loading 
}) => {
  if (totalPages <= 1 && totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      if (end === totalPages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '1rem 1.5rem',
      backgroundColor: 'white',
      borderTop: '1px solid var(--border)',
      borderBottomLeftRadius: '0.75rem',
      borderBottomRightRadius: '0.75rem'
    }}>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        Showing <span style={{ fontWeight: '600' }}>{startItem}</span> to <span style={{ fontWeight: '600' }}>{endItem}</span> of <span style={{ fontWeight: '600' }}>{totalItems}</span> results
      </div>

      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1 || loading}
          style={{
            padding: '0.5rem',
            borderRadius: '0.375rem',
            border: '1px solid var(--border)',
            backgroundColor: 'white',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage === 1 ? 0.5 : 1,
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <ChevronsLeft size={16} />
        </button>
        
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          style={{
            padding: '0.5rem',
            borderRadius: '0.375rem',
            border: '1px solid var(--border)',
            backgroundColor: 'white',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage === 1 ? 0.5 : 1,
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <ChevronLeft size={16} />
        </button>

        {getPageNumbers().map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            disabled={loading}
            style={{
              minWidth: '2.25rem',
              height: '2.25rem',
              borderRadius: '0.375rem',
              border: page === currentPage ? '1px solid var(--primary)' : '1px solid var(--border)',
              backgroundColor: page === currentPage ? 'var(--primary)' : 'white',
              color: page === currentPage ? 'white' : 'var(--text-main)',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          style={{
            padding: '0.5rem',
            borderRadius: '0.375rem',
            border: '1px solid var(--border)',
            backgroundColor: 'white',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            opacity: currentPage === totalPages ? 0.5 : 1,
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <ChevronRight size={16} />
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || loading}
          style={{
            padding: '0.5rem',
            borderRadius: '0.375rem',
            border: '1px solid var(--border)',
            backgroundColor: 'white',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            opacity: currentPage === totalPages ? 0.5 : 1,
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
