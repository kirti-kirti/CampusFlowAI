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
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReportChart from '../../components/attendance/ReportChart';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import attendanceService from '../../services/attendanceService';
import hierarchyService from '../../services/hierarchyService';

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
    <div className="pb-32 px-4 pt-4 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 active:scale-90 transition-all shadow-sm"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-sm font-black uppercase tracking-[0.3em] text-slate-900">Analytics Report</h1>
        <button className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white active:scale-90 transition-all shadow-lg">
          <Download size={18} />
        </button>
      </div>

      {/* Report Selector Tabs */}
      <div className="bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm flex gap-2 mb-10">
        <button 
          onClick={() => setActiveTab('student')}
          className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'student' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-slate-50'
          }`}
        >
          Individual
        </button>
        <button 
          onClick={() => setActiveTab('class')}
          className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'class' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-slate-50'
          }`}
        >
          Class-Wise
        </button>
      </div>

      {activeTab === 'student' ? (
        <>
          {/* Summary Highlight */}
          <section className="mb-10 p-8 rounded-[3rem] bg-slate-900 relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2" />
            
            {loading ? (
              <div className="h-24 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            ) : (
              <div className="flex justify-between items-end">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-indigo-400">
                    <Award size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Performance Tier</span>
                  </div>
                  <h2 className="text-4xl font-black tracking-tight">
                    {report?.percentage >= 90 ? 'Grade A+' : report?.percentage >= 75 ? 'Grade A' : 'Grade B'}
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                    {report?.percentage >= 75 ? 'Consistent Attendance Pattern' : 'Needs Improvement'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-5xl font-black text-white/90">{Math.round(report?.percentage || 0)}<span className="text-xl text-primary">%</span></span>
                </div>
              </div>
            )}
          </section>

          {/* Subject-wise Analytics */}
          <section className="mb-10 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center">
                <BarChart2 className="text-indigo-500" size={16} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Module Engagement</h3>
            </div>
            {loading ? <div className="h-64 bg-slate-50 rounded-3xl animate-pulse" /> : <ReportChart data={studentData} />}
          </section>

          {/* Distribution Pie Chart */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center">
              <div className="flex items-center gap-3 mb-6 w-full">
                <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <PieChartIcon className="text-emerald-500" size={16} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Status Split</h3>
              </div>
              {loading ? (
                <div className="w-48 h-48 bg-slate-50 rounded-full animate-pulse" />
              ) : (
                <>
                  <ReportChart data={pieData} type="pie" />
                  <div className="grid grid-cols-3 gap-4 w-full mt-6">
                    {pieData.map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-slate-900">{item.value}%</span>
                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Detailed Stats Cards */}
            <div className="space-y-4">
              <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Calendar className="text-indigo-500" size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Total Sessions</p>
                    <p className="text-lg font-black text-slate-900">{report?.totalSessions || 0} Lectures</p>
                  </div>
                </div>
              </div>
              <div className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Layers className="text-emerald-500" size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Attended</p>
                    <p className="text-lg font-black text-slate-900">{report?.attendedSessions || 0} Sessions</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          {/* Class Selector */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Users size={20} />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Select Class</h3>
                <p className="text-[10px] font-bold text-slate-400">Institutional Intelligence View</p>
              </div>
            </div>
            <select 
              value={selectedClassId || ''} 
              onChange={handleClassChange}
              className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 ring-primary/20"
            >
              {myClasses.map(c => (
                <option key={c.classRoomId} value={c.classRoomId}>{c.classRoomName} - {c.name}</option>
              ))}
            </select>
          </div>

          {/* Class Stats Table */}
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Academic Engagement Matrix</h3>
              <div className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[8px] font-black uppercase tracking-widest">
                Live Data
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Student ID</th>
                    <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Sessions</th>
                    <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Attended</th>
                    <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    [1,2,3].map(i => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan="4" className="px-8 py-6"><div className="h-4 bg-slate-100 rounded-lg w-full" /></td>
                      </tr>
                    ))
                  ) : classReports.length > 0 ? (
                    classReports.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6 text-xs font-bold text-slate-900">#{row.studentId}</td>
                        <td className="px-8 py-6 text-xs font-bold text-slate-600">{row.totalSessions}</td>
                        <td className="px-8 py-6 text-xs font-bold text-emerald-600">{row.attendedSessions}</td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black ${
                            row.percentage >= 75 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                          }`}>
                            {row.percentage}%
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-8 py-12 text-center text-xs font-bold text-slate-400">
                        No attendance data available for this class
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceReportPage;
