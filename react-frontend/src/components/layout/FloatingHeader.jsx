import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Bell } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const FloatingHeader = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const getTitle = (path) => {
    const segment = path.split('/')[1];
    if (!segment || segment === 'dashboard') return 'Overview';
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-20 items-center justify-between px-4 md:px-10 bg-white/60 backdrop-blur-2xl border-b border-slate-100 shadow-sm">
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/10 cursor-pointer active:scale-90 transition-transform shrink-0"
          onClick={() => navigate('/dashboard')}
        >
          <ShieldCheck className="text-white" size={20} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary leading-none mb-1 truncate">CampusFlow</span>
          <h2 className="text-base font-black text-slate-900 leading-none tracking-tight truncate">{getTitle(location.pathname)}</h2>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <button 
          onClick={() => navigate('/notifications')}
          className="relative p-2 text-slate-400 hover:text-primary transition-all active:scale-90"
        >
          <Bell size={20} />
          <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full border-2 border-white" />
        </button>
        
        <div 
          className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-slate-200 cursor-pointer group"
          onClick={() => navigate('/profile')}
        >
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-[10px] font-black text-slate-900 group-hover:text-primary transition-colors">{user?.name?.split(' ')[0] || 'Explorer'}</span>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{user?.role || 'Guest'}</span>
          </div>
          <Avatar className="h-9 w-9 md:h-10 md:w-10 border-2 border-white shadow-md group-hover:border-primary/20 transition-all">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
              {user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default FloatingHeader;
