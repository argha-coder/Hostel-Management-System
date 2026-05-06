import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { api } from '../utils/api';
import { Search, Filter, Download, User, CreditCard, Clock, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import GlowOrb from '../components/GlowOrb';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const data = await api.get('/payments/all');
      setPayments(data);
    } catch (err) {
      console.error("Failed to fetch payments", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment record? This will remove the fee from the student dashboard.')) return;
    try {
      await api.delete(`/payments/${id}`);
      setPayments(prev => prev.filter(p => p._id !== id));
      alert('Record deleted successfully');
    } catch (err) {
      alert(err.message || 'Failed to delete record');
    }
  };

  const filteredPayments = payments.filter(p => {
    const nameMatch = p.student_id?.name?.toLowerCase().includes(search.toLowerCase());
    const roomMatch = p.room_id?.room_number?.includes(search);
    const matchesSearch = nameMatch || roomMatch;
    
    let matchesFilter = filter === 'All';
    if (filter === 'Paid') matchesFilter = p.payment_status === 'Paid';
    if (filter === 'Unpaid') matchesFilter = p.payment_status === 'Unpaid';
    
    return matchesSearch && matchesFilter;
  });

  const exportToCSV = () => {
    const headers = ['Student Name', 'Email', 'Room Number', 'Duration (Months)', 'Amount', 'Status', 'Date'];
    const csvRows = [
      headers.join(','),
      ...filteredPayments.map(p => [
        `"${p.student_id?.name || 'N/A'}"`,
        `"${p.student_id?.email || 'N/A'}"`,
        p.room_id?.room_number || 'N/A',
        p.duration,
        p.amount,
        p.payment_status,
        new Date(p.start_date).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `hostel_payments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div style={{ display: 'flex', background: 'var(--color-bg)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Sidebar />
      <GlowOrb color="rgba(79, 70, 229, 0.08)" size="600px" top="-10%" left="50%" />
      
      <main style={{ marginLeft: '300px', padding: '48px', flex: 1, zIndex: 1 }}>
        <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: '2.25rem', color: 'var(--color-text)', fontWeight: 800, letterSpacing: '-1px' }}
            >
              Payment Records
            </motion.h1>
            <p style={{ color: 'var(--color-text-muted)', marginTop: '8px', fontWeight: 500 }}>
              Monitor student fee payments and identify outstanding dues
            </p>
          </div>
          <button 
            onClick={exportToCSV}
            className="btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px' }}
          >
            <Download size={18} /> Export CSV
          </button>
        </header>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search by student name or room number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-card"
              style={{ width: '100%', padding: '16px 16px 16px 56px', background: 'rgba(255, 255, 255, 0.8)', border: '1px solid rgba(255, 255, 255, 0.5)', outline: 'none', fontWeight: 500 }}
            />
          </div>
          <div style={{ display: 'flex', background: 'white', padding: '6px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
            {['All', 'Paid', 'Unpaid'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '10px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  background: filter === f ? 'var(--color-primary)' : 'transparent',
                  color: filter === f ? 'white' : 'var(--color-text-muted)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              style={{ width: '40px', height: '40px', border: '3px solid var(--color-primary-light)', borderTopColor: 'var(--color-primary)', borderRadius: '50%' }}
            />
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '24px', color: 'var(--color-text-muted)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>Student</th>
                  <th style={{ padding: '24px', color: 'var(--color-text-muted)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>Room Info</th>
                  <th style={{ padding: '24px', color: 'var(--color-text-muted)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>Amount</th>
                  <th style={{ padding: '24px', color: 'var(--color-text-muted)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>Allocation Date</th>
                  <th style={{ padding: '24px', color: 'var(--color-text-muted)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '24px', color: 'var(--color-text-muted)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p) => (
                  <tr key={p._id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.2s ease' }}>
                    <td style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                          {p.student_id?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, color: 'var(--color-text)' }}>{p.student_id?.name || 'Unknown Student'}</p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{p.student_id?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '24px' }}>
                      <p style={{ fontWeight: 700, color: 'var(--color-text)' }}>Room {p.room_id?.room_number || 'N/A'}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{p.duration} Months Duration</p>
                    </td>
                    <td style={{ padding: '24px' }}>
                      <p style={{ fontWeight: 800, color: 'var(--color-text)', fontSize: '1.1rem' }}>₹{p.amount}</p>
                    </td>
                    <td style={{ padding: '24px' }}>
                      <p style={{ fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                        {new Date(p.start_date).toLocaleDateString()}
                      </p>
                    </td>
                    <td style={{ padding: '24px' }}>
                      <span style={{ 
                        padding: '6px 14px', 
                        borderRadius: '10px', 
                        background: p.payment_status === 'Paid' ? '#ECFDF5' : '#FEF2F2', 
                        color: p.payment_status === 'Paid' ? '#059669' : '#EF4444',
                        fontSize: '0.8rem',
                        fontWeight: 700
                      }}>
                        {p.payment_status === 'Paid' ? 'PAID' : 'UNPAID'}
                      </span>
                    </td>
                    <td style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>View</button>
                        {p.payment_status === 'Unpaid' && (
                          <button 
                            onClick={() => handleDeleteRecord(p._id)}
                            className="btn-secondary" 
                            style={{ padding: '8px', color: '#EF4444', borderColor: '#FCA5A5' }}
                            title="Delete record"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPayments.length === 0 && (
              <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No allocated students found matching your criteria.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPayments;
