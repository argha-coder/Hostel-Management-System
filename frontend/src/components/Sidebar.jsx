import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Bed, CreditCard, LogOut, FileText, ShoppingCart, Megaphone, ClipboardList } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { api } from '../utils/api';

const Sidebar = () => {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const { userInfo } = useSelector(state => state.auth);
  const isAdmin = userInfo?.role === 'Admin';

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={20} />, roles: ['Admin', 'Student'] },
    { name: 'Notice Board', path: '/notices', icon: <Megaphone size={20} />, roles: ['Admin', 'Student'] },
    { name: 'Rooms', path: '/rooms', icon: <Bed size={20} />, roles: ['Admin', 'Student'] },
    { name: 'Room Requests', path: '/bookings', icon: <ClipboardList size={20} />, roles: ['Admin'] },
    { name: 'Gate Pass', path: '/gatepass', icon: <FileText size={20} />, roles: ['Admin', 'Student'] },
    { name: 'ECanteen', path: '/canteen', icon: <ShoppingCart size={20} />, roles: ['Admin', 'Student'] },
    { name: 'Students', path: '/students', icon: <Users size={20} />, roles: ['Admin'] },
    { name: 'Fines', path: '/fines', icon: <CreditCard size={20} />, roles: ['Admin', 'Student'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(userInfo?.role || 'Student'));

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      dispatch(logout());
    } catch (err) {
      console.error('Logout failed:', err);
      // Still logout locally if backend fails
      dispatch(logout());
    }
  };

  return (
    <div className="minimal-card" style={{
      width: '260px',
      height: 'calc(100vh - 40px)',
      position: 'fixed',
      left: '20px',
      top: '20px',
      display: 'flex',
      flexDirection: 'column',
      padding: '30px 20px',
      zIndex: 50
    }}>
      <div style={{ paddingBottom: '30px', borderBottom: '1px solid var(--color-border)', marginBottom: '30px' }}>
        <h2 style={{ color: 'var(--color-accent)', letterSpacing: '1px', fontSize: '1.5rem', fontWeight: 700 }}>UHostel</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '5px' }}>Role: {userInfo?.name || 'Admin'}</p>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filteredNavItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              padding: '12px 16px',
              borderRadius: '8px',
              color: pathname === item.path ? 'var(--color-accent)' : 'var(--color-text-muted)',
              background: pathname === item.path ? 'var(--color-accent-light)' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              fontWeight: pathname === item.path ? 600 : 400
            }}
          >
            {item.icon}
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      <button 
        onClick={handleLogout}
        className="btn-secondary" 
        style={{ 
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', 
          color: '#DC2626', borderColor: '#FCA5A5'
        }}>
        <LogOut size={18} /> Logout
      </button>
    </div>
  );
};

export default Sidebar;
