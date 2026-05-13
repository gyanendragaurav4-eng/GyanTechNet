import { useState } from "react";
import { FiImage, FiUpload, FiDownload, FiZap, FiLoader, FiAlertCircle, FiExternalLink, FiRefreshCw } from "react-icons/fi";
import { cn } from "@/lib/utils";

const PRESETS = [
  { name: "Photo",       emoji: "📸" },
  { name: "Anime",       emoji: "✨" },
  { name: "Oil Paint",   emoji: "🎨" },
  { name: "Cinematic",   emoji: "🎬" },
  { name: "Concept Art", emoji: "🖌️" },
  { name: "Neon Cyber",  emoji: "💜" },
  { name: "Watercolor",  emoji: "🌊" },
  { name: "Pixel Art",   emoji: "👾" },
];

const RATIOS    = ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9"];
const QUALITIES = ["Draft", "Normal", "HD", "Ultra", "Vision-Pro"];

const SUGGESTIONS = [
  "A neon-lit Tokyo street at night",
  "An astronaut on Mars at sunset",
  "A majestic dragon over a misty mountain",
  "A futuristic city floating above the clouds",
  "A cyberpunk marketplace with holograms",
];

type ImgState = "idle" | "loading" | "loaded" | "error";

export default function ImageAIPage() {
  const [prompt, setPrompt]       = useState("");
  const [negPrompt, setNegPrompt] = useState("");
  const [preset, setPreset]       = useState("Cinematic");
  const [ratio, setRatio]         = useState("1:1");
  const [quality, setQuality]     = useState("HD");
  const [generating, setGenerating] = useState(false);
  const [imageUrl, setImageUrl]   = useState<string | null>(null);
  const [apiError, setApiError]   = useState<string | null>(null);
  const [imgState, setImgState]   = useState<ImgState>("idle");

  const generate = async (promptOverride?: string) => {
    const p = (promptOverride ?? prompt).trim();
    if (!p || generating) return;
    setGenerating(true);
    setApiError(null);
    setImageUrl(null);
    setImgState("idle");
    try {
      const r = await fetch("/api/generate-image-single", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: p, ratio, quality, preset }),
      });
      const d = await r.json();
      if (d.error) { setApiError(d.error); }
      else { setImageUrl(d.url); setImgState("loading"); }
    } catch {
      setApiError("Failed to connect to the image generation service.");
    }
    setGenerating(false);
  };

  const fetchBlob = async (src: string): Promise<Blob | null> => {
    try { return await (await fetch(src)).blob(); }
    catch { return null; }
  };

  const slug = () =>
    `gyantechnet-image-${Date.now()}`;

  const downloadJpg = async () => {
    if (!imageUrl) return;
    const blob = await fetchBlob(imageUrl);
    if (!blob) return;
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob), download: `${slug()}.jpg`,
    });
    a.click(); URL.revokeObjectURL(a.href);
  };

  const downloadPng = async () => {
    if (!imageUrl) return;
    const blob = await fetchBlob(imageUrl);
    if (!blob) return;
    const bmp = await createImageBitmap(blob);
    const canvas = document.createElement("canvas");
    canvas.width = bmp.width; canvas.height = bmp.height;
    canvas.getContext("2d")!.drawImage(bmp, 0, 0);
    canvas.toBlob(pb => {
      if (!pb) return;
      const a = Object.assign(document.createElement("a"), {
        href: URL.createObjectURL(pb), download: `${slug()}.png`,
      });
      a.click(); URL.revokeObjectURL(a.href);
    }, "image/png");
  };

  const reset = () => { setImageUrl(null); setApiError(null); setImgState("idle"); };

  return (
    <div className="flex h-full bg-[#06060f] overflow-hidden">

      {/* ── Left sidebar ── */}
      <div className="hidden sm:flex w-[260px] shrink-0 border-r border-white/[0.05] bg-[#08081a] flex-col overflow-hidden">

        {/* Header */}
        <div className="px-4 py-3.5 border-b border-white/[0.05] flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center">
            <FiImage className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h2 className="text-[13px] font-bold text-white">Image Studio</h2>
            <p className="text-[10px] text-white/35">AI-powered generation</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-4">

          {/* Prompt */}
          <div>
            <label className="block text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1.5">Prompt</label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generate(); }}
              placeholder="Describe what you want to see..."
              className="w-full bg-[#06060f] border border-white/[0.08] rounded-xl p-3 min-h-[90px] resize-none text-[12px] text-white placeholder:text-white/18 outline-none focus:border-primary/40 transition-all no-scrollbar leading-relaxed"
            />
          </div>

          {/* Negative prompt */}
          <div>
            <label className="block text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1.5">Negative Prompt</label>
            <textarea
              value={negPrompt}
              onChange={e => setNegPrompt(e.target.value)}
              placeholder="What to avoid..."
              className="w-full bg-[#06060f] border border-white/[0.08] rounded-xl p-3 min-h-[50px] resize-none text-[12px] text-white placeholder:text-white/18 outline-none focus:border-primary/40 transition-all no-scrollbar"
            />
          </div>

          {/* Reference image upload */}
          <div>
            <label className="block text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1.5">Reference Image</label>
            <div className="border border-dashed border-white/[0.10] rounded-xl p-3 flex flex-col items-center gap-1 cursor-pointer hover:border-primary/30 hover:bg-primary/[0.03] transition-all">
              <FiUpload className="w-4 h-4 text-white/25" />
              <span className="text-[10px] text-white/25">Optional · drag & drop</span>
            </div>
          </div>

          {/* Style Preset */}
          <div>
            <label className="block text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1.5">Style Preset</label>
            <div className="grid grid-cols-4 gap-1.5">
              {PRESETS.map(p => (
                <button key={p.name} onClick={() => setPreset(p.name)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-xl border text-[9px] font-medium transition-all",
                    preset === p.name
                      ? "border-primary/50 bg-primary/[0.12] text-primary"
                      : "border-white/[0.07] text-white/40 hover:border-white/15 hover:text-white/70"
                  )}>
                  <span className="text-base leading-none">{p.emoji}</span>
                  <span className="truncate w-full text-center">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="block text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1.5">Aspect Ratio</label>
            <div className="grid grid-cols-3 gap-1.5">
              {RATIOS.map(r => (
                <button key={r} onClick={() => setRatio(r)}
                  className={cn(
                    "py-1.5 rounded-lg text-[11px] font-bold transition-all border text-center",
                    ratio === r
                      ? "bg-primary/15 border-primary/40 text-primary"
                      : "border-white/[0.07] text-white/40 hover:border-white/15"
                  )}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Quality */}
          <div>
            <label className="block text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1.5">Quality</label>
            <div className="flex flex-wrap gap-1.5">
              {QUALITIES.map(q => (
                <button key={q} onClick={() => setQuality(q)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border",
                    quality === q
                      ? "bg-primary/15 border-primary/40 text-primary"
                      : "border-white/[0.07] text-white/40 hover:border-white/15 hover:text-white/60"
                  )}>
                  {q}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Generate button */}
        <div className="p-3 border-t border-white/[0.05] shrink-0">
          <button
            onClick={() => generate()}
            disabled={!prompt.trim() || generating}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-primary to-pink-500 text-white text-[13px] font-semibold rounded-xl disabled:opacity-40 transition-all hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] active:scale-[0.98] disabled:cursor-not-allowed">
            {generating
              ? <FiLoader className="w-4 h-4 animate-spin" />
              : <FiZap className="w-4 h-4" />}
            {generating ? "Generating…" : "Generate Image"}
          </button>
          <p className="text-center text-[9px] text-white/20 mt-1.5">{quality} · {ratio} · {preset}</p>
        </div>
      </div>

      {/* ── Right canvas ── */}
      <div className="flex-1 flex flex-col p-4 gap-3 overflow-hidden bg-[#06060f]">

        {/* Mobile bar */}
        <div className="sm:hidden flex gap-2 items-start">
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            rows={2}
            placeholder="Describe your image…"
            className="flex-1 bg-white/[0.04] border border-white/[0.09] rounded-xl px-3 py-2.5 text-[13px] text-white placeholder:text-white/25 outline-none focus:border-primary/50 resize-none transition-all"
          />
          <button
            onClick={() => generate()}
            disabled={!prompt.trim() || generating}
            className="shrink-0 flex items-center gap-1 px-3 py-2.5 bg-gradient-to-r from-primary to-pink-500 text-white text-[12px] font-semibold rounded-xl disabled:opacity-50 active:scale-[0.97] transition-all">
            {generating ? <FiLoader className="w-3.5 h-3.5 animate-spin" /> : <FiZap className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* ── Main canvas ── */}
        <div className="flex-1 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0d0d1e] relative flex flex-col items-center justify-center">

          {/* IDLE */}
          {!generating && !imageUrl && !apiError && (
            <div className="text-center px-8 max-w-xs">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-pink-500/20 border border-primary/20 flex items-center justify-center mx-auto mb-5">
                <FiImage className="w-7 h-7 text-primary/50" />
              </div>
              <h3 className="text-[15px] font-bold text-white/50 mb-2">Ready to create</h3>
              <p className="text-[11px] text-white/25 leading-relaxed">
                Write a prompt, pick your style and aspect ratio, then hit <span className="text-primary/60 font-semibold">Generate Image</span>.
              </p>
            </div>
          )}

          {/* GENERATING */}
          {generating && (
            <div className="text-center px-8">
              <div className="flex gap-1.5 justify-center items-end mb-6">
                {[4, 6, 5, 8, 6, 5, 7, 4, 6].map((h, k) => (
                  <div key={k} className="w-1.5 rounded-full animate-pulse bg-primary"
                    style={{ height: h * 7 + "px", opacity: 0.55, animationDelay: k * 0.08 + "s" }} />
                ))}
              </div>
              <p className="text-[15px] font-semibold text-white/60 mb-1">Creating your image…</p>
              <p className="text-[11px] text-white/30 mb-1">{quality} · {preset} · {ratio}</p>
              <p className="text-[9px] text-white/18 mt-3">This can take 10–30 seconds</p>
            </div>
          )}

          {/* ERROR */}
          {apiError && !generating && (
            <div className="text-center px-8 max-w-xs">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                <FiAlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-[14px] font-bold text-white/70 mb-1">Generation Failed</h3>
              <p className="text-[11px] text-white/35 leading-relaxed mb-4">{apiError}</p>
              <button onClick={() => generate()}
                className="px-4 py-2 rounded-xl bg-primary/15 border border-primary/30 text-primary text-[12px] font-semibold hover:bg-primary/25 transition-all">
                Try Again
              </button>
            </div>
          )}

          {/* RESULT */}
          {imageUrl && !generating && (
            <>
              {/* Skeleton while image loads from Pollinations */}
              {imgState === "loading" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0d0d1e] z-20">
                  <div className="flex gap-1.5 items-end">
                    {[3, 5, 4, 7, 5, 4, 6, 3, 5].map((h, k) => (
                      <div key={k} className="w-1.5 rounded-full animate-pulse bg-primary"
                        style={{ height: h * 7 + "px", opacity: 0.4, animationDelay: k * 0.09 + "s" }} />
                    ))}
                  </div>
                  <p className="text-[11px] text-white/30">Loading image…</p>
                </div>
              )}

              {/* Image load error */}
              {imgState === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0d0d1e] z-20">
                  <FiAlertCircle className="w-8 h-8 text-red-400/60" />
                  <p className="text-[12px] text-white/40 text-center max-w-[200px]">
                    Image failed to load — try generating again
                  </p>
                  <button
                    onClick={() => generate()}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 text-white/50 hover:text-white/80 text-[11px] transition-all">
                    <FiRefreshCw className="w-3 h-3" /> Retry
                  </button>
                </div>
              )}

              {/* The actual image */}
              <img
                key={imageUrl}
                src={imageUrl}
                alt="Generated"
                crossOrigin="anonymous"
                className="max-h-full max-w-full object-contain rounded-xl"
                style={{ opacity: imgState === "loaded" ? 1 : 0, transition: "opacity 0.5s ease" }}
                onLoad={() => setImgState("loaded")}
                onError={() => setImgState("error")}
              />

              {/* Floating toolbar — visible once loaded */}
              {imgState === "loaded" && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 rounded-2xl bg-black/70 backdrop-blur border border-white/10">
                  <button onClick={downloadJpg}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-semibold transition-all">
                    <FiDownload className="w-3 h-3" /> JPG
                  </button>
                  <button onClick={downloadPng}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-semibold transition-all">
                    <FiDownload className="w-3 h-3" /> PNG
                  </button>
                  <a href={imageUrl} target="_blank" rel="noreferrer"
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all">
                    <FiExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <div className="w-px h-4 bg-white/10" />
                  <button onClick={reset}
                    title="New image"
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all">
                    <FiRefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Suggestion chips — only when idle */}
        {!imageUrl && !generating && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar shrink-0 pb-0.5">
            {SUGGESTIONS.map(s => (
              <button key={s}
                onClick={() => { setPrompt(s); generate(s); }}
                className="shrink-0 px-3 py-1.5 rounded-full border border-white/[0.09] bg-white/[0.03] text-white/40 text-[10px] hover:border-primary/30 hover:text-white/70 hover:bg-primary/[0.05] transition-all whitespace-nowrap">
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
