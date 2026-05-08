import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { api } from '../utils/api';
import { 
  User, X, Check, Clock, CheckCircle, Plus, Info, Trash2, ArrowRight, 
  ChevronLeft, ChevronRight, Bed, Home, Settings2, Users as UsersIcon,
  LayoutGrid, List as ListIcon, ShieldAlert, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/cn';

const RoomCard = ({ room, onClick, isAdmin }) => {
  const statusConfig = {
    'Available': { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', dot: 'bg-emerald-500' },
    'Occupied': { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', dot: 'bg-rose-500' },
    'Clean': { color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-100', dot: 'bg-sky-500' },
    'Repair': { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', dot: 'bg-amber-500' },
  };

  const config = statusConfig[room.status] || { color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100', dot: 'bg-slate-500' };
  const occupancyPercent = (room.occupied / room.capacity) * 100;

  return (
    <motion.div
      layoutId={`room-${room._id}`}
      onClick={() => onClick(room)}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Card className="cursor-pointer border-none shadow-slate-200/50 hover:shadow-indigo-200/50 transition-all overflow-hidden relative">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Home size={24} />
            </div>
            <div className={cn(
              "px-3 py-1 rounded-full text-[10px] font-black tracking-widest flex items-center gap-1.5",
              config.bg, config.color
            )}>
              <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", config.dot)} />
              {room.status.toUpperCase()}
            </div>
          </div>

          <h3 className="text-xl font-black text-slate-900 tracking-tight">Room {room.room_number}</h3>
          
          <div className="mt-4 space-y-3">
             <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
               <span>Occupancy</span>
               <span>{room.occupied} / {room.capacity}</span>
             </div>
             <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${occupancyPercent}%` }}
                  className={cn(
                    "h-full rounded-full transition-all",
                    occupancyPercent >= 100 ? "bg-rose-500" : "bg-indigo-600"
                  )}
                />
             </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-slate-400">
             <div className="flex items-center gap-1.5">
                <UsersIcon size={14} />
                <span className="text-xs font-bold tracking-tight">{room.capacity} Beds</span>
             </div>
             <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform text-indigo-600 opacity-0 group-hover:opacity-100" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRooms, setTotalRooms] = useState(0);

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
  }, [page]);

  useEffect(() => {
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
    setLoading(true);
    try {
      const data = await api.get(`/rooms?page=${page}&limit=12`);
      if (data.rooms) {
        setRooms(data.rooms);
        setTotalPages(data.pages);
        setTotalRooms(data.total);
      } else {
        setRooms(data);
        setTotalPages(1);
      }
    } catch (err) {
      setError('Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      // Use the optimized chat limit for admin room view
      const data = await api.get('/auth/users?limit=100');
      setStudents(data.users.filter(u => u.role === 'Student'));
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
      const updatedRoomsData = await api.get(`/rooms?page=${page}&limit=12`);
      const newSelected = updatedRoomsData.find(r => r._id === selectedRoom._id);
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
      const updatedRoomsData = await api.get(`/rooms?page=${page}&limit=12`);
      const newSelected = updatedRoomsData.find(r => r._id === selectedRoom._id);
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
      await api.post('/rooms', {
        room_number: newRoomNumber,
        capacity: newCapacity,
        status: 'Available'
      });
      
      fetchRooms(); // Refresh to show new room
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

  const isRoomAllotted = userProfile?.room_id || userBookings.some(b => b.status === 'Approved');
  const hasPendingRequest = userBookings.some(b => b.status === 'Pending');

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Room Inventory</h1>
          <p className="text-slate-500 font-medium mt-1">Real-time status of all {totalRooms} hostel rooms</p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Button variant="gradient" className="gap-2 shadow-indigo-200" onClick={() => setShowAddForm(true)}>
              <Plus size={18} /> Add Room
            </Button>
          )}
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-2xl" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {rooms.map(room => (
                <RoomCard 
                  key={room._id} 
                  room={room} 
                  isAdmin={isAdmin} 
                  onClick={setSelectedRoom}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12">
               <Button 
                variant="secondary" 
                size="sm" 
                className="rounded-xl"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
               >
                 <ChevronLeft size={20} />
               </Button>
               <span className="text-sm font-black text-slate-900">Page {page} of {totalPages}</span>
               <Button 
                variant="secondary" 
                size="sm" 
                className="rounded-xl"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
               >
                 <ChevronRight size={20} />
               </Button>
            </div>
          )}
        </>
      )}

      {/* Modern Modal / Detail View */}
      <AnimatePresence>
        {selectedRoom && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRoom(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              layoutId={`room-${selectedRoom._id}`}
              className="bg-white rounded-[32px] w-full max-w-2xl overflow-hidden relative shadow-2xl z-[110]"
            >
              <div className="h-48 bg-indigo-600 relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700" />
                 <div className="absolute top-8 left-8">
                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white mb-4 w-fit">
                       <Bed size={32} />
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tighter">Room {selectedRoom.room_number}</h2>
                 </div>
                 <button 
                  onClick={() => setSelectedRoom(null)}
                  className="absolute top-8 right-8 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-xl transition-colors"
                 >
                   <X size={24} />
                 </button>
              </div>

              <div className="p-10 space-y-10 max-h-[70vh] overflow-y-auto">
                 {!showEditForm ? (
                   <>
                    <div className="grid grid-cols-3 gap-6">
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                          <p className="text-lg font-black text-indigo-600">{selectedRoom.status}</p>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Capacity</p>
                          <p className="text-lg font-black text-slate-900">{selectedRoom.capacity} Beds</p>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Allotted</p>
                          <p className="text-lg font-black text-slate-900">{selectedRoom.occupied} Students</p>
                        </div>
                    </div>

                    <section>
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                              <UsersIcon size={20} className="text-indigo-600" /> Current Students
                          </h3>
                        </div>
                        <div className="space-y-3">
                          {roomStudents.length > 0 ? (
                            roomStudents.map(student => (
                              <div key={student._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-black text-indigo-600 shadow-sm">
                                    {student.name.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-900">{student.name}</p>
                                    <p className="text-xs text-slate-400 font-medium">{student.email}</p>
                                  </div>
                                </div>
                                {isAdmin && (
                                  <Button variant="ghost" size="icon" className="text-rose-500 hover:bg-rose-50" onClick={() => handleUnassignStudent(student._id)}>
                                    <X size={18} />
                                  </Button>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="p-10 text-center bg-slate-50 rounded-[32px] border border-dashed border-slate-200 text-slate-400 font-bold">
                                No students assigned
                            </div>
                          )}
                        </div>
                        
                        {isAdmin && (
                          <form onSubmit={handleAssignStudent} className="mt-6 flex gap-3">
                            <select 
                              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium"
                              value={selectedStudentId}
                              onChange={(e) => setSelectedStudentId(e.target.value)}
                            >
                              <option value="">Assign a student...</option>
                              {students
                                .filter(s => !s.room_id || (s.room_id?._id !== selectedRoom._id && s.room_id !== selectedRoom._id))
                                .map(s => (
                                  <option key={s._id} value={s._id}>
                                    {s.name} {s.room_id ? `(Room ${s.room_id.room_number})` : ''}
                                  </option>
                                ))}
                            </select>
                            <Button type="submit" variant="gradient" className="rounded-2xl px-6">Assign</Button>
                          </form>
                        )}
                    </section>

                    <div className="flex gap-4 pt-4">
                        {isAdmin ? (
                          <>
                            <Button className="flex-1 rounded-2xl h-14 font-black tracking-tight" variant="gradient" onClick={openEditForm}>
                              Edit Room Info
                            </Button>
                            <Button className="h-14 w-14 rounded-2xl p-0 text-rose-500 bg-rose-50 hover:bg-rose-100" onClick={handleDeleteRoom}>
                              <Trash2 size={24} />
                            </Button>
                          </>
                        ) : (
                          <Button 
                            className="w-full rounded-2xl h-14 font-black tracking-tight gap-2" 
                            variant="gradient"
                            disabled={requestLoading || hasPendingRequest || isRoomAllotted || selectedRoom.occupied >= selectedRoom.capacity}
                            onClick={handleRequestRoom}
                          >
                            {requestLoading ? 'Requesting...' : (
                              hasPendingRequest ? (
                                <><Clock size={20} /> Request Pending</>
                              ) : (
                                isRoomAllotted ? (
                                  <><CheckCircle size={20} /> Room Allotted</>
                                ) : <><Sparkles size={20} /> Request Room</>
                              )
                            )}
                          </Button>
                        )}
                    </div>
                   </>
                 ) : (
                   <form onSubmit={handleUpdateRoom} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Room Status</label>
                        <select 
                          className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-bold"
                          value={editStatus} 
                          onChange={(e) => setEditStatus(e.target.value)}
                        >
                          <option value="Available">Available</option>
                          <option value="Occupied">Occupied</option>
                          <option value="Clean">Clean</option>
                          <option value="Repair">Repair</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Occupied Beds (Override)</label>
                        <input 
                          type="number" 
                          min="0"
                          max={selectedRoom.capacity}
                          className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-bold"
                          value={editOccupied}
                          onChange={(e) => setEditOccupied(e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex gap-4 pt-4">
                        <Button type="button" className="flex-1 rounded-2xl h-14 font-black" variant="secondary" onClick={() => setShowEditForm(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" className="flex-1 rounded-2xl h-14 font-black" variant="gradient">
                          Save Changes
                        </Button>
                      </div>
                   </form>
                 )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Room Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
           <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowAddForm(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
           />
           <Card className="w-full max-w-md relative z-[130] rounded-[32px] border-none shadow-2xl">
              <CardHeader className="p-8 pb-0">
                 <CardTitle className="text-2xl font-black tracking-tight">Register New Room</CardTitle>
                 <CardDescription>Enter the details for the new hostel unit</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                 <form onSubmit={handleAddRoom} className="space-y-5">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Room Number</label>
                       <input 
                        type="text" 
                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-bold"
                        placeholder="e.g. 305"
                        value={newRoomNumber}
                        onChange={(e) => setNewRoomNumber(e.target.value)}
                        required
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Capacity (Beds)</label>
                       <input 
                        type="number" 
                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-bold"
                        value={newCapacity}
                        onChange={(e) => setNewCapacity(e.target.value)}
                        required
                       />
                    </div>
                    <div className="flex gap-4 pt-4">
                       <Button type="button" variant="secondary" className="flex-1 rounded-2xl h-14 font-black" onClick={() => setShowAddForm(false)}>Cancel</Button>
                       <Button type="submit" variant="gradient" className="flex-1 rounded-2xl h-14 font-black">Register</Button>
                    </div>
                 </form>
              </CardContent>
           </Card>
        </div>
      )}
    </div>
  );
};

export default Rooms;
