import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from './store/authSlice';
import { api } from './utils/api';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Students from './pages/Students';
import Fines from './pages/Fines';
import GatePass from './pages/GatePass';
import Canteen from './pages/Canteen';
import Notices from './pages/Notices';
import Bookings from './pages/Bookings';
import ChangePassword from './pages/ChangePassword';
import ProtectedRoute from './components/ProtectedRoute';
import ChatBox from './components/ChatBox';

function App() {
  const dispatch = useDispatch();
  const { userInfo } = useSelector(state => state.auth);

  useEffect(() => {
    // Check if session is still valid on app load/refresh
    const checkSession = async () => {
      try {
        // Try to fetch stats - if it 401s, our api utility will handle the logout
        await api.get('/stats');
      } catch (err) {
        // If not logged in, just ensure Redux is clean
        if (err.status === 401) {
          dispatch(logout());
        }
      }
    };
    
    if (localStorage.getItem('userInfo')) {
      checkSession();
    }
  }, [dispatch]);

  return (
    <div className="App">
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
      </Routes>
      {userInfo && <ChatBox />}
    </div>
  );
}

export default App;
