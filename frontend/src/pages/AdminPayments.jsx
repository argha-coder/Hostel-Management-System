import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';
import { 
  Search, Filter, Download, User, CreditCard, Clock, 
  AlertCircle, CheckCircle, Trash2, ChevronLeft, ChevronRight,
  MoreHorizontal, FileText, ArrowRight, DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/cn';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const data = await api.get('/payments/all');
      setPayments(data);
    } catch (err) {
      console.error("Failed to fetch payments", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment record?')) return;
    try {
      await api.delete(`/payments/${id}`);
      setPayments(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete record');
    }
  };

  const filteredPayments = payments.filter(p => {
    const nameMatch = p.student_id?.name?.toLowerCase().includes(search.toLowerCase());
    const roomMatch = p.room_id?.room_number?.includes(search);
    const matchesSearch = nameMatch || roomMatch;
    
    let matchesFilter = filter === 'All';
    if (filter === 'Paid') matchesFilter = p.payment_status === 'Paid';
    if (filter === 'Unpaid') matchesFilter = p.payment_status === 'Unpaid';
    
    return matchesSearch && matchesFilter;
  });

  const exportToCSV = () => {
    const headers = ['Student Name', 'Email', 'Room Number', 'Duration (Months)', 'Amount', 'Status', 'Date'];
    const csvRows = [
      headers.join(','),
      ...filteredPayments.map(p => [
        `"${p.student_id?.name || 'N/A'}"`,
        `"${p.student_id?.email || 'N/A'}"`,
        p.room_id?.room_number || 'N/A',
        p.duration,
        p.amount,
        p.payment_status,
        new Date(p.start_date).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `hostel_payments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Payment Oversight</h1>
          <p className="text-slate-500 font-medium mt-1">Audit and manage student financial records</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="gradient" className="gap-2 shadow-indigo-100" onClick={exportToCSV}>
            <Download size={18} /> Export Records
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         <Card className="bg-indigo-600 text-white border-none shadow-indigo-100">
            <CardContent className="p-6">
               <p className="text-[10px] font-black uppercase tracking-widest text-indigo-100">Total Revenue</p>
               <h3 className="text-3xl font-black mt-2">₹{payments.filter(p => p.payment_status === 'Paid').reduce((s, p) => s + p.amount, 0).toLocaleString()}</h3>
            </CardContent>
         </Card>
         <Card className="border-none shadow-slate-200/50">
            <CardContent className="p-6">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unpaid Dues</p>
               <h3 className="text-3xl font-black mt-2 text-rose-600">₹{payments.filter(p => p.payment_status !== 'Paid').reduce((s, p) => s + p.amount, 0).toLocaleString()}</h3>
            </CardContent>
         </Card>
      </div>

      <Card className="border-none shadow-slate-200/50 overflow-hidden">
        <CardHeader className="bg-white/50 backdrop-blur-sm border-b border-slate-50 p-6">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                  type="text" 
                  placeholder="Search student or room..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                 />
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                 {['All', 'Paid', 'Unpaid'].map((f) => (
                   <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                      filter === f ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                   >
                     {f}
                   </button>
                 ))}
              </div>
           </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Resident</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Allocation</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Financials</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence mode="popLayout">
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={5} className="px-6 py-4"><div className="h-12 bg-slate-100 rounded-xl" /></td>
                      </tr>
                    ))
                  ) : filteredPayments.map((p) => (
                    <motion.tr 
                      key={p._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50/50 transition-all group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-black group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            {p.student_id?.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-none">{p.student_id?.name || 'Unknown'}</p>
                            <p className="text-xs font-medium text-slate-400 mt-1">{p.student_id?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600"><FileText size={14} /></div>
                            Room {p.room_id?.room_number || 'N/A'} • {p.duration}mo
                         </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-black text-slate-900">₹{p.amount}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(p.start_date).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4">
                         <span className={cn(
                           "px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase",
                           p.payment_status === 'Paid' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                         )}>
                            {p.payment_status}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 text-slate-400 hover:text-indigo-600">
                               <ArrowRight size={18} />
                            </Button>
                            {p.payment_status === 'Unpaid' && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="rounded-xl h-9 w-9 text-rose-500 hover:bg-rose-50"
                                onClick={() => handleDeleteRecord(p._id)}
                              >
                                 <Trash2 size={18} />
                              </Button>
                            )}
                         </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          {!loading && filteredPayments.length === 0 && (
            <div className="p-20 text-center text-slate-400 font-medium">
               No payment records match your current view.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPayments;
