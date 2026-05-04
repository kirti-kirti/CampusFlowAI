import React, { useState, useEffect, useContext } from 'react';
import notificationService from '../services/notificationService';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  Bell, 
  Send, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Megaphone, 
  Search, 
  Filter, 
  Clock,
  ShieldCheck,
  ChevronRight,
  User,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const Notifications = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [broadcast, setBroadcast] = useState({ title: '', message: '', targetRole: 'ALL' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      toast.error('Sync failed');
    }
  };

  const sendBroadcast = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await notificationService.sendBroadcast(broadcast);
      toast.success('Broadcast transmitted');
      setBroadcast({ title: '', message: '', targetRole: 'ALL' });
      fetchNotifications();
    } catch (err) {
      toast.error('Transmission failed');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (targetRole) => {
    switch (targetRole) {
      case 'PARENT': return <AlertTriangle className="text-rose-500" size={20} />;
      case 'STUDENT': return <CheckCircle className="text-emerald-500" size={20} />;
      default: return <Info className="text-indigo-500" size={20} />;
    }
  };

  return (
    <div className="animate-in fade-in duration-1000 pb-10">
      <header className="mb-10 pt-4">
        <Badge variant="outline" className="mb-3 px-3 py-1 border-indigo-100 bg-indigo-50/30 text-indigo-600 font-bold tracking-widest text-[10px] uppercase">
          Communications Engine
        </Badge>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 leading-none mb-3">Enterprise Alerts</h1>
        <p className="text-slate-500 font-medium text-base md:text-lg">Centralized campus-wide intelligence and broadcast management.</p>
      </header>

      <div className="grid gap-8">
        {/* Admin Broadcast Panel */}
        {(user?.role === 'ADMIN' || user?.role === 'TEACHER') && (
          <Card className="border-none shadow-[0_20px_60px_rgba(79,70,229,0.08)] bg-white rounded-[2.5rem] overflow-hidden">
            <CardHeader className="pt-8 px-6 md:px-10">
              <CardTitle className="flex items-center gap-3 text-xl md:text-2xl font-black">
                <div className="p-3 bg-primary/5 rounded-2xl text-primary">
                  <Megaphone size={24} />
                </div>
                Initialize Broadcast
              </CardTitle>
              <CardDescription className="font-medium text-sm">Direct communication line to student and faculty portals.</CardDescription>
            </CardHeader>
            <CardContent className="px-6 md:px-10 pb-10">
              <form onSubmit={sendBroadcast} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Transmission Title</Label>
                    <Input 
                      placeholder="e.g. System Maintenance" 
                      className="h-12 bg-slate-50 border-none rounded-xl font-bold placeholder:text-slate-300"
                      value={broadcast.title}
                      onChange={(e) => setBroadcast({...broadcast, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Target Audience</Label>
                    <select 
                      className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                      value={broadcast.targetRole}
                      onChange={(e) => setBroadcast({...broadcast, targetRole: e.target.value})}
                    >
                      <option value="ALL">Everyone</option>
                      <option value="STUDENT">Students Only</option>
                      <option value="TEACHER">Teachers Only</option>
                      <option value="PARENT">Parents Only</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Broadcast Payload</Label>
                  <Textarea 
                    placeholder="Enter the full message for transmission..." 
                    className="min-h-[120px] bg-slate-50 border-none rounded-2xl font-medium p-4 md:p-6 placeholder:text-slate-300 resize-none"
                    value={broadcast.message}
                    onChange={(e) => setBroadcast({...broadcast, message: e.target.value})}
                    required
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl font-black text-base shadow-xl shadow-primary/20 active:scale-[0.98] transition-all gap-3">
                  <Send size={20} />
                  {loading ? 'Transmitting...' : 'Execute Broadcast'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Live Notification Feed */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Intelligence Feed</h3>
            <div className="flex gap-2 w-full sm:w-auto">
              <button onClick={fetchNotifications} className="h-9 px-4 rounded-xl text-[10px] font-black tracking-widest uppercase text-slate-400 hover:text-primary bg-slate-50 flex items-center justify-center flex-1 sm:flex-none transition-all active:scale-95">
                <RefreshCw size={14} className="mr-2" /> Sync Manual
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {notifications.length > 0 ? (
              notifications.map((notif, index) => (
                <Card key={index} className="border-none shadow-[0_4px_20px_rgba(0,0,0,0.02)] bg-white rounded-3xl group hover:shadow-[0_15px_30px_rgba(0,0,0,0.05)] transition-all">
                  <CardContent className="p-5 md:p-6 flex flex-col sm:flex-row gap-5 items-start">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner
                      ${notif.targetRole === 'PARENT' ? 'bg-rose-50 text-rose-500' : 
                        notif.targetRole === 'STUDENT' ? 'bg-emerald-50 text-emerald-500' : 
                        'bg-indigo-50 text-indigo-500'}`}
                    >
                      {getIcon(notif.targetRole)}
                    </div>
                    <div className="flex-1 space-y-3 min-w-0 w-full">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                        <div className="min-w-0">
                          <h4 className="text-lg font-black text-slate-900 group-hover:text-primary transition-colors truncate">{notif.title}</h4>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                            <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                              <Clock size={12} className="text-slate-300" /> {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                            <span className="hidden md:block w-1 h-1 rounded-full bg-slate-200" />
                            <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                              <User size={12} className="text-slate-300" /> {notif.targetRole || 'ALL'}
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline" className={`w-fit font-black text-[8px] tracking-widest uppercase px-3 py-1 rounded-lg border-none
                          ${notif.targetRole === 'PARENT' ? 'bg-rose-50 text-rose-600' : 
                            notif.targetRole === 'STUDENT' ? 'bg-emerald-50 text-emerald-600' : 
                            'bg-slate-50 text-slate-600'}`}
                        >
                          {notif.targetRole || 'ALL'}
                        </Badge>
                      </div>
                      <p className="text-slate-500 font-medium text-sm leading-relaxed">{notif.message}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-64 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm text-slate-200 mb-4">
                  <ShieldCheck size={32} />
                </div>
                <p className="font-bold text-slate-400 tracking-tight text-center px-4">Channel clear. No active transmissions detected.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
