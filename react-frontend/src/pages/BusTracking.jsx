import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import transportService from '../services/transportService';
import BusMap from '../components/transport/BusMap';
import { AuthContext } from '../context/AuthContext';
import {
  Bus, MapPin, Clock, Users, ArrowLeft, ShieldCheck,
  Navigation2, PhoneCall, Info, ChevronUp, ChevronDown,
  Wifi, WifiOff, RefreshCw, UserCheck, UserX, Route,
  AlertCircle, CheckCircle2, Timer
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'react-toastify';

// ─── Haversine distance ───────────────────────────────────────────────────────
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

  // ── Get user GPS ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
  }, []);

  // ── Fetch all data ──────────────────────────────────────────────────────────
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

        // Append to history trail
        setLocationHistory(prev => {
          const newPoint = { lat: loc.latitude, lng: loc.longitude };
          const last = prev[prev.length - 1];
          if (last && last.lat === newPoint.lat && last.lng === newPoint.lng) return prev;
          return [...prev.slice(-29), newPoint];
        });

        // ETA from user location
        if (userLocation) {
          const d = haversine(userLocation.lat, userLocation.lng, loc.latitude, loc.longitude);
          setDistanceKm(d.toFixed(2));
          setEta(calcETA(d));
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

  // ── Merge busData + liveLocation for BusMap ─────────────────────────────────
  const mapData = liveLocation
    ? { ...busData, latitude: liveLocation.latitude, longitude: liveLocation.longitude, lastUpdatedTime: liveLocation.lastUpdatedTime }
    : busData?.latitude ? busData : null;

  const inBusCount = students.filter(s => s.status === 'IN_BUS').length;

  // ── Loading screen ──────────────────────────────────────────────────────────
  if (loading && !busData) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center z-50">
        <div className="relative mb-8">
          <div className="w-20 h-20 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-2xl">🚌</div>
        </div>
        <p className="text-white font-black uppercase tracking-widest text-sm mb-2">Establishing Link</p>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Syncing GPS telemetry...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-100 overflow-hidden">

      {/* ── Full-screen Map ─────────────────────────────────────────────────── */}
      <div className="fixed inset-0 z-0">
        <BusMap
          busLocation={mapData}
          busNumber={busData?.busNumber}
          routeName={busData?.routeName}
          locationHistory={locationHistory}
        />
      </div>

      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-20 px-4 pt-4 pb-2 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="w-11 h-11 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl flex items-center justify-center text-slate-700 active:scale-90 transition-all"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex items-center gap-2">
          {/* Connection status */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-2xl backdrop-blur-xl shadow-xl ${isOnline ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
            {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
            <span className="text-[9px] font-black uppercase tracking-widest">
              {isOnline ? 'Live' : 'Offline'}
            </span>
          </div>

          <button
            onClick={fetchAll}
            className="w-11 h-11 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl flex items-center justify-center text-slate-700 active:scale-90 transition-all"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-primary' : ''} />
          </button>
        </div>
      </div>

      {/* ── Bottom Sheet ────────────────────────────────────────────────────── */}
      <div className={`fixed left-0 right-0 z-20 transition-all duration-500 ease-in-out ${sheetOpen ? 'bottom-0' : 'bottom-0'}`}
        style={{ bottom: 0 }}>

        {/* Sheet handle + collapsed preview */}
        <div
          className="bg-white rounded-t-[2.5rem] shadow-[0_-20px_60px_rgba(0,0,0,0.15)] cursor-pointer"
          onClick={() => setSheetOpen(o => !o)}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-4 pb-2">
            <div className="w-10 h-1 bg-slate-200 rounded-full" />
          </div>

          {/* Collapsed: quick stats row */}
          <div className="px-6 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg">
                🚌
              </div>
              <div>
                <p className="font-black text-slate-900 text-base leading-tight">{busData?.busNumber || 'School Bus'}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{busData?.routeName || 'Campus Route'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* ETA pill */}
              <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-2xl text-center">
                <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">ETA</p>
                <p className="text-sm font-black text-emerald-700">{eta || '—'}</p>
              </div>

              {/* Students pill */}
              <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-2xl text-center">
                <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">On Bus</p>
                <p className="text-sm font-black text-indigo-700">{inBusCount}</p>
              </div>

              <div className={`w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 transition-transform ${sheetOpen ? 'rotate-180' : ''}`}>
                <ChevronUp size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Expanded content */}
        {sheetOpen && (
          <div className="bg-white px-6 pb-8 space-y-6 max-h-[60vh] overflow-y-auto">

            {/* ── Stats Grid ── */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 rounded-2xl p-4 text-center">
                <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Timer size={16} className="text-emerald-600" />
                </div>
                <p className="text-lg font-black text-slate-900">{eta || '—'}</p>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">ETA</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 text-center">
                <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <MapPin size={16} className="text-indigo-600" />
                </div>
                <p className="text-lg font-black text-slate-900">{distanceKm ? `${distanceKm}` : '—'}</p>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">km away</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 text-center">
                <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Users size={16} className="text-amber-600" />
                </div>
                <p className="text-lg font-black text-slate-900">{inBusCount}</p>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Students</p>
              </div>
            </div>

            {/* ── Driver Card ── */}
            <div className="bg-slate-50 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl border-2 border-slate-100 flex items-center justify-center text-slate-700 font-black text-lg shadow-sm">
                  {busData?.driverName?.charAt(0) || 'D'}
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Driver</p>
                  <p className="font-black text-slate-900">{busData?.driverName || 'Assigned Driver'}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <ShieldCheck size={10} className="text-emerald-500" />
                    <span className="text-[9px] font-bold text-emerald-600">Verified</span>
                  </div>
                </div>
              </div>
              <a
                href={`tel:+91-XXXXXXXXXX`}
                className="w-11 h-11 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 active:scale-90 transition-all"
              >
                <PhoneCall size={18} />
              </a>
            </div>

            {/* ── Live Location ── */}
            <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Navigation2 size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">GPS Coordinates</p>
                  <p className="text-xs font-mono font-bold text-slate-700">
                    {liveLocation?.latitude?.toFixed(5)}, {liveLocation?.longitude?.toFixed(5)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pings</p>
                <p className="text-sm font-black text-slate-900">{pingCount}</p>
              </div>
            </div>

            {/* ── Passenger Manifest ── */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  Passengers
                  <span className="bg-indigo-100 text-indigo-600 text-[9px] font-black px-2 py-0.5 rounded-full">{inBusCount} on board</span>
                </h3>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{students.length} total</span>
              </div>

              {students.length === 0 ? (
                <div className="py-8 text-center bg-slate-50 rounded-2xl">
                  <Info size={24} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No passengers checked in</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {students.map((student, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                          student.status === 'IN_BUS' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {student.studentName?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{student.studentName}</p>
                          <p className="text-[9px] font-bold text-slate-400">{student.email}</p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        student.status === 'IN_BUS'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {student.status === 'IN_BUS'
                          ? <><UserCheck size={10} /> On Board</>
                          : <><UserX size={10} /> Off Bus</>
                        }
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Open in Google Maps ── */}
            {liveLocation?.latitude && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${liveLocation.latitude},${liveLocation.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm active:scale-95 transition-all shadow-xl"
              >
                <MapPin size={18} /> Get Directions in Google Maps
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BusTracking;
