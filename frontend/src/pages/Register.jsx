import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import OTPInput from '../components/OTPInput';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please provide all required fields');
      return;
    }

    if (!email.endsWith('@gmail.com') && !email.endsWith('@example.com')) {
      setError('Only @gmail.com or @example.com addresses are allowed');
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
      const data = await res.json();
      
      if (res.ok) {
        setStep(2);
        if (data.dev_otp) {
          console.log('Development OTP:', data.dev_otp);
          setError(`[DEV MODE] Your OTP is: ${data.dev_otp}`);
        }
      } else {
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

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div
        className="minimal-card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ width: '380px', padding: '40px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-accent)', marginBottom: '10px' }}>
            UHostel<span style={{ color: 'var(--color-text)' }}>.</span>
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '5px' }}>Create an Account</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #F87171', padding: '12px', borderRadius: '8px', color: '#B91C1C', fontSize: '0.85rem', marginBottom: '20px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input 
              type="text" 
              placeholder="Full Name" 
              className="input-outline"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input 
              type="email" 
              placeholder="Email Address" 
              className="input-outline"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input 
              type="password" 
              placeholder="Password" 
              className="input-outline"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '8px', width: '100%' }}>
              {loading ? 'Processing...' : 'Continue'}
            </button>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p style={{ color: 'var(--color-text)', marginBottom: '5px', fontSize: '0.9rem' }}>Check your email</p>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '15px', fontSize: '0.85rem' }}>We sent a code to {email}</p>
            <OTPInput length={6} onComplete={(val) => { setOtp(val); }} />
            <button onClick={handleVerifyOTP} className="btn-primary" disabled={loading || otp.length !== 6} style={{ marginTop: '20px', width: '100%' }}>
              {loading ? 'Verifying...' : 'Complete Verification'}
            </button>
          </div>
        )}

        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 500 }}>Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
