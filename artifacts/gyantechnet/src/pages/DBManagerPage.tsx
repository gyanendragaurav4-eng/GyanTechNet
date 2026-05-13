import { useState } from "react";
import { FiDatabase, FiPlay, FiTable, FiZap, FiRefreshCw, FiPlus, FiChevronDown, FiX } from "react-icons/fi";
import { cn } from "@/lib/utils";

const TABLES: Record<string, { cols: string[]; rows: string[][] }> = {
  users:          { cols:["id","name","email","role","created_at"], rows:[["1","Developer","dev@gyantechnet.com","admin","2026-01-01"],["2","Priya Sharma","priya@gyantechnet.com","user","2026-01-15"],["3","Rahul Gupta","rahul@gyantechnet.com","user","2026-02-01"],["4","Vikram Patel","vikram@gyantechnet.com","admin","2026-03-10"]] },
  messages:       { cols:["id","user_id","content","mode","tokens","created_at"], rows:[["1","1","Hello AI, write me a poem","Creative","120","2026-05-01"],["2","1","Generate a business plan","Business","450","2026-05-02"],["3","2","Translate this to Hindi","Translate","80","2026-05-03"],["4","3","Debug this code please","Code","210","2026-05-04"]] },
  api_keys:       { cols:["id","key","name","user_id","requests","created_at"], rows:[["1","gtn_sk_abc123","Production Key","1","1,240","2026-01-01"],["2","gtn_sk_def456","Test Key","1","320","2026-02-15"]] },
  analytics_events:{ cols:["id","event","user_id","properties","timestamp"], rows:[["1","page_view","1","{\"page\":\"/chat\"}","2026-05-10T10:00:00Z"],["2","ai_request","2","{\"mode\":\"Code\"}","2026-05-10T10:05:00Z"],["3","feature_used","3","{\"feature\":\"workflows\"}","2026-05-10T10:12:00Z"]] },
  sessions:       { cols:["id","user_id","token","expires_at","ip"], rows:[["1","1","tok_abc...","2026-06-01","192.168.1.1"],["2","2","tok_def...","2026-06-01","192.168.1.2"]] },
};

const QUERY_PRESETS = [
  { label:"All Users",       sql:"SELECT * FROM users;" },
  { label:"Recent Messages", sql:"SELECT * FROM messages ORDER BY created_at DESC LIMIT 10;" },
  { label:"Active Sessions", sql:"SELECT * FROM sessions WHERE expires_at > NOW();" },
  { label:"API Key Stats",   sql:"SELECT name, requests FROM api_keys ORDER BY requests DESC;" },
  { label:"User Count",      sql:"SELECT COUNT(*) as total_users FROM users;" },
];

