import { useState } from "react";
import {
  FiMonitor, FiPlus, FiChevronLeft, FiChevronRight, FiPlay, FiDownload,
  FiZap, FiRefreshCw, FiX, FiCheck,
} from "react-icons/fi";
import { cn } from "@/lib/utils";

type Slide = {
  id: number;
  title: string;
  subtitle?: string;
  bullets?: string[];
  layout: "cover"|"bullets"|"two-col"|"quote"|"closing";
  gradient: string;
};

const GRADIENTS = [
  "from-violet-700 to-purple-900",
  "from-blue-700 to-indigo-900",
  "from-emerald-700 to-teal-900",
  "from-rose-700 to-pink-900",
  "from-amber-700 to-orange-900",
  "from-cyan-700 to-blue-900",
];

const INITIAL_SLIDES: Slide[] = [
  { id:1, title:"GyanTechNet 2026",          subtitle:"The Future of Intelligent AI",             layout:"cover",   gradient:"from-violet-700 to-purple-900" },
  { id:2, title:"The Problem",                bullets:["Information overload in the AI era","Fragmented tools across platforms","No unified AI workspace for Indian users","Privacy and data security concerns"], layout:"bullets", gradient:"from-blue-700 to-indigo-900" },
  { id:3, title:"Our Solution",               bullets:["50+ AI-powered workspace tools","One platform — chat, create, analyse","GyanAI-powered, India-first design","End-to-end encrypted, 99.9% uptime"], layout:"bullets", gradient:"from-emerald-700 to-teal-900" },
  { id:4, title:"Market Opportunity",         subtitle:"India's AI market is expected to reach $17B by 2027, with 600M+ internet users actively seeking AI tools.", layout:"quote", gradient:"from-amber-700 to-orange-900" },
  { id:5, title:"Thank You",                  subtitle:"Start your AI journey today at gyantechnet.com", layout:"closing", gradient:"from-violet-700 to-blue-900" },
];

const TEMPLATES = [
  { name:"Pitch Deck",     emoji:"🚀", slides:["Cover","Problem","Solution","Market","Team","Traction","Roadmap","Ask","Thank You"] },
  { name:"Product Demo",   emoji:"🎯", slides:["Cover","Overview","Features","Demo","Pricing","CTA"] },
  { name:"Business Plan",  emoji:"📊", slides:["Executive Summary","Market Analysis","Product/Service","Strategy","Financials","Team"] },
  { name:"Report",         emoji:"📈", slides:["Cover","Executive Summary","Key Findings","Analysis","Recommendations","Appendix"] },
];

