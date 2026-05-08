import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { api } from '../utils/api';
import { 
  ShoppingBag, ShoppingCart, Plus, Minus, Trash2, Clock, CheckCircle, 
  Package, User, CreditCard, Download, Search, Filter, ArrowRight,
  Sparkles, X, LayoutGrid, List as ListIcon, Store
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/cn';
import { DEFAULT_PRODUCT_IMAGES, getProductImage, ALLOWED_PRODUCTS, getProductCategory, getProductDescription } from '../utils/canteenAssets';
import { generateCanteenReceipt } from '../utils/receiptService';

const ProductCard = ({ product, onAdd, isAdmin, onDelete }) => {
  const category = product.category || 'Snacks';
  
  return (
    <motion.div layout whileHover={{ y: -4 }}>
      <Card className="border-none shadow-slate-200/50 hover:shadow-indigo-100/50 transition-all overflow-hidden group h-full flex flex-col">
        <div className="h-48 bg-slate-50 relative overflow-hidden">
           <img 
            src={getProductImage(product)} 
            alt={product.name} 
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
           />
           <div className="absolute top-3 left-3 px-2 py-0.5 bg-white/90 backdrop-blur-md rounded-lg text-[10px] font-black text-indigo-600 uppercase tracking-widest shadow-sm">
             {category}
           </div>
        </div>
        <CardContent className="p-5 flex-1 flex flex-col">
          <h3 className="font-black text-slate-900 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-xs font-medium text-slate-400 mt-1 flex-1 line-clamp-2">
            {product.description || 'Delicious treats and essentials from UHostel Canteen.'}
          </p>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
             <span className="text-xl font-black text-slate-900">₹{product.price}</span>
             <div className="flex gap-2">
                {isAdmin ? (
                  <Button variant="secondary" size="sm" className="h-9 w-9 p-0 text-rose-500 hover:bg-rose-50 border-none" onClick={() => onDelete(product._id)}>
                    <Trash2 size={16} />
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" className="h-9 w-9 p-0 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white border-none transition-all" onClick={() => onAdd(product)}>
                    <Plus size={18} />
                  </Button>
                )}
             </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Canteen = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('shop');
  const [showAddModal, setShowAddModal] = useState(false);
  const [paying, setPaying] = useState(false);
  
  const [newProduct, setNewProduct] = useState({
    name: ALLOWED_PRODUCTS[0],
    price: '',
    stock: 100
  });

  const { userInfo } = useSelector(state => state.auth);
  const isAdmin = userInfo?.role === 'Admin';

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'shop') {
        const data = await api.get('/canteen/products');
        setProducts(data);
      } else {
        const endpoint = isAdmin ? '/canteen/orders' : '/canteen/my-orders';
        const data = await api.get(endpoint);
        setOrders(data);
      }
    } catch (err) {
      console.error('Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        return prev.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const placeOrder = async () => {
    if (cart.length === 0) return;
    setPaying(true);
    try {
      const orderData = {
        products: cart.map(item => ({ product_id: item._id, quantity: item.quantity, price_at_order: item.price })),
        total_amount: totalAmount
      };
      
      const canteenOrder = await api.post('/canteen/order', orderData);

      if (isAdmin) {
        await api.put(`/canteen/order/${canteenOrder._id}`, { status: 'Confirmed' });
        alert('Internal Order placed successfully!');
        setCart([]);
        setActiveTab('orders');
      } else {
        const rzpOrder = await api.post('/payments/create-order', { canteen_order_id: canteenOrder._id });
        const options = {
          key: rzpOrder.key_id,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          name: "UHostel Canteen",
          description: `Order #${canteenOrder._id.slice(-6)}`,
          order_id: rzpOrder.id,
          handler: async (response) => {
            const verifyResult = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              canteen_order_id: canteenOrder._id
            });
            if (verifyResult.success) {
              setCart([]);
              setActiveTab('orders');
            }
          },
          prefill: { name: userInfo?.name, email: userInfo?.email },
          theme: { color: "#4f46e5" },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      alert(err.message || 'Order failed');
    } finally {
      setPaying(false);
    }
  };

  const statusConfig = {
    'Pending': { bg: 'bg-amber-50', text: 'text-amber-600' },
    'Confirmed': { bg: 'bg-indigo-50', text: 'text-indigo-600' },
    'Out for Delivery': { bg: 'bg-purple-50', text: 'text-purple-600' },
    'Delivered': { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    'Cancelled': { bg: 'bg-rose-50', text: 'text-rose-600' },
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">ECanteen Store</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-100">
             <button 
              onClick={() => setActiveTab('shop')}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-black tracking-widest uppercase transition-all",
                activeTab === 'shop' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-400 hover:text-slate-600"
              )}
             >
                Store
             </button>
             <button 
              onClick={() => setActiveTab('orders')}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-black tracking-widest uppercase transition-all",
                activeTab === 'orders' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-400 hover:text-slate-600"
              )}
             >
                Orders
             </button>
          </div>
          {isAdmin && activeTab === 'shop' && (
            <Button variant="gradient" className="gap-2 shadow-indigo-100" onClick={() => setShowAddModal(true)}>
              <Plus size={18} /> Add Item
            </Button>
          )}
        </div>
      </header>

      {activeTab === 'shop' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
           <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {loading ? (
                [...Array(6)].map(i => <div key={i} className="h-72 bg-slate-100 animate-pulse rounded-3xl" />)
              ) : products.map(product => (
                <ProductCard 
                  key={product._id} 
                  product={product} 
                  onAdd={addToCart} 
                  isAdmin={isAdmin}
                  onDelete={(id) => api.delete(`/canteen/products/${id}`).then(() => fetchData())}
                />
              ))}
           </div>

           {/* Sidebar Cart */}
           {!isAdmin && (
             <div className="lg:col-span-4 sticky top-28">
                <Card className="border-none shadow-slate-200/50 overflow-hidden">
                   <CardHeader className="bg-indigo-600 text-white p-6">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                            <ShoppingCart size={20} />
                         </div>
                         <div>
                            <CardTitle className="text-xl font-black tracking-tight">Your Basket</CardTitle>
                            <CardDescription className="text-indigo-100 font-medium">{cart.length} items selected</CardDescription>
                         </div>
                      </div>
                   </CardHeader>
                   <CardContent className="p-6">
                      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                         {cart.length === 0 ? (
                           <div className="py-12 text-center">
                              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                                 <ShoppingBag size={28} />
                              </div>
                              <p className="text-slate-500 font-bold">Basket is empty</p>
                              <p className="text-slate-400 text-xs mt-1">Start adding snacks to your order!</p>
                           </div>
                         ) : cart.map((item) => (
                           <div key={item._id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 group">
                              <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                                 <img src={getProductImage(item)} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 overflow-hidden">
                                 <p className="text-sm font-bold text-slate-900 truncate">{item.name}</p>
                                 <p className="text-xs font-bold text-indigo-600">₹{item.price}</p>
                              </div>
                              <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-lg border border-slate-200">
                                 <button onClick={() => addToCart(item)} className="text-slate-400 hover:text-indigo-600"><Plus size={14} /></button>
                                 <span className="text-xs font-black text-slate-900">{item.quantity}</span>
                                 <button onClick={() => setCart(cart.map(i => i._id === item._id ? {...i, quantity: Math.max(0, i.quantity - 1)} : i).filter(i => i.quantity > 0))} className="text-slate-400 hover:text-rose-500"><Minus size={14} /></button>
                              </div>
                           </div>
                         ))}
                      </div>

                      {cart.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-dashed border-slate-200 space-y-6">
                           <div className="flex justify-between items-center">
                              <span className="text-sm font-bold text-slate-400">Subtotal</span>
                              <span className="text-2xl font-black text-slate-900">₹{totalAmount}</span>
                           </div>
                           <Button 
                            variant="gradient" 
                            className="w-full h-14 rounded-2xl font-black tracking-tight text-lg shadow-indigo-100"
                            onClick={placeOrder}
                            isLoading={paying}
                           >
                              Checkout via Razorpay
                           </Button>
                        </div>
                      )}
                   </CardContent>
                </Card>
             </div>
           )}
        </div>
      ) : (
        /* Orders Tab */
        <div className="space-y-6">
           {loading ? (
             [...Array(3)].map(i => <div key={i} className="h-40 bg-slate-100 animate-pulse rounded-3xl" />)
           ) : orders.length === 0 ? (
             <Card className="p-20 text-center border-dashed border-2 border-slate-200 shadow-none bg-transparent">
                <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-300">
                   <Package size={40} />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">No orders yet</h3>
                <p className="text-slate-500 font-medium mt-2">Place your first order to see it here!</p>
             </Card>
           ) : (
             orders.map((order) => (
               <Card key={order._id} className="border-none shadow-slate-200/50 overflow-hidden group">
                  <CardContent className="p-0">
                     <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                           <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                              <ShoppingBag size={28} />
                           </div>
                           <div>
                              <div className="flex items-center gap-3">
                                 <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Order #{order._id.slice(-6).toUpperCase()}</h4>
                                 <span className={cn(
                                   "px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase",
                                   statusConfig[order.status]?.bg, statusConfig[order.status]?.text
                                 )}>
                                   {order.status}
                                 </span>
                              </div>
                              <h3 className="text-2xl font-black text-slate-900 tracking-tighter mt-1">₹{order.total_amount}</h3>
                              <p className="text-xs font-bold text-slate-400 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           {order.payment_status === 'Paid' && (
                             <Button variant="secondary" size="sm" className="gap-2 rounded-xl font-bold text-slate-600" onClick={() => generateCanteenReceipt(order)}>
                                <Download size={16} /> Receipt
                             </Button>
                           )}
                           {isAdmin && order.status === 'Pending' && (
                             <Button variant="gradient" size="sm" onClick={() => api.put(`/canteen/order/${order._id}`, {status: 'Confirmed'}).then(() => fetchData())}>
                                Confirm Order
                             </Button>
                           )}
                        </div>
                     </div>
                     <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-50 flex gap-2 flex-wrap">
                        {order.products.map((p, i) => (
                          <div key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700">
                             {p.product_id?.name} <span className="text-indigo-600 ml-1">x{p.quantity}</span>
                          </div>
                        ))}
                     </div>
                  </CardContent>
               </Card>
             ))
           )}
        </div>
      )}

      {/* Add Product Modal (Admin) */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
             <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden relative shadow-2xl z-[110]">
                <div className="p-8 bg-indigo-600 text-white">
                   <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl w-fit mb-4">
                      <Store size={24} />
                   </div>
                   <h2 className="text-2xl font-black tracking-tight">Add Canteen Item</h2>
                   <p className="text-indigo-100 text-sm font-medium mt-1">Inventory management for ECanteen</p>
                   <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
                      <X size={24} />
                   </button>
                </div>
                <form className="p-8 space-y-6" onSubmit={(e) => {
                  e.preventDefault();
                  const p = {...newProduct, category: getProductCategory(newProduct.name), description: getProductDescription(newProduct.name)};
                  api.post('/canteen/products', p).then(() => {setShowAddModal(false); fetchData();});
                }}>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Product</label>
                      <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})}>
                         {ALLOWED_PRODUCTS.map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Price (₹)</label>
                      <input type="number" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/10 outline-none" placeholder="0.00" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} required />
                   </div>
                   <Button variant="gradient" className="w-full h-14 rounded-2xl font-black tracking-tight">
                      Register Canteen Item
                   </Button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Canteen;
