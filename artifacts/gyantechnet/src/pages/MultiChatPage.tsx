import { useState, useRef, useEffect, useCallback } from "react";
import { FiPlus, FiX, FiSend, FiZap, FiCopy, FiRefreshCw, FiMaximize2, FiMinimize2, FiLink } from "react-icons/fi";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string; loading?: boolean; error?: boolean };

const MODELS = [
  { id:"openai/gpt-4o-mini",                    label:"Gyan AI Fast",    color:"#7c3aed", emoji:"⚡" },
  { id:"openai/gpt-4o",                          label:"Gyan AI Pro",     color:"#7c3aed", emoji:"🔮" },
  { id:"anthropic/claude-sonnet-4.6",            label:"Gyan Smart",      color:"#a855f7", emoji:"🧠" },
  { id:"anthropic/claude-opus-4.6",              label:"Gyan Ultra",      color:"#a855f7", emoji:"💎" },
  { id:"google/gemini-3.1-flash-lite",           label:"Gyan Flash",      color:"#ec4899", emoji:"🌟" },
  { id:"google/gemini-3.1-pro-preview",          label:"Gyan Vision Pro", color:"#ec4899", emoji:"👁️" },
  { id:"meta-llama/llama-3.3-70b-instruct:free", label:"Gyan Open 70B",  color:"#06b6d4", emoji:"🌐" },
  { id:"deepseek/deepseek-v3.2",                 label:"Gyan Deep V3",    color:"#3b82f6", emoji:"🔬" },
  { id:"mistralai/mistral-large-2512",           label:"Gyan Max",        color:"#8b5cf6", emoji:"🚀" },
  { id:"x-ai/grok-4.3",                          label:"Gyan X",          color:"#6366f1", emoji:"✨" },
  { id:"qwen/qwen3.6-27b",                       label:"Gyan QX 27B",     color:"#d946ef", emoji:"🔷" },
];

const MODES = ["Normal","Code","Creative","Research","Reasoning","Business","Math","Translate","Summarize"];

const PANEL_COLORS = [
  "from-violet-600/20 to-purple-700/10 border-violet-500/20",
  "from-blue-600/20 to-cyan-700/10 border-blue-500/20",
  "from-emerald-600/20 to-teal-700/10 border-emerald-500/20",
  "from-rose-600/20 to-pink-700/10 border-rose-500/20",
];

type Panel = {
  id: string;
  modelId: string;
  mode: string;
  msgs: Msg[];
  loading: boolean;
  title: string;
};

function mkPanel(modelId = "openai/gpt-4o-mini", mode = "Normal"): Panel {
  return {
    id: Math.random().toString(36).slice(2),
    modelId,
    mode,
    msgs: [],
    loading: false,
    title: MODELS.find(m => m.id === modelId)?.label ?? "AI",
  };
}

