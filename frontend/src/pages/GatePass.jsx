import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { api } from '../utils/api';
import { 
  Clock, CheckCircle, XCircle, FileText, Send, Calendar, User, 
  ClipboardList, Plus, Search, Filter, ArrowRight, MoreHorizontal,
  ChevronRight, Sparkles, ShieldAlert
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/cn';

const GatePass = () => {
  const [gatePasses, setGatePasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApplyForm, setShowApplyForm] = useState(false);
  
  const [reason, setReason] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [returnTime, setReturnTime] = useState('');

  const { userInfo } = useSelector(state => state.auth);
  const isAdmin = userInfo?.role === 'Admin';

  const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };
  
  const minDateTime = getCurrentDateTime();

  useEffect(() => {
    if (userInfo) fetchGatePasses();
  }, [userInfo, isAdmin]);

  const fetchGatePasses = async () => {
    try {
      const endpoint = isAdmin ? '/gatepass' : '/gatepass/my';
      const data = await api.get(endpoint);
      setGatePasses(data);
    } catch (err) {
      setError(err.message || 'Failed to load gate passes');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!reason || !departureTime || !returnTime) return;

    const now = new Date();
    const departureDate = new Date(departureTime);
    
    // Set to start of minute for comparison
    now.setSeconds(0, 0);
    departureDate.setSeconds(0, 0);

    if (departureDate < now) {
      alert('Departure time cannot be in the past');
      return;
    }

    if (new Date(returnTime) <= departureDate) {
      alert('Return time must be after departure time');
      return;
    }
    
    try {
      const data = await api.post('/gatepass', {
        reason,
        departure_time: departureTime,
        return_time: returnTime
      });
      setGatePasses([data, ...gatePasses]);
      setShowApplyForm(false);
      setReason('');
      setDepartureTime('');
      setReturnTime('');
    } catch (err) {
      alert(err.message || 'Failed to apply for gate pass');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const confirmation = window.confirm(`Are you sure you want to ${status.toLowerCase()} this request?`);
      if (!confirmation) return;

      const payload = { 
        status,
        review_note: `${status} by Warden on ${new Date().toLocaleDateString()}`
      };

      const data = await api.put(`/gatepass/${id}`, payload);
      setGatePasses(prev => prev.map(gp => String(gp._id) === String(id) ? data : gp));
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const statusConfig = {
    'Pending': { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500', icon: <Clock size={14} /> },
    'Approved': { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500', icon: <CheckCircle size={14} /> },
    'Declined': { bg: 'bg-rose-50', text: 'text-rose-600', dot: 'bg-rose-500', icon: <XCircle size={14} /> },
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gate Pass System</h1>
          <p className="text-slate-500 font-medium mt-1">
            {isAdmin ? 'Review and manage student leave requests' : 'Request and track your exit permits'}
          </p>
        </div>
        {!isAdmin && (
          <Button variant="gradient" className="gap-2 shadow-indigo-100" onClick={() => setShowApplyForm(true)}>
            <Send size={18} /> New Application
          </Button>
        )}
      </header>

      {/* Main List */}
      <Card className="border-none shadow-slate-200/50 overflow-hidden">
        <CardHeader className="bg-white/50 backdrop-blur-sm border-b border-slate-50">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                 <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <ClipboardList size={20} className="text-indigo-600" /> Recent Requests
                 </h3>
                 <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full">
                   {gatePasses.length} TOTAL
                 </span>
              </div>
              <div className="flex items-center gap-3">
                 <Button variant="secondary" size="sm" className="gap-2 text-slate-600">
                    <Filter size={16} /> Filters
                 </Button>
              </div>
           </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 space-y-4">
               {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-50 animate-pulse rounded-2xl" />)}
            </div>
          ) : gatePasses.length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-300">
                <ClipboardList size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">No requests found</h3>
              <p className="text-slate-500 font-medium mt-2 max-w-sm mx-auto">
                {isAdmin ? 'There are no pending gate pass applications at this time.' : 'You haven\'t applied for any gate passes yet.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
               {gatePasses.map((gp) => {
                 const config = statusConfig[gp.status] || { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-500' };
                 return (
                   <motion.div 
                    layout
                    key={gp._id}
                    className="p-6 hover:bg-slate-50/50 transition-all flex flex-col md:flex-row md:items-center gap-8 group"
                   >
                     <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                           <span className={cn(
                             "px-3 py-1 rounded-full text-[10px] font-black tracking-widest flex items-center gap-1.5",
                             config.bg, config.text
                           )}>
                             {config.icon} {gp.status.toUpperCase()}
                           </span>
                           <span className="text-xs font-bold text-slate-400">
                             Applied {new Date(gp.createdAt).toLocaleDateString()}
                           </span>
                        </div>
                        <h4 className="text-lg font-black text-slate-900 tracking-tight leading-tight">{gp.reason}</h4>
                        {isAdmin && (
                          <div className="flex items-center gap-2 pt-1">
                             <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                                {gp.student_id?.name?.charAt(0)}
                             </div>
                             <span className="text-sm font-bold text-slate-600">{gp.student_id?.name}</span>
                          </div>
                        )}
                     </div>

                     <div className="flex flex-wrap gap-4 md:w-80">
                        <div className="flex-1 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                              <ArrowRight size={10} className="text-rose-500" /> Departure
                           </p>
                           <p className="text-xs font-black text-slate-900">
                              {new Date(gp.departure_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                           </p>
                        </div>
                        <div className="flex-1 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                              <ChevronRight size={10} className="text-emerald-500 rotate-180" /> Return
                           </p>
                           <p className="text-xs font-black text-slate-900">
                              {new Date(gp.return_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                           </p>
                        </div>
                     </div>

                     <div className="flex items-center gap-3 md:w-48 justify-end">
                        {isAdmin && gp.status === 'Pending' ? (
                          <div className="flex gap-2">
                             <Button 
                              variant="secondary" 
                              size="sm" 
                              className="text-rose-600 bg-rose-50 hover:bg-rose-100 border-none rounded-xl"
                              onClick={() => handleStatusUpdate(gp._id, 'Declined')}
                             >
                               <XCircle size={18} />
                             </Button>
                             <Button 
                              variant="secondary" 
                              size="sm" 
                              className="text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-none rounded-xl"
                              onClick={() => handleStatusUpdate(gp._id, 'Approved')}
                             >
                               <CheckCircle size={18} />
                             </Button>
                          </div>
                        ) : (
                          <Button variant="ghost" size="icon" className="text-slate-400 group-hover:text-indigo-600 rounded-xl transition-colors">
                             <MoreHorizontal size={20} />
                          </Button>
                        )}
                     </div>
                   </motion.div>
                 )
               })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Apply Modal */}
      <AnimatePresence>
        {showApplyForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowApplyForm(false)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
             />
             <motion.div 
               initial={{ opacity: 0, y: 20, scale: 0.95 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, y: 20, scale: 0.95 }}
               className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden relative shadow-2xl z-[110]"
             >
                <div className="p-8 bg-indigo-600 text-white relative">
                   <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl w-fit mb-4">
                      <Sparkles size={24} />
                   </div>
                   <h2 className="text-2xl font-black tracking-tight">Request Gate Pass</h2>
                   <p className="text-indigo-100 text-sm font-medium mt-1">Submit your leave application for approval</p>
                   <button onClick={() => setShowApplyForm(false)} className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
                      <XCircle size={24} />
                   </button>
                </div>
                
                <form onSubmit={handleApply} className="p-8 space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason for Leave</label>
                      <textarea 
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none min-h-[100px]"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Explain your reason for leaving..."
                        required
                      />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Departure</label>
                        <input 
                          type="datetime-local"
                          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none"
                          value={departureTime}
                          min={minDateTime}
                          onChange={(e) => setDepartureTime(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Return</label>
                        <input 
                          type="datetime-local"
                          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none"
                          value={returnTime}
                          min={departureTime || minDateTime}
                          onChange={(e) => setReturnTime(e.target.value)}
                          required
                        />
                      </div>
                   </div>
                   <Button variant="gradient" className="w-full h-14 rounded-2xl font-black tracking-tight mt-4">
                      Submit Request
                   </Button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GatePass;
