import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Bell, Bus, MessageSquare, ScanLine, MessageCircle, User } from 'lucide-react';
import { cn } from "@/lib/utils";

const FloatingDock = () => {
  const menuItems = [
    { icon: LayoutDashboard, path: '/dashboard',     label: 'Home' },
    { icon: ScanLine,        path: '/attendance',    label: 'Scan' },
    { icon: Bus,             path: '/transport',     label: 'Transit' },
    { icon: Calendar,        path: '/timetable',     label: 'Schedule' },
    { icon: Bell,            path: '/notifications', label: 'Alerts' },
    { icon: User,            path: '/profile',       label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-[env(safe-area-inset-bottom)] px-4 pointer-events-none">
      <nav className="flex items-center gap-1 p-2 mb-6 rounded-[2.5rem] bg-slate-900/90 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] pointer-events-auto max-w-fit overflow-hidden">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => cn(
              "relative flex flex-col items-center justify-center w-14 h-14 rounded-[1.8rem] transition-all duration-500 group",
              isActive 
                ? "bg-primary text-white shadow-xl shadow-primary/40 scale-110 -translate-y-1" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className={cn(
                  "absolute -bottom-10 text-[10px] font-black uppercase tracking-[0.2em] text-white opacity-0 transition-all duration-300 pointer-events-none whitespace-nowrap",
                  "group-hover:opacity-100 group-hover:-bottom-12"
                )}>
                  {item.label}
                </span>
                
                {/* Active Indicator Dot */}
                <div className={cn(
                  "absolute -bottom-1.5 w-1 h-1 rounded-full bg-white transition-all duration-500 scale-0",
                  isActive ? "scale-100" : ""
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
