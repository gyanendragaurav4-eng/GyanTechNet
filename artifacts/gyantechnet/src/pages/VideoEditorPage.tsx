import { useState, useRef } from "react";
import {
  FiPlay, FiPause, FiPlus, FiScissors, FiType, FiMusic,
  FiImage, FiDownload, FiVolume2, FiVolumeX, FiSkipBack,
  FiSkipForward, FiMaximize2, FiSettings, FiTrash2,
} from "react-icons/fi";
import { cn } from "@/lib/utils";

type Clip = { id: string; name: string; type: "video" | "audio" | "text" | "image"; color: string; start: number; width: number; track: number };

const INIT_CLIPS: Clip[] = [
  { id:"c1", name:"Intro_Sequence.mp4", type:"video", color:"from-blue-600/50 to-blue-800/40 border-blue-500/60",   start:5,  width:28, track:0 },
  { id:"c2", name:"Product_Demo.mp4",   type:"video", color:"from-blue-600/50 to-blue-800/40 border-blue-500/60",   start:36, width:38, track:0 },
  { id:"c3", name:"GyanTechNet Title",  type:"text",  color:"from-violet-600/50 to-violet-800/40 border-violet-500/60", start:12, width:8,  track:1 },
  { id:"c4", name:"Product Logo",       type:"image", color:"from-pink-600/50 to-pink-800/40 border-pink-500/60",   start:37, width:6,  track:1 },
  { id:"c5", name:"Background_Music.mp3",type:"audio",color:"from-emerald-600/50 to-emerald-800/40 border-emerald-500/60", start:0, width:80, track:2 },
];

const EFFECTS = ["None","Fade In","Fade Out","Blur","Sharpen","Brightness +","Contrast +","Vignette","Cinematic"];
const TRANSITIONS = ["None","Dissolve","Wipe Left","Wipe Right","Zoom In","Spin","Glitch"];
const FILTERS = ["None","Cinematic","Warm","Cool","B&W","Vintage","Dramatic","Neon"];

const TRACKS = [
  { label:"V1 (Main Video)", color:"border-l-blue-500",    type:"video" },
  { label:"V2 (Overlay)",    color:"border-l-violet-500",  type:"text" },
  { label:"A1 (Music)",      color:"border-l-emerald-500", type:"audio" },
];

