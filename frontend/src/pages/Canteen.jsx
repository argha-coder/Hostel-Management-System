import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { useSelector } from 'react-redux';
import { api } from '../utils/api';
import { ShoppingBag, ShoppingCart, Plus, Minus, Trash2, Clock, CheckCircle, Package, User, CreditCard, Download } from 'lucide-react';
import GlowOrb from '../components/GlowOrb';
import { DEFAULT_PRODUCT_IMAGES, getProductImage, ALLOWED_PRODUCTS, getProductCategory, getProductDescription } from '../utils/canteenAssets';
import { generateCanteenReceipt } from '../utils/receiptService';

const Canteen = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('shop'); // 'shop' or 'orders'
  const [showAddModal, setShowAddModal] = useState(false);
  const [paying, setPaying] = useState(false);
  
  const [newProduct, setNewProduct] = useState({
    name: ALLOWED_PRODUCTS[0],
    price: '',
    stock: 100
  });

  const { userInfo } = useSelector(state => state.auth);
  const isAdmin = userInfo?.role === 'Admin';

  const handleImageError = (e, category) => {
    e.target.onerror = null; // Prevent infinite loop
    const fallback = DEFAULT_PRODUCT_IMAGES[category] || DEFAULT_PRODUCT_IMAGES.Fallback;
    if (e.target.src === fallback) {
      e.target.src = `https://placehold.co/400x300/f1f5f9/64748b?text=${category || 'Product'}`;
    } else {
      e.target.src = fallback;
    }
  };

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
        return prev.map(item => 
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item._id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart(prev => prev.map(item => {
      if (item._id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const placeOrder = async () => {
    if (cart.length === 0) return;
    setPaying(true);
    try {
      const orderData = {
        products: cart.map(item => ({
          product_id: item._id,
          quantity: item.quantity,
          price_at_order: item.price
        })),
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
          description: `Canteen Order #${canteenOrder._id.slice(-6)}`,
          order_id: rzpOrder.id,
          handler: async (response) => {
            try {
              const verifyResult = await api.post('/payments/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                canteen_order_id: canteenOrder._id
              });
              
              if (verifyResult.success) {
                alert('Order placed and paid successfully!');
                setCart([]);
                setActiveTab('orders');
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
          theme: { color: "#059669" },
          modal: { ondismiss: () => setPaying(false) }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      alert(err.message || 'Failed to place order');
    } finally {
      setPaying(false);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await api.put(`/canteen/order/${orderId}`, { status });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const productToSubmit = {
        ...newProduct,
        category: getProductCategory(newProduct.name),
        description: getProductDescription(newProduct.name),
        image: '' 
      };
      const data = await api.post('/canteen/products', productToSubmit);
      setProducts(prev => [...prev, data]);
      setShowAddModal(false);
      setNewProduct({
        name: ALLOWED_PRODUCTS[0],
        price: '',
        stock: 100
      });
    } catch (err) {
      alert(err.message || 'Failed to add product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to remove this item from the canteen?')) return;
    try {
      await api.delete(`/canteen/products/${productId}`);
      setProducts(prev => prev.filter(p => p._id !== productId));
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#D97706';
      case 'Confirmed': return '#2563EB';
      case 'Out for Delivery': return '#8B5CF6';
      case 'Delivered': return '#059669';
      case 'Cancelled': return '#DC2626';
      default: return '#4B5563';
    }
  };

  return (
    <div style={{ display: 'flex', background: 'var(--color-bg)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Sidebar />
      <GlowOrb color="rgba(5, 150, 105, 0.05)" size="600px" top="-10%" left="50%" />
      
      <main style={{ marginLeft: '300px', padding: '48px', flex: 1, zIndex: 1 }}>
        <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2.25rem', color: 'var(--color-text)', fontWeight: 800, letterSpacing: '-1px' }}>ECanteen Shop</h1>
            <p style={{ color: 'var(--color-text-muted)', marginTop: '8px', fontWeight: 500 }}>
              Order snacks and essentials with instant Razorpay checkout
            </p>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {isAdmin && activeTab === 'shop' && (
              <button 
                onClick={() => setShowAddModal(true)}
                className="btn-primary" 
                style={{ padding: '12px 24px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Plus size={18} /> Add Item
              </button>
            )}
            <div style={{ display: 'flex', background: 'white', padding: '6px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
              <button onClick={() => setActiveTab('shop')} style={{ padding: '10px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activeTab === 'shop' ? 'var(--color-primary)' : 'transparent', color: activeTab === 'shop' ? 'white' : 'var(--color-text-muted)', fontWeight: 700, transition: 'all 0.3s' }}>Shop</button>
              <button onClick={() => setActiveTab('orders')} style={{ padding: '10px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activeTab === 'orders' ? 'var(--color-primary)' : 'transparent', color: activeTab === 'orders' ? 'white' : 'var(--color-text-muted)', fontWeight: 700, transition: 'all 0.3s' }}>Orders</button>
            </div>
          </div>
        </header>

        {activeTab === 'shop' ? (
          <div style={{ display: isAdmin ? 'block' : 'grid', gridTemplateColumns: isAdmin ? 'none' : '1fr 400px', gap: '40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? 'repeat(auto-fill, minmax(280px, 1fr))' : 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', gridColumn: '1/-1', padding: '100px' }}>
                   <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} style={{ width: '40px', height: '40px', border: '3px solid var(--color-primary-light)', borderTopColor: 'var(--color-primary)', borderRadius: '50%' }} />
                </div>
              ) : products.map(product => (
                <motion.div key={product._id} whileHover={{ y: -8 }} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ height: '180px', background: '#F8FAFC', borderRadius: '16px', overflow: 'hidden' }}>
                    <img src={getProductImage(product)} alt={product.name} onError={(e) => handleImageError(e, product.category)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-primary)', fontWeight: 800, letterSpacing: '1px' }}>{product.category}</span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px', color: 'var(--color-text)' }}>{product.name}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '4px', height: '40px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{product.description}</p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-text)' }}>₹{product.price}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {isAdmin && (
                        <button onClick={() => handleDeleteProduct(product._id)} style={{ padding: '10px', borderRadius: '12px', color: '#EF4444', border: '1px solid #FCA5A5', background: 'transparent', cursor: 'pointer' }}>
                          <Trash2 size={18} />
                        </button>
                      )}
                      {!isAdmin && (
                        <button onClick={() => addToCart(product)} className="btn-primary" style={{ padding: '10px 16px', borderRadius: '12px' }}>
                          <Plus size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {!isAdmin && (
              <div className="glass-card" style={{ padding: '32px', height: 'fit-content', position: 'sticky', top: '48px', border: '1px solid var(--color-primary-light)' }}>
                <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 800, fontSize: '1.5rem' }}><ShoppingCart size={24} /> Your Cart</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '500px', overflowY: 'auto', marginBottom: '24px', paddingRight: '8px' }}>
                  {cart.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                      <ShoppingBag size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                      <p style={{ fontWeight: 500 }}>Your cart is empty</p>
                    </div>
                  ) : cart.map(item => (
                    <div key={item._id} style={{ display: 'flex', gap: '16px', alignItems: 'center', background: '#F8FAFC', padding: '12px', borderRadius: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '1rem', fontWeight: 700 }}>{item.name}</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>₹{item.price} per unit</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white', padding: '6px 12px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                        <button onClick={() => updateQuantity(item._id, -1)} style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex' }}><Minus size={14} /></button>
                        <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id, 1)} style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex' }}><Plus size={14} /></button>
                      </div>
                      <button onClick={() => removeFromCart(item._id)} style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                    </div>
                  ))}
                </div>
                {cart.length > 0 && (
                  <div style={{ borderTop: '2px dashed #E2E8F0', paddingTop: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--color-text-muted)' }}>Total Amount</span>
                      <span style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-text)', letterSpacing: '-1px' }}>₹{totalAmount}</span>
                    </div>
                    <button onClick={placeOrder} disabled={paying} className="btn-primary" style={{ width: '100%', padding: '18px', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', background: '#059669' }}>
                      {paying ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ width: '24px', height: '24px', border: '3px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} /> : <><CreditCard size={22} /> Pay with Razorpay</>}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {loading ? (
               <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} style={{ width: '40px', height: '40px', border: '3px solid var(--color-primary-light)', borderTopColor: 'var(--color-primary)', borderRadius: '50%' }} />
               </div>
            ) : orders.length === 0 ? (
              <div className="glass-card" style={{ padding: '100px', textAlign: 'center' }}>
                <Package size={64} style={{ margin: '0 auto 24px', opacity: 0.1 }} />
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>No Orders Found</h3>
                <p style={{ color: 'var(--color-text-muted)' }}>Start shopping to see your orders here.</p>
              </div>
            ) : orders.map(order => (
              <motion.div key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                  <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    <div style={{ background: '#F0F9FF', padding: '20px', borderRadius: '20px', color: '#0EA5E9' }}><ShoppingBag size={32} /></div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>ORDER #{order._id.slice(-8).toUpperCase()}</p>
                        {isAdmin && <span style={{ padding: '4px 12px', borderRadius: '8px', background: '#EEF2FF', color: '#4F46E5', fontSize: '0.75rem', fontWeight: 800 }}>STUDENT: {order.user_id?.name}</span>}
                      </div>
                      <h4 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-text)', marginTop: '4px' }}>₹{order.total_amount}</h4>
                      <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{new Date(order.createdAt).toLocaleString()}</span>
                        <span style={{ fontSize: '0.9rem', color: order.payment_status === 'Paid' ? '#059669' : '#EF4444', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {order.payment_status === 'Paid' ? <CheckCircle size={16} /> : <Clock size={16} />}
                          {order.payment_status === 'Paid' ? 'PAID' : 'UNPAID'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                    <span style={{ 
                      padding: '8px 20px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800,
                      background: getStatusColor(order.status) + '15', color: getStatusColor(order.status),
                      textTransform: 'uppercase', letterSpacing: '0.5px'
                    }}>
                      {order.status}
                    </span>
                    {order.payment_status === 'Paid' && (
                      <button 
                        onClick={() => generateCanteenReceipt(order)}
                        style={{ 
                          display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', 
                          borderRadius: '10px', background: 'white', border: '1px solid #E2E8F0',
                          fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text)', cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}
                      >
                        <Download size={14} /> Receipt
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px', padding: '20px', background: '#F8FAFC', borderRadius: '20px' }}>
                  {order.products.map((item, idx) => (
                    <div key={idx} style={{ padding: '10px 20px', background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.9rem', fontWeight: 600 }}>{item.product_id?.name} <span style={{ color: 'var(--color-primary)', marginLeft: '8px' }}>x{item.quantity}</span></div>
                  ))}
                </div>
                {isAdmin && order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '2px solid #F1F5F9', paddingTop: '24px' }}>
                    {order.status === 'Pending' && <button onClick={() => handleUpdateStatus(order._id, 'Confirmed')} className="btn-primary" style={{ padding: '12px 24px' }}>Confirm Order</button>}
                    {order.status === 'Confirmed' && <button onClick={() => handleUpdateStatus(order._id, 'Out for Delivery')} className="btn-primary" style={{ padding: '12px 24px', background: '#8B5CF6' }}>Out for Delivery</button>}
                    {(order.status === 'Confirmed' || order.status === 'Out for Delivery') && <button onClick={() => handleUpdateStatus(order._id, 'Delivered')} className="btn-primary" style={{ padding: '12px 24px', background: '#059669' }}>Mark Delivered</button>}
                    <button onClick={() => handleUpdateStatus(order._id, 'Cancelled')} className="btn-secondary" style={{ padding: '12px 24px', color: '#EF4444', borderColor: '#FCA5A5' }}>Cancel</button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {showAddModal && (
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(17, 24, 39, 0.4)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="glass-card" style={{ width: '500px', padding: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-text)', letterSpacing: '-1px' }}>Add Canteen Item</h2>
                  <button onClick={() => setShowAddModal(false)} style={{ background: '#F1F5F9', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={24} style={{ transform: 'rotate(45deg)' }} /></button>
                </div>
                <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase' }}>Product Name</label>
                    <select className="input-outline" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} required>
                      {ALLOWED_PRODUCTS.map(productName => <option key={productName} value={productName}>{productName}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase' }}>Price (₹)</label>
                    <input type="number" className="input-outline" placeholder="0" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} required />
                  </div>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                    <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary" style={{ flex: 1, padding: '16px' }}>Cancel</button>
                    <button type="submit" className="btn-primary" style={{ flex: 1, padding: '16px' }}>Add to Canteen</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Canteen;
