import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import OTPInput from '../components/OTPInput';
import { Mail, Lock, User, ArrowRight, Shield } from 'lucide-react';

/* ── tiny floating dot ── */
const Particle = ({ style }) => (
  <motion.div
    style={{
      position: 'absolute',
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.18)',
      ...style,
    }}
    animate={{ y: [0, -30, 0], opacity: [0.4, 1, 0.4] }}
    transition={{ duration: style.duration, repeat: Infinity, ease: 'easeInOut', delay: style.delay }}
  />
);

const Register = () => {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep]         = useState(1);
  const [otp, setOtp]           = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const particles = [
    { width: 12, height: 12, top: '15%', left: '12%', duration: 4,   delay: 0   },
    { width: 8,  height: 8,  top: '70%', left: '8%',  duration: 5,   delay: 1   },
    { width: 16, height: 16, top: '40%', left: '78%', duration: 6,   delay: 0.5 },
    { width: 10, height: 10, top: '80%', left: '60%', duration: 4.5, delay: 2   },
    { width: 6,  height: 6,  top: '25%', left: '55%', duration: 3.5, delay: 1.5 },
    { width: 14, height: 14, top: '55%', left: '30%', duration: 5.5, delay: 0.8 },
  ];

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please provide all required fields');
      return;
    }
    if (!email.endsWith('@gmail.com') && !email.endsWith('@example.com') && !email.endsWith('@uhostel.com')) {
      setError('Only @gmail.com, @example.com or @uhostel.com addresses are allowed');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      });
      if (res.ok) {
        setStep(2);
      } else {
        const data = await res.json();
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration Error:', err);
      setError(`Server connection error: ${err.message}. Ensure backend is running on http://localhost:5001`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/auth/verify-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        dispatch(setCredentials(data));
        navigate('/dashboard');
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (err) {
      console.error('Verify OTP Error:', err);
      setError(`Server connection error: ${err.message}. Ensure backend is running on http://localhost:5001`);
    } finally {
      setLoading(false);
    }
  };

  /* ── shared input style factory ── */
  const inputStyle = (field) => ({
    width: '100%',
    padding: '14px 16px 14px 48px',
    borderRadius: '14px',
    border: `2px solid ${focusedField === field ? '#6366f1' : '#E8EDF5'}`,
    background: focusedField === field ? '#fff' : '#F8FAFC',
    fontSize: '0.95rem',
    fontWeight: 500,
    color: '#1E293B',
    outline: 'none',
    transition: 'all 0.25s ease',
    boxShadow: focusedField === field ? '0 0 0 4px rgba(99,102,241,0.12)' : 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  });

  const iconStyle = {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94A3B8',
    pointerEvents: 'none',
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── LEFT PANEL ── */}
      <motion.div
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        style={{
          width: '45%',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 70%, #6366f1 100%)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px',
          overflow: 'hidden',
        }}
      >
        {/* Animated blobs */}
        <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 7, repeat: Infinity }}
          style={{ position: 'absolute', width: '350px', height: '350px', borderRadius: '50%', background: 'rgba(99,102,241,0.35)', top: '-80px', right: '-80px', filter: 'blur(60px)' }} />
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 9, repeat: Infinity, delay: 2 }}
          style={{ position: 'absolute', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(56,189,248,0.25)', bottom: '-60px', left: '-60px', filter: 'blur(60px)' }} />

        {/* Floating particles */}
        {particles.map((p, i) => <Particle key={i} style={p} />)}

        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', color: '#fff' }}>
          <motion.img
            src="/icon.svg"
            alt="UHostel"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 180 }}
            style={{ width: '88px', height: '88px', borderRadius: '24px', marginBottom: '32px', boxShadow: '0 16px 48px rgba(0,0,0,0.3)' }}
          />
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            style={{ fontSize: '2.8rem', fontWeight: 900, letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: '16px' }}
          >
            UHostel
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, maxWidth: '280px', margin: '0 auto 40px' }}
          >
            Your complete hostel management platform — rooms, gate passes, canteen & more.
          </motion.p>

          {/* Feature pills */}
          {['🏠 Room Management', '🔐 Secure Gate Pass', '🍽️ E-Canteen'].map((feat, i) => (
            <motion.div key={feat}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.1 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '50px', padding: '8px 20px', margin: '6px',
                fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)', fontWeight: 600,
              }}
            >
              {feat}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── RIGHT PANEL ── */}
      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F8FAFC',
          padding: '40px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle bg blob */}
        <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(99,102,241,0.06)', top: '-80px', right: '-80px', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(56,189,248,0.06)', bottom: '-40px', left: '-40px', filter: 'blur(40px)' }} />

        <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px', marginBottom: '8px' }}>
              Create account
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.95rem', fontWeight: 500 }}>
              Join UHostel and get started today
            </p>
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '12px 16px', color: '#DC2626', fontSize: '0.85rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form / OTP */}
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
              >
                {/* Full Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', letterSpacing: '0.3px', textTransform: 'uppercase' }}>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <span style={iconStyle}><User size={18} /></span>
                    <input type="text" value={name} onChange={e => setName(e.target.value)}
                      onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                        style={inputStyle('name')} />
                  </div>
                </div>

                {/* Email */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', letterSpacing: '0.3px', textTransform: 'uppercase' }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <span style={iconStyle}><Mail size={18} /></span>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                        style={inputStyle('email')} />
                  </div>
                </div>

                {/* Password */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', letterSpacing: '0.3px', textTransform: 'uppercase' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <span style={iconStyle}><Lock size={18} /></span>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                        style={inputStyle('password')} />
                  </div>
                </div>

                {/* Submit button */}
                <motion.button
                  type="submit" disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
                  style={{
                    marginTop: '8px', width: '100%', padding: '15px',
                    background: loading ? '#A5B4FC' : 'linear-gradient(135deg, #4F46E5, #6366f1)',
                    color: '#fff', border: 'none', borderRadius: '14px',
                    fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    boxShadow: loading ? 'none' : '0 8px 24px rgba(99,102,241,0.35)',
                    transition: 'all 0.25s ease', fontFamily: 'inherit',
                  }}
                >
                  {loading ? (
                    <><motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{ display: 'inline-block', width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%' }} />
                      Sending OTP...</>
                  ) : (<>Create Account <ArrowRight size={18} /></>)}
                </motion.button>
              </motion.form>
            ) : (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
              >
                <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'linear-gradient(135deg,#EEF2FF,#E0E7FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <Shield size={32} color="#6366f1" />
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>Check your inbox</h3>
                <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '32px', lineHeight: 1.6 }}>
                  We've sent a 6-digit code to<br />
                  <strong style={{ color: '#1E293B' }}>{email}</strong>
                </p>
                <OTPInput length={6} onComplete={(val) => setOtp(val)} />
                <motion.button
                  onClick={handleVerifyOTP} disabled={loading || otp.length !== 6}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  style={{
                    marginTop: '28px', width: '100%', padding: '15px',
                    background: (loading || otp.length !== 6) ? '#CBD5E1' : 'linear-gradient(135deg, #4F46E5, #6366f1)',
                    color: '#fff', border: 'none', borderRadius: '14px',
                    fontSize: '1rem', fontWeight: 700,
                    cursor: (loading || otp.length !== 6) ? 'not-allowed' : 'pointer',
                    boxShadow: (loading || otp.length !== 6) ? 'none' : '0 8px 24px rgba(99,102,241,0.35)',
                    fontFamily: 'inherit',
                  }}
                >
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </motion.button>
                <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '0.85rem', marginTop: '16px', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>
                  ← Back to Registration
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            style={{ marginTop: '36px', paddingTop: '24px', borderTop: '1px solid #E2E8F0', textAlign: 'center' }}
          >
            <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 700 }}>Sign in</Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
