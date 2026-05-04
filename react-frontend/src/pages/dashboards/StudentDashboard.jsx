import React, { useContext, useEffect, useState } from 'react';
import { 
  History, 
  Calendar, 
  Scan, 
  ChevronRight,
  TrendingUp,
  Activity,
  ArrowRight,
  LayoutGrid,
  Bell,
  Bus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import attendanceService from '../../services/attendanceService';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPresentToday: 0,
    totalActiveSessions: 0,
    averageAttendancePercentage: 0,
    totalStudents: 0
  });

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const data = await attendanceService.getStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load stats");
    }
  };

  const nextClass = {
    subject: 'Distributed Systems',
    time: '10:00 AM',
    room: 'Hall-4',
    teacher: 'Prof. Turing'
  };

  return (
    <div className="pb-32 px-4 pt-4 animate-in fade-in duration-1000">
      {/* Dynamic Header */}
      <section className="mb-10 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Academic Tier</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">
            Hello, <span className="text-primary">{user?.name?.split(' ')[0] || 'Scholar'}</span>
          </h1>
        </div>
        <button 
          onClick={() => navigate('/notifications')}
          className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 shadow-sm relative active:scale-90 transition-all"
        >
          <Bell size={20} />
          <div className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
        </button>
      </section>

      {/* Main Action Card */}
      <section 
        onClick={() => navigate('/attendance')}
        className="mb-10 p-8 rounded-[3rem] bg-slate-900 text-white shadow-2xl relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-50" />
        <div className="relative z-10 flex justify-between items-center">
          <div className="space-y-4">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
              <Scan size={28} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight">Identity Terminal</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Mark your presence via QR</p>
            </div>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
             <ArrowRight size={24} className="text-primary" />
          </div>
        </div>
      </section>

      {/* Campus Pulse */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Live Campus Pulse</h3>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Live Updates</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
            <span className="text-2xl font-black text-indigo-600 mb-1">{stats.totalActiveSessions}</span>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active Rooms</p>
          </div>
          <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
            <span className="text-2xl font-black text-emerald-600 mb-1">{stats.totalPresentToday}</span>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Present Today</p>
          </div>
          <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
            <span className="text-2xl font-black text-rose-600 mb-1">{stats.averageAttendancePercentage}%</span>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Avg. Engagement</p>
          </div>
        </div>
      </section>
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div 
          onClick={() => navigate('/transport')}
          className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center group cursor-pointer hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-3">
            <Bus size={22} />
          </div>
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">Fleet Tracking</h4>
        </div>
        <div 
          onClick={() => navigate('/attendance')}
          className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center group cursor-pointer hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-3">
            <Activity size={22} />
          </div>
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">Report Log</h4>
        </div>
      </div>

      {/* Upcoming Session Highlight */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-6 px-2">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Next Protocol</h3>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-full bg-slate-50 flex items-center justify-center">
            <ChevronRight className="text-slate-200" size={32} />
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest">Ongoing</span>
              <span className="text-xs font-black text-slate-900">{nextClass.time}</span>
            </div>
            <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">{nextClass.subject}</h4>
            <div className="flex items-center gap-4 text-slate-400">
              <div className="flex items-center gap-1">
                <LayoutGrid size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">{nextClass.room}</span>
              </div>
              <div className="flex items-center gap-1">
                <Activity size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">{nextClass.teacher}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StudentDashboard;
