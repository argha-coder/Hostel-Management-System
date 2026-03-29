import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { useSelector } from 'react-redux';
import { api } from '../utils/api';
import { Megaphone, Plus, Trash2, Calendar, User, AlertCircle, Clock } from 'lucide-react';

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Add Notice Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('Normal');

  const { userInfo } = useSelector(state => state.auth);
  const isAdmin = userInfo?.role === 'Admin';

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const data = await api.get('/notices');
      setNotices(data);
    } catch (err) {
      console.error('Fetch Notices Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostNotice = async (e) => {
    e.preventDefault();
    if (!title || !content) return;
    
    try {
      const data = await api.post('/notices', {
        title,
        content,
        priority
      });
      setNotices([data, ...notices]);
      setShowAddForm(false);
      setTitle('');
      setContent('');
      setPriority('Normal');
      alert('Notice posted successfully!');
    } catch (err) {
      alert(err.message || 'Failed to post notice');
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      await api.delete(`/notices/${id}`);
      setNotices(notices.filter(n => n._id !== id));
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  const getPriorityColor = (p) => {
    switch(p) {
      case 'Urgent': return '#DC2626';
      case 'Normal': return '#2563EB';
      case 'Low': return '#6B7280';
      default: return '#4B5563';
    }
  };

  return (
    <div style={{ display: 'flex', background: 'var(--color-bg)', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: '300px', padding: '40px', flex: 1 }}>
        <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: 'var(--color-accent)', fontWeight: 700 }}>Notice Board</h1>
            <p style={{ color: 'var(--color-text-muted)', marginTop: '5px' }}>
              Important announcements and updates for all residents
            </p>
          </div>
          {isAdmin && (
            <button 
              onClick={() => setShowAddForm(true)}
              className="btn-primary" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Plus size={18} /> Post New Notice
            </button>
          )}
        </header>

        {showAddForm && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="minimal-card" 
            style={{ padding: '30px', marginBottom: '40px', border: '1px solid var(--color-accent)' }}
          >
            <h3 style={{ marginBottom: '20px', fontWeight: 600 }}>Post a New Announcement</h3>
            <form onSubmit={handlePostNotice} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>Notice Title</label>
                  <input 
                    type="text"
                    className="input-outline" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="e.g. Hostel Maintenance Update"
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>Priority Level</label>
                  <select 
                    className="input-outline"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>Announcement Details</label>
                <textarea 
                  className="input-outline" 
                  style={{ minHeight: '120px', padding: '12px' }}
                  value={content} 
                  onChange={(e) => setContent(e.target.value)} 
                  placeholder="Type the announcement here for all students to see..." 
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Post Announcement</button>
              </div>
            </form>
          </motion.div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: 'var(--color-text-muted)' }}>Loading announcements...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <AnimatePresence>
              {notices.map((notice) => (
                <motion.div
                  key={notice._id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="minimal-card"
                  style={{ 
                    padding: '30px', 
                    borderLeft: `5px solid ${getPriorityColor(notice.priority)}`,
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                      <div style={{ 
                        padding: '10px', borderRadius: '10px', 
                        background: getPriorityColor(notice.priority) + '15',
                        color: getPriorityColor(notice.priority)
                      }}>
                        <Megaphone size={20} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{notice.title}</h3>
                          <span style={{ 
                            padding: '3px 10px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 700,
                            background: getPriorityColor(notice.priority) + '20',
                            color: getPriorityColor(notice.priority),
                            textTransform: 'uppercase'
                          }}>
                            {notice.priority}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
                           <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                             <User size={14} /> {notice.author?.name} (Warden)
                           </span>
                           <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                             <Clock size={14} /> {new Date(notice.createdAt).toLocaleString()}
                           </span>
                        </div>
                      </div>
                    </div>
                    {isAdmin && (
                      <button 
                        onClick={() => handleDeleteNotice(notice._id)}
                        className="btn-secondary" 
                        style={{ color: '#DC2626', borderColor: '#FCA5A5', padding: '8px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  
                  <div style={{ 
                    padding: '20px', 
                    background: 'var(--color-bg)', 
                    borderRadius: '10px', 
                    fontSize: '1rem', 
                    lineHeight: '1.6',
                    color: 'var(--color-text)',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {notice.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {notices.length === 0 && (
              <div style={{ textAlign: 'center', padding: '100px', background: 'var(--color-surface)', borderRadius: '12px', border: '1px dashed var(--color-border)' }}>
                <AlertCircle size={48} color="var(--color-text-muted)" style={{ marginBottom: '15px' }} />
                <p style={{ color: 'var(--color-text-muted)' }}>No announcements posted yet.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Notices;
