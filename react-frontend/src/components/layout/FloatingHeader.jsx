import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Bell, Search, Settings } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const FloatingHeader = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const getTitle = (path) => {
    const segment = path.split('/')[1];
    if (!segment || segment === 'dashboard') return 'Home';
    
    // Friendly vocabulary mapping
    const friendlyNames = {
      'attendance': 'Attendance',
      'transport': 'School Bus',
      'timetable': 'Schedule',
      'messages': 'Chat',
      'profile': 'My Account',
      'notifications': 'Alerts',
      'chatbot': 'Help Assistant'
    };

    return friendlyNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-20 items-center justify-between px-6 md:px-12 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border-b border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-500">
      <div className="flex items-center gap-4">
        <div 
          className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 cursor-pointer active:scale-90 transition-all hover:shadow-primary/40"
          onClick={() => navigate('/dashboard')}
        >
          <ShieldCheck className="text-white" size={24} />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 dark:text-primary/40 leading-none mb-1">CampusFlow AI</span>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white leading-none tracking-tight">{getTitle(location.pathname)}</h2>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <button 
          onClick={() => navigate('/notifications')}
          className="relative w-11 h-11 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-all active:scale-90"
        >
          <Bell size={22} />
          <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-800" />
        </button>
        
        <div 
          className="flex items-center gap-4 pl-4 border-l border-slate-200 dark:border-slate-700 cursor-pointer group"
          onClick={() => navigate('/profile')}
        >
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{user?.name || 'User'}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user?.role?.toLowerCase() || 'Member'}</span>
          </div>
          <Avatar className="h-11 w-11 border-2 border-white dark:border-slate-800 shadow-xl group-hover:border-primary/20 transition-all">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default FloatingHeader;
