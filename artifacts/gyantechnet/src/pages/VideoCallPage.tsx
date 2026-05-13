import { useState, useRef, useEffect } from "react";
import {
  FiVideo, FiMic, FiGlobe, FiCamera, FiCpu, FiVolume2, FiPhone,
  FiMessageSquare, FiUsers, FiShare2, FiMicOff, FiVideoOff,
  FiZap, FiRefreshCw, FiSend,
} from "react-icons/fi";
import { cn } from "@/lib/utils";

type ChatMsg = { id: number; text: string; sender: "user" | "ai"; time: string };

const FEATURES = [
  { icon:FiMic,        label:"Voice Input",    color:"text-violet-400", bg:"bg-violet-500/10" },
  { icon:FiVolume2,    label:"AI Voice",        color:"text-purple-400", bg:"bg-purple-500/10" },
  { icon:FiGlobe,      label:"Multi-language",  color:"text-blue-400",   bg:"bg-blue-500/10" },
  { icon:FiCpu,        label:"Smart AI",        color:"text-pink-400",   bg:"bg-pink-500/10" },
  { icon:FiCamera,     label:"HD Camera",       color:"text-teal-400",   bg:"bg-teal-500/10" },
  { icon:FiZap,        label:"Real-time",       color:"text-amber-400",  bg:"bg-amber-500/10" },
];

const AI_SUGGESTIONS = [
  "Tell me a fun fact about space 🚀",
  "Summarise today's AI news",
  "Help me plan my day",
  "Explain quantum computing",
];

const getTime = () => new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"});

