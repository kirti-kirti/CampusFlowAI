import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Building, Loader2, ShieldCheck, ChevronRight, Sparkles } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || !tenantId) {
      setError('Please enter all your login details');
      return;
    }
    setLoading(true);
    setError('');
    const result = await login({ email, password });
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 relative overflow-hidden transition-colors duration-500">
      {/* Stunning Animated Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px] animate-pulse-soft" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse-soft" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
      </div>

      <header className="relative z-10 mb-10 text-center animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center shadow-2xl shadow-primary/40 rotate-3 transform hover:rotate-0 transition-all duration-500">
            <ShieldCheck className="text-white" size={32} />
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">CampusFlow<span className="text-primary font-black">AI</span></h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Next Gen Education</p>
          </div>
        </div>
      </header>

      <Card className="w-full max-w-md border-none shadow-[0_30px_60px_-12px_rgba(0,0,0,0.12)] relative z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl rounded-xl overflow-hidden border border-white/20 dark:border-slate-800">
        <div className="h-2 bg-gradient-to-r from-primary via-indigo-500 to-primary animate-gradient-x" />
        <CardHeader className="pt-12 pb-8 px-10">
          <CardTitle className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Welcome Back!</CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400 font-medium text-base">Please enter your details to access your account.</CardDescription>
        </CardHeader>
        
        <CardContent className="px-10 pb-12">
          {error && (
            <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-bold p-4 rounded-xl mb-8 flex items-center gap-3 animate-shake">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">School ID</Label>
              <div className="relative group">
                <Building className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                <Input 
                  type="text" 
                  placeholder="Enter School ID (e.g. CF-01)" 
                  className="pl-14 h-16 bg-slate-100/50 dark:bg-slate-800/50 border-transparent rounded-xl text-lg focus-visible:ring-primary/20 transition-all font-semibold dark:text-white"
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                <Input 
                  type="email" 
                  placeholder="name@email.com" 
                  className="pl-14 h-16 bg-slate-100/50 dark:bg-slate-800/50 border-transparent rounded-xl text-lg focus-visible:ring-primary/20 transition-all font-semibold dark:text-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Password</Label>
                <Link to="/forgot-password" size="sm" className="text-[11px] font-bold text-primary hover:underline transition-all">Forgot?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-14 h-16 bg-slate-100/50 dark:bg-slate-800/50 border-transparent rounded-xl text-lg focus-visible:ring-primary/20 transition-all font-semibold dark:text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-16 text-lg font-black transition-all shadow-2xl shadow-primary/30 rounded-xl group active:scale-[0.97] bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Please Wait...
                </>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Login <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <footer className="relative z-10 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 flex flex-col items-center gap-4">
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
          Are you an admin? <button onClick={() => navigate('/admin/login')} className="text-primary hover:underline underline-offset-4 ml-1 font-black">Admin Login</button>
        </p>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-200/50 dark:bg-slate-800/50 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <Sparkles size={12} className="text-primary" />
          <span>Teachers & Drivers use same login</span>
        </div>
      </footer>
    </div>
  );
};

export default Login;

