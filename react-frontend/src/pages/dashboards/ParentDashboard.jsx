import React, { useContext } from 'react';
import { 
  Baby, 
  Calendar, 
  Activity, 
  ChevronRight,
  Target,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  LayoutGrid,
  Bus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ParentDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const childStats = {
    name: 'Alice Smith',
    class: 'CS-A 2026',
    attendance: '94%',
    nextClass: 'Mathematics (10:00 AM)'
  };

  return (
    <div className="pb-32 px-4 pt-4 animate-in fade-in duration-1000">
      {/* Ward Profile Banner */}
      <section className="mb-10 p-10 rounded-[3rem] bg-white border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-[2.5rem] border-4 border-white shadow-xl overflow-hidden bg-indigo-50 flex items-center justify-center">
              <Baby className="text-indigo-500" size={40} />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
              <ShieldCheck className="text-white" size={14} />
            </div>
          </div>

          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-1">{childStats.name}</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">{childStats.class}</p>

          <div className="grid grid-cols-2 gap-12 w-full max-w-xs mx-auto">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-slate-900">{childStats.attendance}</span>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Presence</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-slate-900">#04</span>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Class Rank</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Action Nodes */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div 
          onClick={() => navigate('/attendance')}
          className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl shadow-slate-900/10 flex flex-col items-center text-center group cursor-pointer active:scale-95 transition-all"
        >
          <div className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-white/10">
            <Activity size={22} />
          </div>
          <h4 className="text-xs font-black text-white uppercase tracking-tight">Activity Log</h4>
        </div>
        <div 
          onClick={() => navigate('/timetable')}
          className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center group cursor-pointer hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Calendar size={22} />
          </div>
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">Academic Plan</h4>
        </div>
      </div>

      {/* Real-time Status Card */}
      <section 
        onClick={() => navigate('/transport')}
        className="bg-indigo-600 p-8 rounded-[3rem] text-white flex items-center justify-between shadow-2xl relative overflow-hidden group cursor-pointer mb-6"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center border border-white/10 shadow-inner">
            <Bus className="text-white" size={32} />
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest text-indigo-100 opacity-60">Transport Telemetry</h4>
            <h3 className="text-xl font-black uppercase tracking-tight mt-1">Track Live Bus</h3>
          </div>
        </div>
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-xl active:scale-90 transition-all">
          <ArrowRight size={22} />
        </div>
      </section>

      {/* Real-time Status Card */}
      <section className="bg-slate-900 p-8 rounded-[3rem] text-white flex items-center justify-between shadow-2xl relative overflow-hidden group cursor-pointer">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center border border-white/10 shadow-inner">
            <Target className="text-white" size={32} />
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-500 opacity-60">Upcoming Session</h4>
            <h3 className="text-xl font-black uppercase tracking-tight mt-1">{childStats.nextClass}</h3>
          </div>
        </div>
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-xl active:scale-90 transition-all">
          <ArrowRight size={22} />
        </div>
      </section>
    </div>
  );
};

export default ParentDashboard;
