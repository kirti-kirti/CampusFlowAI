import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  Navigation2, Users, MapPin, Route, Wifi, WifiOff,
  Play, Square, SendHorizonal, ChevronRight, RefreshCw,
  UserCheck, UserX, Clock, Bus, ShieldCheck, Locate,
  ArrowRight, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import transportService from '../../services/transportService';
import { toast } from 'react-toastify';

// ── Haversine ─────────────────────────────────────────────────────────────────
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function timeAgo(iso) {
  if (!iso) return '—';
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

const DriverDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [busData, setBusData] = useState(null);
  const [location, setLocation] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notAssigned, setNotAssigned] = useState(false);

  // GPS broadcast state
  const [broadcasting, setBroadcasting] = useState(false);
  const [currentCoords, setCurrentCoords] = useState(null);
  const [pingCount, setPingCount] = useState(0);
  const [lastPing, setLastPing] = useState(null);
  const [sendingManual, setSendingManual] = useState(false);
  const watchRef = useRef(null);
  const pingIntervalRef = useRef(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchStudents, 15000);
    return () => {
      clearInterval(interval);
      stopBroadcast();
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const loc = await transportService.getMyBus();
      setBusData(loc);
      setLocation(loc);
      await fetchStudents(loc.busId);
    } catch (e) {
      const msg = e.response?.data?.message || '';
      if (msg.includes('not assigned') || e.response?.status === 400) {
        setNotAssigned(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (busId) => {
    const id = busId || busData?.busId;
    if (!id) return;
    try {
      const data = await transportService.getBusStudents(id);
      setStudents(data);
    } catch { }
  };

  // ── GPS Broadcast ─────────────────────────────────────────────────────────
  const startBroadcast = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
    setBroadcasting(true);
    toast.success('🚌 Live tracking started');

    watchRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCurrentCoords(coords);
        try {
          await transportService.updateLocation({
            latitude: coords.lat,
            longitude: coords.lng,
          });
          setLastPing(new Date());
          setPingCount(p => p + 1);
        } catch { }
      },
      () => { toast.error('GPS access denied'); stopBroadcast(); },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    );
  };

  const stopBroadcast = () => {
    if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
    if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    setBroadcasting(false);
  };

  const sendManualPing = async () => {
    if (!currentCoords) {
      // Get current position once
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCurrentCoords(coords);
        setSendingManual(true);
        try {
          await transportService.updateLocation({ latitude: coords.lat, longitude: coords.lng });
          setLastPing(new Date());
          setPingCount(p => p + 1);
          toast.success('Location sent');
        } catch { toast.error('Failed to send location'); }
        finally { setSendingManual(false); }
      }, () => toast.error('GPS access denied'));
      return;
    }
    setSendingManual(true);
    try {
      await transportService.updateLocation({ latitude: currentCoords.lat, longitude: currentCoords.lng });
      setLastPing(new Date());
      setPingCount(p => p + 1);
      toast.success('Location sent');
    } catch { toast.error('Failed to send location'); }
    finally { setSendingManual(false); }
  };

  const handleCheckIn = async (studentId) => {
    try {
      await transportService.checkIn({ busId: busData.busId, studentId });
      toast.success('Student checked in');
      fetchStudents();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleCheckOut = async (studentId) => {
    try {
      await transportService.checkOut({ busId: busData.busId, studentId });
      toast.success('Student checked out');
      fetchStudents();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const inBusCount = students.filter(s => s.status === 'IN_BUS').length;
  const capacity = busData?.capacity || 40;
  const occupancyPct = Math.min((inBusCount / capacity) * 100, 100);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="pb-32 px-4 pt-4 animate-in fade-in duration-700">
        <div className="h-48 bg-slate-100 rounded-xl animate-pulse mb-4" />
        <div className="h-32 bg-slate-100 rounded-xl animate-pulse mb-4" />
        <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  // ── Not assigned ──────────────────────────────────────────────────────────
  if (notAssigned) {
    return (
      <div className="pb-32 px-4 pt-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-4xl">🚌</div>
        <h2 className="text-xl font-black text-slate-900 mb-2">No Bus Assigned</h2>
        <p className="text-slate-400 text-sm max-w-xs">You haven't been assigned to a bus yet. Contact your admin to get assigned as a driver.</p>
      </div>
    );
  }

  return (
    <div className="pb-32 px-4 pt-4 animate-in fade-in duration-700">

      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <section className="mb-6 p-6 rounded-xl bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              <div className={`w-2 h-2 rounded-full ${broadcasting ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">
                {broadcasting ? 'Broadcasting Live' : 'Driver Mode'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
              <ShieldCheck size={12} className="text-emerald-400" /> Verified Driver
            </div>
          </div>

          <h1 className="text-2xl font-black text-white mb-1">{user?.name}</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{busData?.busNumber} · {busData?.routeName}</p>

          {/* Coords */}
          {currentCoords && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="bg-white/5 rounded-xl p-2.5">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Latitude</p>
                <p className="font-mono text-xs font-bold text-white">{currentCoords.lat.toFixed(5)}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Longitude</p>
                <p className="font-mono text-xs font-bold text-white">{currentCoords.lng.toFixed(5)}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── GPS Broadcast Controls ───────────────────────────────────────────── */}
      <section className="mb-6">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-1">GPS Broadcast</p>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            {!broadcasting ? (
              <button
                onClick={startBroadcast}
                className="flex-1 h-14 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <Play size={18} fill="white" /> Start Live Tracking
              </button>
            ) : (
              <button
                onClick={stopBroadcast}
                className="flex-1 h-14 bg-rose-500 hover:bg-rose-400 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-rose-500/20 active:scale-95"
              >
                <Square size={18} fill="white" /> Stop Tracking
              </button>
            )}
            <button
              onClick={sendManualPing}
              disabled={sendingManual}
              className="w-14 h-14 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl flex items-center justify-center transition-colors active:scale-95 disabled:opacity-50"
              title="Send location now"
            >
              <SendHorizonal size={18} className={sendingManual ? 'animate-pulse' : ''} />
            </button>
            <button
              onClick={() => navigate(`/transport/tracking/${busData?.busId}`, { state: { bus: busData } })}
              className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-100 transition-colors active:scale-95"
              title="View on map"
            >
              <MapPin size={18} />
            </button>
          </div>

          {/* Ping stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Pings Sent</p>
              <p className="text-lg font-black text-slate-900">{pingCount}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Last Ping</p>
              <p className="text-xs font-black text-slate-700">{lastPing ? timeAgo(lastPing) : '—'}</p>
            </div>
            <div className={`rounded-xl p-3 text-center ${broadcasting ? 'bg-emerald-50' : 'bg-slate-50'}`}>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Status</p>
              <p className={`text-xs font-black ${broadcasting ? 'text-emerald-600' : 'text-slate-400'}`}>
                {broadcasting ? 'Live' : 'Idle'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bus Info ─────────────────────────────────────────────────────────── */}
      <section className="mb-6">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-1">Route Info</p>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <Bus size={15} />
              <span className="text-[10px] font-black uppercase tracking-widest">Bus Number</span>
            </div>
            <span className="font-black text-slate-900 text-sm">{busData?.busNumber}</span>
          </div>
          <div className="w-full h-px bg-slate-50" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <Route size={15} />
              <span className="text-[10px] font-black uppercase tracking-widest">Route</span>
            </div>
            <span className="font-black text-slate-700 text-xs text-right max-w-[60%]">{busData?.routeName}</span>
          </div>
          <div className="w-full h-px bg-slate-50" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <Users size={15} />
              <span className="text-[10px] font-black uppercase tracking-widest">Occupancy</span>
            </div>
            <span className="font-black text-slate-900 text-sm">{inBusCount} / {capacity}</span>
          </div>
          {/* Occupancy bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${occupancyPct >= 90 ? 'bg-rose-500' : occupancyPct >= 60 ? 'bg-amber-400' : 'bg-emerald-500'}`}
              style={{ width: `${occupancyPct}%` }}
            />
          </div>
        </div>
      </section>

      {/* ── Student Manifest ─────────────────────────────────────────────────── */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Passengers
            <span className="ml-2 bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full text-[9px]">{inBusCount} on board</span>
          </p>
          <button onClick={() => fetchStudents()} className="text-[10px] font-black text-slate-400 flex items-center gap-1 active:scale-90 transition-all">
            <RefreshCw size={11} /> Refresh
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          {students.length === 0 ? (
            <div className="py-12 text-center">
              <Users size={28} className="mx-auto text-slate-200 mb-2" />
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No students assigned</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {students.map((s, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${s.status === 'IN_BUS' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                      {s.studentName?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 leading-tight">{s.studentName}</p>
                      <p className="text-[9px] font-bold text-slate-400">{s.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${s.status === 'IN_BUS' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      {s.status === 'IN_BUS' ? 'On Board' : 'Off Bus'}
                    </span>
                    {s.status === 'IN_BUS' ? (
                      <button onClick={() => handleCheckOut(s.studentId)} className="w-8 h-8 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-100 transition-colors">
                        <UserX size={14} />
                      </button>
                    ) : (
                      <button onClick={() => handleCheckIn(s.studentId)} className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center hover:bg-emerald-100 transition-colors">
                        <UserCheck size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Quick Actions ────────────────────────────────────────────────────── */}
      <section>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-1">Quick Actions</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate(`/transport/tracking/${busData?.busId}`, { state: { bus: busData } })}
            className="bg-white border border-slate-100 rounded-xl p-5 flex flex-col items-center gap-3 shadow-sm hover:shadow-md transition-all active:scale-95 group"
          >
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Navigation2 size={22} />
            </div>
            <div className="text-center">
              <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Live Map</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">View Route</p>
            </div>
          </button>
          <button
            onClick={() => navigate('/notifications')}
            className="bg-white border border-slate-100 rounded-xl p-5 flex flex-col items-center gap-3 shadow-sm hover:shadow-md transition-all active:scale-95 group"
          >
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertCircle size={22} />
            </div>
            <div className="text-center">
              <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Alerts</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Notifications</p>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
};

export default DriverDashboard;

