import React, { useState, useEffect } from 'react';
import timetableService from '../../services/timetableService';
import { toast } from 'react-toastify';
import { Clock, BookOpen, User, Baby, AlertCircle, RefreshCw, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

const DAY_COLORS = {
  MONDAY:    { bg: 'bg-indigo-50',  text: 'text-indigo-600' },
  TUESDAY:   { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  WEDNESDAY: { bg: 'bg-amber-50',   text: 'text-amber-600' },
  THURSDAY:  { bg: 'bg-rose-50',    text: 'text-rose-600' },
  FRIDAY:    { bg: 'bg-violet-50',  text: 'text-violet-600' },
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
      toast.error(err.response?.data?.message || 'Failed to load child timetable');
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
      {/* Child Banner */}
      <section className="mb-8 pt-4 p-8 rounded-[3rem] bg-white border border-slate-100 shadow-sm flex items-center gap-6">
        <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center shrink-0">
          <Baby className="text-indigo-500" size={32} />
        </div>
        <div className="flex-1">
          <Badge variant="outline" className="mb-2 px-3 py-1 border-indigo-100 bg-indigo-50/30 text-indigo-600 font-bold tracking-widest text-[10px] uppercase">
            Ward Schedule
          </Badge>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">Child's Timetable</h1>
          <p className="text-slate-400 font-medium text-sm mt-1">{schedule.length} classes this week</p>
        </div>
        <button onClick={fetchTimetable} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-primary transition-all active:scale-90">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </section>

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
                activeDay === day ? `${c.bg} ${c.text} border-current shadow-sm` : 'bg-white border-slate-100 text-slate-400'
              }`}
            >
              {day.slice(0, 3)}
              {count > 0 && (
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${activeDay === day ? 'bg-current/20' : 'bg-slate-100 text-slate-500'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Classes */}
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
                  <div className={`w-14 h-14 ${c.bg} ${c.text} rounded-2xl flex items-center justify-center shrink-0`}>
                    <BookOpen size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight truncate">{item.subject}</h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <Clock size={12} /> {item.startTime} – {item.endTime}
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <User size={12} /> {item.teacherName}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-200 group-hover:text-primary transition-colors shrink-0" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ParentTimetable;
