import { useState, useRef, useCallback } from "react";
import { FiMusic, FiPlay, FiDownload, FiLoader, FiPause, FiZap, FiCopy, FiCheck, FiX, FiBookmark } from "react-icons/fi";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "create",  label: "Create",      icon: "🎵" },
  { id: "lyrics",  label: "Lyrics Mode", icon: "✍️" },
  { id: "remix",   label: "Remix",       icon: "🔄" },
  { id: "library", label: "My Library",  icon: "📚" },
];

const GENRES = [
  { name: "Cinematic",    emoji: "🎬" }, { name: "Love Ballad", emoji: "💕" },
  { name: "Trap Banger",  emoji: "🔥" }, { name: "Meditation",  emoji: "🧘" },
  { name: "Dance Floor",  emoji: "💃" }, { name: "Sufi Night",  emoji: "🌙" },
  { name: "Rock Anthem",  emoji: "🎸" }, { name: "Jazz Café",   emoji: "🎷" },
  { name: "Lo-Fi",        emoji: "☕" }, { name: "EDM",         emoji: "⚡" },
  { name: "Classical",    emoji: "🎻" }, { name: "Hip-Hop",     emoji: "🎤" },
];

const LANGUAGES = ["English", "Hindi", "Hinglish", "Tamil", "Telugu", "Punjabi", "Bengali", "Urdu", "Spanish", "Arabic"];
const DURATIONS  = ["15s", "30s", "1m", "2m", "3m", "Full Song"];

const GENRE_EMOJIS: Record<string, string> = {
  "Cinematic": "🎬", "Love Ballad": "💕", "Trap Banger": "🔥",
  "Meditation": "🧘", "Dance Floor": "💃", "Sufi Night": "🌙",
  "Rock Anthem": "🎸", "Jazz Café": "🎷", "Lo-Fi": "☕",
  "EDM": "⚡", "Classical": "🎻", "Hip-Hop": "🎤",
};

const DURATION_WORDS: Record<string, string> = {
  "15s": "one short verse (30–50 words)",
  "30s": "one verse + chorus (80–120 words)",
  "1m":  "two verses + chorus (150–200 words)",
  "2m":  "three verses + chorus + bridge (250–350 words)",
  "3m":  "full song with all sections (400–500 words)",
  "Full Song": "complete song with verses, chorus, bridge, and outro (500–650 words)",
};

type Track = {
  id: string;
  name: string;
  genre: string;
  duration: string;
  emoji: string;
  lyrics: string;
  bookmarked: boolean;
  ts: number;
};

const STORAGE_KEY = "gyan_music_library";

function loadLibrary(): Track[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveLibrary(lib: Track[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(lib.slice(0, 30))); } catch { /* ignore */ }
}

