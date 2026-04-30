import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { api } from '../utils/api';
import { Clock, CheckCircle, XCircle, FileText, Send, Calendar, User, ClipboardList } from 'lucide-react';

const GatePass = () => {
  const [gatePasses, setGatePasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApplyForm, setShowApplyForm] = useState(false);
  
  // Apply Form State
  const [reason, setReason] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [returnTime, setReturnTime] = useState('');

  const navigate = useNavigate();
  const { userInfo } = useSelector(state => state.auth);
  const isAdmin = userInfo?.role === 'Admin';

  // Get current time in ISO format for datetime-local min attribute
  const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };
  
  const minDateTime = getCurrentDateTime();

  useEffect(() => {
    if (userInfo) {
      fetchGatePasses();
    }
  }, [userInfo, isAdmin]);

  const fetchGatePasses = async () => {
    try {
      const endpoint = isAdmin ? '/gatepass' : '/gatepass/my';
      const data = await api.get(endpoint);
      setGatePasses(data);
    } catch (err) {
      setError(err.message || 'Failed to load gate passes');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!reason || !departureTime || !returnTime) return;

    const now = new Date();
    const departureDate = new Date(departureTime);
    
    // Set to start of minute for comparison
    now.setSeconds(0, 0);
    departureDate.setSeconds(0, 0);

    if (departureDate < now) {
      alert('Departure time cannot be in the past');
      return;
    }

    if (new Date(returnTime) <= departureDate) {
      alert('Return time must be after departure time');
      return;
    }
    
    try {
      const data = await api.post('/gatepass', {
        reason,
        departure_time: departureTime,
        return_time: returnTime
      });
      setGatePasses([data, ...gatePasses]);
      setShowApplyForm(false);
      setReason('');
      setDepartureTime('');
      setReturnTime('');
    } catch (err) {
      alert(err.message || 'Failed to apply for gate pass');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    console.log(`Attempting to update GatePass ${id} to ${status}`);
    try {
      const confirmation = window.confirm(`Are you sure you want to ${status.toLowerCase()} this request?`);
      if (!confirmation) {
        console.log('Update cancelled by user');
        return;
      }

      // Simplified: Just use a default note for now to ensure functionality works
      const payload = { 
        status,
        review_note: `${status} by Warden on ${new Date().toLocaleDateString()}`
      };

      console.log('Sending PUT request to backend...');
      const data = await api.put(`/gatepass/${id}`, payload);
      console.log('Backend response received:', data);
      
      if (data && data._id) {
        setGatePasses(prevPasses => {
          const updated = prevPasses.map(gp => String(gp._id) === String(id) ? data : gp);
          console.log('Updated state with new data');
          return updated;
        });
      } else {
        console.error('Invalid response structure:', data);
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Update Status Error:', err);
      alert(err.message || 'Failed to update status');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending': return { bg: '#FEF3C7', text: '#D97706', icon: <Clock size={16} /> };
      case 'Approved': return { bg: '#D1FAE5', text: '#059669', icon: <CheckCircle size={16} /> };
      case 'Declined': return { bg: '#FEE2E2', text: '#DC2626', icon: <XCircle size={16} /> };
      default: return { bg: '#F3F4F6', text: '#4B5563', icon: null };
    }
  };

  if (!userInfo) {
    return (
      <div style={{ display: 'flex', background: 'var(--color-bg)', minHeight: '100vh' }}>
        <Sidebar />
        <main style={{ marginLeft: '300px', padding: '40px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>Loading user information...</p>
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', background: 'var(--color-bg)', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: '300px', padding: '40px', flex: 1 }}>
        <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: 'var(--color-accent)', fontWeight: 700 }}>Gate Pass Requests</h1>
            <p style={{ color: 'var(--color-text-muted)', marginTop: '5px' }}>
              {isAdmin ? 'Review and manage student leave requests' : 'Apply for and track your gate pass status'}
            </p>
          </div>
          {!isAdmin && (
            <button 
              onClick={() => setShowApplyForm(true)}
              className="btn-primary" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Send size={18} /> Apply for Pass
            </button>
          )}
        </header>

        {showApplyForm && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="minimal-card" 
            style={{ padding: '30px', marginBottom: '40px', border: '1px solid var(--color-accent)' }}
          >
            <h3 style={{ marginBottom: '20px', fontWeight: 600 }}>New Gate Pass Application</h3>
            <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>Reason for Leave</label>
                <textarea 
                  className="input-outline" 
                  style={{ minHeight: '80px', padding: '12px' }}
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)} 
                  placeholder="e.g. Going home for the weekend / Medical appointment" 
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>Departure Date & Time</label>
                  <input 
                    type="datetime-local"
                    className="input-outline" 
                    value={departureTime} 
                    min={minDateTime}
                    onChange={(e) => setDepartureTime(e.target.value)} 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>Expected Return Date & Time</label>
                  <input 
                    type="datetime-local"
                    className="input-outline" 
                    value={returnTime} 
                    min={departureTime || minDateTime}
                    onChange={(e) => setReturnTime(e.target.value)} 
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowApplyForm(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Submit Application</button>
              </div>
            </form>
          </motion.div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: 'var(--color-text-muted)' }}>Loading requests...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <AnimatePresence>
              {gatePasses.map((gp) => {
                const status = getStatusStyle(gp.status);
                return (
                  <motion.div
                    key={gp._id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="minimal-card"
                    style={{ padding: '25px', display: 'grid', gridTemplateColumns: isAdmin ? '2fr 3fr 2fr' : '3fr 2fr', gap: '30px', alignItems: 'center' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ 
                          padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                          background: status.bg, color: status.text, display: 'flex', alignItems: 'center', gap: '6px'
                        }}>
                          {status.icon} {gp.status.toUpperCase()}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                          Applied on {new Date(gp.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                        <FileText size={18} color="var(--color-accent)" />
                        <p style={{ fontWeight: 500 }}>{gp.reason}</p>
                      </div>
                      {isAdmin && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                          <User size={16} color="var(--color-text-muted)" />
                          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{gp.student_id?.name || 'Unknown Student'}</span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>({gp.student_id?.email || 'No email'})</span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '20px' }}>
                      <div style={{ flex: 1, background: 'var(--color-bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                        <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '4px', fontWeight: 600 }}>Departure</p>
                        <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>{new Date(gp.departure_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                      </div>
                      <div style={{ flex: 1, background: 'var(--color-bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                        <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '4px', fontWeight: 600 }}>Expected Return</p>
                        <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>{new Date(gp.return_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                      </div>
                    </div>

                    {isAdmin ? (
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        {gp.status === 'Pending' ? (
                          <>
                            <button 
                              onClick={() => handleStatusUpdate(gp._id, 'Approved')}
                              className="btn-primary" 
                              style={{ background: '#10B981', border: 'none', padding: '8px 16px', fontSize: '0.85rem' }}
                            >
                              Accept
                            </button>
                            <button 
                              onClick={() => handleStatusUpdate(gp._id, 'Declined')}
                              className="btn-secondary" 
                              style={{ color: '#DC2626', borderColor: '#FCA5A5', padding: '8px 16px', fontSize: '0.85rem' }}
                            >
                              Decline
                            </button>
                          </>
                        ) : (
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                              Note: {gp.review_note || 'No note provided'}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      gp.review_note && (
                        <div style={{ gridColumn: 'span 2', marginTop: '10px', padding: '12px', background: '#F9FAFB', borderRadius: '8px', borderLeft: `4px solid ${status.text}` }}>
                          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                            <strong>Warden's Note:</strong> {gp.review_note}
                          </p>
                        </div>
                      )
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {gatePasses.length === 0 && (
              <div style={{ textAlign: 'center', padding: '100px', background: 'var(--color-surface)', borderRadius: '12px', border: '1px dashed var(--color-border)' }}>
                <ClipboardList size={48} color="var(--color-text-muted)" style={{ marginBottom: '15px' }} />
                <p style={{ color: 'var(--color-text-muted)' }}>No gate pass requests found.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default GatePass;
