import { useState, useRef, useEffect } from "react";
import { FiZap, FiX, FiSend, FiCopy, FiMaximize2, FiMinimize2 } from "react-icons/fi";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

type Msg = { role: "user" | "assistant"; content: string; loading?: boolean };

const QUICK_MODES = [
  { id:"Normal",    emoji:"💬", label:"Chat" },
  { id:"Code",      emoji:"💻", label:"Code" },
  { id:"Research",  emoji:"🔬", label:"Research" },
  { id:"Summarize", emoji:"📝", label:"Summary" },
  { id:"Translate", emoji:"🌐", label:"Translate" },
];

export function FloatingAI() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState("Normal");
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    const newMsgs: Msg[] = [...msgs, { role: "user", content: q }];
    setMsgs([...newMsgs, { role: "assistant", content: "", loading: true }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMsgs.map(m => ({ role: m.role, content: m.content })),
          mode,
          model: "openai/gpt-4o-mini",
        }),
      });
      const data = await res.json();
      setMsgs([...newMsgs, { role: "assistant", content: data.content || data.error || "Error" }]);
    } catch {
      setMsgs([...newMsgs, { role: "assistant", content: "⚠️ Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const copyText = (t: string) => navigator.clipboard.writeText(t).catch(() => {});

  const openInChat = () => {
    navigate("/chat");
    setOpen(false);
  };

  return (
    <>
      {/* Floating trigger button */}
      <div className={cn(
        "fixed bottom-6 right-6 z-[150] transition-all duration-300",
        open ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100"
      )}>
        <button
          onClick={() => setOpen(true)}
          className="w-13 h-13 rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(124,58,237,0.5)] transition-all hover:scale-110 active:scale-95"
          style={{ width: 52, height: 52, background: "linear-gradient(135deg,#7c3aed,#ec4899)" }}
          title="Quick AI (⌘⇧A)"
        >
          <FiZap className="w-5 h-5 text-white" />
        </button>
        {/* Pulse ring */}
        <div className="absolute inset-0 rounded-full border-2 border-violet-500/40 animate-ping pointer-events-none" />
      </div>

      {/* Panel */}
      {open && (
        <div className={cn(
          "fixed z-[150] bg-[#0d0d1e] border border-white/[0.12] rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.7),0_0_0_1px_rgba(124,58,237,0.15)] flex flex-col overflow-hidden transition-all duration-200",
          expanded
            ? "bottom-4 right-4 left-4 top-4 md:left-auto md:w-[520px] md:h-[600px] md:bottom-4 md:right-4 md:top-auto"
            : "bottom-6 right-6 w-[340px] h-[480px] md:w-[380px] md:h-[520px]"
        )}>
          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.08] shrink-0">
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg,#7c3aed,#ec4899)" }}>
              <FiZap className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold text-white">Quick AI</div>
              <div className="text-[10px] text-white/35">{mode} mode · Gyan AI</div>
            </div>
            <button onClick={openInChat}
              className="p-1.5 text-white/30 hover:text-violet-400 rounded-lg hover:bg-violet-500/10 transition-all text-[10px] font-bold">
              Full Chat
            </button>
            <button onClick={() => setExpanded(e => !e)}
              className="p-1.5 text-white/30 hover:text-white rounded-lg hover:bg-white/[0.06] transition-all">
              {expanded ? <FiMinimize2 className="w-3.5 h-3.5" /> : <FiMaximize2 className="w-3.5 h-3.5" />}
            </button>
            <button onClick={() => setOpen(false)}
              className="p-1.5 text-white/30 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all">
              <FiX className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mode selector */}
          <div className="flex gap-1 px-3 py-2 border-b border-white/[0.06] shrink-0 overflow-x-auto no-scrollbar">
            {QUICK_MODES.map(m => (
              <button key={m.id} onClick={() => setMode(m.id)}
                className={cn(
                  "shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all",
                  mode === m.id ? "bg-violet-500/20 text-violet-300 border border-violet-500/30" : "text-white/40 hover:text-white hover:bg-white/[0.05]"
                )}>
                <span>{m.emoji}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-3 space-y-3">
            {msgs.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.2),rgba(236,72,153,0.15))" }}>
                  <FiZap className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <div className="text-white/60 text-sm font-medium">Quick AI Assistant</div>
                  <div className="text-white/25 text-[11px] mt-1">Ask anything without leaving your current page</div>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {["Explain this code", "Write a summary", "Translate to Hindi", "Give me ideas"].map(s => (
                    <button key={s} onClick={() => setInput(s)}
                      className="px-2.5 py-1 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] rounded-full text-[10px] text-white/50 hover:text-white/80 transition-all">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[85%] rounded-xl px-3 py-2 text-[12.5px] leading-relaxed relative group",
                  m.role === "user"
                    ? "bg-violet-600/30 border border-violet-500/25 text-white rounded-br-sm"
                    : "bg-white/[0.06] border border-white/[0.08] text-white/85 rounded-bl-sm"
                )}>
                  {m.loading ? (
                    <div className="flex gap-1 py-1">
                      {[0,1,2].map(j => (
                        <div key={j} className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce"
                          style={{ animationDelay: `${j * 0.15}s` }} />
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="whitespace-pre-wrap break-words">{m.content}</div>
                      {m.role === "assistant" && (
                        <button onClick={() => copyText(m.content)}
                          className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 p-1 rounded bg-white/[0.08] transition-all">
                          <FiCopy className="w-2.5 h-2.5 text-white/40" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-2.5 border-t border-white/[0.08] shrink-0">
            <div className="flex items-end gap-2 bg-white/[0.05] border border-white/[0.09] rounded-xl px-3 py-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder={`${mode} mode — ask anything...`}
                rows={1}
                className="flex-1 bg-transparent text-white text-[12.5px] outline-none resize-none placeholder:text-white/25 max-h-24 no-scrollbar leading-relaxed"
                style={{ minHeight: "20px" }}
              />
              <button onClick={send} disabled={!input.trim() || loading}
                className={cn(
                  "p-1.5 rounded-lg transition-all shrink-0",
                  input.trim() && !loading ? "bg-violet-600 hover:bg-violet-500 text-white" : "bg-white/[0.05] text-white/20"
                )}>
                <FiSend className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-[10px] text-white/15 mt-1 text-center">Enter to send · Shift+Enter for new line</div>
          </div>
        </div>
      )}
    </>
  );
}
