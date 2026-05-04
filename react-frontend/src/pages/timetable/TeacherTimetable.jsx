import React, { useState, useEffect } from 'react';
import timetableService from '../../services/timetableService';
import { toast } from 'react-toastify';
import { Clock, Calendar, BookOpen, Users, ChevronRight, RefreshCw, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

const DAY_COLORS = {
  MONDAY:    { bg: 'bg-indigo-50',  text: 'text-indigo-600',  dot: 'bg-indigo-500' },
  TUESDAY:   { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  WEDNESDAY: { bg: 'bg-amber-50',   text: 'text-amber-600',   dot: 'bg-amber-500' },
  THURSDAY:  { bg: 'bg-rose-50',    text: 'text-rose-600',    dot: 'bg-rose-500' },
  FRIDAY:    { bg: 'bg-violet-50',  text: 'text-violet-600',  dot: 'bg-violet-500' },
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
      toast.error('Failed to load schedule');
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
    <div className="animate-in fade-in duration-700 pb-20 px-4 max-w-4xl mx-auto">
      <header className="mb-8 pt-4 flex items-end justify-between">
        <div>
          <Badge variant="outline" className="mb-3 px-3 py-1 border-indigo-100 bg-indigo-50/30 text-indigo-600 font-bold tracking-widest text-[10px] uppercase">
            Faculty Schedule
          </Badge>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-none mb-2">My Timetable</h1>
          <p className="text-slate-500 font-medium">Your assigned classes this week.</p>
        </div>
        <button onClick={fetchTimetable} className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm active:scale-90">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      {/* Day Selector */}
      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-8">
        {DAYS.map(day => {
          const c = DAY_COLORS[day];
          const count = byDay[day]?.length || 0;
          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`flex-shrink-0 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 flex items-center gap-2 ${
                activeDay === day
                  ? `${c.bg} ${c.text} border-current shadow-sm`
                  : 'bg-white border-slate-100 text-slate-400'
              }`}
            >
              {day.slice(0, 3)}
              {count > 0 && (
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${activeDay === day ? `${c.dot} text-white` : 'bg-slate-100 text-slate-500'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Schedule for selected day */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-slate-100 rounded-3xl animate-pulse" />)}
        </div>
      ) : todaySlots.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
          <AlertCircle size={40} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No classes on {activeDay.charAt(0) + activeDay.slice(1).toLowerCase()}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {todaySlots.map((item, idx) => {
            const c = DAY_COLORS[activeDay];
            return (
              <Card key={item.id || idx} className="border-none shadow-sm bg-white rounded-3xl group hover:shadow-xl transition-all">
                <CardContent className="p-6 flex items-center gap-5">
                  <div className={`w-14 h-14 ${c.bg} ${c.text} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <BookOpen size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight truncate">{item.subject}</h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <Clock size={12} /> {item.startTime} – {item.endTime}
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <Users size={12} /> {item.classId}
                      </span>
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 ${c.bg} ${c.text} rounded-full text-[9px] font-black uppercase tracking-widest`}>
                    {item.startTime}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Weekly Summary */}
      {!loading && schedule.length > 0 && (
        <div className="mt-10 grid grid-cols-5 gap-3">
          {DAYS.map(day => {
            const c = DAY_COLORS[day];
            const count = byDay[day]?.length || 0;
            return (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`p-4 rounded-2xl text-center transition-all ${activeDay === day ? `${c.bg} border-2 border-current/20` : 'bg-white border border-slate-100'}`}
              >
                <span className={`text-[8px] font-black uppercase tracking-widest block mb-2 ${activeDay === day ? c.text : 'text-slate-400'}`}>{day.slice(0, 3)}</span>
                <span className={`text-xl font-black ${activeDay === day ? c.text : 'text-slate-300'}`}>{count}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeacherTimetable;
