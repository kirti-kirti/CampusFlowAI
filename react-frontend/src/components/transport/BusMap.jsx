import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Navigation2, MapPin, Wifi, WifiOff, Maximize2, Route, Info } from 'lucide-react';
import { cn } from "@/lib/utils";

// ─── SVG Bus Icon for Google Maps ────────────────────────────────────────────
const BUS_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <circle cx="24" cy="24" r="22" fill="#10b981" stroke="white" stroke-width="3"/>
  <circle cx="24" cy="24" r="18" fill="#10b981" opacity="0.3"/>
  <text x="24" y="30" text-anchor="middle" font-size="20" fill="white">🚌</text>
</svg>`;

const BUS_ICON_URL = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(BUS_SVG)}`;

// ─── Smooth animation between two GPS points ─────────────────────────────────
function animateMarker(marker, map, from, to, durationMs = 1500) {
  if (!window.google || !marker || !from || !to) return;
  const startTime = performance.now();
  const startLat = from.lat;
  const startLng = from.lng;
  const deltaLat = to.lat - startLat;
  const deltaLng = to.lng - startLng;

  function step(now) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / durationMs, 1);
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const lat = startLat + deltaLat * ease;
    const lng = startLng + deltaLng * ease;
    marker.setPosition({ lat, lng });
    if (t < 1) requestAnimationFrame(step);
    else map.panTo({ lat, lng });
  }
  requestAnimationFrame(step);
}

