import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { api } from '../utils/api';
import { 
  AlertTriangle, Plus, CheckCircle, Trash2, User, Calendar, 
  DollarSign, Filter, CreditCard, ArrowRight, Download, X,
  ShieldAlert, Sparkles, Receipt
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/cn';
import { generateReceipt } from '../utils/receiptService';

const Fines = () => {
  const [fines, setFines] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(null);
  
  const [selectedStudent, setSelectedStudent] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const { userInfo } = useSelector(state => state.auth);
  const isAdmin = userInfo?.role === 'Admin';

  useEffect(() => {
    fetchFines();
    if (isAdmin) fetchStudents();
  }, []);

  const fetchFines = async () => {
    setLoading(true);
    try {
      const data = await api.get('/fines');
      setFines(data);
    } catch (err) {
      console.error('Fetch Fines Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      // Increase limit for dropdown to ensure most students are visible
      const data = await api.get('/auth/users?limit=1000');
      setStudents(data.users || data);
    } catch (err) {
      console.error('Fetch Students Error:', err);
    }
  };

  const handleIssueFine = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !amount || !reason) return;
    
    try {
      const data = await api.post('/fines', {
        student_id: selectedStudent,
        amount: Number(amount),
        reason
      });
      setFines(prev => [data, ...(prev || [])]);
      setShowIssueForm(false);
      setSelectedStudent('');
      setAmount('');
      setReason('');
    } catch (err) {
      alert(err.message || 'Failed to issue fine');
    }
  };

  const handleDownloadReceipt = (fine) => {
    generateReceipt({
      type: 'Student Fine',
      student: { name: userInfo.name, email: userInfo.email },
      amount: fine.amount,
      date: fine.payment_details?.date,
      payment_id: fine.payment_details?.payment_id,
      reference: fine._id,
      details: `Fine Reason: ${fine.reason}`
    });
  };

  const handlePayFine = async (fineId) => {
    setPaying(true);
    try {
      const order = await api.post('/payments/create-order', { fine_id: fineId });
      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "UHostel Premium",
        description: "Student Fine Settlement",
        order_id: order.id,
        handler: async (response) => {
          const result = await api.post('/payments/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            fine_id: fineId
          });
          if (result.success) {
            setSuccess("Fine settled successfully!");
            fetchFines();
            setTimeout(() => setSuccess(null), 5000);
          }
        },
        prefill: { name: userInfo?.name, email: userInfo?.email },
        theme: { color: "#ef4444" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert(err.message || "Failed to initiate payment.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Fee & Fine Management</h1>
          <p className="text-slate-500 font-medium mt-1">
            {isAdmin ? 'Monitor and enforce hostel discipline' : 'View and settle your issued penalties'}
          </p>
        </div>
        {isAdmin && (
          <Button variant="gradient" className="gap-2 shadow-indigo-100 bg-rose-600 hover:bg-rose-700" onClick={() => setShowIssueForm(true)}>
            <Plus size={18} /> Issue Fine
          </Button>
        )}
      </header>

      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-700 font-bold"
          >
            <CheckCircle size={20} />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         {/* Summary Cards */}
         <div className="lg:col-span-4 space-y-6">
            <Card className="bg-rose-600 text-white border-none shadow-lg shadow-rose-100 overflow-hidden relative group">
               <CardContent className="p-8 relative z-10">
                  <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl w-fit mb-6">
                     <AlertTriangle size={24} />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight leading-tight">Total Pending Penalties</h3>
                  <div className="mt-4 flex items-baseline gap-2">
                     <span className="text-4xl font-black">₹{fines.filter(f => f.status !== 'Paid').reduce((s, f) => s + f.amount, 0)}</span>
                     <span className="text-rose-100 font-bold uppercase text-xs tracking-widest">Unpaid</span>
                  </div>
               </CardContent>
               <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />
            </Card>

            <Card className="border-none shadow-slate-200/50">
               <CardHeader>
                  <CardTitle className="text-lg font-black tracking-tight">Recent Status</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                     <span className="text-sm font-bold text-slate-500">Settled this month</span>
                     <span className="text-sm font-black text-emerald-600">
                       {fines.filter(f => f.status === 'Paid').length} records
                     </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                     <span className="text-sm font-bold text-slate-500">Pending Actions</span>
                     <span className="text-sm font-black text-rose-600">
                       {fines.filter(f => f.status !== 'Paid').length} records
                     </span>
                  </div>
               </CardContent>
            </Card>
         </div>

         {/* Fines List */}
         <div className="lg:col-span-8 space-y-6">
            {loading ? (
              [...Array(3)].map(i => <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-3xl" />)
            ) : fines.length === 0 ? (
              <Card className="p-20 text-center border-dashed border-2 border-slate-200 shadow-none bg-transparent">
                 <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-300">
                    <ShieldAlert size={40} />
                 </div>
                 <h3 className="text-xl font-black text-slate-900 tracking-tight">No penalties issued</h3>
                 <p className="text-slate-500 font-medium mt-2">The record is clean. No fines found.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                 {fines.map((fine) => (
                   <motion.div layout key={fine._id}>
                      <Card className="border-none shadow-slate-200/50 overflow-hidden group hover:shadow-rose-100/30 transition-all">
                         <CardContent className="p-6 flex flex-col md:flex-row md:items-center gap-6">
                            <div className={cn(
                              "w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors",
                              fine.status === 'Paid' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                            )}>
                               <AlertTriangle size={28} />
                            </div>
                            <div className="flex-1">
                               <div className="flex items-center gap-3">
                                  <span className={cn(
                                    "px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase",
                                    fine.status === 'Paid' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                  )}>
                                    {fine.status}
                                  </span>
                                  <span className="text-xs font-bold text-slate-400">
                                     {new Date(fine.issued_at).toLocaleDateString()}
                                  </span>
                               </div>
                               <h3 className="text-lg font-black text-slate-900 tracking-tight mt-1">{fine.reason}</h3>
                               {isAdmin && (
                                 <p className="text-xs font-bold text-slate-500 mt-1">Issued to: {fine.student_id?.name}</p>
                               )}
                            </div>
                            <div className="flex items-center gap-6">
                               <div className="text-right">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</p>
                                  <p className="text-xl font-black text-slate-900">₹{fine.amount}</p>
                               </div>
                               <div className="flex gap-2">
                                  {isAdmin ? (
                                    <Button 
                                      variant="secondary" 
                                      size="sm" 
                                      className="h-10 w-10 p-0 text-rose-600 bg-rose-50 border-none hover:bg-rose-600 hover:text-white"
                                      onClick={() => api.delete(`/fines/${fine._id}`).then(() => fetchFines())}
                                    >
                                       <Trash2 size={18} />
                                    </Button>
                                  ) : (
                                    fine.status === 'Paid' ? (
                                      <Button variant="secondary" size="sm" className="gap-2 font-bold" onClick={() => handleDownloadReceipt(fine)}>
                                         <Download size={16} /> Receipt
                                      </Button>
                                    ) : (
                                      <Button variant="gradient" size="sm" className="bg-rose-600 hover:bg-rose-700" onClick={() => handlePayFine(fine._id)} isLoading={paying}>
                                         Settle Now
                                      </Button>
                                    )
                                  )}
                               </div>
                            </div>
                         </CardContent>
                      </Card>
                   </motion.div>
                 ))}
              </div>
            )}
         </div>
      </div>

      {/* Issue Fine Modal (Admin) */}
      <AnimatePresence>
        {showIssueForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowIssueForm(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
             <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden relative shadow-2xl z-[110]">
                <div className="p-8 bg-rose-600 text-white">
                   <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl w-fit mb-4">
                      <ShieldAlert size={24} />
                   </div>
                   <h2 className="text-2xl font-black tracking-tight">Issue New Penalty</h2>
                   <p className="text-rose-100 text-sm font-medium mt-1">Register a disciplinary fine for a student</p>
                   <button onClick={() => setShowIssueForm(false)} className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
                      <X size={24} />
                   </button>
                </div>
                <form className="p-8 space-y-6" onSubmit={handleIssueFine}>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Student</label>
                      <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-rose-500/10 outline-none" value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} required>
                         <option value="">Choose a resident...</option>
                         {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.email})</option>)}
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Penalty Amount (₹)</label>
                      <input type="number" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-rose-500/10 outline-none" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} required />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason for Penalty</label>
                      <textarea className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-rose-500/10 outline-none min-h-[100px]" placeholder="Violation details..." value={reason} onChange={e => setReason(e.target.value)} required />
                   </div>
                   <Button variant="gradient" className="w-full h-14 rounded-2xl font-black tracking-tight bg-rose-600 hover:bg-rose-700">
                      Issue Penalty
                   </Button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Fines;
