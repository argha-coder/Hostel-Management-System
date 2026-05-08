import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, User, ChevronLeft, Sparkles, SendHorizontal } from 'lucide-react';
import { useSelector } from 'react-redux';
import { api } from '../utils/api';
import { cn } from '../utils/cn';

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [threads, setThreads] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [viewMode, setViewMode] = useState('recent'); // 'recent' or 'all'
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
    if (allStudents.length > 0) return;
    try {
      const data = await api.get('/auth/users?limit=100'); 
      setAllStudents(data.users.filter(u => u.role === 'Student'));
    } catch (err) {
      console.error('Fetch All Students Error:', err);
    }
  };

  useEffect(() => {
    let interval;
    if (selectedUser && isOpen) {
      fetchConversation(selectedUser._id);
      interval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          fetchConversation(selectedUser._id);
        }
      }, 8000);
    }
    return () => interval && clearInterval(interval);
  }, [selectedUser, isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchAdmins = async () => {
    try {
      const data = await api.get('/chat/admins');
      if (data.length > 0) setSelectedUser(data[0]);
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
    }
  };

  if (!userInfo) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[100] font-sans">
      {/* Chat Icon Bubble */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-full bg-indigo-600 text-white shadow-2xl shadow-indigo-200 flex items-center justify-center relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10">
           {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
        </div>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-[380px] h-[600px] bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 overflow-hidden flex flex-col border border-slate-100"
          >
            {/* Header */}
            <div className="p-6 bg-indigo-600 text-white flex items-center gap-4 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 opacity-90" />
               <div className="relative z-10 flex items-center gap-3 w-full">
                  {isAdmin && selectedUser && (
                    <button onClick={() => setSelectedUser(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                      <ChevronLeft size={20} />
                    </button>
                  )}
                  <div className="flex-1">
                    <h4 className="font-black text-lg tracking-tight">
                      {selectedUser ? selectedUser.name : 'UHostel Chat'}
                    </h4>
                    <div className="flex items-center gap-1.5 opacity-80">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                       <span className="text-[10px] font-black uppercase tracking-widest">
                         {selectedUser ? (isAdmin ? 'Resident' : 'Support Desk') : 'Select Thread'}
                       </span>
                    </div>
                  </div>
                  {!selectedUser && <Sparkles size={20} className="text-indigo-200" />}
               </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
              {isAdmin && !selectedUser ? (
                /* Thread List for Admin */
                <div className="flex flex-col flex-1 overflow-hidden">
                  <div className="flex bg-white border-b border-slate-100 p-2">
                    <button 
                      onClick={() => setViewMode('recent')}
                      className={cn(
                        "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                        viewMode === 'recent' ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      Recent
                    </button>
                    <button 
                      onClick={() => setViewMode('all')}
                      className={cn(
                        "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                        viewMode === 'all' ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      All Students
                    </button>
                  </div>
                  <div className="overflow-y-auto flex-1 p-4 space-y-2">
                    {(viewMode === 'recent' ? threads : allStudents).length === 0 ? (
                      <div className="py-20 text-center">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-200">
                           <MessageSquare size={32} />
                        </div>
                        <p className="text-sm font-bold text-slate-400">No conversations found.</p>
                      </div>
                    ) : (
                      (viewMode === 'recent' ? threads : allStudents).map(user => (
                        <button
                          key={user._id}
                          onClick={() => setSelectedUser(user)}
                          className="w-full p-4 bg-white rounded-2xl border border-slate-100 flex items-center gap-4 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50 transition-all text-left"
                        >
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                            {user.name?.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-slate-900 text-sm tracking-tight truncate">{user.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{user.email}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                /* Chat Messages */
                <>
                  <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar">
                    {messages.length === 0 && (
                      <div className="py-20 text-center">
                        <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-4 text-indigo-100">
                           <Sparkles size={40} />
                        </div>
                        <p className="text-sm font-bold text-slate-400">Start a new conversation with {selectedUser?.name}</p>
                      </div>
                    )}
                    {messages.map((msg) => {
                      const isMe = msg.sender._id === userInfo._id;
                      return (
                        <div
                          key={msg._id}
                          className={cn(
                            "max-w-[85%] p-4 rounded-3xl text-sm font-medium shadow-sm",
                            isMe 
                              ? "self-end bg-indigo-600 text-white rounded-tr-none shadow-indigo-100" 
                              : "self-start bg-white text-slate-700 rounded-tl-none border border-slate-100"
                          )}
                          style={{ alignSelf: isMe ? 'flex-end' : 'flex-start' }}
                        >
                          {msg.content}
                          <div className={cn(
                            "text-[10px] font-bold mt-2",
                            isMe ? "text-indigo-200" : "text-slate-300"
                          )}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Input Box */}
                  <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-slate-100 flex gap-3">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="flex-1 px-5 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!content.trim()}
                      className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                        content.trim() 
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 active:scale-90" 
                          : "bg-slate-100 text-slate-300 cursor-not-allowed"
                      )}
                    >
                      <SendHorizontal size={20} />
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
