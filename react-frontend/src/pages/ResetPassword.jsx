import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, ShieldCheck, ChevronRight, Loader2, KeyRound, CheckCircle2, Ticket } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import api from '../services/api';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    token: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match security criteria');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await api.post('/auth/reset-password', {
        token: formData.token,
        newPassword: formData.newPassword
      });
      toast.success('Identity Secured! Password updated.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Identity verification failed. Invalid or expired token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -mr-40 -mt-40" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] -ml-40 -mb-40" />
      </div>

      <Card className="w-full max-w-md border-none shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] relative z-10 bg-white/95 backdrop-blur-xl rounded-[2rem] overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-emerald-400 to-primary" />
        <CardHeader className="pt-10 pb-6 px-10">
          <CardTitle className="text-3xl font-black tracking-tight text-slate-900 mb-1">Reset Identity</CardTitle>
          <CardDescription className="text-slate-500 font-medium">Verify your recovery token and set a new secure password.</CardDescription>
        </CardHeader>
        
        <CardContent className="px-10 pb-10">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-bold p-4 rounded-xl mb-6 flex items-center gap-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Secure Token</Label>
              <div className="relative group">
                <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                <Input 
                  type="text" 
                  placeholder="Paste your 36-character token" 
                  className="pl-12 h-14 bg-slate-50/50 border-slate-100 rounded-2xl text-base focus-visible:ring-primary/20 transition-all font-medium"
                  value={formData.token}
                  onChange={(e) => setFormData({...formData, token: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">New Secure Password</Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-12 h-14 bg-slate-50/50 border-slate-100 rounded-2xl text-base focus-visible:ring-primary/20 transition-all font-medium"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Confirm Identity</Label>
              <div className="relative group">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-12 h-14 bg-slate-50/50 border-slate-100 rounded-2xl text-base focus-visible:ring-primary/20 transition-all font-medium"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-14 text-base font-black transition-all shadow-xl shadow-primary/20 rounded-2xl group active:scale-[0.98] bg-slate-900 hover:bg-slate-800"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Updating...
                </>
              ) : (
                <span className="flex items-center justify-center gap-2 text-white">
                  Confirm Password Reset <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
