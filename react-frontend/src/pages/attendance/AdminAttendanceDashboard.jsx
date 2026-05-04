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
  ArrowLeft
} from 'lucide-react';
import attendanceService from '../../services/attendanceService';
import hierarchyService from '../../services/hierarchyService';
import ReportChart from '../../components/attendance/ReportChart';
import AttendanceCard from '../../components/attendance/AttendanceCard';

import { useNavigate } from 'react-router-dom';

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
          // Aggregate class percentage
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

  // Mock data for charts until report API is live
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
    <div className="pb-32 px-4 pt-4 animate-in fade-in duration-700">
      {/* Global Intelligence Header */}
      <section className="mb-10">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 active:scale-90 transition-all shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">Institutional Pulse</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Attendance Intelligence</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Logs</span>
            <span className="text-xl font-black text-slate-900">{stats.totalPresentToday}</span>
          </div>
          <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Active Classes</span>
            <span className="text-xl font-black text-slate-900">{stats.totalActiveSessions}</span>
          </div>
          <div className="bg-slate-900 p-5 rounded-[2rem] shadow-lg shadow-slate-900/10">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Avg. Rate</span>
            <span className="text-xl font-black text-white">{stats.averageAttendancePercentage}%</span>
          </div>
        </div>
      </section>

      {/* Class-Wise Intelligence */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center">
              <School className="text-indigo-500" size={16} />
            </div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Academic Flow Reports</h3>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {departments.map(dept => (
              <button
                key={dept.id}
                onClick={() => handleDeptSelect(dept.id)}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  selectedDept === dept.id 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'bg-white border border-slate-100 text-slate-400'
                }`}
              >
                {dept.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportsLoading ? (
            [1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-3xl animate-pulse" />)
          ) : classReports.length === 0 ? (
            <div className="col-span-full py-10 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              No classes found in this department
            </div>
          ) : (
            classReports.map(cls => (
              <div key={cls.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                <div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{cls.name}</h4>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Class Code: CF-{cls.id}</p>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-black ${cls.avgPct >= 75 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {Math.round(cls.avgPct)}%
                  </span>
                  <div className="flex items-center gap-1 justify-end mt-1">
                    <Users size={10} className="text-slate-300" />
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Live Flow</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
      <section className="mb-10 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center">
              <ArrowUpRight className="text-indigo-500" size={16} />
            </div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Weekly Engagement</h3>
          </div>
          <button className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1">
            Full Report <Download size={12} />
          </button>
        </div>
        <ReportChart data={chartData} />
      </section>

      {/* Advanced Filter & Search */}
      <div className="mb-8 flex gap-2">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 pl-14 pr-6 rounded-2xl bg-white border border-slate-100 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none"
          />
        </div>
        <button className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-primary transition-all active:scale-90">
          <Filter size={18} />
        </button>
      </div>

      {/* System-Wide History */}
      <section>
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center">
              <FileSpreadsheet className="text-white" size={14} />
            </div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Master Record Log</h3>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 bg-slate-100 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
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
