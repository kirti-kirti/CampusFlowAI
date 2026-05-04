import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, Mail, Building, Loader2, ChevronLeft, Fingerprint } from 'lucide-react';
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
    // Backend ignores role in login body — role is stored in DB and returned in JWT
    const result = await login({ email, password });
    if (result.success) {
      if (result.role !== 'ADMIN') {
        setError('Access denied. This portal is for administrators only.');
        setLoading(false);
        return;
      }
      navigate('/dashboard');
    } else {
      setError(result.error || 'Privileged access denied');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F172A] p-6 relative overflow-hidden">
      {/* High-Security Grid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent" />
      </div>

      <button 
        onClick={() => navigate('/login')}
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors group z-20"
      >
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold text-sm">Return to User Portal</span>
      </button>

      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in duration-700">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.1)] mb-4">
            <ShieldAlert className="text-red-500" size={40} />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">Admin Console</h1>
          <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-full border border-red-500/30">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Privileged Access Only</span>
          </div>
        </div>

        <Card className="border-slate-800 shadow-2xl bg-slate-900/50 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="pt-10 pb-6 px-10 border-b border-slate-800/50">
            <CardTitle className="text-xl font-bold text-white">Identity Verification</CardTitle>
            <CardDescription className="text-slate-400">Authorized personnel must authenticate via secure channel.</CardDescription>
          </CardHeader>
          
          <CardContent className="px-10 py-10">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold p-4 rounded-2xl mb-8 flex items-center gap-3">
                <ShieldAlert size={18} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Instance Key</Label>
                <div className="relative group">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-red-500 transition-colors" size={18} />
                  <Input 
                    type="text" 
                    placeholder="ENTER TENANT ID" 
                    className="pl-12 h-14 bg-slate-800/50 border-slate-700 text-white rounded-2xl text-base focus-visible:ring-red-500/20 transition-all font-mono"
                    value={tenantId}
                    onChange={(e) => setTenantId(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Admin Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-red-500 transition-colors" size={18} />
                  <Input 
                    type="email" 
                    placeholder="admin@campusflow.ai" 
                    className="pl-12 h-14 bg-slate-800/50 border-slate-700 text-white rounded-2xl text-base focus-visible:ring-red-500/20 transition-all font-medium"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Security Token</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-red-500 transition-colors" size={18} />
                  <Input 
                    type="password" 
                    placeholder="••••••••••••" 
                    className="pl-12 h-14 bg-slate-800/50 border-slate-700 text-white rounded-2xl text-base focus-visible:ring-red-500/20 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-14 bg-red-600 hover:bg-red-500 text-white border-none shadow-[0_0_30px_rgba(220,38,38,0.3)] rounded-2xl text-base font-black transition-all active:scale-[0.98] mt-4"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="animate-spin h-6 w-6" />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Fingerprint size={20} /> Authorize Access
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 flex items-center gap-6 text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] relative z-10">
        <span>Encrypted Tunnel</span>
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span>Hardware Verified</span>
      </div>
    </div>
  );
};

export default AdminLogin;
