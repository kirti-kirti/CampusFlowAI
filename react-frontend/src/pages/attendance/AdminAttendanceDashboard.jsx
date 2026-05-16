import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  BarChart3, 
  Users, 
  School,
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  ArrowUpRight,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  TrendingUp,
  Activity,
  Calendar,
  LayoutGrid,
  ArrowRight
} from 'lucide-react';
import attendanceService from '../../services/attendanceService';
import hierarchyService from '../../services/hierarchyService';
import ReportChart from '../../components/attendance/ReportChart';
import AttendanceCard from '../../components/attendance/AttendanceCard';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const AdminAttendanceDashboard = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [classReports, setClassReports] = useState([]);
  const [stats, setStats] = useState({
    totalPresentToday: 0,
    totalActiveSessions: 0,
    averageAttendancePercentage: 0,
    totalStudents: 0
  });
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
    fetchDepartments();
    fetchStats();
    
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const data = await attendanceService.getAllAttendance();
      setHistory(data);
    } catch (err) {
      toast.error('Global data sync failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await attendanceService.getStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats");
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await hierarchyService.getDepartments();
      setDepartments(data);
      if (data.length > 0) {
        handleDeptSelect(data[0].id);
      }
    } catch (err) {
      console.error("Failed to load departments");
    }
  };

  const handleDeptSelect = async (deptId) => {
    setSelectedDept(deptId);
    setReportsLoading(true);
    try {
      const classes = await hierarchyService.getClasses(deptId);
      const reports = await Promise.all(
        classes.map(async (cls) => {
          const report = await attendanceService.getClassReport(cls.id);
          const avgPct = report.length > 0 
            ? report.reduce((acc, curr) => acc + curr.percentage, 0) / report.length 
            : 0;
          return { ...cls, avgPct };
        })
      );
      setClassReports(reports);
    } catch (err) {
      toast.error('Failed to load class intelligence');
    } finally {
      setReportsLoading(false);
    }
  };

  const chartData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => {
    const count = history.filter(h => {
      const d = new Date(h.timestamp);
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
      return dayName === day;
    }).length;
    return { name: day, value: count, color: '#6366f1' };
  });

  const filteredHistory = history.filter(h => 
    h.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pb-32 px-6 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => navigate(-1)}
              variant="outline"
              className="w-12 h-12 rounded-xl border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm"
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">
              <Sparkles size={12} /> Institutional Intelligence
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-none mt-4 uppercase">Institutional <span className="text-primary italic">Pulse</span></h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Real-time attendance metrics across the academic ecosystem.</p>
        </div>
        
        <div className="flex gap-4">
          <Button 
            onClick={fetchStats}
            variant="outline"
            className="h-14 w-14 rounded-xl border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-primary transition-all"
          >
            <RefreshCw size={22} className={cn(loading && "animate-spin text-primary")} />
          </Button>
          <Button className="btn-premium h-14 px-8 !rounded-xl gap-3 shadow-2xl">
            <Download size={20} />
            <span>Export Registry</span>
          </Button>
        </div>
      </header>

      {/* Global Metrics Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="premium-card p-10 flex flex-col justify-between border-none shadow-2xl shadow-slate-200/40 dark:shadow-none">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-500 rounded-xl flex items-center justify-center mb-8 shadow-inner shadow-indigo-100 dark:shadow-none">
             <Activity size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Live Registry Logs</p>
            <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{stats.totalPresentToday}</h2>
          </div>
        </div>

        <div className="premium-card p-10 flex flex-col justify-between border-none shadow-2xl shadow-slate-200/40 dark:shadow-none">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-500 rounded-xl flex items-center justify-center mb-8 shadow-inner shadow-emerald-100 dark:shadow-none">
             <Users size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Active Class Flow</p>
            <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{stats.totalActiveSessions}</h2>
          </div>
        </div>

        <div className="premium-card p-10 flex flex-col justify-between bg-slate-950 border-none shadow-2xl shadow-slate-200/40 dark:shadow-none relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] -mr-16 -mt-16" />
          <div className="w-16 h-16 bg-white/5 text-primary rounded-xl flex items-center justify-center mb-8 border border-white/10">
             <TrendingUp size={32} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Aggregate Success Rate</p>
            <h2 className="text-5xl font-black text-white tracking-tighter">{stats.averageAttendancePercentage}%</h2>
          </div>
        </div>
      </section>

      {/* Class Intelligence Explorer */}
      <section className="mb-16">
        <header className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10 px-2">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl flex items-center justify-center">
              <LayoutGrid className="text-indigo-500" size={20} />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Academic Performance Breakdown</h3>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto scrollbar-hide">
            {departments.map(dept => (
              <button
                key={dept.id}
                onClick={() => handleDeptSelect(dept.id)}
                className={cn(
                  "px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  selectedDept === dept.id 
                    ? 'bg-primary text-white shadow-xl shadow-primary/30' 
                    : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-primary'
                )}
              >
                {dept.name}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reportsLoading ? (
            [1, 2, 3].map(i => <div key={i} className="h-32 bg-white dark:bg-slate-900 rounded-xl animate-pulse shadow-sm" />)
          ) : classReports.length === 0 ? (
            <div className="col-span-full py-20 text-center premium-card border-dashed">
              <div className="text-4xl mb-4">🏫</div>
              <h4 className="text-xl font-black text-slate-400 uppercase tracking-widest">No classes in this department</h4>
            </div>
          ) : (
            classReports.map(cls => (
              <div key={cls.id} className="group premium-card p-8 hover:shadow-primary/5 transition-all duration-500 flex items-center justify-between border-none shadow-2xl shadow-slate-200/40 dark:shadow-none">
                <div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary transition-colors">{cls.name}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Class ID: CFD-{cls.id}</p>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "text-3xl font-black tracking-tighter leading-none",
                    cls.avgPct >= 75 ? 'text-emerald-500' : 'text-rose-500'
                  )}>
                    {Math.round(cls.avgPct)}%
                  </span>
                  <div className="flex items-center gap-1 justify-end mt-2">
                    <Users size={12} className="text-slate-300" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Live Load</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Engagement Analytics Chart */}
      <section className="mb-16 premium-card p-10 md:p-14 border-none shadow-2xl shadow-slate-200/40 dark:shadow-none">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-indigo-500" size={24} />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Engagement Cycle</h3>
          </div>
          <Button variant="outline" className="text-[10px] font-black uppercase tracking-widest gap-2 rounded-xl border-slate-200 dark:border-slate-800">
            Export Analytics <Download size={16} />
          </Button>
        </header>
        <div className="h-[400px] w-full">
          <ReportChart data={chartData} />
        </div>
      </section>

      {/* Search & Global Logs */}
      <section className="space-y-10">
        <header className="flex items-center justify-between px-2">
           <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center text-white">
                <FileSpreadsheet size={20} />
             </div>
             <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Master Registry Log</h3>
           </div>
        </header>

        <div className="flex gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={22} />
            <input 
              type="text" 
              placeholder="Filter by subject, scholar, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-18 pl-16 pr-8 rounded-xl bg-white dark:bg-slate-900 border-none text-lg font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-primary/10 transition-all outline-none shadow-2xl shadow-slate-200/40 dark:shadow-none placeholder:text-slate-400"
            />
          </div>
          <Button variant="outline" className="h-18 w-18 !rounded-xl border-slate-200 dark:border-slate-800 text-slate-400 hover:text-primary shadow-sm">
            <Filter size={24} />
          </Button>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-white dark:bg-slate-900 rounded-xl animate-pulse shadow-sm" />
            ))}
          </div>
        ) : filteredHistory.length === 0 ? (
           <div className="py-24 text-center premium-card border-dashed">
            <p className="text-xl font-black text-slate-400 uppercase tracking-widest">No matching records found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredHistory.map((record) => (
              <AttendanceCard key={record.id} record={record} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminAttendanceDashboard;

