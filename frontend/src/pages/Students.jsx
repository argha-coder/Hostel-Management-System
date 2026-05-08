import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  User as UserIcon, Mail, Shield, CheckCircle, XCircle, Trash2, 
  Download, ChevronLeft, ChevronRight, Search, Filter, MoreHorizontal,
  Plus, UserPlus, MailCheck, ShieldCheck, Clock, Users
} from 'lucide-react';
import { api } from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/cn';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  const navigate = useNavigate();
  const { userInfo } = useSelector(state => state.auth);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Room', 'Status'];
    const csvRows = [
      headers.join(','),
      ...students.map(s => [
        `"${s.name}"`,
        `"${s.email}"`,
        s.room_id?.room_number || 'Not Assigned',
        s.isVerified ? 'Verified' : 'Unverified'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_list_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  useEffect(() => {
    fetchStudents();
  }, [page, searchQuery]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/auth/users?page=${page}&limit=12&search=${encodeURIComponent(searchQuery)}`);
      // Handle both old array format and new paginated object format
      if (data.users) {
        setStudents(data.users);
        setTotalPages(data.pages);
        setTotalStudents(data.total);
      } else {
        setStudents(data);
        setTotalPages(1);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerification = async (student) => {
    try {
      const data = await api.put(`/auth/users/${student._id}`, { isVerified: !student.isVerified });
      setStudents(prev => prev.map(s => s._id === student._id ? { ...s, isVerified: data.isVerified } : s));
    } catch (err) {
      alert(err.message || 'Update failed');
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await api.delete(`/auth/users/${id}`);
      setStudents(students.filter(s => s._id !== id));
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Student Directory</h1>
          <p className="text-slate-500 font-medium mt-1">Manage and monitor all hostel students</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="gap-2" onClick={exportToCSV}>
            <Download size={18} /> Export CSV
          </Button>
          <Button variant="gradient" className="gap-2 shadow-indigo-200">
            <UserPlus size={18} /> Add Student
          </Button>
        </div>
      </header>

      <Card className="border-none shadow-slate-200/50 overflow-hidden">
        <CardHeader className="border-b border-slate-50 bg-white/50 backdrop-blur-sm sticky top-0 z-10 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
               <Button variant="secondary" size="sm" className="gap-2 text-slate-600">
                  <Filter size={16} /> Filters
               </Button>
               <div className="h-8 w-[1px] bg-slate-200 mx-1" />
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Showing {students.length} of {totalStudents} students
               </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Student</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Room Info</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Joined</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence mode="popLayout">
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4"><div className="h-10 w-40 bg-slate-100 rounded-lg" /></td>
                        <td className="px-6 py-4"><div className="h-10 w-24 bg-slate-100 rounded-lg" /></td>
                        <td className="px-6 py-4"><div className="h-10 w-24 bg-slate-100 rounded-lg" /></td>
                        <td className="px-6 py-4"><div className="h-10 w-24 bg-slate-100 rounded-lg" /></td>
                        <td className="px-6 py-4 text-right"><div className="h-10 w-10 bg-slate-100 rounded-lg ml-auto" /></td>
                      </tr>
                    ))
                  ) : students.map((student) => (
                    <motion.tr 
                      key={student._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-none">{student.name}</p>
                            <p className="text-sm font-medium text-slate-400 mt-1 flex items-center gap-1">
                              <Mail size={12} /> {student.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500">
                             <Shield size={14} />
                          </div>
                          <span className="text-sm font-bold text-slate-700">
                            {student.room_id?.room_number ? `Room ${student.room_id.room_number}` : 'Pending Allotment'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-tight",
                          student.isVerified 
                            ? "bg-emerald-50 text-emerald-600" 
                            : "bg-amber-50 text-amber-600"
                        )}>
                          {student.isVerified ? <CheckCircle size={14} /> : <Clock size={14} />}
                          {student.isVerified ? 'VERIFIED' : 'PENDING'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-700">
                          {new Date(student.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={cn(
                              "h-9 w-9 rounded-xl",
                              student.isVerified ? "text-amber-500 hover:bg-amber-50" : "text-emerald-500 hover:bg-emerald-50"
                            )}
                            onClick={() => handleToggleVerification(student)}
                            title={student.isVerified ? "Revoke Verification" : "Verify Student"}
                          >
                            {student.isVerified ? <ShieldCheck size={18} /> : <MailCheck size={18} />}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 rounded-xl text-rose-500 hover:bg-rose-50"
                            onClick={() => handleDeleteStudent(student._id)}
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          
          {/* Empty State */}
          {!loading && students.length === 0 && (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                <Users size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">No students found</h3>
              <p className="text-slate-500 font-medium mt-2 max-w-sm mx-auto">
                We couldn't find any students matching your search criteria. Try adjusting your filters.
              </p>
              <Button variant="outline" className="mt-8 rounded-xl" onClick={fetchStudents}>
                Refresh List
              </Button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-slate-50 flex items-center justify-between">
              <p className="text-sm font-bold text-slate-400">
                Page <span className="text-slate-900">{page}</span> of <span className="text-slate-900">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="rounded-xl h-9 w-9 p-0"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  <ChevronLeft size={18} />
                </Button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={cn(
                        "h-9 w-9 rounded-xl text-xs font-bold transition-all",
                        page === i + 1 
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                          : "text-slate-400 hover:bg-slate-100"
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="rounded-xl h-9 w-9 p-0"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  <ChevronRight size={18} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Students;
