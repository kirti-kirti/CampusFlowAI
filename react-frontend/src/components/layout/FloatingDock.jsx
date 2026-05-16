import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Bell, 
  Bus, 
  MessageSquare, 
  ScanLine, 
  User, 
  Navigation2,
  Sparkles
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const FloatingDock = () => {
  const { user } = useContext(AuthContext);
  const role = user?.role;

  const allItems = [
    { icon: LayoutDashboard, path: '/dashboard',     label: 'Home',      roles: ['ADMIN', 'STUDENT', 'PARENT', 'TEACHER'] },
    { icon: ScanLine,        path: '/attendance',    label: 'Attendance', roles: ['ADMIN', 'STUDENT', 'TEACHER'] },
    { icon: Bus,             path: '/transport',     label: 'School Bus', roles: ['ADMIN', 'STUDENT', 'PARENT'] },
    { icon: Navigation2,     path: '/transport',     label: 'Route',      roles: ['TEACHER'] },
    { icon: Calendar,        path: '/timetable',     label: 'Schedule',   roles: ['ADMIN', 'STUDENT', 'TEACHER'] },
    { icon: MessageSquare,   path: '/messages',      label: 'Chat',      roles: ['ADMIN', 'STUDENT', 'TEACHER'] },
  ];

  const menuItems = role === 'TEACHER'
    ? allItems.filter(i => i.roles.includes('TEACHER'))
    : allItems.filter(i => !role || i.roles.includes(role));

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-8 px-6 pointer-events-none">
      <nav className="flex items-center gap-2 p-2 rounded-[2.5rem] bg-slate-950/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] pointer-events-auto max-w-fit transition-all duration-500">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => cn(
              "relative flex flex-col items-center justify-center w-14 h-14 rounded-[1.8rem] transition-all duration-500 group",
              isActive 
                ? "bg-primary text-white shadow-2xl shadow-primary/50 scale-110 -translate-y-2" 
                : "text-slate-500 hover:text-white hover:bg-white/5"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className="transition-transform duration-500 group-hover:scale-110" />
                
                {/* Tooltip-style Label */}
                <span className={cn(
                  "absolute -top-12 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest opacity-0 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-2xl border border-white/10",
                  "group-hover:opacity-100 group-hover:-top-14"
                )}>
                  {item.label}
                </span>
                
                {/* Active Indicator Pulse */}
                {isActive && (
                  <div className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}

                {/* Hover Glow */}
                <div className={cn(
                  "absolute inset-0 rounded-[1.8rem] bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10",
                  isActive ? "hidden" : ""
                )} />
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default FloatingDock;
