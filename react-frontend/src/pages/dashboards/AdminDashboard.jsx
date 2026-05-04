import React, { useContext, useEffect, useState } from 'react';
import { 
  School, 
  Layers, 
  LayoutGrid, 
  Users, 
  BarChart3, 
  ChevronRight,
  ArrowUpRight,
  Activity,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import attendanceService from '../../services/attendanceService';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPresentToday: 0,
    totalActiveSessions: 0,
    averageAttendancePercentage: 0,
    totalStudents: 0
  });

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const data = await attendanceService.getStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load stats");
    }
  };

  const quickStats = [
    { label: 'Campus Pulse', value: `${stats.averageAttendancePercentage}%`, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Active Sessions', value: stats.totalActiveSessions, icon: Layers, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Present Today', value: stats.totalPresentToday, icon: Users, color: 'text-rose-500', bg: 'bg-rose-50' },
  ];

  const hierarchyNodes = [
    { name: 'University', icon: School, count: 1, path: '/admin/university', color: 'text-rose-500', bg: 'bg-rose-50' },
    { name: 'Academic Flow', icon: Layers, count: 'Hierarchy', path: '/admin/departments', color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { name: 'Identity Hub', icon: Users, count: 'Faculty & Scholars', path: '/admin/users', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="pb-32 px-4 pt-4 animate-in fade-in duration-1000">
      {/* Premium Hero Banner */}
      <section className="mb-10 p-10 rounded-[3rem] bg-slate-900 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent opacity-50" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="max-w-md">
            <div className="flex items-center gap-2 mb-4 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 w-fit">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Systems Operational</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-4 uppercase tracking-tight">
              Control <span className="text-primary">Center</span>
            </h1>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest leading-relaxed">
              Managing hierarchy for Stanford University. All academic protocols are active.
            </p>
          </div>
          
          <div className="flex gap-4">
            {quickStats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-end">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                <span className="text-xl font-black text-white">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hierarchical Grid */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-8 px-2">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Ecosystem Hierarchy</h3>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {hierarchyNodes.map((node, idx) => (
            <div 
              key={idx} 
              onClick={() => navigate(node.path)}
              className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer text-center"
            >
              <div className={`w-16 h-16 ${node.bg} ${node.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                <node.icon size={32} />
              </div>
              <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-1">{node.name}</h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{node.count} Active Nodes</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reports Quick Link */}
      <section 
        onClick={() => navigate('/admin/intelligence')}
        className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 group cursor-pointer hover:shadow-md transition-all"
      >
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center shadow-inner">
            <BarChart3 size={32} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Institutional Intelligence</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time attendance and academic reports across all classes.</p>
          </div>
        </div>
        <button 
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group-hover:bg-primary transition-colors"
        >
          View Reports <ArrowUpRight size={16} />
        </button>
      </section>
    </div>
  );
};

export default AdminDashboard;
