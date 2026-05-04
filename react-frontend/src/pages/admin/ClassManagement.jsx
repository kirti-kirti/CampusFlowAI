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
  SearchCode
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import hierarchyService from '../../services/hierarchyService';
import { AuthContext } from '../../context/AuthContext';

const ClassManagement = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const deptId = searchParams.get('deptId');
  const { user } = useContext(AuthContext);
  
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Creation State
  const [showModal, setShowModal] = useState(false);
  const [newClass, setNewClass] = useState({ name: '', semester: '', departmentId: deptId || '' });

  useEffect(() => {
    if (deptId) {
      fetchClasses();
    } else {
      toast.error('No department context found');
      navigate('/admin/departments');
    }
  }, [deptId]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const data = await hierarchyService.getClasses(deptId);
      setClasses(data);
    } catch (err) {
      toast.error('Sync failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await hierarchyService.createClass(newClass);
      toast.success('Class established successfully');
      setShowModal(false);
      setNewClass({ name: '', semester: '', departmentId: deptId });
      fetchClasses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Creation failed');
    }
  };

  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.semester?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pb-32 px-4 pt-4 animate-in fade-in duration-700">
      {/* Hierarchy Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 active:scale-90 transition-all shadow-sm"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span>{user?.tenantId || 'Registry'}</span>
            <ChevronRight size={10} />
            <span>Dept. {deptId}</span>
            <ChevronRight size={10} />
          </div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Academic Classes</h1>
        </div>
      </div>

      {/* Premium Search & Action Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="relative flex-1 group">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-all duration-300">
            <Search size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Search classes, semesters or batches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-16 pl-16 pr-8 rounded-[2rem] bg-white border border-slate-100 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none shadow-sm"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="h-16 px-8 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 shadow-xl shadow-slate-900/10 active:scale-95 transition-all"
        >
          <Plus size={18} />
          Establish Class
        </button>
      </div>

      {/* Classes Inventory */}
      {filteredClasses.length === 0 && !loading ? (
        <div className="py-24 text-center bg-white rounded-[3.5rem] border border-slate-100 shadow-sm animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <LayoutGrid className="text-slate-200" size={40} />
          </div>
          <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">No academic units found</p>
          <p className="text-slate-300 text-[9px] font-bold uppercase tracking-widest mt-2 px-10 leading-relaxed">
            Try adjusting your search or establish a new class module using the button above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            [1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-slate-100 rounded-[2rem] animate-pulse" />)
          ) : (
            filteredClasses.map((cls) => (
              <div 
                key={cls.id}
                onClick={() => navigate(`/admin/subjects?classId=${cls.id}`)}
                className="group bg-white p-7 rounded-[2.5rem] border border-slate-100 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <LayoutGrid size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 uppercase tracking-tight group-hover:text-primary transition-colors">{cls.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 rounded-md border border-slate-100">
                        <Calendar size={10} className="text-slate-400" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{cls.semester || 'Phase 1'}</span>
                      </div>
                      <span className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1">
                        Live <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all">
                  <ChevronRight size={18} />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <form 
            onSubmit={handleCreate}
            className="relative w-full max-w-md bg-white rounded-[3.5rem] p-12 shadow-2xl animate-in zoom-in-95 duration-200"
          >
            <button 
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-10 right-10 text-slate-300 hover:text-slate-600 transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="mb-10">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none mb-2">New Class</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Infrastructure Allocation</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Class Designation</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. CSE-A 2026"
                  value={newClass.name}
                  onChange={(e) => setNewClass({...newClass, name: e.target.value})}
                  className="w-full h-16 px-8 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Semester / Batch</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Semester 5"
                  value={newClass.semester}
                  onChange={(e) => setNewClass({...newClass, semester: e.target.value})}
                  className="w-full h-16 px-8 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all mt-4"
              >
                Establish Academic Node
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ClassManagement;
