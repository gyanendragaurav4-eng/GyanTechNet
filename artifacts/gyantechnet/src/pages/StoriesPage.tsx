import { useState } from "react";
import { FiFeather, FiZap, FiCopy, FiDownload, FiX, FiRefreshCw, FiBookmark, FiStar } from "react-icons/fi";
import { cn } from "@/lib/utils";

const GENRES = ["Fantasy","Sci-Fi","Romance","Thriller","Mystery","Comedy","Horror","Adventure","Historical","Drama"];
const LENGTHS = [
  { label:"Flash",    words:"~200 words",  icon:"⚡" },
  { label:"Short",    words:"~500 words",  icon:"📖" },
  { label:"Novelette",words:"~1000 words", icon:"📚" },
];
const STYLES  = ["Immersive","Descriptive","Minimalist","Suspenseful","Humorous","Poetic","Cinematic","Noir"];
const TONES   = ["Serious","Light-hearted","Dark","Uplifting","Mysterious","Romantic"];

const STORY_STARTERS = [
  { icon:"🕐", prompt:"A time traveler visits Delhi in 1857",                  genre:"Historical" },
  { icon:"🤖", prompt:"A robot discovers it has feelings",                      genre:"Sci-Fi" },
  { icon:"📚", prompt:"The last bookstore in 2150",                             genre:"Sci-Fi" },
  { icon:"🔍", prompt:"A detective with telepathy solves an impossible crime",  genre:"Mystery" },
  { icon:"🐉", prompt:"A dragon who is afraid of heights",                      genre:"Fantasy" },
  { icon:"💫", prompt:"Two strangers meet at the edge of the universe",         genre:"Sci-Fi" },
  { icon:"🌙", prompt:"A midnight library that only appears on full moons",     genre:"Fantasy" },
  { icon:"⚡", prompt:"The last human alive receives a message from space",     genre:"Thriller" },
];

type Story = { id: string; title: string; genre: string; length: string; style: string; content: string; ts: number; bookmarked: boolean };
const STORAGE_KEY = "gyan_stories";

function loadStories(): Story[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveStories(s: Story[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s.slice(0, 20))); } catch { /* ignore */ }
}

