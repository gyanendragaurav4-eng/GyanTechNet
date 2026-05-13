import { useState, useRef, useEffect } from "react";
import {
  FiSearch, FiZap, FiBookmark, FiCopy, FiDownload, FiX,
  FiChevronRight, FiExternalLink, FiRefreshCw, FiList, FiStar,
} from "react-icons/fi";
import { cn } from "@/lib/utils";

const DEPTHS = [
  { id: "quick",    label: "Quick",     time: "~15s", icon: "⚡", desc: "Brief overview" },
  { id: "standard",label: "Standard",  time: "~40s", icon: "🔍", desc: "Balanced depth" },
  { id: "deep",     label: "Deep Dive", time: "~90s", icon: "🔬", desc: "Comprehensive" },
];

const CATEGORIES = ["All","Technology","Science","Business","India","Health","Environment","History","AI"];

const SUGGESTED_TOPICS = [
  { icon:"🤖", title:"AI & LLM Landscape 2026",      cat:"AI" },
  { icon:"🚀", title:"India's Space Economy 2030",    cat:"India" },
  { icon:"🧬", title:"CRISPR Gene Editing Progress",  cat:"Science" },
  { icon:"💰", title:"Indian Startup Ecosystem 2026", cat:"Business" },
  { icon:"☀️", title:"Solar Energy Revolution",       cat:"Environment" },
  { icon:"🧠", title:"Mental Health Tech Solutions",  cat:"Health" },
  { icon:"⚡", title:"Electric Vehicles in India",   cat:"India" },
  { icon:"🔐", title:"Quantum Cryptography Basics",   cat:"Technology" },
  { icon:"🌍", title:"Climate Tech Startups",         cat:"Environment" },
  { icon:"🏥", title:"AI in Healthcare 2026",         cat:"Health" },
  { icon:"📱", title:"Future of Mobile Computing",    cat:"Technology" },
  { icon:"🏦", title:"Digital Rupee & Fintech",       cat:"Business" },
];

type ResearchResult = {
  id: string;
  query: string;
  depth: string;
  content: string;
  ts: number;
  bookmarked: boolean;
};

const STORAGE_KEY = "gyan_research_history";

function loadHistory(): ResearchResult[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveHistory(h: ResearchResult[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(h.slice(0, 20))); } catch { /* ignore */ }
}

function renderContent(text: string) {
  return text.split("\n").map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-2" />;
    if (line.startsWith("# ")) return <h1 key={i} className="text-xl font-black text-white mt-5 mb-2 first:mt-0">{line.slice(2)}</h1>;
    if (line.startsWith("## ")) return <h2 key={i} className="text-base font-bold text-violet-300 mt-4 mb-1.5">{line.slice(3)}</h2>;
    if (line.startsWith("### ")) return <h3 key={i} className="text-sm font-bold text-white/80 mt-3 mb-1">{line.slice(4)}</h3>;
    if (line.startsWith("- ") || line.startsWith("• ")) return (
      <div key={i} className="flex items-start gap-2 mb-1 ml-3">
        <span className="text-violet-400 mt-1.5 shrink-0 text-[8px]">◆</span>
        <span className="text-white/75 text-sm leading-relaxed">{line.slice(2)}</span>
      </div>
    );
    if (/^\d+\.\s/.test(line)) return (
      <div key={i} className="flex items-start gap-2 mb-1 ml-3">
        <span className="text-violet-400 shrink-0 text-[11px] font-bold mt-0.5">{line.match(/^\d+/)?.[0]}.</span>
        <span className="text-white/75 text-sm leading-relaxed">{line.replace(/^\d+\.\s/, "")}</span>
      </div>
    );
    if (line.startsWith("**") && line.endsWith("**")) return (
      <p key={i} className="font-bold text-white text-sm my-1">{line.slice(2, -2)}</p>
    );
    return <p key={i} className="text-white/70 text-sm leading-relaxed mb-1">{line}</p>;
  });
}

