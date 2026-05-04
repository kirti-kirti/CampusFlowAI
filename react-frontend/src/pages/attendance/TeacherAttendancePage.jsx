import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RefreshCw, 
  Clock, 
  BookOpen, 
  Users,
  Timer,
  ChevronDown,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { QRCodeSVG } from 'qrcode.react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import attendanceService from '../../services/attendanceService';
import hierarchyService from '../../services/hierarchyService';

const TeacherAttendancePage = () => {
  const [session, setSession] = useState(null);
  const [qrToken, setQrToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(3600); 
  const stompClient = useRef(null);
  const countdownInterval = useRef(null);

  const [mySubjects, setMySubjects] = useState([]);
  const [formData, setFormData] = useState({
    departmentId: '',
    classRoomId: '',
    subject: '',
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 60 * 60000).toISOString().slice(0, 16),
    lateThresholdMinutes: 15,
    qrRotationSeconds: 60
  });

  // 1. Initial Load: Fetch My Assigned Subjects and Check for Active Session
  useEffect(() => {
    const initPage = async () => {
      try {
        setLoading(true);
        // Load subjects
        const subjects = await hierarchyService.getMySubjects();
        setMySubjects(subjects);

        // Check if teacher ALREADY has an active session
        try {
          const activeSession = await attendanceService.getActiveSession();
          if (activeSession) {
            console.log("Resuming active session:", activeSession.sessionId);
            setSession(activeSession);
            setQrToken(activeSession.qrToken);
            startRotation(activeSession.sessionId, activeSession.qrRotationSeconds);
          }
        } catch (e) {
          // No active session found - this is fine for initial load
        }
      } catch (err) {
        toast.error('Identity sync failed');
      } finally {
        setLoading(false);
      }
    };
    initPage();
  }, []);

  const handleSubjectSelect = (subjectId) => {
    const selected = mySubjects.find(s => s.id === parseInt(subjectId));
    if (selected) {
      setFormData({
        ...formData,
        subject: selected.name,
        classRoomId: selected.classRoomId,
        departmentId: selected.departmentId
      });
    }
  };

  const startAttendanceSession = async (e) => {
    e.preventDefault();
    if (!formData.subject) {
      toast.warn('Please select a subject module');
      return;
    }

    setLoading(true);
    try {
      const activeSession = await attendanceService.startSession(formData);
      setSession(activeSession);
      setQrToken(activeSession.qrToken);
      startRotation(activeSession.sessionId, activeSession.qrRotationSeconds);
      toast.success('Attendance Protocol Started');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to initialize session';
      toast.error(msg);
      console.error("Attendance Session Start Failed:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const startRotation = (sessionId, intervalSeconds) => {
    if (stompClient.current) stompClient.current.deactivate();
    if (countdownInterval.current) clearInterval(countdownInterval.current);

    setTimeLeft(intervalSeconds);
    
    // Connect to WebSocket for Real-time pushes
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const port = 8080; // Backend port
    
    const client = new Client({
      webSocketFactory: () => new SockJS(`${window.location.protocol}//${host}:${port}/ws`),
      onConnect: () => {
        console.log('WebSocket Connected');
        client.subscribe(`/topic/session/${sessionId}`, (message) => {
          const updated = JSON.parse(message.body);
          console.log('QR Received via WS:', updated.qrToken);
          setQrToken(updated.qrToken);
          setTimeLeft(updated.secondsUntilRotation || intervalSeconds);
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
      },
    });

    client.activate();
    stompClient.current = client;

    // Local countdown with fallback polling
    countdownInterval.current = setInterval(async () => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Fallback: If WebSocket didn't push, poll for the next QR
          attendanceService.generateQR(sessionId).then(updated => {
            setQrToken(updated.qrToken);
            setTimeLeft(updated.secondsUntilRotation || intervalSeconds);
          }).catch(err => {
            console.error("Auto-rotation fallback failed:", err);
            // If session is closed (409) or unauthorized, stop polling
            if (err.response?.status === 409 || err.response?.status === 401) {
              if (countdownInterval.current) clearInterval(countdownInterval.current);
            }
          });
          return intervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleStopSession = async () => {
    if (!session) return;
    try {
      await attendanceService.stopSession(session.sessionId);
      toast.success("Attendance Protocol Terminated Safely");
      
      // Clear state
      setSession(null);
      setQrToken('');
      if (stompClient.current) stompClient.current.deactivate();
      if (countdownInterval.current) clearInterval(countdownInterval.current);
      
      // Reset view to subject selection
      window.location.reload(); 
    } catch (err) {
      toast.error("Protocol Termination Failed");
    }
  };

  useEffect(() => {
    return () => {
      if (stompClient.current) stompClient.current.deactivate();
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, []);

  if (session) {
    return (
      <div className="pb-32 px-4 pt-4 animate-in fade-in zoom-in duration-500">
        <div className="max-w-md mx-auto">
          {/* Active Terminal View */}
          <div className="bg-slate-900 rounded-[3rem] p-8 text-white mb-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px]" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/20">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Live Terminal Active</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight mb-2 uppercase">{session.subject}</h1>
              <div className="flex items-center gap-4 text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <Users size={14} /> Class {session.classRoomId}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <Clock size={14} /> {new Date(session.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} Exp.
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[3.5rem] p-10 border border-slate-100 shadow-xl flex flex-col items-center text-center relative">
            <div className="bg-slate-50 p-8 rounded-[3rem] border-4 border-white shadow-inner mb-8 transition-all duration-500 hover:scale-105">
              {qrToken ? (
                <QRCodeSVG value={qrToken} size={240} level="H" />
              ) : (
                <div className="w-[240px] h-[240px] flex items-center justify-center">
                  <RefreshCw className="animate-spin text-slate-200" size={48} />
                </div>
              )}
            </div>
            <div className="w-full bg-slate-50 rounded-2xl p-4 flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Next Rotation</span>
              <span className="text-lg font-black text-slate-900 tracking-tighter">{timeLeft}s</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
               <div 
                  className="h-full bg-primary transition-all duration-1000 ease-linear"
                  style={{ width: `${(timeLeft / (session.qrRotationSeconds || 15)) * 100}%` }}
               />
            </div>
          </div>

          <button 
            onClick={handleStopSession}
            className="w-full mt-6 py-5 bg-white border border-slate-100 rounded-[2rem] font-black uppercase tracking-widest text-[10px] text-rose-500 shadow-sm active:scale-95 transition-all"
          >
            End Attendance Protocol
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32 px-4 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-md mx-auto">
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Play className="text-primary" size={28} fill="currentColor" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-2 leading-none">Initialize Terminal</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Rotating QR Attendance Protocol</p>
        </div>

        <form onSubmit={startAttendanceSession} className="space-y-4">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
            {mySubjects.length === 0 && !loading ? (
              <div className="py-10 text-center bg-rose-50 rounded-3xl border-2 border-dashed border-rose-100">
                <AlertCircle className="mx-auto text-rose-300 mb-2" size={32} />
                <p className="text-rose-500 font-bold text-[10px] uppercase tracking-widest px-4">
                  No subjects assigned to your profile. Please contact Admin.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Select Subject Module</label>
                <div className="relative group">
                  <BookOpen className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
                  <select 
                    onChange={(e) => handleSubjectSelect(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl pl-14 pr-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all appearance-none outline-none"
                    required
                  >
                    <option value="">Select Subject</option>
                    {mySubjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.classRoomName || `Class ${s.classRoomId}`})</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Starts</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                  <input 
                    type="datetime-local" 
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-3 text-[11px] font-bold outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Ends</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                  <input 
                    type="datetime-local" 
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-3 text-[11px] font-bold outline-none"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading || mySubjects.length === 0}
              className="w-full py-5 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-2xl disabled:opacity-50"
            >
              {loading ? <RefreshCw className="animate-spin" size={18} /> : (
                <>
                  <Play size={18} fill="currentColor" />
                  Initialize Protocol
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherAttendancePage;
