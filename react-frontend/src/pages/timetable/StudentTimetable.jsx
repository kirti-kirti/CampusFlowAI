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
  Settings2
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
      toast.error('Sync failed');
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
    <div className="animate-in fade-in duration-1000 max-w-6xl mx-auto pb-20 px-4 md:px-0">
      <header className="mb-8 pt-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Badge variant="outline" className="mb-3 px-3 py-1 border-indigo-100 bg-indigo-50/30 text-indigo-600 font-bold tracking-widest text-[10px] uppercase">
            Academic Flow
          </Badge>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 leading-none mb-3">Calendar View</h1>
          <p className="text-slate-500 font-medium text-base md:text-lg">Weekly curriculum synchronization matrix.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none rounded-2xl border-slate-200 shadow-sm gap-2 font-black text-[10px] uppercase tracking-widest px-6 h-12">
            <Filter size={16} /> Filter
          </Button>
          <Button className="flex-1 md:flex-none rounded-2xl shadow-xl shadow-primary/20 gap-2 font-black text-[10px] uppercase tracking-widest px-6 h-12">
            <Settings2 size={16} /> Settings
          </Button>
        </div>
      </header>

      {/* Mobile Day Selector (Horizontal Scroll) */}
      <div className="flex md:hidden gap-2 overflow-x-auto pb-6 no-scrollbar -mx-4 px-4 mb-4">
        {days.map(day => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border-2
              ${activeDay === day 
                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105' 
                : 'bg-white border-slate-100 text-slate-400'}`}
          >
            {day}
          </button>
        ))}
      </div>

      <Card className="border-none shadow-[0_30px_90px_rgba(0,0,0,0.04)] bg-white rounded-[2.5rem] md:rounded-[3rem] overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          {/* Calendar Grid Container */}
          <div className="w-full">
            {/* Desktop Header */}
            <div className="hidden md:grid grid-cols-[100px_repeat(5,1fr)] border-b border-slate-50">
              <div className="p-6 bg-slate-50/50 border-r border-slate-50 flex items-center justify-center">
                <Clock size={20} className="text-slate-300" />
              </div>
              {days.map(day => (
                <div key={day} className="p-6 text-center border-r border-slate-50 last:border-r-0">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">{day.slice(0, 3)}</span>
                  <span className="text-lg font-black text-slate-900">{day}</span>
                </div>
              ))}
            </div>

            {/* Mobile Header (Single Day) */}
            <div className="grid md:hidden grid-cols-[80px_1fr] border-b border-slate-50">
              <div className="p-4 bg-slate-50/50 border-r border-slate-50 flex items-center justify-center">
                <Clock size={18} className="text-slate-300" />
              </div>
              <div className="p-4 flex items-center justify-between px-6">
                <h3 className="text-lg font-black text-slate-900">{activeDay}</h3>
                <Badge className="bg-primary/5 text-primary border-none text-[10px] font-black uppercase tracking-widest px-3 py-1">Timeline</Badge>
              </div>
            </div>

            {/* Grid Body */}
            <div className="grid grid-cols-[80px_1fr] md:grid-cols-[100px_repeat(5,1fr)] relative">
              {/* Time Column */}
              <div className="flex flex-col border-r border-slate-50">
                {hours.map(hour => (
                  <div key={hour} className="h-24 border-b border-slate-50/50 flex items-center justify-center bg-slate-50/10">
                    <span className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest text-center px-2">
                      {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                    </span>
                  </div>
                ))}
              </div>

              {/* Day Columns */}
              {days.map((day, dayIdx) => (
                <div 
                  key={day} 
                  className={`relative h-full border-r border-slate-50 last:border-r-0 
                    ${day === activeDay ? 'block' : 'hidden md:block'}`}
                >
                  {hours.map(hour => (
                    <div key={hour} className="h-24 border-b border-slate-50/50 w-full" />
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
                          className="absolute left-1 md:left-2 right-1 md:right-2 rounded-xl md:rounded-2xl p-2 md:p-4 bg-indigo-50 border-l-4 border-primary shadow-sm group hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer z-10"
                          style={{
                            top: `${(rowStart - 1) * 48}px`,
                            height: `${rowSpan * 48 - 4}px`,
                          }}
                        >
                          <div className="flex flex-col h-full justify-between">
                            <div className="min-w-0">
                              <div className="flex items-center justify-between mb-0.5 md:mb-1">
                                <span className="text-[7px] md:text-[8px] font-black text-primary uppercase tracking-[0.2em]">{item.startTime}</span>
                                <BadgeCheck size={12} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity hidden md:block" />
                              </div>
                              <h4 className="text-[10px] md:text-xs font-black text-slate-900 leading-tight group-hover:text-primary transition-colors truncate">{item.subject || item.courseName}</h4>
                            </div>
                            <div className="flex items-center gap-1 mt-auto">
                              <MapPin size={8} className="text-slate-400 shrink-0" />
                              <span className="text-[8px] md:text-[9px] font-bold text-slate-400 truncate">{item.roomNumber || 'Room 302'}</span>
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

      {/* Summary Footer (Responsive) */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="border-none shadow-sm bg-white p-4 md:p-6 rounded-3xl flex items-center gap-3 md:gap-5">
           <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
             <CalendarIcon size={20} className="md:size-24" />
           </div>
           <div className="min-w-0">
             <h4 className="text-xs md:text-sm font-black text-slate-900 truncate">24 Credits</h4>
             <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Academic Load</p>
           </div>
        </Card>
        <Card className="border-none shadow-sm bg-white p-4 md:p-6 rounded-3xl flex items-center gap-3 md:gap-5">
           <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
             <User size={20} className="md:size-24" />
           </div>
           <div className="min-w-0">
             <h4 className="text-xs md:text-sm font-black text-slate-900 truncate">Advisor</h4>
             <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Synced</p>
           </div>
        </Card>
        <Card className="border-none shadow-sm bg-white p-4 md:p-6 rounded-3xl flex items-center gap-3 md:gap-5 col-span-2 md:col-span-1">
           <Button className="w-full h-11 md:h-12 rounded-xl md:rounded-2xl bg-slate-900 text-white font-black text-[9px] md:text-[10px] uppercase tracking-widest shadow-xl">
             Export Schedule
           </Button>
        </Card>
      </div>
    </div>
  );
};

export default StudentTimetable;
