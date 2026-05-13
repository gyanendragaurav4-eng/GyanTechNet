import { useState } from "react";
import { FiCpu, FiZap, FiSettings, FiCheck, FiStar } from "react-icons/fi";
import { cn } from "@/lib/utils";

const PROVIDERS = [
  {
    name:"Gyan Intelligence", color:"#7c3aed", emoji:"⚡",
    models:[
      { id:"gpt-4o",      name:"Gyan AI Pro",         context:"128K", speed:"Medium", quality:"Highest",  badge:"Latest",  price:"Premium" },
      { id:"gpt-4o-mini", name:"Gyan AI Fast",         context:"128K", speed:"Fast",   quality:"High",     badge:"Default", price:"Low" },
      { id:"o3",          name:"Gyan Reason Pro",      context:"200K", speed:"Slow",   quality:"Frontier", badge:"Best",    price:"Premium" },
      { id:"o4-mini",     name:"Gyan Reason Mini",     context:"200K", speed:"Medium", quality:"High",     badge:"New",     price:"Medium" },
    ]
  },
  {
    name:"Gyan Pro Series", color:"#a855f7", emoji:"💎",
    models:[
      { id:"claude-sonnet-4", name:"Gyan Smart 4",    context:"200K", speed:"Fast",   quality:"Very High", badge:"Latest", price:"Medium" },
      { id:"claude-opus-4",   name:"Gyan Ultra 4",    context:"200K", speed:"Medium", quality:"Highest",   badge:"Best",   price:"Premium" },
      { id:"claude-haiku-3",  name:"Gyan Lite 3.5",   context:"200K", speed:"Fastest",quality:"Good",      badge:"Fast",   price:"Low" },
    ]
  },
  {
    name:"Gyan Vision Series", color:"#ec4899", emoji:"👁️",
    models:[
      { id:"gemini-2.5-pro",  name:"Gyan Vision Pro",   context:"1M",  speed:"Medium", quality:"Highest",  badge:"Best",  price:"Medium" },
      { id:"gemini-flash",    name:"Gyan Vision Flash",  context:"1M",  speed:"Fastest",quality:"Good",     badge:"Fast",  price:"Free" },
      { id:"gemini-ultra",    name:"Gyan Vision Ultra",  context:"2M",  speed:"Slow",   quality:"Frontier", badge:"New",   price:"Premium" },
    ]
  },
  {
    name:"Gyan Open Series", color:"#06b6d4", emoji:"🌐",
    models:[
      { id:"llama-4-scout",    name:"Gyan Open Scout",  context:"128K", speed:"Fast",   quality:"High",    badge:"Latest", price:"Free" },
      { id:"llama-4-maverick", name:"Gyan Open Max",    context:"1M",   speed:"Medium", quality:"Highest", badge:"Best",   price:"Free" },
    ]
  },
  {
    name:"Gyan Deep Series", color:"#3b82f6", emoji:"🔬",
    models:[
      { id:"deepseek-v3", name:"Gyan Deep V3",  context:"64K", speed:"Fast",  quality:"High",     badge:"Latest", price:"Low" },
      { id:"deepseek-r2", name:"Gyan Deep R2",  context:"64K", speed:"Medium",quality:"Very High", badge:"New",    price:"Low" },
    ]
  },
];

const BADGE_STYLE: Record<string,string> = {
  Latest:  "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  Default: "bg-primary/15 text-primary border-primary/20",
  Best:    "bg-amber-500/15 text-amber-400 border-amber-500/20",
  Fast:    "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  Beta:    "bg-pink-500/15 text-pink-400 border-pink-500/20",
  New:     "bg-blue-500/15 text-blue-400 border-blue-500/20",
};

const PRICE_STYLE: Record<string,string> = {
  Free:    "text-emerald-400",
  Low:     "text-blue-400",
  Medium:  "text-amber-400",
  Premium: "text-orange-400",
};

