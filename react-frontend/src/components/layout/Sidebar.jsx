import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Bell, Bus,
  MessageSquare, User, LogOut, ScanLine, MessageCircle, History
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out of your session?')) {
      logout();
      navigate('/login');
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard',     path: '/dashboard' },
    { icon: ScanLine,        label: 'Attendance',    path: '/attendance' },
    { icon: History,         label: 'Logs',          path: '/attendance/logs' },
    { icon: Calendar,        label: 'Timetable',     path: '/timetable' },
    { icon: Bell,            label: 'Notifications', path: '/notifications' },
    { icon: Bus,             label: 'Transport',     path: '/transport' },
    { icon: MessageCircle,   label: 'Messages',      path: '/messages' },
    { icon: MessageSquare,   label: 'AI Assistant',  path: '/chatbot' },
    { icon: User,            label: 'Profile',       path: '/profile' },
  ];

  return (
    <aside className="w-[280px] h-screen bg-white border-r border-slate-100 flex flex-col fixed left-0 top-0 z-[100] shadow-sm">
      {/* Logo */}
      <div className="px-8 py-8 flex items-center gap-4 border-b border-slate-50">
        <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-primary/30">
          C
        </div>
        <div>
          <span className="text-base font-black text-slate-900 tracking-tight leading-none block">CampusFlow</span>
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">AI Platform</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 group ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700 transition-colors'} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Footer */}
      <div className="px-4 py-6 border-t border-slate-50">
        <div className="flex items-center gap-3 px-4 py-3 mb-3 bg-slate-50 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-base shrink-0">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-slate-900 truncate leading-tight">{user?.name || 'User'}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user?.role || 'Role'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-black text-slate-500 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-100"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
