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
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import hierarchyService from '../../services/hierarchyService';
import { AuthContext } from '../../context/AuthContext';

const DepartmentManagement = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Create Modal State
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
      toast.error('Failed to sync departments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await hierarchyService.createDepartment(newDept);
      toast.success('Department created successfully');
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
    <div className="pb-32 px-4 pt-4 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 active:scale-90 transition-all shadow-sm"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <School size={10} />
            <span>{user?.tenantId || 'University Registry'}</span>
            <ChevronRight size={10} />
          </div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Department Control</h1>
        </div>
      </div>

      {/* Action & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="relative flex-1 group">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-all duration-300">
            <Search size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Search departments or specialties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-16 pl-16 pr-8 rounded-[2rem] bg-white border border-slate-100 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-primary/5 transition-all outline-none shadow-sm"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600">
              <X size={18} />
            </button>
          )}
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="h-16 px-8 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 active:scale-95 transition-all"
        >
          <Plus size={18} />
          Add Department
        </button>
      </div>

      {/* List */}
      {filteredDepartments.length === 0 && !loading ? (
        <div className="py-24 text-center bg-white rounded-[3.5rem] border border-slate-100 shadow-sm animate-in zoom-in-95 duration-500">
          <Layers className="mx-auto text-slate-100 mb-6" size={64} />
          <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Registry is empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            [1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-slate-100 rounded-[2.5rem] animate-pulse" />)
          ) : (
            filteredDepartments.map((dept) => (
              <div 
                key={dept.id} 
                onClick={() => navigate(`/admin/classes?deptId=${dept.id}`)}
                className="group bg-white p-8 rounded-[3rem] border border-slate-100 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer relative"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                    <Layers size={32} />
                  </div>
                  <button className="p-2 text-slate-200 hover:text-slate-600 transition-colors">
                    <MoreVertical size={24} />
                  </button>
                </div>

                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2 group-hover:text-primary transition-colors">
                  {dept.name}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 line-clamp-2 uppercase tracking-widest leading-relaxed">
                  {dept.description || 'System academic unit'}
                </p>

                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em]">Manage Infrastructure</span>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <form 
            onSubmit={handleCreate}
            className="relative w-full max-w-md bg-white rounded-[3.5rem] p-12 shadow-2xl animate-in zoom-in-95 duration-200"
          >
            <button type="button" onClick={() => setShowModal(false)} className="absolute top-10 right-10 text-slate-300 hover:text-slate-600 transition-colors">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8">Add Department</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Official Title</label>
                <input required type="text" placeholder="Computer Science" value={newDept.name} onChange={(e) => setNewDept({...newDept, name: e.target.value})} className="w-full h-16 px-8 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Description</label>
                <textarea placeholder="Brief summary..." value={newDept.description} onChange={(e) => setNewDept({...newDept, description: e.target.value})} className="w-full h-32 p-8 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none resize-none" />
              </div>
              <button type="submit" className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all mt-4">Establish Registry</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;
