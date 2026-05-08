import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { api } from '../utils/api';
import { 
  Megaphone, Plus, Trash2, Calendar, User, AlertCircle, Clock, 
  Send, Sparkles, X, ChevronRight, Bookmark, ArrowUpRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/cn';

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('Normal');

  const { userInfo } = useSelector(state => state.auth);
  const isAdmin = userInfo?.role === 'Admin';

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const data = await api.get('/notices');
      setNotices(data);
    } catch (err) {
      console.error('Fetch Notices Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostNotice = async (e) => {
    e.preventDefault();
    if (!title || !content) return;
    
    try {
      const data = await api.post('/notices', { title, content, priority });
      setNotices([data, ...notices]);
      setShowAddForm(false);
      setTitle('');
      setContent('');
      setPriority('Normal');
    } catch (err) {
      alert(err.message || 'Failed to post notice');
    }
  };

  const priorityConfig = {
    'Urgent': { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', dot: 'bg-rose-500' },
    'Normal': { color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', dot: 'bg-indigo-500' },
    'Low': { color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100', dot: 'bg-slate-500' },
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Notice Board</h1>
          <p className="text-slate-500 font-medium mt-1">Official announcements and community updates</p>
        </div>
        {isAdmin && (
          <Button variant="gradient" className="gap-2 shadow-indigo-100" onClick={() => setShowAddForm(true)}>
            <Plus size={18} /> Post Notice
          </Button>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         {/* Featured / Stats Sidebar */}
         <div className="lg:col-span-4 space-y-6">
            <Card className="bg-indigo-600 text-white border-none shadow-lg shadow-indigo-200 overflow-hidden relative group">
               <CardContent className="p-8 relative z-10">
                  <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl w-fit mb-6">
                     <Megaphone size={24} />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight leading-tight">Stay Updated with UHostel Premium</h3>
                  <p className="text-indigo-100 font-medium mt-2 text-sm">Real-time alerts for maintenance, events, and academic updates.</p>
               </CardContent>
               <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />
            </Card>

            <Card className="border-none shadow-slate-200/50">
               <CardHeader>
                  <CardTitle className="text-lg font-black tracking-tight">Active Categories</CardTitle>
               </CardHeader>
               <CardContent className="space-y-3">
                  {Object.entries(priorityConfig).map(([name, config]) => (
                    <div key={name} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                       <div className="flex items-center gap-3">
                          <div className={cn("w-2 h-2 rounded-full", config.dot)} />
                          <span className="text-sm font-bold text-slate-700">{name} priority</span>
                       </div>
                       <span className="text-xs font-black text-slate-400">
                         {notices.filter(n => n.priority === name).length}
                       </span>
                    </div>
                  ))}
               </CardContent>
            </Card>
         </div>

         {/* Notices Feed */}
         <div className="lg:col-span-8 space-y-6">
            <AnimatePresence mode="popLayout">
               {loading ? (
                 [...Array(3)].map(i => <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-3xl" />)
               ) : notices.length === 0 ? (
                 <Card className="p-20 text-center border-dashed border-2 border-slate-200 shadow-none bg-transparent">
                    <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-300">
                       <AlertCircle size={40} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">No announcements</h3>
                    <p className="text-slate-500 font-medium mt-2">The notice board is currently empty.</p>
                 </Card>
               ) : notices.map((notice) => {
                 const config = priorityConfig[notice.priority] || priorityConfig.Normal;
                 return (
                   <motion.div 
                    layout
                    key={notice._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                   >
                     <Card className="border-none shadow-slate-200/50 overflow-hidden hover:shadow-indigo-100/30 transition-all group">
                        <CardContent className="p-0">
                           <div className="p-8">
                              <div className="flex justify-between items-start mb-4">
                                 <div className="flex items-center gap-3">
                                    <span className={cn(
                                      "px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase",
                                      config.bg, config.color
                                    )}>
                                      {notice.priority}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                                       <Clock size={14} />
                                       {new Date(notice.createdAt).toLocaleDateString()}
                                    </div>
                                 </div>
                                 {isAdmin && (
                                   <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-slate-400 hover:text-rose-500 rounded-xl"
                                    onClick={() => api.delete(`/notices/${notice._id}`).then(() => fetchNotices())}
                                   >
                                      <Trash2 size={18} />
                                   </Button>
                                 )}
                              </div>
                              <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">
                                 {notice.title}
                              </h3>
                              <div className="mt-4 p-6 bg-slate-50 rounded-[24px] border border-slate-100 text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                                 {notice.content}
                              </div>
                              <div className="mt-6 flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-black">
                                       {notice.author?.name?.charAt(0) || 'W'}
                                    </div>
                                    <div>
                                       <p className="text-xs font-black text-slate-900 leading-none">{notice.author?.name || 'Admin'}</p>
                                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Hostel Warden</p>
                                    </div>
                                 </div>
                                 <Button variant="ghost" size="sm" className="gap-2 font-bold text-indigo-600">
                                    Read More <ChevronRight size={16} />
                                 </Button>
                              </div>
                           </div>
                        </CardContent>
                     </Card>
                   </motion.div>
                 )
               })}
            </AnimatePresence>
         </div>
      </div>

      {/* Add Notice Modal */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddForm(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
             <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden relative shadow-2xl z-[110]">
                <div className="p-8 bg-indigo-600 text-white">
                   <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl w-fit mb-4">
                      <Sparkles size={24} />
                   </div>
                   <h2 className="text-2xl font-black tracking-tight">Post Announcement</h2>
                   <p className="text-indigo-100 text-sm font-medium mt-1">Broadcast important news to all students</p>
                   <button onClick={() => setShowAddForm(false)} className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
                      <X size={24} />
                   </button>
                </div>
                <form className="p-8 space-y-6" onSubmit={handlePostNotice}>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                      <input 
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="e.g. Mandatory Hostel Meeting"
                        required
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority</label>
                      <div className="flex gap-2">
                         {['Normal', 'Urgent', 'Low'].map(p => (
                           <button
                            key={p}
                            type="button"
                            onClick={() => setPriority(p)}
                            className={cn(
                              "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                              priority === p ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                            )}
                           >
                             {p}
                           </button>
                         ))}
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Announcement Content</label>
                      <textarea 
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none min-h-[120px]"
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder="Write your announcement details here..."
                        required
                      />
                   </div>
                   <Button variant="gradient" className="w-full h-14 rounded-2xl font-black tracking-tight mt-4">
                      Publish Notice
                   </Button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notices;
