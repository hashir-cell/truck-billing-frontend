import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  History, 
  Search, 
  Filter, 
  ArrowRightCircle,
  FileText,
  MessageSquare,
  User,
  Clock
} from 'lucide-react';
import { getExceptions, resolveException, updateLoad } from '../../services/api';
import { useApp } from '../../context/AppContext';
import Pagination from '../../components/common/Pagination';

const ExceptionsPage = () => {
  const { selectedTenantId } = useApp();
  const [searchParams] = useSearchParams();
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedException, setSelectedException] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  // Pagination & Search State
  const [page, setPage] = useState(1);
  const [pageSize] = useState(6); // 6 per page for the grid view
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // New state for contact info resolution
  const [contactInfo, setContactInfo] = useState({
    broker_name: '',
    broker_email: '',
    broker_phone: '',
    driver_name: '',
    driver_phone: ''
  });

  // State for amount mismatch resolution
  const [financials, setFinancials] = useState({
    freight_revenue: 0,
    invoice_amount: 0
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getExceptions({
        page,
        page_size: pageSize,
        search: debouncedSearch
      });
      setExceptions(data.items || []);
      setTotalItems(data.total || 0);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (selectedTenantId) {
      fetchData();
    }
  }, [selectedTenantId, page, debouncedSearch]);

  // Deep linking logic: Auto-select exception from URL
  useEffect(() => {
    if (exceptions.length > 0) {
      const loadId = searchParams.get('loadId');
      if (loadId && !selectedException) {
        const found = exceptions.find(ex => String(ex.id) === loadId);
        if (found) {
          setSelectedException(found);
        }
      }
    }
  }, [exceptions, searchParams, selectedException]);

  useEffect(() => {
    if (selectedException) {
      setContactInfo({
        broker_name: selectedException.broker_name || '',
        broker_email: selectedException.broker_email || '',
        broker_phone: selectedException.broker_phone || '',
        driver_name: selectedException.driver_name || '',
        driver_phone: selectedException.driver_phone || ''
      });
      setFinancials({
        freight_revenue: selectedException.freight_revenue || 0,
        invoice_amount: selectedException.invoice_amount || 0
      });
      setResolutionNote('');
    }
  }, [selectedException]);

  const isContactException = 
    selectedException?.exception_data?.type === 'MISSING_CONTACT_INFO' ||
    selectedException?.exception_reason?.includes('Missing');

  const isAmountException = 
    selectedException?.exception_data?.type === 'AMOUNT_MISMATCH' ||
    selectedException?.exception_reason?.includes('Amount mismatch');

  const handleResolve = async () => {
    if (!selectedException) return;
    setIsResolving(true);
    try {
      // 1. Update load details based on exception type
      if (isContactException) {
        await updateLoad(selectedException.id, {
          broker_name: contactInfo.broker_name,
          broker_email: contactInfo.broker_email,
          broker_phone: contactInfo.broker_phone,
          driver_name: contactInfo.driver_name,
          driver_phone: contactInfo.driver_phone
        });
      } else if (isAmountException) {
        await updateLoad(selectedException.id, {
          freight_revenue: financials.freight_revenue,
          invoice_amount: financials.invoice_amount
        });
      }


      // 2. Resolve the exception (return to previous state)
      // We use 'DOCS_PENDING' as default target state for these exceptions
      const targetState = selectedException.previous_state || 'DOCS_PENDING';
      await resolveException(selectedException.id, resolutionNote || "Contact information updated", targetState);
      
      setSelectedException(null);
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

      {/* Search and Filters Bar */}
      <div style={{ 
        marginBottom: '2rem', 
        display: 'flex', 
        gap: '1rem', 
        alignItems: 'center',
        backgroundColor: 'white',
        padding: '0.75rem 1rem',
        borderRadius: '1rem',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--border)'
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search 
            size={18} 
            color="var(--text-muted)" 
            style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} 
          />
          <input 
            type="text"
            placeholder="Search by Reference #, Customer, or Issue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 3rem',
              borderRadius: '0.75rem',
              border: '1px solid var(--border)',
              fontSize: '0.9375rem',
              outline: 'none',
              transition: 'all 0.2s',
              backgroundColor: '#f8fafc'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          padding: '0.75rem 1rem', 
          backgroundColor: '#eff6ff', 
          color: 'var(--primary)', 
          borderRadius: '0.75rem',
          fontSize: '0.875rem',
          fontWeight: '700',
          cursor: 'pointer'
        }}>
          <Filter size={16} />
          Filters
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {(() => {
          if (exceptions.length > 0) {
            return exceptions.map(ex => (
              <div 
                key={ex.id} 
                className="card" 
                onClick={() => setSelectedException(ex)}
            style={{ 
              padding: '1.5rem', 
              cursor: 'pointer', 
              transition: 'transform 0.2s, box-shadow 0.2s',
              borderLeft: '4px solid #f59e0b',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column'
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
                {ex.state}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {ex.updated_at ? new Date(ex.updated_at).toLocaleDateString() : 'Just Now'}
              </span>
            </div>

            
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', fontWeight: '600' }}>Load #{ex.reference_number}</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: '1.5', marginBottom: '1.5rem', flex: 1 }}>
              {ex.exception_reason || "Load flagged with exception. Manual review required."}
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: '600' }}>
                Resolve Now <ChevronRight size={16} />
              </div>
            </div>
          </div>
        ));
          } else if (debouncedSearch) {
            return (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', backgroundColor: 'white', borderRadius: '1rem', border: '1px dashed var(--border)' }}>
                <Search size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Matches Found</h3>
                <p style={{ color: 'var(--text-muted)' }}>We couldn't find any exceptions matching "{searchTerm}".</p>
                <button 
                  onClick={() => setSearchTerm('')}
                  style={{ marginTop: '1.5rem', color: 'var(--primary)', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Clear Search
                </button>
              </div>
            );
          } else {
            return (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', backgroundColor: 'white', borderRadius: '1rem', border: '1px dashed var(--border)' }}>
                <CheckCircle2 size={48} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>All Clear!</h3>
                <p style={{ color: 'var(--text-muted)' }}>No active exceptions found for this tenant.</p>
              </div>
            );
          }
        })()}
      </div>

      <Pagination 
        currentPage={page}
        totalPages={Math.ceil(totalItems / pageSize)}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setPage}
        loading={loading}
      />

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
            position: 'fixed', top: 0, right: 0, bottom: 0, width: '500px',
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
              <div style={{ backgroundColor: '#fdfaea', padding: '1.5rem', borderRadius: '0.75rem', marginBottom: '2rem', border: '1px solid #fef3c7' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#92400e', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Issue Detected</span>
                <p style={{ fontWeight: '600', color: '#b45309', fontSize: '0.9375rem' }}>{selectedException.exception_reason || "Manual Flag"}</p>
              </div>

              {/* Activity Timeline (NEW) */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h4 style={{ fontSize: '0.8125rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MessageSquare size={16} />
                  Communication & History
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingLeft: '0.5rem', borderLeft: '2px solid var(--border)', marginLeft: '0.75rem' }}>
                  {selectedException.notes && selectedException.notes.length > 0 ? (
                    selectedException.notes.map((note, idx) => (
                      <div key={note.id} style={{ position: 'relative' }}>
                        <div style={{ 
                          position: 'absolute', left: '-1.15rem', top: '0.25rem', 
                          width: '12px', height: '12px', borderRadius: '50%', 
                          backgroundColor: note.author === 'Admin' ? 'var(--primary)' : '#f59e0b',
                          border: '2px solid white'
                        }} />
                        <div style={{ 
                          backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.75rem', 
                          border: '1px solid var(--border)' 
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem', alignItems: 'center' }}>
                            <span style={{ fontWeight: '700', fontSize: '0.8125rem', color: 'var(--text-main)' }}>{note.author}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Clock size={10} />
                              {new Date(note.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.8125rem', color: 'var(--text-main)', lineHeight: '1.4' }}>{note.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.75rem', border: '1px dashed var(--border)', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      No communications recorded for this shipment.
                    </div>
                  )}
                </div>
              </div>

              {isContactException ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '2rem' }}>
                  {/* Broker Section */}
                  <div>
                    <h4 style={{ fontSize: '0.8125rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Broker Hub</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Broker Name</label>
                        <input 
                          type="text"
                          value={contactInfo.broker_name}
                          onChange={(e) => setContactInfo({...contactInfo, broker_name: e.target.value})}
                          placeholder="Broker name..."
                          style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid var(--border)', fontSize: '0.875rem' }}
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Broker Email</label>
                          <input 
                            type="email"
                            value={contactInfo.broker_email}
                            onChange={(e) => setContactInfo({...contactInfo, broker_email: e.target.value})}
                            placeholder="Email..."
                            style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid var(--border)', fontSize: '0.875rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Broker Phone</label>
                          <input 
                            type="tel"
                            value={contactInfo.broker_phone}
                            onChange={(e) => setContactInfo({...contactInfo, broker_phone: e.target.value})}
                            placeholder="Phone..."
                            style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid var(--border)', fontSize: '0.875rem' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Driver Section */}
                  <div>
                    <h4 style={{ fontSize: '0.8125rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Driver Profile</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Driver Name</label>
                        <input 
                          type="text"
                          value={contactInfo.driver_name}
                          onChange={(e) => setContactInfo({...contactInfo, driver_name: e.target.value})}
                          placeholder="Driver name..."
                          style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid var(--border)', fontSize: '0.875rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Driver Phone</label>
                        <input 
                          type="tel"
                          value={contactInfo.driver_phone}
                          onChange={(e) => setContactInfo({...contactInfo, driver_phone: e.target.value})}
                          placeholder="Phone..."
                          style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid var(--border)', fontSize: '0.875rem' }}
                        />
                      </div>
                    </div>
                  </div>

                </div>
              ) : isAmountException ? (
                <div style={{ marginBottom: '2rem' }}>
                   <h4 style={{ fontSize: '0.8125rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Financial Correction</h4>
                   
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                     <div>
                       <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Dispatch Revenue</label>
                       <div style={{ position: 'relative' }}>
                         <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>$</span>
                         <input 
                           type="number"
                           step="0.01"
                           value={financials.freight_revenue}
                           onChange={(e) => setFinancials({...financials, freight_revenue: parseFloat(e.target.value) || 0})}
                           style={{ width: '100%', padding: '0.625rem 0.625rem 0.625rem 1.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', fontSize: '0.875rem', fontWeight: '600' }}
                         />
                       </div>
                     </div>
                     
                     <div>
                       <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Invoice Amount</label>
                       <div style={{ position: 'relative' }}>
                         <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>$</span>
                         <input 
                           type="number"
                           step="0.01"
                           value={financials.invoice_amount}
                           onChange={(e) => setFinancials({...financials, invoice_amount: parseFloat(e.target.value) || 0})}
                           style={{ width: '100%', padding: '0.625rem 0.625rem 0.625rem 1.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', fontSize: '0.875rem', fontWeight: '600' }}
                         />
                       </div>
                     </div>
                   </div>
                   
                   <div style={{ marginTop: '1.25rem', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', border: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Adjust one or both values so the difference is within the <strong>$50.00</strong> tolerance.
                   </div>
                </div>
              ) : (
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', marginBottom: '0.75rem' }}>Resolution Note</label>
                  <textarea 
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    placeholder="Explain how this was resolved..."
                    style={{
                      width: '100%', minHeight: '120px', padding: '1rem', borderRadius: '0.5rem',
                      border: '1px solid var(--border)', fontSize: '0.875rem', outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', marginBottom: '0.75rem' }}>Resolution Action</label>
                <div style={{ padding: '1.25rem', border: '1.5px solid var(--primary)', borderRadius: '1rem', backgroundColor: 'var(--primary-light)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <CheckCircle2 size={24} color="var(--primary)" />
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.9375rem', color: 'var(--primary)' }}>Apply Fix & Resume</div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Update details and return the load to its previous processing state.</p>
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
                disabled={isResolving}
                className="button-primary"
                style={{ flex: 2, padding: '0.75rem' }}
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
