import React from 'react';
import { CalendarDays, Clock, CheckCircle2, XCircle, AlertCircle, MapPin } from 'lucide-react';
import { cn } from "@/lib/utils";

const AttendanceCard = ({ record }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'PRESENT':
        return { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Verified' };
      case 'LATE':
        return { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Late Entry' };
      case 'ABSENT':
        return { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50', label: 'Absent' };
      case 'ACTIVE':
        return { icon: Clock, color: 'text-indigo-500', bg: 'bg-indigo-50', label: 'Live Session' };
      case 'EXPIRED':
        return { icon: XCircle, color: 'text-slate-400', bg: 'bg-slate-50', label: 'Closed' };
      default:
        return { icon: CheckCircle2, color: 'text-slate-400', bg: 'bg-slate-50', label: status };
    }
  };

  const config = getStatusConfig(record.status);

  return (
    <div className="group relative bg-white rounded-3xl p-5 border border-slate-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden">
      {/* Decorative Gradient Background */}
      <div className={cn(
        "absolute -right-10 -top-10 w-32 h-32 blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-700 rounded-full",
        config.bg.replace('bg-', 'bg-')
      )} />

      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-4">
          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 shadow-sm", config.bg)}>
            <config.icon className={config.color} size={24} />
          </div>
          <div className="min-w-0">
            <h4 className="font-black text-slate-900 text-sm leading-tight truncate uppercase tracking-tight">
              {record.subject || 'Standard Module'}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                ID-{record.classRoomId || record.classId || 'N/A'}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-200" />
              <div className="flex items-center gap-1">
                <MapPin size={10} className="text-slate-300" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Campus Main</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className={cn(
          "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border animate-in fade-in slide-in-from-right-2 duration-500",
          config.bg, config.color, "border-current/10"
        )}>
          {config.label}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-slate-50">
        <div className="flex flex-col gap-1">
          <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Temporal Log</span>
          <div className="flex items-center gap-2">
            <CalendarDays size={14} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-600">
              {record.timestamp ? new Date(record.timestamp).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1 items-end text-right">
          <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Precision Time</span>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-600">
              {record.timestamp ? new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCard;
