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
  LayoutGrid,
  Sparkles,
  RefreshCw,
  Target,
  ArrowRight,
  Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import adminService from '../../services/adminService';
import hierarchyService from '../../services/hierarchyService';
import { AuthContext } from '../../context/AuthContext';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

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
        } catch (err) { }
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
      toast.error('Could not load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchHierarchy = async () => {
    try {
      const depts = await hierarchyService.getDepartments();
      setDepartments(depts);
    } catch (err) { }
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
      toast.warn('Please select a Department');
      return;
    }
    if (newUser.role === 'STUDENT' && !newUser.classRoomId) {
      toast.warn('Please select a Class');
      return;
    }

    try {
      await adminService.registerUser(newUser);
      toast.success('New user account created!');
      setShowModal(false);
      setNewUser({ ...newUser, name: '', email: '', password: '', departmentId: '', classRoomId: '' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN': return { bg: 'bg-rose-50 dark:bg-rose-900/10', text: 'text-rose-500', icon: Shield, label: 'Administrator' };
      case 'TEACHER': return { bg: 'bg-indigo-50 dark:bg-indigo-900/10', text: 'text-indigo-500', icon: Briefcase, label: 'Teacher' };
      case 'STUDENT': return { bg: 'bg-emerald-50 dark:bg-emerald-900/10', text: 'text-emerald-500', icon: GraduationCap, label: 'Student' };
      case 'PARENT': return { bg: 'bg-amber-50 dark:bg-amber-900/10', text: 'text-amber-500', icon: User, label: 'Parent' };
      default: return { bg: 'bg-slate-50 dark:bg-slate-800', text: 'text-slate-500', icon: User, label: role };
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pb-32 px-6 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-7xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">
            <Sparkles size={12} /> People Management
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-none">Manage Users</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Control access and roles across your campus.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
           <Button 
            onClick={fetchUsers} 
            variant="outline"
            className="w-14 h-14 rounded-xl border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-xl active:scale-95 group"
          >
            <RefreshCw size={20} className={cn(loading && "animate-spin text-primary")} />
          </Button>
          <Button 
            onClick={() => setShowModal(true)}
            className="btn-premium h-14 !rounded-xl px-8 gap-3"
          >
            <UserPlus size={20} />
            <span>Add New User</span>
          </Button>
        </div>
      </header>

      <div className="grid gap-8">
        <section className="flex flex-col md:flex-row gap-6">
          <div className="relative flex-1 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-16 pl-16 pr-8 rounded-xl bg-white dark:bg-slate-900 border-none text-base font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-primary/10 transition-all outline-none shadow-2xl shadow-slate-200/50 dark:shadow-none"
            />
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar md:pb-0">
            {['ALL', 'ADMIN', 'TEACHER', 'STUDENT'].map(role => (
              <button
                key={role}
                onClick={() => setActiveRole(role)}
                className={cn(
                  "px-8 h-16 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border-2 active:scale-95",
                  activeRole === role 
                  ? 'bg-slate-950 border-slate-950 text-white shadow-2xl shadow-slate-900/20' 
                  : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800'
                )}
              >
                {role}
              </button>
            ))}
          </div>
        </section>

        <section className="premium-card p-0 overflow-hidden border-none shadow-2xl shadow-slate-200/50 dark:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">User Details</th>
                  <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                  <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest hidden lg:table-cell">Email Address</th>
                  <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  [1, 2, 3, 4, 5].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="px-10 py-8 h-24" />
                    </tr>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-10 py-32 text-center">
                       <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">
                        🔍
                      </div>
                      <p className="font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest text-xs">No matching users found</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const badge = getRoleBadge(u.role);
                    return (
                      <tr key={u.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all cursor-pointer">
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-5">
                            <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center text-slate-900 border-4 border-white dark:border-slate-800 shadow-xl group-hover:scale-110 transition-transform duration-500", badge.bg)}>
                              <badge.icon size={24} className={badge.text} />
                            </div>
                            <div>
                              <p className="font-black text-slate-900 dark:text-white text-lg tracking-tight group-hover:text-primary transition-colors">{u.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                <Target size={12} className="text-primary" /> CF-{u.id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <Badge className={cn("px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest border-none shadow-sm", badge.bg, badge.text)}>
                            {badge.label}
                          </Badge>
                        </td>
                        <td className="px-10 py-8 hidden lg:table-cell">
                          <div className="flex items-center gap-3 text-slate-400">
                            <Mail size={16} className="text-primary" />
                            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{u.email}</span>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex items-center justify-end gap-6">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
                               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                               <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Active</span>
                            </div>
                            <button className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:text-primary group-hover:bg-primary/5 transition-all">
                              <MoreVertical size={20} />
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
        </section>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setShowModal(false)} />
          <form 
            onSubmit={handleCreate}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl p-10 md:p-14 shadow-2xl animate-in zoom-in-95 duration-500 border border-white/20 dark:border-slate-800"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-32 -mt-32" />
            
            <button type="button" onClick={() => setShowModal(false)} className="absolute top-10 right-10 w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all z-10">
              <X size={24} />
            </button>

            <header className="mb-12 relative z-10">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
                <UserPlus size={12} /> User Registration
              </div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Add New User</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-lg mt-2">Adding a new account to {currentUser?.tenantId}.</p>
            </header>

            <div className="space-y-8 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Full Name</Label>
                  <div className="relative group">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                    <input required type="text" placeholder="John Doe" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} className="w-full h-16 pl-16 pr-8 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border-none text-base font-bold dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Category / Role</Label>
                  <div className="relative group">
                    <Shield className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                    <select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})} className="w-full h-16 pl-16 pr-8 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border-none text-base font-bold dark:text-white focus:ring-2 focus:ring-primary/20 cursor-pointer outline-none appearance-none">
                      <option value="STUDENT">Student</option>
                      <option value="TEACHER">Teacher</option>
                      <option value="ADMIN">Administrator</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                  <input required type="email" placeholder="name@university.edu" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} className="w-full h-16 pl-16 pr-8 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border-none text-base font-bold dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                  <input required type={showPassword ? "text" : "password"} placeholder="••••••••" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} className="w-full h-16 pl-16 pr-14 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border-none text-base font-bold dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 outline-none" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                </div>
              </div>

              {(newUser.role === 'TEACHER' || newUser.role === 'STUDENT') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-4 duration-500">
                  <div className="space-y-3">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Department</Label>
                    <div className="relative group">
                      <Layers className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                      <select required value={newUser.departmentId} onChange={(e) => handleDeptChange(e.target.value)} className="w-full h-16 pl-16 pr-8 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border-none text-base font-bold dark:text-white focus:ring-2 focus:ring-primary/20 cursor-pointer outline-none appearance-none">
                        <option value="">Select Dept</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                  </div>
                  {newUser.role === 'STUDENT' && (
                    <div className="space-y-3">
                      <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Select Class</Label>
                      <div className="relative group">
                        <LayoutGrid className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                        <select required value={newUser.classRoomId} onChange={(e) => setNewUser({...newUser, classRoomId: e.target.value})} disabled={!newUser.departmentId} className="w-full h-16 pl-16 pr-8 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border-none text-base font-bold dark:text-white focus:ring-2 focus:ring-primary/20 cursor-pointer outline-none appearance-none disabled:opacity-50">
                          <option value="">Select Class</option>
                          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <Button type="submit" className="btn-premium w-full h-18 !rounded-xl group mt-4">
                <span>Create User Account</span>
                <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

