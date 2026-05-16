import React, { useState, useEffect, useRef, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import adminService from '../services/adminService';
import { toast } from 'react-toastify';
import {
  Send, MessageSquare, User, Search, ArrowLeft,
  CheckCheck, Clock, Users, Loader2, AlertCircle,
  Sparkles,
  Zap,
  MoreVertical,
  Phone,
  Video,
  Smile,
  Paperclip,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";

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

  useEffect(() => {
    if (!selected) return;
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 5000);
    return () => clearInterval(pollRef.current);
  }, [selected]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const fetchMessages = async () => {
    if (!selected) return;
    try {
      const data = await messagingApi.getConversation(selected.id);
      setMessages(data);
    } catch { }
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
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'TEACHER': return 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400';
      case 'STUDENT': return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400';
      case 'ADMIN':   return 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400';
      default:        return 'bg-slate-50 dark:bg-slate-800 text-slate-500';
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 main-container max-w-6xl mx-auto h-[calc(100vh-1rem)] flex flex-col overflow-hidden">
      <header className="mb-6 md:mb-8 flex items-end justify-between shrink-0 px-1 md:px-2">
        <div className="space-y-1 md:space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-[8px] md:text-[10px] font-black uppercase tracking-widest rounded-full">
            <Sparkles size={10} className="md:size-3" /> School Chat
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-none uppercase">Conversations</h1>
        </div>
        <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Connection</span>
        </div>
      </header>

      <div className="flex flex-1 gap-8 min-h-0 relative">
        {/* Contacts Panel */}
        <div className={cn(
          "flex flex-col premium-card border-none p-0 overflow-hidden transition-all duration-500",
          selected ? "hidden lg:flex w-96 shrink-0" : "flex-1 lg:w-96 lg:flex-none lg:shrink-0 shadow-2xl shadow-slate-200/50 dark:shadow-none"
        )}>
          <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div className="relative group">
              <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors size-4 md:size-[18px]" />
              <Input
                placeholder="Find a teacher or student..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-11 md:pl-14 h-12 md:h-14 bg-slate-100/50 dark:bg-slate-800/50 border-none rounded-xl text-xs md:text-sm font-bold dark:text-white placeholder:text-slate-400 focus-visible:ring-primary/20"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar py-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading contacts...</p>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="py-24 text-center px-8 space-y-4">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto shadow-inner">
                  <Users size={32} className="text-slate-300" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nobody found with that name.</p>
              </div>
            ) : (
              filteredContacts.map(contact => (
                <button
                  key={contact.id}
                  onClick={() => setSelected(contact)}
                  className={cn(
                    "w-full flex items-center gap-5 p-6 text-left transition-all relative group/contact",
                    selected?.id === contact.id ? "bg-slate-50 dark:bg-slate-800/50" : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
                  )}
                >
                  {selected?.id === contact.id && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-r-full" />}
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-slate-100 to-white dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300 font-black text-xl shrink-0 shadow-sm border border-slate-200/50 dark:border-slate-700">
                    {contact.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-900 dark:text-white text-base truncate">{contact.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                       <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md", getRoleBadgeColor(contact.role))}>
                        {contact.role}
                      </span>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover/contact:opacity-100 transition-opacity">
                    <ChevronRight size={18} className="text-slate-300" />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Panel */}
        <div className={cn(
          "flex-1 flex flex-col premium-card border-none p-0 overflow-hidden min-w-0 shadow-2xl shadow-slate-200/50 dark:shadow-none transition-all duration-500",
          !selected ? "hidden lg:flex" : "flex"
        )}>
          {selected ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 md:gap-5 p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                <button onClick={() => setSelected(null)} className="lg:hidden w-10 h-10 md:w-12 md:h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 active:scale-95">
                  <ArrowLeft size={18} className="md:size-5" />
                </button>
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg md:text-xl shrink-0 shadow-inner">
                  {selected.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-slate-900 dark:text-white text-base md:text-xl tracking-tight truncate uppercase leading-none mb-1">{selected.name}</h3>
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className={cn("text-[7px] md:text-[9px] font-black uppercase tracking-widest px-1.5 md:px-2 py-0.5 rounded-md", getRoleBadgeColor(selected.role))}>
                      {selected.role}
                    </span>
                    <div className="flex items-center gap-1">
                      <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[7px] md:text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Online</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                   <button className="hidden sm:flex w-11 h-11 bg-slate-50 dark:bg-slate-800 rounded-xl items-center justify-center text-slate-400 hover:text-primary transition-all active:scale-95">
                    <Phone size={18} />
                  </button>
                  <button className="w-9 h-9 md:w-11 md:h-11 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary transition-all active:scale-95">
                    <MoreVertical size={16} className="md:size-[18px]" />
                  </button>
                </div>
              </div>

              {/* Messages Container */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar bg-slate-50/30 dark:bg-slate-900/10">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                    <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-xl">
                      <Zap size={48} className="text-primary animate-pulse" fill="currentColor" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Start the chat!</h3>
                      <p className="text-slate-400 font-medium text-base">Type a message below to start your conversation with {selected.name}.</p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <div key={msg.id || idx} className={cn("flex items-end gap-4", isMe ? "flex-row-reverse" : "")}>
                        {!isMe && (
                          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs font-black shrink-0 border border-slate-200 dark:border-slate-700">
                            {msg.senderName?.charAt(0)}
                          </div>
                        )}
                        <div className={cn("max-w-[75%] space-y-1.5", isMe ? "items-end" : "items-start")}>
                          <div className={cn(
                            "px-6 py-4 rounded-xl text-sm font-bold leading-relaxed shadow-sm",
                            isMe
                              ? "bg-primary text-white rounded-br-none shadow-primary/20"
                              : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-bl-none"
                          )}>
                            {msg.message}
                          </div>
                          <div className={cn(
                            "flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest",
                            isMe ? "justify-end" : ""
                          )}>
                            <Clock size={12} className="text-primary" />
                            {formatTime(msg.timestamp)}
                            {isMe && <CheckCheck size={14} className={msg.isRead ? 'text-primary' : 'text-slate-400'} />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input Area */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
                <form onSubmit={handleSend} className="flex gap-4 items-center">
                  <button type="button" className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary transition-all shrink-0">
                    <Paperclip size={20} />
                  </button>
                  <div className="flex-1 relative group">
                    <Input
                      placeholder={`Message ${selected.name}...`}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      className="h-16 pl-6 pr-14 bg-slate-100/50 dark:bg-slate-800/50 border-none rounded-xl text-base font-bold dark:text-white placeholder:text-slate-400 focus-visible:ring-primary/20"
                    />
                    <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors">
                      <Smile size={24} />
                    </button>
                  </div>
                  <Button
                    type="submit"
                    disabled={sending || !input.trim()}
                    className="h-16 w-16 !rounded-xl btn-premium p-0 shrink-0 shadow-2xl"
                  >
                    {sending ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} className="ml-1" />}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-8 bg-slate-50/30 dark:bg-slate-950/10">
              <div className="w-32 h-32 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center mx-auto shadow-2xl shadow-slate-200 dark:shadow-none border border-slate-100 dark:border-slate-800">
                <MessageSquare size={56} className="text-primary/20" />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Start a Conversation</h3>
                <p className="text-slate-400 font-medium text-lg max-w-sm mx-auto">Select a teacher or student from the left to start chatting with them.</p>
              </div>
              <Button onClick={() => {}} className="bg-slate-900 dark:bg-white dark:text-slate-950 text-white font-black text-xs uppercase tracking-[0.2em] px-10 h-14 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all">
                New Message
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messaging;

