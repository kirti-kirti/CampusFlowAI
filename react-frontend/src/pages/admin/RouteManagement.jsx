import React, { useState, useEffect, useContext } from 'react';
import {
  ArrowLeft, Plus, Pencil, Trash2, X, ChevronRight,
  MapPin, Route, RefreshCw, Search, GripVertical,
  ArrowDown, Check, Bus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import routeService from '../../services/routeService';
import { AuthContext } from '../../context/AuthContext';

const EMPTY_FORM = { name: '', stops: [''] };

// ── Stop editor ───────────────────────────────────────────────────────────────
const StopEditor = ({ stops, onChange }) => {
  const add = () => onChange([...stops, '']);
  const remove = (i) => onChange(stops.filter((_, idx) => idx !== i));
  const update = (i, val) => onChange(stops.map((s, idx) => idx === i ? val : s));

  return (
    <div className="space-y-2">
      {stops.map((stop, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex items-center gap-2 flex-1 bg-slate-50 rounded-xl px-3 h-11 border border-slate-100">
            <span className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-[9px] font-black text-slate-500 shrink-0">{i + 1}</span>
            {i < stops.length - 1 && (
              <div className="absolute left-[1.85rem] mt-11 w-px h-2 bg-slate-200" />
            )}
            <input
              value={stop}
              onChange={e => update(i, e.target.value)}
              placeholder={`Stop ${i + 1} name`}
              className="flex-1 bg-transparent text-sm font-medium outline-none text-slate-700 placeholder:text-slate-300"
            />
          </div>
          {stops.length > 1 && (
            <button type="button" onClick={() => remove(i)}
              className="w-9 h-9 bg-rose-50 text-rose-400 rounded-xl flex items-center justify-center hover:bg-rose-100 transition-colors shrink-0">
              <X size={14} />
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={add}
        className="w-full h-10 border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
        <Plus size={13} /> Add Stop
      </button>
    </div>
  );
};

// ── Route Form Modal ──────────────────────────────────────────────────────────
const RouteFormModal = ({ initial, onClose, onSave }) => {
  const [form, setForm] = useState(
    initial ? { name: initial.name, stops: initial.stops?.length ? initial.stops : [''] }
            : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanStops = form.stops.filter(s => s.trim());
    if (cleanStops.length === 0) { toast.warn('Add at least one stop'); return; }
    setSaving(true);
    try {
      await onSave({ name: form.name, stops: cleanStops });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <form onSubmit={handleSubmit}
        className="relative w-full sm:max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl p-6 sm:p-8 animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">

        <div className="flex justify-center mb-4 sm:hidden">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black text-slate-900">{isEdit ? 'Edit Route' : 'New Route'}</h2>
            <p className="text-xs font-bold text-slate-400 mt-0.5">{isEdit ? `Editing "${initial.name}"` : 'Define stops in order'}</p>
          </div>
          <button type="button" onClick={onClose}
            className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">Route Name</label>
            <input
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. North Campus Route"
              className="w-full h-12 px-4 bg-slate-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 border border-slate-100"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">
              Stops <span className="text-slate-300 normal-case font-medium">(in order)</span>
            </label>
            <StopEditor stops={form.stops} onChange={stops => setForm({ ...form, stops })} />
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="w-full h-12 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest mt-6 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
          {saving ? <RefreshCw size={15} className="animate-spin" /> : <Check size={15} />}
          {saving ? 'Saving...' : isEdit ? 'Update Route' : 'Create Route'}
        </button>
      </form>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const RouteManagement = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [formModal, setFormModal] = useState(null); // null | 'add' | route
  const [deleting, setDeleting] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { fetchRoutes(); }, []);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const data = await routeService.getRoutes();
      setRoutes(data);
    } catch { toast.error('Failed to load routes'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (form) => {
    try {
      await routeService.createRoute(form);
      toast.success('Route created');
      setFormModal(null);
      fetchRoutes();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create route');
      throw e;
    }
  };

  const handleUpdate = async (form) => {
    try {
      await routeService.updateRoute(formModal.id, form);
      toast.success('Route updated');
      setFormModal(null);
      fetchRoutes();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update route');
      throw e;
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete route "${name}"?`)) return;
    setDeleting(id);
    try {
      await routeService.deleteRoute(id);
      toast.success('Route deleted');
      fetchRoutes();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete route');
    } finally { setDeleting(null); }
  };

  const filtered = routes.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.stops?.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="pb-32 px-4 pt-4 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 active:scale-90 transition-all shadow-sm">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span>{user?.tenantId}</span><ChevronRight size={10} /><span>Transport</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Route Management</h1>
        </div>
        <button onClick={() => setFormModal('add')}
          className="w-11 h-11 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl active:scale-90 transition-all">
          <Plus size={20} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-4 text-center border border-slate-100 shadow-sm">
          <p className="text-2xl font-black text-slate-900">{routes.length}</p>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Routes</p>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center border border-slate-100 shadow-sm">
          <p className="text-2xl font-black text-indigo-600">
            {routes.reduce((sum, r) => sum + (r.stops?.length || 0), 0)}
          </p>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Stops</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
        <input
          placeholder="Search routes or stops..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-12 pl-11 pr-4 bg-white border border-slate-100 rounded-2xl text-sm font-medium outline-none shadow-sm"
        />
      </div>

      {/* Route list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-[1.5rem] animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-3">
            <Route size={28} className="text-slate-300" />
          </div>
          <p className="font-black text-slate-900 mb-1">{search ? 'No Results' : 'No Routes Yet'}</p>
          <p className="text-sm text-slate-400">{search ? `No routes match "${search}"` : 'Click + to create your first route'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(route => (
            <div key={route.id} className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
              {/* Route header */}
              <div
                className="flex items-center justify-between p-5 cursor-pointer"
                onClick={() => setExpanded(expanded === route.id ? null : route.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-indigo-50 rounded-2xl flex items-center justify-center">
                    <Route size={18} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 leading-tight">{route.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                      {route.stops?.length || 0} stops
                      {route.stops?.length > 0 && ` · ${route.stops[0]} → ${route.stops[route.stops.length - 1]}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={e => { e.stopPropagation(); setFormModal(route); }}
                    className="w-9 h-9 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); handleDelete(route.id, route.name); }}
                    disabled={deleting === route.id}
                    className="w-9 h-9 bg-rose-50 text-rose-400 rounded-xl flex items-center justify-center hover:bg-rose-100 transition-colors disabled:opacity-50">
                    {deleting === route.id ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                  <div className={`w-7 h-7 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 transition-transform ${expanded === route.id ? 'rotate-180' : ''}`}>
                    <ChevronRight size={14} className="rotate-90" />
                  </div>
                </div>
              </div>

              {/* Stops expanded */}
              {expanded === route.id && route.stops?.length > 0 && (
                <div className="px-5 pb-5 border-t border-slate-50">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-4 mb-3">Route Stops</p>
                  <div className="relative pl-4">
                    {/* Vertical line */}
                    <div className="absolute left-[1.1rem] top-3 bottom-3 w-px bg-slate-200" />
                    <div className="space-y-3">
                      {route.stops.map((stop, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${
                            i === 0 ? 'bg-emerald-500 border-emerald-500' :
                            i === route.stops.length - 1 ? 'bg-slate-900 border-slate-900' :
                            'bg-white border-slate-300'
                          }`}>
                            {i === 0 && <div className="w-2 h-2 bg-white rounded-full" />}
                            {i === route.stops.length - 1 && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                          <div className="flex-1 bg-slate-50 rounded-xl px-3 py-2.5">
                            <p className="text-sm font-bold text-slate-700">{stop}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                              {i === 0 ? 'Origin' : i === route.stops.length - 1 ? 'Destination' : `Stop ${i + 1}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Assign to bus shortcut */}
                  <button
                    onClick={() => navigate('/admin/buses')}
                    className="w-full mt-4 h-10 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors">
                    <Bus size={13} /> Assign to Bus
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {formModal && (
        <RouteFormModal
          initial={formModal === 'add' ? null : formModal}
          onClose={() => setFormModal(null)}
          onSave={formModal === 'add' ? handleCreate : handleUpdate}
        />
      )}
    </div>
  );
};

export default RouteManagement;
