import React, { useState, useEffect, useContext, useRef } from 'react';
import transportService from '../services/transportService';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  Bus, MapPin, Clock, Navigation2, Users, Search,
  ArrowRight, Route, Wifi, WifiOff, ChevronRight,
  Timer, RefreshCw, SendHorizonal, Locate, Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

function occupancyColor(count, capacity) {
  const pct = capacity ? count / capacity : 0;
  if (pct >= 0.9) return 'bg-rose-500';
  if (pct >= 0.6) return 'bg-amber-400';
  return 'bg-emerald-500';
}

function timeAgo(isoString) {
  if (!isoString) return 'No data';
  const secs = Math.floor((Date.now() - new Date(isoString)) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  return `${Math.floor(secs / 3600)}h ago`;
}

const DriverPanel = ({ myBus }) => {
  const [sending, setSending] = useState(false);
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState({ lat: '', lng: '' });
  const watchRef = useRef(null);

  const startLiveTracking = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
    setLocating(true);
    toast.success('Location sharing started');
    watchRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat: lat.toFixed(6), lng: lng.toFixed(6) });
        try {
          await transportService.updateLocation({ busId: myBus.busId, latitude: lat, longitude: lng });
        } catch { }
      },
      () => { toast.error('GPS access denied'); setLocating(false); },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
  };

  const stopLiveTracking = () => {
    if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
    setLocating(false);
    toast.info('Location sharing stopped');
  };

  const sendManual = async () => {
    if (!coords.lat || !coords.lng) { toast.error('Waiting for GPS signal'); return; }
    setSending(true);
    try {
      await transportService.updateLocation({ busId: myBus.busId, latitude: parseFloat(coords.lat), longitude: parseFloat(coords.lng) });
      toast.success('Location sent');
    } catch (e) {
      toast.error('Failed to send location');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mb-10 bg-slate-950 rounded-xl p-10 text-white shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-[60px]" />
      
      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/10 shadow-inner">
              <Navigation2 size={28} className="text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight">Driver Controls</p>
              <p className="text-slate-400 text-xs font-medium">Bus {myBus?.busNumber} · {myBus?.routeName}</p>
            </div>
          </div>
          <div className={cn(
            "flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-500",
            locating ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/5 text-slate-400 border-white/10"
          )}>
            <div className={`w-2 h-2 rounded-full ${locating ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            {locating ? 'Sharing Location' : 'Inactive'}
          </div>
        </div>

        {coords.lat && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Latitude</p>
              <p className="font-mono text-sm font-bold text-white">{coords.lat}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Longitude</p>
              <p className="font-mono text-sm font-bold text-white">{coords.lng}</p>
            </div>
          </div>
        )}

        <div className="flex gap-4">
          {!locating ? (
            <button
              onClick={startLiveTracking}
              className="flex-1 btn-premium h-14"
            >
              <Locate size={18} /> <span>Share My Location</span>
            </button>
          ) : (
            <>
              <button
                onClick={stopLiveTracking}
                className="flex-1 py-4 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
              >
                Stop Sharing
              </button>
              <button
                onClick={sendManual}
                disabled={sending}
                className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all active:scale-95"
              >
                <SendHorizonal size={20} className={sending ? 'animate-pulse text-primary' : 'text-white'} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const BusCard = ({ bus, location, userLocation, onClick }) => {
  const distKm = userLocation && location?.latitude
    ? haversine(userLocation.lat, userLocation.lng, location.latitude, location.longitude)
    : null;
  const eta = distKm ? calcETA(distKm) : null;
  const count = location?.studentCount ?? bus?.studentCount ?? 0;
  const capacity = location?.capacity ?? bus?.capacity ?? 40;
  const pct = capacity ? Math.min((count / capacity) * 100, 100) : 0;
  const isLive = location?.lastUpdatedTime
    ? (Date.now() - new Date(location.lastUpdatedTime)) < 5 * 60 * 1000
    : false;

  return (
    <div
      onClick={onClick}
      className="premium-card overflow-hidden group p-0 active:scale-[0.98] transition-all"
    >
      <div className={`h-1.5 w-full ${isLive ? 'bg-primary' : 'bg-slate-100 dark:bg-slate-800'}`} />

      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-900 rounded-xl flex items-center justify-center text-2xl md:text-3xl shadow-xl group-hover:scale-105 transition-transform duration-500">
              🚌
            </div>
            <div>
              <p className="font-black text-slate-900 dark:text-white text-base md:text-lg tracking-tight leading-none mb-1">Bus {bus.busNumber}</p>
              <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Route size={10} className="text-primary md:size-3" /> {bus.routeName}
              </p>
            </div>
          </div>
          <div className={cn(
            "flex items-center gap-2 px-2.5 md:px-3 py-1 md:py-1.5 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all",
            isLive ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-slate-100 text-slate-400 dark:bg-slate-800"
          )}>
            <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
            {isLive ? 'Live' : 'Offline'}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-xl p-2.5 md:p-4 text-center">
            <p className="text-[7px] md:text-[9px] font-bold text-emerald-500 uppercase tracking-widest mb-0.5 md:mb-1">Arrival</p>
            <p className="text-sm md:text-xl font-black text-emerald-700 dark:text-emerald-400 tracking-tighter">{eta || '—'}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5 md:p-4 text-center">
            <p className="text-[7px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 md:mb-1">Away</p>
            <p className="text-sm md:text-xl font-black text-slate-700 dark:text-slate-200 tracking-tighter">
              {distKm ? `${distKm.toFixed(1)}k` : '—'}
            </p>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-xl p-2.5 md:p-4 text-center">
            <p className="text-[7px] md:text-[9px] font-bold text-indigo-400 uppercase tracking-widest mb-0.5 md:mb-1">Students</p>
            <p className="text-sm md:text-xl font-black text-indigo-700 dark:text-indigo-400 tracking-tighter">{count}</p>
          </div>
        </div>

        <div className="space-y-2 md:space-y-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Users size={10} className="md:size-3" /> Space
            </span>
            <span className="text-[8px] md:text-[10px] font-black text-slate-600 dark:text-slate-300">{count} / {capacity}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 md:h-2.5 rounded-full overflow-hidden shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${occupancyColor(count, capacity)}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 md:pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center font-black text-slate-600 dark:text-slate-300 text-xs md:text-sm shadow-sm border border-slate-200 dark:border-slate-700">
              {bus.driverName?.charAt(0) || 'D'}
            </div>
            <div>
              <p className="text-[7px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5 md:mb-1">Driver</p>
              <p className="text-xs md:text-sm font-bold text-slate-900 dark:text-white leading-none">{bus.driverName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            {location?.lastUpdatedTime && (
              <span className="text-[8px] md:text-[10px] font-bold text-slate-400 flex items-center gap-1 md:gap-1.5 bg-slate-50 dark:bg-slate-800 px-2 md:px-3 py-1 md:py-1.5 rounded-full">
                <Clock size={10} className="text-primary md:size-3" /> {timeAgo(location.lastUpdatedTime)}
              </span>
            )}
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:bg-primary group-hover:text-white flex items-center justify-center text-slate-300 transition-all duration-500 shadow-sm group-hover:shadow-lg group-hover:shadow-primary/30">
              <ChevronRight size={18} className="md:size-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Transport = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [buses, setBuses] = useState([]);
  const [locations, setLocations] = useState({});
  const [myBus, setMyBus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [online, setOnline] = useState(true);

  const role = user?.role;
  const isAdmin = role === 'ADMIN';
  const isDriver = role === 'TEACHER';
  const isStudentOrParent = role === 'STUDENT' || role === 'PARENT';

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
  }, []);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      if (isAdmin) {
        const data = await transportService.getAllBuses();
        setBuses(data);
        const locResults = await Promise.allSettled(
          data.map(b => transportService.getBusLocation(b.busId))
        );
        const locMap = {};
        locResults.forEach((r, i) => {
          if (r.status === 'fulfilled') locMap[data[i].busId] = r.value;
        });
        setLocations(locMap);
      } else if (isDriver) {
        const loc = await transportService.getMyBus().catch(() => null);
        if (loc) {
          setMyBus(loc);
          setBuses([{ busId: loc.busId, busNumber: loc.busNumber, driverName: loc.driverName, routeName: loc.routeName, capacity: loc.capacity }]);
          setLocations({ [loc.busId]: loc });
        }
      } else if (isStudentOrParent) {
        const loc = await transportService.getMyBus().catch((e) => {
          const msg = e.response?.data?.message || '';
          if (msg.includes('not been assigned')) {
            toast.info('You have not been assigned to a bus yet.');
          }
          return null;
        });
        if (loc) {
          setBuses([{ busId: loc.busId, busNumber: loc.busNumber, driverName: loc.driverName, routeName: loc.routeName, capacity: loc.capacity }]);
          setLocations({ [loc.busId]: loc });
        }
      }
      setOnline(true);
    } catch {
      setOnline(false);
      if (!silent) toast.error('Failed to load bus data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 10000);
    return () => clearInterval(interval);
  }, [role]);

  const filtered = buses.filter(b =>
    b.busNumber?.toLowerCase().includes(search.toLowerCase()) ||
    b.routeName?.toLowerCase().includes(search.toLowerCase()) ||
    b.driverName?.toLowerCase().includes(search.toLowerCase()) ||
    b.busId?.toLowerCase().includes(search.toLowerCase())
  );

  const liveCount = Object.values(locations).filter(l =>
    l?.lastUpdatedTime && (Date.now() - new Date(l.lastUpdatedTime)) < 5 * 60 * 1000
  ).length;

  return (
    <div className="pb-32 px-6 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-5xl mx-auto">
      {/* Header */}
      <header className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 px-2">
        <div className="space-y-2 md:space-y-3">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-[8px] md:text-[10px] font-black uppercase tracking-widest rounded-full">
              <Sparkles size={10} className="md:size-3" /> School Transport
            </div>
            {refreshing && <RefreshCw size={12} className="text-primary animate-spin md:size-[14px]" />}
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-none uppercase">Bus Tracking</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-lg">
            {isAdmin ? `Fleet Oversight · ${buses.length} Buses` : 'Real-time arrival and location tracking.'}
          </p>
        </div>
        
        <div className="flex flex-col items-start md:items-end gap-2 md:gap-3">
          <div className={cn(
            "flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest border-2 transition-all duration-500 shadow-sm",
            online ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-900/20" : "bg-rose-50 text-rose-500 border-rose-100 dark:bg-rose-900/10 dark:text-rose-400 dark:border-rose-900/20"
          )}>
            {online ? <Wifi size={14} className="md:size-4" /> : <WifiOff size={14} className="md:size-4" />}
            <span>{online ? 'System Active' : 'Offline'}</span>
          </div>
          <button 
            onClick={() => fetchData(true)}
            className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-[8px] md:text-[10px] font-black text-slate-400 hover:text-primary transition-all uppercase tracking-widest"
          >
            <RefreshCw size={10} className="md:size-3" /> Sync Status
          </button>
        </div>
      </header>

      {/* Driver panel */}
      {isDriver && myBus && (
        <section className="mb-12 animate-in zoom-in-95 duration-700">
           <DriverPanel myBus={myBus} />
        </section>
      )}

      {/* Search — admin only */}
      {isAdmin && (
        <section className="mb-8 md:mb-12 relative group">
          <Search className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors size-5 md:size-[22px]" />
          <input
            placeholder="Search fleet by bus ID, route, or driver..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-14 md:h-18 pl-12 md:pl-16 pr-6 md:pr-8 bg-white dark:bg-slate-900 border-none shadow-2xl shadow-slate-200/50 dark:shadow-none rounded-xl text-sm md:text-lg font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-primary/10 transition-all outline-none placeholder:text-slate-400"
          />
        </section>
      )}

      {/* Bus list */}
      <section className="grid gap-10">
        {loading ? (
          <div className="grid gap-10">
            {[1, 2].map(i => (
              <div key={i} className="h-80 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 animate-pulse shadow-sm" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-10">
            {filtered.map((bus) => (
              <BusCard
                key={bus.busId}
                bus={bus}
                location={locations[bus.busId]}
                userLocation={userLocation}
                onClick={() => navigate(`/transport/tracking/${bus.busId}`, { state: { bus } })}
              />
            ))}
          </div>
        ) : (
          <div className="py-32 text-center premium-card border-dashed">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-8 text-5xl shadow-inner">
              🚌
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
              {search ? 'No Matches Found' : 'No Route Assigned'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-md mx-auto">
              {search ? `We couldn't find any buses matching "${search}".` : isStudentOrParent ? 'You haven\'t been assigned to a school route yet. Please contact the transport office.' : 'There are no buses currently registered in the system.'}
            </p>
            {search && (
              <Button 
                variant="outline" 
                onClick={() => setSearch('')}
                className="mt-8 rounded-xl px-8"
              >
                Clear Search
              </Button>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Transport;

