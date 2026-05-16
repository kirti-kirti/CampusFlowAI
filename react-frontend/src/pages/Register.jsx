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
  Briefcase,
  Sparkles
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
      toast.success('Account created successfully! Welcome.');
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.id,
        name: response.name,
        email: response.email,
        role: response.role
      }));
      
      const dashboardMap = {
        'ADMIN': '/dashboard',
        'TEACHER': '/dashboard',
        'STUDENT': '/dashboard',
        'PARENT': '/dashboard'
      };
      navigate(dashboardMap[response.role] || '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 relative overflow-hidden transition-colors duration-500">
      {/* Stunning Animated Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-15%] w-[70%] h-[70%] bg-primary/10 rounded-full blur-[120px] animate-pulse-soft" />
        <div className="absolute bottom-[-15%] right-[-15%] w-[70%] h-[70%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse-soft" />
      </div>

      <Card className="w-full max-w-xl border-none shadow-[0_30px_60px_-12px_rgba(0,0,0,0.12)] relative z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl rounded-xl overflow-hidden border border-white/20 dark:border-slate-800">
        <div className="h-2 bg-gradient-to-r from-primary via-indigo-400 to-emerald-400" />
        <CardHeader className="pt-12 pb-8 px-10">
          <Link to="/login" className="flex items-center gap-2 text-slate-400 hover:text-primary transition-all text-[10px] font-black uppercase tracking-[0.2em] mb-8 w-fit bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full">
            <ArrowLeft size={14} /> Back to Login
          </Link>
          <CardTitle className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2 flex items-center gap-3">
            Create Account <Sparkles size={28} className="text-primary animate-pulse" />
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400 font-medium text-lg italic">Sign up to get started with CampusFlow AI.</CardDescription>
        </CardHeader>
        
        <CardContent className="px-10 pb-12">
          {error && (
            <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-bold p-4 rounded-xl mb-8 flex items-center gap-3 animate-shake">
              <ShieldCheck size={20} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</Label>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                  <Input 
                    name="name"
                    placeholder="John Doe" 
                    className="pl-14 h-16 bg-slate-100/50 dark:bg-slate-800/50 border-transparent rounded-xl text-base focus-visible:ring-primary/20 transition-all font-semibold dark:text-white"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                  <Input 
                    name="email"
                    type="email" 
                    placeholder="john@email.com" 
                    className="pl-14 h-16 bg-slate-100/50 dark:bg-slate-800/50 border-transparent rounded-xl text-base focus-visible:ring-primary/20 transition-all font-semibold dark:text-white"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Who are you?</Label>
              <Select onValueChange={handleRoleChange} defaultValue={formData.role}>
                <SelectTrigger className="h-16 bg-slate-100/50 dark:bg-slate-800/50 border-transparent rounded-xl text-lg focus:ring-primary/20 font-bold dark:text-white">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent className="border-slate-100 dark:border-slate-800 rounded-xl shadow-2xl p-2">
                  <SelectItem value="STUDENT" className="py-4 rounded-xl focus:bg-slate-50 dark:focus:bg-slate-800">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <GraduationCap size={22} />
                      </div>
                      <span className="font-extrabold text-slate-700 dark:text-slate-200">Student</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="TEACHER" className="py-4 rounded-xl focus:bg-slate-50 dark:focus:bg-slate-800">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                        <Briefcase size={22} />
                      </div>
                      <span className="font-extrabold text-slate-700 dark:text-slate-200">Teacher</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="PARENT" className="py-4 rounded-xl focus:bg-slate-50 dark:focus:bg-slate-800">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500">
                        <Users size={22} />
                      </div>
                      <span className="font-extrabold text-slate-700 dark:text-slate-200">Parent</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</Label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                <Input 
                  name="password"
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-14 h-16 bg-slate-100/50 dark:bg-slate-800/50 border-transparent rounded-xl text-lg focus-visible:ring-primary/20 transition-all font-semibold dark:text-white"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Dynamic Field: Student ID (Required for Parents) */}
            {formData.role === 'PARENT' && (
              <div className="space-y-2 animate-in slide-in-from-top-4 duration-500">
                <Label className="text-[11px] font-black uppercase tracking-widest text-orange-500 ml-1">Your Child's Student ID</Label>
                <div className="relative group">
                  <GraduationCap className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-300 group-focus-within:text-orange-500 transition-colors" size={20} />
                  <Input 
                    name="studentId"
                    placeholder="Enter Student ID" 
                    className="pl-14 h-16 bg-orange-50/20 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/30 rounded-xl text-lg focus-visible:ring-orange-500/10 transition-all font-bold text-orange-600 dark:text-orange-400"
                    value={formData.studentId}
                    onChange={handleChange}
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-bold ml-1 uppercase tracking-widest">We will verify this ID against our records.</p>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full h-16 text-lg font-black transition-all shadow-2xl shadow-primary/30 rounded-xl group active:scale-[0.97] bg-primary hover:bg-primary/90 mt-4"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-7 w-7 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  Sign Up <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Already have an account? <Link to="/login" className="text-primary hover:underline underline-offset-4 ml-1 font-black">Login</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;

