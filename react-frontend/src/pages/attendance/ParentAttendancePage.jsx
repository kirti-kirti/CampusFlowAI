import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  History, 
  Baby, 
  Target,
  BarChart3,
  CalendarCheck2,
  ChevronRight,
  ShieldCheck,
  User,
  Activity,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import attendanceService from '../../services/attendanceService';
import AttendanceCard from '../../components/attendance/AttendanceCard';

const ParentAttendancePage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await attendanceService.getParentHistory();
      setHistory(data);
    } catch (err) {
      toast.error('Could not load student attendance data');
    } finally {
      setLoading(false);
    }
  };

  const attendanceRate = history.length > 0 
    ? Math.round((history.filter(h => h.status === 'PRESENT').length / history.length) * 100) 
    : 0;

  return (
    <div className="pb-32 px-6 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Student Profile Banner */}
      <section className="mb-10 p-10 premium-card relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl opacity-60" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="relative mb-8">
            <div className="w-28 h-28 rounded-xl p-1 bg-gradient-to-tr from-indigo-500 to-primary shadow-2xl">
              <div className="w-full h-full rounded-[2.2rem] bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                <User className="text-slate-200 dark:text-slate-800" size={60} />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-xl border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-xl">
              <ShieldCheck className="text-white" size={18} />
            </div>
          </div>

          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">My Child's Attendance</h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-10 max-w-[240px]">Real-time updates on your child's presence in class.</p>

          <div className="flex items-center gap-16 w-full justify-center">
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Activity size={18} />
                <span className="text-3xl font-black">{attendanceRate}%</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attendance</span>
            </div>
            <div className="w-px h-10 bg-slate-100 dark:bg-slate-800" />
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <CalendarCheck2 size={18} />
                <span className="text-3xl font-black">{history.length}</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Classes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Reports Quick Link */}
      <section className="mb-10 p-8 bg-slate-900 text-white rounded-xl shadow-2xl relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/10 shadow-inner group-hover:scale-110 transition-transform">
              <BarChart3 className="text-white" size={32} />
            </div>
            <div>
              <h4 className="text-xl font-bold tracking-tight">Detailed Report</h4>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Subject-wise analytics</p>
            </div>
          </div>
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center group-hover:translate-x-2 transition-transform">
            <ArrowRight size={22} className="text-white" />
          </div>
        </div>
      </section>

      {/* Daily History Feed */}
      <section>
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-lg">
              <History className="text-white" size={20} />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Daily Attendance History</h3>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-slate-100 dark:bg-slate-900 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="py-24 text-center premium-card border-dashed">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="text-slate-400" size={32} />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">No records found</p>
            <p className="text-slate-400 text-sm mt-1">Updates will appear here as classes are marked.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {history.map((record) => (
              <AttendanceCard key={record.id} record={record} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ParentAttendancePage;

