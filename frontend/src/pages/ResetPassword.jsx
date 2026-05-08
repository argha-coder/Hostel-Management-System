import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, ShieldCheck, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { api } from '../utils/api';
import { Button } from '../components/ui/Button';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.put(`/auth/reset-password/${token}`, { password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Link may be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-50 rounded-full blur-3xl -ml-32 -mb-32 opacity-50" />

      <div className="w-full max-w-md relative z-10">
        <div className="mb-12 text-center">
           <motion.div 
             initial={{ opacity: 0, scale: 0.5 }}
             animate={{ opacity: 1, scale: 1 }}
             className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-slate-200/50 border border-slate-100"
           >
              <span className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-indigo-600 via-blue-500 to-indigo-800">U</span>
           </motion.div>
           <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">New Password.</h2>
           <p className="text-slate-500 font-medium">Please enter your new security credentials</p>
        </div>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 text-center space-y-6"
            >
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">All set!</h3>
                <p className="text-slate-500 font-medium mt-2">
                  Your password has been reset successfully. Redirecting you to login...
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.form 
              onSubmit={handleSubmit}
              className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 space-y-6"
            >
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 font-bold text-xs"
                  >
                    <ShieldAlert size={16} />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                  <input 
                    type="password" 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                  <input 
                    type="password" 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button 
                variant="gradient" 
                className="w-full h-14 rounded-2xl font-black text-lg tracking-tight shadow-indigo-100 mt-4"
                isLoading={loading}
              >
                Update Password
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ResetPassword;
