import React, { useState, useEffect, useContext } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  LayoutGrid, 
  BookOpen, 
  ChevronRight,
  School,
  ArrowLeft,
  Calendar,
  X,
  Layers,
  SearchCode,
  Sparkles,
  ArrowRight,
  Zap,
  Target
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import hierarchyService from '../../services/hierarchyService';
import { AuthContext } from '../../context/AuthContext';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from '@/components/ui/badge';

const ClassManagement = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const deptId = searchParams.get('deptId');
  const { user } = useContext(AuthContext);
  
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [newClass, setNewClass] = useState({ name: '', semester: '', departmentId: deptId || '' });

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const data = await hierarchyService.getDepartments();
      setDepartments(data);
    } catch (err) {}
  };

  useEffect(() => {
    if (deptId) {
      fetchClasses();
    } else {
      toast.error('No department selected');
      navigate('/admin/departments');
    }
  }, [deptId]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const data = await hierarchyService.getClasses(deptId);
      setClasses(data);
    } catch (err) {
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await hierarchyService.createClass(newClass);
      toast.success('New class created!');
      setShowModal(false);
      setNewClass({ name: '', semester: '', departmentId: deptId });
      fetchClasses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create class');
    }
  };

  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.semester?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pb-32 px-6 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-7xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <Button 
              onClick={() => navigate(-1)}
              variant="outline"
              className="w-12 h-12 rounded-xl border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm"
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">
              <Sparkles size={12} /> Academic Management
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-none mt-4">Manage Classes</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Organize students into batches and semesters.</p>
        </div>
        <Button 
          onClick={() => setShowModal(true)}
          className="btn-premium h-14 !rounded-xl px-8 gap-3 shadow-2xl"
        >
          <Plus size={20} />
          <span>Add New Class</span>
        </Button>
      </header>

      <div className="grid gap-10">
        <section className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search by class name or semester..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-16 pl-16 pr-14 rounded-xl bg-white dark:bg-slate-900 border-none text-lg font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-primary/10 transition-all outline-none shadow-2xl shadow-slate-200/50 dark:shadow-none placeholder:text-slate-400"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all"
            >
              <X size={16} />
            </button>
          )}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {loading ? (
            [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-44 bg-white dark:bg-slate-900 rounded-xl animate-pulse shadow-sm" />)
          ) : filteredClasses.length === 0 ? (
            <div className="md:col-span-2 xl:col-span-3 py-32 text-center premium-card border-dashed">
              <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-8 text-5xl shadow-inner">
                📚
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">No classes found</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Try adjusting your search or add a new class module.</p>
            </div>
          ) : (
            filteredClasses.map((cls) => (
              <div 
                key={cls.id}
                onClick={() => navigate(`/admin/subjects?classId=${cls.id}`)}
                className="group premium-card p-10 hover:shadow-primary/10 transition-all duration-500 cursor-pointer border-none shadow-2xl shadow-slate-200/40 dark:shadow-none"
              >
                <div className="flex flex-col h-full gap-8">
                  <div className="flex items-start justify-between">
                    <div className="w-16 h-16 bg-slate-950 rounded-xl flex items-center justify-center text-3xl shadow-xl group-hover:scale-110 transition-transform duration-500">
                      <LayoutGrid size={28} className="text-white" />
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30">
                       <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                       <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Active</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-primary transition-colors leading-tight">{cls.name}</h3>
                    <div className="flex items-center gap-3">
                       <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-none font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-md">
                        {cls.semester || 'Phase 1'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <Target size={14} className="text-primary" /> View Subjects
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                      <ArrowRight size={18} />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setShowModal(false)} />
          <form 
            onSubmit={handleCreate}
            className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl p-10 md:p-14 shadow-2xl animate-in zoom-in-95 duration-500 border border-white/20 dark:border-slate-800"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-32 -mt-32" />
            
            <button 
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-10 right-10 w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all z-10"
            >
              <X size={24} />
            </button>
            
            <header className="mb-12 relative z-10">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
                <Plus size={12} /> Setup Class Info
              </div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Add New Class</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-lg mt-2">Create a new academic unit for students.</p>
            </header>

            <div className="space-y-8 relative z-10">
              <div className="space-y-3">
                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Class Name</Label>
                <div className="relative group">
                   <LayoutGrid className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                   <input 
                    required
                    type="text" 
                    placeholder="e.g. CSE-A 2026"
                    value={newClass.name}
                    onChange={(e) => setNewClass({...newClass, name: e.target.value})}
                    className="w-full h-16 pl-16 pr-8 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border-none text-lg font-bold dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Semester / Phase</Label>
                <div className="relative group">
                   <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                   <select 
                    required
                    value={newClass.semester}
                    onChange={(e) => setNewClass({...newClass, semester: e.target.value})}
                    className="w-full h-16 pl-16 pr-8 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border-none text-lg font-bold dark:text-white focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Select Semester</option>
                    {[1,2,3,4,5,6,7,8].map(s => (
                      <option key={s} value={`Semester ${s}`}>Semester {s}</option>
                    ))}
                    <option value="Graduate">Graduate</option>
                  </select>
                </div>
              </div>

              {!deptId && (
                <div className="space-y-3">
                  <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Assign Department</Label>
                  <div className="relative group">
                    <School className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                    <select 
                      required
                      value={newClass.departmentId}
                      onChange={(e) => setNewClass({...newClass, departmentId: e.target.value})}
                      className="w-full h-16 pl-16 pr-8 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border-none text-lg font-bold dark:text-white focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer"
                    >
                      <option value="">Select Department</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <Button 
                type="submit"
                className="btn-premium w-full h-18 !rounded-xl group mt-4 shadow-2xl"
              >
                <span className="flex items-center gap-3 text-lg">
                  Create Class <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
                </span>
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ClassManagement;

