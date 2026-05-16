import React, { useState, useEffect } from 'react';
import timetableService from '../../services/timetableService';
import { toast } from 'react-toastify';
import { Clock, BookOpen, User, Baby, AlertCircle, RefreshCw, ChevronRight, Sparkles, MapPin, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

const DAY_COLORS = {
  MONDAY:    { bg: 'bg-indigo-50 dark:bg-indigo-900/10',  text: 'text-indigo-600 dark:text-indigo-400',  dot: 'bg-indigo-500' },
  TUESDAY:   { bg: 'bg-emerald-50 dark:bg-emerald-900/10', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  WEDNESDAY: { bg: 'bg-amber-50 dark:bg-amber-900/10',   text: 'text-amber-600 dark:text-amber-400',   dot: 'bg-amber-500' },
  THURSDAY:  { bg: 'bg-rose-50 dark:bg-rose-900/10',    text: 'text-rose-600 dark:text-rose-400',    dot: 'bg-rose-500' },
  FRIDAY:    { bg: 'bg-violet-50 dark:bg-violet-900/10',  text: 'text-violet-600 dark:text-violet-400',  dot: 'bg-violet-500' },
};

const ParentTimetable = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(DAYS[new Date().getDay() - 1] || 'MONDAY');

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const data = await timetableService.getParentTimetable();
      setSchedule(data);
    } catch (err) {
      toast.error('Could not load student schedule');
    } finally {
      setLoading(false);
    }
  };

  const byDay = DAYS.reduce((acc, day) => {
    acc[day] = schedule.filter(s => s.dayOfWeek?.toUpperCase() === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
    return acc;
  }, {});

  const todaySlots = byDay[activeDay] || [];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-32 px-6 pt-8 max-w-4xl mx-auto">
      {/* Student Banner */}
      <section className="mb-10 p-10 premium-card relative overflow-hidden flex flex-col md:flex-row md:items-center gap-8">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-[60px]" />
        
        <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
          <Baby className="text-indigo-500" size={40} />
        </div>
        <div className="flex-1 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">
            <Sparkles size={12} /> My Child's Classes
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-none">School Schedule</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">{schedule.length} classes scheduled for this week.</p>
        </div>
        <button 
          onClick={fetchTimetable} 
          className="w-14 h-14 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-xl active:scale-95 group"
        >
          <RefreshCw size={20} className={`${loading ? 'animate-spin text-primary' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
        </button>
      </section>

      {/* Day Selector */}
      <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar mb-10 -mx-6 px-6">
        {DAYS.map(day => {
          const c = DAY_COLORS[day];
          const count = byDay[day]?.length || 0;
          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`flex-shrink-0 px-8 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all border-2 flex items-center gap-3 active:scale-95 ${
                activeDay === day ? `${c.bg} ${c.text} border-current shadow-lg scale-105` : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400'
              }`}
            >
              {day.slice(0, 3)}
              {count > 0 && (
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${activeDay === day ? 'bg-current/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Classes */}
      <section className="space-y-6">
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-100 dark:bg-slate-900 rounded-xl animate-pulse" />)}
          </div>
        ) : todaySlots.length === 0 ? (
          <div className="py-24 text-center premium-card border-dashed">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">
              ✨
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-1">No classes today.</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm uppercase tracking-widest">Your child has no sessions scheduled for {activeDay.charAt(0) + activeDay.slice(1).toLowerCase()}.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {todaySlots.map((item, idx) => {
              const c = DAY_COLORS[activeDay];
              return (
                <Card key={item.id || idx} className="premium-card group overflow-hidden p-0 border-none">
                   <div className={`w-2 h-full absolute left-0 top-0 ${c.dot || 'bg-primary'}`} />
                   <CardContent className="p-8 flex items-center gap-8">
                    <div className={`w-16 h-16 ${c.bg} ${c.text} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                      <BookOpen size={28} />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-primary transition-colors truncate">{item.subject}</h3>
                      <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                          <Clock size={16} className="text-primary" /> {item.startTime} – {item.endTime}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                          <User size={16} className="text-primary" /> {item.teacherName}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                          <MapPin size={16} className="text-primary" /> Room {item.roomNumber || '302'}
                        </div>
                      </div>
                    </div>
                    <div className="hidden md:flex flex-col items-end gap-2">
                      <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-300 group-hover:text-primary group-hover:bg-primary/5 transition-all shadow-sm">
                        <ArrowRight size={24} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default ParentTimetable;

