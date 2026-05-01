import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getBatches, postBatchPayment, confirmPublicBatch, cancelPublicBatch } from '../../services/api';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  CreditCard, 
  DollarSign, 
  Clock, 
  Wallet, 
  CheckCircle2, 
  AlertCircle,
  FileSearch,
  ChevronRight,
  TrendingUp,
  Receipt,
  X,
  Loader2,
  Calendar,
  Download,
  Box
} from 'lucide-react';

const PaymentsPage = () => {
    const { selectedTenant } = useApp();
    const [batches, setBatches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [showPayModal, setShowPayModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Posting form state
    const [postData, setPostData] = useState({
        payment_amount: 0,
        reserve_amount: 0,
        chargeback_amount: 0,
        triumph_batch_id: '',
        payment_date: new Date().toISOString().split('T')[0]
    });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const data = await getBatches();
            // Filter batches that are submitted or later
            const paymentRelevant = data.filter(b => 
                ['PENDING_CONFIRMATION', 'CONFIRMATION', 'READY', 'ASSEMBLING', 'BATCH_READY', 'SUBMITTED', 'ACCEPTED', 'PARTIALLY_PAID', 'PAID', 'REJECTED', 'CANCELLED'].includes(b.state)
            );
            setBatches(paymentRelevant);
        } catch (err) {
            console.error("Failed to fetch batches", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedTenant]);

    useEffect(() => {
        const reviewToken = searchParams.get('review_token');
        if (reviewToken && batches.length > 0) {
            const targetBatch = batches.find(b => b.confirmation_token === reviewToken);
            if (targetBatch && targetBatch.state === 'PENDING_CONFIRMATION') {
                setSelectedBatch(targetBatch);
                setShowReviewModal(true);
                // Clear the param after opening so it doesn't reopen on refresh
                const newParams = new URLSearchParams(searchParams);
                newParams.delete('review_token');
                setSearchParams(newParams);
            }
        }
    }, [searchParams, batches]);

    const handleOpenPostModal = (batch) => {
        setSelectedBatch(batch);
        setPostData({
            payment_amount: batch.total_amount || 0,
            reserve_amount: 0,
            chargeback_amount: 0,
            triumph_batch_id: batch.triumph_batch_id || '',
            payment_date: new Date().toISOString().split('T')[0]
        });
        setShowPayModal(true);
    };

    const handlePostPayment = async () => {
        if (!selectedBatch) return;
        setIsPosting(true);
        try {
            await postBatchPayment(selectedBatch.id, postData);
            setShowPayModal(false);
            await fetchData();
        } catch (err) {
            alert("Failed to post payment. Please check your data.");
        } finally {
            setIsPosting(false);
        }
    };

    const handleConfirmReview = async () => {
        if (!selectedBatch) return;
        setIsConfirming(true);
        try {
            await confirmPublicBatch(selectedBatch.confirmation_token, 0, postData.payment_date);
            setShowReviewModal(false);
            await fetchData();
        } catch (err) {
            alert("Failed to confirm batch. Please try again.");
        } finally {
            setIsConfirming(false);
        }
    };

    const handleCancelReview = async () => {
        if (!selectedBatch) return;
        const reason = prompt("Please provide a reason for cancellation:");
        if (reason === null) return; // User cancelled prompt

        setIsConfirming(true);
        try {
            await cancelPublicBatch(selectedBatch.confirmation_token, reason || "Cancelled by owner");
            setShowReviewModal(false);
            await fetchData();
        } catch (err) {
            alert("Failed to cancel batch. Please try again.");
        } finally {
            setIsConfirming(false);
        }
    };

    const calculateMetrics = () => {
        const receivables = batches
            .filter(b => b.state === 'SUBMITTED' || b.state === 'ACCEPTED')
            .reduce((sum, b) => sum + (b.total_amount || 0), 0);
        
        const collected = batches
            .reduce((sum, b) => sum + (b.payment_amount || 0), 0);

        const reserves = batches
            .reduce((sum, b) => sum + (b.reserve_amount || 0), 0);

        return { receivables, collected, reserves };
    };

    const metrics = calculateMetrics();

    const StatusBadge = ({ state }) => {
        let color = '#94a3b8';
        let icon = <Clock size={12} />;
        
        if (state === 'PAID') { color = '#10b981'; icon = <CheckCircle2 size={12} />; }
        if (state === 'BATCH_READY' || state === 'READY' || state === 'ASSEMBLING') { color = '#f59e0b'; icon = <Box size={12} />; }
        if (state === 'PENDING_CONFIRMATION') { color = '#6366f1'; icon = <AlertCircle size={12} />; }
        if (state === 'CONFIRMATION') { color = '#8b5cf6'; icon = <CheckCircle2 size={12} />; }
        if (state === 'SUBMITTED') { color = '#3b82f6'; icon = <TrendingUp size={12} />; }
        if (state === 'ACCEPTED') { color = '#6366f1'; icon = <FileSearch size={12} />; }
        if (state === 'REJECTED' || state === 'CANCELLED') { color = '#ef4444'; icon = <AlertCircle size={12} />; }
        
        return (
            <span style={{
                padding: '0.25rem 0.6rem',
                borderRadius: '9999px',
                fontSize: '0.7rem',
                fontWeight: '600',
                backgroundColor: `${color}1a`,
                color: color,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
            }}>
                {icon} {state}
            </span>
        );
    };

    return (
        <div className="animate-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Payments & Reconciliation</h1>
                <p style={{ color: 'var(--text-muted)' }}>Track factored receivables and manage settlement postings.</p>
            </div>

            {/* Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', background: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e40af' }}>
                            <DollarSign size={20} />
                        </div>
                        <TrendingUp size={16} color="#10b981" />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Open Receivables</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '0.25rem' }}>${metrics.receivables.toLocaleString()}</div>
                </div>

                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', background: '#ecfdf5', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#065f46' }}>
                            <Wallet size={20} />
                        </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Total Collected</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '0.25rem' }}>${metrics.collected.toLocaleString()}</div>
                </div>

                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', background: '#fff7ed', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9a3412' }}>
                            <Clock size={20} />
                        </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Funds in Reserve</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '0.25rem' }}>${metrics.reserves.toLocaleString()}</div>
                </div>

                <div className="card" style={{ padding: '1.5rem', background: 'var(--primary)', color: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CreditCard size={20} />
                        </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.8, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Batch Efficiency</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '0.25rem' }}>94.2%</div>
                </div>
            </div>

            {/* Table Area */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>Settlement Ledger</h2>
                    <button 
                        className="button-secondary" 
                        style={{ 
                            fontSize: '0.75rem', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            background: 'white',
                            color: 'var(--text-main)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                    >
                        <Download size={14} /> Export Statement
                    </button>
                </div>
                
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', background: '#f8fafc' }}>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Batch Details</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Invoice Value</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Payment</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '4rem', textAlign: 'center' }}>
                                     <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto', color: 'var(--primary)', opacity: 0.5 }} />
                                </td>
                            </tr>
                        ) : batches.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No factored batches found.
                                </td>
                            </tr>
                        ) : batches.map(batch => (
                            <tr key={batch.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{batch.batch_number}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                        {batch.invoice_count} Invoices • ID: {batch.triumph_batch_id || 'N/A'}
                                    </div>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem', fontWeight: '500' }}>
                                    ${batch.total_amount?.toLocaleString()}
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    {batch.payment_amount ? (
                                        <div>
                                            <div style={{ fontWeight: '600', color: '#059669' }}>${batch.payment_amount.toLocaleString()}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Reserve: ${batch.reserve_amount}</div>
                                        </div>
                                    ) : (
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>—</span>
                                    )}
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <StatusBadge state={batch.state} />
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    {batch.state === 'PENDING_CONFIRMATION' ? (
                                        <button 
                                            className="button-primary" 
                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', backgroundColor: '#6366f1' }}
                                            onClick={() => {
                                                setSelectedBatch(batch);
                                                setPostData(prev => ({...prev, payment_date: new Date().toISOString().split('T')[0]}));
                                                setShowReviewModal(true);
                                            }}
                                        >
                                            Review & Release
                                        </button>
                                    ) : ['SUBMITTED', 'ACCEPTED', 'PARTIALLY_PAID'].includes(batch.state) ? (
                                        <button 
                                            className="button-primary" 
                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                                            onClick={() => handleOpenPostModal(batch)}
                                        >
                                            Post Payment
                                        </button>
                                    ) : (
                                        <button 
                                            className="button-secondary" 
                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                                            disabled
                                        >
                                            View Logs
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Payment Modal */}
            {showPayModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '450px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '32px', height: '32px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Receipt size={18} />
                                </div>
                                <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Record Batch Payment</h3>
                            </div>
                            <button className="icon-button" onClick={() => setShowPayModal(false)}><X size={20}/></button>
                        </div>

                        <div style={{ fontSize: '0.875rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
                            <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Batch Number</div>
                            <div style={{ fontWeight: '700' }}>{selectedBatch?.batch_number}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                                <span>Total Value:</span>
                                <strong>${selectedBatch?.total_amount?.toLocaleString()}</strong>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Payment Amount Recieved</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>$</div>
                                <input 
                                    type="number" 
                                    style={{ paddingLeft: '2rem' }}
                                    value={postData.payment_amount}
                                    onChange={e => setPostData({...postData, payment_amount: parseFloat(e.target.value)})}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Reserve Held</label>
                                <input 
                                    type="number" 
                                    value={postData.reserve_amount}
                                    onChange={e => setPostData({...postData, reserve_amount: parseFloat(e.target.value)})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Chargebacks</label>
                                <input 
                                    type="number" 
                                    value={postData.chargeback_amount}
                                    onChange={e => setPostData({...postData, chargeback_amount: parseFloat(e.target.value)})}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Triumph Identifier</label>
                            <input 
                                type="text" 
                                placeholder="e.g. TR-99812-A"
                                value={postData.triumph_batch_id}
                                onChange={e => setPostData({...postData, triumph_batch_id: e.target.value})}
                            />
                        </div>

                        <div className="form-group">
                            <label>Settlement Date</label>
                            <div style={{ position: 'relative' }}>
                                <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input 
                                    type="date" 
                                    style={{ paddingLeft: '2.5rem' }}
                                    value={postData.payment_date}
                                    onChange={e => setPostData({...postData, payment_date: e.target.value})}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <button className="button-secondary" style={{ flex: 1 }} onClick={() => setShowPayModal(false)}>Cancel</button>
                            <button 
                                className="button-primary" 
                                style={{ flex: 2 }} 
                                onClick={handlePostPayment}
                                disabled={isPosting}
                            >
                                {isPosting ? <Loader2 size={18} className="animate-spin" /> : 'Confirm Posting'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Review & Release Modal */}
            {showReviewModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '450px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '32px', height: '32px', background: '#eef2ff', color: '#6366f1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FileSearch size={18} />
                                </div>
                                <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Review & Release Batch</h3>
                            </div>
                            <button className="icon-button" onClick={() => setShowReviewModal(false)}><X size={20}/></button>
                        </div>

                        <div style={{ fontSize: '0.875rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
                            <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Batch Summary</div>
                            <div style={{ fontWeight: '700', fontSize: '1rem' }}>{selectedBatch?.batch_number}</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.75rem' }}>
                                <div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Invoices</div>
                                    <strong>{selectedBatch?.invoice_count}</strong>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Total Amount</div>
                                    <strong>${selectedBatch?.total_amount?.toLocaleString()}</strong>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Target Release Date</label>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                Select the date you want this batch to be officially submitted for payment.
                            </p>
                            <div style={{ position: 'relative' }}>
                                <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input 
                                    type="date" 
                                    style={{ paddingLeft: '2.5rem' }}
                                    value={postData.payment_date}
                                    onChange={e => setPostData({...postData, payment_date: e.target.value})}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fef3c7', fontSize: '0.8125rem', color: '#92400e' }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                                <span>Once confirmed, the batch will move to <strong>CONFIRMATION</strong> and will be automatically submitted once the release date is reached.</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
                            <button className="button-secondary" style={{ flex: 0.5, border: '1px solid var(--border)' }} onClick={() => setShowReviewModal(false)}>Back</button>
                            <button 
                                className="button-secondary" 
                                style={{ 
                                    flex: 1, 
                                    color: '#ef4444', 
                                    border: '1px solid #fee2e2',
                                    fontWeight: '600'
                                }} 
                                onClick={handleCancelReview}
                                disabled={isConfirming}
                            >
                                Cancel Batch
                            </button>
                            <button 
                                className="button-primary" 
                                style={{ flex: 1.5, backgroundColor: '#6366f1' }} 
                                onClick={handleConfirmReview}
                                disabled={isConfirming}
                            >
                                {isConfirming ? <Loader2 size={18} className="animate-spin" /> : 'Confirm & Release'}
                            </button>
                        </div>
                    </div>
                </div>
            )}


            <style dangerouslySetInnerHTML={{ __html: `
                .animate-in { animation: slideUp 0.4s ease-out; }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .table-row-hover:hover {
                    background-color: #f8fafc;
                }
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.4);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                .modal-content {
                    background: white;
                    padding: 2rem;
                    border-radius: 1.25rem;
                    width: 100%;
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
                    animation: zoomIn 0.2s ease-out;
                }
                @keyframes zoomIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .form-group { margin-bottom: 1.25rem; }
                .form-group label { display: block; font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.5rem; }
                .form-group input { width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: 8px; outline: none; font-size: 0.9rem; transition: border-color 0.2s; }
                .form-group input:focus { border-color: var(--primary); }
            `}} />
        </div>
    );
};

export default PaymentsPage;
