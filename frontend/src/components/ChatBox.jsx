import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, User, ChevronLeft } from 'lucide-react';
import { useSelector } from 'react-redux';
import { api } from '../utils/api';

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [threads, setThreads] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [viewMode, setViewMode] = useState('recent'); // 'recent' or 'all'
  const [loading, setLoading] = useState(false);
  const { userInfo } = useSelector(state => state.auth);
  const isAdmin = userInfo?.role === 'Admin';
  const scrollRef = useRef();

  useEffect(() => {
    if (isOpen) {
      if (isAdmin) {
        fetchThreads();
        fetchAllStudents();
      } else {
        fetchAdmins();
      }
    }
  }, [isOpen]);

  const fetchAllStudents = async () => {
    try {
      const data = await api.get('/auth/users');
      setAllStudents(data.filter(u => u.role === 'Student'));
    } catch (err) {
      console.error('Fetch All Students Error:', err);
    }
  };

  useEffect(() => {
    if (selectedUser) {
      fetchConversation(selectedUser._id);
      const interval = setInterval(() => {
        fetchConversation(selectedUser._id);
      }, 5000); // Poll every 5 seconds for new messages
      return () => clearInterval(interval);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchAdmins = async () => {
    try {
      const data = await api.get('/chat/admins');
      if (data.length > 0) {
        setSelectedUser(data[0]); // Default to first warden for students
      }
    } catch (err) {
      console.error('Fetch Admins Error:', err);
    }
  };

  const fetchThreads = async () => {
    try {
      const data = await api.get('/chat/threads');
      setThreads(data);
    } catch (err) {
      console.error('Fetch Threads Error:', err);
    }
  };

  const fetchConversation = async (userId) => {
    try {
      const data = await api.get(`/chat/conversation/${userId}`);
      setMessages(data);
    } catch (err) {
      console.error('Fetch Conversation Error:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!content.trim() || !selectedUser) return;

    try {
      const data = await api.post('/chat/send', {
        receiverId: selectedUser._id,
        content: content.trim()
      });
      setMessages([...messages, data]);
      setContent('');
    } catch (err) {
      console.error('Send Message Error:', err);
      alert(err.message || 'Failed to send message');
    }
  };

  if (!userInfo) return null;

  return (
    <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000 }}>
      {/* Chat Icon Bubble */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-accent)',
          border: 'none',
          color: 'white',
          boxShadow: '0 10px 25px rgba(79, 70, 229, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem'
        }}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            style={{
              position: 'absolute',
              bottom: '80px',
              right: '0',
              width: '350px',
              height: '500px',
              backgroundColor: 'white',
              borderRadius: '15px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              border: '1px solid var(--color-border)'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '15px 20px',
              backgroundColor: 'var(--color-accent)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {isAdmin && selectedUser && (
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setViewMode('recent');
                  }}
                  style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '5px' }}
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                  {selectedUser ? selectedUser.name : 'Select Student'}
                </h4>
                <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8 }}>
                  {selectedUser ? (isAdmin ? 'Student' : 'Warden') : 'Recent Chats'}
                </p>
              </div>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f9f9f9', overflow: 'hidden' }}>
              {isAdmin && !selectedUser ? (
                /* Thread List for Admin */
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', backgroundColor: 'white' }}>
                    <button 
                      onClick={() => setViewMode('recent')}
                      style={{ 
                        flex: 1, padding: '10px', border: 'none', background: 'none', cursor: 'pointer',
                        fontWeight: 600, fontSize: '0.85rem', color: viewMode === 'recent' ? 'var(--color-accent)' : 'var(--color-text-muted)',
                        borderBottom: viewMode === 'recent' ? '2px solid var(--color-accent)' : 'none'
                      }}
                    >
                      Recent
                    </button>
                    <button 
                      onClick={() => setViewMode('all')}
                      style={{ 
                        flex: 1, padding: '10px', border: 'none', background: 'none', cursor: 'pointer',
                        fontWeight: 600, fontSize: '0.85rem', color: viewMode === 'all' ? 'var(--color-accent)' : 'var(--color-text-muted)',
                        borderBottom: viewMode === 'all' ? '2px solid var(--color-accent)' : 'none'
                      }}
                    >
                      All Students
                    </button>
                  </div>
                  <div style={{ overflowY: 'auto', flex: 1 }}>
                    {(viewMode === 'recent' ? threads : allStudents).length === 0 ? (
                      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                        {viewMode === 'recent' ? 'No recent chats.' : 'No students found.'}
                      </div>
                    ) : (
                      (viewMode === 'recent' ? threads : allStudents).map(user => (
                        <div
                          key={user._id}
                          onClick={() => setSelectedUser(user)}
                          style={{
                            padding: '12px 20px',
                            borderBottom: '1px solid var(--color-border)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            backgroundColor: 'white'
                          }}
                        >
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-accent-light)',
                            color: 'var(--color-accent)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <User size={18} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                /* Chat Messages */
                <>
                  <div
                    ref={scrollRef}
                    style={{
                      flex: 1,
                      padding: '20px',
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    {messages.length === 0 && (
                      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                        No messages in this conversation.
                      </div>
                    )}
                    {messages.map((msg, i) => {
                      const isMe = msg.sender._id === userInfo._id;
                      return (
                        <div
                          key={msg._id}
                          style={{
                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                            maxWidth: '80%',
                            padding: '10px 15px',
                            borderRadius: isMe ? '15px 15px 0 15px' : '15px 15px 15px 0',
                            backgroundColor: isMe ? 'var(--color-accent)' : 'white',
                            color: isMe ? 'white' : 'var(--color-text)',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                            fontSize: '0.9rem'
                          }}
                        >
                          {msg.content}
                          <div style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: '5px', textAlign: 'right' }}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Input Box */}
                  <form
                    onSubmit={handleSendMessage}
                    style={{
                      padding: '15px',
                      backgroundColor: 'white',
                      borderTop: '1px solid var(--color-border)',
                      display: 'flex',
                      gap: '10px'
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '10px 15px',
                        borderRadius: '25px',
                        border: '1px solid var(--color-border)',
                        outline: 'none',
                        fontSize: '0.9rem'
                      }}
                    />
                    <button
                      type="submit"
                      disabled={!content.trim()}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: content.trim() ? 'var(--color-accent)' : '#ccc',
                        border: 'none',
                        color: 'white',
                        cursor: content.trim() ? 'pointer' : 'default',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Send size={18} />
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatBox;
