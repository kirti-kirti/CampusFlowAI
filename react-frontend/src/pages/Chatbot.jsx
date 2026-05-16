import React, { useState, useEffect, useRef, useContext } from 'react';
import chatbotService from '../services/chatbotService';
import { AuthContext } from '../context/AuthContext';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles, 
  Command, 
  Trash2, 
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Cpu,
  BrainCircuit,
  Zap,
  MoreVertical,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const Chatbot = () => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hi ${user?.name || 'there'}! I'm your school assistant. How can I help you today?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatbotService.chat(input);
      setMessages(prev => [...prev, { role: 'assistant', content: response.response || response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble understanding right now. Could you please try again in a moment?" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-5xl mx-auto h-[calc(100vh-6rem)] flex flex-col pt-8">
      <header className="mb-8 flex items-center justify-between shrink-0 px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] tracking-widest uppercase px-4 py-1.5 rounded-full">
              Smart Assistant
            </Badge>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-full border border-emerald-100 dark:border-emerald-800">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Online</span>
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-none mt-2">CampusBot<span className="text-primary">.ai</span></h1>
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          className="w-14 h-14 rounded-xl border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-500 transition-all active:scale-95 group" 
          onClick={() => setMessages([messages[0]])}
        >
          <Trash2 size={24} className="text-slate-400 group-hover:text-rose-500 transition-colors" />
        </Button>
      </header>

      <Card className="flex-1 border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl rounded-xl overflow-hidden flex flex-col relative group border border-white/20 dark:border-slate-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32" />
        
        {/* Chat Stream */}
        <CardContent 
          className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10 no-scrollbar scroll-smooth"
          ref={scrollRef}
        >
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex items-start gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-12 h-12 rounded-[1.2rem] shrink-0 flex items-center justify-center shadow-xl transition-all duration-500
                ${msg.role === 'user' 
                  ? 'bg-slate-900 dark:bg-slate-700 text-white' 
                  : 'bg-primary text-white shadow-primary/30 group-hover:scale-110'}`}
              >
                {msg.role === 'user' ? <User size={24} /> : <Bot size={24} />}
              </div>
              <div className={`max-w-[80%] space-y-3 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-8 py-5 rounded-xl text-base font-medium leading-relaxed shadow-sm transition-all
                  ${msg.role === 'user' 
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tr-none border border-slate-200 dark:border-slate-700' 
                    : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-tl-none border border-indigo-50 dark:border-indigo-900/20 shadow-indigo-100/50 dark:shadow-none'}`}
                >
                  {msg.content}
                </div>
                <div className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'user' ? 'You' : 'AI Assistant'}
                  <div className={`w-1.5 h-1.5 rounded-full ${msg.role === 'user' ? 'bg-slate-300 dark:bg-slate-600' : 'bg-primary/50'}`} />
                  {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-6 animate-pulse">
              <div className="w-12 h-12 rounded-[1.2rem] bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <Loader2 size={24} className="animate-spin" />
              </div>
              <div className="space-y-3">
                <div className="px-10 py-6 rounded-xl rounded-tl-none bg-slate-100 dark:bg-slate-800 w-32 h-14" />
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                   Thinking...
                </div>
              </div>
            </div>
          )}
        </CardContent>

        {/* Input Terminal */}
        <CardFooter className="p-8 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 backdrop-blur-xl">
          <form onSubmit={handleSend} className="w-full flex gap-5 items-center">
            <div className="relative flex-1 group">
              <Command className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={22} />
              <Input 
                placeholder="Ask me anything..." 
                className="h-16 pl-16 pr-8 bg-white dark:bg-slate-950 border-none shadow-xl shadow-slate-200/50 dark:shadow-none rounded-xl text-lg font-bold focus-visible:ring-primary/20 transition-all dark:text-white placeholder:text-slate-400"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading || !input.trim()}
              className="h-16 w-16 !rounded-xl btn-premium p-0 shrink-0"
            >
              {loading ? <Loader2 size={28} className="animate-spin" /> : <Zap size={28} className="fill-current" />}
            </Button>
          </form>
        </CardFooter>
      </Card>

      <footer className="mt-8 flex flex-col md:flex-row items-center justify-center gap-8 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-5 py-2 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm">
          <ShieldCheck size={16} className="text-emerald-500" /> Secure Chat
        </div>
        <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-5 py-2 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm">
          <Sparkles size={16} className="text-amber-500" /> Powered by AI
        </div>
      </footer>
    </div>
  );
};

export default Chatbot;

