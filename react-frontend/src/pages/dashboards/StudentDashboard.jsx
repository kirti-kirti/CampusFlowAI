import React, { useContext, useEffect, useState } from 'react';
import { 
  History, 
  Calendar, 
  Scan, 
  ChevronRight,
  Activity,
  ArrowRight,
  LayoutGrid,
  Bell,
  Bus,
  Sparkles,
  MapPin,
  Clock,
  BookOpen,
  Cpu,
  Target,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import attendanceService from '../../services/attendanceService';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPresentToday: 0,
    totalActiveSessions: 0,
    averageAttendancePercentage: 0,
    totalStudents: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await attendanceService.getStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  const nextClass = {
    subject: 'Distributed Systems',
    time: '10:00 AM',
    room: 'Hall-4',
    teacher: 'Prof. Turing'
  };

  return (
    <div className="pb-32 px-6 pt-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-7xl mx-auto space-y-12">
      {/* Enterprise Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b border-slate-100 dark:border-slate-800 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-xl shadow-primary/20">
                <Cpu className="text-white" size={24} />
             </div>
             <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Student <span className="text-primary italic">Portal</span></h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Academic Intelligence System</p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/notifications')}
            className="w-12 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-400 relative active:scale-95 transition-all"
          >
            <Bell size={20} />
            <div className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900" />
          </button>
          <Button 
            onClick={fetchStats}
            variant="outline"
            className="h-12 w-12 rounded-xl border-slate-200 dark:border-slate-800 text-slate-400 hover:text-primary transition-all"
          >
            <RefreshCw size={18} className={cn(loading && "animate-spin text-primary")} />
          </Button>
        </div>
      </header>

      {/* Hero Action & Analytics */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div 
          onClick={() => navigate('/attendance')}
          className="lg:col-span-2 premium-card bg-slate-950 p-8 md:p-14 border-none shadow-2xl relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px] -mr-48 -mt-48" />
          
          <div className="relative z-10 flex flex-col justify-between h-full space-y-12 text-white">
            <header className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/10 shrink-0">
                    <Scan className="text-primary" size={24} className="md:size-7" />
                 </div>
                 <div>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight uppercase leading-none">Daily Check-in</h2>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Classroom Verification</p>
                 </div>
              </div>
            </header>

            <div className="space-y-2">
              <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">Scan to <span className="text-primary italic">Attend</span></h3>
              <p className="text-slate-400 font-medium text-sm md:text-lg max-w-lg leading-tight">Unlock your academic progress for the day by verifying your presence.</p>
            </div>

            <Button className="bg-primary text-white hover:bg-primary/90 h-16 px-10 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 gap-3 group/btn w-fit">
              Activate Scanner <ArrowRight size={20} className="group-hover/btn:translate-x-2 transition-transform" />
            </Button>
          </div>
        </div>

        <div className="premium-card p-10 md:p-12 border-none shadow-2xl shadow-slate-200/40 dark:shadow-none flex flex-col justify-between">
           <header className="space-y-2 px-2">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Campus Pulse</h3>
              <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Institutional activity</h4>
           </header>

           <div className="space-y-8 py-6">
              <div className="space-y-1">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <BookOpen size={12} className="text-primary" /> Active Sessions
                 </p>
                 <span className="text-4xl font-black text-slate-900 dark:text-white">{stats.totalActiveSessions}</span>
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <Activity size={12} className="text-emerald-500" /> Students Present
                 </p>
                 <span className="text-4xl font-black text-slate-900 dark:text-white">{stats.totalPresentToday}</span>
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <TrendingUp size={12} className="text-rose-500" /> Avg Score
                 </p>
                 <span className="text-4xl font-black text-slate-900 dark:text-white">{stats.averageAttendancePercentage}%</span>
              </div>
           </div>

           <Button variant="outline" onClick={() => navigate('/attendance')} className="w-full h-14 rounded-xl border-slate-100 dark:border-slate-800 font-black text-[10px] uppercase tracking-widest gap-2">
              View My History <ChevronRight size={16} />
           </Button>
        </div>
      </section>

      {/* Navigation & Schedule */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div 
          onClick={() => navigate('/transport')}
          className="group premium-card p-10 hover:shadow-primary/10 transition-all duration-500 cursor-pointer border-none shadow-2xl shadow-slate-200/40 dark:shadow-none"
        >
          <div className="flex items-center gap-8">
             <div className="w-20 h-20 bg-slate-950 text-white rounded-xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                <Bus size={36} />
             </div>
             <div>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase group-hover:text-primary transition-colors">Transport Tracker</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3">Live Fleet Monitoring</p>
             </div>
          </div>
        </div>

        <div 
          onClick={() => navigate('/timetable')}
          className="group premium-card p-10 hover:shadow-primary/10 transition-all duration-500 cursor-pointer border-none shadow-2xl shadow-slate-200/40 dark:shadow-none"
        >
          <div className="flex items-center gap-8">
             <div className="w-20 h-20 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                <Calendar size={36} />
             </div>
             <div>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase group-hover:text-primary transition-colors">Course Schedule</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3">Weekly Academic Flow</p>
             </div>
          </div>
        </div>
      </section>

      {/* Next Lesson Intelligence */}
      <section className="space-y-10">
        <header className="px-2">
           <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-2 flex items-center gap-2">
             <Target size={14} className="text-primary" /> Active Learning Node
           </h3>
           <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">Upcoming Lesson</h2>
        </header>

        <div className="premium-card p-10 md:p-14 border-none shadow-2xl shadow-slate-200/40 dark:shadow-none grid grid-cols-1 md:grid-cols-2 items-center gap-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
          
          <div className="relative z-10 space-y-8">
             <div className="flex items-center gap-4">
                <Badge className="bg-slate-900 text-white border-none font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full">Next Class</Badge>
                <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest">
                   <Clock size={14} /> 10:00 AM START
                </div>
             </div>
             
             <div className="space-y-2">
                <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">{nextClass.subject}</h3>
                <p className="text-slate-500 font-medium text-lg">Instruction by <span className="text-slate-900 dark:text-white font-black uppercase text-base">{nextClass.teacher}</span></p>
             </div>

             <div className="flex items-center gap-3 bg-white dark:bg-slate-900 w-fit px-5 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <MapPin size={18} className="text-primary" />
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">{nextClass.room} Location</span>
             </div>
          </div>

          <div className="relative z-10 flex flex-col items-center md:items-end justify-center">
             <div className="w-48 h-48 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-8xl shadow-inner border border-slate-100 dark:border-slate-700">
                📚
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StudentDashboard;
