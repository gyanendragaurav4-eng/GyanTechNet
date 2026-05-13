import { useState, useRef } from "react";
import { FiGrid, FiDownload, FiCopy, FiCheck, FiX } from "react-icons/fi";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";

const QR_TYPES = [
  { id:"URL",   label:"URL",    emoji:"🔗", placeholder:"https://gyantechnet.com" },
  { id:"Text",  label:"Text",   emoji:"📝", placeholder:"Enter any text to encode..." },
  { id:"Email", label:"Email",  emoji:"📧", placeholder:"user@example.com" },
  { id:"Phone", label:"Phone",  emoji:"📞", placeholder:"+91 98765 43210" },
  { id:"WiFi",  label:"Wi-Fi",  emoji:"📶", placeholder:"NetworkName:Password" },
  { id:"vCard", label:"vCard",  emoji:"👤", placeholder:"Name:Phone:Email" },
];

const COLORS = [
  { fg:"#7c3aed", bg:"#0d0d1e", label:"Purple Dark" },
  { fg:"#000000", bg:"#ffffff", label:"Classic B&W" },
  { fg:"#3b82f6", bg:"#0f172a", label:"Ocean Dark" },
  { fg:"#10b981", bg:"#022c22", label:"Emerald Dark" },
  { fg:"#f97316", bg:"#1c0700", label:"Fire Dark" },
  { fg:"#ec4899", bg:"#1a0020", label:"Pink Dark" },
];

const SIZES = [128, 192, 256, 320];

const QR_HISTORY = [
  { type:"URL",   value:"https://gyantechnet.com", date:"Today" },
  { type:"Email", value:"hello@gyan.ai",           date:"Yesterday" },
  { type:"Text",  value:"Hello World",             date:"Oct 25" },
];

