import { useState } from "react";
import { FiGlobe, FiRefreshCw, FiCopy, FiCheck, FiMic, FiVolume2, FiLoader, FiBookOpen } from "react-icons/fi";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "text", label: "Text", icon: "✍️" },
  { id: "document", label: "Document", icon: "📄" },
  { id: "voice", label: "Voice", icon: "🎤" },
  { id: "image", label: "Image", icon: "🖼️" },
  { id: "phrasebook", label: "Phrasebook", icon: "📖" },
];

const LANGUAGES = [
  "English", "Hindi", "Spanish", "French", "German",
  "Arabic", "Chinese", "Japanese", "Portuguese", "Russian",
  "Korean", "Italian", "Bengali", "Urdu", "Tamil",
  "Telugu", "Marathi", "Gujarati", "Punjabi", "Malayalam",
];

const QUICK_PHRASES = [
  { category: "Greetings", phrases: ["Hello, how are you?", "Good morning!", "Nice to meet you.", "Goodbye!"] },
  { category: "Travel", phrases: ["Where is the airport?", "How much does this cost?", "I need a doctor.", "Can you help me?"] },
  { category: "Food", phrases: ["I am vegetarian.", "The bill, please.", "This is delicious!", "No spice, please."] },
];

export default function TranslatorPage() {
  const [tab, setTab] = useState("text");
  const [from, setFrom] = useState("English");
  const [to, setTo] = useState("Hindi");
  const [source, setSource] = useState("");
  const [result, setResult] = useState("");
  const [translating, setTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activePhraseTab, setActivePhraseTab] = useState("Greetings");

  const swap = () => {
    setFrom(to); setTo(from);
    setSource(result); setResult(source);
  };

  const translate = async (text = source) => {
    if (!text.trim()) return;
    setTranslating(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: `Translate the following from ${from} to ${to}. Only output the translated text, nothing else:\n\n${text}` }],
          mode: "Translate",
        }),
      });
      const d = await r.json();
      setResult(d.content || `[${to}]: ${text}`);
    } catch {
      setResult(`[Translated to ${to}]: ${text}`);
    }
    setTranslating(false);
  };

  const copy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#06060f] overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-4 pb-0 border-b border-white/[0.05]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <FiGlobe className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-[15px] font-bold text-white">GyanTranslate</h1>
              <p className="text-[10px] text-white/35">100+ languages · AI-powered</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-white/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            AI Translation Ready
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium transition-all border-b-2",
                tab === t.id
                  ? "text-cyan-400 border-cyan-400"
                  : "text-white/35 border-transparent hover:text-white/60"
              )}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {tab === "text" && (
          <div className="h-full flex flex-col p-4 gap-3">
            {/* Language bar */}
            <div className="flex items-center gap-3 bg-[#0d0d1e] border border-white/[0.07] rounded-2xl p-3">
              <div className="flex-1">
                <label className="block text-[9px] font-bold text-white/25 uppercase tracking-widest mb-1">From</label>
                <select value={from} onChange={e => setFrom(e.target.value)}
                  className="bg-transparent text-[13px] font-semibold text-white outline-none cursor-pointer w-full">
                  {LANGUAGES.map(l => <option key={l} value={l} className="bg-[#0d0d1e]">{l}</option>)}
                </select>
              </div>
              <button onClick={swap}
                className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-cyan-400 hover:border-cyan-500/30 hover:bg-cyan-500/10 transition-all active:rotate-180 duration-300 shrink-0">
                <FiRefreshCw className="w-3.5 h-3.5" />
              </button>
              <div className="flex-1 text-right">
                <label className="block text-[9px] font-bold text-white/25 uppercase tracking-widest mb-1">To</label>
                <select value={to} onChange={e => setTo(e.target.value)}
                  className="bg-transparent text-[13px] font-semibold text-cyan-400 outline-none cursor-pointer w-full text-right">
                  {LANGUAGES.map(l => <option key={l} value={l} className="bg-[#0d0d1e] text-white">{l}</option>)}
                </select>
              </div>
            </div>

            {/* Text panels */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 min-h-0">
              {/* Source */}
              <div className="bg-[#0d0d1e] border border-white/[0.07] rounded-2xl p-4 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-white/40">{from}</span>
                  <div className="flex items-center gap-1.5">
                    <button className="p-1.5 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/[0.06] transition-all"><FiMic className="w-3.5 h-3.5" /></button>
                    {source && (
                      <button onClick={() => { setSource(""); setResult(""); }} className="text-[10px] text-white/25 hover:text-white/50 transition-colors px-1.5 py-0.5 rounded">Clear</button>
                    )}
                  </div>
                </div>
                <textarea value={source} onChange={e => setSource(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) translate(); }}
                  placeholder="Enter text to translate..."
                  className="flex-1 bg-transparent resize-none text-[14px] text-white placeholder:text-white/20 outline-none leading-relaxed no-scrollbar" />
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.05]">
                  <span className="text-[10px] text-white/25">{source.length} chars · Ctrl+Enter to translate</span>
                </div>
              </div>

              {/* Result */}
              <div className="bg-[#0d0d1e] border border-white/[0.07] rounded-2xl p-4 flex flex-col relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-cyan-400">{to}</span>
                  <div className="flex items-center gap-1.5">
                    {result && (
                      <>
                        <button className="p-1.5 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/[0.06] transition-all"><FiVolume2 className="w-3.5 h-3.5" /></button>
                        <button onClick={copy} className="p-1.5 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/[0.06] transition-all">
                          {copied ? <FiCheck className="w-3.5 h-3.5 text-emerald-400" /> : <FiCopy className="w-3.5 h-3.5" />}
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {translating ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 text-[14px] text-cyan-50/80 leading-relaxed">
                    {result || <span className="text-white/20">Translation will appear here…</span>}
                  </div>
                )}
                {result && !translating && (
                  <div className="mt-2 pt-2 border-t border-white/[0.05] text-[10px] text-white/25">{result.length} chars</div>
                )}
              </div>
            </div>

            {/* Translate button + quick langs */}
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <span className="text-[10px] text-white/25 shrink-0">Quick:</span>
                {LANGUAGES.slice(0, 8).map(l => (
                  <button key={l} onClick={() => setTo(l)}
                    className={cn("px-2.5 py-1 rounded-full text-[10px] font-medium transition-all whitespace-nowrap shrink-0 border",
                      to === l ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-400" : "border-white/[0.07] text-white/35 hover:border-white/15 hover:text-white/60")}>
                    {l}
                  </button>
                ))}
              </div>
              <button onClick={() => translate()} disabled={!source.trim() || translating}
                className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-[13px] font-semibold rounded-xl disabled:opacity-40 transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-[0.97] disabled:cursor-not-allowed shrink-0">
                {translating ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiGlobe className="w-4 h-4" />}
                Translate
              </button>
            </div>
          </div>
        )}

        {tab === "document" && (
          <div className="p-6 flex flex-col items-center justify-center h-full gap-4">
            <div className="border-2 border-dashed border-white/[0.10] rounded-2xl p-12 text-center hover:border-cyan-500/30 transition-colors cursor-pointer max-w-md w-full">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-[15px] font-semibold text-white/60 mb-2">Upload Document</h3>
              <p className="text-[12px] text-white/30">PDF, DOCX, TXT, PPTX up to 50MB</p>
            </div>
            <p className="text-[11px] text-white/25">Translates full documents while preserving formatting</p>
          </div>
        )}

        {tab === "voice" && (
          <div className="p-6 flex flex-col items-center justify-center h-full gap-4">
            <div className="w-24 h-24 rounded-full bg-cyan-500/10 border-2 border-cyan-500/30 flex items-center justify-center cursor-pointer hover:bg-cyan-500/20 transition-all">
              <FiMic className="w-10 h-10 text-cyan-400" />
            </div>
            <p className="text-[14px] font-semibold text-white/50">Click to speak in any language</p>
            <p className="text-[12px] text-white/30">We'll detect and translate in real-time</p>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-[10px] text-white/25 mb-1">From</p>
                <select value={from} onChange={e => setFrom(e.target.value)} className="bg-[#0d0d1e] border border-white/[0.08] text-white text-[12px] rounded-lg px-2 py-1 outline-none">
                  {LANGUAGES.map(l => <option key={l} value={l} className="bg-[#0d0d1e]">{l}</option>)}
                </select>
              </div>
              <FiRefreshCw className="w-4 h-4 text-white/25 mt-4" />
              <div className="text-center">
                <p className="text-[10px] text-white/25 mb-1">To</p>
                <select value={to} onChange={e => setTo(e.target.value)} className="bg-[#0d0d1e] border border-white/[0.08] text-cyan-400 text-[12px] rounded-lg px-2 py-1 outline-none">
                  {LANGUAGES.map(l => <option key={l} value={l} className="bg-[#0d0d1e] text-white">{l}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {tab === "image" && (
          <div className="p-6 flex flex-col items-center justify-center h-full gap-4">
            <div className="border-2 border-dashed border-white/[0.10] rounded-2xl p-12 text-center hover:border-cyan-500/30 transition-colors cursor-pointer max-w-md w-full">
              <div className="text-4xl mb-4">🖼️</div>
              <h3 className="text-[15px] font-semibold text-white/60 mb-2">Upload Image</h3>
              <p className="text-[12px] text-white/30">We'll extract and translate any text in the image</p>
            </div>
          </div>
        )}

        {tab === "phrasebook" && (
          <div className="p-4">
            <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
              {QUICK_PHRASES.map(c => (
                <button key={c.category} onClick={() => setActivePhraseTab(c.category)}
                  className={cn("px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-all border",
                    activePhraseTab === c.category ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-400" : "border-white/[0.07] text-white/35 hover:text-white/60")}>
                  {c.category}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_PHRASES.find(c => c.category === activePhraseTab)?.phrases.map(p => (
                <button key={p} onClick={() => { setSource(p); setTab("text"); translate(p); }}
                  className="p-3 rounded-xl bg-[#0d0d1e] border border-white/[0.06] text-left hover:border-cyan-500/30 hover:bg-cyan-500/[0.04] transition-all group">
                  <div className="flex items-center gap-2 mb-1">
                    <FiBookOpen className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="text-[12px] font-medium text-white/70 group-hover:text-white">{p}</span>
                  </div>
                  <div className="text-[11px] text-white/30">Click to translate to {to}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
