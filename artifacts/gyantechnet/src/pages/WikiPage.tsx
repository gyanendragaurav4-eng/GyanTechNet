import { useState } from "react";
import { FiSearch, FiBookOpen, FiZap, FiExternalLink, FiBookmark, FiChevronRight, FiRefreshCw, FiX } from "react-icons/fi";
import { cn } from "@/lib/utils";

const TRENDING = [
  { topic:"Artificial Intelligence",  icon:"🤖", cat:"Technology" },
  { topic:"India 2026",               icon:"🇮🇳", cat:"Country" },
  { topic:"Quantum Computing",        icon:"⚛️", cat:"Science" },
  { topic:"Climate Change",           icon:"🌍", cat:"Environment" },
  { topic:"ISRO Missions",            icon:"🚀", cat:"Space" },
  { topic:"Neural Networks",          icon:"🧠", cat:"AI" },
  { topic:"Renewable Energy",         icon:"☀️", cat:"Energy" },
  { topic:"Cryptocurrency",           icon:"💰", cat:"Finance" },
  { topic:"Metaverse",                icon:"🌐", cat:"Tech" },
  { topic:"Space Exploration 2026",   icon:"🛸", cat:"Space" },
  { topic:"Nanotechnology",           icon:"🔬", cat:"Science" },
  { topic:"Indian Economy",           icon:"📈", cat:"Economy" },
];

const CATEGORIES = ["All","Technology","Science","History","Geography","Arts","Sports","Medicine"];

type Article = { title: string; summary: string; aiEnhanced?: boolean; category?: string };

