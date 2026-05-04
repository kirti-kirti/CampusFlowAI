import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Navigation2, MapPin, Wifi, WifiOff, Maximize2 } from 'lucide-react';

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

  // Calculate bearing for marker rotation
  const bearing = window.google.maps.geometry
    ? window.google.maps.geometry.spherical.computeHeading(
        new window.google.maps.LatLng(from.lat, from.lng),
        new window.google.maps.LatLng(to.lat, to.lng)
      )
    : 0;

  function step(now) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / durationMs, 1);
    // Ease in-out cubic
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

// ─── ETA calculation (assume 30 km/h avg speed) ───────────────────────────────
function calcETA(distKm) {
  const mins = Math.round((distKm / 30) * 60);
  if (mins < 1) return '< 1 min';
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

const BusMap = ({ busLocation, busNumber, routeName, locationHistory = [] }) => {
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
      <div className="relative w-full h-[480px] rounded-[2rem] overflow-hidden bg-slate-900 flex flex-col items-center justify-center text-center p-8">
        {/* Animated grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(#334155 1px,transparent 1px),linear-gradient(90deg,#334155 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />

        <div className="relative z-10 space-y-6">
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto animate-bounce">
            <Navigation2 size={40} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white mb-2">Live GPS Telemetry</h3>
            <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
              Add your Google Maps API key to <code className="text-emerald-400 bg-white/5 px-1 rounded">.env</code> to enable the live map.
            </p>
          </div>

          {/* Coordinate display */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Latitude</p>
              <p className="text-white font-mono text-sm font-bold">{busLocation?.latitude?.toFixed(6) || '—'}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Longitude</p>
              <p className="text-white font-mono text-sm font-bold">{busLocation?.longitude?.toFixed(6) || '—'}</p>
            </div>
          </div>

          {busLocation?.latitude && (
            <a
              href={`https://maps.google.com/?q=${busLocation.latitude},${busLocation.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black text-sm hover:bg-emerald-400 transition-colors"
            >
              <MapPin size={16} /> Open in Google Maps
            </a>
          )}
        </div>

        {/* Live indicator */}
        <div className="absolute bottom-5 right-5 flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-full">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Telemetry Active</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[480px] rounded-[2rem] overflow-hidden shadow-2xl border-2 border-white/50">
      {/* Google Map canvas */}
      <div ref={mapRef} className="w-full h-full" />

      {/* ── Top overlay: Bus info pill ── */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between gap-3 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-xl px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 pointer-events-auto">
          <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center text-white text-sm">🚌</div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{routeName || 'Campus Route'}</p>
            <p className="text-sm font-black text-slate-900 leading-tight">{busNumber || 'School Bus'}</p>
          </div>
          <div className="flex items-center gap-1.5 ml-2 pl-3 border-l border-slate-100">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Live</span>
          </div>
        </div>

        <button
          onClick={toggleFullscreen}
          className="w-10 h-10 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl flex items-center justify-center text-slate-500 hover:text-primary transition-colors pointer-events-auto"
        >
          <Maximize2 size={16} />
        </button>
      </div>

      {/* ── Bottom overlay: Stats bar ── */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-4 flex items-center justify-between gap-4">
          {/* Last update */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center">
              <Wifi size={14} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Updated</p>
              <p className="text-xs font-black text-slate-900">{timeAgo}</p>
            </div>
          </div>

          <div className="w-px h-8 bg-slate-100" />

          {/* Coordinates */}
          <div className="flex-1 text-center">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Position</p>
            <p className="text-[10px] font-mono font-bold text-slate-700">
              {busLocation?.latitude?.toFixed(4)}, {busLocation?.longitude?.toFixed(4)}
            </p>
          </div>

          <div className="w-px h-8 bg-slate-100" />

          {/* Distance from user */}
          <div className="text-right">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Distance</p>
            <p className="text-xs font-black text-slate-900">
              {distanceKm ? `${distanceKm} km` : 'Locating...'}
            </p>
          </div>

          {/* Open in Maps */}
          {busLocation?.latitude && (
            <a
              href={`https://maps.google.com/?q=${busLocation.latitude},${busLocation.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white hover:bg-primary/90 transition-colors shrink-0"
            >
              <MapPin size={16} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusMap;
