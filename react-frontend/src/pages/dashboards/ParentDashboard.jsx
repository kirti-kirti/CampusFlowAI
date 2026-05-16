import React, { useContext } from 'react';
import { 
  Baby, 
  Calendar, 
  Activity, 
  ChevronRight,
  Target,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  LayoutGrid,
  Bus,
  Clock,
  Heart,
  User,
  Star,
  MapPin,
  Cpu,
  History,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ParentDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const childStats = {
    name: 'Alice Smith',
    class: 'Grade 10 - Section A',
    attendance: '94%',
    nextClass: 'Mathematics',
    nextClassTime: '10:00 AM'
  };

  return (
    <div className="pb-32 px-6 pt-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-7xl mx-auto space-y-12">
      {/* Enterprise Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b border-slate-100 dark:border-slate-800 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-rose-600 rounded-xl flex items-center justify-center shadow-xl shadow-rose-600/20">
                <Heart className="text-white" size={24} />
             </div>
             <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Parent <span className="text-rose-600 italic">Portal</span></h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Family Oversight System</p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/10 rounded-full border border-emerald-100 dark:border-emerald-900/20">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Profile Synced</span>
          </div>
        </div>
      </header>

      {/* Student Identity Node */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 premium-card p-10 md:p-14 border-none shadow-2xl relative overflow-hidden group bg-white dark:bg-slate-900">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-rose-500/5 rounded-full blur-[100px] -mr-48 -mt-48" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="relative">
              <div className="w-40 h-40 rounded-3xl p-1 bg-gradient-to-tr from-rose-500 to-orange-400 shadow-2xl">
                <div className="w-full h-full rounded-[1.4rem] bg-white dark:bg-slate-950 flex items-center justify-center overflow-hidden">
                  <User className="text-slate-200 dark:text-slate-800" size={80} />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-emerald-500 rounded-2xl border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-xl">
                <ShieldCheck className="text-white" size={24} />
              </div>
            </div>

            <div className="text-center md:text-left space-y-4">
              <div className="space-y-1">
                <Badge variant="outline" className="text-rose-600 border-rose-200 uppercase tracking-widest text-[9px] font-black px-3">Scholar Identity</Badge>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">{childStats.name}</h2>
                <p className="text-slate-500 font-bold text-lg uppercase tracking-widest">{childStats.class}</p>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-10 pt-4">
                 <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Attendance</span>
                    <span className="text-3xl font-black text-slate-900 dark:text-white">{childStats.attendance}</span>
                 </div>
                 <div className="w-[1px] h-10 bg-slate-100 dark:bg-slate-800 hidden md:block" />
                 <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Class Rank</span>
                    <span className="text-3xl font-black text-slate-900 dark:text-white">#04</span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:gap-6">
          <div 
            onClick={() => navigate('/attendance')}
            className="premium-card p-6 md:p-8 flex items-center justify-between group cursor-pointer border-none shadow-2xl shadow-slate-200/40 dark:shadow-none hover:bg-slate-950 hover:text-white transition-all duration-500"
          >
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-950 text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner shrink-0">
                <History size={24} className="md:size-7" />
              </div>
              <div>
                <h4 className="text-base md:text-lg font-black leading-none uppercase">Attendance Logs</h4>
                <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 md:mt-2 group-hover:text-slate-500 transition-colors leading-none">Daily Verification History</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform md:size-5" />
          </div>

          <div 
            onClick={() => navigate('/timetable')}
            className="premium-card p-6 md:p-8 flex items-center justify-between group cursor-pointer border-none shadow-2xl shadow-slate-200/40 dark:shadow-none hover:bg-rose-600 hover:text-white transition-all duration-500"
          >
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner group-hover:bg-white/10 group-hover:text-white shrink-0">
                <Calendar size={24} className="md:size-7" />
              </div>
              <div>
                <h4 className="text-base md:text-lg font-black leading-none uppercase">Academic Schedule</h4>
                <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 md:mt-2 group-hover:text-rose-200 transition-colors leading-none">Weekly Class Flow</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform md:size-5" />
          </div>
        </div>
      </section>

      {/* Real-time Tracking & Next Node */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div 
          onClick={() => navigate('/transport')}
          className="premium-card p-10 md:p-14 bg-indigo-600 text-white border-none shadow-2xl relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 to-indigo-600" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32" />
          
          <div className="relative z-10 flex flex-col justify-between h-full space-y-10">
             <div className="flex items-center justify-between">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20">
                   <Bus size={32} />
                </div>
                <div className="px-4 py-1.5 bg-emerald-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">Live Track</div>
             </div>
             
             <div className="space-y-2">
                <h3 className="text-3xl font-black tracking-tight uppercase">School Transport</h3>
                <p className="text-indigo-100/80 font-medium text-lg">Monitor live location and estimated arrival of the school bus in real-time.</p>
             </div>

             <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-200">Open Map View</span>
                <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
             </div>
          </div>
        </div>

        <div className="premium-card p-10 md:p-14 border-none shadow-2xl shadow-slate-200/40 dark:shadow-none space-y-10 relative overflow-hidden group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-500">
           <div className="absolute top-0 right-0 w-48 h-48 bg-slate-50 dark:bg-slate-800/50 rounded-full blur-[60px] -mr-24 -mt-24" />
           
           <div className="relative z-10 space-y-8">
              <header className="flex items-center justify-between">
                 <div className="flex items-center gap-3 text-primary font-black text-[10px] uppercase tracking-[0.2em]">
                    <Clock size={16} /> Upcoming Class
                 </div>
                 <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 uppercase tracking-widest text-[9px] font-black px-3">Starts Soon</Badge>
              </header>

              <div className="space-y-2">
                 <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">{childStats.nextClass}</h3>
                 <p className="text-slate-500 font-medium text-lg">Classroom <span className="text-slate-900 dark:text-white font-black uppercase text-base">Room 204</span></p>
              </div>

              <div className="flex items-center gap-4 pt-4">
                 <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <MapPin size={14} className="text-primary" /> {childStats.nextClassTime} Schedule
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Safety & Support */}
      <footer className="flex flex-col md:flex-row items-center justify-center gap-4 py-8 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
         <Shield size={18} className="text-primary" />
         <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] text-center px-6">All institutional safety protocols are active for your child today</p>
      </footer>
    </div>
  );
};

export default ParentDashboard;

