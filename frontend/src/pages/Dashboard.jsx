import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { Bed, Home, CreditCard, Users, FileText, AlertTriangle, ShieldCheck, ArrowUpRight, Activity } from 'lucide-react';
import { api } from '../utils/api';
import GlowOrb from '../components/GlowOrb';

const AnimatedCounter = ({ from, to, duration = 2 }) => {
  const [count, setCount] = useState(from);

  useEffect(() => {
    let startTimestamp = null;
    let animationFrameId = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * (to - from) + from));
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };
    animationFrameId = window.requestAnimationFrame(step);
    return () => {
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
    };
  }, [from, to, duration]);

  return <span>{count}</span>;
}

const DashboardRowItem = ({ title, value, icon, prefix = '', onClick, color = 'var(--color-primary)', bgColor = 'var(--color-primary-light)' }) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="glass-card" 
      style={{ 
        padding: '28px', 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default',
        background: 'rgba(255, 255, 255, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ 
          width: '48px', 
          height: '48px', 
          borderRadius: '14px', 
          background: bgColor, 
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 4px 12px ${color}20`
        }}>
           {icon}
        </div>
        {onClick && <ArrowUpRight size={18} style={{ color: 'var(--color-text-muted)' }} />}
      </div>
      <div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '4px' }}>{title}</p>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-1px' }}>
          {prefix}<AnimatedCounter from={0} to={value} />
        </h2>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get('/stats');
        setStats(data);
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div style={{ display: 'flex', background: 'var(--color-bg)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
        <Sidebar />
        <GlowOrb color="rgba(79, 70, 229, 0.1)" size="400px" top="20%" left="40%" />
        <main style={{ marginLeft: '300px', padding: '40px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
          <div style={{ textAlign: 'center' }}>
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
               style={{ width: '40px', height: '40px', border: '3px solid var(--color-primary-light)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', margin: '0 auto 16px' }}
             />
             <p style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>
               {loading ? 'Preparing your dashboard...' : 'Unable to connect to server.'}
             </p>
          </div>
        </main>
      </div>
    );
  }

  const isAdmin = stats?.role === 'Admin';

  return (
    <div style={{ display: 'flex', background: 'var(--color-bg)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Sidebar />
      
      {/* Background Orbs */}
      <GlowOrb color="rgba(79, 70, 229, 0.12)" size="500px" top="-10%" left="60%" />
      <GlowOrb color="rgba(16, 185, 129, 0.08)" size="400px" top="50%" left="20%" delay={1} />
      
      <main style={{ marginLeft: '300px', padding: '48px', flex: 1, zIndex: 1 }}>
        <header style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: '2.25rem', color: 'var(--color-text)', fontWeight: 800, letterSpacing: '-1px' }}
            >
              {isAdmin ? 'Overview' : `Hello, ${stats.user?.name?.split(' ')[0] || 'Student'}! 👋`}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{ color: 'var(--color-text-muted)', marginTop: '6px', fontWeight: 500, fontSize: '1rem' }}
            >
              {isAdmin ? 'Manage your hostel operations with ease' : "Here's what's happening today"}
            </motion.p>
          </div>
          
          {!isAdmin && stats.user.room && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card"
              style={{ 
                display: 'flex', alignItems: 'center', gap: '16px', 
                padding: '16px 24px', 
                background: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.5)'
              }}
            >
              <div style={{ 
                width: '44px', 
                height: '44px', 
                borderRadius: '12px', 
                background: 'var(--color-primary-light)', 
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Bed size={22} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your Room</p>
                <p style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text)' }}>Room {stats.user.room.room_number}</p>
              </div>
            </motion.div>
          )}
        </header>

        {!isAdmin && stats.bookings?.some(b => b.status === 'Approved' && b.payment_status === 'Unpaid') && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card"
            style={{ 
              marginBottom: '32px', 
              background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)', 
              border: '1px solid #FED7AA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 32px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#EA580C', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CreditCard size={24} />
              </div>
              <div>
                <h4 style={{ color: '#9A3412', fontWeight: 800, fontSize: '1.1rem' }}>Hostel Fees Payment Pending</h4>
                <p style={{ color: '#C2410C', fontWeight: 500, fontSize: '0.9rem' }}>Your room has been approved! Please complete the fee payment to finalize your allotment.</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/fees')}
              className="btn-primary"
              style={{ background: '#EA580C', color: 'white', boxShadow: '0 4px 12px rgba(234, 88, 12, 0.2)' }}
            >
              Pay Now
            </button>
          </motion.div>
        )}


        {isAdmin ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div style={{ display: 'flex', gap: '24px', marginBottom: '40px', flexWrap: 'wrap' }}>
              <DashboardRowItem 
                title="Total Students" 
                value={stats.totalStudents} 
                icon={<Users size={24} />} 
                onClick={() => navigate('/students')} 
                color="#4F46E5"
                bgColor="#EEF2FF"
              />
              <DashboardRowItem 
                title="Available Rooms" 
                value={stats.availableRooms} 
                icon={<Home size={24} />} 
                onClick={() => navigate('/rooms')} 
                color="#10B981"
                bgColor="#ECFDF5"
              />
              <DashboardRowItem 
                title="Pending Gate Pass" 
                value={stats.pendingGatePasses} 
                icon={<FileText size={24} />} 
                onClick={() => navigate('/gatepass')} 
                color="#8B5CF6"
                bgColor="#F5F3FF"
              />
              <DashboardRowItem 
                title="Pending Fees" 
                value={stats.pendingRevenue} 
                prefix="₹" 
                icon={<CreditCard size={24} />} 
                onClick={() => navigate('/admin-payments')} 
                color="#EC4899"
                bgColor="#FDF2F8"
              />
              <DashboardRowItem 
                title="Active Fines" 
                value={stats.pendingFines} 
                prefix="₹" 
                icon={<AlertTriangle size={24} />} 
                onClick={() => navigate('/fines')} 
                color="#F59E0B"
                bgColor="#FFFBEB"
              />
            </div>

            
            <div style={{ display: 'flex', gap: '24px' }}>
               <div className="glass-card" style={{ flex: 2, padding: '32px', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <h3 style={{ color: 'var(--color-text)', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Occupancy Metrics</h3>
                    <div style={{ padding: '8px 16px', borderRadius: '10px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: 700 }}>Real-time Data</div>
                 </div>
                 <div style={{ width: '100%', flex: 1, background: 'rgba(79, 70, 229, 0.03)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed rgba(79, 70, 229, 0.1)' }}>
                    <div style={{ textAlign: 'center' }}>
                       <p style={{ color: 'var(--color-primary)', fontSize: '5rem', fontWeight: 900, letterSpacing: '-4px', lineHeight: 1 }}>{stats.occupancyRate}%</p>
                       <p style={{ color: 'var(--color-text-muted)', fontWeight: 600, marginTop: '8px' }}>Total Hostel Occupancy</p>
                    </div>
                 </div>
               </div>
               
               <div className="glass-card" style={{ flex: 1, padding: '32px', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <Activity size={18} />
                    </div>
                    <h3 style={{ color: 'var(--color-text)', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px' }}>System Status</h3>
                 </div>
                 <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ padding: '20px', background: '#F8FAFC', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid #F1F5F9' }}>
                         <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.1)' }} />
                         <div style={{ flex: 1 }}>
                            <p style={{ color: 'var(--color-text)', fontSize: '0.95rem', fontWeight: 700 }}>Database Online</p>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '2px', fontWeight: 500 }}>Connection stable</p>
                         </div>
                    </div>
                    <div style={{ padding: '20px', background: '#F8FAFC', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid #F1F5F9' }}>
                         <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.1)' }} />
                         <div style={{ flex: 1 }}>
                            <p style={{ color: 'var(--color-text)', fontSize: '0.95rem', fontWeight: 700 }}>Email Service</p>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '2px', fontWeight: 500 }}>SMTP Verified</p>
                         </div>
                    </div>
                 </div>
               </div>
            </div>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div style={{ display: 'flex', gap: '24px' }}>
              <div className="glass-card" style={{ flex: 1, padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ padding: '12px', borderRadius: '14px', background: '#EEF2FF', color: '#4F46E5' }}>
                    <ShieldCheck size={28} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.5px' }}>Security</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Account protection</p>
                  </div>
                </div>
                <div style={{ background: '#F8FAFC', padding: '24px', borderRadius: '20px', border: '1px solid #F1F5F9' }}>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.5, fontWeight: 500 }}>
                    Keep your account secure by updating your password regularly. We recommend a strong, unique password.
                  </p>
                  <button 
                    onClick={() => navigate('/change-password')}
                    className="btn-primary"
                    style={{ width: '100%', background: 'var(--color-primary-light)', color: 'var(--color-primary)', boxShadow: 'none' }}
                  >
                    Change Password
                  </button>
                </div>
              </div>

              <div className="glass-card" style={{ flex: 1, padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ padding: '12px', borderRadius: '14px', background: '#FFF7ED', color: '#EA580C' }}>
                    <CreditCard size={28} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.5px' }}>Payments</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Dues and transactions</p>
                  </div>
                </div>
                <div style={{ background: '#F8FAFC', padding: '24px', borderRadius: '20px', border: '1px solid #F1F5F9' }}>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.5, fontWeight: 500 }}>
                    Check your pending hostel fees and room allotment charges. Pay them securely online.
                  </p>
                  <button 
                    onClick={() => navigate('/fees')}
                    className="btn-primary"
                    style={{ width: '100%', background: '#FFF7ED', color: '#EA580C', boxShadow: 'none' }}
                  >
                    View Hostel Fees
                  </button>

                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
