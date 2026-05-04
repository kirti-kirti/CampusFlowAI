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
  MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const Chatbot = () => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Identity verified. Systems operational. Hello ${user?.name || 'Authorized User'}, how can I assist with your campus operations today?` }
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
      setMessages(prev => [...prev, { role: 'assistant', content: "Core logic error: Unable to synthesize response. Please re-verify query parameters." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 pb-20 animate-in fade-in duration-1000 max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
      <header className="mb-6 pt-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-indigo-500/10 text-indigo-600 border-none font-black text-[10px] tracking-[0.2em] uppercase px-3 py-1">
              Neural Engine v3.2
            </Badge>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600">Active</span>
            </div>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-none">CampusBot<span className="text-primary">.ai</span></h1>
        </div>
        <Button variant="outline" size="icon" className="rounded-2xl border-slate-200 shadow-sm" onClick={() => setMessages([messages[0]])}>
          <Trash2 size={20} className="text-slate-400" />
        </Button>
      </header>

      <Card className="flex-1 border-none shadow-[0_30px_90px_rgba(79,70,229,0.1)] bg-white rounded-[2.5rem] overflow-hidden flex flex-col relative group">
        {/* Chat Stream */}
        <CardContent 
          className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar scroll-smooth"
          ref={scrollRef}
        >
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex items-start gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center shadow-lg
                ${msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-primary text-white shadow-primary/20'}`}
              >
                {msg.role === 'user' ? <User size={20} /> : <BrainCircuit size={20} />}
              </div>
              <div className={`max-w-[80%] space-y-2`}>
                <div className={`px-6 py-4 rounded-[1.5rem] text-sm font-medium leading-relaxed shadow-sm
                  ${msg.role === 'user' 
                    ? 'bg-slate-50 text-slate-800 rounded-tr-none border border-slate-100' 
                    : 'bg-white text-slate-900 rounded-tl-none border border-indigo-50 shadow-indigo-100/50'}`}
                >
                  {msg.content}
                </div>
                <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-300 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'user' ? 'Identity Verified' : 'Neural Synthesis'}
                  <div className={`w-1 h-1 rounded-full ${msg.role === 'user' ? 'bg-slate-200' : 'bg-primary/30'}`} />
                  {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-4 animate-pulse">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Cpu size={20} className="animate-spin" />
              </div>
              <div className="space-y-2">
                <div className="px-6 py-4 rounded-[1.5rem] rounded-tl-none bg-slate-50 w-24 h-12" />
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-300">Synthesizing...</div>
              </div>
            </div>
          )}
        </CardContent>

        {/* Input Terminal */}
        <CardFooter className="p-6 bg-slate-50/50 border-t border-slate-100">
          <form onSubmit={handleSend} className="w-full flex gap-3 items-center">
            <div className="relative flex-1 group">
              <Command className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
              <Input 
                placeholder="Initialize neural query..." 
                className="h-14 pl-14 pr-6 bg-white border-none shadow-sm rounded-2xl text-base focus-visible:ring-primary/20 transition-all font-medium placeholder:text-slate-300"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading || !input.trim()}
              className="h-14 w-14 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center p-0"
            >
              <Zap size={24} className={loading ? 'animate-pulse' : ''} />
            </Button>
          </form>
        </CardFooter>

        {/* Decorative background for Chatbot card */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      </Card>

      <div className="mt-6 flex items-center justify-center gap-6 text-slate-300 text-[10px] font-black uppercase tracking-[0.3em]">
        <div className="flex items-center gap-2"><ShieldCheck size={14} /> End-to-End Encrypted</div>
        <div className="w-1 h-1 rounded-full bg-slate-200" />
        <div className="flex items-center gap-2"><Sparkles size={14} /> GPT-4 Integration</div>
      </div>
    </div>
  );
};

export default Chatbot;
