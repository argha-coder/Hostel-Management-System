import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { api } from '../utils/api';
import { Key, ShieldCheck, AlertCircle } from 'lucide-react';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters long' });
      return;
    }

    setLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', background: 'var(--color-bg)', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: '300px', padding: '40px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <header style={{ marginBottom: '40px', width: '100%', maxWidth: '500px' }}>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--color-accent)', fontWeight: 700 }}>Security Settings</h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '5px' }}>Manage your account security and password</p>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="minimal-card" 
          style={{ width: '100%', maxWidth: '500px', padding: '40px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
            <div style={{ background: 'var(--color-accent-light)', padding: '10px', borderRadius: '12px' }}>
              <ShieldCheck size={24} color="var(--color-accent)" />
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Update Password</h2>
          </div>

          {message.text && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                padding: '15px', 
                borderRadius: '10px', 
                marginBottom: '25px',
                backgroundColor: message.type === 'error' ? '#FEF2F2' : '#F0FDF4',
                border: `1px solid ${message.type === 'error' ? '#FCA5A5' : '#86EFAC'}`,
                color: message.type === 'error' ? '#991B1B' : '#166534',
                fontSize: '0.9rem'
              }}
            >
              {message.type === 'error' ? <AlertCircle size={18} /> : <ShieldCheck size={18} />}
              {message.text}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text)' }}>
                Current Password
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="password" 
                  className="input-outline"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', margin: '10px 0' }}></div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text)' }}>
                New Password
              </label>
              <input 
                type="password" 
                className="input-outline"
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text)' }}>
                Confirm New Password
              </label>
              <input 
                type="password" 
                className="input-outline"
                placeholder="Re-type new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
              style={{ marginTop: '10px', padding: '14px' }}
            >
              {loading ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </motion.div>

        <div style={{ marginTop: '30px', maxWidth: '500px', width: '100%', padding: '0 20px' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textAlign: 'center', lineHeight: 1.6 }}>
            For your security, please ensure your new password is unique and not used on other platforms. 
            You will not be logged out after changing your password.
          </p>
        </div>
      </main>
    </div>
  );
};

export default ChangePassword;
