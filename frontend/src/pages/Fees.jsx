import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';
import { CreditCard, CheckCircle, AlertCircle, Clock, Receipt, ArrowRight, ShieldCheck, Download, Sparkles, Bed } from 'lucide-react';
import { useSelector } from 'react-redux';
import { generateReceipt } from '../utils/receiptService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/cn';

const Fees = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(null);
  const { userInfo } = useSelector(state => state.auth);

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      const data = await api.get('/payments/my-fees');
      setFees(data);
    } catch (err) {
      console.error("Failed to load fees", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = (fee) => {
    generateReceipt({
      type: 'Hostel Fee',
      student: { name: userInfo.name, email: userInfo.email },
      amount: fee.amount,
      date: fee.payment_details?.date,
      payment_id: fee.payment_details?.payment_id,
      reference: fee._id,
      details: `Room ${fee.room_id.room_number} - ${fee.duration} Months Allocation`
    });
  };

  const handlePay = async (bookingId, amount) => {
    setPaying(true);
    try {
      const order = await api.post('/payments/create-order', { booking_id: bookingId });
      
      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "UHostel Premium",
        description: "Hostel Fee Payment",
        order_id: order.id,
        handler: async (response) => {
          try {
            const verifyData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              booking_id: bookingId
            };
            
            const result = await api.post('/payments/verify', verifyData);
            if (result.success) {
              setSuccess("Payment successful! Your records have been updated.");
              fetchFees();
              setTimeout(() => setSuccess(null), 5000);
            }
          } catch (err) {
            console.error("Verification failed", err);
            alert("Payment verification failed. Please contact admin.");
          }
        },
        prefill: {
          name: userInfo?.name,
          email: userInfo?.email,
        },
        theme: {
          color: "#4F46E5",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => alert("Payment failed: " + response.error.description));
      rzp.open();
    } catch (err) {
      console.error("Order creation failed", err);
      alert(err.message || "Failed to initiate payment. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Hostel Fees</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your room allotment payments securely</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-2xl">
          <ShieldCheck size={18} className="text-indigo-600" />
          <span className="text-xs font-black text-indigo-600 tracking-widest uppercase">Razorpay Secured</span>
        </div>
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

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[1, 2].map(i => <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-3xl" />)}
        </div>
      ) : fees.length === 0 ? (
        <Card className="p-20 text-center border-dashed border-2 border-slate-200 shadow-none bg-transparent">
          <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-300">
            <Receipt size={40} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">All Settled!</h3>
          <p className="text-slate-500 font-medium mt-2 max-w-sm mx-auto">
            You don't have any pending payments or approved room bookings requiring immediate action.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {fees.map((fee) => (
            <motion.div 
              key={fee._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="border-none shadow-slate-200/50 overflow-hidden group">
                <div className="p-8 pb-0 flex justify-between items-start">
                  <div className={cn(
                    "px-4 py-1 rounded-full text-[10px] font-black tracking-widest",
                    fee.payment_status === 'Paid' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                  )}>
                    {fee.payment_status.toUpperCase()}
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount Due</p>
                     <h3 className="text-4xl font-black text-slate-900 tracking-tighter">₹{fee.amount}</h3>
                  </div>
                </div>

                <CardContent className="p-8">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600">
                       <Bed size={32} />
                    </div>
                    <div>
                       <h4 className="text-xl font-black text-slate-900 tracking-tight">Room {fee.room_id.room_number}</h4>
                       <p className="text-slate-500 font-medium">Standard Allotment • {fee.duration} Months</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                     <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Start Date</p>
                        <p className="font-bold text-slate-700">{new Date(fee.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                     </div>
                     <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                        <p className="font-bold text-slate-700">Verified Allotment</p>
                     </div>
                  </div>

                  {fee.payment_status !== 'Paid' ? (
                    <Button 
                      onClick={() => handlePay(fee._id, fee.amount)}
                      isLoading={paying}
                      variant="gradient"
                      className="w-full h-14 rounded-2xl text-lg font-black tracking-tight gap-3 shadow-indigo-100"
                    >
                      <Sparkles size={20} />
                      Complete Payment
                    </Button>
                  ) : (
                    <div className="flex gap-4">
                      <div className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 font-black rounded-2xl h-14 border border-emerald-100">
                         <CheckCircle size={20} /> Transaction Success
                      </div>
                      <Button 
                        onClick={() => handleDownloadReceipt(fee)}
                        variant="secondary"
                        className="h-14 w-14 rounded-2xl p-0"
                      >
                        <Download size={24} />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Fees;
