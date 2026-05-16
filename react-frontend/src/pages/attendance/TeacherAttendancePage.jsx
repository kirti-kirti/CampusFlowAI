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
  AlertCircle,
  Sparkles,
  Zap,
  ArrowRight,
  StopCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { QRCodeSVG } from 'qrcode.react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import attendanceService from '../../services/attendanceService';
import hierarchyService from '../../services/hierarchyService';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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

  useEffect(() => {
    const initPage = async () => {
      try {
        setLoading(true);
        const subjects = await hierarchyService.getMySubjects();
        setMySubjects(subjects);

        try {
          const activeSession = await attendanceService.getActiveSession();
          if (activeSession) {
            setSession(activeSession);
            setQrToken(activeSession.qrToken);
            startRotation(activeSession.sessionId, activeSession.qrRotationSeconds);
          }
        } catch (e) {
          // No active session
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
      toast.warn('Please select a subject');
      return;
    }

    setLoading(true);
    try {
      const activeSession = await attendanceService.startSession(formData);
      setSession(activeSession);
      setQrToken(activeSession.qrToken);
      startRotation(activeSession.sessionId, activeSession.qrRotationSeconds);
      toast.success('Attendance session started');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to start session';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const startRotation = (sessionId, intervalSeconds) => {
    if (stompClient.current) stompClient.current.deactivate();
    if (countdownInterval.current) clearInterval(countdownInterval.current);

    setTimeLeft(intervalSeconds);
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const port = 8080;
    
    const client = new Client({
      webSocketFactory: () => new SockJS(`${window.location.protocol}//${host}:${port}/ws`),
      onConnect: () => {
        client.subscribe(`/topic/session/${sessionId}`, (message) => {
          const updated = JSON.parse(message.body);
          setQrToken(updated.qrToken);
          setTimeLeft(updated.secondsUntilRotation || intervalSeconds);
        });
      },
    });

    client.activate();
    stompClient.current = client;

    countdownInterval.current = setInterval(async () => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          attendanceService.generateQR(sessionId).then(updated => {
            setQrToken(updated.qrToken);
            setTimeLeft(updated.secondsUntilRotation || intervalSeconds);
          }).catch(err => {
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
      toast.success("Attendance session closed");
      setSession(null);
      setQrToken('');
      if (stompClient.current) stompClient.current.deactivate();
      if (countdownInterval.current) clearInterval(countdownInterval.current);
      window.location.reload(); 
    } catch (err) {
      toast.error("Failed to close session");
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
      <div className="pb-32 px-6 pt-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="max-w-md mx-auto">
          {/* Active Session Header */}
          <section className="mb-10 p-10 rounded-xl bg-slate-950 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 backdrop-blur-md rounded-full border border-emerald-500/20">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Session in Progress</span>
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight">{session.subject}</h1>
                <div className="flex items-center gap-4 text-slate-400 mt-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                    <Users size={14} className="text-primary" /> Class {session.classRoomId}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                    <Clock size={14} className="text-primary" /> Ends {new Date(session.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* QR Display Card */}
          <section className="premium-card p-10 flex flex-col items-center text-center relative mb-10">
            <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-xl border-4 border-white dark:border-slate-700 shadow-inner mb-10 transition-all duration-500 hover:scale-[1.02]">
              {qrToken ? (
                <QRCodeSVG value={qrToken} size={240} level="H" className="dark:invert dark:hue-rotate-180" />
              ) : (
                <div className="w-[240px] h-[240px] flex items-center justify-center">
                  <RefreshCw className="animate-spin text-primary" size={48} />
                </div>
              )}
            </div>
            
            <div className="w-full space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <Timer size={16} className="text-primary" />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Next QR Code</span>
                </div>
                <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{timeLeft}s</span>
              </div>
              
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                  style={{ width: `${(timeLeft / (session.qrRotationSeconds || 60)) * 100}%` }}
                />
              </div>
              
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] max-w-[200px] mx-auto leading-relaxed">
                Students must scan this code to mark their attendance.
              </p>
            </div>
          </section>
          
          <button 
            onClick={handleStopSession}
            className="w-full py-5 bg-white dark:bg-slate-900 border-2 border-rose-100 dark:border-rose-900/30 rounded-xl font-black uppercase tracking-widest text-xs text-rose-500 flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-rose-50 dark:hover:bg-rose-900/10 mt-6"
          >
            <StopCircle size={20} />
            Close Attendance Session
          </button>

          {/* Live Student Manifest */}
          <section className="mt-12 space-y-6">
            <header className="flex items-center justify-between px-2">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                <Users size={14} className="text-primary" /> Class Manifest
              </h3>
              <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full">
                Live Sync
              </Badge>
            </header>

            <div className="space-y-3">
               {/* Show empty state or participants if available */}
               {session?.participants?.length > 0 ? session.participants.map(student => (
                 <div key={student.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-black text-[10px] text-slate-400">
                        {student.id}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{student.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Checked in at {student.time}</p>
                      </div>
                    </div>
                    <div className={cn(
                      "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                      student.status === 'PRESENT' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    )}>
                      {student.status}
                    </div>
                 </div>
               )) : (
                 <div className="py-12 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No participants detected yet</p>
                 </div>
               )}
               
               <button 
                 onClick={() => toast.info('Manifest synced with cloud')}
                 className="w-full py-4 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-primary hover:text-primary transition-all"
               >
                 View All Participants
               </button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32 px-6 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="max-w-md mx-auto">
        <div className="mb-12 text-center space-y-4">
          <div className="w-20 h-20 bg-primary/10 rounded-xl flex items-center justify-center mx-auto shadow-inner group">
            <Zap className="text-primary group-hover:scale-110 transition-transform" size={32} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Start Attendance</h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Create a rotating QR code for your class.</p>
          </div>
        </div>

        <form onSubmit={startAttendanceSession} className="space-y-6">
          <div className="premium-card p-10 space-y-8">
            {mySubjects.length === 0 && !loading ? (
              <div className="py-12 text-center bg-rose-50 dark:bg-rose-900/10 rounded-xl border-2 border-dashed border-rose-100 dark:border-rose-900/30">
                <AlertCircle className="mx-auto text-rose-400 mb-3" size={40} />
                <p className="text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-widest px-6 leading-relaxed">
                  No subjects assigned to your profile. Please contact the administrator.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Choose Subject</label>
                <div className="relative group">
                  <BookOpen className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                  <select 
                    onChange={(e) => handleSubjectSelect(e.target.value)}
                    className="w-full bg-slate-100/50 dark:bg-slate-800/50 border-none rounded-xl pl-16 pr-8 h-16 text-base font-bold focus:ring-2 focus:ring-primary/20 transition-all appearance-none outline-none dark:text-white"
                    required
                  >
                    <option value="">Select Subject</option>
                    {mySubjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.classRoomName || `Class ${s.classRoomId}`})</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Start Time</label>
                <div className="relative">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="datetime-local" 
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    className="w-full h-14 bg-slate-100/50 dark:bg-slate-800/50 border-none rounded-xl pl-12 pr-4 text-xs font-bold outline-none dark:text-white"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">End Time</label>
                <div className="relative">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="datetime-local" 
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    className="w-full h-14 bg-slate-100/50 dark:bg-slate-800/50 border-none rounded-xl pl-12 pr-4 text-xs font-bold outline-none dark:text-white"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading || mySubjects.length === 0}
              className="btn-premium w-full !rounded-xl h-16 group"
            >
              {loading ? <RefreshCw className="animate-spin" size={24} /> : (
                <>
                  <Zap size={22} fill="currentColor" className="group-hover:scale-110 transition-transform" />
                  <span>Start Session</span>
                  <ArrowRight size={20} className="ml-1 group-hover:translate-x-1 transition-transform" />
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