export default function QRGeneratorPage() {
  const [qrType, setQrType]     = useState("URL");
  const [value, setValue]       = useState("https://gyantechnet.com");
  const [size, setSize]         = useState(256);
  const [level, setLevel]       = useState<"L"|"M"|"Q"|"H">("H");
  const [colorIdx, setColorIdx] = useState(0);
  const [copied, setCopied]     = useState(false);
  const [tab, setTab]           = useState<"generate"|"history">("generate");
  const svgRef = useRef<SVGSVGElement>(null);

  const { fg, bg } = COLORS[colorIdx];
  const currentType = QR_TYPES.find(t => t.id === qrType)!;

  const copyValue = () => {
    navigator.clipboard.writeText(value).catch(()=>{});
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const downloadSVG = () => {
    const svgEl = document.querySelector("#qr-code-svg");
    if (!svgEl) return;
    const blob = new Blob([svgEl.outerHTML], { type:"image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `qrcode_${qrType.toLowerCase()}.svg`;
    a.click();
  };

  return (
    <div className="h-full overflow-y-auto no-scrollbar bg-[#06060f]">
      <div className="max-w-4xl mx-auto px-4 py-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-primary/20 flex items-center justify-center">
              <FiGrid className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <h1 className="text-white font-black text-[20px]">GyanQR Generator</h1>
              <p className="text-white/35 text-[12px]">Real, scannable, embeddable QR codes</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.07] rounded-xl p-1">
            {(["generate","history"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={cn("px-3 py-1.5 rounded-lg text-[11.5px] font-semibold capitalize transition-all",
                  tab === t ? "bg-white/[0.1] text-white" : "text-white/30 hover:text-white")}>
                {t === "generate" ? "⚡ Generate" : "📋 History"}
              </button>
            ))}
          </div>
        </div>

        {tab === "generate" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Config panel */}
            <div className="lg:col-span-3 space-y-5">
              {/* Type selector */}
              <div className="bg-[#0d0d1e] border border-white/[0.07] rounded-2xl p-4">
                <div className="text-[10px] text-white/25 uppercase font-bold tracking-widest mb-3">QR Type</div>
                <div className="flex flex-wrap gap-2">
                  {QR_TYPES.map(t => (
                    <button key={t.id} onClick={() => { setQrType(t.id); setValue(""); }}
                      className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold border transition-all",
                        qrType === t.id
                          ? "bg-primary/15 border-primary/30 text-primary"
                          : "bg-white/[0.04] border-white/[0.08] text-white/40 hover:text-white hover:border-white/[0.2]")}>
                      <span>{t.emoji}</span> {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content input */}
              <div className="bg-[#0d0d1e] border border-white/[0.07] rounded-2xl p-4">
                <div className="text-[10px] text-white/25 uppercase font-bold tracking-widest mb-2">Content</div>
                <div className="relative">
                  <textarea value={value} onChange={e => setValue(e.target.value)}
                    placeholder={currentType.placeholder}
                    rows={3}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-[13px] outline-none placeholder:text-white/20 focus:border-primary/40 transition-all resize-none" />
                  <button onClick={copyValue}
                    className="absolute top-2 right-2 p-1.5 text-white/20 hover:text-white rounded-lg transition-all">
                    {copied ? <FiCheck className="w-3.5 h-3.5 text-emerald-400" /> : <FiCopy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="bg-[#0d0d1e] border border-white/[0.07] rounded-2xl p-4">
                <div className="text-[10px] text-white/25 uppercase font-bold tracking-widest mb-3">Style Options</div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-[10px] text-white/30 uppercase font-bold tracking-widest block mb-2">Size</label>
                    <div className="flex gap-1.5">
                      {SIZES.map(s => (
                        <button key={s} onClick={() => setSize(s)}
                          className={cn("flex-1 py-1.5 rounded-lg text-[10.5px] font-bold border transition-all",
                            size === s ? "bg-primary/15 border-primary/30 text-primary" : "bg-white/[0.04] border-white/[0.08] text-white/35 hover:text-white")}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-white/30 uppercase font-bold tracking-widest block mb-2">Error Correction</label>
                    <div className="flex gap-1.5">
                      {(["L","M","Q","H"] as const).map(l => (
                        <button key={l} onClick={() => setLevel(l)}
                          className={cn("flex-1 py-1.5 rounded-lg text-[10.5px] font-bold border transition-all",
                            level === l ? "bg-primary/15 border-primary/30 text-primary" : "bg-white/[0.04] border-white/[0.08] text-white/35 hover:text-white")}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-white/30 uppercase font-bold tracking-widest block mb-2">Color Theme</label>
                  <div className="flex gap-2.5 flex-wrap">
                    {COLORS.map((c, i) => (
                      <button key={i} onClick={() => setColorIdx(i)}
                        className={cn("flex flex-col items-center gap-1.5 group", colorIdx === i && "ring-2 ring-primary rounded-xl p-0.5")}>
                        <div className="w-10 h-10 rounded-xl border border-white/[0.15] flex items-center justify-center"
                          style={{ background:c.bg }}>
                          <div className="w-5 h-5 rounded-sm" style={{ background:c.fg }} />
                        </div>
                        <span className="text-[8.5px] text-white/25 group-hover:text-white/50 transition-colors">{c.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* QR preview */}
            <div className="lg:col-span-2">
              <div className="bg-[#0d0d1e] border border-white/[0.07] rounded-2xl p-5 flex flex-col items-center sticky top-4">
                <div className="text-[10px] text-white/25 uppercase font-bold tracking-widest mb-4">Preview</div>

                <div className="rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] mb-4 ring-1 ring-white/[0.07]"
                  style={{ background:bg }}>
                  {value.trim() ? (
                    <QRCodeSVG
                      id="qr-code-svg"
                      value={value}
                      size={size > 256 ? 200 : 180}
                      level={level}
                      fgColor={fg}
                      bgColor={bg}
                      includeMargin={false}
                    />
                  ) : (
                    <div className="w-[180px] h-[180px] flex items-center justify-center text-white/20 text-[12px] text-center">
                      Enter content above to generate
                    </div>
                  )}
                </div>

                <div className="w-full space-y-2">
                  <button onClick={downloadSVG} disabled={!value.trim()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-primary to-violet-600 text-white text-[13px] font-bold disabled:opacity-30 hover:from-primary/90 shadow-[0_4px_12px_rgba(124,58,237,0.3)] transition-all">
                    <FiDownload className="w-4 h-4" /> Download SVG
                  </button>
                  <button onClick={copyValue} disabled={!value.trim()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.04] text-white/50 text-[13px] font-semibold border border-white/[0.07] disabled:opacity-30 hover:text-white hover:border-white/[0.2] transition-all">
                    {copied ? <FiCheck className="w-4 h-4 text-emerald-400" /> : <FiCopy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy Content"}
                  </button>
                </div>

                <div className="mt-4 text-center">
                  <span className="text-[10px] text-white/20">{size}×{size}px · Level {level} · {currentType.emoji} {currentType.label}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "history" && (
          <div className="bg-[#0d0d1e] border border-white/[0.07] rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <span className="text-white font-bold text-[13px]">Recent QR Codes</span>
            </div>
            {QR_HISTORY.map((h, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-all">
                <div className="p-1.5 bg-white rounded-xl shrink-0">
                  <QRCodeSVG value={h.value} size={48} level="L" fgColor="#000000" bgColor="#ffffff" includeMargin={false} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white/80 text-[13px] font-medium truncate">{h.value}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{h.type}</span>
                    <span className="text-white/25 text-[10px]">{h.date}</span>
                  </div>
                </div>
                <button onClick={() => { setValue(h.value); setQrType(h.type); setTab("generate"); }}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.06] text-white/50 text-[11px] font-semibold border border-white/[0.08] hover:text-white hover:border-white/[0.2] transition-all">
                  Reuse
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
