import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Building, 
  Shield, 
  LogOut, 
  Key, 
  Smartphone,
  ChevronRight,
  ShieldCheck,
  ExternalLink,
  Lock,
  Bell,
  QrCode
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Profile = () => {
  const { user, logout } = useContext(AuthContext);

  const securitySettings = [
    { title: 'Identity Verification', status: 'Enabled', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { title: 'Access Keys', status: 'Updated 2d ago', icon: Key, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { title: 'Connected Devices', status: '2 Active', icon: Smartphone, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  return (
    <div className="animate-in fade-in duration-1000 max-w-4xl mx-auto pb-10">
      <header className="mb-10 pt-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Badge variant="secondary" className="mb-3 px-3 py-1 bg-primary/5 text-primary border-none font-bold tracking-widest text-[10px] uppercase">
            Security Profile
          </Badge>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 leading-none mb-3">Settings</h1>
          <p className="text-slate-500 font-medium text-base md:text-lg">Manage your identity and enterprise access.</p>
        </div>
        <Button 
          variant="destructive" 
          onClick={logout} 
          className="w-full md:w-auto h-14 px-8 rounded-2xl font-black text-sm shadow-xl shadow-red-500/20 active:scale-95 transition-all gap-3"
        >
          <LogOut size={20} />
          Terminate Session
        </Button>
      </header>

      <div className="grid gap-8">
        {/* Profile Identity Card */}
        <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] bg-white rounded-[2.5rem] overflow-hidden group">
          <div className="h-24 md:h-32 bg-gradient-to-r from-primary via-indigo-400 to-indigo-600 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32" />
          </div>
          <CardContent className="px-6 md:px-10 pb-10 relative">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 -mt-12 md:-mt-16">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] md:rounded-[2.5rem] bg-white p-1.5 md:p-2 shadow-2xl relative">
                <div className="w-full h-full rounded-[1.5rem] md:rounded-[2rem] bg-slate-50 flex items-center justify-center text-primary border border-slate-100 overflow-hidden">
                  <User size={48} className="md:size-64 opacity-20" />
                </div>
                <div className="absolute bottom-1 right-1 w-6 h-6 md:w-8 md:h-8 bg-emerald-500 border-4 border-white rounded-full" />
              </div>
              <div className="text-center md:text-left pt-2 md:pt-4">
                <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 mb-1">
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{user?.name || 'Authorized User'}</h2>
                  <Badge className="bg-primary/10 text-primary border-none font-black text-[9px] md:text-[10px] uppercase tracking-widest py-1.5 px-4 rounded-full">
                    {user?.role || 'Guest'}
                  </Badge>
                </div>
                <p className="text-slate-400 font-medium text-base md:text-lg flex items-center justify-center md:justify-start gap-2">
                  <Mail size={16} className="text-slate-300" />
                  <span className="truncate max-w-[240px] md:max-w-none">{user?.email || 'user@campusflow.ai'}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 border-t border-slate-50 pt-10">
              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Identity Details</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Assigned Instance</Label>
                    <div className="relative group">
                      <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                      <Input 
                        readOnly
                        value={user?.tenantId || 'Default Campus'} 
                        className="pl-12 h-14 bg-slate-50 border-none rounded-2xl font-bold text-slate-600 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Corporate Email</Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                      <Input 
                        readOnly
                        value={user?.email || 'N/A'} 
                        className="pl-12 h-14 bg-slate-50 border-none rounded-2xl font-bold text-slate-600 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Security Protocols</h3>
                <div className="space-y-3">
                  {securitySettings.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group/item">
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl ${item.bg} ${item.color} group-hover/item:scale-110 transition-transform`}>
                          <item.icon size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 leading-tight">{item.title}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.status}</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-300 group-hover/item:translate-x-1 transition-transform" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Identity QR for Students */}
        {user?.role === 'STUDENT' && (
          <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] bg-slate-900 rounded-[2.5rem] overflow-hidden text-white p-10 flex flex-col md:flex-row items-center gap-10">
            <div className="bg-white p-6 rounded-[2rem] shadow-2xl">
              <QRCodeSVG value={user.id.toString()} size={180} level="H" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                  <QrCode size={18} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Identity QR</h3>
              </div>
              <h2 className="text-3xl font-black tracking-tight mb-4 uppercase">Verification Token</h2>
              <p className="text-slate-400 text-sm font-medium mb-6">
                Show this code to your teacher during "Central Scanner Mode" to verify your presence. 
                This token is uniquely bound to your profile ID #{user.id}.
              </p>
              <div className="px-4 py-2 bg-white/5 rounded-xl inline-flex items-center gap-3 border border-white/5">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Live Secure Identity</span>
              </div>
            </div>
          </Card>
        )}

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <Card className="border-none shadow-[0_10px_30px_rgba(0,0,0,0.03)] bg-white rounded-3xl group cursor-pointer hover:shadow-xl transition-all">
            <CardContent className="p-6 flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                <Lock size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900">Credential Management</h4>
                <p className="text-xs text-slate-400 font-medium">Update password & 2FA keys.</p>
              </div>
              <ExternalLink size={18} className="text-slate-200 group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
          <Card className="border-none shadow-[0_10px_30px_rgba(0,0,0,0.03)] bg-white rounded-3xl group cursor-pointer hover:shadow-xl transition-all">
            <CardContent className="p-6 flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                <Bell size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900">Communication Prefs</h4>
                <p className="text-xs text-slate-400 font-medium">Control broadcast & alert feed.</p>
              </div>
              <ExternalLink size={18} className="text-slate-200 group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
