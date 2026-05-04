import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  ChevronRight, 
  Loader2, 
  ArrowLeft,
  GraduationCap,
  Users,
  Briefcase
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import authService from '../services/authService';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
    studentId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value) => {
    setFormData(prev => ({ ...prev, role: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.register(formData);
      toast.success('Onboarding complete. Welcome to the ecosystem.');
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.id,
        name: response.name,
        email: response.email,
        role: response.role
      }));
      
      // Navigate based on role
      const dashboardMap = {
        'ADMIN': '/admin/dashboard',
        'TEACHER': '/teacher/dashboard',
        'STUDENT': '/student/dashboard',
        'PARENT': '/parent/dashboard'
      };
      navigate(dashboardMap[response.role] || '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Verification error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] p-6 relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -mr-40 -mt-40" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] -ml-40 -mb-40" />
      </div>

      <Card className="w-full max-w-lg border-none shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] relative z-10 bg-white/95 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary to-indigo-400" />
        <CardHeader className="pt-10 pb-6 px-10">
          <Link to="/login" className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest mb-6 w-fit">
            <ArrowLeft size={14} /> Back to Entry
          </Link>
          <CardTitle className="text-3xl font-black tracking-tight text-slate-900 mb-1">Create Identity</CardTitle>
          <CardDescription className="text-slate-500 font-medium italic">Join the CampusFlow AI intelligence ecosystem.</CardDescription>
        </CardHeader>
        
        <CardContent className="px-10 pb-10">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-bold p-4 rounded-xl mb-6 flex items-center gap-3">
              <ShieldCheck size={18} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Full Name</Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                  <Input 
                    name="name"
                    placeholder="Enter full name" 
                    className="pl-12 h-14 bg-slate-50/50 border-slate-100 rounded-2xl text-sm focus-visible:ring-primary/20 transition-all font-medium"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Corporate Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                  <Input 
                    name="email"
                    type="email" 
                    placeholder="name@campus.com" 
                    className="pl-12 h-14 bg-slate-50/50 border-slate-100 rounded-2xl text-sm focus-visible:ring-primary/20 transition-all font-medium"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Ecosystem Role</Label>
              <Select onValueChange={handleRoleChange} defaultValue={formData.role}>
                <SelectTrigger className="h-14 bg-slate-50/50 border-slate-100 rounded-2xl text-sm focus:ring-primary/20 font-medium">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="border-slate-100 rounded-2xl shadow-xl">
                  <SelectItem value="STUDENT" className="py-3 focus:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <GraduationCap size={16} className="text-primary" />
                      <span className="font-bold text-slate-700">Scholar / Student</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="TEACHER" className="py-3 focus:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <Briefcase size={16} className="text-indigo-500" />
                      <span className="font-bold text-slate-700">Faculty / Teacher</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="PARENT" className="py-3 focus:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <Users size={16} className="text-orange-500" />
                      <span className="font-bold text-slate-700">Guardian / Parent</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Secure Password</Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                <Input 
                  name="password"
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-12 h-14 bg-slate-50/50 border-slate-100 rounded-2xl text-sm focus-visible:ring-primary/20 transition-all font-medium"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Dynamic Field: Student ID (Required for Parents) */}
            {formData.role === 'PARENT' && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 ml-1">Ward Student ID</Label>
                <div className="relative group">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors" size={18} />
                  <Input 
                    name="studentId"
                    placeholder="Enter child's Student ID" 
                    className="pl-12 h-14 bg-orange-50/20 border-orange-100 rounded-2xl text-sm focus-visible:ring-orange-500/10 transition-all font-medium"
                    value={formData.studentId}
                    onChange={handleChange}
                    required
                  />
                </div>
                <p className="text-[9px] text-slate-400 font-bold ml-1">Identity validation will be performed against our records.</p>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full h-14 text-base font-black transition-all shadow-xl shadow-primary/20 rounded-2xl group active:scale-[0.98] bg-slate-900 hover:bg-slate-800"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Encrypting Identity...
                </>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Complete Onboarding <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Already verified? <Link to="/login" className="text-primary hover:underline underline-offset-4 ml-1">Authenticate here</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
