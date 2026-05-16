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
  RefreshCw,
  Sparkles,
  Inbox,
  ArrowRight,
  Target
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
      toast.error('Could not sync notifications');
    }
  };

  const sendBroadcast = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await notificationService.sendBroadcast(broadcast);
      toast.success('Announcement sent successfully!');
      setBroadcast({ title: '', message: '', targetRole: 'ALL' });
      fetchNotifications();
    } catch (err) {
      toast.error('Failed to send announcement');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (targetRole) => {
    switch (targetRole) {
      case 'PARENT': return <AlertTriangle size={24} />;
      case 'STUDENT': return <CheckCircle size={24} />;
      default: return <Info size={24} />;
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-32 px-6 pt-8 max-w-5xl mx-auto">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">
            <Sparkles size={12} /> School Announcements
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-none">Recent Updates</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Stay informed with the latest news and announcements.</p>
        </div>
        <button 
          onClick={fetchNotifications} 
          className="w-14 h-14 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-xl active:scale-95 group"
        >
          <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
        </button>
      </header>

      <div className="grid gap-12">
        {/* Admin Broadcast Panel */}
        {(user?.role === 'ADMIN' || user?.role === 'TEACHER') && (
          <Card className="premium-card p-0 overflow-hidden border-none shadow-2xl shadow-primary/5">
            <CardHeader className="p-10 bg-slate-950 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
               <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
                  <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/10 shadow-inner">
                    <Megaphone size={36} className="text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-black tracking-tight">Post Announcement</CardTitle>
                    <CardDescription className="text-slate-400 font-medium text-base mt-1">Send a message to the entire school or specific groups.</CardDescription>
                  </div>
               </div>
            </CardHeader>
            <CardContent className="p-10">
              <form onSubmit={sendBroadcast} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Title</Label>
                    <div className="relative group">
                      <Inbox className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                      <Input 
                        placeholder="e.g. Annual Sports Day" 
                        className="h-16 pl-16 bg-slate-100/50 dark:bg-slate-800/50 border-none rounded-xl font-bold dark:text-white"
                        value={broadcast.title}
                        onChange={(e) => setBroadcast({...broadcast, title: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Who should see this?</Label>
                    <div className="relative group">
                      <Target className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                      <select 
                        className="w-full h-16 bg-slate-100/50 dark:bg-slate-800/50 border-none rounded-xl pl-16 pr-8 font-bold text-base focus:ring-2 focus:ring-primary/20 outline-none appearance-none dark:text-white"
                        value={broadcast.targetRole}
                        onChange={(e) => setBroadcast({...broadcast, targetRole: e.target.value})}
                      >
                        <option value="ALL">All Users</option>
                        <option value="STUDENT">Students Only</option>
                        <option value="TEACHER">Teachers Only</option>
                        <option value="PARENT">Parents Only</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Message</Label>
                  <Textarea 
                    placeholder="Type your message here..." 
                    className="min-h-[160px] bg-slate-100/50 dark:bg-slate-800/50 border-none rounded-xl font-medium p-8 text-lg focus:ring-2 focus:ring-primary/20 outline-none resize-none dark:text-white"
                    value={broadcast.message}
                    onChange={(e) => setBroadcast({...broadcast, message: e.target.value})}
                    required
                  />
                </div>
                <Button type="submit" disabled={loading} className="btn-premium w-full h-16 !rounded-xl group">
                  {loading ? (
                    <RefreshCw className="animate-spin" size={24} />
                  ) : (
                    <span className="flex items-center gap-3">
                       Send Announcement <Send size={22} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Live Notification Feed */}
        <section className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Bell size={18} className="text-primary" /> Inbox
            </h3>
            <Badge variant="outline" className="px-4 py-1.5 rounded-full border-slate-200 dark:border-slate-800 font-bold text-[10px] uppercase tracking-widest text-slate-500">
              {notifications.length} Messages
            </Badge>
          </div>

          <div className="grid gap-6">
            {notifications.length > 0 ? (
              notifications.map((notif, index) => (
                <Card key={index} className="premium-card group overflow-hidden border-none p-0">
                   <div className={cn(
                    "w-2 h-full absolute left-0 top-0",
                    notif.targetRole === 'PARENT' ? 'bg-rose-500' : 
                    notif.targetRole === 'STUDENT' ? 'bg-emerald-500' : 
                    'bg-primary'
                  )} />
                  <CardContent className="p-8 flex flex-col md:flex-row gap-8 items-start">
                    <div className={cn(
                      "w-16 h-16 rounded-xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500",
                      notif.targetRole === 'PARENT' ? 'bg-rose-50 dark:bg-rose-900/10 text-rose-500' : 
                      notif.targetRole === 'STUDENT' ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-500' : 
                      'bg-primary/10 text-primary'
                    )}>
                      {getIcon(notif.targetRole)}
                    </div>
                    <div className="flex-1 space-y-4 min-w-0 w-full">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                        <div className="space-y-1">
                          <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-primary transition-colors truncate">{notif.title}</h4>
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              <Clock size={14} className="text-primary" /> {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700" />
                            <span className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              <User size={14} className="text-primary" /> {notif.targetRole || 'ALL'}
                            </span>
                          </div>
                        </div>
                        <Badge className={cn(
                          "px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest border-none shadow-sm",
                          notif.targetRole === 'PARENT' ? 'bg-rose-500 text-white' : 
                          notif.targetRole === 'STUDENT' ? 'bg-emerald-500 text-white' : 
                          'bg-primary text-white'
                        )}>
                          {notif.targetRole || 'EVERYONE'}
                        </Badge>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 font-medium text-lg leading-relaxed">{notif.message}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="py-24 text-center premium-card border-dashed">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">
                  📬
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-1">All caught up!</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest text-xs">No new notifications detected.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Notifications;

