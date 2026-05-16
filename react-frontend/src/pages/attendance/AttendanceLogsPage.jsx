import React, { useState, useEffect, useContext } from 'react';
import { 
  History, 
  ArrowLeft, 
  Search, 
  Filter, 
  Download, 
  Calendar,
  Sparkles,
  RefreshCw,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import attendanceService from '../../services/attendanceService';
import AttendanceCard from '../../components/attendance/AttendanceCard';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const AttendanceLogsPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await attendanceService.getAttendanceHistory();
      setLogs(data);
    } catch (err) {
      toast.error('Failed to retrieve attendance logs');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = (log.subject || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || log.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: filteredLogs.length,
    present: filteredLogs.filter(l => l.status === 'PRESENT').length,
    late: filteredLogs.filter(l => l.status === 'LATE').length,
    absent: filteredLogs.filter(l => l.status === 'ABSENT').length,
  };

  return (
    <div className="pb-32 px-6 pt-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-5xl mx-auto">
      {/* Header */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => navigate(-1)}
              variant="outline"
              className="w-12 h-12 rounded-xl border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-primary transition-all"
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">
              <History size={12} /> Audit Trail
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-none uppercase">Attendance <span className="text-primary italic">Logs</span></h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">A complete history of your academic presence and verification logs.</p>
        </div>
        
        <div className="flex gap-4">
          <Button 
            onClick={fetchLogs}
            variant="outline"
            className="h-14 w-14 rounded-xl border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-primary transition-all"
          >
            <RefreshCw size={22} className={cn(loading && "animate-spin text-primary")} />
          </Button>
          <Button className="btn-premium h-14 px-8 !rounded-xl gap-3 shadow-2xl">
            <Download size={20} />
            <span>Export CSV</span>
          </Button>
        </div>
      </header>

      {/* Summary Matrix */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total', value: stats.total, color: 'text-primary', bg: 'bg-primary/5', icon: FileSpreadsheet },
          { label: 'Present', value: stats.present, color: 'text-emerald-500', bg: 'bg-emerald-500/5', icon: CheckCircle2 },
          { label: 'Late', value: stats.late, color: 'text-amber-500', bg: 'bg-amber-500/5', icon: AlertCircle },
          { label: 'Absent', value: stats.absent, color: 'text-rose-500', bg: 'bg-rose-500/5', icon: XCircle },
        ].map((stat, idx) => (
          <div key={idx} className={cn("p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center gap-2", stat.bg)}>
            <stat.icon size={20} className={stat.color} />
            <span className={cn("text-3xl font-black tracking-tighter", stat.color)}>{stat.value}</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
          </div>
        ))}
      </section>

      {/* Search & Filters */}
      <section className="mb-10 space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search by subject name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-16 pl-16 pr-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-base font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-primary/10 transition-all outline-none"
            />
          </div>
          <div className="flex gap-2">
            {['ALL', 'PRESENT', 'LATE', 'ABSENT'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={cn(
                  "px-6 h-16 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                  filterStatus === status 
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-primary dark:border-primary' 
                    : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-primary/30'
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="space-y-6">
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-slate-100 dark:bg-slate-900 rounded-2xl animate-pulse shadow-sm" />
            ))}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-24 text-center premium-card border-dashed flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300">
              <FileSpreadsheet size={40} />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No records matched</p>
              <p className="text-sm font-medium text-slate-400 mt-1">Try adjusting your search or status filters.</p>
            </div>
            <Button variant="outline" onClick={() => {setSearchTerm(''); setFilterStatus('ALL')}}>Clear Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredLogs.map((log) => (
              <AttendanceCard key={log.id} record={log} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AttendanceLogsPage;
