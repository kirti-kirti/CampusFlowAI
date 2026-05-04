import React, { useContext, useEffect, useState } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  QrCode, 
  ChevronRight,
  TrendingUp,
  Activity,
  ArrowRight,
  LayoutGrid,
  RefreshCw,
  BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import hierarchyService from '../../services/hierarchyService';
import attendanceService from '../../services/attendanceService';

const TeacherDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState({
    totalPresentToday: 0,
    totalActiveSessions: 0,
    averageAttendancePercentage: 0,
    totalStudents: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    fetchStats();
    
    // Real-time polling every 10 seconds
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await hierarchyService.getMySubjects();
      setAssignments(data);
    } catch (err) {
      console.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await attendanceService.getStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load stats");
    }
  };

  const handleSync = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchData(), fetchStats()]);
      toast.success('Real-time sync complete');
    } catch (err) {
      toast.error('Sync failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-32 px-4 pt-4 animate-in fade-in duration-1000">
      {/* Welcome Banner */}
      <section className="mb-10 p-10 rounded-[3rem] bg-indigo-600 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-2 uppercase tracking-tight">Faculty Portal</h1>
          <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest opacity-80">
            {user?.name || 'Academic Mentor'} • Identity CF{user?.id || 'X'}
          </p>
        </div>
      </section>

      {/* Real-time Pulse */}
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

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div 
          onClick={() => navigate('/attendance')}
          className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center group cursor-pointer hover:shadow-xl transition-all"
        >
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <QrCode size={28} />
          </div>
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Terminal</h4>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Take Attendance</p>
        </div>
        <div 
          onClick={() => navigate('/timetable')}
          className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center group cursor-pointer hover:shadow-xl transition-all"
        >
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Calendar size={28} />
          </div>
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Agenda</h4>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">View Timetable</p>
        </div>
      </div>

      <div 
        onClick={() => navigate('/attendance/scanner')}
        className="mb-10 bg-slate-100/50 border border-dashed border-slate-200 p-6 rounded-[2rem] flex items-center justify-between group cursor-pointer hover:bg-slate-100 transition-all"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <Activity className="text-rose-500" size={20} />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">Central Scanner Mode</h4>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Kiosk verification system</p>
          </div>
        </div>
        <ArrowRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
      </div>

      {/* Assigned Classes */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-6 px-2">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Current Assignments</h3>
          <button 
            onClick={handleSync} 
            className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1 active:scale-90 transition-all"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Sync
          </button>
        </div>

        <div className="space-y-4">
          {loading ? (
            [1, 2].map(i => <div key={i} className="h-24 bg-slate-100 rounded-3xl animate-pulse" />)
          ) : assignments.length === 0 ? (
            <div className="py-12 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
              <BookOpen size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No subjects assigned yet</p>
            </div>
          ) : (
            assignments.map((sub) => (
              <div 
                key={sub.id}
                onClick={() => navigate('/attendance')}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                    <LayoutGrid size={22} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 uppercase tracking-tight">{sub.name}</h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{sub.classRoomName || `CLASS ${sub.classRoomId}`}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end mb-1">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">ACTIVE</span>
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <Users size={12} className="text-slate-300" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ROSTER SYNCED</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Analytics Insight */}
      <section 
        onClick={() => navigate('/attendance/report')}
        className="bg-slate-900 p-8 rounded-[3rem] text-white flex items-center justify-between shadow-xl cursor-pointer group hover:bg-slate-800 transition-all"
      >
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <TrendingUp className="text-indigo-400" size={28} />
          </div>
          <div>
            <h4 className="text-lg font-black uppercase tracking-tight">Insight Pulse</h4>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              Engagement is at {stats.averageAttendancePercentage}% • View Reports
            </p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-all">
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </section>
    </div>
  );
};

export default TeacherDashboard;