export default function IntelligencePage() {
  const [selected, setSelected]     = useState("gpt-4o-mini");
  const [temp, setTemp]             = useState(0.7);
  const [maxTokens, setMaxTokens]   = useState(2048);
  const [topP, setTopP]             = useState(0.95);
  const [systemPrompt, setSystemPrompt] = useState("You are GyanTechNet AI, a helpful, intelligent, and knowledgeable assistant. Respond clearly and concisely. For Indian users, be culturally aware. Support Hindi when requested.");
  const [saved, setSaved]           = useState(false);
  const [providerFilter, setProviderFilter] = useState("All");

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const allModels = PROVIDERS.flatMap(p => p.models.map(m => ({ ...m, provider: p.name, color: p.color })));
  const filteredProviders = providerFilter === "All" ? PROVIDERS : PROVIDERS.filter(p => p.name === providerFilter);

  return (
    <div className="flex h-full overflow-hidden bg-[#06060f]">

      {/* Main panel */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="max-w-5xl mx-auto px-5 py-5">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.4)]">
              <FiCpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-black text-[18px] leading-none">Gyan Intelligence</h1>
              <p className="text-white/35 text-[11px] mt-0.5">Configure AI models, parameters, and system behavior</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Model selection — 2 cols */}
            <div className="lg:col-span-2">
              <div className="bg-[#0d0d1e] border border-white/[0.08] rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <FiZap className="w-4 h-4 text-violet-400" />
                    <h2 className="text-white font-bold text-[14px]">AI Model Selection</h2>
                  </div>
                  {/* Provider filter */}
                  <div className="flex gap-1 overflow-x-auto no-scrollbar">
                    {["All",...PROVIDERS.map(p=>p.name)].map(p => (
                      <button key={p} onClick={() => setProviderFilter(p)}
                        className={cn("shrink-0 px-2.5 py-1 rounded-lg text-[10.5px] font-semibold transition-all",
                          providerFilter === p ? "bg-white/[0.1] text-white" : "text-white/30 hover:text-white")}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 space-y-5">
                  {filteredProviders.map(provider => (
                    <div key={provider.name}>
                      <div className="flex items-center gap-2 mb-2.5">
                        <span className="text-sm">{provider.emoji}</span>
                        <span className="text-white/50 text-[11px] font-bold uppercase tracking-widest">{provider.name}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {provider.models.map(m => (
                          <button key={m.id} onClick={() => setSelected(m.id)}
                            className={cn(
                              "p-3 rounded-xl border text-left transition-all",
                              selected === m.id
                                ? "border-primary/30 bg-primary/[0.08] ring-1 ring-primary/20"
                                : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.14] hover:bg-white/[0.04]"
                            )}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-semibold text-white text-[12.5px]">{m.name}</span>
                              <div className="flex items-center gap-1.5">
                                {m.badge && (
                                  <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full border", BADGE_STYLE[m.badge] || "bg-white/[0.08] text-white/50 border-white/[0.1]")}>
                                    {m.badge}
                                  </span>
                                )}
                                {selected === m.id && (
                                  <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                    <FiCheck className="w-2.5 h-2.5 text-white" />
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-[10px]">
                              <span className="text-white/30">Context: <span className="text-white/60">{m.context}</span></span>
                              <span className="text-white/30">Speed: <span className="text-white/60">{m.speed}</span></span>
                              <span className={cn("font-semibold", PRICE_STYLE[m.price])}>{m.price}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Parameters panel */}
            <div className="space-y-4">
              {/* Selected model info */}
              <div className="bg-[#0d0d1e] border border-white/[0.08] rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FiStar className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-white font-bold text-[12.5px]">Active Model</span>
                </div>
                {(() => {
                  const m = allModels.find(m => m.id === selected);
                  return m ? (
                    <div>
                      <div className="text-white font-bold text-[15px] mb-1">{m.name}</div>
                      <div className="text-white/40 text-[11px] mb-2">{m.provider}</div>
                      <div className="grid grid-cols-2 gap-2">
                        {[["Quality",m.quality],["Speed",m.speed],["Context",m.context],["Price",m.price]].map(([k,v]) => (
                          <div key={k} className="bg-white/[0.04] rounded-lg px-2.5 py-1.5">
                            <div className="text-white/30 text-[9px] uppercase font-bold tracking-widest">{k}</div>
                            <div className="text-white text-[11px] font-semibold mt-0.5">{v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>

              {/* Parameters */}
              <div className="bg-[#0d0d1e] border border-white/[0.08] rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <FiSettings className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-white font-bold text-[12.5px]">Parameters</span>
                </div>

                <div className="space-y-4">
                  {[
                    { label:"Temperature", value:temp, onChange:setTemp, min:0, max:2, step:0.1, hint:"Higher = more creative" },
                    { label:"Top P",       value:topP, onChange:setTopP, min:0, max:1, step:0.05, hint:"Nucleus sampling" },
                  ].map(p => (
                    <div key={p.label}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-white/50 text-[11px] font-semibold">{p.label}</span>
                        <span className="text-primary text-[11px] font-bold">{p.value.toFixed(2)}</span>
                      </div>
                      <input type="range" min={p.min} max={p.max} step={p.step} value={p.value}
                        onChange={e => p.onChange(parseFloat(e.target.value))}
                        className="w-full accent-primary h-1.5 rounded-full cursor-pointer" />
                      <div className="text-white/20 text-[9px] mt-1">{p.hint}</div>
                    </div>
                  ))}

                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-white/50 text-[11px] font-semibold">Max Tokens</span>
                      <span className="text-primary text-[11px] font-bold">{maxTokens.toLocaleString()}</span>
                    </div>
                    <input type="range" min={256} max={8192} step={256} value={maxTokens}
                      onChange={e => setMaxTokens(parseInt(e.target.value))}
                      className="w-full accent-primary h-1.5 rounded-full cursor-pointer" />
                    <div className="flex justify-between text-white/20 text-[9px] mt-1">
                      <span>256</span><span>8192</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* System prompt */}
              <div className="bg-[#0d0d1e] border border-white/[0.08] rounded-2xl p-4">
                <div className="text-white font-bold text-[12.5px] mb-3">System Prompt</div>
                <textarea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)}
                  rows={5}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white/75 text-[12px] outline-none placeholder:text-white/20 focus:border-primary/40 transition-all resize-none leading-relaxed" />
              </div>

              <button onClick={save}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[13px] transition-all",
                  saved
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                    : "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-[0_4px_12px_rgba(124,58,237,0.3)] hover:from-violet-500 hover:to-blue-500"
                )}>
                {saved ? <><FiCheck className="w-4 h-4" /> Saved!</> : <><FiSettings className="w-4 h-4" /> Save Configuration</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
