import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { api } from '../utils/api';
import { ClipboardList, CheckCircle, XCircle, Clock, User, Bed, Calendar } from 'lucide-react';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await api.get('/bookings');
      setBookings(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Are you sure you want to approve this room request and assign the student?')) return;
    try {
      await api.put(`/bookings/${id}/approve`);
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'Approved' } : b));
      alert('Request approved successfully!');
    } catch (err) {
      alert(err.message || 'Approval failed');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this room request?')) return;
    try {
      await api.put(`/bookings/${id}/reject`);
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'Rejected' } : b));
      alert('Request rejected successfully!');
    } catch (err) {
      alert(err.message || 'Rejection failed');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending': return { bg: '#FEF3C7', text: '#D97706', icon: <Clock size={16} /> };
      case 'Approved': return { bg: '#D1FAE5', text: '#059669', icon: <CheckCircle size={16} /> };
      case 'Rejected': return { bg: '#FEE2E2', text: '#DC2626', icon: <XCircle size={16} /> };
      default: return { bg: '#F3F4F6', text: '#4B5563', icon: null };
    }
  };

  return (
    <div style={{ display: 'flex', background: 'var(--color-bg)', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: '300px', padding: '40px', flex: 1 }}>
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--color-accent)', fontWeight: 700 }}>Room Requests</h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '5px' }}>Manage and approve student room assignment requests</p>
        </header>

        {error && (
          <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #F87171', padding: '15px', borderRadius: '8px', color: '#B91C1C', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: 'var(--color-text-muted)' }}>Loading requests...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <AnimatePresence>
              {bookings.map((booking) => {
                const statusStyle = getStatusStyle(booking.status);
                return (
                  <motion.div
                    key={booking._id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="minimal-card"
                    style={{ padding: '25px', display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr', gap: '20px', alignItems: 'center' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)' }}>
                        <User size={20} />
                      </div>
                      <div>
                        <h4 style={{ fontWeight: 600 }}>{booking.student_id?.name}</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{booking.student_id?.email}</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Bed size={18} color="var(--color-accent)" />
                      <div>
                        <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>Room {booking.room_id?.room_number}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{booking.duration} Months Stay</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={16} color="var(--color-text-muted)" />
                      <p style={{ fontSize: '0.85rem' }}>{new Date(booking.start_date).toLocaleDateString()}</p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      {booking.status === 'Pending' ? (
                        <>
                          <button 
                            onClick={() => handleApprove(booking._id)}
                            className="btn-primary" 
                            style={{ background: '#10B981', border: 'none', padding: '8px 16px', fontSize: '0.85rem' }}
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleReject(booking._id)}
                            className="btn-secondary" 
                            style={{ color: '#DC2626', borderColor: '#FCA5A5', padding: '8px 16px', fontSize: '0.85rem' }}
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span style={{ 
                          padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                          background: statusStyle.bg, color: statusStyle.text, display: 'flex', alignItems: 'center', gap: '6px'
                        }}>
                          {statusStyle.icon} {booking.status.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {bookings.length === 0 && (
              <div style={{ textAlign: 'center', padding: '100px', background: 'var(--color-surface)', borderRadius: '12px', border: '1px dashed var(--color-border)' }}>
                <ClipboardList size={48} color="var(--color-text-muted)" style={{ marginBottom: '15px' }} />
                <p style={{ color: 'var(--color-text-muted)' }}>No room requests found.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Bookings;
