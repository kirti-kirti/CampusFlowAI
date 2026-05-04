import React, { useState, useEffect, useContext } from 'react';
import { 
  UserPlus, 
  Search, 
  Mail, 
  Shield, 
  MoreVertical, 
  ChevronRight, 
  ArrowLeft, 
  User, 
  GraduationCap, 
  Briefcase, 
  X, 
  Eye, 
  EyeOff, 
  Layers, 
  LayoutGrid 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import adminService from '../../services/adminService';
import hierarchyService from '../../services/hierarchyService';
import { AuthContext } from '../../context/AuthContext';

const UserManagement = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeRole, setActiveRole] = useState('ALL');

  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
    tenantId: currentUser?.tenantId || '',
    universityId: currentUser?.universityId || '',
    departmentId: '',
    classRoomId: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchHierarchy();
    
    if (!newUser.universityId && currentUser?.email) {
      const recoverId = async () => {
        try {
          const unis = await hierarchyService.getUniversities();
          const myUni = unis.find(u => u.code === currentUser.tenantId);
          if (myUni) {
            setNewUser(prev => ({ ...prev, universityId: myUni.id }));
          }
        } catch (err) {
          console.error('Failed to recover universityId');
        }
      };
      recoverId();
    }
  }, [activeRole, currentUser]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let data = [];
      if (activeRole === 'ALL') {
        const [teachers, students, admins] = await Promise.all([
          adminService.getTeachers(),
          adminService.getStudents(),
          adminService.getAdmins()
        ]);
        data = [...teachers, ...students, ...admins];
      } else if (activeRole === 'ADMIN') {
        data = await adminService.getAdmins();
      } else if (activeRole === 'TEACHER') {
        data = await adminService.getTeachers();
      } else {
        data = await adminService.getStudents();
      }
      setUsers(data);
    } catch (err) {
      toast.error('Failed to sync identity matrix');
    } finally {
      setLoading(false);
    }
  };

  const fetchHierarchy = async () => {
    try {
      const depts = await hierarchyService.getDepartments();
      setDepartments(depts);
    } catch (err) {
      console.error('Failed to fetch hierarchy');
    }
  };

  const handleDeptChange = async (deptId) => {
    setNewUser({ ...newUser, departmentId: deptId, classRoomId: '' });
    if (deptId) {
      try {
        const classData = await hierarchyService.getClasses(deptId);
        setClasses(classData);
      } catch (err) {
        toast.error('Failed to load classes');
      }
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if ((newUser.role === 'TEACHER' || newUser.role === 'STUDENT') && !newUser.departmentId) {
      toast.warn('Department is required for Faculty/Scholars');
      return;
    }
    if (newUser.role === 'STUDENT' && !newUser.classRoomId) {
      toast.warn('Class is required for Scholars');
      return;
    }

    try {
      await adminService.registerUser(newUser);
      toast.success(`${newUser.role} identity registered`);
      setShowModal(false);
      setNewUser({ ...newUser, name: '', email: '', password: '', departmentId: '', classRoomId: '' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Identity registration failed');
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN': return { bg: 'bg-rose-50', text: 'text-rose-500', icon: Shield, label: 'Systems' };
      case 'TEACHER': return { bg: 'bg-indigo-50', text: 'text-indigo-500', icon: Briefcase, label: 'Faculty' };
      case 'STUDENT': return { bg: 'bg-emerald-50', text: 'text-emerald-500', icon: GraduationCap, label: 'Scholar' };
      case 'PARENT': return { bg: 'bg-amber-50', text: 'text-amber-500', icon: User, label: 'Guardian' };
      default: return { bg: 'bg-slate-50', text: 'text-slate-500', icon: User, label: role };
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pb-32 px-4 pt-4 animate-in fade-in duration-700">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 active:scale-90 transition-all shadow-sm">
          <ArrowLeft size={18} />
        </button>
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span>{currentUser?.tenantId}</span>
            <ChevronRight size={10} />
            <span>Identity Matrix</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Access Management</h1>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-8">
        <div className="flex gap-2">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search identities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-14 pl-14 pr-6 rounded-2xl bg-white border border-slate-100 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-primary/5 transition-all outline-none shadow-sm"
            />
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-900/20 active:scale-90 transition-all flex-shrink-0"
          >
            <UserPlus size={20} />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['ALL', 'ADMIN', 'TEACHER', 'STUDENT'].map(role => (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                activeRole === role 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-white text-slate-400 border border-slate-100'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identity</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Classification</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:table-cell">Contact</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Security</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [1, 2, 3, 4].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-8 py-6 h-20 bg-slate-50/50" />
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-[10px]">
                    No matching identities found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const badge = getRoleBadge(u.role);
                  return (
                    <tr key={u.id} className="group hover:bg-slate-50/30 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl ${badge.bg} flex items-center justify-center text-slate-900 border-2 border-white shadow-sm`}>
                            <badge.icon size={20} className={badge.text} />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-sm leading-tight uppercase tracking-tight">{u.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID-CF{u.id}X9</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${badge.bg} border border-current/10 shadow-sm`}>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${badge.text}`}>{badge.label}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 hidden sm:table-cell">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Mail size={14} />
                          <span className="text-[11px] font-bold text-slate-600">{u.email}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">SECURED</span>
                          <button className="p-2 text-slate-200 hover:text-primary transition-colors active:scale-90">
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <form 
            onSubmit={handleCreate}
            className="relative w-full max-w-lg bg-white rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200"
          >
            <button type="button" onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600 transition-colors">
              <X size={24} />
            </button>
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Register Identity</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Enrolling in {currentUser?.tenantId}</p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Full Name</label>
                  <input required type="text" placeholder="John Doe" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} className="w-full h-12 px-6 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Classification</label>
                  <select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})} className="w-full h-12 px-6 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 focus:ring-primary/20 cursor-pointer outline-none appearance-none">
                    <option value="STUDENT">Scholar (Student)</option>
                    <option value="TEACHER">Faculty (Teacher)</option>
                    <option value="ADMIN">System Admin</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Email Address</label>
                <input required type="email" placeholder="name@university.edu" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} className="w-full h-12 px-6 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Security Password</label>
                <div className="relative">
                  <input required type={showPassword ? "text" : "password"} placeholder="••••••••" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} className="w-full h-12 px-6 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
              </div>
              {(newUser.role === 'TEACHER' || newUser.role === 'STUDENT') && (
                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Department</label>
                    <div className="relative">
                      <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                      <select required value={newUser.departmentId} onChange={(e) => handleDeptChange(e.target.value)} className="w-full h-12 pl-10 pr-4 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 focus:ring-primary/20 cursor-pointer outline-none appearance-none">
                        <option value="">Select Dept</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                  </div>
                  {newUser.role === 'STUDENT' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Class Target</label>
                      <div className="relative">
                        <LayoutGrid className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                        <select required value={newUser.classRoomId} onChange={(e) => setNewUser({...newUser, classRoomId: e.target.value})} disabled={!newUser.departmentId} className="w-full h-12 pl-10 pr-4 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 focus:ring-primary/20 cursor-pointer outline-none appearance-none disabled:opacity-50">
                          <option value="">Select Class</option>
                          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <button type="submit" className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all mt-4">Complete Enrollment</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
