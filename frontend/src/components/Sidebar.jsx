import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Bed, CreditCard, LogOut, FileText, ShoppingCart, Megaphone, Key, User, Receipt, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { api } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
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
    { name: 'Hostel Fees', path: '/fees', icon: <Receipt size={20} />, roles: ['Student'] },
    { name: 'Payment Records', path: '/admin-payments', icon: <Receipt size={20} />, roles: ['Admin'] },
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
      initial={false}
      animate={{ width: isCollapsed ? '80px' : '280px' }}
      className="fixed left-0 top-0 h-screen bg-white border-r border-slate-200 z-50 flex flex-col transition-all duration-300 ease-in-out"
    >
      <div className="p-6 flex items-center justify-between">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.h2 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="text-2xl font-black text-indigo-600 tracking-tighter"
            >
              UHostel<span className="text-slate-900">.</span>
            </motion.h2>
          )}
        </AnimatePresence>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                isActive 
                  ? "bg-indigo-50 text-indigo-600 font-bold" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <span className={cn(
                "flex-shrink-0 transition-transform duration-200",
                isActive ? "scale-110" : "group-hover:scale-110"
              )}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm"
                >
                  {item.name}
                </motion.span>
              )}
              {isActive && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full"
                />
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60]">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 space-y-4">
        <div className={cn(
          "flex items-center gap-3 p-2 rounded-xl transition-all",
          isCollapsed ? "justify-center" : "bg-slate-50"
        )}>
          <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <User size={20} />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">{userInfo?.name || 'User'}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{userInfo?.role}</p>
            </div>
          )}
        </div>

        <button 
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 w-full p-3 rounded-xl transition-all",
            isCollapsed 
              ? "justify-center text-red-500 hover:bg-red-50" 
              : "bg-red-50 text-red-600 hover:bg-red-100 font-bold"
          )}
        >
          <LogOut size={18} />
          {!isCollapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
