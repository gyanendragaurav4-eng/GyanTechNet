import { useState } from "react";
import {
  FiCalendar, FiChevronLeft, FiChevronRight, FiPlus, FiX, FiZap,
  FiCheck, FiClock, FiList, FiRefreshCw,
} from "react-icons/fi";
import { cn } from "@/lib/utils";

const DAYS_OF_WEEK = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

type CalEvent = {
  id: string;
  title: string;
  day: number;
  month: number;
  year: number;
  time?: string;
  color: string;
  category: string;
};

const EVENT_COLORS = [
  { id:"violet", cls:"bg-violet-500",  border:"border-violet-500/30" },
  { id:"blue",   cls:"bg-blue-500",    border:"border-blue-500/30" },
  { id:"emerald",cls:"bg-emerald-500", border:"border-emerald-500/30" },
  { id:"amber",  cls:"bg-amber-500",   border:"border-amber-500/30" },
  { id:"pink",   cls:"bg-pink-500",    border:"border-pink-500/30" },
  { id:"cyan",   cls:"bg-cyan-500",    border:"border-cyan-500/30" },
];

const CATEGORIES = ["Meeting","Personal","Work","Health","Learning","Other"];

const INITIAL_EVENTS: CalEvent[] = [
  { id:"1", title:"Team Sync",           day:5,  month:4, year:2026, time:"10:00 AM", color:"bg-blue-500",    category:"Meeting" },
  { id:"2", title:"Product Launch",      day:12, month:4, year:2026, time:"2:00 PM",  color:"bg-violet-500",  category:"Work" },
  { id:"3", title:"Design Review",       day:15, month:4, year:2026, time:"11:00 AM", color:"bg-amber-500",   category:"Work" },
  { id:"4", title:"Marketing Strategy",  day:22, month:4, year:2026, time:"3:00 PM",  color:"bg-emerald-500", category:"Meeting" },
  { id:"5", title:"Client Demo",         day:28, month:4, year:2026, time:"4:00 PM",  color:"bg-pink-500",    category:"Work" },
  { id:"6", title:"Gym",                 day:10, month:4, year:2026, time:"7:00 AM",  color:"bg-cyan-500",    category:"Health" },
  { id:"7", title:"AI Workshop",         day:18, month:4, year:2026, time:"2:00 PM",  color:"bg-violet-500",  category:"Learning" },
];

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear]   = useState(2026);
  const [month, setMonth] = useState(4); // 0-indexed
  const [view, setView]   = useState<"month"|"agenda">("month");
  const [events, setEvents] = useState<CalEvent[]>(INITIAL_EVENTS);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [newEvent, setNewEvent] = useState({ title:"", time:"", color:"bg-violet-500", category:"Meeting" });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGoal, setAiGoal] = useState("");
  const [showAiSchedule, setShowAiSchedule] = useState(false);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };
  const toToday = () => { setYear(now.getFullYear()); setMonth(now.getMonth()); };

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const grid: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) grid.push(null);
  for (let i = 1; i <= daysInMonth; i++) grid.push(i);
  while (grid.length % 7 !== 0) grid.push(null);

  const monthEvents = events.filter(e => e.month === month && e.year === year);
  const dayEvents = (day: number) => monthEvents.filter(e => e.day === day);
  const isToday = (day: number) => day === now.getDate() && month === now.getMonth() && year === now.getFullYear();

  const addEvent = () => {
    if (!newEvent.title.trim() || !selectedDay) return;
    setEvents(prev => [...prev, {
      id: Math.random().toString(36).slice(2),
      title: newEvent.title,
      day: selectedDay,
      month, year,
      time: newEvent.time || undefined,
      color: newEvent.color,
      category: newEvent.category,
    }]);
    setNewEvent({ title:"", time:"", color:"bg-violet-500", category:"Meeting" });
    setShowAdd(false);
  };

  const deleteEvent = (id: string) => setEvents(prev => prev.filter(e => e.id !== id));

  const aiSchedule = async () => {
    if (!aiGoal.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          messages:[{ role:"user", content:`Schedule this goal as calendar events for the month of ${MONTHS[month]} ${year}. Goal: ${aiGoal}. Return ONLY a JSON array like: [{"title":"Event","day":5,"time":"10:00 AM","category":"Work"}]. Use days between 1-${daysInMonth}. Create 4-6 events.` }],
          mode:"Normal", model:"openai/gpt-4o-mini",
        }),
      });
      const data = await res.json();
      const parsed: { title: string; day: number; time?: string; category?: string }[] = JSON.parse(data.content || "[]");
      const colors = ["bg-violet-500","bg-blue-500","bg-emerald-500","bg-amber-500","bg-pink-500","bg-cyan-500"];
      const newEvents: CalEvent[] = parsed.map((e, i) => ({
        id: Math.random().toString(36).slice(2),
        title: e.title,
        day: Math.min(Math.max(e.day, 1), daysInMonth),
        month, year,
        time: e.time,
        color: colors[i % colors.length],
        category: e.category || "Work",
      }));
      setEvents(prev => [...prev, ...newEvents]);
      setAiGoal(""); setShowAiSchedule(false);
    } catch { /* ignore */ }
    setAiLoading(false);
  };

  const agendaEvents = monthEvents.sort((a, b) => a.day - b.day);

  return (
    <div className="flex flex-col h-full bg-[#06060f] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.06] bg-[#08081a] shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
              <FiCalendar className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-white font-black text-[15px] leading-none">Calendar</h1>
              <p className="text-white/30 text-[10px]">{monthEvents.length} events in {MONTHS[month]}</p>
            </div>
          </div>

          {/* Month nav */}
          <div className="flex items-center gap-1.5">
            <button onClick={prevMonth} className="p-1.5 rounded-lg text-white/30 hover:text-white bg-white/[0.04] border border-white/[0.08] transition-all">
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={toToday} className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white/50 hover:text-white bg-white/[0.04] border border-white/[0.08] transition-all">
              Today
            </button>
            <button onClick={nextMonth} className="p-1.5 rounded-lg text-white/30 hover:text-white bg-white/[0.04] border border-white/[0.08] transition-all">
              <FiChevronRight className="w-4 h-4" />
            </button>
            <span className="text-white font-bold text-[15px] ml-1">{MONTHS[month]} {year}</span>
          </div>

          <div className="flex-1" />

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] rounded-xl p-1">
            {(["month","agenda"] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition-all",
                  view === v ? "bg-white/[0.1] text-white" : "text-white/35 hover:text-white")}>
                {v === "month" ? <><FiCalendar className="w-3 h-3" /> Month</> : <><FiList className="w-3 h-3" /> Agenda</>}
              </button>
            ))}
          </div>

          <button onClick={() => setShowAiSchedule(v => !v)}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold border transition-all",
              showAiSchedule ? "bg-violet-500/20 text-violet-300 border-violet-500/25" : "bg-white/[0.04] text-white/50 border-white/[0.07] hover:text-violet-300")}>
            <FiZap className="w-3.5 h-3.5" /> AI Schedule
          </button>
          <button onClick={() => { setSelectedDay(now.getDate()); setShowAdd(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/15 hover:bg-primary/25 text-primary text-[12px] font-bold border border-primary/20 transition-all">
            <FiPlus className="w-3.5 h-3.5" /> Add Event
          </button>
        </div>

        {/* AI Schedule input */}
        {showAiSchedule && (
          <div className="flex items-center gap-2 mt-2.5 p-3 rounded-xl bg-violet-500/[0.06] border border-violet-500/15">
            <FiZap className="w-4 h-4 text-violet-400 shrink-0" />
            <input value={aiGoal} onChange={e => setAiGoal(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") aiSchedule(); }}
              placeholder="Describe a goal and AI will schedule events for this month..."
              className="flex-1 bg-transparent text-white text-[13px] outline-none placeholder:text-white/25" />
            <button onClick={aiSchedule} disabled={aiLoading || !aiGoal.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/20 text-violet-300 text-[12px] font-bold hover:bg-violet-600/30 disabled:opacity-30 border border-violet-500/20 transition-all">
              {aiLoading ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FiZap className="w-3.5 h-3.5" />}
              {aiLoading ? "Scheduling..." : "Schedule"}
            </button>
            <button onClick={() => setShowAiSchedule(false)} className="p-1 text-white/30 hover:text-white">
              <FiX className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Calendar body */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {view === "month" ? (
          <div className="h-full flex flex-col p-3">
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS_OF_WEEK.map(d => (
                <div key={d} className="text-center text-[10px] font-bold text-white/25 uppercase tracking-widest py-2">{d}</div>
              ))}
            </div>

            {/* Grid */}
            <div className="flex-1 grid grid-cols-7 gap-1 auto-rows-fr">
              {grid.map((day, i) => (
                <div key={i}
                  onClick={() => { if (day) { setSelectedDay(day); setShowAdd(true); } }}
                  className={cn(
                    "min-h-[70px] p-1 rounded-xl border transition-all cursor-pointer flex flex-col",
                    day ? "hover:border-white/[0.14] hover:bg-white/[0.03]" : "opacity-0 pointer-events-none",
                    isToday(day!) ? "border-primary/30 bg-primary/[0.05]" : "border-white/[0.05]"
                  )}>
                  {day && (
                    <>
                      <div className={cn(
                        "w-6 h-6 flex items-center justify-center rounded-full text-[12px] font-semibold mb-1 transition-all",
                        isToday(day) ? "bg-primary text-white" : "text-white/50"
                      )}>{day}</div>
                      <div className="flex-1 space-y-0.5 overflow-hidden">
                        {dayEvents(day).slice(0, 3).map(e => (
                          <div key={e.id}
                            onClick={ev => { ev.stopPropagation(); deleteEvent(e.id); }}
                            className={cn("text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md truncate text-white font-semibold leading-tight cursor-pointer opacity-90 hover:opacity-100", e.color)}>
                            {e.time && <span className="opacity-70 mr-1 hidden sm:inline">{e.time.split(" ")[0]}</span>}
                            {e.title}
                          </div>
                        ))}
                        {dayEvents(day).length > 3 && (
                          <div className="text-[9px] text-white/30 px-1">+{dayEvents(day).length - 3} more</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Agenda view */
          <div className="px-5 py-4 max-w-2xl mx-auto">
            {agendaEvents.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-4xl mb-3">📅</div>
                <div className="text-white/50 font-bold mb-1">No events in {MONTHS[month]}</div>
                <div className="text-white/25 text-sm">Add events or use AI to schedule your month</div>
              </div>
            ) : agendaEvents.map(e => (
              <div key={e.id} className="flex items-start gap-4 mb-3">
                <div className="text-center w-10 shrink-0">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-[14px]", e.color)}>
                    {e.day}
                  </div>
                </div>
                <div className="flex-1 flex items-center gap-3 bg-[#0d0d1e] border border-white/[0.07] rounded-xl px-4 py-3 hover:border-white/[0.14] transition-all group">
                  <div className="flex-1">
                    <div className="text-white font-semibold text-[13.5px]">{e.title}</div>
                    <div className="flex items-center gap-2 text-white/35 text-[11px] mt-0.5">
                      {e.time && <><FiClock className="w-3 h-3" /> {e.time}</>}
                      <span className="text-white/20">·</span>
                      <span>{e.category}</span>
                    </div>
                  </div>
                  <button onClick={() => deleteEvent(e.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-white/25 hover:text-red-400 transition-all rounded-lg">
                    <FiX className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add event modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-sm bg-[#0d0d1e] border border-white/[0.1] rounded-2xl p-5" onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-bold text-[15px] mb-4">
              Add Event — {selectedDay && `${MONTHS[month]} ${selectedDay}, ${year}`}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-white/30 uppercase font-bold tracking-widest block mb-1">Title</label>
                <input value={newEvent.title} onChange={e => setNewEvent(p => ({...p, title: e.target.value}))}
                  onKeyDown={e => { if (e.key === "Enter") addEvent(); }}
                  placeholder="Event title..."
                  autoFocus
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-[13px] outline-none placeholder:text-white/20 focus:border-primary/40 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-white/30 uppercase font-bold tracking-widest block mb-1">Time</label>
                  <input value={newEvent.time} onChange={e => setNewEvent(p => ({...p, time: e.target.value}))}
                    placeholder="10:00 AM"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-[13px] outline-none placeholder:text-white/20 focus:border-primary/40 transition-all" />
                </div>
                <div>
                  <label className="text-[10px] text-white/30 uppercase font-bold tracking-widest block mb-1">Category</label>
                  <select value={newEvent.category} onChange={e => setNewEvent(p => ({...p, category: e.target.value}))}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-[13px] outline-none" style={{ colorScheme:"dark" }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              {/* Color picker */}
              <div>
                <label className="text-[10px] text-white/30 uppercase font-bold tracking-widest block mb-1">Color</label>
                <div className="flex gap-2">
                  {EVENT_COLORS.map(c => (
                    <button key={c.id} onClick={() => setNewEvent(p => ({...p, color: c.cls}))}
                      className={cn("w-7 h-7 rounded-full transition-all", c.cls,
                        newEvent.color === c.cls ? "ring-2 ring-white/70 scale-110" : "opacity-60 hover:opacity-100")}>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowAdd(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/[0.1] text-white/50 text-[13px] hover:text-white transition-all">
                Cancel
              </button>
              <button onClick={addEvent} disabled={!newEvent.title.trim()}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white text-[13px] font-bold disabled:opacity-30 transition-all flex items-center justify-center gap-2">
                <FiCheck className="w-4 h-4" /> Add Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