export default function ResearchPage() {
  const [depth, setDepth] = useState("standard");
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ResearchResult[]>(loadHistory);
  const [showHistory, setShowHistory] = useState(false);
  const [followUp, setFollowUp] = useState("");
  const [followUps, setFollowUps] = useState<string[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const doResearch = async (q: string, d = depth) => {
    const text = (q || query).trim();
    if (!text) return;
    setQuery(text);
    setLoading(true);
    setResult(null);
    setFollowUps([]);

    const depthLabel = DEPTHS.find(x => x.id === d)?.label || "Standard";
    const promptMap: Record<string, string> = {
      quick:    `Quick overview of: ${text}. Provide 3-4 key points with brief explanations. Keep it concise but informative. Use markdown headers.`,
      standard: `Research report on: ${text}. Provide a comprehensive, structured report with Introduction, Key Findings (3-5 points), Current State, Future Outlook, and Conclusion. Use markdown formatting.`,
      deep:     `Deep research analysis on: ${text}. Provide an exhaustive, academic-quality report with: Executive Summary, Background & History, Current Landscape, Key Players/Factors, Data & Statistics (if applicable), Multiple Perspectives, Challenges & Opportunities, Future Predictions, Expert Opinions, and Comprehensive Conclusion. Use proper markdown formatting with headers and bullet points.`,
    };

    try {
      const res = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptMap[d] || promptMap.standard, type: "research" }),
      });
      const data = await res.json();
      const content = data.content || data.error || "Research could not be completed. Please check your connection.";
      const newResult: ResearchResult = {
        id: Math.random().toString(36).slice(2),
        query: text, depth: depthLabel, content, ts: Date.now(), bookmarked: false,
      };
      setResult(newResult);
      // Generate follow-up questions
      const qRes = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role:"user", content:`For the research topic "${text}", suggest 4 follow-up research questions. Return ONLY a JSON array of 4 short questions, nothing else. Example: ["Q1","Q2","Q3","Q4"]` }],
          mode: "Research", model: "openai/gpt-4o-mini",
        }),
      });
      const qData = await qRes.json();
      try { setFollowUps(JSON.parse(qData.content || "[]")); } catch { /* ignore */ }
      // Save to history
      setHistory(prev => {
        const updated = [newResult, ...prev.filter(h => h.id !== newResult.id)];
        saveHistory(updated);
        return updated;
      });
    } catch {
      setResult({ id: "err", query: text, depth: depthLabel, content:"⚠️ Unable to reach the research engine. Check your connection.", ts: Date.now(), bookmarked: false });
    }
    setLoading(false);
  };

  const doFollowUp = async () => {
    if (!followUp.trim() || !result) return;
    const combined = `Previous research: ${result.query}\n\nFollow-up question: ${followUp}`;
    setFollowUp("");
    await doResearch(combined);
  };

  const toggleBookmark = (id: string) => {
    setHistory(prev => {
      const updated = prev.map(h => h.id === id ? { ...h, bookmarked: !h.bookmarked } : h);
      saveHistory(updated);
      return updated;
    });
    if (result?.id === id) setResult(r => r ? { ...r, bookmarked: !r.bookmarked } : r);
  };

  const exportResult = () => {
    if (!result) return;
    const text = `# ${result.query}\n\nDepth: ${result.depth}\nDate: ${new Date(result.ts).toLocaleString()}\n\n${result.content}`;
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `research-${result.query.slice(0, 30)}.txt`; a.click();
  };

  const suggestions = SUGGESTED_TOPICS.filter(t => catFilter === "All" || t.cat === catFilter);

  return (
    <div className="flex h-full bg-[#06060f] overflow-hidden">

      {/* Sidebar */}
      <div className="hidden md:flex w-72 shrink-0 bg-[#08081a] border-r border-white/[0.06] flex-col">
        <div className="px-4 pt-4 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
              <FiSearch className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-white font-black text-[15px] leading-none">GyanResearch</h1>
              <p className="text-white/30 text-[10px]">AI-powered deep research</p>
            </div>
          </div>
          {/* Depth selector */}
          <div className="space-y-1.5">
            <div className="text-[10px] text-white/25 uppercase font-bold tracking-widest mb-2">Research Depth</div>
            {DEPTHS.map(d => (
              <button key={d.id} onClick={() => setDepth(d.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left",
                  depth === d.id
                    ? "bg-primary/15 border border-primary/25 text-primary"
                    : "text-white/50 hover:bg-white/[0.04] hover:text-white"
                )}>
                <span className="text-base">{d.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold">{d.label}</div>
                  <div className="text-[10px] opacity-60">{d.desc} · {d.time}</div>
                </div>
                {depth === d.id && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
              </button>
            ))}
          </div>
        </div>

        {/* History */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-3 px-3">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[10px] text-white/25 uppercase font-bold tracking-widest">History</span>
            {history.length > 0 && (
              <button onClick={() => { setHistory([]); saveHistory([]); }}
                className="text-[10px] text-white/20 hover:text-white/50 transition-colors">Clear</button>
            )}
          </div>
          {history.length === 0 ? (
            <div className="text-center py-8 text-white/20 text-xs">No research yet</div>
          ) : history.map(h => (
            <button key={h.id} onClick={() => setResult(h)}
              className={cn(
                "w-full text-left flex items-start gap-2 px-2 py-2 rounded-lg hover:bg-white/[0.04] transition-all mb-1 group",
                result?.id === h.id && "bg-white/[0.06]"
              )}>
              <span className="text-sm mt-0.5 shrink-0">{h.bookmarked ? "⭐" : "📄"}</span>
              <div className="flex-1 min-w-0">
                <div className="text-white/70 text-[11px] font-medium truncate">{h.query}</div>
                <div className="text-white/25 text-[10px]">{h.depth} · {new Date(h.ts).toLocaleDateString()}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Search bar */}
        <div className="shrink-0 px-4 py-3.5 border-b border-white/[0.06] bg-[#06060f]">
          <div className={cn(
            "flex items-start gap-3 bg-[#0d0d1e] border rounded-2xl px-4 py-3 transition-all",
            loading ? "border-blue-500/30" : "border-white/[0.09] focus-within:border-primary/40"
          )}>
            <FiSearch className="w-4 h-4 text-white/30 mt-1 shrink-0" />
            <textarea
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); doResearch(query); } }}
              placeholder="Enter a topic, question, or concept to research deeply..."
              className="flex-1 bg-transparent text-white text-[14px] outline-none placeholder:text-white/20 resize-none min-h-[36px] max-h-[90px] leading-relaxed"
              rows={1}
            />
            <button onClick={() => doResearch(query)} disabled={loading || !query.trim()}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-[13px] transition-all shrink-0 disabled:opacity-30",
                "bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-500 hover:to-violet-500 shadow-[0_4px_12px_rgba(37,99,235,0.3)]"
              )}>
              {loading ? <FiRefreshCw className="w-4 h-4 animate-spin" /> : <FiZap className="w-4 h-4" />}
              {loading ? "Researching..." : "Research"}
            </button>
          </div>
          {/* Category filter */}
          <div className="flex gap-1.5 mt-2.5 overflow-x-auto no-scrollbar">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCatFilter(c)}
                className={cn(
                  "shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all",
                  catFilter === c
                    ? "bg-violet-500/20 text-violet-300 border border-violet-500/25"
                    : "text-white/35 hover:text-white bg-white/[0.03] border border-white/[0.06]"
                )}>{c}</button>
            ))}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {!result && !loading && (
            <div className="px-5 py-6">
              <div className="text-[11px] text-white/25 uppercase font-bold tracking-widest mb-3">Suggested Topics</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => { setQuery(s.title); doResearch(s.title); }}
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0d0d1e] border border-white/[0.07] hover:border-primary/30 hover:bg-primary/[0.04] text-left transition-all group active:scale-[0.98]">
                    <span className="text-2xl shrink-0">{s.icon}</span>
                    <div>
                      <div className="text-white/80 text-[12.5px] font-semibold group-hover:text-white transition-colors leading-snug">{s.title}</div>
                      <div className="text-white/30 text-[10px] mt-0.5">{s.cat}</div>
                    </div>
                    <FiChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-primary ml-auto shrink-0 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.4)] animate-pulse">
                  <FiSearch className="w-7 h-7 text-white" />
                </div>
                <div className="absolute inset-[-8px] rounded-3xl border border-blue-500/20 animate-ping" />
              </div>
              <div className="text-center">
                <div className="text-white font-bold text-base mb-1">Researching deeply…</div>
                <div className="text-white/35 text-sm">"{query}"</div>
              </div>
              <div className="flex gap-1.5">
                {["Gathering sources","Analysing data","Synthesising findings"].map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.07]"
                    style={{ animationDelay: `${i*0.5}s` }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: `${i*0.3}s` }} />
                    <span className="text-white/50 text-[11px]">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result && !loading && (
            <div className="max-w-3xl mx-auto px-5 py-5">
              {/* Result header */}
              <div className="flex items-start gap-3 mb-5">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Research Report</span>
                    <span className="text-[10px] text-white/20">·</span>
                    <span className="text-[10px] text-white/35">{result.depth}</span>
                  </div>
                  <h2 className="text-white font-black text-lg leading-tight">{result.query}</h2>
                  <div className="text-white/30 text-[11px] mt-1">{new Date(result.ts).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleBookmark(result.id)}
                    className={cn("p-2 rounded-lg transition-all", result.bookmarked ? "text-amber-400 bg-amber-500/10" : "text-white/30 hover:text-white bg-white/[0.04]")}>
                    <FiBookmark className="w-4 h-4" />
                  </button>
                  <button onClick={() => navigator.clipboard.writeText(result.content).catch(() => {})}
                    className="p-2 rounded-lg text-white/30 hover:text-white bg-white/[0.04] transition-all">
                    <FiCopy className="w-4 h-4" />
                  </button>
                  <button onClick={exportResult}
                    className="p-2 rounded-lg text-white/30 hover:text-white bg-white/[0.04] transition-all">
                    <FiDownload className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setResult(null); setFollowUps([]); }}
                    className="p-2 rounded-lg text-white/30 hover:text-white bg-white/[0.04] transition-all">
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Research content */}
              <div className="bg-[#0d0d1e] border border-white/[0.08] rounded-2xl p-5 mb-5">
                {renderContent(result.content)}
              </div>

              {/* Follow-up questions */}
              {followUps.length > 0 && (
                <div className="mb-5">
                  <div className="text-[10px] text-white/25 uppercase font-bold tracking-widest mb-2.5 flex items-center gap-2">
                    <FiList className="w-3 h-3" /> Related Questions
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {followUps.map((q, i) => (
                      <button key={i} onClick={() => doResearch(q)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#0d0d1e] border border-white/[0.07] hover:border-primary/30 hover:bg-primary/[0.04] text-left text-[12px] text-white/65 hover:text-white transition-all">
                        <FiChevronRight className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Follow-up input */}
              <div className="flex items-center gap-2 bg-[#0d0d1e] border border-white/[0.09] rounded-xl px-3 py-2.5 focus-within:border-primary/40 transition-all">
                <FiZap className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                <input
                  value={followUp}
                  onChange={e => setFollowUp(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") doFollowUp(); }}
                  placeholder="Ask a follow-up question..."
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/20"
                />
                <button onClick={doFollowUp} disabled={!followUp.trim()}
                  className="px-3 py-1 rounded-lg text-[12px] font-bold bg-violet-600/20 text-violet-300 hover:bg-violet-600/30 disabled:opacity-30 transition-all">
                  Ask
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
