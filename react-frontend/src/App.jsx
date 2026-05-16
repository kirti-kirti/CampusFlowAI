import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
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
          toastClassName="!rounded-[1.5rem] !shadow-2xl !border-none !bg-white/80 !backdrop-blur-xl !text-slate-900 !font-bold !p-4"
          bodyClassName="!font-bold"
          progressClassName="!bg-primary"
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
