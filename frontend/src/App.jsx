import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from './store/authSlice';
import { api } from './utils/api';
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Rooms = React.lazy(() => import('./pages/Rooms'));
const Students = React.lazy(() => import('./pages/Students'));
const Fines = React.lazy(() => import('./pages/Fines'));
const GatePass = React.lazy(() => import('./pages/GatePass'));
const Canteen = React.lazy(() => import('./pages/Canteen'));
const Notices = React.lazy(() => import('./pages/Notices'));
const ChangePassword = React.lazy(() => import('./pages/ChangePassword'));
const Fees = React.lazy(() => import('./pages/Fees'));
const AdminPayments = React.lazy(() => import('./pages/AdminPayments'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));

import ProtectedRoute from './components/ProtectedRoute';
import ChatBox from './components/ChatBox';
import MainLayout from './components/MainLayout';

function App() {
  const dispatch = useDispatch();
  const { userInfo } = useSelector(state => state.auth);

  useEffect(() => {
    // Check if session is still valid on app load/refresh
    const checkSession = async () => {
      try {
        // Use a lighter profile endpoint instead of full stats
        await api.get('/auth/profile');
      } catch (err) {
        // If not logged in, just ensure Redux is clean
        if (err.status === 401 || err.status === 403) {
          dispatch(logout());
        }
      }
    };
    
    if (sessionStorage.getItem('userInfo')) {
      checkSession();
    }
  }, [dispatch]);


  useEffect(() => {
    // Advanced Visitor Tracking
    const trackVisitor = async () => {
      try {
        if (!sessionStorage.getItem('visitor_tracked')) {
          // 1. Gather hardware & browser specs
          const screenData = `${window.screen.width}x${window.screen.height}`;
          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const language = navigator.language || 'en-US';
          const cookies = navigator.cookieEnabled ? 'Yes' : 'No';
          const touchPoints = navigator.maxTouchPoints || 0;
          const pixelRatio = window.devicePixelRatio || 1;
          const colorDepth = window.screen.colorDepth + '-bit';
          const referrer = document.referrer || 'Direct / Bookmark';
          const cores = navigator.hardwareConcurrency || 'Unknown';
          const ram = navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'Unknown';

          // 2. Network Info (if supported)
          const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
          const networkType = connection ? connection.effectiveType : 'Unknown';

          // 3. Battery Info (if supported)
          let batteryInfo = { level: 'Unknown', charging: 'Unknown' };
          try {
            if (navigator.getBattery) {
              const battery = await navigator.getBattery();
              batteryInfo = {
                level: Math.round(battery.level * 100) + '%',
                charging: battery.charging ? 'Yes' : 'No'
              };
            }
          } catch (e) {}

          // 4. Send to backend
          await api.post('/track', {
            resolution: screenData,
            timezone,
            language,
            cookies,
            touchPoints,
            pixelRatio,
            colorDepth,
            referrer,
            cores,
            ram,
            networkType,
            batteryLevel: batteryInfo.level,
            isCharging: batteryInfo.charging,
            localTime: new Date().toString()
          });

          sessionStorage.setItem('visitor_tracked', 'true');
        }
      } catch (error) {
        console.warn('Tracking failed:', error);
      }
    };
    
    trackVisitor();
  }, []);

  return (
    <div className="App">
      <React.Suspense fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 font-bold tracking-tight">Loading UHostel Premium...</p>
          </div>
        </div>
      }>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
            <Route path="/rooms" element={<MainLayout><Rooms /></MainLayout>} />
            <Route path="/students" element={<MainLayout><Students /></MainLayout>} />
            <Route path="/fines" element={<MainLayout><Fines /></MainLayout>} />
            <Route path="/gatepass" element={<MainLayout><GatePass /></MainLayout>} />
            <Route path="/canteen" element={<MainLayout><Canteen /></MainLayout>} />
            <Route path="/notices" element={<MainLayout><Notices /></MainLayout>} />
            <Route path="/change-password" element={<MainLayout><ChangePassword /></MainLayout>} />
            <Route path="/fees" element={<MainLayout><Fees /></MainLayout>} />
            <Route path="/admin-payments" element={<MainLayout><AdminPayments /></MainLayout>} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </React.Suspense>
      {userInfo && <ChatBox />}
    </div>
  );

}

export default App;
