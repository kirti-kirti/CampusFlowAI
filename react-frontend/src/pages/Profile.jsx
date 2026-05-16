import React, { useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Building, 
  LogOut, 
  ChevronRight,
  QrCode,
  Sparkles,
  Camera,
  ArrowRight,
  Lock,
  Bell,
  Phone,
  MapPin,
  Users,
  Layers,
  Hash,
  Info,
  Fingerprint,
  Edit3,
  Check,
  X
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const Profile = () => {
  const { user, logout, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...user });

  useEffect(() => {
    const refreshData = async () => {
      try {
        const freshProfile = await authService.getProfile();
        updateUser(freshProfile);
        setFormData({ ...freshProfile });
      } catch (err) {
        console.error("Profile sync failed", err);
      }
    };
    refreshData();
  }, []);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out of your session?')) {
      logout();
      navigate('/login');
    }
  };

  const handleSave = async () => {
    try {
      await authService.updateProfile(formData);
      updateUser(formData);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };


  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-4xl mx-auto pb-32 px-6 pt-8">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">
            <Sparkles size={12} /> Your Profile
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-none">Account Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Update your personal details and security settings.</p>
        </div>
      </header>

      <div className="grid gap-10">
        {/* Profile Identity Card */}
        <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl rounded-xl overflow-hidden group border border-white/20 dark:border-slate-800 relative">
          <div className="h-32 md:h-48 bg-gradient-to-r from-primary via-indigo-500 to-violet-600 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-48 -mt-48 animate-pulse-soft" />
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-[80px] -ml-32 -mb-32" />
             
             {/* Dynamic Edit Controller */}
             <div className="absolute top-6 right-6 z-30">
                {!isEditing ? (
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="h-12 px-6 rounded-xl bg-white/20 backdrop-blur-xl border border-white/20 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/30 transition-all gap-2 shadow-xl"
                  >
                    <Edit3 size={16} />
                  </Button>
                ) : (
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => setIsEditing(false)}
                      className="h-12 px-6 rounded-xl bg-black/20 backdrop-blur-xl border border-white/10 text-white/70 font-black text-[10px] uppercase tracking-widest hover:bg-black/40 transition-all gap-2"
                    >
                      <X size={16} />
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSave}
                      className="h-12 px-8 rounded-xl bg-white text-primary font-black text-[10px] uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-95 transition-all gap-2 border-none"
                    >
                      <Check size={16} />
                      Save Changes
                    </Button>
                  </div>
                )}
             </div>
          </div>
          <CardContent className="px-8 md:px-12 pb-12 relative">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-10 -mt-16 md:-mt-20">
              <div className="relative group/avatar">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl md:rounded-xl bg-white dark:bg-slate-900 p-2 shadow-2xl relative z-10">
                  <div className="w-full h-full rounded-xl md:rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 border border-slate-200 dark:border-slate-700 overflow-hidden relative">
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                        <span className="text-4xl font-black text-slate-400 dark:text-slate-600 tracking-tighter">
                          {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'CF'}
                        </span>
                        <User size={24} className="opacity-10 absolute bottom-4" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 w-10 h-10 bg-primary rounded-xl border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-xl z-20 cursor-pointer hover:scale-110 transition-transform">
                  <Camera size={18} className="text-white" />
                </div>
              </div>
              
              <div className="text-center md:text-left pt-4 space-y-3">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{user?.name || 'User'}</h2>
                  <Badge className="bg-primary text-white border-none font-black text-[10px] uppercase tracking-widest py-2 px-6 rounded-full shadow-lg shadow-primary/20">
                    {user?.role || 'Member'}
                  </Badge>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2 bg-slate-50 dark:bg-slate-800 w-fit px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700">
                  <Mail size={16} className="text-primary" />
                  <span className="text-slate-600 dark:text-slate-300 font-bold text-sm truncate max-w-[240px] md:max-w-none">{user?.email || 'user@campusflow.ai'}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-12 mt-16 border-t border-slate-100 dark:border-slate-800 pt-12">
              <div className="space-y-8">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 ml-1 flex items-center gap-2">
                  <User size={14} className="text-primary" /> Account Details
                </h3>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">School / Campus</Label>
                    <div className="relative group">
                      <Building className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                      <Input 
                        readOnly
                        value={user?.tenantId || 'Main Campus'} 
                        className="pl-16 h-16 bg-slate-100/50 dark:bg-slate-800/50 border-transparent rounded-xl font-bold text-slate-700 dark:text-slate-200 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Phone Number</Label>
                      <div className="relative group">
                        <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                        <Input 
                          readOnly={!isEditing}
                          value={isEditing ? formData.phone : (user?.phone || 'Not Provided')} 
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className={cn(
                            "pl-16 h-16 bg-slate-100/50 dark:bg-slate-800/50 border-transparent rounded-xl font-bold text-slate-700 dark:text-slate-200 transition-all",
                            isEditing ? "bg-white dark:bg-slate-900 border-primary/30 focus:ring-4 focus:ring-primary/10" : "cursor-not-allowed"
                          )}
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Email Address</Label>
                      <div className="relative group">
                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                        <Input 
                          readOnly
                          value={user?.email || 'Not Provided'} 
                          className="pl-16 h-16 bg-slate-100/50 dark:bg-slate-800/50 border-transparent rounded-xl font-bold text-slate-700 dark:text-slate-200 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Residential Address</Label>
                    <div className="relative group">
                      <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                      <Input 
                        readOnly={!isEditing}
                        value={isEditing ? formData.address : (user?.address || 'Not Provided')} 
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className={cn(
                          "pl-16 h-16 bg-slate-100/50 dark:bg-slate-800/50 border-transparent rounded-xl font-bold text-slate-700 dark:text-slate-200 transition-all",
                          isEditing ? "bg-white dark:bg-slate-900 border-primary/30 focus:ring-4 focus:ring-primary/10" : "cursor-not-allowed"
                        )}
                      />
                    </div>
                  </div>

                  {/* Role Specific Academic Info */}
                  <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-8">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 ml-1 flex items-center gap-2">
                      <Layers size={14} className="text-primary" /> Academic Placement
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Roll Number</Label>
                        <div className="relative group">
                          <Fingerprint className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                          <Input 
                            readOnly
                            value={user?.rollNo || `CF-2026-${String(user?.id || '001').padStart(3, '0')}`} 
                            className="pl-16 h-16 bg-slate-100/50 dark:bg-slate-800/50 border-transparent rounded-xl font-bold text-slate-700 dark:text-slate-200 cursor-not-allowed"
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Department</Label>
                        <div className="relative group">
                          <Building className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                          <Input 
                            readOnly
                            value={user?.department || user?.departmentName || 'Not Assigned'} 
                            className="pl-16 h-16 bg-slate-100/50 dark:bg-slate-800/50 border-transparent rounded-xl font-bold text-slate-700 dark:text-slate-200 cursor-not-allowed text-xs"
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Class</Label>
                        <div className="relative group">
                          <Layers className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                          <Input 
                            readOnly
                            value={user?.class || user?.className || user?.classRoomName || 'Not Assigned'} 
                            className="pl-16 h-16 bg-slate-100/50 dark:bg-slate-800/50 border-transparent rounded-xl font-bold text-slate-700 dark:text-slate-200 cursor-not-allowed"
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Section</Label>
                        <div className="relative group">
                          <Hash className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                          <Input 
                            readOnly
                            value={user?.section || user?.sectionName || 'Not Assigned'} 
                            className="pl-16 h-16 bg-slate-100/50 dark:bg-slate-800/50 border-transparent rounded-xl font-bold text-slate-700 dark:text-slate-200 cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Parental Info for Students */}
                  {user?.role === 'STUDENT' && (
                    <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-8">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 ml-1 flex items-center gap-2">
                        <Users size={14} className="text-primary" /> Guardian Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Parent / Guardian Name</Label>
                          <div className="relative group">
                            <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                            <Input 
                              readOnly
                              value={user?.parentName || 'Robert Miller'} 
                              className="pl-16 h-16 bg-slate-100/50 dark:bg-slate-800/50 border-transparent rounded-xl font-bold text-slate-700 dark:text-slate-200 cursor-not-allowed"
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Emergency Contact</Label>
                          <div className="relative group">
                            <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                            <Input 
                              readOnly
                              value={user?.parentPhone || '+91 98222 11111'} 
                              className="pl-16 h-16 bg-slate-100/50 dark:bg-slate-800/50 border-transparent rounded-xl font-bold text-slate-700 dark:text-slate-200 cursor-not-allowed"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Identity QR for Students */}
        {user?.role === 'STUDENT' && (
          <Card className="border-none shadow-2xl shadow-slate-900/20 bg-slate-950 rounded-xl overflow-hidden text-white p-10 md:p-14 flex flex-col md:flex-row items-center gap-12 relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -mr-32 -mt-32" />
            <div className="bg-white p-8 rounded-xl shadow-2xl group hover:scale-105 transition-transform duration-500 cursor-pointer">
              <QRCodeSVG value={user.id.toString()} size={200} level="H" />
            </div>
            <div className="flex-1 text-center md:text-left space-y-6">
              <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                  <QrCode size={22} />
                </div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">My ID Code</h3>
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight uppercase leading-none">Security Identity</h2>
              <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-lg">
                Present this code to your teacher to verify your presence in class. 
                Uniquely bound to profile ID <span className="text-white font-black">#{user.id}</span>.
              </p>
              <div className="px-6 py-3 bg-white/5 rounded-xl inline-flex items-center gap-4 border border-white/10">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">Active Security Token</span>
              </div>
            </div>
          </Card>
        )}

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="premium-card group cursor-pointer p-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                <Lock size={32} />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Password & Security</h4>
                <p className="text-sm text-slate-400 font-medium mt-1">Change your password and manage security.</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:text-primary group-hover:bg-primary/5 transition-all">
                <ArrowRight size={20} />
              </div>
            </div>
          </Card>
          <Card className="premium-card group cursor-pointer p-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                <Bell size={32} />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Notifications</h4>
                <p className="text-sm text-slate-400 font-medium mt-1">Manage how you receive updates.</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:text-primary group-hover:bg-primary/5 transition-all">
                <ArrowRight size={20} />
              </div>
            </div>
          </Card>
        </div>

        {/* Session Termination */}
        <div className="mt-12 pt-12 border-t border-slate-100 dark:border-slate-800">
           <Card className="border-2 border-rose-100 dark:border-rose-900/30 bg-rose-50/30 dark:bg-rose-950/10 p-10 flex flex-col md:flex-row items-center justify-between gap-8 rounded-2xl shadow-sm border-none">
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-2xl font-black text-rose-600 dark:text-rose-500 tracking-tight uppercase">Session Termination</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm">
                  Sign out of your account on this device. You will need to re-authenticate to access your dashboard.
                </p>
              </div>
              <Button 
                onClick={handleLogout}
                variant="destructive"
                className="w-full md:w-auto h-16 px-12 rounded-xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-rose-500/20 active:scale-[0.98] transition-all gap-3 bg-rose-600 hover:bg-rose-500 border-none"
              >
                <LogOut size={20} />
                Logout Account
              </Button>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;

