import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
  Scan, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  UserCheck,
  ShieldAlert,
  ChevronDown,
  Layers
} from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { toast } from 'react-toastify';
import attendanceService from '../../services/attendanceService';
import { AuthContext } from '../../context/AuthContext';
import { useSearchParams } from 'react-router-dom';

const ScannerPage = () => {
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const [lastScan, setLastScan] = useState(null);
  const [status, setStatus] = useState('READY'); // READY, SUCCESS, ERROR, LOADING
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [stats, setStats] = useState({ total: 0, lastStudent: '' });
  const [activeSession, setActiveSession] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const sessionId = searchParams.get('sessionId');
    if (sessionId && user?.role === 'TEACHER') {
      fetchSession(sessionId);
    }
  }, [searchParams, user]);

  const fetchSession = async (id) => {
    try {
      // We'll use getStats or similar to find active session if needed, 
      // but for now let's assume we have it from the Dashboard.
      // In a real app, you'd fetch the specific session details here.
    } catch (err) {}
  };

  const handleScan = async (result) => {
    if (status === 'LOADING' || !result?.[0]?.rawValue) return;
    
    const scannedValue = result[0].rawValue;
    if (scannedValue === lastScan) return; 

    setLastScan(scannedValue);
    setStatus('LOADING');
    
    try {
      let response;
      if (user?.role === 'TEACHER' || user?.role === 'ADMIN') {
        // Teacher scans student's profile QR (value = student user ID)
        response = await attendanceService.markAttendance(null, scannedValue);
      } else {
        // Student scans the session QR token shown by teacher
        response = await attendanceService.markAttendance(scannedValue);
      }
      
      setStatus('SUCCESS');
      setFeedbackMsg('Attendance Verified');
      setStats(prev => ({ 
        total: prev.total + 1, 
        lastStudent: response.studentName || 'Authenticated Student' 
      }));
      
      resetScanner(2000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Verification Failed';
      setStatus('ERROR');
      setFeedbackMsg(errorMsg);
      resetScanner(3000);
    }
  };

  const resetScanner = (delay) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setStatus('READY');
      setFeedbackMsg('');
      setLastScan(null);
    }, delay);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header Display */}
        <div className="flex items-center justify-between mb-8 px-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/20">
              <Scan className="text-primary" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-white uppercase tracking-tight">Identity Terminal</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Central Verification Mode</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Verified</span>
              <span className="text-2xl font-black text-white tracking-tighter">{stats.total}</span>
            </div>
          </div>
        </div>

        {/* Scanner Viewport */}
        <div className="relative aspect-video rounded-xl overflow-hidden border-4 border-white/5 shadow-2xl bg-black">
          <Scanner
            onScan={handleScan}
            onError={(err) => console.error(err)}
            styles={{
              container: { width: '100%', height: '100%' },
              video: { objectFit: 'cover' }
            }}
            components={{
              audio: false,
              finder: true
            }}
          />

          {/* Overlays */}
          <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center">
            {/* Target Frame */}
            <div className={`w-64 h-64 border-2 rounded-xl transition-all duration-500 flex flex-col items-center justify-center ${
              status === 'SUCCESS' ? 'border-emerald-500 bg-emerald-500/10 scale-110' : 
              status === 'ERROR' ? 'border-rose-500 bg-rose-500/10 scale-90' : 
              'border-white/30'
            }`}>
              {status === 'SUCCESS' && <CheckCircle2 className="text-emerald-500" size={64} />}
              {status === 'ERROR' && <ShieldAlert className="text-rose-500" size={64} />}
              {status === 'LOADING' && <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />}
            </div>

            {/* Scanning Line Animation */}
            {status === 'READY' && (
              <div className="absolute w-64 h-0.5 bg-primary shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-scan-line top-1/2 -translate-y-32" />
            )}
          </div>

          {/* Feedback Toast Overlay */}
          {(status === 'SUCCESS' || status === 'ERROR') && (
            <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 px-8 py-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 ${
              status === 'SUCCESS' ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20' : 'bg-rose-500 text-white shadow-xl shadow-rose-500/20'
            }`}>
              {status === 'SUCCESS' ? <UserCheck size={20} /> : <AlertCircle size={20} />}
              <span className="text-xs font-black uppercase tracking-widest">{feedbackMsg}</span>
            </div>
          )}
        </div>

        {/* Real-time Ticker */}
        <div className="mt-8 bg-white/5 backdrop-blur-xl border border-white/5 rounded-xl p-6 flex items-center justify-between px-8">
           <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                <Clock className="text-slate-400" size={18} />
             </div>
             <div>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Last Verification</span>
               <span className="text-sm font-bold text-white uppercase">{stats.lastStudent || 'Waiting for scans...'}</span>
             </div>
           </div>
           
           <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Active Link</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ScannerPage;

