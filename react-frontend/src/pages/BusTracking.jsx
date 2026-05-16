import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import transportService from '../services/transportService';
import BusMap from '../components/transport/BusMap';
import { AuthContext } from '../context/AuthContext';
import {
  Bus, MapPin, Clock, Users, ArrowLeft, ShieldCheck,
  Navigation2, PhoneCall, Info, ChevronUp, ChevronDown,
  Wifi, WifiOff, RefreshCw, UserCheck, UserX, Route,
  AlertCircle, CheckCircle2, Timer, Sparkles, Map,
  Phone,
  ArrowRight,
  Zap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'react-toastify';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calcETA(distKm) {
  const mins = Math.round((distKm / 30) * 60);
  if (mins < 1) return '< 1 min';
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

const BusTracking = () => {
  const { busId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [busData, setBusData] = useState(location.state?.bus || null);
  const [liveLocation, setLiveLocation] = useState(null);
  const [students, setStudents] = useState([]);
  const [locationHistory, setLocationHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [eta, setEta] = useState(null);
  const [distanceKm, setDistanceKm] = useState(null);
  const [lastPing, setLastPing] = useState(null);
  const [pingCount, setPingCount] = useState(0);
  const prevLocationRef = useRef(null);

  const id = busId || busData?.busId;
  const [etaBanner, setEtaBanner] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
  }, []);

  const fetchAll = async () => {
    if (!id) { setLoading(false); return; }
    try {
      const [details, loc, studentList] = await Promise.all([
        transportService.getBusDetails(id).catch(() => busData),
        transportService.getBusLocation(id).catch(() => null),
        transportService.getBusStudents(id).catch(() => []),
      ]);

      if (details) setBusData(details);

      if (loc?.latitude) {
        setLiveLocation(loc);
        setLastPing(new Date());
        setPingCount(p => p + 1);
        setIsOnline(true);

        setLocationHistory(prev => {
          const newPoint = { lat: loc.latitude, lng: loc.longitude };
          const last = prev[prev.length - 1];
          if (last && last.lat === newPoint.lat && last.lng === newPoint.lng) return prev;
          return [...prev.slice(-29), newPoint];
        });

        if (userLocation) {
          const d = haversine(userLocation.lat, userLocation.lng, loc.latitude, loc.longitude);
          setDistanceKm(d.toFixed(2));
          setEta(calcETA(d));
          if (d < 0.5) setEtaBanner(`🚌 Bus arriving in ${calcETA(d)}!`);
          else setEtaBanner(null);
        }
      } else {
        setIsOnline(false);
      }

      setStudents(studentList);
    } catch {
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 5000);
    return () => clearInterval(interval);
  }, [id, userLocation]);

  const mapData = liveLocation
    ? { ...busData, latitude: liveLocation.latitude, longitude: liveLocation.longitude, lastUpdatedTime: liveLocation.lastUpdatedTime }
    : busData?.latitude ? busData : null;

  const inBusCount = students.filter(s => s.status === 'IN_BUS').length;

  if (loading && !busData) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-[100]">
        <div className="relative mb-8">
           <div className="absolute inset-0 bg-primary/20 rounded-full blur-[40px] animate-pulse" />
           <div className="w-24 h-24 border-4 border-primary/10 border-t-primary rounded-xl animate-spin relative z-10" />
           <div className="absolute inset-0 flex items-center justify-center text-4xl">🚌</div>
        </div>
        <h2 className="text-white font-black uppercase tracking-[0.2em] text-lg mb-2">Connecting...</h2>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Getting the latest bus location.</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-950 overflow-hidden font-sans">
      {/* ── Full-screen Map Background ── */}
      <div className="fixed inset-0 z-0">
        <BusMap
          busLocation={mapData}
          busNumber={busData?.busNumber}
          routeName={busData?.routeName}
          locationHistory={locationHistory}
          className="rounded-none border-none shadow-none"
        />
        {/* Subtle Map Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-slate-950/40 pointer-events-none" />
      </div>

      {/* ── Top Navigation Bar ── */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-4 md:py-8 flex items-center justify-between pointer-events-none max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="w-12 h-12 md:w-14 md:h-14 bg-slate-950/80 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 flex items-center justify-center text-white active:scale-90 transition-all pointer-events-auto"
        >
          <ArrowLeft size={20} className="md:size-6" />
        </button>

        <div className="flex items-center gap-3 md:gap-4 pointer-events-auto">
          <div className={cn(
            "flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2.5 md:py-3 rounded-2xl backdrop-blur-2xl shadow-2xl border border-white/10 transition-all duration-500",
            isOnline ? "bg-emerald-500/80 text-white" : "bg-rose-500/80 text-white"
          )}>
            <div className={cn("w-1.5 h-1.5 md:w-2 md:h-2 rounded-full", isOnline ? "bg-emerald-400 animate-pulse" : "bg-white")} />
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em]">
              {isOnline ? 'Live' : 'Offline'}
            </span>
          </div>

          <button
            onClick={fetchAll}
            className="w-12 h-12 md:w-14 md:h-14 bg-slate-950/80 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 flex items-center justify-center text-white active:scale-90 transition-all"
          >
            <RefreshCw size={18} className={cn("md:size-5", loading && "animate-spin text-primary")} />
          </button>
        </div>
      </div>

      {/* ── Arrival Intelligence Banner ── */}
      {etaBanner && (
        <div className="fixed top-20 md:top-28 left-4 md:left-6 right-4 md:right-6 z-50 bg-slate-950/90 backdrop-blur-3xl text-white rounded-2xl p-4 md:p-6 shadow-2xl border border-primary/30 flex items-center gap-4 md:gap-6 animate-in slide-in-from-top-12 duration-700 max-w-2xl mx-auto">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-primary rounded-xl flex items-center justify-center text-2xl md:text-3xl shadow-xl shadow-primary/20">🚌</div>
          <div className="flex-1">
             <p className="text-[8px] md:text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">Intelligence</p>
             <p className="font-black text-sm md:text-lg leading-tight uppercase">{etaBanner}</p>
          </div>
          <button onClick={() => setEtaBanner(null)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
            <span className="text-xl leading-none">&times;</span>
          </button>
        </div>
      )}

      {/* ── Enterprise Intelligence Drawer ── */}
      <div className={cn(
        "fixed left-0 right-0 z-[60] transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]",
        sheetOpen ? "bottom-0" : "bottom-0"
      )}>
        <div className="max-w-7xl mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl rounded-t-[3.5rem] shadow-[0_-40px_120px_rgba(0,0,0,0.3)] border-t border-white/20 dark:border-slate-800">
          
          {/* Header Action Node */}
          <div 
            className="flex flex-col items-center pt-4 md:pt-6 pb-2 cursor-pointer group"
            onClick={() => setSheetOpen(!sheetOpen)}
          >
            <div className="w-12 md:w-20 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mb-6 md:mb-8 group-hover:bg-primary transition-colors" />
            
            <div className="w-full px-6 md:px-10 pb-6 md:pb-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
              <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-950 rounded-2xl flex items-center justify-center text-3xl md:text-4xl shadow-2xl relative shrink-0">
                  🚌
                  <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-4 h-4 md:w-6 md:h-6 bg-emerald-500 rounded-full border-2 md:border-4 border-white dark:border-slate-900 animate-pulse" />
                </div>
                <div className="space-y-0.5 md:space-y-1">
                  <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] md:tracking-[0.3em]">{busData?.routeName || 'Route Pending'}</p>
                  <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Fleet <span className="text-primary italic">{busData?.busNumber || 'Unit'}</span></h2>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-3 md:gap-6 w-full md:w-auto">
                <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 px-4 md:px-8 py-3 md:py-4 rounded-2xl text-center shadow-sm flex-1 md:flex-none">
                  <p className="text-[8px] md:text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-0.5">ETA</p>
                  <p className="text-sm md:text-xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight">{eta || 'CALC...'}</p>
                </div>
                <div className="bg-primary/5 border border-primary/10 px-4 md:px-8 py-3 md:py-4 rounded-2xl text-center shadow-sm flex-1 md:flex-none">
                  <p className="text-[8px] md:text-[10px] font-black text-primary uppercase tracking-widest mb-0.5">Load</p>
                  <p className="text-sm md:text-xl font-black text-primary tracking-tight">{inBusCount}</p>
                </div>
                <Button variant="ghost" className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 transition-all shrink-0">
                  {sheetOpen ? <ChevronDown size={24} className="md:size-7" /> : <ChevronUp size={24} className="md:size-7" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Detailed Intelligence Modules */}
          <div className={cn(
            "px-10 pb-32 space-y-12 overflow-y-auto no-scrollbar transition-all duration-1000",
            sheetOpen ? "max-h-[75vh] opacity-100 translate-y-0" : "max-h-0 opacity-0 translate-y-10 pointer-events-none"
          )}>
            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="premium-card p-8 flex flex-col items-center gap-4 border-none bg-slate-50 dark:bg-slate-800/50">
                <div className="w-14 h-14 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-xl shadow-emerald-500/20">
                  <Timer size={28} />
                </div>
                <div className="text-center">
                  <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{eta || '—'}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Arrival Vector</p>
                </div>
              </div>
              <div className="premium-card p-8 flex flex-col items-center gap-4 border-none bg-slate-50 dark:bg-slate-800/50">
                <div className="w-14 h-14 bg-primary text-white rounded-xl flex items-center justify-center shadow-xl shadow-primary/20">
                  <MapPin size={28} />
                </div>
                <div className="text-center">
                  <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{distanceKm || '—'}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Relative KM</p>
                </div>
              </div>
              <div className="premium-card p-8 flex flex-col items-center gap-4 border-none bg-slate-50 dark:bg-slate-800/50">
                <div className="w-14 h-14 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-xl shadow-indigo-600/20">
                  <Users size={28} />
                </div>
                <div className="text-center">
                  <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{inBusCount}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Synced Load</p>
                </div>
              </div>
            </div>

            {/* Operator Control Node */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-32 -mt-32" />
              
            <div className="premium-card p-10 flex flex-col md:flex-row items-center justify-between border-none bg-slate-950 text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10 flex items-center gap-8">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-inner">
                  {busData?.driverName?.charAt(0) || 'D'}
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Fleet Operator</p>
                  <h3 className="text-3xl font-black tracking-tighter uppercase leading-none">{busData?.driverName || 'Verified Driver'}</h3>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-400" />
                    <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Protocol Verified</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 flex items-center gap-4 mt-8 md:mt-0">
                <a
                  href={`tel:+91-XXXXXXXXXX`}
                  className="w-18 h-18 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-emerald-500/20 active:scale-95 transition-all group"
                >
                  <PhoneCall size={32} className="group-hover:rotate-12 transition-transform" />
                </a>
              </div>
            </div>

            {/* Geolocation Telemetry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="premium-card p-8 flex items-center gap-6 border-none bg-slate-50 dark:bg-slate-800/50">
                <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl border border-slate-100 dark:border-slate-800">
                  <Navigation2 size={28} className="text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Spatial Vector</p>
                  <p className="text-sm font-mono font-black text-slate-900 dark:text-white">
                    {liveLocation?.latitude?.toFixed(5)}°N, {liveLocation?.longitude?.toFixed(5)}°E
                  </p>
                </div>
              </div>
              <div className="premium-card p-8 flex items-center justify-between border-none bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-6">
                   <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl border border-slate-100 dark:border-slate-800">
                    <Zap size={28} className="text-amber-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">GPS Pulse</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">SYNCHRONIZED</p>
                  </div>
                </div>
                <div className="w-12 h-12 bg-amber-500 text-white rounded-full flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
                  {pingCount}
                </div>
              </div>
            </div>

            {/* Passenger Flow Section */}
            <div className="space-y-8">
              <header className="flex items-center justify-between px-2">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase flex items-center gap-4">
                  <Users size={28} className="text-primary" />
                  Passenger Manifest
                  <Badge className="bg-slate-950 text-white dark:bg-white dark:text-slate-950 border-none text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">{inBusCount} Active</Badge>
                </h3>
              </header>

              {students.length === 0 ? (
                <div className="py-20 text-center premium-card border-dashed border-2 bg-transparent">
                  <Info size={40} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">No synchronized records found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {students.map((student, idx) => (
                    <div key={idx} className="flex items-center justify-between p-6 bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary/40 transition-all group shadow-sm">
                      <div className="flex items-center gap-5">
                        <div className={cn(
                          "w-14 h-14 rounded-xl flex items-center justify-center font-black text-xl shadow-inner transition-all group-hover:scale-110 group-hover:rotate-3",
                          student.status === 'IN_BUS' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        )}>
                          {student.studentName?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none mb-1">{student.studentName}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[140px]">{student.email}</p>
                        </div>
                      </div>
                      <Badge className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center p-0 border-none shadow-sm",
                        student.status === 'IN_BUS' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-300'
                      )}>
                        {student.status === 'IN_BUS' ? <CheckCircle2 size={18} /> : <UserX size={18} />}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation External Call */}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${liveLocation?.latitude},${liveLocation?.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-white w-full h-20 rounded-2xl flex items-center justify-center gap-6 group shadow-2xl shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <Map size={28} className="group-hover:rotate-12 transition-transform" /> 
              <span className="text-xl font-black uppercase tracking-[0.2em]">Launch External Navigator</span>
              <ArrowRight size={28} className="group-hover:translate-x-3 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusTracking;

