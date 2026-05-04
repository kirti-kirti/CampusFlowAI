import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Building, Loader2, ShieldCheck, ChevronRight } from 'lucide-react';
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
      setError('Please fill in all security fields');
      return;
    }
    setLoading(true);
    setError('');
    // tenantId is only used for display/context — backend extracts it from JWT
    const result = await login({ email, password });
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Identity verification failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] p-6 relative overflow-hidden">
      {/* Enterprise Geometric Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -mr-40 -mt-40" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] -ml-40 -mb-40" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
      </div>

      <header className="relative z-10 mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-xl shadow-primary/20 rotate-3">
            <ShieldCheck className="text-white" size={28} />
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-900">CampusFlow<span className="text-primary text-xl">.ai</span></span>
        </div>
      </header>

      <Card className="w-full max-w-md border-none shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] relative z-10 bg-white/95 backdrop-blur-xl rounded-[2rem] overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary via-indigo-400 to-primary/80" />
        <CardHeader className="pt-10 pb-6 px-10">
          <CardTitle className="text-3xl font-black tracking-tight text-slate-900 mb-1">Sign In</CardTitle>
          <CardDescription className="text-slate-500 font-medium">Verify your credentials to access the secure portal.</CardDescription>
        </CardHeader>
        
        <CardContent className="px-10 pb-10">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-bold p-4 rounded-xl mb-6 flex items-center gap-3 animate-shake">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Organization Identifier</Label>
              <div className="relative group">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                <Input 
                  type="text" 
                  placeholder="Campus ID (e.g. CF-001)" 
                  className="pl-12 h-14 bg-slate-50/50 border-slate-100 rounded-2xl text-base focus-visible:ring-primary/20 transition-all font-medium"
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Corporate Email</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                <Input 
                  type="email" 
                  placeholder="name@organization.com" 
                  className="pl-12 h-14 bg-slate-50/50 border-slate-100 rounded-2xl text-base focus-visible:ring-primary/20 transition-all font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Secure Password</Label>
                <Link to="/forgot-password" size="sm" className="text-[10px] font-bold text-primary hover:underline">Recovery</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-12 h-14 bg-slate-50/50 border-slate-100 rounded-2xl text-base focus-visible:ring-primary/20 transition-all font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-14 text-base font-black transition-all shadow-xl shadow-primary/20 rounded-2xl group active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Initialize Session <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <footer className="relative z-10 mt-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 flex flex-col items-center gap-6">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Admin? <button onClick={() => navigate('/admin/login')} className="text-primary hover:underline underline-offset-4 ml-1 font-bold">Admin Portal</button>
        </p>
      </footer>
    </div>
  );
};

export default Login;