export default function VideoEditorPage() {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted]     = useState(false);
  const [progress, setProgress] = useState(22);
  const [clips, setClips]     = useState<Clip[]>(INIT_CLIPS);
  const [selected, setSelected] = useState<string | null>("c1");
  const [effect, setEffect]   = useState("None");
  const [transition, setTransition] = useState("None");
  const [filter, setFilter]   = useState("None");
  const [volume, setVolume]   = useState(80);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const togglePlay = () => {
    if (playing) {
      if (progressRef.current) clearInterval(progressRef.current);
    } else {
      progressRef.current = setInterval(() => {
        setProgress(p => { if (p >= 100) { clearInterval(progressRef.current!); setPlaying(false); return 0; } return p + 0.3; });
      }, 80);
    }
    setPlaying(p => !p);
  };

  const deleteClip = (id: string) => {
    setClips(p => p.filter(c => c.id !== id));
    if (selected === id) setSelected(null);
  };

  const sel = clips.find(c => c.id === selected);
  const totalSec = 80;
  const curSec   = Math.round((progress / 100) * totalSec);
  const fmt = (s: number) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  return (
    <div className="flex flex-col h-full bg-[#06060f] overflow-hidden text-white">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-3 py-2.5 border-b border-white/[0.06] bg-[#08081a] shrink-0">
        <span className="text-[14px] font-black text-white">GyanEdit</span>
        <span className="text-[9px] bg-primary/20 text-primary border border-primary/25 px-2 py-0.5 rounded-full font-bold uppercase">Pro</span>
        <div className="flex-1" />
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-white/60 text-[11.5px] outline-none hidden sm:block" style={{colorScheme:"dark"}}>
          {FILTERS.map(f => <option key={f}>{f}</option>)}
        </select>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-[12px] font-bold hover:bg-primary/90 transition-all shadow-[0_2px_8px_rgba(124,58,237,0.3)]">
          <FiDownload className="w-3.5 h-3.5" /> Export
        </button>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Media library */}
        <div className="hidden sm:flex w-52 shrink-0 bg-[#08081a] border-r border-white/[0.06] flex-col">
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/[0.05]">
            <span className="text-white/50 text-[11.5px] font-bold flex-1">Media Library</span>
            <button className="text-primary"><FiPlus className="w-4 h-4" /></button>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1.5">
            {[
              { icon:"🎬", name:"Intro_Sequence.mp4", sub:"00:28 · 1080p" },
              { icon:"🎬", name:"Product_Demo.mp4",   sub:"00:38 · 1080p" },
              { icon:"🎵", name:"Background_Music.mp3",sub:"01:20 · 320kbps" },
              { icon:"🖼️", name:"Logo_Overlay.png",   sub:"1024×1024 · PNG" },
              { icon:"✍️", name:"Title_Card.txt",     sub:"Animation preset" },
            ].map(m => (
              <div key={m.name} className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.14] cursor-grab transition-all group">
                <span className="text-[18px] shrink-0">{m.icon}</span>
                <div className="min-w-0">
                  <div className="text-white/65 text-[11.5px] truncate">{m.name}</div>
                  <div className="text-white/25 text-[10px]">{m.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center: preview + properties */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Video preview */}
          <div className="flex-1 bg-black flex flex-col overflow-hidden min-h-0">
            <div className="flex-1 flex items-center justify-center relative min-h-0 p-4">
              <div className="relative w-full max-w-2xl aspect-video bg-gradient-to-br from-indigo-950/60 to-violet-950/60 border border-white/[0.08] rounded-2xl overflow-hidden flex items-center justify-center shadow-2xl">
                {filter !== "None" && (
                  <div className={cn("absolute inset-0 pointer-events-none",
                    filter==="Warm" ? "bg-amber-500/10" : filter==="Cool" ? "bg-blue-500/10" :
                    filter==="B&W" ? "grayscale" : filter==="Dramatic" ? "contrast-125 brightness-75" :
                    filter==="Neon" ? "hue-rotate-90 saturate-150" : "bg-purple-900/10"
                  )} />
                )}
                <div className="text-center pointer-events-none">
                  <div className="text-[36px] font-black text-white tracking-widest drop-shadow-lg mb-2">GyanTechNet</div>
                  <div className="text-white/30 text-[13px]">Preview — {fmt(curSec)} / {fmt(totalSec)}</div>
                </div>
                {/* Timecode */}
                <div className="absolute top-3 left-3 font-mono text-[11px] text-white/40 bg-black/50 px-2 py-1 rounded-lg">
                  {fmt(curSec)}.{String(Math.round((progress % (100/totalSec)) / (100/totalSec) * 24)).padStart(2,"0")}
                </div>
                <button className="absolute top-3 right-3 p-1.5 bg-black/50 rounded-lg text-white/40 hover:text-white transition-all">
                  <FiMaximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Player controls */}
            <div className="h-14 bg-[#0a0a1a] border-t border-white/[0.05] flex items-center px-4 gap-3 shrink-0">
              <button className="text-white/35 hover:text-white transition-all"><FiSkipBack className="w-4 h-4" /></button>
              <button onClick={togglePlay}
                className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-[0_2px_10px_rgba(124,58,237,0.35)] hover:bg-primary/90 transition-all">
                {playing ? <FiPause className="w-4 h-4" /> : <FiPlay className="w-4 h-4 ml-0.5" />}
              </button>
              <button className="text-white/35 hover:text-white transition-all"><FiSkipForward className="w-4 h-4" /></button>

              <div className="flex-1 flex items-center gap-2">
                <span className="text-white/35 text-[11px] font-mono w-10 shrink-0">{fmt(curSec)}</span>
                <div className="flex-1 h-2 bg-white/[0.07] rounded-full overflow-hidden cursor-pointer"
                  onClick={e => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setProgress(((e.clientX - rect.left) / rect.width) * 100);
                  }}>
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width:`${progress}%` }} />
                </div>
                <span className="text-white/35 text-[11px] font-mono w-10 shrink-0 text-right">{fmt(totalSec)}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => setMuted(v=>!v)} className="text-white/35 hover:text-white transition-all">
                  {muted ? <FiVolumeX className="w-4 h-4" /> : <FiVolume2 className="w-4 h-4" />}
                </button>
                <input type="range" min="0" max="100" value={volume} onChange={e => setVolume(+e.target.value)}
                  className="w-16 accent-primary h-1" />
                <button className="text-white/25 hover:text-white transition-all"><FiSettings className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>

        {/* Properties panel */}
        {sel && (
          <div className="hidden lg:flex w-56 shrink-0 bg-[#08081a] border-l border-white/[0.06] flex-col p-3 gap-3">
            <div className="text-[9px] text-white/25 uppercase font-bold tracking-widest">Clip Properties</div>
            <div className="bg-white/[0.04] rounded-xl p-3">
              <div className="text-white font-semibold text-[12.5px] mb-1 truncate">{sel.name}</div>
              <div className="text-white/30 text-[10.5px] capitalize">{sel.type} clip</div>
            </div>

            <div>
              <label className="text-[9px] text-white/25 uppercase font-bold tracking-widest block mb-1.5">Effect</label>
              <select value={effect} onChange={e => setEffect(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-2.5 py-2 text-white/60 text-[11.5px] outline-none" style={{colorScheme:"dark"}}>
                {EFFECTS.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] text-white/25 uppercase font-bold tracking-widest block mb-1.5">Transition</label>
              <select value={transition} onChange={e => setTransition(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-2.5 py-2 text-white/60 text-[11.5px] outline-none" style={{colorScheme:"dark"}}>
                {TRANSITIONS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[9px] text-white/25 uppercase font-bold tracking-widest block mb-1.5">Volume / Opacity</label>
              <input type="range" min="0" max="100" defaultValue="100"
                className="w-full accent-primary h-1" />
            </div>

            <button onClick={() => deleteClip(sel.id)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-[12px] font-semibold hover:bg-red-500/20 transition-all mt-auto">
              <FiTrash2 className="w-3.5 h-3.5" /> Delete Clip
            </button>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="h-44 bg-[#08081a] border-t border-white/[0.06] flex flex-col shrink-0">
        {/* Timeline toolbar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.05] bg-[#09091a]">
          <button className="p-1.5 rounded-lg text-white/25 hover:text-white hover:bg-white/[0.06] transition-all"><FiScissors className="w-3.5 h-3.5" /></button>
          <button className="p-1.5 rounded-lg text-white/25 hover:text-white hover:bg-white/[0.06] transition-all"><FiType className="w-3.5 h-3.5" /></button>
          <button className="p-1.5 rounded-lg text-white/25 hover:text-white hover:bg-white/[0.06] transition-all"><FiImage className="w-3.5 h-3.5" /></button>
          <button className="p-1.5 rounded-lg text-white/25 hover:text-white hover:bg-white/[0.06] transition-all"><FiMusic className="w-3.5 h-3.5" /></button>
          <div className="h-4 w-px bg-white/[0.1]" />
          <span className="text-white/25 text-[10px]">Zoom:</span>
          <input type="range" min="50" max="200" defaultValue="100" className="w-20 accent-primary h-1" />
          <div className="flex-1" />
          <span className="text-white/25 text-[10.5px] font-mono">{fmt(curSec)} / {fmt(totalSec)}</span>
        </div>

        {/* Tracks */}
        <div className="flex-1 overflow-auto relative">
          {/* Ruler */}
          <div className="h-5 bg-[#09091a] border-b border-white/[0.04] flex items-end pl-24 text-[9px] text-white/20 font-mono shrink-0">
            <div className="flex justify-between w-full px-2 pb-1">
              {Array.from({length:9}).map((_,i) => <span key={i}>{fmt(i*10)}</span>)}
            </div>
          </div>

          {TRACKS.map((track, ti) => (
            <div key={ti} className="flex border-b border-white/[0.04] h-[calc((100%-20px)/3)] min-h-[32px]">
              <div className={cn("w-24 shrink-0 bg-[#09091a] border-r border-white/[0.05] flex items-center px-2 text-[10.5px] font-medium text-white/35 border-l-2", track.color)}>
                {track.label}
              </div>
              <div className="flex-1 relative" style={{ minWidth:"600px" }}>
                {clips.filter(c => c.track === ti).map(clip => (
                  <button key={clip.id} onClick={() => setSelected(clip.id)}
                    className={cn("absolute top-1 bottom-1 bg-gradient-to-r rounded-lg border text-[10px] font-medium px-2 truncate cursor-pointer transition-all hover:opacity-90",
                      clip.color,
                      selected === clip.id ? "ring-2 ring-white/40 ring-offset-1 ring-offset-black/50" : "")}
                    style={{ left:`${clip.start}%`, width:`${clip.width}%` }}>
                    {clip.name}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Playhead */}
          <div className="absolute top-0 bottom-0 pointer-events-none z-20" style={{ left:`calc(${progress}% * (100% - 96px) / 100 + 96px)` }}>
            <div className="h-full w-px bg-red-500/80" />
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-red-500 rounded-sm rotate-45" />
          </div>
        </div>
      </div>
    </div>
  );
}
