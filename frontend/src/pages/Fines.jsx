import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { useSelector } from 'react-redux';
import { api } from '../utils/api';
import { AlertTriangle, Plus, CheckCircle, Trash2, User, Calendar, DollarSign, Filter } from 'lucide-react';

const Fines = () => {
  const [fines, setFines] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showIssueForm, setShowIssueForm] = useState(false);
  
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
      // Ensure we have a valid list to append to
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
    <div style={{ display: 'flex', background: 'var(--color-bg)', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: '300px', padding: '40px', flex: 1 }}>
        <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: 'var(--color-accent)', fontWeight: 700 }}>Student Fines</h1>
            <p style={{ color: 'var(--color-text-muted)', marginTop: '5px' }}>
              {isAdmin ? 'Manage and issue fines for students' : 'View your issued fines and payment status'}
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

        {showIssueForm && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="minimal-card" 
            style={{ padding: '30px', marginBottom: '40px', border: '1px solid var(--color-accent)' }}
          >
            <h3 style={{ marginBottom: '20px', fontWeight: 600 }}>Issue a Fine</h3>
            <form onSubmit={handleIssueFine} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>Select Student</label>
                  <select 
                    className="input-outline"
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    required
                  >
                    <option value="">Choose a student...</option>
                    {students.map(s => (
                      <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>Fine Amount (₹)</label>
                  <input 
                    type="number"
                    className="input-outline" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    placeholder="e.g. 500"
                    required
                  />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>Reason for Fine</label>
                <textarea 
                  className="input-outline" 
                  style={{ minHeight: '80px', padding: '12px' }}
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)} 
                  placeholder="e.g. Late entry / Damage to property" 
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowIssueForm(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Issue Fine</button>
              </div>
            </form>
          </motion.div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: 'var(--color-text-muted)' }}>Loading fines...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <AnimatePresence>
              {fines.map((fine) => (
                <motion.div
                  key={fine._id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="minimal-card"
                  style={{ padding: '25px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '30px', alignItems: 'center' }}
                >
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ 
                      padding: '12px', borderRadius: '12px', 
                      background: fine.status === 'Paid' ? '#D1FAE5' : '#FEE2E2',
                      color: fine.status === 'Paid' ? '#059669' : '#DC2626'
                    }}>
                      <AlertTriangle size={24} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>₹{fine.amount}</h4>
                        <span style={{ 
                          padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700,
                          background: fine.status === 'Paid' ? '#D1FAE5' : '#FEE2E2',
                          color: fine.status === 'Paid' ? '#059669' : '#DC2626'
                        }}>
                          {fine.status.toUpperCase()}
                        </span>
                      </div>
                      <p style={{ fontWeight: 500, marginTop: '5px' }}>{fine.reason}</p>
                      {isAdmin && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          Issued to: <strong>{fine.student_id?.name}</strong> ({fine.student_id?.email})
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                      <Calendar size={14} />
                      <span>{new Date(fine.issued_at).toLocaleDateString()}</span>
                    </div>
                    {fine.status === 'Paid' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#059669' }}>
                        <CheckCircle size={14} />
                        <span>Paid on {new Date(fine.paid_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      {fine.status === 'Pending' && (
                        <button 
                          onClick={() => handleMarkAsPaid(fine._id)}
                          className="btn-primary" 
                          style={{ background: '#10B981', border: 'none', padding: '8px 16px', fontSize: '0.85rem' }}
                        >
                          Mark as Paid
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteFine(fine._id)}
                        className="btn-secondary" 
                        style={{ color: '#DC2626', borderColor: '#FCA5A5', padding: '8px 16px', fontSize: '0.85rem' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {fines.length === 0 && (
              <div style={{ textAlign: 'center', padding: '100px', background: 'var(--color-surface)', borderRadius: '12px', border: '1px dashed var(--color-border)' }}>
                <DollarSign size={48} color="var(--color-text-muted)" style={{ marginBottom: '15px' }} />
                <p style={{ color: 'var(--color-text-muted)' }}>No fine records found.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Fines;
