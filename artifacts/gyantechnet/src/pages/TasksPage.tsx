import { useState } from "react";
import {
  FiCheckSquare, FiPlus, FiCheck, FiFlag, FiZap, FiTrash2, FiStar,
  FiCalendar, FiX, FiRefreshCw,
} from "react-icons/fi";
import { cn } from "@/lib/utils";

const SECTIONS = ["All","Today","Upcoming","Done"];
const PRIORITIES = ["All","Low","Medium","High","Urgent"];
const PRIORITY_STYLE: Record<string,string> = {
  Low:    "bg-blue-500/12 text-blue-400 border-blue-500/20",
  Medium: "bg-amber-500/12 text-amber-400 border-amber-500/20",
  High:   "bg-orange-500/12 text-orange-400 border-orange-500/20",
  Urgent: "bg-red-500/12 text-red-400 border-red-500/20",
};
const PRIORITY_DOT: Record<string,string> = {
  Low:"bg-blue-400", Medium:"bg-amber-400", High:"bg-orange-400", Urgent:"bg-red-400"
};

type Task = {
  id: number;
  title: string;
  priority: string;
  due: string;
  completed: boolean;
  tags: string[];
  starred: boolean;
  notes?: string;
};

const INITIAL_TASKS: Task[] = [
  { id:1, title:"Review Q3 Marketing Strategy",         priority:"High",   due:"Today",     completed:false, tags:["marketing"], starred:false },
  { id:2, title:"Update UI Components Library",         priority:"Medium", due:"Tomorrow",  completed:false, tags:["design"],    starred:true  },
  { id:3, title:"Fix Authentication Bug",               priority:"Urgent", due:"Today",     completed:false, tags:["bug"],       starred:false },
  { id:4, title:"Write API Documentation",              priority:"Low",    due:"Next Week", completed:false, tags:["docs"],      starred:false },
  { id:5, title:"Prepare Slide Deck for Investor Meet", priority:"High",   due:"Oct 28",    completed:false, tags:["pitch"],     starred:true  },
  { id:6, title:"Deploy V2 to Production",              priority:"Urgent", due:"Yesterday", completed:true,  tags:["devops"],    starred:false },
];

