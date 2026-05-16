import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, Mail, Building, Loader2, ChevronLeft, Fingerprint, Sparkles } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login({ email, password });
    if (result.success) {
      if (result.role !== 'ADMIN') {
        setError('Access denied. This portal is for administrators only.');
        setLoading(false);
        return;
      }
      navigate('/dashboard');
    } else {
      setError(result.error || 'Login failed. Please check your admin credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 relative overflow-hidden transition-all duration-700">
      {/* High-Security Grid & Ambient Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.05]" />
        <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-rose-500/10 rounded-full blur-[120px] animate-pulse-soft" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[70%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse-soft" />
      </div>

      <button 
        onClick={() => navigate('/login')}
        className="absolute top-10 left-10 flex items-center gap-2 text-slate-500 hover:text-white transition-all group z-20 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md"
      >
        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold text-xs uppercase tracking-widest">Back to Login</span>
      </button>

      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-1000">
        <div className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 bg-rose-500/10 rounded-xl flex items-center justify-center border border-rose-500/20 shadow-[0_0_80px_rgba(244,63,94,0.15)] mb-6 rotate-3 hover:rotate-0 transition-transform duration-500">
            <ShieldAlert className="text-rose-500" size={48} />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">Admin Login</h1>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-rose-500/10 rounded-full border border-rose-500/20">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400">Secure Management Portal</span>
          </div>
        </div>

        <Card className="border-white/10 shadow-[0_40px_100px_-15px_rgba(0,0,0,0.6)] bg-slate-900/40 backdrop-blur-3xl rounded-xl overflow-hidden border">
          <CardHeader className="pt-12 pb-8 px-10 border-b border-white/5">
            <CardTitle className="text-2xl font-black text-white tracking-tight">Authentication</CardTitle>
            <CardDescription className="text-slate-400 font-medium mt-1">Please enter your admin credentials to continue.</CardDescription>
          </CardHeader>
          
          <CardContent className="px-10 py-10">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold p-4 rounded-xl mb-8 flex items-center gap-3 animate-shake">
                <ShieldAlert size={20} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Admin School ID</Label>
                <div className="relative group">
                  <Building className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-rose-500 transition-colors" size={20} />
                  <Input 
                    type="text" 
                    placeholder="ENTER SCHOOL ID" 
                    className="pl-14 h-16 bg-white/5 border-transparent text-white rounded-xl text-lg focus-visible:ring-rose-500/20 transition-all font-mono tracking-widest uppercase"
                    value={tenantId}
                    onChange={(e) => setTenantId(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-rose-500 transition-colors" size={20} />
                  <Input 
                    type="email" 
                    placeholder="admin@school.com" 
                    className="pl-14 h-16 bg-white/5 border-transparent text-white rounded-xl text-lg focus-visible:ring-rose-500/20 transition-all font-semibold"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-rose-500 transition-colors" size={20} />
                  <Input 
                    type="password" 
                    placeholder="••••••••••••" 
                    className="pl-14 h-16 bg-white/5 border-transparent text-white rounded-xl text-lg focus-visible:ring-rose-500/20 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-16 bg-rose-600 hover:bg-rose-500 text-white border-none shadow-[0_20px_50px_-10px_rgba(225,29,72,0.4)] rounded-xl text-lg font-black transition-all active:scale-[0.97] mt-6"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="animate-spin h-7 w-7" />
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    <Fingerprint size={24} /> Sign In as Admin
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="mt-16 flex items-center gap-8 text-slate-700 text-[10px] font-black uppercase tracking-[0.4em] relative z-10">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-slate-800" />
          <span>Encrypted Session</span>
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
        <span>Hardware Secured</span>
      </div>
    </div>
  );
};

export default AdminLogin;

