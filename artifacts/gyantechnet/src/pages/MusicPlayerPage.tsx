import { useState, useRef, useEffect } from "react";
import {
  FiPlay, FiPause, FiSkipBack, FiSkipForward, FiShuffle, FiRepeat,
  FiVolume2, FiHeart, FiList, FiSearch, FiVolumeX,
} from "react-icons/fi";
import { cn } from "@/lib/utils";

const TRACKS = [
  { id:1, title:"Midnight Raga",    artist:"AI Composer",    duration:215, genre:"Classical",   emoji:"🎻" },
  { id:2, title:"Digital Dreams",   artist:"Synth Wave",     duration:183, genre:"Electronic",  emoji:"🎹" },
  { id:3, title:"Monsoon Melody",   artist:"Gyan Music",     duration:247, genre:"Ambient",     emoji:"🌧️" },
  { id:4, title:"Code & Flow",      artist:"Lo-Fi Lab",      duration:196, genre:"Lo-Fi",       emoji:"💻" },
  { id:5, title:"Sunrise Bhajan",   artist:"Devotional AI",  duration:302, genre:"Devotional",  emoji:"🙏" },
  { id:6, title:"Mumbai Nights",    artist:"City Beats",     duration:228, genre:"Urban",       emoji:"🏙️" },
  { id:7, title:"Quantum Jazz",     artist:"Future Sounds",  duration:175, genre:"Jazz",        emoji:"🎷" },
  { id:8, title:"Himalayan Echo",   artist:"Nature Tones",   duration:264, genre:"Nature",      emoji:"⛰️" },
  { id:9, title:"Neon Pulse",       artist:"Club AI",        duration:198, genre:"EDM",         emoji:"💜" },
  { id:10,title:"Acoustic Dawn",    artist:"Gentle Notes",   duration:241, genre:"Acoustic",    emoji:"🎸" },
  { id:11,title:"Classical Fusion", artist:"Hindustani AI",  duration:320, genre:"Classical",   emoji:"🪘" },
  { id:12,title:"Rain On Rooftop",  artist:"Chillhop Lab",   duration:184, genre:"Lo-Fi",       emoji:"☔" },
];

const GRADIENTS = [
  "from-purple-600 to-blue-700","from-pink-600 to-purple-700","from-blue-600 to-cyan-700",
  "from-emerald-600 to-teal-700","from-amber-600 to-orange-700","from-red-600 to-pink-700",
  "from-indigo-600 to-purple-700","from-teal-600 to-green-700","from-violet-600 to-fuchsia-700",
  "from-sky-600 to-blue-700","from-rose-600 to-red-700","from-cyan-600 to-blue-700",
];

const GENRES = ["All","Classical","Electronic","Ambient","Lo-Fi","Devotional","Urban","Jazz","Nature","EDM","Acoustic"];

function fmt(s: number) { return `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`; }

function MiniEqualizer({ playing }: { playing: boolean }) {
  return (
    <div className="flex items-end gap-[2px] h-4">
      {[0.4,1,0.6,0.9,0.5].map((h, i) => (
        <div key={i}
          className={cn("w-[2.5px] bg-primary rounded-full origin-bottom transition-all", playing && "animate-bounce")}
          style={{ height:`${h*100}%`, animationDelay:`${i*0.1}s`, animationDuration:"0.7s" }} />
      ))}
    </div>
  );
}

