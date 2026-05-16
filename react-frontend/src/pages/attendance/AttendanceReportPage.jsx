import React, { useState, useEffect, useContext } from 'react';
import { 
  FileText, 
  ArrowLeft, 
  Download, 
  PieChart as PieChartIcon, 
  BarChart2,
  Calendar,
  Layers,
  Award,
  ChevronDown,
  Users,
  Sparkles,
  TrendingUp,
  LayoutGrid,
  Target,
  Search,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReportChart from '../../components/attendance/ReportChart';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import attendanceService from '../../services/attendanceService';
import hierarchyService from '../../services/hierarchyService';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const AttendanceReportPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState(user?.role === 'TEACHER' ? 'class' : 'student');
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [classReports, setClassReports] = useState([]);
  const [myClasses, setMyClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);

  useEffect(() => {
    if (user?.role === 'TEACHER') {
      fetchTeacherData();
    } else {
      fetchStudentReport();
    }
  }, []);

  const fetchTeacherData = async () => {
    try {
      const classes = await hierarchyService.getMySubjects();
      setMyClasses(classes);
      if (classes.length > 0) {
        setSelectedClassId(classes[0].classRoomId);
        fetchClassReport(classes[0].classRoomId);
      } else {
        setLoading(false);
      }
    } catch (err) {
      toast.error('Failed to load classes');
      setLoading(false);
    }
  };

  const fetchStudentReport = async () => {
    try {
      const data = await attendanceService.getReport();
      setReport(data);
    } catch (err) {
      toast.error('Failed to sync intelligence report');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassReport = async (classId) => {
    setLoading(true);
    try {
      const data = await attendanceService.getClassReport(classId);
      setClassReports(data);
    } catch (err) {
      toast.error('Failed to load class report');
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClassId(classId);
    fetchClassReport(classId);
  };

  const studentData = report?.subjectBreakdown?.map(s => ({
    name: s.subject,
    value: Math.round(s.percentage),
    color: '#6366f1'
  })) || [];

  const pieData = report ? [
    { name: 'Present', value: Math.round((report.present / report.totalSessions) * 100) || 0, color: '#10b981' },
    { name: 'Late', value: Math.round((report.late / report.totalSessions) * 100) || 0, color: '#f59e0b' },
    { name: 'Absent', value: Math.round((report.absent / report.totalSessions) * 100) || 0, color: '#ef4444' },
  ] : [];

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
              <TrendingUp size={12} /> Analytical Intelligence
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-none mt-4 uppercase">Analytics <span className="text-primary italic">Report</span></h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Performance auditing and curriculum engagement metrics.</p>
        </div>
        
        <Button className="btn-premium h-14 px-8 !rounded-xl gap-3 shadow-2xl">
          <Download size={20} />
          <span>Export Intelligence</span>
        </Button>
      </header>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/40 dark:shadow-none flex gap-2 mb-12">
        <button 
          onClick={() => setActiveTab('student')}
          className={cn(
            "flex-1 py-5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
            activeTab === 'student' ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          )}
        >
          Individual Profile
        </button>
        <button 
          onClick={() => setActiveTab('class')}
          className={cn(
            "flex-1 py-5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
            activeTab === 'class' ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          )}
        >
          Institutional / Class
        </button>
      </div>

      {activeTab === 'student' ? (
        <div className="space-y-12">
          {/* Summary Hero Card */}
          <section className="relative overflow-hidden rounded-xl bg-slate-950 p-10 md:p-14 text-white shadow-2xl border border-white/5 group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[60px] -ml-16 -mb-16" />
            
            {loading ? (
              <div className="h-40 flex flex-col items-center justify-center gap-4">
                <RefreshCw size={48} className="animate-spin text-primary" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Syncing Intelligence...</p>
              </div>
            ) : (
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-white border-white/20 uppercase tracking-[0.2em] font-black text-[9px] px-3 py-1">
                      {report?.percentage >= 90 ? 'Tier: S-Class' : report?.percentage >= 75 ? 'Tier: Optimal' : 'Tier: Review Required'}
                    </Badge>
                  </div>
                  <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-none uppercase">
                    {report?.percentage >= 90 ? 'Excellence' : report?.percentage >= 75 ? 'Sustained' : 'Deficit'}
                  </h2>
                  <div className="flex items-center gap-4 text-slate-400">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                       <Award size={20} className="text-primary" />
                    </div>
                    <p className="text-lg font-medium">
                      {report?.percentage >= 75 ? 'Attendance pattern exceeds institutional benchmarks.' : 'Below institutional minimum. Auditor intervention suggested.'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-8xl md:text-9xl font-black text-white/95 tracking-tighter leading-none">{Math.round(report?.percentage || 0)}<span className="text-2xl md:text-4xl text-primary font-black">%</span></span>
                </div>
              </div>
            )}
          </section>

          {/* Visualization Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Subject Matrix */}
            <section className="lg:col-span-2 premium-card p-10 md:p-12 border-none shadow-2xl shadow-slate-200/40 dark:shadow-none">
              <header className="flex items-center gap-4 mb-12">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl flex items-center justify-center">
                  <BarChart2 className="text-indigo-500" size={24} />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Curriculum Engagement</h3>
              </header>
              <div className="h-[400px]">
                {loading ? <div className="h-full w-full bg-slate-50 dark:bg-slate-800 rounded-xl animate-pulse" /> : <ReportChart data={studentData} />}
              </div>
            </section>

            {/* Status Distribution */}
            <section className="premium-card p-10 md:p-12 border-none shadow-2xl shadow-slate-200/40 dark:shadow-none flex flex-col items-center">
              <header className="flex items-center gap-4 mb-12 w-full">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl flex items-center justify-center">
                  <PieChartIcon className="text-emerald-500" size={24} />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Status Split</h3>
              </header>
              
              {loading ? (
                <div className="w-64 h-64 bg-slate-50 dark:bg-slate-800 rounded-full animate-pulse" />
              ) : (
                <div className="flex flex-col items-center gap-12 w-full">
                  <div className="h-64 w-64">
                    <ReportChart data={pieData} type="pie" />
                  </div>
                  <div className="grid grid-cols-3 gap-6 w-full">
                    {pieData.map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center text-center group">
                        <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter group-hover:text-primary transition-colors">{item.value}%</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Raw Metrics */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="premium-card p-10 border-none shadow-2xl shadow-slate-200/40 dark:shadow-none flex items-center gap-8 group">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-xl shadow-slate-100/50 dark:shadow-none group-hover:scale-110 transition-transform">
                <Calendar className="text-primary" size={36} />
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Global Audit Period</p>
                <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{report?.totalSessions || 0} Total Sessions</h4>
              </div>
            </div>
            <div className="premium-card p-10 border-none shadow-2xl shadow-slate-200/40 dark:shadow-none flex items-center gap-8 group">
              <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl flex items-center justify-center shadow-xl shadow-emerald-100/50 dark:shadow-none group-hover:scale-110 transition-transform">
                <Target className="text-emerald-500" size={36} />
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated Logs</p>
                <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{report?.attendedSessions || 0} Valid Log-ins</h4>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700">
          {/* Class Controller */}
          <section className="premium-card p-10 md:p-14 border-none shadow-2xl shadow-slate-200/40 dark:shadow-none flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="flex items-center gap-8">
              <div className="w-20 h-20 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-xl shadow-primary/5">
                <Users size={40} />
              </div>
              <div>
                <h3 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none mb-3">Auditor Node</h3>
                <p className="text-lg font-medium text-slate-500 dark:text-slate-400">Select target class for institutional performance audit.</p>
              </div>
            </div>
            
            <div className="relative w-full lg:w-96 group">
               <LayoutGrid className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
               <select 
                value={selectedClassId || ''} 
                onChange={handleClassChange}
                className="w-full h-18 pl-16 pr-8 bg-slate-100/50 dark:bg-slate-800/50 border-none rounded-xl text-lg font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 appearance-none cursor-pointer"
              >
                {myClasses.map(c => (
                  <option key={c.classRoomId} value={c.classRoomId}>{c.classRoomName} - {c.name}</option>
                ))}
              </select>
            </div>
          </section>

          {/* Matrix Table */}
          <section className="premium-card overflow-hidden border-none shadow-2xl shadow-slate-200/40 dark:shadow-none">
            <header className="p-10 md:p-12 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center text-white">
                   <FileText size={20} />
                 </div>
                 <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none">Performance Matrix</h3>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                 <div className="relative flex-1 md:w-64 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" placeholder="Filter node ID..." className="w-full h-12 pl-12 pr-6 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl border-none text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none" />
                 </div>
                 <Badge className="h-12 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 border-none font-black text-[10px] tracking-widest">LIVE DATA</Badge>
              </div>
            </header>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Scholar Node ID</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Global Sessions</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Authenticated</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Audit Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {loading ? (
                    [1,2,3,4,5].map(i => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan="4" className="px-10 py-8"><div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-lg w-full" /></td>
                      </tr>
                    ))
                  ) : classReports.length > 0 ? (
                    classReports.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all group">
                        <td className="px-10 py-8">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500">#{idx+1}</div>
                              <span className="text-lg font-black text-slate-900 dark:text-white">ID: CF-{row.studentId}</span>
                           </div>
                        </td>
                        <td className="px-10 py-8 text-center text-lg font-bold text-slate-500">{row.totalSessions}</td>
                        <td className="px-10 py-8 text-center text-lg font-black text-emerald-500">{row.attendedSessions}</td>
                        <td className="px-10 py-8 text-right">
                          <span className={cn(
                            "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xl font-black tracking-tighter",
                            row.percentage >= 75 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600'
                          )}>
                            {row.percentage}% <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-10 py-32 text-center">
                        <div className="text-4xl mb-4">📂</div>
                        <p className="text-lg font-black text-slate-400 uppercase tracking-widest">No Intelligence Data Found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default AttendanceReportPage;
