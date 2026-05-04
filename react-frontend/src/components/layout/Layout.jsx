import React from 'react';
import { Outlet } from 'react-router-dom';
import FloatingDock from './FloatingDock';
import FloatingHeader from './FloatingHeader';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useNotificationPolling from '../../hooks/useNotificationPolling';
import { AuthContext } from '../../context/AuthContext';

const Layout = () => {
  const { user } = React.useContext(AuthContext);
  useNotificationPolling(user);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col relative overflow-x-hidden">
      {/* Background Layer */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-indigo-50/30" />
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-white to-transparent" />
        <div className="absolute top-[20%] -right-[10%] w-[70%] h-[40%] rounded-full bg-primary/5 blur-[120px] opacity-60" />
        <div className="absolute bottom-[10%] -left-[10%] w-[70%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px] opacity-60" />
      </div>

      <FloatingHeader />

      <main className="relative z-10 flex-1 flex flex-col pt-24 pb-32">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl h-full">
          <Outlet />
        </div>
      </main>

      <FloatingDock />
      
      <ToastContainer 
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="mt-20 px-4"
      />
    </div>
  );
};

export default Layout;
