import React, { useState, useEffect } from 'react';
import timetableService from '../../services/timetableService';
import { toast } from 'react-toastify';
import { Clock, Calendar, BookOpen, Users, ChevronRight, RefreshCw, AlertCircle, Sparkles, MapPin, ArrowRight, Activity } from 'lucide-react';
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

const TeacherTimetable = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(DAYS[new Date().getDay() - 1] || 'MONDAY');

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const data = await timetableService.getTeacherTimetable();
      setSchedule(data);
    } catch (err) {
      toast.error('Could not load teaching schedule');
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
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">
            <Sparkles size={12} /> Teaching Schedule
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-none">My Weekly Classes</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Check your teaching hours and assigned classrooms.</p>
        </div>
        <button 
          onClick={fetchTimetable} 
          className="w-14 h-14 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-xl active:scale-95 group"
        >
          <RefreshCw size={20} className={`${loading ? 'animate-spin text-primary' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
        </button>
      </header>

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
                activeDay === day
                  ? `${c.bg} ${c.text} border-current shadow-lg shadow-current/5 scale-105`
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400'
              }`}
            >
              {day.slice(0, 3)}
              {count > 0 && (
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${activeDay === day ? `${c.dot} text-white` : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Schedule for selected day */}
      <section className="space-y-6">
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-100 dark:bg-slate-900 rounded-xl animate-pulse" />)}
          </div>
        ) : todaySlots.length === 0 ? (
          <div className="py-24 text-center premium-card border-dashed">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">
              ☕
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-1">Relax! No classes today.</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-widest">No teaching sessions scheduled for {activeDay.charAt(0) + activeDay.slice(1).toLowerCase()}.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {todaySlots.map((item, idx) => {
              const c = DAY_COLORS[activeDay];
              return (
                <Card key={item.id || idx} className="premium-card group overflow-hidden p-0 border-none">
                  <div className={`w-2 h-full absolute left-0 top-0 ${c.dot}`} />
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
                          <MapPin size={16} className="text-primary" /> Room {item.roomNumber || '302'}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                          <Users size={16} className="text-primary" /> Class {item.classId}
                        </div>
                      </div>
                    </div>
                    <div className="hidden md:flex flex-col items-end gap-2">
                       <span className={`px-4 py-2 ${c.bg} ${c.text} rounded-full text-[10px] font-black uppercase tracking-widest border border-current/10`}>
                        {item.startTime}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                        <ArrowRight size={20} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Weekly Pulse Summary */}
      {!loading && schedule.length > 0 && (
        <section className="mt-16">
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-2 flex items-center gap-2">
            <Activity className="text-primary" size={16} /> Weekly Class Pulse
          </h4>
          <div className="grid grid-cols-5 gap-4">
            {DAYS.map(day => {
              const c = DAY_COLORS[day];
              const count = byDay[day]?.length || 0;
              return (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`p-6 rounded-xl text-center transition-all duration-500 ${activeDay === day ? `${c.bg} border-2 border-current shadow-xl scale-105` : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800'}`}
                >
                  <span className={`text-[10px] font-black uppercase tracking-widest block mb-3 ${activeDay === day ? c.text : 'text-slate-400'}`}>{day.slice(0, 3)}</span>
                  <span className={`text-2xl font-black ${activeDay === day ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-slate-700'}`}>{count}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default TeacherTimetable;