// ─── Haversine distance (km) ──────────────────────────────────────────────────
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const BusMap = ({ busLocation, busNumber, routeName, locationHistory = [], className }) => {
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markerRef = useRef(null);
  const polylineRef = useRef(null);
  const infoWindowRef = useRef(null);
  const prevLocationRef = useRef(null);
  const pulseRef = useRef(null);

  const [mapsReady, setMapsReady] = useState(!!window.google?.maps);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [distanceKm, setDistanceKm] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // ── Wait for Google Maps to load ──────────────────────────────────────────
  useEffect(() => {
    if (window.google?.maps) { setMapsReady(true); return; }
    const interval = setInterval(() => {
      if (window.google?.maps) { setMapsReady(true); clearInterval(interval); }
    }, 300);
    return () => clearInterval(interval);
  }, []);

  // ── Get user's GPS location ───────────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
  }, []);

  // ── Initialize map ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapsReady || !mapRef.current || googleMapRef.current) return;

    const center = busLocation?.latitude
      ? { lat: busLocation.latitude, lng: busLocation.longitude }
      : { lat: 28.6139, lng: 77.209 };

    googleMapRef.current = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 15,
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: 'greedy',
      styles: [
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
        { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
        { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#dadada' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9e8f5' }] },
        { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f2f2f2' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
      ],
    });

    // Bus marker
    markerRef.current = new window.google.maps.Marker({
      position: center,
      map: googleMapRef.current,
      title: busNumber || 'School Bus',
      icon: {
        url: BUS_ICON_URL,
        scaledSize: new window.google.maps.Size(48, 48),
        anchor: new window.google.maps.Point(24, 24),
      },
      zIndex: 999,
    });

    // Pulse circle around bus
    pulseRef.current = new window.google.maps.Circle({
      map: googleMapRef.current,
      center,
      radius: 80,
      fillColor: '#10b981',
      fillOpacity: 0.15,
      strokeColor: '#10b981',
      strokeOpacity: 0.4,
      strokeWeight: 2,
    });

    // Info window
    infoWindowRef.current = new window.google.maps.InfoWindow({
      content: `
        <div style="font-family:sans-serif;padding:8px 12px;min-width:160px">
          <div style="font-weight:900;font-size:13px;color:#0f172a;margin-bottom:4px">🚌 ${busNumber || 'School Bus'}</div>
          <div style="font-size:11px;color:#64748b;font-weight:600">${routeName || 'Campus Route'}</div>
          <div style="margin-top:6px;display:flex;align-items:center;gap:6px">
            <span style="width:8px;height:8px;background:#10b981;border-radius:50%;display:inline-block;animation:pulse 1s infinite"></span>
            <span style="font-size:10px;font-weight:700;color:#10b981;text-transform:uppercase;letter-spacing:0.05em">Live Tracking</span>
          </div>
        </div>`,
    });

    markerRef.current.addListener('click', () => {
      infoWindowRef.current.open(googleMapRef.current, markerRef.current);
    });

    // Route polyline
    polylineRef.current = new window.google.maps.Polyline({
      map: googleMapRef.current,
      path: [],
      strokeColor: '#6366f1',
      strokeOpacity: 0.7,
      strokeWeight: 4,
      icons: [{
        icon: { path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 3, fillColor: '#6366f1', fillOpacity: 1, strokeWeight: 0 },
        offset: '100%',
        repeat: '80px',
      }],
    });

    // User location marker
    if (userLocation) {
      new window.google.maps.Marker({
        position: userLocation,
        map: googleMapRef.current,
        title: 'Your Location',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#6366f1',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
        zIndex: 998,
      });
    }

    prevLocationRef.current = center;
  }, [mapsReady]);

  // ── Update marker when location changes ───────────────────────────────────
  useEffect(() => {
    if (!mapsReady || !busLocation?.latitude || !markerRef.current) return;

    const newPos = { lat: busLocation.latitude, lng: busLocation.longitude };
    const prev = prevLocationRef.current;

    // Smooth animation
    if (prev) {
      animateMarker(markerRef.current, googleMapRef.current, prev, newPos, 1800);
    } else {
      markerRef.current.setPosition(newPos);
      googleMapRef.current?.panTo(newPos);
    }

    // Update pulse circle
    pulseRef.current?.setCenter(newPos);

    // Update route trail
    if (polylineRef.current) {
      const path = polylineRef.current.getPath();
      path.push(new window.google.maps.LatLng(newPos.lat, newPos.lng));
      // Keep last 30 points
      if (path.getLength() > 30) path.removeAt(0);
    }

    // Distance from user
    if (userLocation) {
      const d = haversine(userLocation.lat, userLocation.lng, newPos.lat, newPos.lng);
      setDistanceKm(d.toFixed(2));
    }

    setLastUpdate(new Date());
    prevLocationRef.current = newPos;
  }, [busLocation, mapsReady, userLocation]);

  // ── Fullscreen toggle ─────────────────────────────────────────────────────
  const toggleFullscreen = useCallback(() => {
    const el = mapRef.current?.parentElement;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  // ── Format last update time ───────────────────────────────────────────────
  const timeAgo = lastUpdate
    ? `${Math.round((Date.now() - lastUpdate) / 1000)}s ago`
    : 'Waiting...';

  // ── No Google Maps fallback ───────────────────────────────────────────────
  if (!mapsReady) {
    return (
      <div className={cn("relative w-full h-full min-h-[400px] overflow-hidden bg-slate-900 flex flex-col items-center justify-center text-center p-8 rounded-3xl", className)}>
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(#334155 1px,transparent 1px),linear-gradient(90deg,#334155 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="relative z-10 space-y-6">
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto animate-bounce shadow-2xl">
            <Navigation2 size={40} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Geo-Spatial Telemetry</h3>
            <p className="text-slate-400 text-xs max-w-xs mx-auto leading-relaxed font-bold">
              Secure institutional connection active. Live map interface requires API verification.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full max-w-xs mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left backdrop-blur-md">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">LATITUDE</p>
              <p className="text-white font-mono text-sm font-bold">{busLocation?.latitude?.toFixed(6) || '—'}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left backdrop-blur-md">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">LONGITUDE</p>
              <p className="text-white font-mono text-sm font-bold">{busLocation?.longitude?.toFixed(6) || '—'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full h-full overflow-hidden shadow-2xl", className)}>
      <div ref={mapRef} className="w-full h-full" />

      {/* Floating Meta-Data Overlay */}
      <div className="absolute top-6 left-6 right-6 z-10 flex items-start justify-between gap-4 pointer-events-none">
        <div className="bg-slate-950/90 backdrop-blur-2xl px-6 py-4 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-5 pointer-events-auto max-w-sm">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-primary/20">🚌</div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none">{routeName || 'Campus Route'}</p>
            <p className="text-lg font-black text-white leading-none tracking-tight">{busNumber || 'Fleet Unit'}</p>
          </div>
          <div className="flex items-center gap-2 ml-4 pl-4 border-l border-white/10">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Live</span>
          </div>
        </div>

        <button
          onClick={toggleFullscreen}
          className="w-14 h-14 bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl rounded-2xl shadow-2xl flex items-center justify-center text-slate-500 hover:text-primary transition-all pointer-events-auto active:scale-90 border border-white/20 dark:border-slate-800"
        >
          <Maximize2 size={20} />
        </button>
      </div>

      <div className="absolute bottom-6 left-6 right-6 z-10 pointer-events-none">
        <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl rounded-2xl shadow-2xl p-6 flex flex-wrap items-center justify-between gap-8 pointer-events-auto border border-white/20 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-inner">
              <Wifi size={18} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Latency Sync</p>
              <p className="text-sm font-black text-slate-900 dark:text-white uppercase">{timeAgo}</p>
            </div>
          </div>

          <div className="hidden md:block w-px h-10 bg-slate-100 dark:bg-slate-800" />

          <div className="flex-1 min-w-[120px]">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Telemetry Vector</p>
             <p className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
               {busLocation?.latitude?.toFixed(5)}, {busLocation?.longitude?.toFixed(5)}
             </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Relative Distance</p>
              <p className="text-sm font-black text-slate-900 dark:text-white uppercase">
                {distanceKm ? `${distanceKm} km` : 'CALCULATING...'}
              </p>
            </div>

            {busLocation?.latitude && (
              <a
                href={`https://maps.google.com/?q=${busLocation.latitude},${busLocation.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-90"
              >
                <MapPin size={20} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusMap;
