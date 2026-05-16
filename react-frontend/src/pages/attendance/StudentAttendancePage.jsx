import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  Scan, 
  History, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Award,
  Sparkles,
  ArrowRight,
  Activity,
  Target
} from 'lucide-react';
import attendanceService from '../../services/attendanceService';
import QRScanner from '../../components/attendance/QRScanner';
import AttendanceCard from '../../components/attendance/AttendanceCard';

const StudentAttendancePage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [stats, setStats] = useState({ present: 0, percentage: 0 });
  const [classStats, setClassStats] = useState({ classAvg: 0, deptAvg: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await attendanceService.getStudentHistory();
      setHistory(data);
      
      const presentCount = data.filter(r => r.status === 'PRESENT').length;
      const percent = data.length > 0 ? (presentCount / data.length) * 100 : 0;
      setStats({ present: presentCount, percentage: Math.round(percent) });
    } catch (err) {
      toast.error('Could not sync attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (qrToken) => {
    setShowScanner(false);
    try {
      await attendanceService.markAttendance(qrToken);
      toast.success('Attendance marked successfully!');
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to mark attendance. Please try again.';
      toast.error(msg, {
        icon: <AlertCircle className="text-rose-500" />
      });
    }
  };

  return (
    <div className="pb-32 px-6 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Attendance Scanner Header */}
      <section className="mb-10 text-center premium-card p-10 relative overflow-hidden bg-slate-950 text-white border-none shadow-2xl">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-[60px]" />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center mb-6 border border-white/20 shadow-inner group">
            <Scan className="text-white group-hover:scale-110 transition-transform" size={36} strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-black mb-2 tracking-tight">Attendance Scanner</h1>
          <p className="text-slate-400 text-sm font-medium mb-10 max-w-xs">Scan the class QR code to mark your attendance for today's lesson.</p>
          
          <button 
            onClick={() => setShowScanner(true)}
            className="btn-premium group"
          >
            <Scan size={20} className="group-hover:rotate-90 transition-transform duration-500" />
            <span>Open Scanner</span>
            <ArrowRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Stats Summary */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-6 px-2">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            My Progress
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="stat-card p-8">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="text-emerald-500" size={24} />
            </div>
            <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.percentage}%</span>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Attendance</p>
          </div>
          <div className="stat-card p-8">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center mb-4">
              <Award className="text-indigo-500" size={24} />
            </div>
            <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.present}</span>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Days Present</p>
          </div>
        </div>
      </section>

      {/* Class Pulse Intelligence */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6 px-2">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
            <Activity size={14} className="text-primary" /> Class Attendance Pulse
          </h3>
        </div>
        <div className="premium-card p-10 md:p-12 border-none shadow-2xl shadow-slate-200/30 dark:shadow-none bg-slate-50 dark:bg-slate-900/50 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-6 w-full">
            <div className="space-y-2">
               <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Class Average (CS-3A)</span>
                  <span className="text-lg font-black text-primary">{classStats.classAvg}%</span>
               </div>
               <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.3)]" style={{ width: `${classStats.classAvg}%` }} />
               </div>
            </div>
            <div className="space-y-2">
               <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department Baseline</span>
                  <span className="text-lg font-black text-indigo-500">{classStats.deptAvg}%</span>
               </div>
               <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000 opacity-60" style={{ width: `${classStats.deptAvg}%` }} />
               </div>
            </div>
          </div>
          <div className="w-px h-16 bg-slate-200 dark:bg-slate-800 hidden md:block" />
          <div className="flex flex-col items-center gap-2 text-center shrink-0">
             <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-xl mb-2">
                <Target size={32} className="text-primary" />
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Sync Status:<br/><span className="text-emerald-500">Global Active</span></p>
          </div>
        </div>
      </section>

      {/* History Feed */}
      <section>
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-lg">
              <History className="text-white" size={20} />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Attendance History</h3>
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
              <AlertCircle className="text-slate-400" size={32} />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">No records found yet</p>
            <p className="text-slate-400 text-sm mt-1">Your attendance logs will appear here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {history.map((record) => (
              <AttendanceCard key={record.id} record={record} />
            ))}
          </div>
        )}
      </section>

      {showScanner && (
        <QRScanner 
          onScan={handleScan} 
          onClose={() => setShowScanner(false)} 
        />
      )}
    </div>
  );
};

export default StudentAttendancePage;

