import { useState } from "react";
import {
  FiLayout, FiPlus, FiMoreHorizontal, FiZap, FiFlag, FiCalendar,
  FiX, FiCheck, FiTag, FiUser, FiRefreshCw,
} from "react-icons/fi";
import { cn } from "@/lib/utils";

const COLUMNS = [
  { id:"todo",     label:"To Do",       color:"bg-slate-500",   dot:"bg-slate-400" },
  { id:"progress", label:"In Progress", color:"bg-blue-500",    dot:"bg-blue-400" },
  { id:"review",   label:"Review",      color:"bg-amber-500",   dot:"bg-amber-400" },
  { id:"done",     label:"Done",        color:"bg-emerald-500", dot:"bg-emerald-400" },
];

const PRIORITY_STYLE: Record<string, string> = {
  Low:    "text-blue-400 border-blue-500/25 bg-blue-500/10",
  Medium: "text-amber-400 border-amber-500/25 bg-amber-500/10",
  High:   "text-orange-400 border-orange-500/25 bg-orange-500/10",
  Urgent: "text-red-400 border-red-500/25 bg-red-500/10",
};

type Card = {
  id: number;
  col: string;
  title: string;
  tags: string[];
  due: string;
  assignee: string;
  priority: string;
  desc?: string;
};

const INITIAL_CARDS: Card[] = [
  { id:1, col:"todo",     title:"Design new landing page",      tags:["design","ui"],      due:"Oct 28",    assignee:"D", priority:"High" },
  { id:2, col:"todo",     title:"Setup database schema",        tags:["backend","db"],     due:"Oct 26",    assignee:"S", priority:"Medium" },
  { id:3, col:"todo",     title:"Write API documentation",      tags:["docs"],             due:"Nov 2",     assignee:"P", priority:"Low" },
  { id:4, col:"progress", title:"Implement Auth context",       tags:["frontend","auth"],  due:"Today",     assignee:"D", priority:"Urgent" },
  { id:5, col:"progress", title:"API integration tests",        tags:["frontend","api"],   due:"Tomorrow",  assignee:"M", priority:"High" },
  { id:6, col:"review",   title:"Update platform copy",         tags:["content"],          due:"Yesterday", assignee:"P", priority:"Medium" },
  { id:7, col:"review",   title:"Mobile responsive pass",       tags:["design","mobile"],  due:"Today",     assignee:"D", priority:"High" },
  { id:8, col:"done",     title:"Initialize project",           tags:["setup"],            due:"Oct 20",    assignee:"D", priority:"Low" },
  { id:9, col:"done",     title:"Deploy staging environment",   tags:["devops"],           due:"Oct 22",    assignee:"S", priority:"Medium" },
];

const PROJECTS = ["GyanTechNet v2.0", "Marketing Website", "Mobile App", "API Platform"];
const MEMBERS = [
  { label:"D", color:"bg-violet-500", name:"Dev" },
  { label:"S", color:"bg-blue-500",   name:"Sara" },
  { label:"M", color:"bg-orange-500", name:"Maya" },
  { label:"P", color:"bg-pink-500",   name:"Priya" },
];

