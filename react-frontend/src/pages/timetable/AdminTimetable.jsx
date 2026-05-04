import React, { useState, useEffect } from 'react';
import timetableService from '../../services/timetableService';
import { toast } from 'react-toastify';
import { 
  Plus, 
  Trash2, 
  Search, 
  Settings, 
  Calendar, 
  ChevronRight, 
  User, 
  MapPin, 
  Clock,
  Filter,
  MoreVertical,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

const AdminTimetable = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [searchClass, setSearchClass] = useState('CLASS-10A');
  const [formData, setFormData] = useState({ 
    classId: '', 
    subject: '', 
    teacherId: '', 
    teacherName: '', 
    dayOfWeek: 'MONDAY', 
    startTime: '', 
    endTime: '' 
  });

  const fetchTimetable = async (classIdToFetch) => {
    if (!classIdToFetch) return;
    setLoading(true);
    setError('');
    try {
      const data = await timetableService.getClassTimetable(classIdToFetch);
      setSchedule(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Synchronization failed for ' + classIdToFetch);
      setSchedule([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable(searchClass);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTimetable(searchClass);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await timetableService.createTimetable(formData);
      toast.success('Curriculum entry initialized');
      setShowForm(false);
      setSearchClass(formData.classId);
      setFormData({ 
        classId: '', 
        subject: '', 
        teacherId: '', 
        teacherName: '', 
        dayOfWeek: 'MONDAY', 
        startTime: '', 
        endTime: '' 
      });
      fetchTimetable(formData.classId);
    } catch (err) {
      toast.error('Provisioning failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await timetableService.deleteTimetable(id);
      toast.info('Entry purged from records');
      fetchTimetable(searchClass);
    } catch (err) {
      toast.error('Purge failed');
    }
  };

  return (
    <div className="animate-in fade-in duration-1000 max-w-5xl mx-auto pb-10">
      <header className="mb-10 pt-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Badge variant="outline" className="mb-3 px-3 py-1 border-indigo-100 bg-indigo-50/30 text-indigo-600 font-bold tracking-widest text-[10px] uppercase">
            Administrative Control
          </Badge>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 leading-none mb-3">Curriculum Manager</h1>
          <p className="text-slate-500 font-medium text-lg">Central provisioning for academic schedules and lab resources.</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)} 
          className="h-14 px-8 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 active:scale-95 transition-all gap-3"
        >
          {showForm ? <Trash2 size={20} /> : <Plus size={20} />}
          {showForm ? 'Cancel Provisioning' : 'Initialize New Entry'}
        </Button>
      </header>

      {/* Admin Provisioning Form */}
      {showForm && (
        <Card className="mb-10 border-none shadow-[0_30px_60px_rgba(0,0,0,0.1)] bg-white rounded-[2.5rem] overflow-hidden animate-in zoom-in duration-500">
          <div className="h-2 bg-primary" />
          <CardHeader className="pt-8 px-10">
            <CardTitle className="text-2xl font-black text-slate-900">Provision Curriculum Slot</CardTitle>
            <CardDescription className="font-medium text-slate-400">Define academic parameters for the new curriculum entry.</CardDescription>
          </CardHeader>
          <CardContent className="px-10 pb-10">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Class Identifier</Label>
                <Input name="classId" placeholder="e.g. CLASS-10A" className="h-12 bg-slate-50 border-none rounded-xl font-bold" value={formData.classId} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Module Subject</Label>
                <Input name="subject" placeholder="e.g. Theoretical Physics" className="h-12 bg-slate-50 border-none rounded-xl font-bold" value={formData.subject} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Faculty ID</Label>
                <Input name="teacherId" placeholder="FAC-001" className="h-12 bg-slate-50 border-none rounded-xl font-bold" value={formData.teacherId} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Faculty Name</Label>
                <Input name="teacherName" placeholder="Dr. Sarah Connor" className="h-12 bg-slate-50 border-none rounded-xl font-bold" value={formData.teacherName} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Cycle Day</Label>
                <select name="dayOfWeek" className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 font-bold text-sm outline-none" value={formData.dayOfWeek} onChange={handleChange}>
                  <option value="MONDAY">Monday</option>
                  <option value="TUESDAY">Tuesday</option>
                  <option value="WEDNESDAY">Wednesday</option>
                  <option value="THURSDAY">Thursday</option>
                  <option value="FRIDAY">Friday</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Start</Label>
                  <Input type="time" name="startTime" className="h-12 bg-slate-50 border-none rounded-xl font-bold" value={formData.startTime} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">End</Label>
                  <Input type="time" name="endTime" className="h-12 bg-slate-50 border-none rounded-xl font-bold" value={formData.endTime} onChange={handleChange} required />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="md:col-span-2 h-14 rounded-2xl font-black text-base shadow-xl shadow-primary/20 active:scale-[0.98] transition-all">
                {loading ? <Loader2 className="animate-spin" /> : 'Confirm Provisioning'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search Interface */}
      <div className="flex gap-4 mb-10">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
          <form onSubmit={handleSearch}>
            <Input 
              placeholder="Search by Class Identifier (e.g. CLASS-10A)..." 
              className="h-16 pl-14 pr-6 bg-white border-none shadow-sm rounded-3xl text-base focus-visible:ring-primary/10 transition-all font-medium"
              value={searchClass} 
              onChange={(e) => setSearchClass(e.target.value)} 
            />
          </form>
        </div>
        <Button onClick={() => fetchTimetable(searchClass)} className="h-16 px-8 rounded-3xl font-black text-xs uppercase tracking-widest gap-2 bg-slate-900 text-white shadow-xl active:scale-95 transition-all">
          Sync Records
        </Button>
      </div>

      {/* Curriculum Record Feed */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[3rem]">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="font-bold text-slate-400 tracking-tight">Syncing with encrypted storage...</p>
        </div>
      ) : schedule.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
          <ShieldCheck size={48} className="text-slate-200 mb-6" />
          <p className="font-bold text-slate-400 tracking-tight text-lg">No synchronized curriculum data found for {searchClass}.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 ml-1 mb-2">Synchronized Entries</h3>
          {schedule.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((item) => (
            <Card key={item.id} className="border-none shadow-[0_4px_20px_rgba(0,0,0,0.02)] bg-white rounded-3xl group hover:shadow-xl transition-all">
              <CardContent className="p-6 flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                  <Calendar size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-black text-slate-900">{item.subject}</h3>
                    <Badge className="bg-primary/5 text-primary border-none font-black text-[9px] uppercase tracking-widest px-3 py-1">
                      {item.dayOfWeek}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <Clock size={12} /> {item.startTime} - {item.endTime}
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <User size={12} /> {item.teacherName}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors" onClick={() => handleDelete(item.id)}>
                    <Trash2 size={20} />
                  </Button>
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminTimetable;
