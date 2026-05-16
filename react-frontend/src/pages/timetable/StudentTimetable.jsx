import React, { useState, useEffect } from 'react';
import timetableService from '../../services/timetableService';
import { toast } from 'react-toastify';
import { 
  Clock, 
  MapPin, 
  User, 
  Calendar as CalendarIcon, 
  Filter,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Settings2,
  Sparkles,
  Download,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const StudentTimetable = () => {
  const [timetable, setTimetable] = useState([]);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 8 AM to 6 PM
  const [activeDay, setActiveDay] = useState(days[new Date().getDay() - 1] || 'Monday');

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const data = await timetableService.getStudentTimetable();
      setTimetable(data);
    } catch (err) {
      toast.error('Could not sync schedule');
    }
  };

  const getGridRow = (timeStr) => {
    if (!timeStr) return 1;
    const [h, m] = timeStr.split(':').map(Number);
    const startHour = 8;
    return (h - startHour) * 2 + (m >= 30 ? 2 : 1);
  };

  const getDurationRows = (start, end) => {
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    const totalMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
    return Math.ceil(totalMinutes / 30);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-6xl mx-auto pb-32 px-6 pt-8">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">
            <Sparkles size={12} /> Learning Plan
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-none">Class Schedule</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Your weekly plan for classes and activities.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none rounded-xl border-slate-200 dark:border-slate-800 shadow-sm gap-2 font-black text-[11px] uppercase tracking-widest px-8 h-14 hover:bg-slate-50 dark:hover:bg-slate-900">
            <Filter size={18} /> Filter
          </Button>
          <Button className="flex-1 md:flex-none btn-premium h-14 !rounded-xl px-8">
            <Download size={18} /> <span>Download</span>
          </Button>
        </div>
      </header>

      {/* Mobile Day Selector */}
      <div className="flex md:hidden gap-3 overflow-x-auto pb-8 no-scrollbar -mx-6 px-6 mb-4">
        {days.map(day => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-8 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all whitespace-nowrap border-2
              ${activeDay === day 
                ? 'bg-slate-950 border-slate-950 text-white shadow-xl shadow-slate-900/20 scale-105' 
                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400'}`}
          >
            {day}
          </button>
        ))}
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl rounded-xl overflow-hidden border border-white/20 dark:border-slate-800">
        <div className="overflow-x-auto no-scrollbar">
          <div className="w-full min-w-[300px]">
            {/* Desktop Header */}
            <div className="hidden md:grid grid-cols-[120px_repeat(5,1fr)] border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30">
              <div className="p-8 border-r border-slate-100 dark:border-slate-800 flex items-center justify-center">
                <Clock size={24} className="text-slate-300 dark:text-slate-600" />
              </div>
              {days.map(day => (
                <div key={day} className="p-8 text-center border-r border-slate-100 dark:border-slate-800 last:border-r-0">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-2">{day.slice(0, 3)}</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">{day}</span>
                </div>
              ))}
            </div>

            {/* Mobile Header (Single Day) */}
            <div className="grid md:hidden grid-cols-[100px_1fr] border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30">
              <div className="p-6 border-r border-slate-100 dark:border-slate-800 flex items-center justify-center">
                <Clock size={20} className="text-slate-300 dark:text-slate-600" />
              </div>
              <div className="p-6 flex items-center justify-between px-8">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">{activeDay}</h3>
                <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">Daily Plan</Badge>
              </div>
            </div>

            {/* Grid Body */}
            <div className="grid grid-cols-[100px_1fr] md:grid-cols-[120px_repeat(5,1fr)] relative">
              {/* Time Column */}
              <div className="flex flex-col border-r border-slate-100 dark:border-slate-800">
                {hours.map(hour => (
                  <div key={hour} className="h-28 border-b border-slate-50/50 dark:border-slate-800/50 flex items-center justify-center bg-slate-50/10 dark:bg-slate-800/5">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center px-2">
                      {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                    </span>
                  </div>
                ))}
              </div>

              {/* Day Columns */}
              {days.map((day, dayIdx) => (
                <div 
                  key={day} 
                  className={`relative h-full border-r border-slate-100 dark:border-slate-800 last:border-r-0 
                    ${day === activeDay ? 'block' : 'hidden md:block'}`}
                >
                  {hours.map(hour => (
                    <div key={hour} className="h-28 border-b border-slate-50/50 dark:border-slate-800/50 w-full" />
                  ))}

                  {/* Timetable Items */}
                  {timetable
                    .filter(item => item.dayOfWeek.toUpperCase() === day.toUpperCase())
                    .map((item, idx) => {
                      const rowStart = getGridRow(item.startTime);
                      const rowSpan = getDurationRows(item.startTime, item.endTime);
                      
                      return (
                        <div 
                          key={idx}
                          className="absolute left-2 right-2 rounded-xl p-5 bg-white dark:bg-slate-800 border-l-[6px] border-primary shadow-lg shadow-slate-200/50 dark:shadow-none group hover:shadow-2xl hover:shadow-primary/20 hover:scale-[1.02] transition-all cursor-pointer z-10"
                          style={{
                            top: `${(rowStart - 1) * 56}px`,
                            height: `${rowSpan * 56 - 8}px`,
                          }}
                        >
                          <div className="flex flex-col h-full justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-md">{item.startTime} - {item.endTime}</span>
                                <BadgeCheck size={16} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight group-hover:text-primary transition-colors line-clamp-2">{item.subject || item.courseName}</h4>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-slate-50 dark:bg-slate-700 flex items-center justify-center">
                                <MapPin size={12} className="text-primary" />
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate">{item.roomNumber || 'Room 302'}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Summary Footer */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="stat-card p-8 flex items-center gap-6">
           <div className="w-16 h-16 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-inner">
             <BookOpen size={32} />
           </div>
           <div>
             <h4 className="text-xl font-black text-slate-900 dark:text-white leading-tight">24 Hours</h4>
             <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">Weekly Hours</p>
           </div>
        </div>
        <div className="stat-card p-8 flex items-center gap-6">
           <div className="w-16 h-16 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
             <User size={32} />
           </div>
           <div>
             <h4 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Support</h4>
             <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">Class Advisor</p>
           </div>
        </div>
        <div className="flex items-center">
           <Button className="w-full h-16 rounded-xl bg-slate-950 dark:bg-white dark:text-slate-950 text-white font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all group">
             <span className="flex items-center gap-2">View Semester Plan <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></span>
           </Button>
        </div>
      </div>
    </div>
  );
};

export default StudentTimetable;

