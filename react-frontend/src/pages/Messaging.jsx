import React, { useState, useEffect, useRef, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import adminService from '../services/adminService';
import { toast } from 'react-toastify';
import {
  Send, MessageSquare, User, Search, ArrowLeft,
  CheckCheck, Clock, Users, Loader2, AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const messagingApi = {
  send: async (receiverId, message) => {
    const res = await api.post('/messages/send', { receiverId, message });
    return res.data;
  },
  getConversation: async (userId) => {
    const res = await api.get(`/messages/chat/${userId}`);
    return res.data;
  }
};

const Messaging = () => {
  const { user } = useContext(AuthContext);
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const scrollRef = useRef(null);
  const pollRef = useRef(null);

  // Load contacts based on role
  useEffect(() => {
    const loadContacts = async () => {
      setLoading(true);
      try {
        let data = [];
        if (user?.role === 'ADMIN' || user?.role === 'TEACHER') {
          const [students, teachers] = await Promise.all([
            adminService.getStudents(),
            adminService.getTeachers()
          ]);
          data = [...teachers, ...students].filter(u => u.id !== user?.id);
        } else {
          // STUDENT / PARENT can only message teachers
          data = await adminService.getTeachers();
        }
        setContacts(data);
      } catch {
        toast.error('Failed to load contacts');
      } finally {
        setLoading(false);
      }
    };
    loadContacts();
  }, [user]);

  // Load conversation when contact selected
  useEffect(() => {
    if (!selected) return;
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 5000);
    return () => clearInterval(pollRef.current);
  }, [selected]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const fetchMessages = async () => {
    if (!selected) return;
    try {
      const data = await messagingApi.getConversation(selected.id);
      setMessages(data);
    } catch {
      // silent
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selected) return;
    setSending(true);
    try {
      const msg = await messagingApi.send(selected.id, input.trim());
      setMessages(prev => [...prev, msg]);
      setInput('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'TEACHER': return 'bg-indigo-50 text-indigo-600';
      case 'STUDENT': return 'bg-emerald-50 text-emerald-600';
      case 'ADMIN':   return 'bg-rose-50 text-rose-600';
      default:        return 'bg-slate-50 text-slate-500';
    }
  };

  const filteredContacts = contacts.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const formatTime = (ts) => {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="animate-in fade-in duration-700 pb-4 px-4 max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <header className="mb-6 pt-4 flex items-end justify-between shrink-0">
        <div>
          <Badge variant="outline" className="mb-3 px-3 py-1 border-indigo-100 bg-indigo-50/30 text-indigo-600 font-bold tracking-widest text-[10px] uppercase">
            Direct Messaging
          </Badge>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-none">Messages</h1>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live</span>
        </div>
      </header>

      <div className="flex flex-1 gap-6 min-h-0">
        {/* Contacts Panel */}
        <div className={`flex flex-col bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden ${selected ? 'hidden md:flex w-80 shrink-0' : 'flex-1 md:w-80 md:flex-none md:shrink-0'}`}>
          <div className="p-5 border-b border-slate-50 shrink-0">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <Input
                placeholder="Search contacts..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 h-11 bg-slate-50 border-none rounded-2xl text-sm font-bold"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-slate-300" size={32} />
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="py-16 text-center px-6">
                <Users size={32} className="mx-auto text-slate-200 mb-3" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No contacts found</p>
              </div>
            ) : (
              filteredContacts.map(contact => (
                <button
                  key={contact.id}
                  onClick={() => setSelected(contact)}
                  className={`w-full flex items-center gap-4 p-5 text-left transition-all hover:bg-slate-50 border-b border-slate-50 last:border-0 ${selected?.id === contact.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-lg shrink-0">
                    {contact.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-900 text-sm truncate">{contact.name}</p>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${getRoleBadgeColor(contact.role)}`}>
                      {contact.role}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Panel */}
        {selected ? (
          <div className="flex-1 flex flex-col bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-w-0">
            {/* Chat Header */}
            <div className="flex items-center gap-4 p-6 border-b border-slate-50 shrink-0">
              <button onClick={() => setSelected(null)} className="md:hidden w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                <ArrowLeft size={18} />
              </button>
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-lg shrink-0">
                {selected.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-slate-900 uppercase tracking-tight truncate">{selected.name}</h3>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${getRoleBadgeColor(selected.role)}`}>
                  {selected.role}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Active</span>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageSquare size={48} className="text-slate-200 mb-4" />
                  <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No messages yet</p>
                  <p className="text-slate-300 text-xs mt-1">Send a message to start the conversation</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <div key={msg.id || idx} className={`flex items-end gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                      {!isMe && (
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-black shrink-0">
                          {msg.senderName?.charAt(0)}
                        </div>
                      )}
                      <div className={`max-w-[70%] space-y-1`}>
                        <div className={`px-5 py-3 rounded-[1.5rem] text-sm font-medium leading-relaxed ${
                          isMe
                            ? 'bg-primary text-white rounded-br-md'
                            : 'bg-slate-50 text-slate-900 border border-slate-100 rounded-bl-md'
                        }`}>
                          {msg.message}
                        </div>
                        <div className={`flex items-center gap-1.5 text-[9px] font-black text-slate-300 uppercase tracking-widest ${isMe ? 'justify-end' : ''}`}>
                          <Clock size={10} />
                          {formatTime(msg.timestamp)}
                          {isMe && <CheckCheck size={12} className={msg.isRead ? 'text-primary' : 'text-slate-300'} />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-5 border-t border-slate-50 flex gap-3 shrink-0">
              <Input
                placeholder={`Message ${selected.name}...`}
                value={input}
                onChange={e => setInput(e.target.value)}
                className="flex-1 h-14 bg-slate-50 border-none rounded-2xl text-sm font-medium"
              />
              <Button
                type="submit"
                disabled={sending || !input.trim()}
                className="h-14 w-14 rounded-2xl bg-primary shadow-xl shadow-primary/20 p-0 shrink-0"
              >
                {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              </Button>
            </form>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <MessageSquare size={40} className="text-slate-200" />
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Select a Contact</h3>
              <p className="text-slate-400 text-sm font-medium">Choose someone from the left to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messaging;
