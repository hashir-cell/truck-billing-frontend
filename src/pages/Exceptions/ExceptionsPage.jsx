import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  History, 
  Search, 
  Filter, 
  ArrowRightCircle,
  FileText
} from 'lucide-react';
import { getExceptions, resolveException } from '../../services/api';
import { useApp } from '../../context/AppContext';

const ExceptionsPage = () => {
  const { selectedTenantId } = useApp();
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedException, setSelectedException] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getExceptions();
      setExceptions(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTenantId) {
      fetchData();
    }
  }, [selectedTenantId]);

  const handleResolve = async () => {
    if (!selectedException || !resolutionNote) return;
    setIsResolving(true);
    try {
      await resolveException(selectedException.id, resolutionNote);
      setSelectedException(null);
      setResolutionNote('');
      fetchData();
    } catch (err) {
      console.error("Failed to resolve:", err);
      alert("Failed to resolve exception. Please try again.");
    } finally {
      setIsResolving(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading exceptions...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', minHeight: '80vh' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2rem' }}>
          <AlertTriangle size={32} color="#f59e0b" />
          Exception Center
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Review and resolve billing discrepancies and documentation flags.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {exceptions.length > 0 ? exceptions.map(ex => (
          <div 
            key={ex.id} 
            className="card" 
            onClick={() => setSelectedException(ex)}
            style={{ 
              padding: '1.5rem', 
              cursor: 'pointer', 
              transition: 'transform 0.2s, box-shadow 0.2s',
              borderLeft: '4px solid #f59e0b',
              position: 'relative'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ 
                fontSize: '0.75rem', 
                fontWeight: '700', 
                padding: '0.25rem 0.5rem', 
                backgroundColor: '#fef3c7', 
                color: '#92400e', 
                borderRadius: '0.25rem' 
              }}>
                {ex.exception_type}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {new Date(ex.created_at).toLocaleDateString()}
              </span>
            </div>
            
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', fontWeight: '600' }}>Load #{ex.reference_number}</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: '1.5', marginBottom: '1.5rem' }}>
              {ex.exception_reason || "Load flagged with exception. Manual review required."}
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: '600' }}>
                Resolve Now <ChevronRight size={16} />
              </div>
            </div>
          </div>
        )) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', backgroundColor: 'white', borderRadius: '1rem', border: '1px dashed var(--border)' }}>
            <CheckCircle2 size={48} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>All Clear!</h3>
            <p style={{ color: 'var(--text-muted)' }}>No active exceptions found for this tenant.</p>
          </div>
        )}
      </div>

      {/* Resolution Drawer */}
      {selectedException && (
        <>
          <div 
            onClick={() => setSelectedException(null)}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)', zIndex: 100
            }}
          />
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: '450px',
            backgroundColor: 'white', zIndex: 101, boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
            display: 'flex', flexDirection: 'column', animation: 'slideIn 0.3s ease-out'
          }}>
            <div style={{ padding: '2rem', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ArrowRightCircle size={24} color="var(--primary)" />
                Resolve Exception
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Updating Load #{selectedException.reference_number}
              </p>
            </div>

            <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
              <div style={{ backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '0.75rem', marginBottom: '2rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Issue Detected</span>
                <p style={{ marginTop: '0.5rem', fontWeight: '600', color: '#b45309' }}>{selectedException.exception_reason || "Manual Flag"}</p>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', marginBottom: '0.75rem' }}>Resolution Note</label>
                <textarea 
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Explain how this was resolved (e.g., 'Spoke to broker, agreed on $50 detention override')"
                  style={{
                    width: '100%', minHeight: '120px', padding: '1rem', borderRadius: '0.5rem',
                    border: '1px solid var(--border)', fontSize: '0.875rem', outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', marginBottom: '0.75rem' }}>Next State</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ padding: '1rem', border: '1px solid var(--primary)', borderRadius: '0.5rem', backgroundColor: 'var(--primary-bg)', cursor: 'pointer' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--primary)' }}>Resume Workflow</div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Return to previous state and continue processing.</p>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border)', backgroundColor: '#f8fafc', display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => setSelectedException(null)}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', backgroundColor: 'white', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleResolve}
                disabled={!resolutionNote || isResolving}
                style={{ 
                  flex: 2, padding: '0.75rem', borderRadius: '0.5rem', border: 'none', 
                  backgroundColor: 'var(--primary)', color: 'white', fontWeight: '700', 
                  cursor: resolutionNote ? 'pointer' : 'not-allowed',
                  opacity: resolutionNote ? 1 : 0.6
                }}
              >
                {isResolving ? 'Resolving...' : 'Confirm Resolution'}
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default ExceptionsPage;
