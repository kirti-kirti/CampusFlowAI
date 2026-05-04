import React, { useState, useEffect } from 'react';
import transportService from '../services/transportService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  Bus, 
  MapPin, 
  Clock, 
  Navigation2, 
  Users, 
  Wifi, 
  Zap, 
  ShieldCheck,
  Search,
  Filter,
  ArrowRight,
  Route,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const Transport = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBuses();
    const interval = setInterval(fetchBuses, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchBuses = async () => {
    try {
      const data = await transportService.getAllBuses();
      setBuses(data);
    } catch (err) {
      toast.error('Telemetry sync failed');
    } finally {
      setLoading(false);
    }
  };

  const filtered = buses.filter(b =>
    b.busNumber?.toLowerCase().includes(search.toLowerCase()) ||
    b.routeName?.toLowerCase().includes(search.toLowerCase()) ||
    b.driverName?.toLowerCase().includes(search.toLowerCase()) ||
    b.busId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-4 pb-20 animate-in fade-in duration-1000 max-w-5xl mx-auto">
      <header className="mb-10 pt-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Badge variant="outline" className="mb-3 px-3 py-1 border-emerald-100 bg-emerald-50/30 text-emerald-600 font-bold tracking-widest text-[10px] uppercase">
            Logistics & Fleet
          </Badge>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 leading-none mb-3">Campus Transit</h1>
          <p className="text-slate-500 font-medium text-lg">Real-time telemetry and fleet coordination.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Telemetry</span>
          </div>
        </div>
      </header>

      {/* Dynamic Map Mock / Visualization Card */}
      <Card className="mb-10 border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] bg-slate-900 rounded-[2.5rem] overflow-hidden relative group">
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        </div>
        
        <CardContent className="p-10 relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white tracking-tight">Infrastructure Map</h2>
              <p className="text-slate-400 font-medium leading-relaxed">
                Global fleet positioning system. Active monitoring of {buses.length} transport units across the campus perimeter.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-3 px-5 py-3 bg-white/5 rounded-2xl border border-white/10">
                <Wifi size={18} className="text-emerald-400" />
                <span className="text-white font-bold text-xs">Satellite Linked</span>
              </div>
              <div className="flex items-center gap-3 px-5 py-3 bg-white/5 rounded-2xl border border-white/10">
                <Activity size={18} className="text-primary" />
                <span className="text-white font-bold text-xs">99.8% Uptime</span>
              </div>
            </div>
          </div>
          <div className="shrink-0 w-full md:w-auto">
            <div className="w-full md:w-64 aspect-square bg-slate-800 rounded-[3rem] border border-slate-700 shadow-2xl relative flex items-center justify-center overflow-hidden group">
              <Navigation2 size={64} className="text-emerald-500 animate-bounce" />
              <div className="absolute inset-0 border-[2px] border-emerald-500/20 rounded-[3rem] animate-ping" />
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Scanning Grid</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
          <Input
            placeholder="Search vehicle ID, route, or driver..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-14 pl-14 pr-6 bg-white border-none shadow-sm rounded-2xl text-base focus-visible:ring-emerald-500/10 transition-all font-medium"
          />
        </div>
      </div>

      {/* Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-64 rounded-[2rem] bg-slate-100 animate-pulse" />)
        ) : filtered.length > 0 ? (
          filtered.map((bus, index) => (
            <Card 
              key={index} 
              onClick={() => navigate(`/transport/tracking/${bus.busId}`, { state: { bus } })}
              className="border-none shadow-[0_4px_20px_rgba(0,0,0,0.02)] bg-white rounded-[2rem] overflow-hidden group hover:shadow-xl transition-all cursor-pointer"
            >
              <CardHeader className="pt-6 px-6 pb-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform shadow-inner">
                    <Bus size={28} />
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[10px] font-black uppercase tracking-widest px-3 py-1">
                    Active
                  </Badge>
                </div>
                <CardTitle className="text-xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">{bus.busNumber}</CardTitle>
                <CardDescription className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-widest text-slate-400">
                  <Route size={12} className="text-slate-300" /> {bus.routeName}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-slate-400 flex items-center gap-2"><MapPin size={16} /> Current Station</span>
                    <span className="text-slate-900 font-bold">{bus.currentLocation || 'Main Terminal'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-slate-400 flex items-center gap-2"><Clock size={16} /> ETA Schedule</span>
                    <span className="text-emerald-600 font-black">4 MINS</span>
                  </div>
                  <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[70%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="px-6 pb-6 pt-2">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Users size={14} /> 24 / 40 Cap
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                    <ArrowRight size={18} />
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Bus size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">
              {search ? 'No Results Found' : 'No Active Fleet Detected'}
            </h3>
            <p className="text-slate-400 font-medium text-sm">
              {search ? `No buses match "${search}"` : 'All transport units are currently offline or in maintenance.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transport;
