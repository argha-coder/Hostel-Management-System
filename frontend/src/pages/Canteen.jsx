import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { useSelector } from 'react-redux';
import { api } from '../utils/api';
import { ShoppingBag, ShoppingCart, Plus, Minus, Trash2, Clock, CheckCircle, Package, User } from 'lucide-react';

const Canteen = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('shop'); // 'shop' or 'orders'
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Snacks',
    image: '',
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
    try {
      const orderData = {
        products: cart.map(item => ({
          product_id: item._id,
          quantity: item.quantity,
          price_at_order: item.price
        })),
        total_amount: totalAmount
      };
      await api.post('/canteen/order', orderData);
      alert('Order placed successfully!');
      setCart([]);
      setActiveTab('orders');
    } catch (err) {
      alert(err.message || 'Failed to place order');
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
      const data = await api.post('/canteen/products', newProduct);
      setProducts(prev => [...prev, data]);
      setShowAddModal(false);
      setNewProduct({
        name: '',
        description: '',
        price: '',
        category: 'Snacks',
        image: '',
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
    <div style={{ display: 'flex', background: 'var(--color-bg)', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: '300px', padding: '40px', flex: 1 }}>
        <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: 'var(--color-accent)', fontWeight: 700 }}>ECanteen Shop</h1>
            <p style={{ color: 'var(--color-text-muted)', marginTop: '5px' }}>
              Order snacks, drinks and more from the hostel canteen
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {isAdmin && activeTab === 'shop' && (
              <button 
                onClick={() => setShowAddModal(true)}
                className="btn-primary" 
                style={{ padding: '8px 20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Plus size={18} /> Add Item
              </button>
            )}
            <div style={{ display: 'flex', gap: '10px', background: 'var(--color-surface)', padding: '5px', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
            <button 
              onClick={() => setActiveTab('shop')}
              style={{ 
                padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: activeTab === 'shop' ? 'var(--color-accent)' : 'transparent',
                color: activeTab === 'shop' ? 'white' : 'var(--color-text-muted)',
                fontWeight: 600, transition: 'all 0.3s'
              }}
            >
              Shop
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              style={{ 
                padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: activeTab === 'orders' ? 'var(--color-accent)' : 'transparent',
                color: activeTab === 'orders' ? 'white' : 'var(--color-text-muted)',
                fontWeight: 600, transition: 'all 0.3s'
              }}
            >
              Orders
            </button>
          </div>
          </div>
        </header>

        {activeTab === 'shop' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' }}>
            {/* Product Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
              {loading ? (
                <p>Loading products...</p>
              ) : products.map(product => (
                <motion.div 
                  key={product._id}
                  whileHover={{ y: -5 }}
                  className="minimal-card"
                  style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '12px' }}
                >
                  <div style={{ height: '140px', background: '#f4f4f4', borderRadius: '8px', overflow: 'hidden' }}>
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = 'https://via.placeholder.com/300x200?text=Product+Image';
                      }}
                    />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-accent)', fontWeight: 700 }}>{product.category}</span>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginTop: '2px' }}>{product.name}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', height: '36px', overflow: 'hidden' }}>{product.description}</p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-accent)' }}>₹{product.price}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {isAdmin && (
                        <button 
                          onClick={() => handleDeleteProduct(product._id)}
                          className="btn-secondary" 
                          style={{ padding: '6px', borderRadius: '6px', color: '#DC2626', borderColor: '#FCA5A5' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      <button 
                        onClick={() => addToCart(product)}
                        className="btn-primary" 
                        style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px' }}
                      >
                        <Plus size={16} /> Add
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Cart Sidebar */}
            <div className="minimal-card" style={{ padding: '25px', height: 'fit-content', position: 'sticky', top: '40px' }}>
              <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
                <ShoppingCart size={20} /> Your Cart
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '400px', overflowY: 'auto', marginBottom: '20px' }}>
                {cart.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '20px' }}>Cart is empty</p>
                ) : cart.map(item => (
                  <div key={item._id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.name}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>₹{item.price} x {item.quantity}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-bg)', padding: '4px', borderRadius: '6px' }}>
                      <button onClick={() => updateQuantity(item._id, -1)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><Minus size={14} /></button>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item._id, 1)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><Plus size={14} /></button>
                    </div>
                    <button onClick={() => removeFromCart(item._id)} style={{ border: 'none', background: 'none', color: '#DC2626', cursor: 'pointer' }}><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
              {cart.length > 0 && (
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <span style={{ fontWeight: 600 }}>Total Amount</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-accent)' }}>₹{totalAmount}</span>
                  </div>
                  <button onClick={placeOrder} className="btn-primary" style={{ width: '100%' }}>Checkout</button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Orders List */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {loading ? (
              <p>Loading orders...</p>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '100px', background: 'var(--color-surface)', borderRadius: '12px' }}>
                <Package size={48} color="var(--color-text-muted)" style={{ marginBottom: '15px' }} />
                <p style={{ color: 'var(--color-text-muted)' }}>No orders found yet.</p>
              </div>
            ) : orders.map(order => (
              <motion.div 
                key={order._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="minimal-card"
                style={{ padding: '25px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ background: 'var(--color-accent-light)', padding: '12px', borderRadius: '10px', color: 'var(--color-accent)' }}>
                      <ShoppingBag size={24} />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Order ID: {order._id.slice(-8).toUpperCase()}</p>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>₹{order.total_amount}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ 
                      padding: '6px 15px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                      background: getStatusColor(order.status) + '20', color: getStatusColor(order.status)
                    }}>
                      {order.status.toUpperCase()}
                    </span>
                    {isAdmin && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                        <User size={14} color="var(--color-text-muted)" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{order.user_id?.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  {order.products.map((item, idx) => (
                    <div key={idx} style={{ padding: '8px 15px', background: 'var(--color-bg)', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}>
                      {item.product_id?.name || 'Product'} <span style={{ color: 'var(--color-text-muted)', marginLeft: '5px' }}>x{item.quantity}</span>
                    </div>
                  ))}
                </div>

                {isAdmin && order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
                    {order.status === 'Pending' && (
                      <button onClick={() => handleUpdateStatus(order._id, 'Confirmed')} className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>Confirm</button>
                    )}
                    {order.status === 'Confirmed' && (
                      <button onClick={() => handleUpdateStatus(order._id, 'Out for Delivery')} className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem', background: '#8B5CF6' }}>Out for Delivery</button>
                    )}
                    {(order.status === 'Confirmed' || order.status === 'Out for Delivery') && (
                      <button onClick={() => handleUpdateStatus(order._id, 'Delivered')} className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem', background: '#059669' }}>Mark Delivered</button>
                    )}
                    <button onClick={() => handleUpdateStatus(order._id, 'Cancelled')} className="btn-secondary" style={{ padding: '8px 20px', fontSize: '0.85rem', color: '#DC2626', borderColor: '#FCA5A5' }}>Cancel</button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Add Product Modal */}
        <AnimatePresence>
          {showAddModal && (
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(17, 24, 39, 0.4)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="minimal-card" 
                style={{ width: '450px', padding: '30px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-accent)' }}>Add Canteen Item</h2>
                  <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><Plus size={24} style={{ transform: 'rotate(45deg)' }} /></button>
                </div>
                <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '5px' }}>Product Name</label>
                    <input 
                      type="text" 
                      className="input-outline" 
                      placeholder="e.g. Cold Coffee"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '5px' }}>Description</label>
                    <textarea 
                      className="input-outline" 
                      placeholder="Brief details about the item..."
                      style={{ height: '80px', resize: 'none' }}
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      required
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '5px' }}>Price (₹)</label>
                      <input 
                        type="number" 
                        className="input-outline" 
                        placeholder="0"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '5px' }}>Category</label>
                      <select 
                        className="input-outline"
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      >
                        <option value="Snacks">Snacks</option>
                        <option value="Drinks">Drinks</option>
                        <option value="Meals">Meals</option>
                        <option value="Essentials">Essentials</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '5px' }}>Image URL (Optional)</label>
                    <input 
                      type="text" 
                      className="input-outline" 
                      placeholder="https://images.unsplash.com/..."
                      value={newProduct.image}
                      onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                    <button type="submit" className="btn-primary" style={{ flex: 1 }}>Add to Canteen</button>
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
