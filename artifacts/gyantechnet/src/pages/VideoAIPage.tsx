import { useState } from "react";
import {
  FiFilm, FiPlay, FiZap, FiDownload, FiLoader,
  FiRefreshCw, FiExternalLink, FiAlertCircle,
} from "react-icons/fi";
import { cn } from "@/lib/utils";

const VIDEO_MODELS = [
  {
    id: "leonardoai/phoenix",
    label: "Gyan Create",
    badge: "Creative",
    color: "#f97316",
    desc: "Artistic & stylized motion",
    icon: "🎨",
  },
  {
    id: "google/veo-2",
    label: "Gyan Video",
    badge: "Realistic",
    color: "#4285f4",
    desc: "Photorealistic natural motion",
    icon: "🎬",
  },
];

const STYLE_PRESETS = [
  { id: "Cinematic",   emoji: "🎬" },
  { id: "Realistic",   emoji: "📸" },
  { id: "Anime",       emoji: "✨" },
  { id: "Watercolor",  emoji: "🎨" },
  { id: "Neon/Cyber",  emoji: "💜" },
  { id: "Dark/Noir",   emoji: "🖤" },
  { id: "Nature",      emoji: "🌿" },
  { id: "Abstract",    emoji: "🔮" },
];

const TEMPLATES = [
  { title: "Nature Walk",    desc: "Serene forest path at golden hour",        icon: "🌲" },
  { title: "City Night",     desc: "Neon lights reflecting on wet streets",    icon: "🌆" },
  { title: "Space Travel",   desc: "Warp speed flight through star fields",    icon: "🚀" },
  { title: "Ocean Waves",    desc: "Calm turquoise sea at sunrise",            icon: "🌊" },
  { title: "Mountain Fog",   desc: "Snow peaks emerging through morning mist", icon: "⛰️" },
  { title: "Cyberpunk City", desc: "Futuristic streets with holographic ads",  icon: "🤖" },
];

type VideoResult = {
  url: string;
  label: string;
  color: string;
} | null;

