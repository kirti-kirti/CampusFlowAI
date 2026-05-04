import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ScanLine, Calendar, Bell, MessageCircle, User } from 'lucide-react';

const BottomNav = () => {
  const navItems = [
    { icon: LayoutDashboard, path: '/dashboard',     label: 'Home' },
    { icon: ScanLine,        path: '/attendance',    label: 'Scan' },
    { icon: Bus,             path: '/transport',     label: 'Transit' },
    { icon: MessageCircle,   path: '/messages',      label: 'Messages' },
    { icon: Bell,            path: '/notifications', label: 'Alerts' },
    { icon: User,            path: '/profile',       label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md h-16 bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl z-50 flex items-center justify-around px-4 sm:hidden">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => `
            flex flex-col items-center justify-center transition-all duration-300
            ${isActive ? 'text-primary scale-110' : 'text-muted-foreground hover:text-primary'}
          `}
        >
          <item.icon size={22} className="mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          {/* Active Indicator */}
          <div className="h-1 w-1 rounded-full bg-primary mt-1 opacity-0 transition-opacity aria-selected:opacity-100" />
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
