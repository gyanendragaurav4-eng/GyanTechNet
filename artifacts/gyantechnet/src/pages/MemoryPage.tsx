import { useState } from "react";
import { FiDatabase, FiPlus, FiSearch, FiTrash2, FiTag, FiZap, FiRefreshCw, FiX, FiCheck } from "react-icons/fi";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All","Personal","Preference","Goal","Work","General"];

const CAT_STYLE: Record<string,string> = {
  Personal:   "bg-pink-500/10 text-pink-400 border-pink-500/20",
  Preference: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  Goal:       "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Work:       "bg-blue-500/10 text-blue-400 border-blue-500/20",
  General:    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

type Memory = { id: number; text: string; category: string; date: string; tags: string[] };

const INITIAL: Memory[] = [
  { id:1, text:"User prefers dark mode and purple accent colors.",               category:"Preference", date:"Oct 24, 2026", tags:["ui","theme"] },
  { id:2, text:"Working on GyanTechNet — a 50+ workspace AI platform.",          category:"Work",       date:"Oct 20, 2026", tags:["project"] },
  { id:3, text:"Developer lives in Bihar Sharif, India.",                         category:"Personal",   date:"Oct 15, 2026", tags:["location"] },
  { id:4, text:"Always use wouter for React routing, not React Router.",          category:"Preference", date:"Oct 10, 2026", tags:["code","react"] },
  { id:5, text:"Company name is GyanTechNet. Stack: React 19, Vite, Tailwind v4.",category:"Work",      date:"Oct 01, 2026", tags:["business","tech"] },
  { id:6, text:"Goal: build the ultimate all-in-one AI platform for India.",      category:"Goal",       date:"Sep 28, 2026", tags:["vision"] },
  { id:7, text:"Preferred coding style: TypeScript strict mode, small components.",category:"Preference",date:"Sep 20, 2026", tags:["code"] },
];

export default function MemoryPage() {
  const [memories, setMemories] = useState<Memory[]>(INITIAL);
  const [cat, setCat]       = useState("All");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newText, setNewText] = useState("");
  const [newCat, setNewCat]   = useState("General");
  const [newTags, setNewTags] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const filtered = memories.filter(m => {
    if (cat !== "All" && m.category !== cat) return false;
    if (search && !m.text.toLowerCase().includes(search.toLowerCase()) && !m.tags.join(" ").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const addMemory = () => {
    if (!newText.trim()) return;
    setMemories(p => [{
      id: Date.now(),
      text: newText.trim(),
      category: newCat,
      date: new Date().toLocaleDateString("en-IN",{year:"numeric",month:"short",day:"numeric"}),
      tags: newTags.split(",").map(t=>t.trim()).filter(Boolean),
    }, ...p]);
    setNewText(""); setNewTags(""); setShowAdd(false);
  };

  const deleteMemory = (id: number) => setMemories(p => p.filter(m => m.id !== id));

  const aiExtract = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          messages:[{ role:"user", content:`Extract key facts worth remembering from this text. Return a JSON array of objects with keys: text, category (Personal/Preference/Goal/Work/General), tags (array). Text:\n\n${aiPrompt}` }],
          mode:"Normal", model:"openai/gpt-4o-mini",
        }),
      });
      const d = await res.json();
      try {
        const items = JSON.parse(d.content.match(/\[[\s\S]*\]/)?.[0] || "[]");
        setMemories(p => [...items.map((item: Omit<Memory,"id"|"date">) => ({
          ...item, id:Date.now() + Math.random(), date:new Date().toLocaleDateString("en-IN",{year:"numeric",month:"short",day:"numeric"}),
        })), ...p]);
      } catch { /* ignore parse errors */ }
    } catch { /* ignore */ }
    setAiLoading(false);
    setAiPrompt("");
  };

  return (
    <div className="flex flex-col h-full bg-[#06060f] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-[#08081a] shrink-0">
        <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center">
          <FiDatabase className="w-4 h-4 text-violet-400" />
        </div>
        <div>
          <h1 className="text-white font-bold text-[14px]">Memory Bank</h1>
          <p className="text-white/30 text-[10.5px]">{memories.length} stored memories · AI-powered context</p>
        </div>
        <div className="flex-1" />
        <button onClick={() => setShowAdd(v => !v)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 text-primary text-[12.5px] font-bold border border-primary/20 hover:bg-primary/20 transition-all">
          <FiPlus className="w-3.5 h-3.5" /> Add Memory
        </button>
      </div>

      {/* Add / AI extract panel */}
      {showAdd && (
        <div className="px-4 py-4 border-b border-white/[0.06] bg-[#0a0a1a] space-y-3 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <textarea value={newText} onChange={e => setNewText(e.target.value)}
                placeholder="What should I remember? (e.g. You prefer dark theme, you work in TypeScript...)"
                rows={2}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-[13px] outline-none placeholder:text-white/20 focus:border-primary/40 transition-all resize-none" />
            </div>
            <div>
              <label className="text-[9px] text-white/25 uppercase font-bold tracking-widest block mb-1">Category</label>
              <select value={newCat} onChange={e => setNewCat(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-[13px] outline-none" style={{colorScheme:"dark"}}>
                {CATEGORIES.filter(c=>c!=="All").map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] text-white/25 uppercase font-bold tracking-widest block mb-1">Tags (comma-separated)</label>
              <input value={newTags} onChange={e => setNewTags(e.target.value)}
                placeholder="e.g. code, react, dark-mode"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-[13px] outline-none placeholder:text-white/20 focus:border-primary/40 transition-all" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAdd(false)}
              className="px-3 py-2 rounded-xl border border-white/[0.1] text-white/40 text-[12.5px] hover:text-white transition-all">
              <FiX className="w-3.5 h-3.5" />
            </button>
            <button onClick={addMemory} disabled={!newText.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-[12.5px] font-bold disabled:opacity-40 hover:bg-primary/90 transition-all">
              <FiCheck className="w-3.5 h-3.5" /> Save Memory
            </button>
          </div>
        </div>
      )}

      {/* AI Extract bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.04] bg-violet-500/[0.03] shrink-0">
        <FiZap className="w-3.5 h-3.5 text-violet-400 shrink-0" />
        <input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
          onKeyDown={e => e.key === "Enter" && aiExtract()}
          placeholder="Paste any text and AI will extract key facts to remember…"
          className="flex-1 bg-transparent text-white text-[12.5px] outline-none placeholder:text-white/20" />
        <button onClick={aiExtract} disabled={!aiPrompt.trim() || aiLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-500/15 text-violet-300 text-[11.5px] font-bold border border-violet-500/20 hover:bg-violet-500/25 disabled:opacity-40 transition-all">
          {aiLoading ? <FiRefreshCw className="w-3 h-3 animate-spin" /> : <FiZap className="w-3 h-3" />}
          {aiLoading ? "Extracting…" : "Extract"}
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.04] shrink-0 overflow-x-auto no-scrollbar">
        <div className="relative shrink-0">
          <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search memories…"
            className="bg-white/[0.04] border border-white/[0.07] rounded-xl pl-7 pr-3 py-1.5 text-white text-[12px] w-40 outline-none placeholder:text-white/20 focus:border-white/[0.2] transition-all" />
        </div>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCat(c)}
            className={cn("px-3 py-1.5 rounded-xl text-[11.5px] font-semibold whitespace-nowrap border transition-all",
              cat === c ? "bg-primary/15 text-primary border-primary/25" : "bg-white/[0.03] text-white/35 border-white/[0.07] hover:text-white")}>
            {c}
            {c === "All" && <span className="ml-1 text-[9px] opacity-60">({memories.length})</span>}
          </button>
        ))}
      </div>

      {/* Memory grid */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-white/25 text-[13px]">
            <FiDatabase className="w-8 h-8 mb-2 opacity-30" />
            No memories found
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(m => (
            <div key={m.id}
              className="bg-[#0d0d1e] border border-white/[0.07] rounded-2xl p-4 group hover:border-primary/20 transition-all">
              <div className="flex items-start justify-between mb-2.5">
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", CAT_STYLE[m.category] || CAT_STYLE.General)}>
                  {m.category}
                </span>
                <button onClick={() => deleteMemory(m.id)}
                  className="p-1.5 rounded-lg text-white/15 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/10 transition-all">
                  <FiTrash2 className="w-3 h-3" />
                </button>
              </div>

              <p className="text-white/75 text-[13px] leading-relaxed mb-3">{m.text}</p>

              <div className="flex flex-wrap gap-1.5 mb-2">
                {m.tags.map(t => (
                  <span key={t} className="flex items-center gap-1 text-[9.5px] text-white/30 bg-white/[0.04] border border-white/[0.07] px-1.5 py-0.5 rounded-full">
                    <FiTag className="w-2.5 h-2.5" />{t}
                  </span>
                ))}
              </div>

              <div className="text-[10px] text-white/20 font-mono">{m.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
