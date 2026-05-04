import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  History, 
  Baby, 
  Target,
  BarChart3,
  CalendarCheck2,
  ChevronRight,
  ShieldCheck
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
      toast.error('Failed to sync ward data');
    } finally {
      setLoading(false);
    }
  };

  const attendanceRate = history.length > 0 
    ? Math.round((history.filter(h => h.status === 'PRESENT').length / history.length) * 100) 
    : 0;

  return (
    <div className="pb-32 px-4 pt-4 animate-in fade-in duration-700">
      {/* Child Profile Banner */}
      <section className="mb-10 p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-50" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-[2.5rem] border-4 border-white shadow-xl overflow-hidden bg-indigo-50 flex items-center justify-center">
              <Baby className="text-indigo-500" size={40} />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
              <ShieldCheck className="text-white" size={14} />
            </div>
          </div>

          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-1">Ward Identity</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Live Academic Tracking</p>

          <div className="grid grid-cols-3 gap-8 w-full max-w-xs mx-auto">
            <div className="flex flex-col items-center">
              <span className="text-lg font-black text-slate-900">{attendanceRate}%</span>
              <span className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em]">Presence</span>
            </div>
            <div className="w-px h-8 bg-slate-100 self-center" />
            <div className="flex flex-col items-center">
              <span className="text-lg font-black text-slate-900">{history.length}</span>
              <span className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Log</span>
            </div>
          </div>
        </div>
      </section>

      {/* Reports Quick Link */}
      <div className="bg-slate-900 p-6 rounded-[2.5rem] mb-10 flex items-center justify-between group cursor-pointer active:scale-95 transition-all shadow-xl shadow-slate-900/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
            <BarChart3 className="text-white" size={20} />
          </div>
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-tight">Full Performance Report</h4>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Subject-wise analytics</p>
          </div>
        </div>
        <ChevronRight className="text-slate-500 group-hover:text-white transition-colors" size={20} />
      </div>

      {/* Ward Activity Log */}
      <section>
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center">
              <History className="text-white" size={14} />
            </div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Ward Activity Log</h3>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 bg-slate-100 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
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