export default function StoriesPage() {
  const [genre, setGenre]    = useState("Sci-Fi");
  const [length, setLength]  = useState("Short");
  const [style, setStyle]    = useState("Immersive");
  const [tone, setTone]      = useState("Serious");
  const [idea, setIdea]      = useState("");
  const [story, setStory]    = useState<Story | null>(null);
  const [loading, setLoading]= useState(false);
  const [stories, setStories]= useState<Story[]>(loadStories);
  const [showSaved, setShowSaved] = useState(false);

  const generate = async (prompt?: string) => {
    const text = (prompt || idea).trim();
    if (!text) return;
    setIdea(text);
    setLoading(true);
    setStory(null);

    const lengthData = LENGTHS.find(l => l.label === length);
    try {
      const res = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Write a ${genre} ${length} story (${lengthData?.words || "~500 words"}) in ${style} style with a ${tone} tone. Story prompt: ${text}. Make it engaging, well-structured, with vivid descriptions and compelling characters. Include a proper title.`,
          type: "story",
        }),
      });
      const data = await res.json();
      const content = data.content || data.error || "Story generation failed.";
      const titleMatch = content.match(/^#\s*(.+)/m);
      const title = titleMatch ? titleMatch[1] : text.slice(0, 40);
      const newStory: Story = {
        id: Math.random().toString(36).slice(2),
        title, genre, length, style, content, ts: Date.now(), bookmarked: false,
      };
      setStory(newStory);
      setStories(prev => { const updated = [newStory, ...prev]; saveStories(updated); return updated; });
    } catch {
      setStory({ id:"err", title:"Error", genre, length, style, content:"⚠️ Could not connect to story engine. Check your connection.", ts: Date.now(), bookmarked: false });
    }
    setLoading(false);
  };

  const toggleBookmark = (id: string) => {
    setStories(prev => { const updated = prev.map(s => s.id === id ? { ...s, bookmarked: !s.bookmarked } : s); saveStories(updated); return updated; });
    if (story?.id === id) setStory(s => s ? { ...s, bookmarked: !s.bookmarked } : s);
  };

  const exportStory = () => {
    if (!story) return;
    const blob = new Blob([story.content], { type: "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `story-${story.title.slice(0, 30)}.txt`; a.click();
  };

  const renderStory = (text: string) => text.split("\n").map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-3" />;
    if (line.startsWith("# "))  return <h1 key={i} className="text-2xl font-black text-white mt-4 mb-3 first:mt-0 italic">{line.slice(2)}</h1>;
    if (line.startsWith("## ")) return <h2 key={i} className="text-lg font-bold text-violet-300 mt-4 mb-2">{line.slice(3)}</h2>;
    return <p key={i} className="text-white/80 text-[14px] leading-[1.9] mb-0.5 indent-6 first:indent-0">{line}</p>;
  });

  return (
    <div className="flex h-full bg-[#06060f] overflow-hidden">

      {/* Sidebar */}
      <div className="hidden md:flex w-72 shrink-0 bg-[#08081a] border-r border-white/[0.06] flex-col">
        <div className="px-4 pt-4 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-600 to-violet-600 flex items-center justify-center">
              <FiFeather className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-white font-black text-[14px] leading-none">GyanStories</h1>
              <p className="text-white/30 text-[10px]">AI-powered creative writing</p>
            </div>
          </div>

          {/* Genre */}
          <div className="mb-3">
            <div className="text-[9px] text-white/25 uppercase font-bold tracking-widest mb-1.5">Genre</div>
            <div className="flex flex-wrap gap-1">
              {GENRES.map(g => (
                <button key={g} onClick={() => setGenre(g)}
                  className={cn("px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all",
                    genre === g ? "bg-pink-500/20 text-pink-300 border-pink-500/25" : "text-white/35 border-white/[0.07] hover:text-white bg-white/[0.03]")}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Length */}
          <div className="mb-3">
            <div className="text-[9px] text-white/25 uppercase font-bold tracking-widest mb-1.5">Length</div>
            <div className="flex gap-1.5">
              {LENGTHS.map(l => (
                <button key={l.label} onClick={() => setLength(l.label)}
                  className={cn("flex-1 flex flex-col items-center py-2 rounded-xl border text-center transition-all",
                    length === l.label ? "bg-violet-500/15 border-violet-500/25 text-violet-300" : "border-white/[0.07] text-white/35 hover:text-white bg-white/[0.03]")}>
                  <span className="text-base">{l.icon}</span>
                  <span className="text-[10px] font-semibold">{l.label}</span>
                  <span className="text-[9px] opacity-60">{l.words}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Style + Tone */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-[9px] text-white/25 uppercase font-bold tracking-widest mb-1.5">Style</div>
              <select value={style} onChange={e => setStyle(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-white text-[11px] outline-none" style={{ colorScheme:"dark" }}>
                {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <div className="text-[9px] text-white/25 uppercase font-bold tracking-widest mb-1.5">Tone</div>
              <select value={tone} onChange={e => setTone(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-white text-[11px] outline-none" style={{ colorScheme:"dark" }}>
                {TONES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Saved stories */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-2 px-3">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[9px] text-white/25 uppercase font-bold tracking-widest">Saved Stories</span>
            {stories.length > 0 && <span className="text-[9px] text-white/25">{stories.length}</span>}
          </div>
          {stories.map(s => (
            <button key={s.id} onClick={() => setStory(s)}
              className={cn("w-full flex items-start gap-2 px-2 py-2 rounded-lg hover:bg-white/[0.04] transition-all mb-0.5 text-left",
                story?.id === s.id && "bg-white/[0.06]")}>
              <span className="text-sm mt-0.5">{s.bookmarked ? "⭐" : "📖"}</span>
              <div className="flex-1 min-w-0">
                <div className="text-white/70 text-[11px] font-medium truncate">{s.title}</div>
                <div className="text-white/25 text-[9px]">{s.genre} · {s.length} · {new Date(s.ts).toLocaleDateString()}</div>
              </div>
            </button>
          ))}
          {stories.length === 0 && <div className="text-white/20 text-[11px] py-4 text-center">No stories yet</div>}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Prompt input */}
        <div className="px-4 py-3.5 border-b border-white/[0.06] bg-[#06060f] shrink-0">
          <div className={cn(
            "flex items-start gap-3 bg-[#0d0d1e] border rounded-2xl px-4 py-3 transition-all",
            loading ? "border-pink-500/30" : "border-white/[0.09] focus-within:border-pink-500/35"
          )}>
            <FiFeather className="w-4 h-4 text-white/30 mt-1 shrink-0" />
            <textarea value={idea} onChange={e => setIdea(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); generate(); } }}
              placeholder="What should your story be about? Give a premise, character, or situation..."
              className="flex-1 bg-transparent text-white text-[14px] outline-none placeholder:text-white/20 resize-none min-h-[36px] max-h-[80px] leading-relaxed"
              rows={1} />
            <button onClick={() => generate()} disabled={loading || !idea.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-[13px] bg-gradient-to-r from-pink-600 to-violet-600 text-white hover:from-pink-500 hover:to-violet-500 shadow-[0_4px_12px_rgba(236,72,153,0.3)] disabled:opacity-30 transition-all shrink-0">
              {loading ? <FiRefreshCw className="w-4 h-4 animate-spin" /> : <FiZap className="w-4 h-4" />}
              {loading ? "Writing..." : "Generate"}
            </button>
          </div>
          {/* Mobile genre selector */}
          <div className="md:hidden flex gap-1 mt-2 overflow-x-auto no-scrollbar">
            {GENRES.slice(0, 6).map(g => (
              <button key={g} onClick={() => setGenre(g)}
                className={cn("shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all",
                  genre === g ? "bg-pink-500/20 text-pink-300 border-pink-500/25" : "text-white/35 border-white/[0.07] bg-white/[0.03]")}>
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {!story && !loading && (
            <div className="px-5 py-5">
              <div className="text-[10px] text-white/25 uppercase font-bold tracking-widest mb-3">Story Starters</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {STORY_STARTERS.map((s, i) => (
                  <button key={i} onClick={() => { setIdea(s.prompt); setGenre(s.genre); generate(s.prompt); }}
                    className="flex flex-col items-start gap-2 p-4 rounded-xl bg-[#0d0d1e] border border-white/[0.07] hover:border-pink-500/25 hover:bg-pink-500/[0.04] text-left transition-all active:scale-[0.98] group">
                    <span className="text-2xl">{s.icon}</span>
                    <div>
                      <div className="text-white/80 text-[12px] font-semibold leading-snug group-hover:text-white transition-colors">{s.prompt}</div>
                      <div className="text-white/30 text-[10px] mt-1">{s.genre}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-600 to-violet-600 flex items-center justify-center animate-pulse shadow-[0_0_30px_rgba(236,72,153,0.4)]">
                  <FiFeather className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="text-center">
                <div className="text-white font-bold text-base mb-1">Crafting your story…</div>
                <div className="text-white/35 text-sm">"{idea.slice(0, 50)}{idea.length > 50 ? "..." : ""}"</div>
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  {["Setting the scene","Building characters","Weaving the plot"].map((s, i) => (
                    <div key={i} className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.07]">
                      <div className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" style={{ animationDelay: `${i*0.3}s` }} />
                      <span className="text-white/40 text-[10px]">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {story && !loading && (
            <div className="max-w-2xl mx-auto px-5 py-5">
              {/* Story header */}
              <div className="flex items-center gap-2 mb-5">
                <div className="flex items-center gap-2 flex-1 flex-wrap">
                  <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest">New Story</span>
                  <span className="text-[10px] text-white/20">·</span>
                  <span className="text-[10px] text-white/35">{story.genre}</span>
                  <span className="text-[10px] text-white/20">·</span>
                  <span className="text-[10px] text-white/35">{story.length}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => toggleBookmark(story.id)}
                    className={cn("p-2 rounded-lg transition-all", story.bookmarked ? "text-amber-400 bg-amber-500/10" : "text-white/25 hover:text-white bg-white/[0.04]")}>
                    <FiBookmark className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => navigator.clipboard.writeText(story.content).catch(() => {})}
                    className="p-2 rounded-lg text-white/25 hover:text-white bg-white/[0.04] transition-all">
                    <FiCopy className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={exportStory} className="p-2 rounded-lg text-white/25 hover:text-white bg-white/[0.04] transition-all">
                    <FiDownload className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => { setStory(null); setIdea(""); }}
                    className="p-2 rounded-lg text-white/25 hover:text-white bg-white/[0.04] transition-all">
                    <FiX className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Story text */}
              <div className="bg-[#0d0d1e] border border-white/[0.07] rounded-2xl p-6 mb-5">
                {renderStory(story.content)}
              </div>

              {/* Regenerate */}
              <button onClick={() => generate()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.09] text-white/50 hover:text-white hover:bg-white/[0.08] text-sm font-semibold transition-all">
                <FiRefreshCw className="w-4 h-4" /> Generate another version
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
