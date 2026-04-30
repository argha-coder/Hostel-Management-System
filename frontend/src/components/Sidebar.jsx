import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Bed, CreditCard, LogOut, FileText, ShoppingCart, Megaphone, Key, User } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { api } from '../utils/api';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const { userInfo } = useSelector(state => state.auth);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={20} />, roles: ['Admin', 'Student'] },
    { name: 'Notice Board', path: '/notices', icon: <Megaphone size={20} />, roles: ['Admin', 'Student'] },
    { name: 'Rooms', path: '/rooms', icon: <Bed size={20} />, roles: ['Admin'] },
    { name: 'Gate Pass', path: '/gatepass', icon: <FileText size={20} />, roles: ['Admin', 'Student'] },
    { name: 'ECanteen', path: '/canteen', icon: <ShoppingCart size={20} />, roles: ['Admin', 'Student'] },
    { name: 'Students', path: '/students', icon: <Users size={20} />, roles: ['Admin'] },
    { name: 'Fines', path: '/fines', icon: <CreditCard size={20} />, roles: ['Admin', 'Student'] },
    { name: 'Security', path: '/change-password', icon: <Key size={20} />, roles: ['Student'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(userInfo?.role || 'Student'));

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      dispatch(logout());
    } catch (err) {
      console.error('Logout failed:', err);
      dispatch(logout());
    }
  };

  return (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="glass-card" 
      style={{
        width: '280px',
        height: 'calc(100vh - 40px)',
        position: 'fixed',
        left: '20px',
        top: '20px',
        display: 'flex',
        flexDirection: 'column',
        padding: '32px 20px',
        zIndex: 50,
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.4)'
      }}
    >
      <div style={{ paddingBottom: '32px', borderBottom: '1px solid var(--color-border)', marginBottom: '32px' }}>
        <h2 style={{ 
          color: 'var(--color-primary)', 
          fontSize: '1.75rem', 
          fontWeight: 800,
          letterSpacing: '-1px'
        }}>
          UHostel<span style={{ color: 'var(--color-text)' }}>.</span>
        </h2>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 18px',
                borderRadius: '14px',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                background: isActive ? 'var(--color-primary-light)' : 'transparent',
                textDecoration: 'none',
                transition: 'var(--transition-smooth)',
                fontWeight: isActive ? 700 : 500,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-nav"
                  style={{
                    position: 'absolute',
                    left: 0,
                    width: '4px',
                    height: '20px',
                    backgroundColor: 'var(--color-primary)',
                    borderRadius: '0 4px 4px 0'
                  }}
                />
              )}
              <span style={{ display: 'flex', alignItems: 'center', transition: 'transform 0.3s ease' }}>
                {React.cloneElement(item.icon, { size: 20 })}
              </span>
              <span style={{ fontSize: '0.95rem' }}>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div style={{ 
        marginTop: 'auto', 
        paddingTop: '24px', 
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '12px', 
            background: 'var(--color-primary-light)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--color-primary)'
          }}>
            <User size={20} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {userInfo?.name || 'User'}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {userInfo?.role}
            </p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="btn-secondary" 
          style={{ 
            width: '100%',
            background: '#FEF2F2',
            color: '#EF4444',
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '10px',
            fontSize: '0.9rem'
          }}
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
