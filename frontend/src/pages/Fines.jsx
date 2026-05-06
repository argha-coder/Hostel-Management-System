import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { useSelector } from 'react-redux';
import { api } from '../utils/api';
import { AlertTriangle, Plus, CheckCircle, Trash2, User, Calendar, DollarSign, Filter, CreditCard, ArrowRight, Download } from 'lucide-react';
import GlowOrb from '../components/GlowOrb';
import { generateReceipt } from '../utils/receiptService';

const Fines = () => {
  const [fines, setFines] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(null);
  
  // Issue Fine Form State
  const [selectedStudent, setSelectedStudent] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const { userInfo } = useSelector(state => state.auth);
  const isAdmin = userInfo?.role === 'Admin';

  useEffect(() => {
    fetchFines();
    if (isAdmin) {
      fetchStudents();
    }
  }, []);

  const fetchFines = async () => {
    setLoading(true);
    try {
      const data = await api.get('/fines');
      setFines(data);
    } catch (err) {
      console.error('Fetch Fines Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = (fine) => {
    generateReceipt({
      type: 'Student Fine',
      student: { name: userInfo.name, email: userInfo.email },
      amount: fine.amount,
      date: fine.payment_details?.date,
      payment_id: fine.payment_details?.payment_id,
      reference: fine._id,
      details: `Fine Reason: ${fine.reason}`
    });
  };

  const fetchStudents = async () => {
    try {
      const data = await api.get('/auth/users');
      setStudents(data);
    } catch (err) {
      console.error('Fetch Students Error:', err);
    }
  };

  const handleIssueFine = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !amount || !reason) return;
    
    try {
      const data = await api.post('/fines', {
        student_id: selectedStudent,
        amount: Number(amount),
        reason
      });
      setFines(prev => [data, ...(prev || [])]);
      setShowIssueForm(false);
      setSelectedStudent('');
      setAmount('');
      setReason('');
      alert('Fine issued successfully');
    } catch (err) {
      alert(err.message || 'Failed to issue fine');
    }
  };

  const handlePayFine = async (fineId) => {
    setPaying(true);
    try {
      // 1. Create Razorpay Order for Fine
      const order = await api.post('/payments/create-order', { fine_id: fineId });
      
      if (!order.id) {
        throw new Error("Could not create Razorpay order. Please check backend logs.");
      }

      // 2. Configure Razorpay Options
      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "UHostel Management",
        description: "Student Fine Payment",
        order_id: order.id,
        handler: async (response) => {
          try {
            // 3. Verify Payment
            const result = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              fine_id: fineId
            });
            if (result.success) {
              setSuccess("Payment successful! Fine settled.");
              fetchFines();
              setTimeout(() => setSuccess(null), 5000);
            }
          } catch (err) {
            console.error("Verification failed", err);
            alert("Payment verification failed. Please contact admin.");
          }
        },
        prefill: {
          name: userInfo?.name,
          email: userInfo?.email,
        },
        theme: {
          color: "#EF4444", // Red theme for fines
        },
        modal: {
          ondismiss: function() {
            setPaying(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        alert("Payment failed: " + response.error.description);
        setPaying(false);
      });
      rzp.open();
    } catch (err) {
      console.error("Order creation failed", err);
      alert(err.message || "Failed to initiate payment.");
      setPaying(false);
    }
  };

  const handleMarkAsPaid = async (id) => {
    if (!window.confirm('Are you sure you want to mark this fine as paid?')) return;
    try {
      const data = await api.put(`/fines/${id}/pay`);
      setFines(prev => prev.map(f => f._id === id ? data : f));
    } catch (err) {
      alert(err.message || 'Failed to update fine status');
    }
  };

  const handleDeleteFine = async (id) => {
    if (!window.confirm('Are you sure you want to delete this fine record?')) return;
    try {
      await api.delete(`/fines/${id}`);
      setFines(prev => prev.filter(f => f._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete fine');
    }
  };

  return (
    <div style={{ display: 'flex', background: 'var(--color-bg)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Sidebar />
      <GlowOrb color="rgba(239, 68, 68, 0.05)" size="500px" top="20%" left="60%" />
      
      <main style={{ marginLeft: '300px', padding: '48px', flex: 1, zIndex: 1 }}>
        <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2.25rem', color: 'var(--color-text)', fontWeight: 800, letterSpacing: '-1px' }}>Student Fines</h1>
            <p style={{ color: 'var(--color-text-muted)', marginTop: '8px', fontWeight: 500 }}>
              {isAdmin ? 'Manage and issue fines for students' : 'View your issued fines and settle them instantly'}
            </p>
          </div>
          {isAdmin && (
            <button 
              onClick={() => setShowIssueForm(true)}
              className="btn-primary" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Plus size={18} /> Issue New Fine
            </button>
          )}
        </header>

        <AnimatePresence>
          {success && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              style={{ 
                background: '#ECFDF5', 
                border: '1px solid #10B981', 
                padding: '16px 24px', 
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#065F46',
                fontWeight: 600
              }}
            >
              <CheckCircle size={20} />
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {showIssueForm && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="glass-card" 
            style={{ padding: '32px', marginBottom: '40px', border: '1px solid rgba(239, 68, 68, 0.2)' }}
          >
            <h3 style={{ marginBottom: '24px', fontWeight: 800, fontSize: '1.25rem' }}>Issue a Fine</h3>
            <form onSubmit={handleIssueFine} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Select Student</label>
                  <select 
                    className="input-outline"
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    required
                    style={{ padding: '14px' }}
                  >
                    <option value="">Choose a student...</option>
                    {students.map(s => (
                      <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Fine Amount (₹)</label>
                  <input 
                    type="number"
                    className="input-outline" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    placeholder="e.g. 500"
                    required
                    style={{ padding: '14px' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Reason for Fine</label>
                <textarea 
                  className="input-outline" 
                  style={{ minHeight: '100px', padding: '16px' }}
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)} 
                  placeholder="Describe the reason for this fine..." 
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowIssueForm(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" style={{ background: '#EF4444' }}>Issue Fine</button>
              </div>
            </form>
          </motion.div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              style={{ width: '40px', height: '40px', border: '3px solid var(--color-primary-light)', borderTopColor: 'var(--color-primary)', borderRadius: '50%' }}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <AnimatePresence>
              {fines.map((fine) => (
                <motion.div
                  key={fine._id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card"
                  style={{ padding: '32px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '40px', alignItems: 'center' }}
                >
                  <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    <div style={{ 
                      padding: '16px', borderRadius: '16px', 
                      background: fine.status === 'Paid' ? '#ECFDF5' : '#FEF2F2',
                      color: fine.status === 'Paid' ? '#059669' : '#EF4444'
                    }}>
                      <AlertTriangle size={32} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h4 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-text)' }}>₹{fine.amount}</h4>
                        <span style={{ 
                          padding: '6px 14px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800,
                          background: fine.status === 'Paid' ? '#ECFDF5' : '#FEF2F2',
                          color: fine.status === 'Paid' ? '#059669' : '#EF4444',
                          textTransform: 'uppercase'
                        }}>
                          {fine.status === 'Paid' ? 'PAID' : 'UNPAID'}
                        </span>
                      </div>
                      <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--color-text)' }}>{fine.reason}</p>
                      {isAdmin && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                          Issued to: <strong style={{ color: 'var(--color-text)' }}>{fine.student_id?.name}</strong>
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                      <Calendar size={16} />
                      <span>Issued: {new Date(fine.issued_at).toLocaleDateString()}</span>
                    </div>
                    {fine.status === 'Paid' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#059669', fontWeight: 600 }}>
                        <CheckCircle size={16} />
                        <span>Paid: {new Date(fine.paid_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    {isAdmin ? (
                      <>
                        <button 
                          onClick={() => handleDeleteFine(fine._id)}
                          className="btn-secondary" 
                          style={{ color: '#EF4444', borderColor: '#FCA5A5', padding: '10px' }}
                        >
                          <Trash2 size={20} />
                        </button>
                      </>
                    ) : (
                      fine.status === 'Paid' ? (
                        <button 
                          onClick={() => handleDownloadReceipt(fine)}
                          className="btn-secondary" 
                          style={{ padding: '10px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                          <Download size={18} /> Receipt
                        </button>
                      ) : (
                        <button 
                          onClick={() => handlePayFine(fine._id)}
                          disabled={paying}
                          className="btn-primary"
                          style={{ background: '#EF4444', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                          {paying ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ width: '18px', height: '18px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} />
                          ) : (
                            <><CreditCard size={18} /> Pay Now</>
                          )}
                        </button>
                      )
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {fines.length === 0 && (
              <div className="glass-card" style={{ padding: '80px', textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#94A3B8' }}>
                  <DollarSign size={40} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)' }}>No Fines Issued</h3>
                <p style={{ color: 'var(--color-text-muted)', marginTop: '8px' }}>Excellent! You have a clean record.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Fines;
