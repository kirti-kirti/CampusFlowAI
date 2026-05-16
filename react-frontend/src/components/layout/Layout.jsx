import React from 'react';
import { Outlet } from 'react-router-dom';
import FloatingDock from './FloatingDock';
import FloatingHeader from './FloatingHeader';
import useNotificationPolling from '../../hooks/useNotificationPolling';
import { AuthContext } from '../../context/AuthContext';

const Layout = () => {
  const { user } = React.useContext(AuthContext);
  useNotificationPolling(user);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col relative overflow-x-hidden transition-colors duration-500">
      {/* Premium Background Layer */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(59,130,246,0.05),_transparent)]" />
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-white dark:from-slate-900 to-transparent opacity-60" />
        <div className="absolute top-[15%] -right-[10%] w-[80%] h-[50%] rounded-full bg-primary/5 blur-[150px] animate-pulse-soft" />
        <div className="absolute bottom-[5%] -left-[10%] w-[80%] h-[50%] rounded-full bg-indigo-500/5 blur-[150px] animate-pulse-soft" />
      </div>

      <FloatingHeader />

      <main className="relative z-10 flex-1 flex flex-col pt-24 pb-32">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl h-full">
          <Outlet />
        </div>
      </main>

      <FloatingDock />
    </div>
  );
};

export default Layout;
