import React, { useState, useEffect, useContext } from 'react';
import { 
  Layers, 
  Plus, 
  Search, 
  MoreVertical, 
  School,
  ChevronRight,
  ArrowLeft,
  X,
  FileText,
  Sparkles,
  ArrowRight,
  Target,
  RefreshCw,
  Library
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import hierarchyService from '../../services/hierarchyService';
import { AuthContext } from '../../context/AuthContext';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const DepartmentManagement = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [newDept, setNewDept] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const data = await hierarchyService.getDepartments();
      setDepartments(data);
    } catch (err) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await hierarchyService.createDepartment(newDept);
      toast.success('Department established successfully!');
      setShowModal(false);
      setNewDept({ name: '', description: '' });
      fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Creation failed');
    }
  };

  const filteredDepartments = departments.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pb-32 px-6 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => navigate(-1)}
              variant="outline"
              className="w-12 h-12 rounded-xl border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm"
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">
              <Sparkles size={12} /> Institutional Structure
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-none mt-4">Departments</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Manage academic divisions and faculty branches.</p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <Button 
            onClick={fetchDepartments} 
            variant="outline"
            className="w-14 h-14 rounded-xl border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-xl active:scale-95 group"
          >
            <RefreshCw size={20} className={cn(loading && "animate-spin text-primary")} />
          </Button>
          <Button 
            onClick={() => setShowModal(true)}
            className="btn-premium h-14 !rounded-xl px-8 gap-3 shadow-2xl"
          >
            <Plus size={20} />
            <span>Establish Dept</span>
          </Button>
        </div>
      </header>

      {/* Search Bar */}
      <section className="mb-12 relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={22} />
        <input 
          type="text" 
          placeholder="Search departments by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-18 pl-16 pr-14 rounded-xl bg-white dark:bg-slate-900 border-none text-lg font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-primary/10 transition-all outline-none shadow-2xl shadow-slate-200/50 dark:shadow-none placeholder:text-slate-400"
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

      {/* Grid List */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {loading ? (
          [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 bg-white dark:bg-slate-900 rounded-xl animate-pulse shadow-sm" />)
        ) : filteredDepartments.length === 0 ? (
          <div className="md:col-span-2 xl:col-span-3 py-32 text-center premium-card border-dashed">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-8 text-5xl shadow-inner">
              🏛️
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-3">{searchTerm ? 'No Results Found' : 'No Departments Yet'}</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-md mx-auto">
              {searchTerm ? `We couldn't find any department matching "${searchTerm}".` : 'Start by establishing the first academic department of your institution.'}
            </p>
          </div>
        ) : (
          filteredDepartments.map((dept) => (
            <div 
              key={dept.id} 
              onClick={() => navigate(`/admin/classes?deptId=${dept.id}`)}
              className="group premium-card p-10 hover:shadow-primary/10 transition-all duration-500 cursor-pointer border-none shadow-2xl shadow-slate-200/40 dark:shadow-none flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex justify-between items-start mb-8">
                  <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-xl shadow-indigo-100/50 dark:shadow-none">
                    <Library size={36} />
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30">
                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                     <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Active Branch</span>
                  </div>
                </div>

                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3 group-hover:text-primary transition-colors leading-tight">
                  {dept.name}
                </h3>
                <p className="text-sm font-bold text-slate-400 dark:text-slate-500 line-clamp-3 leading-relaxed">
                  {dept.description || 'This department manages academic programs and student performance metrics.'}
                </p>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-primary transition-colors">
                  <Target size={14} /> Open Records
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                  <ArrowRight size={20} />
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setShowModal(false)} />
          <form 
            onSubmit={handleCreate}
            className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl p-10 md:p-14 shadow-2xl animate-in zoom-in-95 duration-500 border border-white/20 dark:border-slate-800"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-32 -mt-32" />
            
            <button type="button" onClick={() => setShowModal(false)} className="absolute top-10 right-10 w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all z-10">
              <X size={24} />
            </button>
            
            <header className="mb-12 relative z-10">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
                <Plus size={12} /> New Registry
              </div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Establish Dept</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-lg mt-2">Create a new academic branch in your university.</p>
            </header>

            <div className="space-y-8 relative z-10">
              <div className="space-y-3">
                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Department Title</Label>
                <div className="relative group">
                   <Library className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                   <input required type="text" placeholder="e.g. Computer Science & Engineering" value={newDept.name} onChange={(e) => setNewDept({...newDept, name: e.target.value})} className="w-full h-16 pl-16 pr-8 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border-none text-lg font-bold dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Mission Statement / Description</Label>
                <div className="relative group">
                   <FileText className="absolute left-6 top-6 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                   <textarea placeholder="Outline the primary focus of this department..." value={newDept.description} onChange={(e) => setNewDept({...newDept, description: e.target.value})} className="w-full h-40 pl-16 pr-8 py-6 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border-none text-lg font-bold dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 outline-none resize-none" />
                </div>
              </div>
              <Button type="submit" className="btn-premium w-full h-18 !rounded-xl group mt-4 shadow-2xl">
                <span>Establish Department</span>
                <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;