export default function VideoCallPage() {
  const [started, setStarted]   = useState(false);
  const [mic, setMic]           = useState(true);
  const [cam, setCam]           = useState(true);
  const [volume, setVolume]     = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [msgInput, setMsgInput] = useState("");
  const [msgs, setMsgs]         = useState<ChatMsg[]>([
    { id:1, text:"Hello! I'm your GyanTechNet AI assistant. How can I help you today? 👋", sender:"ai", time:getTime() },
  ]);
  const [aiTyping, setAiTyping] = useState(false);
  const [duration, setDuration] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (started) {
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setDuration(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs]);

  const fmt = (s: number) =>
    `${String(Math.floor(s/3600)).padStart(2,"0")}:${String(Math.floor((s%3600)/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  const sendMsg = async () => {
    if (!msgInput.trim()) return;
    const userMsg: ChatMsg = { id:Date.now(), text:msgInput.trim(), sender:"user", time:getTime() };
    setMsgs(p => [...p, userMsg]);
    const text = msgInput.trim();
    setMsgInput("");
    setAiTyping(true);
    try {
      const res = await fetch("/api/chat", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          messages:[{ role:"user", content:text }],
          mode:"Normal", model:"openai/gpt-4o-mini",
        }),
      });
      const d = await res.json();
      setMsgs(p => [...p, { id:Date.now(), text:d.content || "Sorry, I couldn't respond right now.", sender:"ai", time:getTime() }]);
    } catch {
      setMsgs(p => [...p, { id:Date.now(), text:"Connection error. Please try again.", sender:"ai", time:getTime() }]);
    }
    setAiTyping(false);
  };

  if (!started) {
    return (
      <div className="flex h-full items-center justify-center bg-[#06060f] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(20,184,166,0.07)_0%,transparent_70%)]" />
          <div className="absolute top-1/3 right-1/3 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(124,58,237,0.05)_0%,transparent_70%)]" />
        </div>

        <div className="max-w-lg w-full text-center relative z-10 px-6">
          {/* Avatar */}
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-600/30 to-cyan-600/20 border border-teal-500/30 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(20,184,166,0.15)]">
              <FiVideo className="w-10 h-10 text-teal-400" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#06060f] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </div>
          </div>

          <h1 className="text-[28px] font-black text-white mb-2">GyanTechNet AI Call</h1>
          <p className="text-white/40 text-[14px] mb-8">Live AI video assistant with real-time chat, translation &amp; smart responses</p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {FEATURES.map(f => (
              <div key={f.label} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border border-white/[0.07]", f.bg)}>
                <f.icon className={cn("w-3.5 h-3.5", f.color)} />
                <span className="text-white/60">{f.label}</span>
              </div>
            ))}
          </div>

          {/* Device preview row */}
          <div className="flex justify-center gap-3 mb-8">
            <button onClick={() => setMic(v=>!v)}
              className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[13px] font-semibold transition-all",
                mic ? "bg-white/[0.06] border-white/[0.12] text-white" : "bg-red-500/10 border-red-500/25 text-red-400")}>
              {mic ? <FiMic className="w-4 h-4" /> : <FiMicOff className="w-4 h-4" />}
              {mic ? "Mic On" : "Mic Off"}
            </button>
            <button onClick={() => setCam(v=>!v)}
              className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[13px] font-semibold transition-all",
                cam ? "bg-white/[0.06] border-white/[0.12] text-white" : "bg-red-500/10 border-red-500/25 text-red-400")}>
              {cam ? <FiCamera className="w-4 h-4" /> : <FiVideoOff className="w-4 h-4" />}
              {cam ? "Cam On" : "Cam Off"}
            </button>
          </div>

          <button onClick={() => setStarted(true)}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-[15px] font-black rounded-2xl shadow-[0_0_30px_rgba(20,184,166,0.35)] hover:shadow-[0_0_50px_rgba(20,184,166,0.5)] transition-all active:scale-[0.97]">
            <FiVideo className="w-5 h-5" /> Start AI Video Call
          </button>

          <p className="text-white/20 text-[11.5px] mt-5">No sign-up required — browser-based, end-to-end encrypted</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-[#010108] overflow-hidden">
      {/* Main call area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Video area */}
        <div className="flex-1 relative bg-[#010108] flex items-center justify-center overflow-hidden min-h-0">
          {/* AI main feed */}
          <div className="w-full h-full flex items-center justify-center relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.06)_0%,transparent_60%)]" />
            {/* Animated AI avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-teal-600/25 to-cyan-600/15 border border-teal-500/20 flex items-center justify-center shadow-[0_0_60px_rgba(20,184,166,0.12)]">
                <div className="text-[52px]">🤖</div>
              </div>
              {/* AI speaking indicator */}
              {!aiTyping && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/60 backdrop-blur-sm border border-white/[0.08] px-3 py-1 rounded-full">
                  {[0.6, 1.0, 0.4, 0.8, 0.3, 1.0, 0.5].map((h, i) => (
                    <div key={i} className="w-0.5 bg-teal-400 rounded-full animate-pulse"
                      style={{ height:`${h * 16}px`, animationDelay:`${i * 100}ms` }} />
                  ))}
                </div>
              )}
              {aiTyping && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm border border-white/[0.08] px-3 py-1.5 rounded-full">
                  <FiRefreshCw className="w-3 h-3 text-teal-400 animate-spin" />
                </div>
              )}
            </div>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/30 text-[11px] font-medium bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
              GyanTechNet AI · HD
            </div>
          </div>

          {/* Self preview (PiP) */}
          <div className="absolute top-4 right-4 w-36 aspect-video bg-[#0a0a18] border border-white/[0.10] rounded-xl overflow-hidden flex items-center justify-center shadow-xl">
            {cam ? (
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white font-black text-[14px]">
                  Y
                </div>
                <div className="text-white/40 text-[9px]">You (cam preview)</div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                <FiVideoOff className="w-5 h-5 text-white/20" />
                <div className="text-white/20 text-[9px]">Camera off</div>
              </div>
            )}
          </div>

          {/* Call info */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm border border-white/[0.08] px-3 py-1.5 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-white/60 text-[11px] font-mono font-medium">{fmt(duration)}</span>
            </div>
            {!mic && (
              <div className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/25 px-2.5 py-1.5 rounded-full">
                <FiMicOff className="w-3 h-3 text-red-400" />
                <span className="text-red-300 text-[10px]">Muted</span>
              </div>
            )}
          </div>
        </div>

        {/* Controls bar */}
        <div className="h-16 bg-[#08081a] border-t border-white/[0.06] flex items-center justify-center gap-3 shrink-0 px-4">
          <button onClick={() => setMic(v=>!v)}
            className={cn("w-10 h-10 rounded-full border flex items-center justify-center transition-all active:scale-95",
              mic ? "bg-white/[0.07] border-white/[0.12] text-white/70 hover:bg-white/[0.12]" : "bg-red-500/20 border-red-500/30 text-red-400")}>
            {mic ? <FiMic className="w-4 h-4" /> : <FiMicOff className="w-4 h-4" />}
          </button>
          <button onClick={() => setCam(v=>!v)}
            className={cn("w-10 h-10 rounded-full border flex items-center justify-center transition-all active:scale-95",
              cam ? "bg-white/[0.07] border-white/[0.12] text-white/70 hover:bg-white/[0.12]" : "bg-red-500/20 border-red-500/30 text-red-400")}>
            {cam ? <FiCamera className="w-4 h-4" /> : <FiVideoOff className="w-4 h-4" />}
          </button>
          <button onClick={() => setVolume(v=>!v)}
            className={cn("w-10 h-10 rounded-full border flex items-center justify-center transition-all active:scale-95",
              volume ? "bg-white/[0.07] border-white/[0.12] text-white/70 hover:bg-white/[0.12]" : "bg-red-500/20 border-red-500/30 text-red-400")}>
            <FiVolume2 className="w-4 h-4" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/[0.07] border border-white/[0.12] text-white/70 hover:bg-white/[0.12] flex items-center justify-center transition-all active:scale-95">
            <FiShare2 className="w-4 h-4" />
          </button>
          <button onClick={() => setChatOpen(v=>!v)}
            className={cn("w-10 h-10 rounded-full border flex items-center justify-center transition-all active:scale-95 relative",
              chatOpen ? "bg-primary/20 border-primary/30 text-primary" : "bg-white/[0.07] border-white/[0.12] text-white/70 hover:bg-white/[0.12]")}>
            <FiMessageSquare className="w-4 h-4" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/[0.07] border border-white/[0.12] text-white/70 hover:bg-white/[0.12] flex items-center justify-center transition-all active:scale-95">
            <FiUsers className="w-4 h-4" />
          </button>
          <button onClick={() => setStarted(false)}
            className="flex items-center gap-2 px-5 py-2 bg-red-600/90 hover:bg-red-600 text-white text-[13px] font-bold rounded-full transition-all active:scale-95 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
            <FiPhone className="w-3.5 h-3.5 rotate-[135deg]" /> End
          </button>
        </div>
      </div>

      {/* Chat panel */}
      {chatOpen && (
        <div className="w-72 shrink-0 bg-[#08081a] border-l border-white/[0.06] flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.05]">
            <FiMessageSquare className="w-3.5 h-3.5 text-primary" />
            <span className="text-white font-bold text-[13px] flex-1">AI Chat</span>
            <FiZap className="w-3.5 h-3.5 text-amber-400" />
          </div>

          {/* Quick suggestions */}
          <div className="px-3 pt-3 pb-2 flex flex-wrap gap-1.5">
            {AI_SUGGESTIONS.map(s => (
              <button key={s} onClick={() => { setMsgInput(s); }}
                className="text-[10.5px] bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white px-2 py-1 rounded-lg transition-all">
                {s}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-2 space-y-3">
            {msgs.map(m => (
              <div key={m.id} className={cn("flex", m.sender === "user" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[85%] px-3 py-2 rounded-xl text-[12.5px] leading-relaxed",
                  m.sender === "user"
                    ? "bg-primary/20 text-white border border-primary/20 rounded-br-sm"
                    : "bg-white/[0.06] text-white/80 border border-white/[0.07] rounded-bl-sm")}>
                  {m.text}
                </div>
              </div>
            ))}
            {aiTyping && (
              <div className="flex justify-start">
                <div className="bg-white/[0.06] border border-white/[0.07] px-3 py-2 rounded-xl flex items-center gap-1.5">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce"
                      style={{ animationDelay:`${i * 150}ms` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Chat input */}
          <div className="flex items-center gap-2 px-3 py-3 border-t border-white/[0.05]">
            <input value={msgInput} onChange={e => setMsgInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMsg()}
              placeholder="Ask AI anything…"
              className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-[12.5px] outline-none placeholder:text-white/20 focus:border-primary/30 transition-all" />
            <button onClick={sendMsg} disabled={!msgInput.trim() || aiTyping}
              className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white disabled:opacity-40 hover:bg-primary/90 transition-all">
              <FiSend className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