export default function ProjectsPage() {
  const [cards, setCards] = useState<Card[]>(INITIAL_CARDS);
  const [project, setProject] = useState("GyanTechNet v2.0");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [addingCol, setAddingCol] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [aiGoal, setAiGoal] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showAi, setShowAi] = useState(false);

  const moveCard = (id: number, to: string) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, col: to } : c));
  };

  const deleteCard = (id: number) => {
    setCards(prev => prev.filter(c => c.id !== id));
  };

  const addCard = (col: string) => {
    if (!newTitle.trim()) return;
    setCards(prev => [...prev, {
      id: Date.now(), col, title: newTitle.trim(),
      tags: [], due: "No date", assignee: "D", priority: "Medium",
    }]);
    setNewTitle("");
    setAddingCol(null);
  };

  const aiBreakdown = async () => {
    if (!aiGoal.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role:"user", content:`Break down this project goal into 6-8 tasks distributed across: Todo, In Progress, Review, Done. Return ONLY JSON array like: [{"title":"Task","col":"todo","priority":"High","tags":["tag"],"due":"This week","assignee":"D"}]. Goal: ${aiGoal}` }],
          mode: "Normal", model: "openai/gpt-4o-mini",
        }),
      });
      const data = await res.json();
      const parsed: Partial<Card>[] = JSON.parse(data.content || "[]");
      const newCards: Card[] = parsed.map((c, i) => ({
        id: Date.now() + i,
        col: c.col || "todo",
        title: c.title || "Task",
        tags: c.tags || [],
        due: c.due || "No date",
        assignee: c.assignee || "D",
        priority: c.priority || "Medium",
      }));
      setCards(prev => [...prev, ...newCards]);
      setAiGoal(""); setShowAi(false);
    } catch { /* ignore */ }
    setAiLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#06060f] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-white/[0.06] bg-[#08081a] shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
              <FiLayout className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-white font-black text-[15px] leading-none">GyanProject</h1>
              <select value={project} onChange={e => setProject(e.target.value)}
                className="bg-transparent text-white/40 text-[11px] outline-none cursor-pointer mt-0.5"
                style={{ colorScheme:"dark" }}>
                {PROJECTS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="flex -space-x-2">
            {MEMBERS.map(m => (
              <div key={m.label} title={m.name}
                className={cn("w-7 h-7 rounded-full border-2 border-[#08081a] flex items-center justify-center text-[11px] font-bold text-white shrink-0", m.color)}>
                {m.label}
              </div>
            ))}
          </div>
          <div className="flex-1" />
          <button onClick={() => setShowAi(v => !v)}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold border transition-all",
              showAi ? "bg-violet-500/20 text-violet-300 border-violet-500/25" : "bg-white/[0.04] text-white/50 border-white/[0.07] hover:text-violet-300")}>
            <FiZap className="w-3.5 h-3.5" /> AI Generate
          </button>
          {/* Stats */}
          <div className="hidden sm:flex items-center gap-3 text-[11px] text-white/35">
            {COLUMNS.map(c => (
              <div key={c.id} className="flex items-center gap-1.5">
                <div className={cn("w-1.5 h-1.5 rounded-full", c.dot)} />
                <span>{cards.filter(card => card.col === c.id).length}</span>
              </div>
            ))}
          </div>
        </div>

        {showAi && (
          <div className="flex items-center gap-2 mt-3 p-3 rounded-xl bg-violet-500/[0.06] border border-violet-500/15">
            <FiZap className="w-4 h-4 text-violet-400 shrink-0" />
            <input value={aiGoal} onChange={e => setAiGoal(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") aiBreakdown(); }}
              placeholder="Describe your project goal and AI will generate tasks for the kanban board..."
              className="flex-1 bg-transparent text-white text-[13px] outline-none placeholder:text-white/20" />
            <button onClick={aiBreakdown} disabled={aiLoading || !aiGoal.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/20 text-violet-300 text-[12px] font-bold hover:bg-violet-600/30 disabled:opacity-30 border border-violet-500/20 transition-all">
              {aiLoading ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FiZap className="w-3.5 h-3.5" />}
              {aiLoading ? "Generating..." : "Generate"}
            </button>
            <button onClick={() => setShowAi(false)} className="p-1 text-white/30 hover:text-white">
              <FiX className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 h-full p-4 min-w-max">
          {COLUMNS.map(col => {
            const colCards = cards.filter(c => c.col === col.id);
            return (
              <div key={col.id} className="w-72 flex flex-col h-full">
                {/* Column header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", col.dot)} />
                    <span className="text-white font-bold text-[13px]">{col.label}</span>
                    <span className="w-5 h-5 rounded-full bg-white/[0.08] flex items-center justify-center text-[10px] font-bold text-white/50">
                      {colCards.length}
                    </span>
                  </div>
                  <button onClick={() => setAddingCol(col.id)}
                    className="p-1 text-white/25 hover:text-white transition-colors">
                    <FiPlus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Cards */}
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-2.5 pr-0.5">
                  {/* Add card form */}
                  {addingCol === col.id && (
                    <div className="bg-[#0d0d1e] border border-primary/30 rounded-xl p-3">
                      <input autoFocus value={newTitle} onChange={e => setNewTitle(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") addCard(col.id); if (e.key === "Escape") setAddingCol(null); }}
                        placeholder="Card title..."
                        className="w-full bg-transparent text-white text-[13px] outline-none placeholder:text-white/25 mb-2" />
                      <div className="flex gap-2">
                        <button onClick={() => addCard(col.id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/20 text-primary text-[11px] font-bold hover:bg-primary/30 transition-all border border-primary/20">
                          <FiCheck className="w-3 h-3" /> Add
                        </button>
                        <button onClick={() => setAddingCol(null)}
                          className="p-1 text-white/30 hover:text-white transition-colors">
                          <FiX className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {colCards.map(card => (
                    <div key={card.id}
                      className={cn(
                        "group bg-[#0d0d1e] border border-white/[0.07] rounded-xl p-3 hover:border-white/[0.14] transition-all cursor-pointer",
                        expandedId === card.id && "border-primary/25 bg-primary/[0.04]"
                      )}
                      onClick={() => setExpandedId(expandedId === card.id ? null : card.id)}>

                      <div className="flex items-start gap-2 mb-2">
                        <p className="flex-1 text-white/85 text-[12.5px] font-semibold leading-snug">{card.title}</p>
                        <button onClick={e => { e.stopPropagation(); deleteCard(card.id); }}
                          className="opacity-0 group-hover:opacity-100 shrink-0 p-0.5 text-white/20 hover:text-red-400 transition-all">
                          <FiX className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap mb-2">
                        {card.tags.slice(0,3).map(t => (
                          <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-white/40">#{t}</span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full border", PRIORITY_STYLE[card.priority])}>
                            {card.priority}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-white/25 text-[10px]">
                            <FiCalendar className="w-2.5 h-2.5" /> {card.due}
                          </div>
                          <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white",
                            MEMBERS.find(m => m.label === card.assignee)?.color || "bg-gray-500")}>
                            {card.assignee}
                          </div>
                        </div>
                      </div>

                      {/* Move buttons */}
                      {expandedId === card.id && (
                        <div className="mt-2.5 pt-2.5 border-t border-white/[0.07] flex gap-1.5 flex-wrap">
                          <span className="text-[9px] text-white/25 uppercase font-bold tracking-widest self-center">Move to:</span>
                          {COLUMNS.filter(c => c.id !== col.id).map(c => (
                            <button key={c.id} onClick={e => { e.stopPropagation(); moveCard(card.id, c.id); setExpandedId(null); }}
                              className={cn("flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-semibold transition-all",
                                "bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.1]")}>
                              <div className={cn("w-1.5 h-1.5 rounded-full", c.dot)} /> {c.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {colCards.length === 0 && !addingCol && (
                    <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-white/[0.05] rounded-xl text-center">
                      <div className="text-2xl mb-1">📋</div>
                      <div className="text-white/20 text-[11px]">No cards</div>
                    </div>
                  )}
                </div>

                {/* Add card button */}
                <button onClick={() => setAddingCol(col.id)}
                  className="flex items-center gap-2 px-2 py-2 mt-2 rounded-xl text-white/25 hover:text-white/60 hover:bg-white/[0.04] text-[12px] transition-all">
                  <FiPlus className="w-3.5 h-3.5" /> Add card
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
