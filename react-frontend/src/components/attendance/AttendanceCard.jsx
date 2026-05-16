import React from 'react';
import { CalendarDays, Clock, CheckCircle2, XCircle, AlertCircle, MapPin, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";

const AttendanceCard = ({ record }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'PRESENT':
        return { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', label: 'Present' };
      case 'LATE':
        return { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', label: 'Late' };
      case 'ABSENT':
        return { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20', label: 'Absent' };
      case 'ACTIVE':
        return { icon: Clock, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20', label: 'In Class' };
      case 'EXPIRED':
        return { icon: XCircle, color: 'text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800/50', label: 'Ended' };
      default:
        return { icon: CheckCircle2, color: 'text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800/50', label: status };
    }
  };

  const config = getStatusConfig(record.status);

  return (
    <div className="group premium-card p-6 relative overflow-hidden flex flex-col gap-6">
      <div className="flex justify-between items-start">
        <div className="flex gap-5">
          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-sm", config.bg)}>
            <config.icon className={config.color} size={28} />
          </div>
          <div className="min-w-0">
            <h4 className="font-extrabold text-slate-900 dark:text-white text-lg leading-tight truncate tracking-tight">
              {record.subject || 'School Lesson'}
            </h4>
            <div className="flex items-center gap-2.5 mt-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                Room {record.classRoomId || record.classId || '101'}
              </span>
              <div className="flex items-center gap-1 text-slate-400">
                <MapPin size={12} className="text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-tight">Main Campus</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className={cn(
          "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-500",
          config.bg, config.color, "border-current/10"
        )}>
          {config.label}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-5 border-t border-slate-100 dark:border-slate-800">
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Date</span>
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-primary" />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {record.timestamp ? new Date(record.timestamp).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 items-end text-right">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Time Marked</span>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-primary" />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {record.timestamp ? new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Subtle indicator */}
      <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight size={20} className="text-slate-200" />
      </div>
    </div>
  );
};

export default AttendanceCard;