export default function TasksPage() {
  const [activeSection, setActiveSection] = useState("All");
  const [activePriority, setActivePriority] = useState("All");
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [newTask, setNewTask] = useState("");
  const [newPriority, setNewPriority] = useState("Medium");
  const [aiGoal, setAiGoal] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggle = (id: number) =>
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const toggleStar = (id: number) =>
    setTasks(prev => prev.map(t => t.id === id ? { ...t, starred: !t.starred } : t));
  const deleteTask = (id: number) =>
    setTasks(prev => prev.filter(t => t.id !== id));

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks(prev => [...prev, {
      id: Date.now(), title: newTask.trim(), priority: newPriority,
      due: "No date", completed: false, tags: [], starred: false,
    }]);
    setNewTask("");
  };

  const aiBreakdown = async () => {
    if (!aiGoal.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role:"user", content:`Break down this goal into 5-7 specific, actionable tasks. Return ONLY a JSON array like: [{"title":"Task name","priority":"High","due":"Today","tags":["tag"]}]. Goal: ${aiGoal}` }],
          mode: "Normal", model: "openai/gpt-4o-mini",
        }),
      });
      const data = await res.json();
      const parsed: { title: string; priority?: string; due?: string; tags?: string[] }[] = JSON.parse(data.content || "[]");
      const newTasks: Task[] = parsed.map((t, i) => ({
        id: Date.now() + i,
        title: t.title,
        priority: t.priority || "Medium",
        due: t.due || "This week",
        completed: false,
        tags: [...(t.tags || []), "ai-generated"],
        starred: false,
        notes: `Generated from goal: "${aiGoal}"`,
      }));
      setTasks(prev => [...newTasks, ...prev]);
      setAiGoal("");
      setShowAi(false);
    } catch { /* ignore */ }
    setAiLoading(false);
  };

  const visible = tasks.filter(t => {
    if (activeSection === "Today")    return !t.completed && (t.due === "Today" || t.due.toLowerCase().includes("today"));
    if (activeSection === "Upcoming") return !t.completed && t.due !== "Today";
    if (activeSection === "Done")     return t.completed;
    return true;
  }).filter(t => activePriority === "All" || t.priority === activePriority);

  const pending = tasks.filter(t => !t.completed).length;
  const done = tasks.filter(t => t.completed).length;
  const urgentCount = tasks.filter(t => !t.completed && t.priority === "Urgent").length;
  const progress = tasks.length > 0 ? Math.round(done / tasks.length * 100) : 0;

  return (
    <div className="flex flex-col h-full bg-[#06060f] overflow-hidden">

      {/* Header */}
      <div className="shrink-0 px-4 pt-4 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
            <FiCheckSquare className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-white font-black text-[16px] leading-none">Tasks</h1>
            <p className="text-white/30 text-[10px]">{pending} pending · {done} done · {urgentCount} urgent</p>
          </div>
          <div className="flex-1" />
          {/* Progress ring */}
          <div className="relative w-10 h-10 shrink-0">
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
              <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="3"
                strokeDasharray={`${progress * 0.879} 87.9`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-emerald-400">{progress}%</div>
          </div>
          <button onClick={() => setShowAi(v => !v)}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold border transition-all",
              showAi ? "bg-violet-500/20 text-violet-300 border-violet-500/25" : "bg-white/[0.04] text-white/50 border-white/[0.07] hover:text-violet-300 hover:bg-violet-500/10")}>
            <FiZap className="w-3.5 h-3.5" /> AI Breakdown
          </button>
        </div>

        {/* AI Goal Breakdown */}
        {showAi && (
          <div className="flex items-center gap-2 mb-3 p-3 rounded-xl bg-violet-500/[0.06] border border-violet-500/15">
            <FiZap className="w-4 h-4 text-violet-400 shrink-0" />
            <input value={aiGoal} onChange={e => setAiGoal(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") aiBreakdown(); }}
              placeholder="Enter your goal and AI will break it into actionable tasks..."
              className="flex-1 bg-transparent text-white text-[13px] outline-none placeholder:text-white/25" />
            <button onClick={aiBreakdown} disabled={aiLoading || !aiGoal.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/20 text-violet-300 text-[12px] font-bold hover:bg-violet-600/30 disabled:opacity-30 transition-all border border-violet-500/20">
              {aiLoading ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FiZap className="w-3.5 h-3.5" />}
              {aiLoading ? "Generating..." : "Break Down"}
            </button>
            <button onClick={() => setShowAi(false)} className="p-1 text-white/30 hover:text-white">
              <FiX className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {SECTIONS.map(s => (
              <button key={s} onClick={() => setActiveSection(s)}
                className={cn("shrink-0 px-3 py-1.5 rounded-full text-[11.5px] font-semibold transition-all",
                  activeSection === s ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/25" : "text-white/40 hover:text-white bg-white/[0.03] border border-white/[0.06]")}>
                {s}
              </button>
            ))}
          </div>
          <div className="w-px h-4 bg-white/[0.07] hidden sm:block" />
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {PRIORITIES.map(p => (
              <button key={p} onClick={() => setActivePriority(p)}
                className={cn("shrink-0 px-2.5 py-1.5 rounded-full text-[11px] font-semibold transition-all",
                  activePriority === p ? "bg-white/[0.1] text-white border border-white/[0.15]" : "text-white/30 hover:text-white bg-white/[0.02] border border-white/[0.05]")}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3 space-y-1.5">
        {visible.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="text-4xl">✅</span>
            <div className="text-white/50 font-bold">No tasks here</div>
            <div className="text-white/25 text-sm">Add a task below or use AI breakdown</div>
          </div>
        )}
        {visible.map(task => (
          <div key={task.id}
            className={cn(
              "flex items-start gap-3 px-3 py-3 rounded-xl border transition-all group cursor-pointer",
              task.completed
                ? "bg-white/[0.02] border-white/[0.04] opacity-60"
                : expandedId === task.id
                ? "bg-white/[0.06] border-white/[0.12]"
                : "bg-[#0d0d1e] border-white/[0.07] hover:border-white/[0.12] hover:bg-white/[0.05]"
            )}
            onClick={() => setExpandedId(expandedId === task.id ? null : task.id)}>

            {/* Checkbox */}
            <button
              onClick={e => { e.stopPropagation(); toggle(task.id); }}
              className={cn(
                "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all",
                task.completed ? "border-emerald-500 bg-emerald-500/20" : "border-white/20 hover:border-emerald-400/60"
              )}>
              {task.completed && <FiCheck className="w-3 h-3 text-emerald-400" />}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn("text-[13.5px] font-semibold", task.completed ? "line-through text-white/30" : "text-white/85")}>
                  {task.title}
                </span>
                <span className={cn("shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border", PRIORITY_STYLE[task.priority])}>
                  {task.priority}
                </span>
              </div>
              <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                <div className="flex items-center gap-1 text-white/30 text-[11px]">
                  <FiCalendar className="w-3 h-3" /> {task.due}
                </div>
                {task.tags.map(t => (
                  <span key={t} className="text-[10px] text-white/25">#{t}</span>
                ))}
              </div>
              {expandedId === task.id && task.notes && (
                <div className="mt-2 text-white/40 text-[12px] bg-white/[0.03] rounded-lg px-2.5 py-2">{task.notes}</div>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-all">
              <button onClick={e => { e.stopPropagation(); toggleStar(task.id); }}
                className={cn("p-1.5 rounded-lg transition-all", task.starred ? "text-amber-400" : "text-white/20 hover:text-amber-400")}>
                <FiStar className="w-3.5 h-3.5" />
              </button>
              <button onClick={e => { e.stopPropagation(); deleteTask(task.id); }}
                className="p-1.5 rounded-lg text-white/20 hover:text-red-400 transition-all">
                <FiTrash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add task bar */}
      <div className="shrink-0 px-4 pb-4 pt-2 border-t border-white/[0.06]"
        style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom, 16px))" }}>
        <div className="flex items-center gap-2 bg-[#0d0d1e] border border-white/[0.09] rounded-xl px-3 py-2.5 focus-within:border-primary/40 transition-all">
          <FiPlus className="w-4 h-4 text-white/25 shrink-0" />
          <input value={newTask} onChange={e => setNewTask(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") addTask(); }}
            placeholder="Add a task..."
            className="flex-1 bg-transparent text-white text-[14px] outline-none placeholder:text-white/20" />
          <select value={newPriority} onChange={e => setNewPriority(e.target.value)}
            className="bg-white/[0.06] text-white/50 text-[11px] rounded-lg px-2 py-1 outline-none border border-white/[0.08] cursor-pointer"
            style={{ colorScheme: "dark" }}>
            {["Low","Medium","High","Urgent"].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <button onClick={addTask} disabled={!newTask.trim()}
            className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-[12px] font-bold disabled:opacity-30 transition-all border border-emerald-500/20">
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
