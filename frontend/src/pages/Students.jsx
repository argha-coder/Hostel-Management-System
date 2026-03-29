import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { User as UserIcon, Mail, Shield, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { api } from '../utils/api';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { userInfo } = useSelector(state => state.auth);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const data = await api.get('/auth/users');
      setStudents(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerification = async (student) => {
    try {
      const data = await api.put(`/auth/users/${student._id}`, { isVerified: !student.isVerified });
      setStudents(prev => prev.map(s => s._id === student._id ? { ...s, isVerified: data.isVerified } : s));
    } catch (err) {
      alert(err.message || 'Update failed');
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await api.delete(`/auth/users/${id}`);
      setStudents(students.filter(s => s._id !== id));
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  return (
    <div style={{ display: 'flex', background: 'var(--color-bg)', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: '300px', padding: '40px', flex: 1 }}>
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--color-accent)', fontWeight: 700 }}>Student Management</h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '5px' }}>View and manage hostel residents</p>
        </header>

        {error && (
          <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #F87171', padding: '15px', borderRadius: '8px', color: '#B91C1C', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: 'var(--color-text-muted)' }}>Loading students...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            <AnimatePresence>
              {students.map((student) => (
                <motion.div
                  key={student._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="minimal-card"
                  style={{ padding: '25px', position: 'relative' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--color-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)' }}>
                      <UserIcon size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 600, color: 'var(--color-text)' }}>{student.name}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Mail size={12} /> {student.email}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Room:</span>
                      <span style={{ fontWeight: 500 }}>{student.room_id?.room_number || 'Not Assigned'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Status:</span>
                      <span style={{ 
                        display: 'flex', alignItems: 'center', gap: '5px',
                        color: student.isVerified ? '#059669' : '#DC2626',
                        fontWeight: 600
                      }}>
                        {student.isVerified ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {student.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                  </div>

                  <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => handleToggleVerification(student)}
                      className="btn-secondary" 
                      style={{ flex: 1, fontSize: '0.8rem', padding: '8px' }}
                    >
                      {student.isVerified ? 'Revoke Verify' : 'Verify Student'}
                    </button>
                    <button 
                      onClick={() => handleDeleteStudent(student._id)}
                      style={{ padding: '8px', borderRadius: '8px', border: '1px solid #FCA5A5', background: 'transparent', color: '#DC2626', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        
        {students.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '100px', background: 'var(--color-surface)', borderRadius: '12px', border: '1px dashed var(--color-border)' }}>
            <p style={{ color: 'var(--color-text-muted)' }}>No students found.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Students;
