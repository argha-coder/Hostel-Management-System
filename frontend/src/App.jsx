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

import ProtectedRoute from './components/ProtectedRoute';
import ChatBox from './components/ChatBox';

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
    
    if (localStorage.getItem('userInfo')) {
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
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="loading-spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--color-primary-light)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Loading UHostel...</p>
          </div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      }>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/rooms" element={<ProtectedRoute><Rooms /></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
          <Route path="/fines" element={<ProtectedRoute><Fines /></ProtectedRoute>} />
          <Route path="/gatepass" element={<ProtectedRoute><GatePass /></ProtectedRoute>} />
          <Route path="/canteen" element={<ProtectedRoute><Canteen /></ProtectedRoute>} />
          <Route path="/notices" element={<ProtectedRoute><Notices /></ProtectedRoute>} />
          <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
          <Route path="/fees" element={<ProtectedRoute><Fees /></ProtectedRoute>} />
          <Route path="/admin-payments" element={<ProtectedRoute><AdminPayments /></ProtectedRoute>} />
        </Routes>
      </React.Suspense>
      {userInfo && <ChatBox />}
    </div>
  );

}

export default App;