function formatLyrics(raw: string) {
  return raw.split("\n").map((line, i) => {
    const t = line.trim();
    if (!t) return <div key={i} className="h-2" />;
    if (t.startsWith("#")) return <div key={i} className="text-[15px] font-black text-white mt-3 mb-1">{t.replace(/^#+\s*/, "")}</div>;
    if (/^\[.+\]$/.test(t)) return <div key={i} className="text-[10px] font-black text-pink-400 uppercase tracking-widest mt-3 mb-1">{t}</div>;
    if (t.startsWith("**") && t.endsWith("**")) return <div key={i} className="text-[11px] font-bold text-primary mt-2 mb-0.5">{t.slice(2,-2)}</div>;
    return <div key={i} className="text-[13px] text-white/75 leading-relaxed">{t}</div>;
  });
}

export default function MusicAIPage() {
  const [tab, setTab]             = useState("create");
  const [genre, setGenre]         = useState("Cinematic");
  const [language, setLanguage]   = useState("English");
  const [duration, setDuration]   = useState("1m");
  const [desc, setDesc]           = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [library, setLibrary]     = useState<Track[]>(loadLibrary);
  const [playing, setPlaying]     = useState<string | null>(null);
  const [copied, setCopied]       = useState(false);
  const [showLyrics, setShowLyrics] = useState<Track | null>(null);

  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const generate = useCallback(async (promptOverride?: string) => {
    const text = (promptOverride || desc).trim();
    if (!text) return;
    setDesc(text);
    setGenerating(true);
    setError(null);
    setCurrentTrack(null);

    const wordTarget = DURATION_WORDS[duration] || "two verses + chorus";
    const langNote = language !== "English" ? `Write primarily in ${language}.` : "";
    const tabNote = tab === "lyrics" ? "The following are rough lyrics the user wants to complete and expand:" :
                    tab === "remix"  ? "This is a remix/rework request for an existing style. Apply the described changes:" :
                    "Theme/description:";

    const prompt = `You are a professional ${genre} songwriter. Write complete song lyrics for ${wordTarget}. ${langNote}
${tabNote} ${text}

Format the output as:
Title: [Song Title]

[VERSE 1]
(lyrics)

[CHORUS]
(lyrics)

[VERSE 2]
(lyrics)

[CHORUS]
(lyrics)

${duration === "2m" || duration === "3m" || duration === "Full Song" ? "[BRIDGE]\n(lyrics)\n\n[OUTRO]\n(lyrics)" : ""}

Make the lyrics emotionally resonant, rhythmic, and fitting for the ${genre} genre. Use vivid imagery.`;

    try {
      const res = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, type: "story" }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const content: string = data.content || "";
      // Extract title from "Title: ..." line or first non-empty line
      const titleMatch = content.match(/^Title:\s*(.+)$/m);
      const firstLine = content.split("\n").find((l: string) => l.trim() && !l.startsWith("["));
      const rawTitle = titleMatch?.[1]?.trim() || firstLine?.replace(/^#+\s*/, "").trim() || text.slice(0, 30);
      const title = rawTitle.replace(/[*_#]/g, "").slice(0, 50);

      const track: Track = {
        id:         Math.random().toString(36).slice(2),
        name:       title,
        genre,
        duration,
        emoji:      GENRE_EMOJIS[genre] || "🎵",
        lyrics:     content,
        bookmarked: false,
        ts:         Date.now(),
      };

      setCurrentTrack(track);
      setLibrary(prev => {
        const updated = [track, ...prev];
        saveLibrary(updated);
        return updated;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed. Please try again.");
    }
    setGenerating(false);
  }, [desc, genre, language, duration, tab]);

  const togglePlay = useCallback((trackId: string, lyrics: string) => {
    if (playing === trackId) {
      window.speechSynthesis?.cancel();
      setPlaying(null);
      return;
    }
    window.speechSynthesis?.cancel();
    // Strip markdown formatting for speech
    const cleanText = lyrics.replace(/\[.+?\]/g, "").replace(/#+/g, "").replace(/\*/g, "").replace(/\n\n+/g, ". ");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    utterance.volume = 0.9;
    utterance.onend = () => setPlaying(null);
    utterance.onerror = (e) => { if (e.error !== "interrupted") setPlaying(null); };
    speechRef.current = utterance;
    window.speechSynthesis?.speak(utterance);
    setPlaying(trackId);
  }, [playing]);

  const copyLyrics = (lyrics: string) => {
    navigator.clipboard.writeText(lyrics).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleBookmark = (id: string) => {
    setLibrary(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, bookmarked: !t.bookmarked } : t);
      saveLibrary(updated);
      return updated;
    });
    if (currentTrack?.id === id) setCurrentTrack(prev => prev ? { ...prev, bookmarked: !prev.bookmarked } : prev);
  };

  const deleteTrack = (id: string) => {
    setLibrary(prev => {
      const updated = prev.filter(t => t.id !== id);
      saveLibrary(updated);
      return updated;
    });
    if (currentTrack?.id === id) setCurrentTrack(null);
    if (playing === id) { window.speechSynthesis?.cancel(); setPlaying(null); }
  };

  return (
    <div className="flex h-full bg-[#06060f] overflow-hidden">

      {/* ── Left panel ── */}
      <div className="hidden sm:flex w-[300px] shrink-0 border-r border-white/[0.05] bg-[#08081a] flex-col overflow-hidden">
        <div className="px-4 py-3.5 border-b border-white/[0.05] flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
            <FiMusic className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h2 className="text-[13px] font-bold text-white">AI Music Studio</h2>
            <p className="text-[10px] text-white/35">AI-generated lyrics & compositions</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="p-2 border-b border-white/[0.05] shrink-0">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn("w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] font-medium transition-all mb-0.5",
                tab === t.id ? "bg-primary/15 text-primary" : "text-white/40 hover:bg-white/[0.04] hover:text-white/70")}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {tab !== "library" && (
          <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-4">

            {/* Description / lyrics */}
            <div>
              <label className="block text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1.5">
                {tab === "lyrics" ? "Your Lyrics (to expand)" : tab === "remix" ? "Style / Changes" : "Music Description"}
              </label>
              <textarea value={desc} onChange={e => setDesc(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) generate(); }}
                placeholder={tab === "lyrics" ? "Paste your rough lyrics here…" : tab === "remix" ? "Describe the remix changes…" : "e.g. A heartbreak song about leaving home…"}
                className="w-full bg-[#06060f] border border-white/[0.08] rounded-xl p-3 min-h-[90px] resize-none text-[12px] text-white placeholder:text-white/18 outline-none focus:border-pink-500/40 transition-all no-scrollbar" />
            </div>

            {/* Genre */}
            <div>
              <label className="block text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1.5">Genre</label>
              <div className="grid grid-cols-3 gap-1.5">
                {GENRES.map(g => (
                  <button key={g.name} onClick={() => setGenre(g.name)}
                    className={cn("flex flex-col items-center gap-0.5 p-2 rounded-xl border text-[9px] transition-all",
                      genre === g.name ? "border-pink-500/50 bg-pink-500/[0.12] text-pink-400" : "border-white/[0.07] text-white/40 hover:border-white/15 hover:text-white/70")}>
                    <span className="text-base">{g.emoji}</span>
                    <span className="text-center leading-tight">{g.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1.5">Language</label>
              <div className="flex flex-wrap gap-1.5">
                {LANGUAGES.slice(0, 6).map(l => (
                  <button key={l} onClick={() => setLanguage(l)}
                    className={cn("px-2.5 py-1 rounded-lg border text-[10px] font-medium transition-all",
                      language === l ? "bg-primary/15 border-primary/40 text-primary" : "border-white/[0.07] text-white/40 hover:border-white/15 hover:text-white/60")}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1.5">Duration</label>
              <div className="flex flex-wrap gap-1.5">
                {DURATIONS.map(d => (
                  <button key={d} onClick={() => setDuration(d)}
                    className={cn("px-2.5 py-1 rounded-lg border text-[10px] font-medium transition-all",
                      duration === d ? "bg-primary/15 border-primary/40 text-primary" : "border-white/[0.07] text-white/40 hover:border-white/15 hover:text-white/60")}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "library" && (
          <div className="flex-1 overflow-y-auto no-scrollbar p-3">
            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-2">{library.length} Track{library.length !== 1 ? "s" : ""}</p>
            {library.length === 0 ? (
              <div className="text-center py-8 text-white/25 text-[12px]">No tracks yet. Generate some music!</div>
            ) : library.map(t => (
              <div key={t.id} className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-white/[0.04] transition-all group cursor-pointer mb-1"
                onClick={() => setShowLyrics(t)}>
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-500/20 to-orange-500/20 flex items-center justify-center text-lg shrink-0">
                  {t.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold text-white/80 truncate">{t.name}</div>
                  <div className="text-[10px] text-white/35">{t.genre} · {t.duration}</div>
                </div>
                <button onClick={e => { e.stopPropagation(); togglePlay(t.id, t.lyrics); }}
                  className="p-1.5 rounded-lg text-white/30 hover:text-pink-400 hover:bg-pink-500/10 transition-all opacity-0 group-hover:opacity-100">
                  {playing === t.id ? <FiPause className="w-3.5 h-3.5" /> : <FiPlay className="w-3.5 h-3.5" />}
                </button>
              </div>
            ))}
          </div>
        )}

        {tab !== "library" && (
          <div className="p-3 border-t border-white/[0.05] shrink-0">
            <button onClick={() => generate()} disabled={!desc.trim() || generating}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-pink-600 to-orange-500 text-white text-[13px] font-semibold rounded-xl disabled:opacity-40 transition-all hover:shadow-[0_0_20px_rgba(236,72,153,0.35)] active:scale-[0.98] disabled:cursor-not-allowed">
              {generating ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiZap className="w-4 h-4" />}
              {generating ? "Composing…" : "Generate Music"}
            </button>
            <p className="text-[9px] text-white/20 text-center mt-1.5">Ctrl+Enter to generate</p>
          </div>
        )}
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col p-4 sm:p-5 overflow-hidden">

        {/* Mobile-only compact controls */}
        <div className="sm:hidden mb-4 space-y-2">
          <input type="text" value={desc} onChange={e => setDesc(e.target.value)}
            placeholder="Describe your music (e.g. Epic Bollywood battle scene)…"
            className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl px-3 py-2.5 text-[13px] text-white placeholder:text-white/25 outline-none focus:border-pink-500/50 transition-all" />
          <div className="flex gap-2 items-center">
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar flex-1">
              {GENRES.slice(0, 8).map(g => (
                <button key={g.name} onClick={() => setGenre(g.name)}
                  className={cn("flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap border shrink-0 transition-all",
                    genre === g.name ? "bg-pink-500/15 border-pink-500/40 text-pink-400" : "border-white/[0.09] text-white/40 bg-white/[0.03]")}>
                  {g.emoji} {g.name}
                </button>
              ))}
            </div>
            <button onClick={() => generate()} disabled={!desc.trim() || generating}
              className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-pink-600 to-orange-500 text-white text-[12px] font-semibold rounded-xl disabled:opacity-50 active:scale-[0.97] transition-all">
              {generating ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiZap className="w-3.5 h-3.5" />}
              Generate
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-3 flex items-center gap-2 bg-red-500/8 border border-red-500/20 rounded-xl px-3 py-2.5">
            <span className="text-[12px] text-red-400 flex-1">{error}</span>
            <button onClick={() => setError(null)} className="text-red-400/60 hover:text-red-400"><FiX className="w-3.5 h-3.5" /></button>
          </div>
        )}

        {/* Generating state */}
        {generating && (
          <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-pink-500/20">
            <div className="text-center">
              <div className="flex gap-1.5 mb-4 justify-center items-end">
                {[3, 6, 9, 7, 5, 8, 6, 4, 7, 5, 3, 6].map((h, i) => (
                  <div key={i} className="w-2 bg-gradient-to-t from-pink-500 to-orange-400 rounded-full animate-pulse" style={{ height: h * 4 + "px", animationDelay: `${i * 0.08}s` }} />
                ))}
              </div>
              <div className="text-[15px] font-bold text-white/70">Composing your music…</div>
              <div className="text-[11px] text-white/35 mt-1">{genre} · {duration} · {language}</div>
            </div>
          </div>
        )}

        {/* Current track result */}
        {!generating && currentTrack && (
          <div className="flex-1 flex flex-col min-h-0 gap-3">
            {/* Track header */}
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-pink-500/[0.12] to-orange-500/[0.06] border border-pink-500/20">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500/30 to-orange-500/20 flex items-center justify-center text-3xl shrink-0">
                {currentTrack.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-black text-white truncate">{currentTrack.name}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-pink-400 font-semibold">{currentTrack.genre}</span>
                  <span className="text-white/20 text-[10px]">·</span>
                  <span className="text-[10px] text-white/40">{currentTrack.duration}</span>
                  <span className="text-white/20 text-[10px]">·</span>
                  <span className="text-[10px] text-white/40">{language}</span>
                </div>
                {/* Waveform */}
                <div className="flex gap-0.5 items-end h-5 mt-1.5">
                  {Array.from({ length: 28 }).map((_, j) => (
                    <div key={j} className={cn("w-0.5 rounded-full transition-all",
                      playing === currentTrack.id ? "bg-gradient-to-t from-pink-500 to-orange-400 animate-pulse" : "bg-white/15")}
                      style={{ height: `${Math.random() * 14 + 4}px`, animationDelay: `${j * 0.05}s` }} />
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button onClick={() => togglePlay(currentTrack.id, currentTrack.lyrics)}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center text-white shadow-[0_0_12px_rgba(236,72,153,0.4)] hover:shadow-[0_0_20px_rgba(236,72,153,0.6)] transition-all active:scale-90">
                  {playing === currentTrack.id ? <FiPause className="w-4 h-4" /> : <FiPlay className="w-4 h-4 translate-x-px" />}
                </button>
                <button onClick={() => toggleBookmark(currentTrack.id)}
                  className={cn("w-8 h-8 rounded-full flex items-center justify-center transition-all",
                    currentTrack.bookmarked ? "text-amber-400 bg-amber-500/15" : "text-white/30 hover:text-amber-400 hover:bg-amber-500/10")}>
                  <FiBookmark className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Lyrics display */}
            <div className="flex-1 min-h-0 bg-[#0d0d1e] border border-white/[0.07] rounded-2xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05] shrink-0">
                <span className="text-[11px] font-bold text-white/50">🎼 Lyrics</span>
                <div className="flex gap-2">
                  <button onClick={() => copyLyrics(currentTrack.lyrics)}
                    className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/70 transition-colors">
                    {copied ? <FiCheck className="w-3 h-3 text-emerald-400" /> : <FiCopy className="w-3 h-3" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={() => {
                      const blob = new Blob([currentTrack.lyrics], { type: "text/plain" });
                      const a = document.createElement("a");
                      a.href = URL.createObjectURL(blob);
                      a.download = `${currentTrack.name.replace(/[^a-z0-9]/gi, "_")}_lyrics.txt`;
                      a.click();
                    }}
                    className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/70 transition-colors">
                    <FiDownload className="w-3 h-3" /> Save
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar p-4">
                <div className="space-y-0.5">
                  {formatLyrics(currentTrack.lyrics)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Library tab tracks list */}
        {!generating && !currentTrack && library.length > 0 && tab !== "library" && (
          <>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] font-bold text-white">Recent Tracks</h3>
              <span className="text-[10px] text-white/30">{library.length} saved</span>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
              {library.slice(0, 8).map(t => (
                <div key={t.id} className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-pink-500/25 hover:bg-pink-500/[0.04] transition-all group cursor-pointer"
                  onClick={() => setCurrentTrack(t)}>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/20 to-orange-500/20 flex items-center justify-center text-2xl shrink-0">
                    {t.emoji}
                  </div>
                  <div className="flex gap-0.5 items-end h-7 shrink-0">
                    {Array.from({ length: 14 }).map((_, j) => (
                      <div key={j} className={cn("w-0.5 rounded-full",
                        playing === t.id ? "bg-gradient-to-t from-pink-500 to-orange-400 animate-pulse" : "bg-white/12")}
                        style={{ height: `${Math.random() * 18 + 5}px`, animationDelay: `${j * 0.06}s` }} />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-white/80 truncate">{t.name}</div>
                    <div className="text-[11px] text-white/35">{t.genre} · {t.duration}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={e => { e.stopPropagation(); togglePlay(t.id, t.lyrics); }}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center text-white shadow-[0_0_10px_rgba(236,72,153,0.3)] hover:shadow-[0_0_16px_rgba(236,72,153,0.5)] transition-all active:scale-90">
                      {playing === t.id ? <FiPause className="w-3.5 h-3.5" /> : <FiPlay className="w-3.5 h-3.5 translate-x-px" />}
                    </button>
                    <button onClick={e => { e.stopPropagation(); deleteTrack(t.id); }}
                      className="p-1.5 text-white/20 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all">
                      <FiX className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Empty state */}
        {!generating && !currentTrack && library.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/[0.07]">
            <div className="text-center px-8">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mx-auto mb-4">
                <FiMusic className="w-7 h-7 text-white/25" />
              </div>
              <h3 className="text-[15px] font-bold text-white/50 mb-2">No Tracks Yet</h3>
              <p className="text-[12px] text-white/25 max-w-xs">Describe your music and click Generate to create original AI song lyrics with full structure.</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Lyrics modal ── */}
      {showLyrics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4" onClick={() => setShowLyrics(null)}>
          <div className="relative w-full max-w-lg bg-[#0d0d1e] border border-white/[0.1] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden max-h-[85vh] flex flex-col"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07] shrink-0">
              <div>
                <div className="text-[14px] font-bold text-white">{showLyrics.name}</div>
                <div className="text-[10px] text-white/40">{showLyrics.genre} · {showLyrics.duration}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => copyLyrics(showLyrics.lyrics)}
                  className="flex items-center gap-1 text-[11px] text-white/50 hover:text-white/80 px-2 py-1 rounded-lg hover:bg-white/[0.06] transition-all">
                  <FiCopy className="w-3 h-3" /> Copy
                </button>
                <button onClick={() => setShowLyrics(null)}
                  className="p-1.5 text-white/30 hover:text-white rounded-lg hover:bg-white/[0.06] transition-all">
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar p-4">
              <div className="space-y-0.5">{formatLyrics(showLyrics.lyrics)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
