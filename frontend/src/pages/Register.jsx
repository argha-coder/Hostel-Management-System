import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import OTPInput from '../components/OTPInput';
import { api } from '../utils/api';
import { Mail, Lock, User, ArrowRight, Shield, ShieldCheck, Sparkles, ChevronRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/cn';

const Register = () => {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep]         = useState(1);
  const [otp, setOtp]           = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please provide all required fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      console.log('Sending registration request to /auth/register...');
      await api.post('/auth/register', { name, email, password });
      console.log('Registration request successful, moving to OTP step');
      setStep(2);
    } catch (err) {
      console.error('Registration Error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return;
    setError('');
    setLoading(true);
    try {
      console.log('Verifying OTP...');
      const data = await api.post('/auth/verify-register', { name, email, password, otp });
      console.log('OTP verification successful:', data);
      dispatch(setCredentials(data));
      navigate('/dashboard');
    } catch (err) {
      console.error('Verify OTP Error:', err);
      setError(err.message || 'Invalid OTP. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans overflow-hidden">
      {/* Visual Side Panel (Shared with Login) */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 relative overflow-hidden items-center justify-center p-20">
         <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800" />
         
         <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <motion.div 
                key={i}
                className="absolute bg-white/5 rounded-full"
                style={{
                  width: Math.random() * 300 + 50,
                  height: Math.random() * 300 + 50,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  scale: [1, 1.1, 1],
                  opacity: [0.05, 0.1, 0.05]
                }}
                transition={{
                  duration: Math.random() * 5 + 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
         </div>

         <div className="relative z-10 text-white max-w-lg">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 bg-white rounded-3xl w-fit shadow-2xl shadow-indigo-900/20"
            >
               <span className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br from-indigo-500 via-blue-600 to-indigo-700 leading-none block px-1">U</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl font-black tracking-tighter leading-none mb-6"
            >
              Everything Your Hostel Needs, In One Place.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-indigo-100 font-medium leading-relaxed mb-12"
            >
              The ultimate management platform for students and administrators.
            </motion.p>
            
            <div className="space-y-4">
               {['Instant Resident Onboarding', 'Verified Security Protocols', 'Premium Campus Services'].map((feat, i) => (
                 <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                 >
                    <div className="p-1 bg-emerald-400 rounded-full">
                       <CheckCircle2 size={14} className="text-indigo-900" />
                    </div>
                    <span className="font-bold text-indigo-50">{feat}</span>
                 </motion.div>
               ))}
            </div>
         </div>
         <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Registration Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-20 relative">
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-50 rounded-full blur-3xl -ml-32 -mb-32 opacity-50" />

         <div className="w-full max-w-md relative z-10">
             <div className="mb-12">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.5 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="w-16 h-16 bg-white rounded-[1.25rem] flex items-center justify-center mb-8 shadow-xl shadow-slate-200/50 border border-slate-100"
               >
                  <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-br from-indigo-600 via-blue-500 to-indigo-800">U</span>
               </motion.div>
               <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Create Account.</h2>
               <p className="text-slate-500 font-medium">Join the UHostel community today</p>
            </div>

            <AnimatePresence mode="wait">
               {error && (
                 <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 font-bold mb-8"
                 >
                    <ShieldAlert size={20} />
                    {error}
                 </motion.div>
               )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
               {step === 1 ? (
                 <motion.form 
                  key="register"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleRegisterSubmit}
                  className="space-y-5"
                 >
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                       <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                          <input 
                            type="text" 
                            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                       <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                          <input 
                            type="email" 
                            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                       <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                          <input 
                            type="password" 
                            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                          />
                       </div>
                    </div>
                    
                    <Button 
                      variant="gradient" 
                      className="w-full h-14 rounded-2xl font-black text-lg tracking-tight shadow-indigo-100 mt-4 group"
                      isLoading={loading}
                    >
                       Get Started <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                    </Button>
                 </motion.form>
               ) : (
                 <motion.div 
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col items-center text-center"
                 >
                    <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mb-6">
                       <ShieldCheck size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Verify Email</h3>
                    <p className="text-slate-500 font-medium mt-2 mb-10">We've sent a 6-digit verification code to <span className="text-slate-900 font-bold">{email}</span></p>
                    
                    <OTPInput length={6} onComplete={(val) => setOtp(val)} />
                    
                    <Button 
                      variant="gradient" 
                      className="w-full h-14 rounded-2xl font-black text-lg tracking-tight shadow-indigo-100 mt-10"
                      onClick={handleVerifyOTP}
                      isLoading={loading}
                      disabled={otp.length !== 6}
                    >
                       Verify & Continue
                    </Button>
                    
                    <button 
                      onClick={() => setStep(1)}
                      className="mt-6 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                    >
                       Back to form
                    </button>
                 </motion.div>
               )}
            </AnimatePresence>

            <div className="mt-12 pt-8 border-t border-slate-100 text-center">
               <p className="text-slate-500 font-medium">Already have an account? <Link to="/login" className="text-indigo-600 font-black hover:text-indigo-700 underline-offset-4 hover:underline transition-all">Sign in</Link></p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Register;
