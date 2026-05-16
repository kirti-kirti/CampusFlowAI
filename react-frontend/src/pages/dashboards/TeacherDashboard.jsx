import React, { useContext, useEffect, useState } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  QrCode, 
  ChevronRight,
  Activity,
  ArrowRight,
  LayoutGrid,
  RefreshCw,
  BookOpen,
  Sparkles,
  Zap,
  CheckCircle2,
  PieChart,
  Target,
  Bell,
  Cpu
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import hierarchyService from '../../services/hierarchyService';
import attendanceService from '../../services/attendanceService';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
    const interval = setInterval(fetchStats, 30000);
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
      toast.success('System refreshed');
    } catch (err) {
      toast.error('Sync failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-32 px-6 pt-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-7xl mx-auto space-y-12">
      {/* Enterprise Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b border-slate-100 dark:border-slate-800 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-xl shadow-indigo-600/20">
                <Cpu className="text-white" size={24} />
             </div>
             <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Academic <span className="text-indigo-600 italic">Hub</span></h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Instructor Control Center</p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/10 rounded-full border border-emerald-100 dark:border-emerald-900/20">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Network Live</span>
          </div>
          <Button 
            onClick={handleSync}
            variant="outline"
            className="h-12 w-12 rounded-xl border-slate-200 dark:border-slate-800 text-slate-400 hover:text-indigo-600 transition-all"
          >
            <RefreshCw size={18} className={cn(loading && "animate-spin text-indigo-600")} />
          </Button>
        </div>
      </header>

      {/* Hero Analytics */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 premium-card bg-indigo-600 p-8 md:p-14 border-none shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px] -mr-48 -mt-48" />
          
          <div className="relative z-10 space-y-12 text-white">
            <header className="space-y-1 md:space-y-2">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight uppercase leading-none">Welcome, {user?.name?.split(' ')[0]}</h2>
              <p className="text-indigo-100/80 font-medium text-sm md:text-lg leading-tight">You have {assignments.length} educational nodes active today.</p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-10">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Attendance</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl md:text-6xl font-black tracking-tighter">{stats.averageAttendancePercentage}</span>
                  <span className="text-xl md:text-2xl font-black text-indigo-300 mb-1 md:mb-2">%</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Live Classes</p>
                <span className="text-4xl md:text-6xl font-black tracking-tighter">{stats.totalActiveSessions}</span>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">In Campus</p>
                <span className="text-4xl md:text-6xl font-black tracking-tighter">{stats.totalPresentToday}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div 
            onClick={() => navigate('/attendance')}
            className="premium-card p-8 flex items-center justify-between group cursor-pointer border-none shadow-2xl shadow-slate-200/40 dark:shadow-none hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                <QrCode size={28} />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white leading-none uppercase">Scanner</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Take Attendance</p>
              </div>
            </div>
            <ArrowRight size={20} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
          </div>

          <div 
            onClick={() => navigate('/timetable')}
            className="premium-card p-8 flex items-center justify-between group cursor-pointer border-none shadow-2xl shadow-slate-200/40 dark:shadow-none hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                <Calendar size={28} />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white leading-none uppercase">Schedule</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">View Timetable</p>
              </div>
            </div>
            <ArrowRight size={20} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </section>

      {/* Class Assignments Grid */}
      <section className="space-y-10">
        <header className="px-2 flex items-center justify-between">
           <div className="space-y-1">
             <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
               <Target size={14} className="text-indigo-600" /> Active Registry
             </h3>
             <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">Assigned Modules</h2>
           </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            [1, 2, 3].map(i => <div key={i} className="h-44 bg-slate-50 dark:bg-slate-900 rounded-xl animate-pulse shadow-sm" />)
          ) : assignments.length === 0 ? (
            <div className="md:col-span-2 lg:col-span-3 py-32 text-center premium-card border-dashed">
              <BookOpen size={48} className="mx-auto text-slate-200 mb-6" />
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">No assignments found</h3>
              <p className="text-slate-500 font-medium">Your teaching assignments will appear here once synchronized.</p>
            </div>
          ) : (
            assignments.map((sub) => (
              <div 
                key={sub.id}
                onClick={() => navigate('/attendance')}
                className="group premium-card p-10 hover:shadow-indigo-600/10 transition-all duration-500 cursor-pointer border-none shadow-2xl shadow-slate-200/40 dark:shadow-none"
              >
                <div className="flex flex-col h-full justify-between gap-10">
                  <div className="space-y-6">
                    <div className="w-16 h-16 bg-slate-950 rounded-xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                      <LayoutGrid size={32} className="text-white" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase group-hover:text-indigo-600 transition-colors">{sub.name}</h4>
                      <div className="flex items-center gap-3 mt-4">
                        <Badge variant="outline" className="text-slate-500 border-slate-200 uppercase tracking-widest text-[9px] font-black px-3 py-1 rounded-md">
                          {sub.classRoomName || 'Room Global'}
                        </Badge>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Batch A-1</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Class Open</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                       <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Intelligence & Reports */}
      <section 
        onClick={() => navigate('/attendance/report')}
        className="premium-card p-10 md:p-14 border-none shadow-2xl shadow-slate-200/40 dark:shadow-none flex flex-col md:flex-row items-center justify-between gap-10 cursor-pointer hover:shadow-indigo-600/5 transition-all group overflow-hidden relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="w-24 h-24 bg-slate-950 rounded-xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
            <PieChart className="text-indigo-400" size={48} />
          </div>
          <div className="text-center md:text-left space-y-3">
             <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">Analytical Reports</h3>
             <p className="text-slate-500 font-medium text-lg max-w-xl">Deep dive into class performance, student engagement metrics, and historical attendance trends.</p>
          </div>
        </div>
        
        <div className="w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 relative z-10">
           <ArrowRight size={36} />
        </div>
      </section>
    </div>
  );
};

export default TeacherDashboard;

