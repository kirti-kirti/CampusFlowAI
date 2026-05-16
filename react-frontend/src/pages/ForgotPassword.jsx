import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ShieldCheck, ChevronRight, Loader2, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import api from '../services/api';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [demoToken, setDemoToken] = useState('');
  const [responseMsg, setResponseMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide your registered email');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setResponseMsg(res.data?.message || '');
      const match = res.data?.message?.match(/DEMO TOKEN: ([a-f0-9-]{36})/);
      if (match) setDemoToken(match[1]);
      setSubmitted(true);
      toast.success('Recovery protocol initiated');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please check your identity.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] p-6 relative overflow-hidden">
        <Card className="w-full max-w-md border-none shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] relative z-10 bg-white/95 backdrop-blur-xl rounded-xl overflow-hidden text-center">
          <div className="h-2 bg-emerald-500" />
          <CardHeader className="pt-12 pb-6">
            <div className="w-20 h-20 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <CheckCircle2 className="text-emerald-500" size={40} />
            </div>
            <CardTitle className="text-2xl font-black text-slate-900">Recovery Sent</CardTitle>
            <CardDescription className="px-6 mt-2">
              {responseMsg || `We've dispatched a secure recovery token to ${email}. Please verify your inbox to continue.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-12 px-10">
            {demoToken && (
              <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Recovery Token</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs font-mono text-slate-700 bg-white border border-slate-100 rounded-xl px-3 py-2 truncate">{demoToken}</code>
                  <button
                    onClick={() => { navigator.clipboard.writeText(demoToken); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                    className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors whitespace-nowrap"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            )}
            <Button 
              onClick={() => navigate('/reset-password')}
              className="w-full h-14 text-sm font-black uppercase tracking-widest bg-slate-900 hover:bg-slate-800 transition-all rounded-xl mb-4"
            >
              Reset Identity
            </Button>
            <button 
              onClick={() => setSubmitted(false)}
              className="text-xs font-bold text-slate-400 hover:text-primary transition-colors"
            >
              Didn't receive email? Try again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -mr-40 -mt-40" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] -ml-40 -mb-40" />
      </div>

      <Card className="w-full max-w-md border-none shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] relative z-10 bg-white/95 backdrop-blur-xl rounded-xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary to-indigo-400" />
        <CardHeader className="pt-10 pb-6 px-10">
          <Link to="/login" className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest mb-6">
            <ArrowLeft size={14} /> Back to Entry
          </Link>
          <CardTitle className="text-3xl font-black tracking-tight text-slate-900 mb-1">Identity Recovery</CardTitle>
          <CardDescription className="text-slate-500 font-medium">Enter your email to receive a secure recovery token.</CardDescription>
        </CardHeader>
        
        <CardContent className="px-10 pb-10">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-bold p-4 rounded-xl mb-6 flex items-center gap-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Corporate Email</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                <Input 
                  type="email" 
                  placeholder="name@organization.com" 
                  className="pl-12 h-14 bg-slate-50/50 border-slate-100 rounded-xl text-base focus-visible:ring-primary/20 transition-all font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-14 text-base font-black transition-all shadow-xl shadow-primary/20 rounded-xl group active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Initiating...
                </>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Send Recovery Token <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;

