import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';
import { Key, ShieldCheck, AlertCircle, Lock, CheckCircle, ShieldAlert, Sparkles, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/cn';

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
    <div className="flex flex-col items-center py-12">
      <div className="w-full max-w-xl space-y-8">
        <header className="text-center">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
             <Lock size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Security Settings</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your account protection and credentials</p>
        </header>

        <Card className="border-none shadow-slate-200/50 overflow-hidden relative group">
           <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600" />
           <CardHeader className="p-8 pb-0">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-slate-50 rounded-2xl text-indigo-600 border border-slate-100">
                    <ShieldCheck size={24} />
                 </div>
                 <div>
                    <CardTitle className="text-xl font-black tracking-tight">Update Password</CardTitle>
                    <CardDescription className="font-medium">Ensure your account stays secure</CardDescription>
                 </div>
              </div>
           </CardHeader>

           <CardContent className="p-8">
              <AnimatePresence mode="wait">
                {message.text && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className={cn(
                      "p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border",
                      message.type === 'error' ? "bg-rose-50 border-rose-100 text-rose-700" : "bg-emerald-50 border-emerald-100 text-emerald-700"
                    )}
                  >
                    {message.type === 'error' ? <ShieldAlert size={18} /> : <CheckCircle size={18} />}
                    {message.text}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                    <input 
                      type="password" 
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                 </div>

                 <div className="h-px bg-slate-100 my-8" />

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                    <input 
                      type="password" 
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                    <input 
                      type="password" 
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
                      placeholder="Re-type new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                 </div>

                 <Button 
                  variant="gradient" 
                  className="w-full h-14 rounded-2xl font-black tracking-tight mt-4 gap-2"
                  isLoading={loading}
                 >
                    <Sparkles size={18} /> Update Credentials <ChevronRight size={18} />
                 </Button>
              </form>
           </CardContent>
        </Card>

        <p className="text-center text-xs font-bold text-slate-400 max-w-sm mx-auto leading-relaxed uppercase tracking-widest">
           Your password is encrypted and never stored in plain text.
        </p>
      </div>
    </div>
  );
};

export default ChangePassword;
