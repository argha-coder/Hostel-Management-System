import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bed, Home, CreditCard, Users, FileText, AlertTriangle, ShieldCheck, ArrowUpRight, Activity, TrendingUp, Calendar, ArrowRight, Plus } from 'lucide-react';
import { api } from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';

const AnimatedCounter = React.memo(({ from, to, duration = 2 }) => {
  const [count, setCount] = useState(from);

  useEffect(() => {
    let startTimestamp = null;
    let animationFrameId = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * (to - from) + from));
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };
    animationFrameId = window.requestAnimationFrame(step);
    return () => {
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
    };
  }, [from, to, duration]);

  return <span>{count}</span>;
});

const StatCard = ({ title, value, icon: Icon, color, delay, prefix = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <Card className="overflow-hidden border-none shadow-indigo-100/50">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className={`p-3 rounded-2xl ${color.bg} ${color.text}`}>
            <Icon size={24} />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">
            {prefix}<AnimatedCounter from={0} to={typeof value === 'number' ? value : parseInt(value) || 0} />
          </h3>
        </div>
      </CardContent>
      <div className={`h-1 w-full ${color.main}`} />
    </Card>
  </motion.div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchStats = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await api.get('/stats');
      setStats(data);
    } catch (err) {
      console.error("Failed to load stats", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-2xl" />)}
        </div>
        <div className="h-[400px] bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  const isAdmin = stats?.role === 'Admin';

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {isAdmin ? 'System Overview' : `Welcome back, ${stats.user?.name?.split(' ')[0]}!`}
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isAdmin && stats.user?.room && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 px-4 py-2 bg-indigo-50 rounded-2xl border border-indigo-100"
            >
              <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
                <Home size={16} />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Your Room</p>
                <p className="text-sm font-black text-indigo-900 leading-tight">Room {stats.user.room.room_number}</p>
              </div>
            </motion.div>
          )}
          {isAdmin && (
            <Button 
              variant="secondary" 
              size="sm" 
              className="gap-2" 
              onClick={fetchStats}
              isLoading={refreshing}
              disabled={refreshing}
            >
              <Activity size={16} /> {refreshing ? 'Updating...' : 'Refresh Stats'}
            </Button>
          )}
        </div>
      </header>
      
      {!isAdmin && stats.bookings?.some(b => b.status === 'Approved' && b.payment_status === 'Unpaid') && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm"
        >
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-orange-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
              <CreditCard size={28} />
            </div>
            <div>
              <h4 className="text-xl font-black text-orange-900 tracking-tight">Hostel Fees Pending</h4>
              <p className="text-orange-700 font-medium">Your room allotment is approved! Please complete the payment to secure your stay.</p>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/fees')}
            className="bg-orange-600 hover:bg-orange-700 text-white font-black px-8 h-12 rounded-xl shadow-lg shadow-orange-200"
          >
            Settle Dues
          </Button>
        </motion.div>
      )}

      {/* Stats Grid */}
      {isAdmin ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          {/* Admin Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Total Students" 
              value={stats.totalStudents} 
              icon={Users} 
              delay={0.1}
              color={{ bg: 'bg-indigo-50', text: 'text-indigo-600', main: 'bg-indigo-600' }}
            />
            <StatCard 
              title="Available Rooms" 
              value={stats.availableRooms} 
              icon={Home} 
              delay={0.2}
              color={{ bg: 'bg-emerald-50', text: 'text-emerald-600', main: 'bg-emerald-600' }}
            />
            <StatCard 
              title="Pending Gate Pass" 
              value={stats.pendingGatePasses} 
              icon={FileText} 
              delay={0.3}
              color={{ bg: 'bg-purple-50', text: 'text-purple-600', main: 'bg-purple-600' }}
            />
            <StatCard 
              title="Pending Revenue" 
              value={stats.pendingRevenue} 
              icon={CreditCard} 
              prefix="₹"
              delay={0.4}
              color={{ bg: 'bg-rose-50', text: 'text-rose-600', main: 'bg-rose-600' }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 border-none shadow-slate-200/50">
              <CardHeader className="flex flex-row items-center justify-between pb-8">
                <div>
                  <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Occupancy Metrics</CardTitle>
                  <CardDescription className="text-slate-500 font-medium">Real-time hostel utilization data</CardDescription>
                </div>
                <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-black uppercase tracking-widest">
                  Live Feed
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100 flex items-center justify-center relative overflow-hidden group">
                  <div className="text-center relative z-10">
                    <motion.p 
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-8xl font-black text-indigo-600 tracking-tighter"
                    >
                      {stats.occupancyRate}%
                    </motion.p>
                    <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-sm">Total Capacity Utilized</p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-slate-200/50">
              <CardHeader className="pb-8">
                <CardTitle className="text-xl font-black text-slate-900 tracking-tight">System Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'Core Database', status: 'Optimal', color: 'bg-emerald-500' },
                  { name: 'SMTP Gateway', status: 'Verified', color: 'bg-emerald-500' },
                  { name: 'Payment Bridge', status: 'Stable', color: 'bg-emerald-500' },
                  { name: 'Cloud Storage', status: 'Online', color: 'bg-indigo-500' }
                ].map((s, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                    <div className={`w-2.5 h-2.5 rounded-full animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.1)] ${s.color}`} />
                    <div className="flex-1">
                      <p className="text-sm font-black text-slate-900">{s.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.status}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Student Specific Cards */}
          <Card className="border-none shadow-slate-200/50 p-4">
            <CardHeader className="flex flex-row items-center gap-4 pb-6">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <ShieldCheck size={28} />
              </div>
              <div>
                <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Security Center</CardTitle>
                <CardDescription className="font-medium">Maintain your account protection</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                  Keep your portal secure. We recommend changing your password every 90 days to ensure maximum security.
                </p>
                <Button 
                  variant="secondary" 
                  className="w-full mt-6 bg-white border-slate-200 text-indigo-600 rounded-xl font-black"
                  onClick={() => navigate('/change-password')}
                >
                  Update Credentials
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-slate-200/50 p-4">
            <CardHeader className="flex flex-row items-center gap-4 pb-6">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                <CreditCard size={28} />
              </div>
              <div>
                <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Financial Hub</CardTitle>
                <CardDescription className="font-medium">Manage your dues and receipts</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                  Check your pending hostel fees, room allotment charges, and fine history. Settle your dues securely via Razorpay.
                </p>
                <Button 
                  variant="secondary" 
                  className="w-full mt-6 bg-white border-slate-200 text-amber-600 rounded-xl font-black"
                  onClick={() => navigate('/fees')}
                >
                  Review My Fees
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}



      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <Card className="border-none shadow-slate-200/50">
             <CardHeader>
               <CardTitle className="text-xl font-black tracking-tight tracking-tight">System Health</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <span className="font-bold text-slate-700">Total Students</span>
                  <span className="text-indigo-600 font-black">{stats.totalStudents}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <span className="font-bold text-slate-700">Total Rooms</span>
                  <span className="text-indigo-600 font-black">{stats.totalRooms}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <span className="font-bold text-slate-700">Verified Students</span>
                  <span className="text-emerald-600 font-black">{stats.verifiedStudents}</span>
                </div>
             </CardContent>
           </Card>
           
           <Card className="border-none shadow-slate-200/50">
             <CardHeader>
               <CardTitle className="text-xl font-black">Quick Actions</CardTitle>
             </CardHeader>
             <CardContent className="grid grid-cols-2 gap-4">
                <Button variant="ghost" className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 h-auto py-6 flex-col gap-3 rounded-3xl border border-indigo-100" onClick={() => navigate('/students')}>
                  <Users size={28} />
                  <span className="text-xs font-black uppercase tracking-widest">Students</span>
                </Button>
                <Button variant="ghost" className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 h-auto py-6 flex-col gap-3 rounded-3xl border border-emerald-100" onClick={() => navigate('/rooms')}>
                  <Home size={28} />
                  <span className="text-xs font-black uppercase tracking-widest">Rooms</span>
                </Button>
                <Button variant="ghost" className="bg-purple-50 text-purple-600 hover:bg-purple-100 h-auto py-6 flex-col gap-3 rounded-3xl border border-purple-100" onClick={() => navigate('/gatepass')}>
                  <FileText size={28} />
                  <span className="text-xs font-black uppercase tracking-widest">Gatepass</span>
                </Button>
                <Button variant="ghost" className="bg-rose-50 text-rose-600 hover:bg-rose-100 h-auto py-6 flex-col gap-3 rounded-3xl border border-rose-100" onClick={() => navigate('/fines')}>
                  <AlertTriangle size={28} />
                  <span className="text-xs font-black uppercase tracking-widest">Fines</span>
                </Button>
             </CardContent>
           </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