export default function VideoAIPage() {
  const [tab, setTab]             = useState("text");
  const [prompt, setPrompt]       = useState("");
  const [preset, setPreset]       = useState("Cinematic");
  const [duration, setDuration]   = useState(5);
  const [ratio, setRatio]         = useState("16:9");
  const [model, setModel]         = useState("google/veo-2");
  const [generating, setGenerating] = useState(false);
  const [result, setResult]       = useState<VideoResult>(null);
  const [error, setError]         = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  const selectedModel = VIDEO_MODELS.find(m => m.id === model)!;

  const generate = async (promptOverride?: string) => {
    const p = (promptOverride ?? prompt).trim();
    if (!p || generating) return;
    setGenerating(true);
    setError(null);
    setResult(null);
    setLoadFailed(false);
    try {
      const r = await fetch("/api/generate-video-single", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: p, model, duration, ratio, preset }),
      });
      const d = await r.json();
      if (d.error) { setError(d.error); }
      else { setResult(d); }
    } catch {
      setError("Failed to connect to the video generation service. Please try again.");
    }
    setGenerating(false);
  };

  const reset = () => { setResult(null); setError(null); setLoadFailed(false); };

  return (
    <div className="flex h-full bg-[#06060f] overflow-hidden">

      {/* ── Left sidebar ── */}
      <div className="hidden sm:flex w-[264px] shrink-0 border-r border-white/[0.05] bg-[#08081a] flex-col overflow-hidden">

        {/* Header */}
        <div className="px-4 py-3.5 border-b border-white/[0.05] flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center">
            <FiFilm className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h2 className="text-[13px] font-bold text-white">Video Studio</h2>
            <p className="text-[10px] text-white/35">Gyan Create · Gyan Video</p>
          </div>
        </div>

        {/* Mode tabs */}
        <div className="p-2.5 border-b border-white/[0.05] shrink-0">
          <div className="grid grid-cols-2 gap-1.5">
            {[{ id: "text", label: "Text to Video", icon: "✍️" }, { id: "templates", label: "Templates", icon: "📋" }].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={cn("flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all",
                  tab === t.id
                    ? "bg-primary/15 text-primary border border-primary/25"
                    : "bg-white/[0.03] text-white/45 hover:bg-white/[0.06] hover:text-white/70 border border-transparent")}>
                <span>{t.icon}</span>{t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-4">

          {tab === "templates" ? (
            <div className="space-y-2">
              <p className="text-[9px] font-bold text-white/25 uppercase tracking-widest mb-2">Quick Start</p>
              {TEMPLATES.map(t => (
                <button key={t.title}
                  onClick={() => { setPrompt(t.desc); setTab("text"); }}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-primary/30 hover:bg-primary/[0.06] transition-all text-left group">
                  <span className="text-xl">{t.icon}</span>
                  <div>
                    <div className="text-[11px] font-semibold text-white/80 group-hover:text-white">{t.title}</div>
                    <div className="text-[9px] text-white/35">{t.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <>
              {/* AI Model selector */}
              <div>
                <label className="block text-[9px] font-bold text-white/30 uppercase tracking-widest mb-2">AI Engine</label>
                <div className="flex flex-col gap-1.5">
                  {VIDEO_MODELS.map(m => (
                    <button key={m.id} onClick={() => setModel(m.id)}
                      className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left")}
                      style={model === m.id
                        ? { borderColor: m.color + "60", background: m.color + "12" }
                        : { borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                      <span className="text-lg shrink-0">{m.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12px] font-bold"
                            style={{ color: model === m.id ? m.color : "rgba(255,255,255,0.65)" }}>{m.label}</span>
                          <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest"
                            style={{ background: m.color + "20", color: m.color }}>{m.badge}</span>
                        </div>
                        <div className="text-[9px] text-white/30">{m.desc}</div>
                      </div>
                      {model === m.id && (
                        <div className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse" style={{ background: m.color }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt */}
              <div>
                <label className="block text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1.5">Scene Description</label>
                <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generate(); }}
                  placeholder="Describe your video scene in detail…"
                  className="w-full bg-[#06060f] border border-white/[0.08] rounded-xl p-3 min-h-[90px] resize-none text-[12px] text-white placeholder:text-white/18 outline-none focus:border-primary/40 transition-all no-scrollbar leading-relaxed" />
              </div>

              {/* Style Preset */}
              <div>
                <label className="block text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1.5">Style Preset</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {STYLE_PRESETS.map(p => (
                    <button key={p.id} onClick={() => setPreset(p.id)}
                      className={cn("flex flex-col items-center gap-0.5 p-1.5 rounded-xl border text-[9px] font-medium transition-all",
                        preset === p.id
                          ? "border-primary/50 bg-primary/[0.12] text-primary"
                          : "border-white/[0.07] text-white/40 hover:border-white/15 hover:text-white/70")}>
                      <span className="text-base">{p.emoji}</span>
                      <span className="truncate w-full text-center text-[8.5px]">{p.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1.5">Duration</label>
                <div className="flex gap-1.5">
                  {[3, 5, 8, 10].map(d => (
                    <button key={d} onClick={() => setDuration(d)}
                      className={cn("flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all border",
                        duration === d
                          ? "bg-primary/15 border-primary/40 text-primary"
                          : "border-white/[0.07] text-white/40 hover:border-white/15")}>
                      {d}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Ratio */}
              <div>
                <label className="block text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1.5">Aspect Ratio</label>
                <div className="flex gap-1.5">
                  {["16:9", "9:16", "1:1"].map(r => (
                    <button key={r} onClick={() => setRatio(r)}
                      className={cn("flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all border",
                        ratio === r
                          ? "bg-primary/15 border-primary/40 text-primary"
                          : "border-white/[0.07] text-white/40 hover:border-white/15")}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Generate button */}
        <div className="p-3 border-t border-white/[0.05] shrink-0">
          <button onClick={() => generate()} disabled={!prompt.trim() || generating}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-primary to-pink-500 text-white text-[13px] font-semibold rounded-xl disabled:opacity-40 transition-all hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] active:scale-[0.98] disabled:cursor-not-allowed">
            {generating ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiZap className="w-4 h-4" />}
            {generating ? "Generating…" : "Generate Video"}
          </button>
          <p className="text-center text-[9px] text-white/20 mt-1.5">
            {selectedModel.label} · {duration}s · {ratio} · {preset}
          </p>
        </div>
      </div>

      {/* ── Right canvas ── */}
      <div className="flex-1 flex flex-col p-4 gap-3 overflow-hidden bg-[#06060f]">

        {/* Mobile bar */}
        <div className="sm:hidden flex gap-2 items-start">
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={2}
            placeholder="Describe your video scene…"
            className="flex-1 bg-white/[0.04] border border-white/[0.09] rounded-xl px-3 py-2.5 text-[13px] text-white placeholder:text-white/25 outline-none focus:border-primary/50 resize-none transition-all" />
          <button onClick={() => generate()} disabled={!prompt.trim() || generating}
            className="shrink-0 flex items-center gap-1 px-3 py-2.5 bg-gradient-to-r from-primary to-pink-500 text-white text-[12px] font-semibold rounded-xl disabled:opacity-50 active:scale-[0.97] transition-all">
            {generating ? <FiLoader className="w-3.5 h-3.5 animate-spin" /> : <FiZap className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* ── Main canvas ── */}
        <div className="flex-1 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0d0d1e] relative flex flex-col items-center justify-center">

          {/* IDLE */}
          {!generating && !result && !error && (
            <div className="text-center px-8 max-w-sm">
              {/* Model showcase */}
              <div className="flex items-center justify-center gap-3 mb-6">
                {VIDEO_MODELS.map(m => (
                  <button key={m.id} onClick={() => setModel(m.id)}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all group"
                    style={model === m.id
                      ? { borderColor: m.color + "50", background: m.color + "12", boxShadow: `0 0 20px ${m.color}20` }
                      : { borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                    <div className="text-3xl">{m.icon}</div>
                    <div>
                      <div className="text-[11px] font-bold" style={{ color: model === m.id ? m.color : "rgba(255,255,255,0.55)" }}>{m.label}</div>
                      <div className="text-[9px] text-white/25">{m.badge}</div>
                    </div>
                    {model === m.id && (
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: m.color }} />
                        <span className="text-[8px] font-bold" style={{ color: m.color }}>ACTIVE</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-pink-500/20 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <FiPlay className="w-6 h-6 text-primary/60 ml-0.5" />
              </div>
              <h3 className="text-[15px] font-bold text-white/60 mb-1.5">Ready to generate</h3>
              <p className="text-[11px] text-white/25 leading-relaxed">
                Describe a scene, choose a style, pick your AI engine and hit <span className="text-primary/60 font-semibold">Generate Video</span>.
              </p>
              <p className="text-[9px] text-white/15 mt-3">Powered by Gyan Create · Gyan Video</p>
            </div>
          )}

          {/* GENERATING */}
          {generating && (
            <div className="text-center px-8">
              {/* Animated waveform */}
              <div className="flex gap-1.5 justify-center items-end mb-6">
                {[4, 6, 5, 8, 6, 5, 7, 4, 6, 8, 5, 7].map((h, k) => (
                  <div key={k} className="w-1.5 rounded-full animate-pulse"
                    style={{
                      height: h * 7 + "px",
                      background: `linear-gradient(180deg, ${selectedModel.color}, ${selectedModel.color}55)`,
                      opacity: 0.7,
                      animationDelay: k * 0.07 + "s",
                    }} />
                ))}
              </div>

              <div className="flex items-center justify-center gap-2.5 mb-3">
                <span className="text-2xl">{selectedModel.icon}</span>
                <div>
                  <div className="text-[15px] font-bold" style={{ color: selectedModel.color }}>{selectedModel.label}</div>
                  <div className="text-[10px] text-white/30">{selectedModel.desc}</div>
                </div>
              </div>

              <p className="text-[12px] text-white/45 mb-1">Generating your video…</p>
              <p className="text-[10px] text-white/25">{preset} · {duration}s · {ratio}</p>

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-1.5 mt-5">
                {[0,1,2,3,4].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ background: selectedModel.color, animationDelay: i * 0.15 + "s", opacity: 0.7 }} />
                ))}
              </div>
              <p className="text-[9px] text-white/15 mt-3">Video generation may take 30–90 seconds</p>
            </div>
          )}

          {/* ERROR */}
          {error && !generating && (
            <div className="text-center px-8 max-w-xs">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                <FiAlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-[14px] font-bold text-white/70 mb-1">Generation Failed</h3>
              <p className="text-[11px] text-white/35 leading-relaxed mb-4">{error}</p>
              <div className="flex gap-2 justify-center">
                <button onClick={() => generate()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/15 border border-primary/30 text-primary text-[12px] font-semibold hover:bg-primary/25 transition-all">
                  <FiRefreshCw className="w-3.5 h-3.5" /> Try Again
                </button>
                <button onClick={reset}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.09] text-white/40 hover:text-white text-[12px] transition-all">
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* RESULT — single clean video player */}
          {result && !generating && (
            <>
              {!loadFailed ? (
                <video
                  key={result.url}
                  src={result.url}
                  controls
                  loop
                  autoPlay
                  muted
                  playsInline
                  onError={() => setLoadFailed(true)}
                  className="max-h-full max-w-full rounded-xl object-contain shadow-[0_0_40px_rgba(0,0,0,0.6)]"
                  style={{ aspectRatio: ratio === "9:16" ? "9/16" : ratio === "1:1" ? "1/1" : "16/9" }}
                />
              ) : (
                /* Load failed fallback */
                <div className="text-center px-8 max-w-xs">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                    <FiFilm className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="text-[14px] font-bold text-white/70 mb-1">Still Processing</h3>
                  <p className="text-[11px] text-white/35 leading-relaxed mb-4">
                    The video is being rendered. Try again in a moment or open the direct link.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => { setLoadFailed(false); }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/15 border border-primary/30 text-primary text-[12px] font-semibold hover:bg-primary/25 transition-all">
                      <FiRefreshCw className="w-3.5 h-3.5" /> Reload
                    </button>
                    <a href={result.url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.09] text-white/50 hover:text-white text-[12px] transition-all">
                      <FiExternalLink className="w-3.5 h-3.5" /> Open Link
                    </a>
                  </div>
                </div>
              )}

              {/* Floating toolbar */}
              {!loadFailed && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 rounded-2xl bg-black/75 backdrop-blur-md border border-white/[0.09]">
                  <div className="flex items-center gap-1.5 pr-2 border-r border-white/10">
                    <span className="text-base">{selectedModel.icon}</span>
                    <span className="text-[10px] font-bold" style={{ color: result.color }}>{result.label}</span>
                  </div>
                  <span className="text-[9px] text-white/30 pr-2 border-r border-white/10">{preset} · {duration}s · {ratio}</span>
                  <a href={result.url} download="gyantechnet-video.mp4"
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-semibold transition-all">
                    <FiDownload className="w-3 h-3" /> Save
                  </a>
                  <a href={result.url} target="_blank" rel="noreferrer"
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all">
                    <FiExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <div className="w-px h-4 bg-white/10" />
                  <button onClick={reset} title="New video"
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all">
                    <FiRefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Suggestion chips — idle only */}
        {!result && !generating && !error && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar shrink-0 pb-0.5">
            {TEMPLATES.map(t => (
              <button key={t.title}
                onClick={() => { setPrompt(t.desc); generate(t.desc); }}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.09] bg-white/[0.03] text-white/40 text-[10px] hover:border-primary/30 hover:text-white/70 hover:bg-primary/[0.05] transition-all whitespace-nowrap">
                {t.icon} {t.title}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