export default function WikiPage() {
  const [query, setQuery]       = useState("");
  const [article, setArticle]   = useState<Article | null>(null);
  const [loading, setLoading]   = useState(false);
  const [catFilter, setCatFilter] = useState("All");
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [tab, setTab]           = useState<"wiki"|"ai">("wiki");
  const [aiAnswer, setAiAnswer] = useState<string|null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [relatedTopics, setRelatedTopics] = useState<string[]>([]);

  const search = async (q: string) => {
    const text = (q || query).trim();
    if (!text) return;
    setQuery(text);
    setLoading(true);
    setArticle(null);
    setAiAnswer(null);
    setRelatedTopics([]);

    try {
      // Try Wikipedia API via proxy-friendly approach
      const wikiRes = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(text)}`,
        { headers: { "Api-User-Agent": "GyanTechNet/1.0" } }
      );
      if (wikiRes.ok) {
        const data = await wikiRes.json();
        setArticle({ title: data.title, summary: data.extract || "No summary available.", category: data.type });
      } else {
        // Fallback: AI-generated summary
        const res = await fetch("/api/chat", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role:"user", content:`Write a comprehensive Wikipedia-style encyclopedia article about "${text}". Include: Introduction, Background, Key Facts, Significance, and Notable Examples. Format with markdown headers.` }],
            mode: "Research", model: "openai/gpt-4o-mini",
          }),
        });
        const aiData = await res.json();
        setArticle({ title: text, summary: aiData.content || "Could not load article.", aiEnhanced: true });
      }

      // Get related topics
      const relRes = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role:"user", content:`List 6 closely related Wikipedia topics to "${text}". Return ONLY a JSON array of topic names. Example: ["Topic1","Topic2","Topic3","Topic4","Topic5","Topic6"]` }],
          mode: "Normal", model: "openai/gpt-4o-mini",
        }),
      });
      const relData = await relRes.json();
      try { setRelatedTopics(JSON.parse(relData.content || "[]")); } catch { /* ignore */ }
    } catch {
      setArticle({ title: text, summary: "Could not load article. Please check your connection.", aiEnhanced: true });
    }
    setLoading(false);
  };

  const askAI = async () => {
    if (!article) return;
    setAiLoading(true); setAiAnswer(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role:"user", content:`Based on the Wikipedia article "${article.title}", provide: 1) 5 key takeaways, 2) Why this matters in 2026, 3) 3 interesting lesser-known facts, 4) Future outlook. Be concise and informative.` }],
          mode: "Research", model: "openai/gpt-4o-mini",
        }),
      });
      const data = await res.json();
      setAiAnswer(data.content || "AI analysis unavailable.");
    } catch { setAiAnswer("Could not get AI analysis."); }
    setAiLoading(false);
  };

  const toggleBookmark = (topic: string) => {
    setBookmarks(prev => prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]);
  };

  const filtered = TRENDING.filter(t => catFilter === "All" || t.cat === catFilter);

  const renderText = (text: string) => text.split("\n").map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-2" />;
    if (line.startsWith("# "))  return <h1 key={i} className="text-xl font-black text-white mt-4 mb-2 first:mt-0">{line.slice(2)}</h1>;
    if (line.startsWith("## ")) return <h2 key={i} className="text-base font-bold text-blue-300 mt-3 mb-1">{line.slice(3)}</h2>;
    if (line.startsWith("### ")) return <h3 key={i} className="text-sm font-bold text-white/80 mt-2.5 mb-1">{line.slice(4)}</h3>;
    if (line.startsWith("- ") || line.startsWith("• ")) return (
      <div key={i} className="flex items-start gap-2 mb-1 ml-2">
        <span className="text-blue-400 mt-1.5 shrink-0 text-[8px]">◆</span>
        <span className="text-white/75 text-[13.5px] leading-relaxed">{line.slice(2)}</span>
      </div>
    );
    return <p key={i} className="text-white/75 text-[13.5px] leading-[1.8] mb-1">{line}</p>;
  });

  return (
    <div className="flex h-full bg-[#06060f] overflow-hidden">

      {/* Sidebar */}
      <div className="hidden md:flex w-68 shrink-0 bg-[#08081a] border-r border-white/[0.06] flex-col" style={{ width:"272px" }}>
        <div className="px-4 pt-4 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
              <FiBookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-white font-black text-[14px] leading-none">GyanWiki</h1>
              <p className="text-white/30 text-[10px]">Knowledge + AI analysis</p>
            </div>
          </div>
          {/* Category filter */}
          <div className="flex flex-wrap gap-1">
            {["All","Technology","Science","History","Space","Medicine"].map(c => (
              <button key={c} onClick={() => setCatFilter(c)}
                className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all",
                  catFilter === c ? "bg-blue-500/20 text-blue-300 border-blue-500/25" : "text-white/30 border-white/[0.07] hover:text-white bg-white/[0.03]")}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar py-2 px-2">
          {/* Bookmarks */}
          {bookmarks.length > 0 && (
            <div className="mb-3">
              <div className="text-[9px] text-white/25 uppercase font-bold tracking-widest px-2 mb-1.5">Bookmarks</div>
              {bookmarks.map(b => (
                <button key={b} onClick={() => search(b)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.05] text-left transition-all">
                  <FiBookmark className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="text-white/60 text-[11px] truncate">{b}</span>
                </button>
              ))}
              <div className="h-px bg-white/[0.06] my-2 mx-2" />
            </div>
          )}

          <div className="text-[9px] text-white/25 uppercase font-bold tracking-widest px-2 mb-2">Trending Topics</div>
          {filtered.map(t => (
            <button key={t.topic} onClick={() => search(t.topic)}
              className={cn("w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl mb-0.5 transition-all text-left group",
                article?.title === t.topic ? "bg-white/[0.08]" : "hover:bg-white/[0.04]")}>
              <span className="text-base">{t.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-white/75 text-[11.5px] font-medium truncate">{t.topic}</div>
                <div className="text-white/25 text-[9px]">{t.cat}</div>
              </div>
              <FiChevronRight className="w-3 h-3 text-white/20 group-hover:text-white/50 shrink-0 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Search bar */}
        <div className="px-4 py-3.5 border-b border-white/[0.06] bg-[#06060f] shrink-0">
          <div className={cn(
            "flex items-center gap-3 bg-[#0d0d1e] border rounded-2xl px-4 py-3 transition-all",
            loading ? "border-blue-500/30" : "border-white/[0.09] focus-within:border-blue-500/35"
          )}>
            <FiSearch className="w-4 h-4 text-white/30 shrink-0" />
            <input value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") search(query); }}
              placeholder="Search Wikipedia or any topic..."
              className="flex-1 bg-transparent text-white text-[14px] outline-none placeholder:text-white/20" />
            {query && (
              <button onClick={() => { setQuery(""); setArticle(null); setAiAnswer(null); }} className="p-1 text-white/25 hover:text-white">
                <FiX className="w-3.5 h-3.5" />
              </button>
            )}
            <button onClick={() => search(query)} disabled={loading || !query.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-[13px] bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 disabled:opacity-30 transition-all shrink-0 shadow-[0_4px_12px_rgba(37,99,235,0.3)]">
              {loading ? <FiRefreshCw className="w-4 h-4 animate-spin" /> : <FiSearch className="w-4 h-4" />}
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {!article && !loading && (
            <div className="px-5 py-6 max-w-4xl mx-auto">
              <div className="text-[10px] text-white/25 uppercase font-bold tracking-widest mb-3">Trending Topics</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {TRENDING.map(t => (
                  <button key={t.topic} onClick={() => search(t.topic)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#0d0d1e] border border-white/[0.07] hover:border-blue-500/25 hover:bg-blue-500/[0.04] text-left transition-all group active:scale-[0.98]">
                    <span className="text-xl shrink-0">{t.icon}</span>
                    <div>
                      <div className="text-white/75 text-[11.5px] font-semibold group-hover:text-white transition-colors leading-snug">{t.topic}</div>
                      <div className="text-white/25 text-[9px]">{t.cat}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center animate-pulse shadow-[0_0_24px_rgba(37,99,235,0.4)]">
                <FiSearch className="w-6 h-6 text-white" />
              </div>
              <div className="text-white font-bold">Searching "{query}"...</div>
            </div>
          )}

          {article && !loading && (
            <div className="max-w-3xl mx-auto px-5 py-5">
              {/* Article header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {article.aiEnhanced ? (
                      <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">AI-Enhanced</span>
                    ) : (
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1">
                        <FiExternalLink className="w-3 h-3" /> Wikipedia
                      </span>
                    )}
                  </div>
                  <h1 className="text-white font-black text-2xl leading-tight">{article.title}</h1>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleBookmark(article.title)}
                    className={cn("p-2 rounded-lg transition-all", bookmarks.includes(article.title) ? "text-amber-400 bg-amber-500/10" : "text-white/25 hover:text-white bg-white/[0.04]")}>
                    <FiBookmark className="w-4 h-4" />
                  </button>
                  <button onClick={askAI} disabled={aiLoading}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-500/15 text-violet-300 text-[12px] font-bold hover:bg-violet-500/25 border border-violet-500/20 transition-all disabled:opacity-50">
                    {aiLoading ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FiZap className="w-3.5 h-3.5" />}
                    AI Analysis
                  </button>
                </div>
              </div>

              {/* Tab toggle */}
              <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] rounded-xl p-1 mb-4 w-fit">
                {(["wiki","ai"] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={cn("px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all capitalize",
                      tab === t ? "bg-white/[0.1] text-white" : "text-white/35 hover:text-white")}>
                    {t === "wiki" ? "📖 Article" : "🤖 AI Analysis"}
                  </button>
                ))}
              </div>

              {tab === "wiki" && (
                <div className="bg-[#0d0d1e] border border-white/[0.08] rounded-2xl p-5 mb-5">
                  {renderText(article.summary)}
                </div>
              )}

              {tab === "ai" && (
                <div className="bg-[#0d0d1e] border border-violet-500/15 rounded-2xl p-5 mb-5">
                  {aiLoading ? (
                    <div className="flex items-center gap-3 py-4">
                      <FiRefreshCw className="w-5 h-5 text-violet-400 animate-spin" />
                      <span className="text-white/50">Generating AI analysis...</span>
                    </div>
                  ) : aiAnswer ? (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <FiZap className="w-3.5 h-3.5 text-violet-400" />
                        <span className="text-[10px] text-violet-400 font-bold uppercase tracking-widest">AI Analysis</span>
                      </div>
                      {renderText(aiAnswer)}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="text-white/40 mb-2">No AI analysis yet</div>
                      <button onClick={askAI} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/15 text-violet-300 text-sm font-bold border border-violet-500/20 transition-all hover:bg-violet-500/25 mx-auto">
                        <FiZap className="w-4 h-4" /> Generate Analysis
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Related topics */}
              {relatedTopics.length > 0 && (
                <div>
                  <div className="text-[10px] text-white/25 uppercase font-bold tracking-widest mb-2">Related Topics</div>
                  <div className="flex flex-wrap gap-2">
                    {relatedTopics.map(t => (
                      <button key={t} onClick={() => search(t)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0d0d1e] border border-white/[0.08] hover:border-blue-500/25 text-white/55 hover:text-white text-[12px] transition-all">
                        <FiChevronRight className="w-3 h-3 text-blue-400" />
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
