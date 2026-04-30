import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { api } from '../utils/api';
import { User, X, Check, Clock, CheckCircle, Plus, Info, Trash2, ArrowRight } from 'lucide-react';
import GlowOrb from '../components/GlowOrb';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Add Room form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newCapacity, setNewCapacity] = useState(2);
  
  // Edit Room form state
  const [showEditForm, setShowEditForm] = useState(false);
  const [editStatus, setEditStatus] = useState('');
  const [editOccupied, setEditOccupied] = useState(0);

  // Student assignment state
  const [students, setStudents] = useState([]);
  const [roomStudents, setRoomStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [userBookings, setUserBookings] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  
  const navigate = useNavigate();
  const { userInfo } = useSelector(state => state.auth);
  const isAdmin = userInfo?.role === 'Admin';

  useEffect(() => {
    fetchRooms();
    if (isAdmin) {
      fetchStudents();
    } else {
      fetchUserBookings();
      fetchUserProfile();
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const data = await api.get('/auth/profile');
      setUserProfile(data);
    } catch (err) {
      console.error('Failed to fetch user profile', err);
    }
  };

  const fetchUserBookings = async () => {
    try {
      const data = await api.get('/bookings/mybookings');
      setUserBookings(data);
    } catch (err) {
      console.error('Failed to fetch user bookings', err);
    }
  };

  useEffect(() => {
    if (selectedRoom && students.length > 0) {
      const assigned = students.filter(s => s.room_id?._id === selectedRoom._id || s.room_id === selectedRoom._id);
      setRoomStudents(assigned);
    } else {
      setRoomStudents([]);
    }
  }, [selectedRoom, students]);

  const fetchRooms = async () => {
    try {
      const data = await api.get('/rooms');
      setRooms(data);
    } catch (err) {
      setError('Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await api.get('/auth/users');
      // Fix: Get students who are either unassigned or assigned to the CURRENT selected room
      // This allows moving students or seeing residents in the dropdown if needed
      setStudents(data.filter(u => u.role === 'Student'));
    } catch (err) {
      console.error('Failed to fetch students', err);
    }
  };

  const handleAssignStudent = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    try {
      await api.post('/rooms/assign', {
        student_id: selectedStudentId,
        room_id: selectedRoom._id
      });
      
      // Refresh data
      await Promise.all([fetchRooms(), fetchStudents()]);
      setSelectedStudentId('');
      alert('Student assigned successfully');
      
      // Update selected room data to reflect new occupancy
      const updatedRoom = await api.get('/rooms');
      const newSelected = updatedRoom.find(r => r._id === selectedRoom._id);
      setSelectedRoom(newSelected);
    } catch (err) {
      alert(err.message || 'Failed to assign student');
    }
  };

  const handleUnassignStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to remove this student from the room?')) return;

    try {
      await api.post('/rooms/unassign', { student_id: studentId });
      
      // Refresh data
      await Promise.all([fetchRooms(), fetchStudents()]);
      alert('Student unassigned successfully');

      // Update selected room data
      const updatedRoom = await api.get('/rooms');
      const newSelected = updatedRoom.find(r => r._id === selectedRoom._id);
      setSelectedRoom(newSelected);
    } catch (err) {
      alert(err.message || 'Failed to unassign student');
    }
  };

  const handleRequestRoom = async () => {
    if (!selectedRoom) return;
    
    setRequestLoading(true);
    try {
      await api.post('/bookings', {
        room_id: selectedRoom._id,
        start_date: new Date(),
        duration: 6
      });
      alert('Room request sent successfully! Please wait for admin approval.');
      fetchUserBookings();
      setSelectedRoom(null);
    } catch (err) {
      alert(err.message || 'Failed to request room');
    } finally {
      setRequestLoading(false);
    }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      const data = await api.post('/rooms', {
        room_number: newRoomNumber,
        capacity: newCapacity,
        status: 'Available'
      });
      
      setRooms([...rooms, data]);
      setShowAddForm(false);
      setNewRoomNumber('');
    } catch (err) {
      alert(err.message || 'Failed to add room (Must be Admin)');
    }
  };
  const handleUpdateRoom = async (e) => {
    e.preventDefault();
    try {
      const data = await api.put(`/rooms/${selectedRoom._id}`, {
        status: editStatus,
        occupied: Number(editOccupied)
      });
      
      setRooms(rooms.map(r => r._id === selectedRoom._id ? data : r));
      setSelectedRoom(data);
      setShowEditForm(false);
    } catch (err) {
      alert(err.message || 'Failed to update room');
    }
  };

  const handleDeleteRoom = async () => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    try {
      await api.delete(`/rooms/${selectedRoom._id}`);
      
      setRooms(rooms.filter(r => r._id !== selectedRoom._id));
      setSelectedRoom(null);
      setShowEditForm(false);
    } catch (err) {
      alert(err.message || 'Failed to delete room');
    }
  };

  const openEditForm = () => {
    setEditStatus(selectedRoom.status);
    setEditOccupied(selectedRoom.occupied);
    setShowEditForm(true);
  };
  
  const getStatusColorStyle = (status) => {
    switch(status) {
      case 'Available': return { color: '#059669', background: '#D1FAE5' };
      case 'Occupied': return { color: '#DC2626', background: '#FEE2E2' };
      case 'Clean': return { color: '#2563EB', background: '#DBEAFE' };
      case 'Repair': return { color: '#D97706', background: '#FEF3C7' };
      default: return { color: '#4B5563', background: '#F3F4F6' };
    }
  };

  const isRoomAllotted = userProfile?.room_id || userBookings.some(b => b.status === 'Approved');
  const hasPendingRequest = userBookings.some(b => b.status === 'Pending');

  return (
    <div style={{ display: 'flex', background: 'var(--color-bg)', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: '300px', padding: '40px', flex: 1 }}>
        <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: 'var(--color-accent)', fontWeight: 700 }}>Room Management</h1>
            <p style={{ color: 'var(--color-text-muted)', marginTop: '5px' }}>Hostel inventory and room tracking</p>
          </div>
          {isAdmin && (
            <button className="btn-primary" onClick={() => setShowAddForm(true)}>+ Register Room</button>
          )}
        </header>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {loading && <p>Loading inventory...</p>}

        {!loading && rooms.length === 0 && (
          <div className="minimal-card" style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ color: 'var(--color-text-muted)' }}>No rooms found. Add some rooms to get started.</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {rooms.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 1fr) 1fr 1fr auto', padding: '0 20px', color: 'var(--color-text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
              <span>Room Number</span>
              <span>Capacity</span>
              <span>Status</span>
              <span></span>
            </div>
          )}
          
          {rooms.map(room => {
            const statusStyle = getStatusColorStyle(room.status);
            return (
              <motion.div
                layoutId={`room-container-${room._id}`}
                key={room._id}
                onClick={() => setSelectedRoom(room)}
                className="minimal-card"
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'minmax(120px, 1fr) 1fr 1fr auto', 
                  padding: '20px', 
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
                whileHover={{ y: -2, boxShadow: 'var(--shadow-md)' }}
              >
                <motion.span layoutId={`title-${room._id}`} style={{ fontWeight: 600, color: 'var(--color-text)' }}>Room {room.room_number}</motion.span>
                <span style={{ color: 'var(--color-text-muted)' }}>{room.occupied} / {room.capacity} Students</span>
                <div>
                  <span style={{ color: statusStyle.color, backgroundColor: statusStyle.background, padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 500 }}>{room.status}</span>
                </div>
                <span style={{ color: '#3B82F6', fontSize: '0.9rem', fontWeight: 500 }}>View Details</span>
              </motion.div>
            )
          })}
        </div>

        {/* Expanded View Modal using Layout Morph */}
        <AnimatePresence>
          {selectedRoom && (
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(17, 24, 39, 0.4)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setSelectedRoom(null)}>
              <div onClick={(e) => e.stopPropagation()}>
                <motion.div
                  layoutId={`room-container-${selectedRoom._id}`}
                  className="minimal-card"
                  style={{ width: '600px', padding: '40px', display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflowY: 'auto' }}
                >
                  <motion.h2 layoutId={`title-${selectedRoom._id}`} style={{ fontSize: '1.8rem', color: 'var(--color-accent)', marginBottom: '25px', fontWeight: 600 }}>Room {selectedRoom.room_number}</motion.h2>
                  
                  {!showEditForm ? (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                        <div style={{ background: 'var(--color-bg)', padding: '20px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                           <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>Occupancy details</p>
                           <p style={{ color: 'var(--color-text)', fontSize: '1.8rem', fontWeight: 700 }}>{selectedRoom.occupied} / {selectedRoom.capacity}</p>
                        </div>
                        <div style={{ background: 'var(--color-bg)', padding: '20px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                           <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>Room status</p>
                           <p style={{ color: getStatusColorStyle(selectedRoom.status).color, fontSize: '1.4rem', fontWeight: 600 }}>{selectedRoom.status}</p>
                        </div>
                      </div>

                      {/* Residents Section */}
                      <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <User size={20} /> Current Residents
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {roomStudents.length > 0 ? roomStudents.map(s => (
                            <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', background: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                              <div>
                                <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{s.name}</p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{s.email}</p>
                              </div>
                              {isAdmin && (
                                <button 
                                  onClick={() => handleUnassignStudent(s._id)}
                                  style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '5px' }}
                                  title="Remove student"
                                >
                                  <X size={18} />
                                </button>
                              )}
                            </div>
                          )) : (
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', fontStyle: 'italic', textAlign: 'center', padding: '10px' }}>No residents assigned to this room.</p>
                          )}
                        </div>
                      </div>

                      {/* Assignment Section for Admin */}
                      {isAdmin && selectedRoom.occupied < selectedRoom.capacity && (
                        <div style={{ marginBottom: '30px', padding: '20px', background: 'var(--color-accent-light)', borderRadius: '12px' }}>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px', color: 'var(--color-accent)' }}>Assign New Student</h4>
                          <form onSubmit={handleAssignStudent} style={{ display: 'flex', gap: '10px' }}>
                            <select 
                              className="input-outline"
                              style={{ flex: 1, padding: '8px' }}
                              value={selectedStudentId}
                              onChange={(e) => setSelectedStudentId(e.target.value)}
                            >
                              <option value="">Select a student to allocate...</option>
                              {students
                                .filter(s => !s.room_id || (s.room_id?._id !== selectedRoom._id && s.room_id !== selectedRoom._id))
                                .map(s => (
                                  <option key={s._id} value={s._id}>
                                    {s.name} ({s.room_id ? `Currently: Room ${s.room_id.room_number || 'Other'}` : 'Unassigned'})
                                  </option>
                              ))}
                            </select>
                            <button type="submit" className="btn-primary" style={{ padding: '8px 15px' }}>Assign</button>
                          </form>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: 'auto' }}>
                        {isAdmin && (
                          <button className="btn-secondary" style={{ borderColor: 'red', color: 'red' }} onClick={handleDeleteRoom}>Delete</button>
                        )}
                        {!isAdmin && selectedRoom.status === 'Available' && selectedRoom.occupied < selectedRoom.capacity && (
                          <button 
                            className="btn-primary" 
                            disabled={requestLoading || hasPendingRequest || isRoomAllotted} 
                            onClick={handleRequestRoom}
                            style={{ 
                              display: 'flex', alignItems: 'center', gap: '8px',
                              background: hasPendingRequest ? '#FEF3C7' : (isRoomAllotted ? '#D1FAE5' : 'var(--color-accent)'),
                              color: hasPendingRequest ? '#D97706' : (isRoomAllotted ? '#059669' : 'white'),
                              border: hasPendingRequest ? '1px solid #FCD34D' : (isRoomAllotted ? '1px solid #10B981' : 'none')
                            }}
                          >
                            {requestLoading ? 'Requesting...' : (
                              hasPendingRequest ? (
                                <><Clock size={16} /> Request Pending</>
                              ) : (
                                isRoomAllotted ? (
                                  <><CheckCircle size={16} /> Room Already Allotted</>
                                ) : 'Request Assignment'
                              )
                            )}
                          </button>
                        )}
                        {!isAdmin && (userProfile?.room_id?._id === selectedRoom._id || userBookings.some(b => b.room_id?._id === selectedRoom._id && b.status === 'Approved')) && (
                          <div style={{ 
                            padding: '10px 20px', background: '#D1FAE5', color: '#059669', 
                            borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700, 
                            display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #10B981'
                          }}>
                            <CheckCircle size={18} /> Room Approved
                          </div>
                        )}
                        <button className="btn-secondary" onClick={() => setSelectedRoom(null)}>Close</button>
                        {isAdmin && <button className="btn-primary" onClick={openEditForm}>Edit Room Info</button>}
                      </div>
                    </>
                  ) : (
                    <form onSubmit={handleUpdateRoom} style={{ display: 'flex', flexDirection: 'column', gap: '15px', height: '100%' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--color-text)' }}>Status</label>
                        <select 
                          className="input-outline" 
                          value={editStatus} 
                          onChange={(e) => setEditStatus(e.target.value)}
                        >
                          <option value="Available">Available</option>
                          <option value="Occupied">Occupied</option>
                          <option value="Clean">Clean</option>
                          <option value="Repair">Repair</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: 'var(--color-text)' }}>Occupied Beds (Manual Override)</label>
                        <input 
                          type="number" 
                          min="0"
                          max={selectedRoom.capacity}
                          className="input-outline"
                          value={editOccupied}
                          onChange={(e) => setEditOccupied(e.target.value)}
                          required
                        />
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '5px' }}>Note: Assigning students automatically updates this value.</p>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: 'auto' }}>
                        <button type="button" className="btn-secondary" onClick={() => setShowEditForm(false)}>Cancel</button>
                        <button type="submit" className="btn-primary">Save Changes</button>
                      </div>
                    </form>
                  )}
                </motion.div>
              </div>
            </div>
          )}

          {/* Add Room Modal */}
          {showAddForm && (
             <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(17, 24, 39, 0.4)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <div className="minimal-card" style={{ width: '400px', padding: '30px' }}>
                 <h2 style={{ marginBottom: '20px' }}>Register New Room</h2>
                 <form onSubmit={handleAddRoom} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input 
                      type="text" 
                      placeholder="Room Number (e.g. 101)" 
                      className="input-outline"
                      value={newRoomNumber}
                      onChange={(e) => setNewRoomNumber(e.target.value)}
                      required
                    />
                    <input 
                      type="number" 
                      placeholder="Capacity" 
                      className="input-outline"
                      value={newCapacity}
                      onChange={(e) => setNewCapacity(e.target.value)}
                      required
                    />
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)} style={{ flex: 1 }}>Cancel</button>
                      <button type="submit" className="btn-primary" style={{ flex: 1 }}>Submit</button>
                    </div>
                 </form>
               </div>
             </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Rooms;
