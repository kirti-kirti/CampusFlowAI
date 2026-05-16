import React, { useContext, useEffect, useState } from 'react';
import { 
  School, 
  Layers, 
  Users, 
  BarChart3, 
  ChevronRight,
  Activity,
  Bus,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Settings,
  RefreshCw,
  Search,
  ShieldCheck,
  Zap,
  Globe,
  Database,
  Cpu,
  ArrowUpRight,
  Route
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import attendanceService from '../../services/attendanceService';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPresentToday: 0,
    totalActiveSessions: 0,
    averageAttendancePercentage: 0,
    totalStudents: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await attendanceService.getStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  const systemStatus = [
    { label: 'Cloud Engine', status: 'Optimal', icon: Globe, color: 'text-emerald-500' },
    { label: 'Database Node', status: 'Synchronized', icon: Database, color: 'text-indigo-500' },
    { label: 'Security Layer', status: 'Encrypted', icon: ShieldCheck, color: 'text-emerald-500' },
  ];

  const mainModules = [
    { name: 'Institutional Registry', icon: School, desc: 'Entity configuration & branding', path: '/admin/university', theme: 'indigo' },
    { name: 'Academic Hierarchy', icon: Layers, desc: 'Departments, classes & subjects', path: '/admin/departments', theme: 'violet' },
    { name: 'Identity Vault', icon: Users, desc: 'Teacher & student population', path: '/admin/users', theme: 'emerald' },
    { name: 'Logistics Fleet', icon: Bus, desc: 'Vehicle & driver assignments', path: '/admin/buses', theme: 'amber' },
    { name: 'Route Analytics', icon: Route, desc: 'Stop sequences & coverage', path: '/admin/routes', theme: 'indigo' },
  ];

  return (
    <div className="pb-32 px-6 pt-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-7xl mx-auto space-y-12">
      {/* Enterprise Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b border-slate-100 dark:border-slate-800 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-xl shadow-primary/20">
                <Cpu className="text-white" size={24} />
             </div>
             <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Control <span className="text-primary italic">Panel</span></h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Institutional Operating System</p>
             </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="hidden md:flex items-center gap-8 px-8 py-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
             {systemStatus.map((s, i) => (
               <div key={i} className="flex items-center gap-3">
                  <s.icon size={16} className={s.color} />
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
                    <span className="text-[10px] font-bold text-slate-900 dark:text-white">{s.status}</span>
                  </div>
               </div>
             ))}
          </div>
          <Button 
            onClick={fetchStats}
            variant="outline"
            className="h-14 w-14 rounded-xl border-slate-200 dark:border-slate-800 text-slate-400 hover:text-primary transition-all"
          >
            <RefreshCw size={20} className={cn(loading && "animate-spin text-primary")} />
          </Button>
        </div>
      </header>

      {/* Analytics Command Center F*/}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 premium-card bg-slate-950 p-8 md:p-14 border-none shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px] -mr-48 -mt-48" />
          
          <div className="relative z-10 space-y-12">
            <header className="flex items-center justify-between">
              <div className="space-y-1">
                <Badge variant="outline" className="text-primary border-primary/20 uppercase tracking-[0.2em] font-black text-[9px] px-3 bg-primary/5">Real-time Metrics</Badge>
                <h2 className="text-4xl font-black text-white tracking-tight uppercase">Operational <span className="text-primary italic">Pulse</span></h2>
              </div>
              <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                 <Activity className="text-primary" size={28} />
              </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-10">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Campus Engagement</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl md:text-6xl font-black text-white tracking-tighter">{stats.averageAttendancePercentage}</span>
                  <span className="text-xl md:text-2xl font-black text-primary mb-1 md:mb-2">%</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Flow Nodes</p>
                <span className="text-4xl md:text-6xl font-black text-white tracking-tighter">{stats.totalActiveSessions}</span>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Population</p>
                <span className="text-4xl md:text-6xl font-black text-white tracking-tighter">{stats.totalStudents || 0}</span>
              </div>
            </div>

            <Button 
              onClick={() => navigate('/admin/intelligence')}
              className="bg-white text-slate-950 hover:bg-white/90 h-16 px-10 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-white/10 gap-3 group/btn"
            >
              Open Neural Insights <ArrowRight size={20} className="group-hover/btn:translate-x-2 transition-transform" />
            </Button>
          </div>
        </div>

        <div className="premium-card p-10 md:p-12 border-none shadow-2xl shadow-slate-200/40 dark:shadow-none flex flex-col justify-between">
          <header className="space-y-2">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Domain</h3>
            <p className="text-slate-500 font-medium">{user?.tenantId || 'CampusFlow Global'}</p>
          </header>
          
          <div className="py-8 space-y-6">
            <div className="flex items-center justify-between text-sm font-bold border-b border-slate-50 dark:border-slate-800 pb-4">
               <span className="text-slate-400">Security Clearance</span>
               <span className="text-slate-900 dark:text-white uppercase tracking-widest">Level 01</span>
            </div>
            <div className="flex items-center justify-between text-sm font-bold border-b border-slate-50 dark:border-slate-800 pb-4">
               <span className="text-slate-400">Environment</span>
               <span className="text-emerald-500 uppercase tracking-widest">Production</span>
            </div>
            <div className="flex items-center justify-between text-sm font-bold">
               <span className="text-slate-400">Last Audit</span>
               <span className="text-slate-900 dark:text-white">Just now</span>
            </div>
          </div>

          <Button 
            variant="outline"
            className="w-full h-14 rounded-xl border-slate-100 dark:border-slate-800 font-black text-[10px] uppercase tracking-widest gap-2 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Settings size={16} /> Global Settings
          </Button>
        </div>
      </section>

      {/* Service Core Grid */}
      <section className="space-y-10">
        <header className="px-2">
           <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-2 flex items-center gap-2">
             <Layers size={14} className="text-primary" /> Service Hierarchy
           </h3>
           <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">Core Modules</h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2  gap-8">
          {mainModules.map((module, idx) => (
            <div 
              key={idx}
              onClick={() => navigate(module.path)}
              className="group premium-card p-10 hover:shadow-primary/10 transition-all duration-500 cursor-pointer border-none shadow-2xl shadow-slate-200/40 dark:shadow-none"
            >
              <div className="flex flex-col h-full justify-between gap-10">
                <div className="space-y-6">
                  <div className={cn(
                    "w-16 h-16 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-xl",
                    module.theme === 'indigo' && "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500",
                    module.theme === 'violet' && "bg-violet-50 dark:bg-violet-900/20 text-violet-500",
                    module.theme === 'emerald' && "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500",
                    module.theme === 'amber' && "bg-amber-50 dark:bg-amber-900/20 text-amber-500"
                  )}>
                    <module.icon size={32} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase group-hover:text-primary transition-colors">{module.name}</h4>
                    <p className="text-sm text-slate-500 font-medium mt-3 leading-relaxed">{module.desc}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-primary transition-colors">Access Registry</span>
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                     <ChevronRight size={20} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Institutional Insight Banner */}
      <section 
        onClick={() => navigate('/admin/intelligence')}
        className="premium-card p-10 md:p-14  border-none shadow-2xl shadow-slate-200/40 dark:shadow-none flex flex-col md:flex-row items-center justify-between gap-10 cursor-pointer hover:shadow-primary/5 transition-all group overflow-hidden relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="w-24 h-24 bg-slate-950 rounded-xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
            <Sparkles className="text-primary animate-pulse" size={48} />
          </div>
          <div className="text-center md:text-left space-y-3">
             <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">Auditor Dashboard</h3>
             <p className="text-slate-500 font-medium text-lg max-w-xl">Unified institutional reporting across academic logs, transport metrics, and student engagement cycles.</p>
          </div>
        </div>
        
        <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 relative z-10">
           <ArrowUpRight size={36} />
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
