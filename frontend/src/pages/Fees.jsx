import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { api } from '../utils/api';
import { CreditCard, CheckCircle, AlertCircle, Clock, Receipt, ArrowRight, ShieldCheck, Download } from 'lucide-react';
import GlowOrb from '../components/GlowOrb';
import { useSelector } from 'react-redux';
import { generateReceipt } from '../utils/receiptService';

const Fees = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(null);
  const { userInfo } = useSelector(state => state.auth);

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      const data = await api.get('/payments/my-fees');
      setFees(data);
    } catch (err) {
      console.error("Failed to load fees", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = (fee) => {
    generateReceipt({
      type: 'Hostel Fee',
      student: { name: userInfo.name, email: userInfo.email },
      amount: fee.amount,
      date: fee.payment_details?.date,
      payment_id: fee.payment_details?.payment_id,
      reference: fee._id,
      details: `Room ${fee.room_id.room_number} - ${fee.duration} Months Allocation`
    });
  };

  const handlePay = async (bookingId, amount) => {
    setPaying(true);
    try {
      // 1. Create Razorpay Order
      const order = await api.post('/payments/create-order', { booking_id: bookingId });
      
      // 2. Configure Razorpay Options
      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "UHostel Management",
        description: "Hostel Fee Payment",
        order_id: order.id,
        handler: async (response) => {
          try {
            // 3. Verify Payment on Success
            const verifyData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              booking_id: bookingId
            };
            
            const result = await api.post('/payments/verify', verifyData);
            if (result.success) {
              setSuccess("Payment successful! Your hostel fees have been updated.");
              fetchFees();
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
          color: "#4F46E5",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
              alert("Payment failed: " + response.error.description);
      });
      rzp.open();
    } catch (err) {
      console.error("Order creation failed", err);
      alert(err.message || "Failed to initiate payment. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div style={{ display: 'flex', background: 'var(--color-bg)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Sidebar />
      <GlowOrb color="rgba(79, 70, 229, 0.1)" size="500px" top="-10%" left="60%" />
      
      <main style={{ marginLeft: '300px', padding: '48px', flex: 1, zIndex: 1 }}>
        <header style={{ marginBottom: '40px' }}>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: '2.25rem', color: 'var(--color-text)', fontWeight: 800, letterSpacing: '-1px' }}
          >
            Hostel Fees
          </motion.h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '8px', fontWeight: 500 }}>
            Securely pay your room allotment fees using Razorpay
          </p>
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

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              style={{ width: '40px', height: '40px', border: '3px solid var(--color-primary-light)', borderTopColor: 'var(--color-primary)', borderRadius: '50%' }}
            />
          </div>
        ) : fees.length === 0 ? (
          <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#94A3B8' }}>
              <Receipt size={40} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)' }}>No Active Fees</h3>
            <p style={{ color: 'var(--color-text-muted)', marginTop: '8px', maxWidth: '400px', margin: '8px auto 0' }}>
              You don't have any approved room bookings with unpaid fees at the moment.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '24px' }}>
            {fees.map((fee) => (
              <motion.div 
                key={fee._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card"
                style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                  <div>
                    <span style={{ 
                      padding: '6px 12px', 
                      borderRadius: '8px', 
                      background: fee.payment_status === 'Paid' ? '#ECFDF5' : '#FEF2F2', 
                      color: fee.payment_status === 'Paid' ? '#059669' : '#EF4444',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {fee.payment_status === 'Paid' ? 'PAID' : 'UNPAID'}
                    </span>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)', marginTop: '16px' }}>Room {fee.room_id.room_number}</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Duration: {fee.duration} Months</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Amount Due</p>
                    <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-text)', letterSpacing: '-1px' }}>₹{fee.amount}</p>
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', borderRadius: '20px', padding: '24px', marginBottom: '32px', border: '1px solid #F1F5F9' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <Clock size={20} />
                      </div>
                      <div>
                         <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Allocation Date</p>
                         <p style={{ fontWeight: 700, color: 'var(--color-text)' }}>{new Date(fee.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <ShieldCheck size={20} />
                      </div>
                      <div>
                         <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Security Status</p>
                         <p style={{ fontWeight: 700, color: 'var(--color-text)' }}>Razorpay Verified Secure</p>
                      </div>
                   </div>
                </div>

                {fee.payment_status !== 'Paid' ? (
                  <button 
                    onClick={() => handlePay(fee._id, fee.amount)}
                    disabled={paying}
                    className="btn-primary"
                    style={{ width: '100%', padding: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', fontSize: '1rem' }}
                  >
                    {paying ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ width: '20px', height: '20px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} />
                    ) : (
                      <>
                        <CreditCard size={20} />
                        Pay Now via Razorpay
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#059669', fontWeight: 700, padding: '16px', background: '#F0FDF4', borderRadius: '14px' }}>
                      <CheckCircle size={20} />
                      Paid
                    </div>
                    <button 
                      onClick={() => handleDownloadReceipt(fee)}
                      className="btn-secondary" 
                      style={{ padding: '16px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}
                    >
                      <Download size={20} />
                      Receipt
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Fees;