export default function DBManagerPage() {
  const [activeTable, setActiveTable] = useState("users");
  const [query, setQuery]             = useState("SELECT * FROM users;");
  const [result, setResult]           = useState<{cols:string[];rows:string[][];query:string;time:number}|null>(null);
  const [aiLoading, setAiLoading]     = useState(false);
  const [aiQuery, setAiQuery]         = useState("");
  const [showAI, setShowAI]           = useState(false);
  const [expandedTable, setExpandedTable] = useState<string|null>(null);

  const run = () => {
    const start = Date.now();
    const match = query.match(/FROM\s+(\w+)/i);
    const t = match ? match[1] : activeTable;
    const tData = TABLES[t as keyof typeof TABLES];
    setTimeout(() => {
      setResult({ cols: tData?.cols || ["result"], rows: tData?.rows || [["Query executed successfully"]], query, time: Date.now() - start });
    }, 150);
  };

  const generateSQL = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          messages:[{ role:"user", content:`Generate a SQL query for: "${aiQuery}". Available tables: ${Object.keys(TABLES).join(", ")}. Return ONLY the SQL query, nothing else.` }],
          mode:"Code", model:"openai/gpt-4o-mini",
        }),
      });
      const data = await res.json();
      setQuery(data.content?.trim() || "");
      setShowAI(false); setAiQuery("");
    } catch { /* ignore */ }
    setAiLoading(false);
  };

  const data = TABLES[activeTable as keyof typeof TABLES] || { cols:[], rows:[] };

  return (
    <div className="flex h-full overflow-hidden bg-[#06060f]">

      {/* Sidebar */}
      <div className="hidden sm:flex w-52 shrink-0 bg-[#08081a] border-r border-white/[0.06] flex-col">
        <div className="p-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-xl bg-blue-600/20 flex items-center justify-center">
              <FiDatabase className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <h2 className="text-white font-bold text-[13px]">GyanDB Manager</h2>
            <span className="text-[9px] bg-amber-500 text-black font-bold px-1.5 py-0.5 rounded-full ml-auto">PRO</span>
          </div>
          <button onClick={() => setShowAI(v => !v)}
            className={cn("w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-[11.5px] font-bold border transition-all",
              showAI ? "bg-violet-500/15 text-violet-300 border-violet-500/20" : "bg-white/[0.04] text-white/45 border-white/[0.07] hover:text-white")}>
            <FiZap className="w-3.5 h-3.5" /> AI Query Builder
          </button>
        </div>

        {/* Tables */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-2.5">
          <div className="text-[9px] text-white/25 uppercase font-bold tracking-widest px-1 mb-2">Tables</div>
          {Object.keys(TABLES).map(t => (
            <div key={t}>
              <button onClick={() => { setActiveTable(t); setExpandedTable(expandedTable === t ? null : t); }}
                className={cn("w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-[12px] font-medium transition-all mb-0.5",
                  activeTable === t ? "bg-blue-500/10 text-blue-300" : "text-white/40 hover:bg-white/[0.04] hover:text-white")}>
                <FiTable className="w-3 h-3 shrink-0" />
                <span className="flex-1 text-left">{t}</span>
                <span className="text-[9px] text-white/20 font-normal">{TABLES[t as keyof typeof TABLES].rows.length}</span>
                <FiChevronDown className={cn("w-3 h-3 transition-transform", expandedTable === t && "rotate-180")} />
              </button>
              {expandedTable === t && (
                <div className="pl-4 mb-1">
                  {TABLES[t as keyof typeof TABLES].cols.map(col => (
                    <div key={col} className="text-[10px] text-white/25 px-2 py-0.5 hover:text-white/50 transition-colors cursor-default">{col}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Query presets */}
        <div className="border-t border-white/[0.06] p-2.5">
          <div className="text-[9px] text-white/25 uppercase font-bold tracking-widest px-1 mb-2">Quick Queries</div>
          {QUERY_PRESETS.map(p => (
            <button key={p.label} onClick={() => setQuery(p.sql)}
              className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] text-white/35 hover:text-white hover:bg-white/[0.04] transition-all mb-0.5">
              <span className="w-1 h-1 rounded-full bg-blue-400/50 shrink-0" />
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* SQL Editor */}
        <div className="p-3 border-b border-white/[0.06] bg-[#08081a] shrink-0">
          {showAI && (
            <div className="flex items-center gap-2 mb-2.5 p-2.5 rounded-xl bg-violet-500/[0.06] border border-violet-500/15">
              <FiZap className="w-3.5 h-3.5 text-violet-400 shrink-0" />
              <input value={aiQuery} onChange={e => setAiQuery(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") generateSQL(); }}
                placeholder="Describe your query (e.g. 'show users with most messages')..."
                className="flex-1 bg-transparent text-white text-[12.5px] outline-none placeholder:text-white/25" />
              <button onClick={generateSQL} disabled={aiLoading || !aiQuery.trim()}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-violet-600/20 text-violet-300 text-[11px] font-bold hover:bg-violet-600/30 disabled:opacity-30 border border-violet-500/20 transition-all">
                {aiLoading ? <FiRefreshCw className="w-3 h-3 animate-spin" /> : <FiZap className="w-3 h-3" />}
                Generate
              </button>
              <button onClick={() => setShowAI(false)} className="p-1 text-white/25 hover:text-white"><FiX className="w-3 h-3" /></button>
            </div>
          )}
          <div className="flex gap-2 items-start">
            <div className="flex-1 relative">
              <div className="absolute top-0 left-0 px-3 pt-2 text-[10px] text-blue-400 font-bold font-mono pointer-events-none">SQL</div>
              <textarea value={query} onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) run(); }}
                className="w-full bg-[#050510] border border-white/[0.09] rounded-xl pl-10 pr-3 pt-2 pb-2 text-[12.5px] text-emerald-300 font-mono focus:outline-none focus:border-blue-500/30 resize-none h-[72px] leading-relaxed"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <button onClick={run}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-[12px] font-bold hover:from-blue-500 hover:to-indigo-500 shadow-[0_4px_12px_rgba(59,130,246,0.3)] transition-all">
                <FiPlay className="w-3.5 h-3.5" /> Run
              </button>
              <button onClick={() => setShowAI(v => !v)}
                className="flex items-center gap-1.5 px-4 py-2 bg-violet-500/15 text-violet-300 rounded-xl text-[12px] font-bold border border-violet-500/20 hover:bg-violet-500/25 transition-all">
                <FiZap className="w-3.5 h-3.5" /> AI
              </button>
            </div>
          </div>
          <div className="text-[10px] text-white/20 mt-1.5 pl-1">⌘/Ctrl+Enter to run</div>
        </div>

        {/* Table data + results */}
        <div className="flex-1 overflow-auto no-scrollbar">
          {result ? (
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-[11px] font-semibold">
                  {result.rows.length} rows · {result.time}ms
                </span>
                <button onClick={() => setResult(null)} className="p-1 text-white/25 hover:text-white transition-colors">
                  <FiX className="w-3 h-3" />
                </button>
              </div>
              <DataTable cols={result.cols} rows={result.rows} />
            </div>
          ) : (
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/50 text-[11.5px] font-bold">Table: {activeTable}</span>
                <span className="text-white/25 text-[10px]">{data.rows.length} rows</span>
              </div>
              <DataTable cols={data.cols} rows={data.rows} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DataTable({ cols, rows }: { cols: string[]; rows: string[][] }) {
  return (
    <div className="bg-[#050510] border border-white/[0.07] rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {cols.map(col => (
                <th key={col} className="text-left px-4 py-2.5 text-[10px] font-bold text-blue-400/70 uppercase tracking-widest whitespace-nowrap">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-2.5 text-[12px] text-white/65 font-mono whitespace-nowrap max-w-[200px] truncate" title={cell}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
