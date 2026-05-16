import React, { useState, useEffect, useContext } from 'react';
import { 
  School, 
  ArrowLeft, 
  Save, 
  Mail, 
  MapPin, 
  Hash,
  Globe,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import hierarchyService from '../../services/hierarchyService';
import { AuthContext } from '../../context/AuthContext';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const UniversityManagement = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [university, setUniversity] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: user?.tenantId || '',
    address: '',
    contactEmail: user?.email || ''
  });

  useEffect(() => {
    fetchUniversity();
  }, []);

  const fetchUniversity = async () => {
    try {
      const data = await hierarchyService.getUniversities();
      const myUni = data.find(u => u.code === user?.tenantId);
      if (myUni) {
        setUniversity(myUni);
        setFormData(myUni);
      }
    } catch (err) {
      console.error('Failed to fetch university');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await hierarchyService.createUniversity(formData);
      toast.success('University identity established');
      fetchUniversity();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-32 px-6 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-4xl mx-auto">
      {/* Header */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 px-2">
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
              <ShieldCheck size={12} /> Infrastructure Registry
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-none mt-4">Institutional Profile</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Define your university's global identity and metadata.</p>
        </div>
      </header>

      <div className="grid gap-12">
        {university ? (
          <div className="relative overflow-hidden premium-card p-12 text-center group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />
            <div className="relative z-10">
              <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-100/50 dark:shadow-none group-hover:scale-110 transition-transform duration-500">
                <Building2 className="text-emerald-500" size={48} />
              </div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">{university.name}</h2>
              <div className="flex flex-wrap items-center justify-center gap-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-full text-[11px] font-black text-slate-500 uppercase tracking-widest border border-slate-100 dark:border-slate-700">
                  <Hash size={14} className="text-primary" /> Tenant ID: {university.code}
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/10 rounded-full text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/20">
                  <Globe size={14} /> Active Deployment
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 dark:bg-amber-900/10 border-2 border-dashed border-amber-200 dark:border-amber-900/30 p-10 rounded-xl text-center">
            <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-200/50 dark:shadow-none">
              <RefreshCw className="text-amber-500 animate-spin" size={32} />
            </div>
            <h4 className="text-2xl font-black text-amber-900 dark:text-amber-400 tracking-tight">Identity Required</h4>
            <p className="text-amber-700/70 dark:text-amber-500 font-medium text-lg mt-2">No institutional records found for tenant code <strong>{user?.tenantId}</strong>.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="premium-card p-10 md:p-14 space-y-10 border-none shadow-2xl shadow-slate-200/40 dark:shadow-none">
          <header className="border-b border-slate-50 dark:border-slate-800 pb-8">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Global Metadata</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Update your institution's contact and location details.</p>
          </header>

          <div className="space-y-8">
            <div className="space-y-3">
              <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Official University Name</Label>
              <div className="relative group">
                <School className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Stanford University"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full h-16 pl-16 pr-8 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border-none text-lg font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Institution Code (Locked)</Label>
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input 
                    readOnly
                    type="text" 
                    value={formData.code}
                    className="w-full h-16 pl-16 pr-8 rounded-xl bg-slate-100/30 dark:bg-slate-800/20 border-none text-lg font-black text-slate-400 outline-none cursor-not-allowed shadow-inner"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Primary Contact Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                  <input 
                    required
                    type="email" 
                    placeholder="registrar@university.edu"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                    className="w-full h-16 pl-16 pr-8 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border-none text-lg font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Campus HQ Address</Label>
              <div className="relative group">
                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                <input 
                  required
                  type="text" 
                  placeholder="Street, City, State, ZIP, Country"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full h-16 pl-16 pr-8 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border-none text-lg font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
              </div>
            </div>
          </div>

          <Button 
            type="submit"
            disabled={loading || university}
            className="btn-premium w-full h-18 !rounded-xl group shadow-2xl disabled:opacity-50"
          >
            {loading ? <RefreshCw className="animate-spin" size={24} /> : (
              <span className="flex items-center gap-3 text-lg">
                {university ? (
                  <>
                    <ShieldCheck size={24} /> Identity Verified
                  </>
                ) : (
                  <>
                    Establish Registry <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </span>
            )}
          </Button>
        </form>

        {university && (
          <div className="flex items-center justify-center gap-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">
            <Lock size={14} className="text-slate-300" /> Administrative Identity is Locked to Node {user?.tenantId}
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversityManagement;

