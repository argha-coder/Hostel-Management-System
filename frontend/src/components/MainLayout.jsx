import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, Menu } from 'lucide-react';
import { useSelector } from 'react-redux';

const MainLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { userInfo } = useSelector(state => state.auth);

  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/students?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      <div 
        className="transition-all duration-300 ease-in-out flex flex-col min-h-screen"
        style={{ paddingLeft: isCollapsed ? '80px' : '280px' }}
      >
        <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {userInfo?.role === 'Admin' && (
              <div className="relative max-w-md w-full hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search students, rooms, notices..." 
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-10 w-[1px] bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">{userInfo?.name || 'User'}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{userInfo?.role}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-indigo-200">
                {userInfo?.name?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </header>

        <main className="p-8 flex-1">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>

        <footer className="px-8 py-6 border-t border-slate-200 text-slate-400 text-xs flex justify-between items-center">
          <p>© 2026 UHostel Management. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-indigo-600 transition-colors">Support</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