export default function MusicPlayerPage() {
  const [current, setCurrent]   = useState(0);
  const [playing, setPlaying]   = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume]     = useState(75);
  const [muted, setMuted]       = useState(false);
  const [liked, setLiked]       = useState<Set<number>>(new Set([1, 6]));
  const [shuffle, setShuffle]   = useState(false);
  const [repeat, setRepeat]     = useState(false);
  const [genre, setGenre]       = useState("All");
  const [search, setSearch]     = useState("");
  const [tab, setTab]           = useState<"playlist"|"library">("playlist");
  const intervalRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const track = TRACKS[current];

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setProgress(p => {
          if (p >= track.duration) {
            if (repeat) return 0;
            const next = (current + 1) % TRACKS.length;
            setCurrent(next); setProgress(0);
            return 0;
          }
          return p + 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, track.duration, current, repeat]);

  const selectTrack = (i: number) => { setCurrent(i); setProgress(0); setPlaying(true); };
  const toggleLike  = (id: number) => setLiked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const prev = () => { setCurrent(c => (c - 1 + TRACKS.length) % TRACKS.length); setProgress(0); };
  const next = () => {
    if (shuffle) setCurrent(Math.floor(Math.random() * TRACKS.length));
    else setCurrent(c => (c + 1) % TRACKS.length);
    setProgress(0);
  };

  const filtered = TRACKS.filter(t => {
    if (genre !== "All" && t.genre !== genre) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.artist.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const pct = (progress / track.duration) * 100;

  return (
    <div className="flex flex-col sm:flex-row h-full overflow-hidden bg-[#06060f]">

      {/* Left panel — Now Playing */}
      <div className="w-full sm:w-72 bg-[#08081a] border-b sm:border-b-0 sm:border-r border-white/[0.06] flex flex-col shrink-0">
        {/* Album art + info */}
        <div className={cn("m-4 rounded-2xl bg-gradient-to-br p-5 text-white relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)]", GRADIENTS[current])}>
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10">
            <div className="w-full aspect-square rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-4 border border-white/[0.15] shadow-inner">
              <div className="flex flex-col items-center gap-2">
                <span className="text-6xl">{track.emoji}</span>
                {playing && (
                  <div className="flex items-end gap-1 h-4">
                    {[0.4,1,0.6,0.9,0.5,0.7,0.3].map((h, i) => (
                      <div key={i} className="w-1 bg-white/80 rounded-full animate-bounce"
                        style={{ height:`${h*16}px`, animationDelay:`${i*0.08}s`, animationDuration:"0.65s" }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[16px] font-black leading-tight">{track.title}</h2>
                <p className="text-white/70 text-[12px] mt-0.5">{track.artist}</p>
                <span className="text-[9px] bg-white/15 px-1.5 py-0.5 rounded-full font-bold mt-1 inline-block">{track.genre}</span>
              </div>
              <button onClick={() => toggleLike(track.id)}
                className={cn("p-2 rounded-xl transition-all", liked.has(track.id) ? "text-red-400 bg-red-500/20" : "text-white/40 hover:text-white bg-white/10")}>
                <FiHeart className={cn("w-4 h-4", liked.has(track.id) && "fill-current")} />
              </button>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-4 pb-2">
          <div className="flex items-center justify-between text-[10.5px] text-white/35 mb-1.5">
            <span className="font-mono">{fmt(progress)}</span>
            <span className="font-mono">{fmt(track.duration)}</span>
          </div>
          <div className="relative h-1.5 bg-white/[0.08] rounded-full cursor-pointer overflow-hidden"
            onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              setProgress(Math.floor(pct * track.duration));
            }}>
            <div className="h-full bg-gradient-to-r from-primary to-violet-400 rounded-full transition-all" style={{ width:`${pct}%` }} />
          </div>
        </div>

        {/* Controls */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-center gap-4 mb-4">
            <button onClick={() => setShuffle(v => !v)}
              className={cn("p-2 rounded-lg transition-all", shuffle ? "text-primary bg-primary/10" : "text-white/25 hover:text-white")}>
              <FiShuffle className="w-4 h-4" />
            </button>
            <button onClick={prev} className="p-2 text-white/60 hover:text-white transition-colors">
              <FiSkipBack className="w-5 h-5" />
            </button>
            <button onClick={() => setPlaying(v => !v)}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-violet-500 flex items-center justify-center text-white hover:from-primary/90 shadow-[0_4px_16px_rgba(124,58,237,0.5)] transition-all active:scale-95">
              {playing ? <FiPause className="w-5 h-5" /> : <FiPlay className="w-5 h-5 ml-0.5" />}
            </button>
            <button onClick={next} className="p-2 text-white/60 hover:text-white transition-colors">
              <FiSkipForward className="w-5 h-5" />
            </button>
            <button onClick={() => setRepeat(v => !v)}
              className={cn("p-2 rounded-lg transition-all", repeat ? "text-primary bg-primary/10" : "text-white/25 hover:text-white")}>
              <FiRepeat className="w-4 h-4" />
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2.5">
            <button onClick={() => setMuted(v => !v)} className="text-white/30 hover:text-white transition-colors">
              {muted || volume === 0 ? <FiVolumeX className="w-3.5 h-3.5" /> : <FiVolume2 className="w-3.5 h-3.5" />}
            </button>
            <div className="flex-1 relative h-1.5 bg-white/[0.08] rounded-full cursor-pointer overflow-hidden"
              onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                setVolume(Math.floor((e.clientX - rect.left) / rect.width * 100));
              }}>
              <div className="h-full bg-white/40 rounded-full" style={{ width:`${muted ? 0 : volume}%` }} />
            </div>
            <span className="text-[10px] text-white/25 font-mono w-5 text-right">{muted ? 0 : volume}</span>
          </div>
        </div>
      </div>

      {/* Right panel — Playlist */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.07] rounded-lg p-0.5">
            {(["playlist","library"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={cn("px-3 py-1.5 rounded-md text-[11.5px] font-semibold capitalize transition-all",
                  tab === t ? "bg-white/[0.1] text-white" : "text-white/30 hover:text-white")}>
                {t === "playlist" ? "🎵 Playlist" : "🎨 Library"}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <div className="relative">
            <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search tracks..."
              className="bg-white/[0.04] border border-white/[0.07] rounded-xl pl-7 pr-3 py-1.5 text-white text-[11.5px] w-36 outline-none placeholder:text-white/20 focus:border-white/[0.2] transition-all" />
          </div>
        </div>

        {tab === "library" && (
          <div className="flex items-center gap-1.5 px-4 py-2 border-b border-white/[0.04] overflow-x-auto no-scrollbar shrink-0">
            {GENRES.map(g => (
              <button key={g} onClick={() => setGenre(g)}
                className={cn("px-2.5 py-1 rounded-full text-[10.5px] font-bold whitespace-nowrap transition-all",
                  genre === g ? "bg-primary text-white" : "bg-white/[0.05] text-white/35 hover:text-white hover:bg-white/[0.09]")}>
                {g}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="p-3 space-y-0.5">
            {filtered.map((t, i) => {
              const idx = TRACKS.findIndex(x => x.id === t.id);
              const isCurrent = idx === current;
              return (
                <div key={t.id} onClick={() => selectTrack(idx)}
                  className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer group transition-all",
                    isCurrent ? "bg-primary/[0.08] ring-1 ring-primary/20" : "hover:bg-white/[0.04]")}>
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-[16px] shrink-0 bg-gradient-to-br", GRADIENTS[idx])}>
                    {isCurrent && playing ? <MiniEqualizer playing={playing} /> : <span className="text-[14px]">{t.emoji}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={cn("text-[13px] font-semibold truncate", isCurrent ? "text-primary" : "text-white/80")}>
                      {t.title}
                    </div>
                    <div className="text-[10.5px] text-white/30">{t.artist} · {t.genre}</div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); toggleLike(t.id); }}
                    className={cn("p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100",
                      liked.has(t.id) ? "opacity-100 text-red-400" : "text-white/20 hover:text-red-400")}>
                    <FiHeart className={cn("w-3.5 h-3.5", liked.has(t.id) && "fill-current")} />
                  </button>
                  <span className="text-[10.5px] text-white/25 font-mono shrink-0">{fmt(t.duration)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
