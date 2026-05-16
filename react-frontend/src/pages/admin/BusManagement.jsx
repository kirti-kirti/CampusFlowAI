import React, { useState, useEffect, useContext } from 'react';
import {
  Bus, Plus, Pencil, Trash2, Users, MapPin, Route,
  ArrowLeft, X, ChevronRight, UserCheck, UserX,
  RefreshCw, Search, Navigation2, Sparkles,
  Zap,
  Phone,
  ArrowRight,
  ShieldCheck,
  Timer
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import transportService from '../../services/transportService';
import adminService from '../../services/adminService';
import { AuthContext } from '../../context/AuthContext';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import routeService from '../../services/routeService';

const EMPTY_FORM = {
  busId: '', busNumber: '', driverName: '', driverId: '',
  routeName: '', routeId: '', assignedClass: '', capacity: 40
};

const OccupancyBar = ({ count, capacity }) => {
  const pct = capacity ? Math.min((count / capacity) * 100, 100) : 0;
  const color = pct >= 90 ? 'bg-rose-500' : pct >= 60 ? 'bg-amber-400' : 'bg-emerald-500';
  return (
    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden shadow-inner">
      <div className={`h-full rounded-full transition-all duration-1000 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
};

const ManifestModal = ({ bus, onClose }) => {
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, [bus.busId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [manifest, all] = await Promise.all([
        transportService.getBusStudents(bus.busId),
        adminService.getStudents().catch(() => [])
      ]);
      setStudents(manifest);
      setAllStudents(all);
    } catch {
      toast.error('Failed to load student list');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (studentId) => {
    setCheckingIn(studentId);
    try {
      await transportService.checkIn({ busId: bus.busId, studentId });
      toast.success('Student checked in');
      fetchData();
    } catch (e) {
      toast.error('Check-in failed');
    } finally {
      setCheckingIn(null);
    }
  };

  const handleCheckOut = async (studentId) => {
    setCheckingIn(studentId);
    try {
      await transportService.checkOut({ busId: bus.busId, studentId });
      toast.success('Student checked out');
      fetchData();
    } catch (e) {
      toast.error('Check-out failed');
    } finally {
      setCheckingIn(null);
    }
  };

  const onBusIds = new Set(students.filter(s => s.status === 'IN_BUS').map(s => s.studentId));
  const inBusCount = onBusIds.size;

  const mappedIds = new Set(students.map(s => s.studentId));
  const unmapped = allStudents
    .filter(s => !mappedIds.has(s.id))
    .map(s => ({ studentId: s.id, studentName: s.name, email: s.email, status: 'NOT_MAPPED' }));
  const fullList = [...students, ...unmapped].filter(s =>
    s.studentName?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />
      <div className="relative w-full md:max-w-xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom-10 duration-500 border border-white/20 dark:border-slate-800">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[60px] -mr-24 -mt-24" />
        
        <header className="px-10 pt-10 pb-6 border-b border-slate-100 dark:border-slate-800 relative z-10">
          <div className="flex md:hidden justify-center mb-6">
            <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
          </div>
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-slate-950 rounded-xl flex items-center justify-center text-3xl shadow-xl">🚌</div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Bus {bus.busNumber}</h3>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                  <Route size={12} className="text-primary" /> {bus.routeName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 px-6 py-2.5 rounded-xl text-center shadow-sm">
                <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-0.5">On Board</p>
                <p className="text-lg font-black text-indigo-700 dark:text-indigo-400 leading-none">{inBusCount}</p>
              </div>
              <button onClick={onClose} className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all">
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="relative mt-8 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
            <input
              placeholder="Search students..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-14 pl-16 pr-6 bg-slate-100/50 dark:bg-slate-800/50 border-none rounded-xl text-base font-bold dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
        </header>

        <div className="overflow-y-auto no-scrollbar flex-1 px-8 py-6 space-y-4">
          {loading ? (
            [1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-slate-50 dark:bg-slate-800/50 rounded-xl animate-pulse" />)
          ) : fullList.length === 0 ? (
            <div className="py-24 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto shadow-inner">
                <Users size={32} className="text-slate-200" />
              </div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No students found</p>
            </div>
          ) : fullList.map((s, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl group border border-transparent hover:border-primary/20 transition-all">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shadow-inner",
                  s.status === 'IN_BUS' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                )}>
                  {s.studentName?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="text-base font-black text-slate-900 dark:text-white tracking-tight">{s.studentName}</p>
                  <p className="text-[10px] font-bold text-slate-400 truncate max-w-[140px]">{s.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={cn(
                  "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-none shadow-sm",
                  s.status === 'IN_BUS' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                )}>
                  {s.status === 'IN_BUS' ? 'On Board' : s.status === 'OUT_BUS' ? 'Off Bus' : 'Not Mapped'}
                </Badge>
                {s.status === 'IN_BUS' ? (
                  <button
                    onClick={() => handleCheckOut(s.studentId)}
                    disabled={checkingIn === s.studentId}
                    className="w-10 h-10 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50 active:scale-90"
                  >
                    {checkingIn === s.studentId ? <RefreshCw size={18} className="animate-spin" /> : <UserX size={18} />}
                  </button>
                ) : (
                  <button
                    onClick={() => handleCheckIn(s.studentId)}
                    disabled={checkingIn === s.studentId}
                    className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50 active:scale-90"
                  >
                    {checkingIn === s.studentId ? <RefreshCw size={18} className="animate-spin" /> : <UserCheck size={18} />}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <footer className="px-10 pb-10 pt-4 relative z-10">
          <button onClick={fetchData} className="btn-premium w-full h-16 !rounded-xl flex items-center justify-center gap-3 group">
            <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
            <span>Refresh Student List</span>
          </button>
        </footer>
      </div>
    </div>
  );
};

const BusFormModal = ({ initial, onClose, onSave, routes = [] }) => {
  const [form, setForm] = useState(initial ? { ...initial, routeId: initial.routeId || '' } : EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial;

  // When a route is selected, auto-fill routeName
  const handleRouteChange = (routeId) => {
    const route = routes.find(r => String(r.id) === String(routeId));
    setForm({ ...form, routeId, routeName: route ? route.name : form.routeName });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const field = (label, key, type = 'text', placeholder = '', icon) => (
    <div className="space-y-2">
      <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">{label}</Label>
      <div className="relative group">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
          {icon}
        </div>
        <input
          required={key !== 'assignedClass'}
          type={type}
          placeholder={placeholder}
          value={form[key]}
          onChange={e => setForm({ ...form, [key]: e.target.value })}
          className="w-full h-14 pl-14 pr-6 bg-slate-100/50 dark:bg-slate-800/50 border-none rounded-xl text-base font-bold dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 outline-none"
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl p-10 md:p-14 shadow-2xl animate-in zoom-in-95 duration-500 border border-white/20 dark:border-slate-800 overflow-y-auto max-h-[90vh] no-scrollbar">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-32 -mt-32" />
        
        <button type="button" onClick={onClose} className="absolute top-10 right-10 w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all z-10">
          <X size={24} />
        </button>

        <header className="mb-10 relative z-10">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
            <Bus size={12} /> {isEdit ? 'Update Details' : 'Registration'}
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{isEdit ? 'Update Bus Info' : 'Register New Bus'}</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg mt-2">{isEdit ? `Updating information for Bus ${initial.busNumber}` : 'Add a new bus to the campus fleet.'}</p>
        </header>

        <div className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {field('Bus ID', 'busId', 'text', 'e.g. BUS-01', <Zap size={18} />)}
            {field('Bus Number', 'busNumber', 'text', 'e.g. MH-12-AB-1234', <Bus size={18} />)}
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Active Route Selection</Label>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                <Route size={18} />
              </div>
              <select
                required
                value={form.routeId}
                onChange={e => handleRouteChange(e.target.value)}
                className="w-full h-14 pl-14 pr-6 bg-slate-100/50 dark:bg-slate-800/50 border-none rounded-xl text-base font-bold dark:text-white focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer"
              >
                <option value="">Select Target Route</option>
                {routes.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {field('Driver Name', 'driverName', 'text', 'Full Name', <UserCheck size={18} />)}
            {field('Driver User ID', 'driverId', 'text', 'ID Number', <ShieldCheck size={18} />)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {field('Assigned Class', 'assignedClass', 'text', 'Optional', <Users size={18} />)}
            {field('Total Capacity', 'capacity', 'number', '40', <Timer size={18} />)}
          </div>

          <Button type="submit" disabled={saving} className="btn-premium w-full h-18 !rounded-xl group mt-6 shadow-2xl">
            {saving ? <RefreshCw className="animate-spin" size={24} /> : (
              <span className="flex items-center gap-3 text-lg">
                {isEdit ? 'Update Bus' : 'Add School Bus'} <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

const BusManagement = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [buses, setBuses] = useState([]);
  const [locations, setLocations] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [routes, setRoutes] = useState([]);
  const [formModal, setFormModal] = useState(null);
  const [manifestBus, setManifestBus] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(() => fetchLocations(), 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [busData, routeData] = await Promise.all([
        transportService.getAllBuses(),
        routeService.getRoutes()
      ]);
      setBuses(busData);
      setRoutes(routeData);
      fetchLocations(busData);
    } catch {
      toast.error('Could not load transport data');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async (busList = buses) => {
    const results = await Promise.allSettled(
      busList.map(b => transportService.getBusLocation(b.busId))
    );
    const map = {};
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') map[busList[i].busId] = r.value;
    });
    setLocations(map);
  };

  const handleAdd = async (form) => {
    try {
      await transportService.addBus(form);
      toast.success('Bus added to fleet');
      setFormModal(null);
      fetchAll();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to add bus');
      throw e;
    }
  };

  const handleEdit = async (form) => {
    try {
      await transportService.updateBus(formModal.busId, form);
      toast.success('Bus details updated');
      setFormModal(null);
      fetchAll();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update bus');
      throw e;
    }
  };

  const handleDelete = async (busId) => {
    if (!window.confirm(`Delete bus ${busId}? This action cannot be undone.`)) return;
    setDeleting(busId);
    try {
      await transportService.deleteBus(busId);
      toast.success('Bus removed from fleet');
      fetchAll();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete bus');
    } finally {
      setDeleting(null);
    }
  };

  const filtered = buses.filter(b =>
    b.busNumber?.toLowerCase().includes(search.toLowerCase()) ||
    b.routeName?.toLowerCase().includes(search.toLowerCase()) ||
    b.driverName?.toLowerCase().includes(search.toLowerCase()) ||
    b.busId?.toLowerCase().includes(search.toLowerCase())
  );

  const totalOnBus = buses.reduce((sum, b) => sum + (b.studentCount || 0), 0);
  const liveCount = Object.values(locations).filter(l =>
    l?.lastUpdatedTime && (Date.now() - new Date(l.lastUpdatedTime)) < 5 * 60 * 1000
  ).length;

  return (
    <div className="pb-32 px-6 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-7xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">
            <Sparkles size={12} /> School Transport
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-none">Manage School Buses</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Oversee fleet status and student manifests.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <Button 
            onClick={fetchAll} 
            variant="outline"
            className="w-14 h-14 rounded-xl border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-xl active:scale-95 group"
          >
            <RefreshCw size={20} className={cn(loading && "animate-spin text-primary")} />
          </Button>
          <Button 
            onClick={() => navigate('/admin/routes')}
            variant="outline"
            className="h-14 !rounded-xl px-8 gap-3 border-slate-200 dark:border-slate-800 text-slate-600 hover:text-primary transition-all shadow-xl active:scale-95"
          >
            <Route size={20} />
            <span>Manage Routes</span>
          </Button>
          <Button 
            onClick={() => setFormModal('add')}
            className="btn-premium h-14 !rounded-xl px-8 gap-3 shadow-2xl"
          >
            <Plus size={20} />
            <span>Register New Bus</span>
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="stat-card p-8 flex flex-col items-center gap-4 text-center">
           <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-inner">
            <Bus size={32} className="text-slate-600 dark:text-slate-300" />
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{buses.length}</p>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">Active Buses</p>
          </div>
        </div>
        <div className="stat-card p-8 flex flex-col items-center gap-4 text-center">
           <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center shadow-inner">
            <Zap size={32} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">{liveCount}</p>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">Live Tracking</p>
          </div>
        </div>
        <div className="stat-card p-8 flex flex-col items-center gap-4 text-center">
           <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center shadow-inner">
            <Users size={32} className="text-indigo-500" />
          </div>
          <div>
            <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">{totalOnBus}</p>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">Students on Bus</p>
          </div>
        </div>
      </div>

      <div className="relative mb-10 group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
        <input
          placeholder="Search by bus number, route, or driver..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-18 pl-16 pr-8 bg-white dark:bg-slate-900 border-none rounded-xl text-lg font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-primary/10 transition-all outline-none shadow-2xl shadow-slate-200/50 dark:shadow-none placeholder:text-slate-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {loading ? (
          [1, 2, 3, 4].map(i => <div key={i} className="h-80 bg-white dark:bg-slate-900 rounded-xl animate-pulse shadow-sm" />)
        ) : filtered.length === 0 ? (
          <div className="lg:col-span-2 py-32 text-center premium-card border-dashed">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-8 text-5xl shadow-inner">🚌</div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">{search ? 'No Buses Found' : 'No Buses Registered'}</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium">{search ? `We couldn't find any buses matching "${search}"` : 'Click the button above to add your first school bus.'}</p>
          </div>
        ) : (
          filtered.map(bus => {
            const loc = locations[bus.busId];
            const isLive = loc?.lastUpdatedTime && (Date.now() - new Date(loc.lastUpdatedTime)) < 5 * 60 * 1000;
            const count = bus.studentCount || 0;
            const capacity = bus.capacity || 40;

            return (
              <div key={bus.busId} className="premium-card group overflow-hidden p-0 border-none shadow-2xl shadow-slate-200/30 dark:shadow-none hover:shadow-primary/10 transition-all duration-500">
                <div className={cn("h-2 w-full transition-colors duration-500", isLive ? 'bg-primary' : 'bg-slate-100 dark:bg-slate-800')} />

                <div className="p-10 space-y-8">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-slate-950 rounded-xl flex items-center justify-center text-3xl shadow-xl group-hover:scale-110 transition-transform duration-500">🚌</div>
                      <div className="space-y-1">
                        <p className="font-black text-slate-900 dark:text-white text-2xl tracking-tight leading-none">{bus.busNumber}</p>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Route size={14} className="text-primary" /> {bus.routeName}
                        </p>
                      </div>
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-500",
                      isLive ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30" : "bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                    )}>
                       <div className={cn("w-2 h-2 rounded-full", isLive ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                       {isLive ? 'Live Tracking' : 'Offline'}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 text-center shadow-inner">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Driver</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white truncate">{bus.driverName}</p>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-xl p-5 text-center shadow-inner">
                      <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1.5">On Board</p>
                      <p className="text-lg font-black text-indigo-700 dark:text-indigo-400 leading-none">{count} / {capacity}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 text-center shadow-inner">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Class</p>
                      <p className="text-sm font-black text-slate-900 dark:text-white truncate">{bus.assignedClass || '—'}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bus Capacity</span>
                      <span className="text-[10px] font-black text-slate-600 dark:text-slate-300">{Math.round((count/capacity)*100)}% Filled</span>
                    </div>
                    <OccupancyBar count={count} capacity={capacity} />
                  </div>

                  <div className="flex items-center gap-4 pt-4">
                    <Button
                      onClick={() => setManifestBus(bus)}
                      variant="outline"
                      className="flex-1 h-14 rounded-xl font-black text-[11px] uppercase tracking-widest gap-2 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30 hover:bg-indigo-100"
                    >
                      <Users size={16} /> Student List
                    </Button>
                    <Button
                      onClick={() => navigate(`/transport/tracking/${bus.busId}`, { state: { bus } })}
                      className="flex-1 h-14 rounded-xl font-black text-[11px] uppercase tracking-widest gap-2 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-100"
                    >
                      <Navigation2 size={16} /> Live Track
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setFormModal(bus)}
                        variant="outline"
                        className="w-14 h-14 rounded-xl border-slate-100 dark:border-slate-800 text-slate-400 hover:text-primary transition-all p-0"
                      >
                        <Pencil size={20} />
                      </Button>
                      <Button
                        onClick={() => handleDelete(bus.busId)}
                        disabled={deleting === bus.busId}
                        variant="outline"
                        className="w-14 h-14 rounded-xl border-rose-100 dark:border-rose-900/20 text-rose-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all p-0 disabled:opacity-50"
                      >
                        {deleting === bus.busId ? <RefreshCw size={20} className="animate-spin" /> : <Trash2 size={20} />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {formModal && (
        <BusFormModal
          initial={formModal === 'add' ? null : formModal}
          routes={routes}
          onClose={() => setFormModal(null)}
          onSave={formModal === 'add' ? handleAdd : handleEdit}
        />
      )}

      {manifestBus && (
        <ManifestModal
          bus={manifestBus}
          onClose={() => setManifestBus(null)}
        />
      )}
    </div>
  );
};

export default BusManagement;

