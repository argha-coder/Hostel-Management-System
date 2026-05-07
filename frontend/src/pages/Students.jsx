import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { User as UserIcon, Mail, Shield, CheckCircle, XCircle, Trash2, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../utils/api';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  const navigate = useNavigate();
  const { userInfo } = useSelector(state => state.auth);

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Room', 'Status'];
    const csvRows = [
      headers.join(','),
      ...students.map(s => [
        `"${s.name}"`,
        `"${s.email}"`,
        s.room_id?.room_number || 'Not Assigned',
        s.isVerified ? 'Verified' : 'Unverified'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_list_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  useEffect(() => {
    fetchStudents();
  }, [page]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/auth/users?page=${page}&limit=12`);
      // Handle both old array format and new paginated object format
      if (data.users) {
        setStudents(data.users);
        setTotalPages(data.pages);
        setTotalStudents(data.total);
      } else {
        setStudents(data);
        setTotalPages(1);
      }
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
        <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: 'var(--color-accent)', fontWeight: 700 }}>Student Management</h1>
            <p style={{ color: 'var(--color-text-muted)', marginTop: '5px' }}>{totalStudents} Residents Registered</p>
          </div>
          <button 
            onClick={exportToCSV}
            className="btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
          >
            <Download size={18} /> Export Page CSV
          </button>
        </header>

        {error && (
          <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #F87171', padding: '15px', borderRadius: '8px', color: '#B91C1C', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: 'var(--color-text-muted)' }}>
             <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-primary-light)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
             <p>Fetching students...</p>
          </div>
        ) : (
          <>
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
                      <div style={{ overflow: 'hidden' }}>
                        <h3 style={{ fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{student.name}</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '40px' }}>
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  style={{ padding: '10px', borderRadius: '12px', border: '1px solid var(--color-border)', background: 'white', cursor: page === 1 ? 'default' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
                >
                  <ChevronLeft size={20} />
                </button>
                <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>Page {page} of {totalPages}</span>
                <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  style={{ padding: '10px', borderRadius: '12px', border: '1px solid var(--color-border)', background: 'white', cursor: page === totalPages ? 'default' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
        
        {students.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '100px', background: 'var(--color-surface)', borderRadius: '12px', border: '1px dashed var(--color-border)' }}>
            <p style={{ color: 'var(--color-text-muted)' }}>No students found.</p>
          </div>
        )}
      </main>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Students;
