import React, { useState, useEffect, useContext } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  User as UserIcon, 
  ChevronRight,
  ArrowLeft,
  X,
  FileText,
  Briefcase
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import hierarchyService from '../../services/hierarchyService';
import adminService from '../../services/adminService';
import { AuthContext } from '../../context/AuthContext';

const SubjectManagement = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const classId = searchParams.get('classId');
  const { user } = useContext(AuthContext);
  
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Creation State
  const [showModal, setShowModal] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', classRoomId: classId || '', teacherId: '' });

  useEffect(() => {
    if (classId) {
      fetchData();
    } else {
      toast.error('No class context found');
      navigate('/admin/departments');
    }
  }, [classId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subjectData, teacherData] = await Promise.all([
        hierarchyService.getSubjects(classId),
        adminService.getTeachers()
      ]);
      setSubjects(subjectData);
      setTeachers(teacherData);
    } catch (err) {
      toast.error('Sync failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newSubject.teacherId) {
      toast.warn('Please select a faculty mentor');
      return;
    }
    try {
      await hierarchyService.createSubject(newSubject);
      toast.success('Subject assigned successfully');
      setShowModal(false);
      setNewSubject({ name: '', classRoomId: classId, teacherId: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed');
    }
  };

  const getTeacherName = (id) => {
    const t = teachers.find(t => t.id.toString() === id.toString());
    return t ? t.name : `ID: ${id}`;
  };

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
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
            <span>{user?.tenantId}</span>
            <ChevronRight size={10} />
            <span>Class {classId}</span>
            <ChevronRight size={10} />
          </div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Academic Curriculum</h1>
        </div>
      </div>

      {/* Premium Search & Action Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="relative flex-1 group">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-500 transition-all duration-300">
            <Search size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Search subjects or curricula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-16 pl-16 pr-8 rounded-[2rem] bg-white border border-slate-100 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-rose-500/5 focus:border-rose-500/20 transition-all outline-none shadow-sm"
          />
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="h-16 px-8 bg-rose-500 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 shadow-xl shadow-rose-200 active:scale-95 transition-all"
        >
          <Plus size={18} />
          Assign Subject
        </button>
      </div>

      {/* Subject Inventory */}
      {filteredSubjects.length === 0 && !loading ? (
        <div className="py-24 text-center bg-white rounded-[3.5rem] border border-slate-100 shadow-sm">
          <BookOpen className="mx-auto text-slate-100 mb-6" size={64} />
          <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">No subjects assigned</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            [1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-slate-100 rounded-[2.5rem] animate-pulse" />)
          ) : (
            filteredSubjects.map((sub) => (
              <div 
                key={sub.id}
                className="group bg-white p-8 rounded-[3rem] border border-slate-100 hover:border-rose-500/20 hover:shadow-2xl hover:shadow-rose-500/5 transition-all duration-500 relative"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all duration-500">
                    <BookOpen size={32} />
                  </div>
                  <div className="px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Active Mapping</span>
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2 group-hover:text-rose-500 transition-colors">
                  {sub.name}
                </h3>
                
                <div className="mt-6 pt-6 border-t border-slate-50 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                    <Briefcase size={14} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Assigned Faculty</p>
                    <p className="text-xs font-bold text-slate-700 mt-1">{getTeacherName(sub.teacherId)}</p>
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
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Map Subject</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-10">Curriculum Allocation</p>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Subject Title</label>
                <input required type="text" placeholder="e.g. Quantum Computing" value={newSubject.name} onChange={(e) => setNewSubject({...newSubject, name: e.target.value})} className="w-full h-16 px-8 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 focus:ring-rose-500/20 outline-none transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Select Faculty Mentor</label>
                <div className="relative">
                  <select required value={newSubject.teacherId} onChange={(e) => setNewSubject({...newSubject, teacherId: e.target.value})} className="w-full h-16 px-8 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 focus:ring-rose-500/20 outline-none appearance-none cursor-pointer">
                    <option value="">Select Faculty</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.email})</option>)}
                  </select>
                  <ChevronRight size={18} className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-slate-300 pointer-events-none" />
                </div>
              </div>

              <button type="submit" className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all mt-4">Assign to Class</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SubjectManagement;