function SlidePreview({ slide, small = false }: { slide: Slide; small?: boolean }) {
  const textScale = small ? "scale-[0.22] origin-top-left" : "";
  const previewSize = small ? "w-full aspect-video overflow-hidden" : "w-full aspect-video";

  if (small) {
    return (
      <div className={cn("relative rounded-lg overflow-hidden aspect-video bg-gradient-to-br", slide.gradient)}>
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 p-3 flex flex-col justify-center items-center text-center">
          <div className="text-white font-black text-[8px] leading-tight mb-1 truncate w-full">{slide.title}</div>
          {slide.subtitle && <div className="text-white/60 text-[6px] leading-tight line-clamp-2">{slide.subtitle}</div>}
          {slide.bullets && slide.bullets.slice(0,3).map((b,i) => (
            <div key={i} className="text-white/50 text-[5.5px] text-left w-full pl-1.5 mt-0.5 truncate">• {b}</div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative rounded-2xl overflow-hidden aspect-video bg-gradient-to-br flex flex-col", slide.gradient)}>
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center p-12 text-center">
        {slide.layout === "cover" && (
          <>
            <div className="text-white font-black text-[42px] sm:text-[52px] leading-tight mb-3 drop-shadow-lg">{slide.title}</div>
            {slide.subtitle && <div className="text-white/80 text-[18px] sm:text-[22px] max-w-lg">{slide.subtitle}</div>}
          </>
        )}
        {slide.layout === "bullets" && (
          <div className="text-left w-full max-w-2xl">
            <div className="text-white font-black text-[32px] sm:text-[40px] mb-6">{slide.title}</div>
            <ul className="space-y-3">
              {slide.bullets?.map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-[12px] shrink-0 mt-0.5">{i+1}</span>
                  <span className="text-white/90 text-[16px] sm:text-[18px]">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {slide.layout === "quote" && (
          <>
            <div className="text-white font-black text-[32px] sm:text-[40px] mb-6">{slide.title}</div>
            <div className="text-[18px] sm:text-[22px] text-white/80 italic max-w-2xl text-center leading-relaxed">"{slide.subtitle}"</div>
          </>
        )}
        {slide.layout === "closing" && (
          <div className="text-center">
            <div className="text-[60px] mb-4">🙏</div>
            <div className="text-white font-black text-[42px] sm:text-[52px] mb-4">{slide.title}</div>
            {slide.subtitle && <div className="text-white/70 text-[18px] sm:text-[22px]">{slide.subtitle}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SlidesPage() {
  const [slides, setSlides]     = useState<Slide[]>(INITIAL_SLIDES);
  const [active, setActive]     = useState(1);
  const [presenting, setPresenting] = useState(false);
  const [showAI, setShowAI]     = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const activeSlide = slides.find(s => s.id === active) || slides[0];

  const generateSlides = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          messages:[{ role:"user", content:`Create a slide deck for: "${aiPrompt}". Return ONLY a JSON array of slides, each with: {"title": "...", "subtitle": "...", "bullets": ["..."], "layout": "cover|bullets|quote|closing"}. First slide should be "cover" layout. Last should be "closing". Others should be "bullets" or "quote". Create 5-7 slides. No extra text.` }],
          mode:"Business", model:"openai/gpt-4o-mini",
        }),
      });
      const data = await res.json();
      const parsed = JSON.parse(data.content || "[]");
      const newSlides: Slide[] = parsed.map((s: Partial<Slide>, i: number) => ({
        id: i + 1,
        title: s.title || `Slide ${i+1}`,
        subtitle: s.subtitle,
        bullets: s.bullets,
        layout: (s.layout as Slide["layout"]) || "bullets",
        gradient: GRADIENTS[i % GRADIENTS.length],
      }));
      if (newSlides.length > 0) { setSlides(newSlides); setActive(1); setShowAI(false); setAiPrompt(""); }
    } catch { /* ignore */ }
    setAiLoading(false);
  };

  const applyTemplate = (template: typeof TEMPLATES[0]) => {
    const newSlides: Slide[] = template.slides.map((title, i) => ({
      id: i + 1, title,
      layout: i === 0 ? "cover" : i === template.slides.length - 1 ? "closing" : "bullets",
      gradient: GRADIENTS[i % GRADIENTS.length],
      bullets: i > 0 && i < template.slides.length - 1 ? ["Point 1 — Add your content here","Point 2 — Key details and data","Point 3 — Supporting evidence"] : undefined,
    }));
    setSlides(newSlides); setActive(1); setShowTemplates(false);
  };

  const addSlide = () => {
    const id = Math.max(...slides.map(s => s.id)) + 1;
    const newSlide: Slide = { id, title:"New Slide", bullets:["Add your content here"], layout:"bullets", gradient: GRADIENTS[id % GRADIENTS.length] };
    setSlides(p => [...p, newSlide]);
    setActive(id);
  };

  const deleteSlide = (id: number) => {
    if (slides.length <= 1) return;
    setSlides(p => p.filter(s => s.id !== id));
    if (active === id) setActive(slides[0].id);
  };

  if (presenting) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center" onClick={() => setPresenting(false)}>
        <div className="w-full max-w-5xl px-8">
          <SlidePreview slide={activeSlide} />
        </div>
        <div className="flex items-center gap-4 mt-6">
          <button onClick={e => { e.stopPropagation(); const idx = slides.findIndex(s => s.id === active); if (idx > 0) setActive(slides[idx-1].id); }}
            className="p-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all">
            <FiChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-white/50 text-sm">{slides.findIndex(s => s.id === active)+1} / {slides.length}</span>
          <button onClick={e => { e.stopPropagation(); const idx = slides.findIndex(s => s.id === active); if (idx < slides.length-1) setActive(slides[idx+1].id); }}
            className="p-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all">
            <FiChevronRight className="w-5 h-5" />
          </button>
          <button onClick={() => setPresenting(false)} className="p-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all ml-4">
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <div className="text-white/20 text-xs mt-3">Click anywhere to exit · Use arrows to navigate</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#06060f] overflow-hidden">
      {/* Toolbar */}
      <div className="h-12 border-b border-white/[0.06] bg-[#08081a] flex items-center gap-2 px-3 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center">
          <FiMonitor className="w-3.5 h-3.5 text-violet-400" />
        </div>
        <span className="text-white font-semibold text-[13px] flex-1">GyanSlides — {slides.length} slides</span>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setShowTemplates(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/[0.08] text-white/45 text-[11px] hover:text-white hover:border-white/[0.15] bg-white/[0.03] transition-all">
            Templates
          </button>
          <button onClick={() => setShowAI(v => !v)}
            className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] transition-all",
              showAI ? "bg-violet-500/15 text-violet-300 border-violet-500/25" : "border-white/[0.08] text-white/45 hover:text-white bg-white/[0.03]")}>
            <FiZap className="w-3 h-3" /> AI Generate
          </button>
          <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/[0.08] text-white/45 text-[11px] hover:text-white bg-white/[0.03] transition-all">
            <FiDownload className="w-3 h-3" /> Export
          </button>
          <button onClick={() => setPresenting(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary text-white text-[11px] font-bold hover:bg-primary/90 transition-all">
            <FiPlay className="w-3 h-3" /> Present
          </button>
        </div>
      </div>

      {/* AI input */}
      {showAI && (
        <div className="px-3 py-2.5 border-b border-white/[0.06] bg-violet-500/[0.04] shrink-0">
          <div className="flex items-center gap-2">
            <FiZap className="w-4 h-4 text-violet-400 shrink-0" />
            <input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") generateSlides(); }}
              placeholder="Describe your presentation topic (e.g. 'AI trends in 2026 for Indian startups')..."
              className="flex-1 bg-transparent text-white text-[13px] outline-none placeholder:text-white/25" />
            <button onClick={generateSlides} disabled={aiLoading || !aiPrompt.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600/20 text-violet-300 text-[12px] font-bold hover:bg-violet-600/30 disabled:opacity-30 border border-violet-500/20 transition-all">
              {aiLoading ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FiZap className="w-3.5 h-3.5" />}
              {aiLoading ? "Generating…" : "Generate"}
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Slide thumbnails */}
        <div className="w-44 border-r border-white/[0.06] bg-[#06060f] overflow-y-auto no-scrollbar p-2.5 shrink-0">
          {slides.map((s, i) => (
            <div key={s.id} onClick={() => setActive(s.id)}
              className={cn("flex items-start gap-2 mb-2 cursor-pointer group", active === s.id && "opacity-100")}>
              <span className="text-[10px] text-white/25 pt-1 w-4 text-right shrink-0">{i+1}</span>
              <div className={cn("flex-1 rounded-xl overflow-hidden ring-1 transition-all",
                active === s.id ? "ring-primary shadow-[0_0_8px_rgba(124,58,237,0.4)]" : "ring-white/[0.08] group-hover:ring-white/[0.2]")}>
                <SlidePreview slide={s} small />
              </div>
            </div>
          ))}
          <button onClick={addSlide}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-white/[0.12] text-white/25 hover:text-white/50 hover:border-white/[0.25] transition-all text-[11px] mt-2">
            <FiPlus className="w-3 h-3" /> Add Slide
          </button>
        </div>

        {/* Main canvas */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#030308]">
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-3xl">
              <SlidePreview slide={activeSlide} />
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/[0.05] shrink-0">
            <div className="flex items-center gap-2">
              <button onClick={() => { const idx = slides.findIndex(s => s.id === active); if (idx > 0) setActive(slides[idx-1].id); }}
                disabled={slides.findIndex(s => s.id === active) === 0}
                className="p-1.5 rounded-lg text-white/30 hover:text-white bg-white/[0.04] border border-white/[0.06] disabled:opacity-20 transition-all">
                <FiChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-white/35 text-[11px] font-medium min-w-[60px] text-center">
                {slides.findIndex(s => s.id === active)+1} / {slides.length}
              </span>
              <button onClick={() => { const idx = slides.findIndex(s => s.id === active); if (idx < slides.length-1) setActive(slides[idx+1].id); }}
                disabled={slides.findIndex(s => s.id === active) === slides.length-1}
                className="p-1.5 rounded-lg text-white/30 hover:text-white bg-white/[0.04] border border-white/[0.06] disabled:opacity-20 transition-all">
                <FiChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <button onClick={() => deleteSlide(active)} disabled={slides.length <= 1}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white/25 hover:text-red-400 text-[11px] disabled:opacity-20 transition-all">
              <FiX className="w-3 h-3" /> Delete Slide
            </button>
          </div>
        </div>
      </div>

      {/* Templates modal */}
      {showTemplates && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowTemplates(false)}>
          <div className="w-full max-w-lg bg-[#0d0d1e] border border-white/[0.1] rounded-2xl p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-[15px]">Slide Templates</h3>
              <button onClick={() => setShowTemplates(false)} className="p-1 text-white/30 hover:text-white"><FiX className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {TEMPLATES.map(t => (
                <button key={t.name} onClick={() => applyTemplate(t)}
                  className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-violet-500/30 hover:bg-violet-500/[0.04] transition-all text-center">
                  <span className="text-3xl">{t.emoji}</span>
                  <div>
                    <div className="text-white font-bold text-[13px]">{t.name}</div>
                    <div className="text-white/35 text-[10px] mt-0.5">{t.slides.length} slides</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
