import React, { useState, useEffect, useContext } from 'react';
import { 
  School, 
  ArrowLeft, 
  Save, 
  Mail, 
  MapPin, 
  Hash,
  Globe,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import hierarchyService from '../../services/hierarchyService';
import { AuthContext } from '../../context/AuthContext';

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
    <div className="pb-32 px-4 pt-4 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 active:scale-90 transition-all shadow-sm"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none mb-1">Infrastructure Setup</p>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">University Registry</h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto">
        {university ? (
          <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[3rem] text-center mb-10 animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <School className="text-emerald-500" size={40} />
            </div>
            <h2 className="text-2xl font-black text-emerald-900 uppercase tracking-tight mb-2">{university.name}</h2>
            <div className="flex items-center justify-center gap-4 text-emerald-600/60 text-[10px] font-black uppercase tracking-widest">
              <span className="flex items-center gap-1"><Hash size={12} /> {university.code}</span>
              <span className="w-1 h-1 rounded-full bg-emerald-200" />
              <span className="flex items-center gap-1"><Globe size={12} /> Active Node</span>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl mb-10 flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
              <RefreshCw className="text-amber-500 animate-spin-slow" size={24} />
            </div>
            <div>
              <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Initial Setup Required</h4>
              <p className="text-[10px] font-bold text-amber-600/80 uppercase tracking-widest">No university identity found for tenant {user?.tenantId}.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Official Name</label>
              <div className="relative group">
                <School className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Stanford University"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full h-14 pl-14 pr-6 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Institution Code</label>
                <div className="relative group">
                  <Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    readOnly
                    type="text" 
                    value={formData.code}
                    className="w-full h-14 pl-14 pr-6 rounded-2xl bg-slate-100 border-none text-sm font-black text-slate-400 outline-none cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Contact Email</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                  <input 
                    required
                    type="email" 
                    placeholder="admin@uni.edu"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                    className="w-full h-14 pl-14 pr-6 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Campus Address</label>
              <div className="relative group">
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  required
                  type="text" 
                  placeholder="Street, City, Country"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full h-14 pl-14 pr-6 rounded-2xl bg-slate-50 border-none text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading || university}
            className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? <RefreshCw className="animate-spin" size={20} /> : (
              <>
                <Save size={20} />
                {university ? 'Identity Verified' : 'Establish Registry'}
              </>
            )}
          </button>
        </form>

        {university && (
          <p className="text-center mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Identity is locked to tenant ID. Contact support for migration.
          </p>
        )}
      </div>
    </div>
  );
};

export default UniversityManagement;