function ChatPanel({
  panel, colorIdx, onUpdate, onRemove, canRemove, syncInput,
}: {
  panel: Panel;
  colorIdx: number;
  onUpdate: (updated: Partial<Panel>) => void;
  onRemove: () => void;
  canRemove: boolean;
  syncInput: string;
}) {
  const [localInput, setLocalInput] = useState("");
  const [expanded, setExpanded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const model = MODELS.find(m => m.id === panel.modelId)!;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [panel.msgs]);

  const send = useCallback(async (text: string) => {
    const q = text.trim();
    if (!q || panel.loading) return;
    const userMsg: Msg = { role: "user", content: q };
    const newMsgs = [...panel.msgs, userMsg];
    onUpdate({ msgs: [...newMsgs, { role: "assistant", content: "", loading: true }], loading: true });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMsgs.map(m => ({ role: m.role, content: m.content })),
          mode: panel.mode,
          model: panel.modelId,
        }),
      });
      const data = await res.json();
      onUpdate({
        msgs: [...newMsgs, { role: "assistant", content: data.content || data.error || "No response" }],
        loading: false,
      });
    } catch {
      onUpdate({
        msgs: [...newMsgs, { role: "assistant", content: "⚠️ Request failed. Check connection.", error: true }],
        loading: false,
      });
    }
  }, [panel, onUpdate]);

  // Handle synced input from parent
  useEffect(() => {
    if (syncInput) send(syncInput);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncInput]);

  const handleSend = () => {
    send(localInput);
    setLocalInput("");
  };

  const copyAll = () => {
    const text = panel.msgs.map(m => `${m.role === "user" ? "You" : model.label}: ${m.content}`).join("\n\n");
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <div className={cn(
      "flex flex-col min-h-0 rounded-xl border bg-gradient-to-b overflow-hidden flex-1",
      PANEL_COLORS[colorIdx % PANEL_COLORS.length],
      expanded ? "fixed inset-4 z-50" : ""
    )}>
      {/* Panel header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/[0.08] shrink-0 bg-black/20">
        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: model.color }} />
        <div className="flex-1 min-w-0">
          <select
            value={panel.modelId}
            onChange={e => onUpdate({ modelId: e.target.value, title: MODELS.find(m => m.id === e.target.value)?.label ?? "AI" })}
            className="bg-transparent text-white text-[12px] font-bold outline-none cursor-pointer w-full truncate"
            style={{ colorScheme: "dark" }}
          >
            {MODELS.map(m => <option key={m.id} value={m.id}>{m.emoji} {m.label}</option>)}
          </select>
        </div>
        <select
          value={panel.mode}
          onChange={e => onUpdate({ mode: e.target.value })}
          className="bg-white/[0.06] text-white/60 text-[10px] rounded-md px-1.5 py-0.5 outline-none border border-white/[0.08] cursor-pointer"
          style={{ colorScheme: "dark" }}
        >
          {MODES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <button onClick={copyAll} title="Copy conversation"
          className="p-1 text-white/30 hover:text-white/60 transition-colors">
          <FiCopy className="w-3 h-3" />
        </button>
        <button onClick={() => setExpanded(e => !e)} title="Expand"
          className="p-1 text-white/30 hover:text-white/60 transition-colors">
          {expanded ? <FiMinimize2 className="w-3 h-3" /> : <FiMaximize2 className="w-3 h-3" />}
        </button>
        {canRemove && (
          <button onClick={onRemove} className="p-1 text-white/30 hover:text-red-400 transition-colors">
            <FiX className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-3 space-y-2.5 min-h-0">
        {panel.msgs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center opacity-60">
            <span className="text-3xl">{model.emoji}</span>
            <div className="text-white/50 text-sm font-medium">{model.label}</div>
            <div className="text-white/25 text-xs">Ready — type a message below or use Sync</div>
          </div>
        )}
        {panel.msgs.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[90%] rounded-xl px-3 py-2 text-xs leading-relaxed",
              m.role === "user"
                ? "bg-white/[0.12] text-white rounded-br-sm"
                : m.error ? "bg-red-500/15 text-red-300 rounded-bl-sm border border-red-500/20"
                : "bg-black/30 text-white/85 rounded-bl-sm border border-white/[0.06]"
            )}>
              {m.loading ? (
                <div className="flex gap-1 py-0.5">
                  {[0,1,2].map(j => (
                    <div key={j} className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ background: model.color, animationDelay: `${j*0.15}s` }} />
                  ))}
                </div>
              ) : <div className="whitespace-pre-wrap break-words">{m.content}</div>}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-2 border-t border-white/[0.07] shrink-0 bg-black/10">
        <div className="flex items-center gap-2 bg-white/[0.06] border border-white/[0.09] rounded-lg px-3 py-1.5">
          <input
            value={localInput}
            onChange={e => setLocalInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Message..."
            className="flex-1 bg-transparent text-white text-xs outline-none placeholder:text-white/25"
          />
          <button onClick={handleSend} disabled={!localInput.trim() || panel.loading}
            className={cn(
              "p-1 rounded transition-all",
              localInput.trim() && !panel.loading ? "text-white/70 hover:text-white" : "text-white/15"
            )}>
            <FiSend className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MultiChatPage() {
  const [panels, setPanels] = useState<Panel[]>([
    mkPanel("openai/gpt-4o-mini", "Normal"),
    mkPanel("anthropic/claude-sonnet-4.6", "Normal"),
  ]);
  const [syncInput, setSyncInput] = useState("");
  const [syncTrigger, setSyncTrigger] = useState<{ text: string; ts: number } | null>(null);
  const [sharedInput, setSharedInput] = useState("");
  const [layout, setLayout] = useState<"grid" | "column">("grid");

  const addPanel = () => {
    if (panels.length >= 4) return;
    const nextModels = ["google/gemini-3.1-flash-lite","deepseek/deepseek-v3.2","mistralai/mistral-large-2512","x-ai/grok-4.3"];
    setPanels(p => [...p, mkPanel(nextModels[p.length - 2] ?? "openai/gpt-4o", "Normal")]);
  };

  const removePanel = (id: string) => {
    setPanels(p => p.filter(panel => panel.id !== id));
  };

  const updatePanel = (id: string, updates: Partial<Panel>) => {
    setPanels(p => p.map(panel => panel.id === id ? { ...panel, ...updates } : panel));
  };

  const syncAll = () => {
    const q = sharedInput.trim();
    if (!q) return;
    setSyncTrigger({ text: q, ts: Date.now() });
    setSharedInput("");
    setSyncInput(q);
    setTimeout(() => setSyncInput(""), 100);
  };

  const clearAll = () => {
    setPanels(p => p.map(panel => ({ ...panel, msgs: [], loading: false })));
  };

  return (
    <div className="h-full flex flex-col bg-[#06060f] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.07] shrink-0 bg-[#08081a]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}>
            <FiZap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-white font-black text-base leading-none">Multi-Chat</h1>
            <p className="text-white/30 text-[10px]">Run {panels.length} AI models simultaneously</p>
          </div>
        </div>
        <div className="flex-1" />
        {/* Layout toggle */}
        <div className="hidden md:flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] rounded-lg p-1">
          <button onClick={() => setLayout("grid")}
            className={cn("px-2.5 py-1 rounded text-[11px] font-semibold transition-all",
              layout === "grid" ? "bg-violet-500/20 text-violet-300" : "text-white/40 hover:text-white")}>
            Grid
          </button>
          <button onClick={() => setLayout("column")}
            className={cn("px-2.5 py-1 rounded text-[11px] font-semibold transition-all",
              layout === "column" ? "bg-violet-500/20 text-violet-300" : "text-white/40 hover:text-white")}>
            Stack
          </button>
        </div>
        <button onClick={clearAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white text-xs transition-all border border-white/[0.06]">
          <FiRefreshCw className="w-3 h-3" /> Clear all
        </button>
        {panels.length < 4 && (
          <button onClick={addPanel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 text-xs font-bold transition-all border border-violet-500/20">
            <FiPlus className="w-3 h-3" /> Add Panel
          </button>
        )}
      </div>

      {/* Sync bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] shrink-0 bg-[#0a0a1a]">
        <div className="flex items-center gap-2 flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2">
          <FiLink className="w-3.5 h-3.5 text-violet-400 shrink-0" />
          <input
            value={sharedInput}
            onChange={e => setSharedInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") syncAll(); }}
            placeholder="Type here to send the same message to ALL panels simultaneously..."
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/20"
          />
        </div>
        <button onClick={syncAll} disabled={!sharedInput.trim()}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
            sharedInput.trim()
              ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:from-violet-500 hover:to-blue-500 shadow-[0_4px_12px_rgba(124,58,237,0.3)]"
              : "bg-white/[0.04] text-white/25"
          )}>
          <FiZap className="w-3.5 h-3.5" /> Sync All
        </button>
      </div>

      {/* Panels */}
      <div className={cn(
        "flex-1 overflow-hidden p-3 gap-3 min-h-0",
        layout === "grid"
          ? panels.length <= 2 ? "flex flex-row" : "grid grid-cols-2"
          : "flex flex-col"
      )}>
        {panels.map((panel, i) => (
          <ChatPanel
            key={panel.id}
            panel={panel}
            colorIdx={i}
            onUpdate={updates => updatePanel(panel.id, updates)}
            onRemove={() => removePanel(panel.id)}
            canRemove={panels.length > 1}
            syncInput={syncTrigger && syncInput ? syncInput : ""}
          />
        ))}
      </div>
    </div>
  );
}
