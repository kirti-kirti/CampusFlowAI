import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  Scan, 
  History, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Award
} from 'lucide-react';
import attendanceService from '../../services/attendanceService';
import QRScanner from '../../components/attendance/QRScanner';
import AttendanceCard from '../../components/attendance/AttendanceCard';

const StudentAttendancePage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [stats, setStats] = useState({ present: 0, percentage: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await attendanceService.getStudentHistory();
      setHistory(data);
      
      // Calculate mini-stats
      const presentCount = data.filter(r => r.status === 'PRESENT').length;
      const percent = data.length > 0 ? (presentCount / data.length) * 100 : 0;
      setStats({ present: presentCount, percentage: Math.round(percent) });
    } catch (err) {
      toast.error('Sync failed');
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (qrToken) => {
    setShowScanner(false);
    try {
      await attendanceService.markAttendance(qrToken);
      toast.success('Identity Verified! Attendance Marked.');
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Identity verification failed. Please try again.';
      toast.error(msg, {
        icon: <AlertCircle className="text-rose-500" />
      });
    }
  };

  return (
    <div className="pb-32 px-4 pt-4 animate-in fade-in duration-700">
      {/* Identity Terminal Section */}
      <section className="mb-10 text-center relative py-12 px-6 rounded-[3rem] bg-slate-900 overflow-hidden shadow-2xl shadow-slate-900/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center mb-6 border border-white/10">
            <Scan className="text-white" size={32} strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Identity Terminal</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">Mark your presence via QR</p>
          
          <button 
            onClick={() => setShowScanner(true)}
            className="group relative px-8 py-4 bg-primary rounded-2xl flex items-center gap-3 active:scale-95 transition-all shadow-xl shadow-primary/40 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <Scan size={18} className="text-white relative z-10" />
            <span className="text-xs font-black text-white uppercase tracking-widest relative z-10">Scan Terminal QR</span>
          </button>
        </div>
      </section>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex flex-col items-center shadow-sm">
          <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center mb-3">
            <TrendingUp className="text-emerald-500" size={18} />
          </div>
          <span className="text-[20px] font-black text-slate-900">{stats.percentage}%</span>
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Attendance</span>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex flex-col items-center shadow-sm">
          <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center mb-3">
            <Award className="text-indigo-500" size={18} />
          </div>
          <span className="text-[20px] font-black text-slate-900">{stats.present}</span>
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Verified Days</span>
        </div>
      </div>

      {/* History Feed */}
      <section>
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center">
              <History className="text-white" size={14} />
            </div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Activity History</h3>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 bg-slate-100 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="text-slate-400" size={24} />
            </div>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-tight">No records found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
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
