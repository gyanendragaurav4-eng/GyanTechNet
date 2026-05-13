import { useState, useRef, useEffect, useCallback } from "react";
import {
  FiSend, FiPaperclip, FiMic, FiCamera, FiSearch, FiPlus, FiX, FiGlobe,
  FiClock, FiDownload, FiCopy, FiTrash2, FiZap, FiStar, FiChevronRight,
} from "react-icons/fi";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";

function MessageContent({ content, isStreaming }: { content: string; isStreaming?: boolean }) {
  const parts: React.ReactNode[] = [];
  const codeBlockRx = /```(\w*)\n?([\s\S]*?)```/g;
  let lastIdx = 0;
  let m: RegExpExecArray | null;

  while ((m = codeBlockRx.exec(content)) !== null) {
    if (m.index > lastIdx) {
      parts.push(<span key={lastIdx} className="whitespace-pre-wrap">{content.slice(lastIdx, m.index)}</span>);
    }
    const lang = m[1] || "code";
    const code = m[2].replace(/\n$/, "");
    parts.push(
      <div key={m.index} className="my-2.5 rounded-xl overflow-hidden border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between px-3 py-1.5 bg-white/[0.04] border-b border-white/[0.06]">
          <span className="text-[10px] text-violet-400/70 font-mono font-bold uppercase tracking-wider">{lang}</span>
          <button
            onClick={() => navigator.clipboard.writeText(code).catch(() => {})}
            className="text-[10px] text-white/30 hover:text-violet-300 transition-colors font-medium px-2 py-0.5 rounded hover:bg-white/[0.06]">
            Copy
          </button>
        </div>
        <pre className="px-4 py-3 bg-black/40 overflow-x-auto no-scrollbar">
          <code className="text-[12.5px] text-emerald-300/90 font-mono leading-relaxed">{code}</code>
        </pre>
      </div>
    );
    lastIdx = m.index + m[0].length;
  }

  const tail = content.slice(lastIdx);
  if (tail || isStreaming) {
    parts.push(
      <span key="tail" className="whitespace-pre-wrap">
        {tail}
        {isStreaming && <span className="streaming-cursor" />}
      </span>
    );
  }

  return <div className="text-[13.5px] leading-relaxed">{parts.length ? parts : <span className="whitespace-pre-wrap">{content}{isStreaming && <span className="streaming-cursor" />}</span>}</div>;
}

type Message = {
  role: "user" | "assistant";
  content: string;
  model?: string;
  imageUrl?: string;
  fileName?: string;
  sources?: { label: string; color: string }[];
  ts?: number;
  starred?: boolean;
};

type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  mode: string;
  createdAt: number;
  updatedAt: number;
};

const SESSIONS_KEY = "gyan_chat_sessions";

function loadSessions(): ChatSession[] {
  try {
    const data = localStorage.getItem(SESSIONS_KEY);
    if (data) return JSON.parse(data);
  } catch { /* ignore */ }
  return [];
}

function saveSessions(sessions: ChatSession[]) {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(0, 30)));
  } catch { /* ignore */ }
}

function mkSession(mode = "Normal"): ChatSession {
  return {
    id: Math.random().toString(36).slice(2),
    title: "New Chat",
    messages: [],
    mode,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

const AI_MODES = [
  { id: "Normal",    label: "Normal",    emoji: "💬", desc: "General purpose AI" },
  { id: "Code",      label: "Code",      emoji: "💻", desc: "Write & debug code" },
  { id: "Creative",  label: "Creative",  emoji: "🎨", desc: "Creative writing" },
  { id: "Summarize", label: "Summarize", emoji: "📝", desc: "Summarise content" },
  { id: "Research",  label: "Research",  emoji: "🔬", desc: "Deep research" },
  { id: "Reasoning", label: "Reasoning", emoji: "🧠", desc: "Step-by-step logic" },
  { id: "Business",  label: "Business",  emoji: "💼", desc: "Business strategy" },
  { id: "Debate",    label: "Debate",    emoji: "⚖️",  desc: "Arguments & debate" },
  { id: "Math",      label: "Math",      emoji: "🧮", desc: "Mathematical problems" },
  { id: "Translate", label: "Translate", emoji: "🌐", desc: "Language translation" },
  { id: "ALL AI",    label: "ALL AI",    emoji: "⚡", desc: "Multi-model response" },
  { id: "Axol",      label: "Axol",      emoji: "🔮", desc: "All 17 models respond as one unit" },
];

const SUGGESTIONS = [
  { icon: "💻", title: "Write a React hook",          sub: "For managing localStorage state with TypeScript" },
  { icon: "🔬", title: "Explain quantum computing",   sub: "In simple terms with real-world examples" },
  { icon: "📊", title: "Design a database schema",    sub: "For a scalable e-commerce platform" },
  { icon: "✍️", title: "Write a compelling email",    sub: "To negotiate a job offer professionally" },
  { icon: "🧮", title: "Solve a math problem",        sub: "Step by step with clear explanation" },
  { icon: "💡", title: "Evaluate my business idea",   sub: "Strengths, weaknesses and market fit" },
];

type ModelDef = { id: string; label: string; provider: string; color: string; desc: string; tag?: string };

const PROVIDER_GROUPS: { id: string; name: string; icon: string; color: string; models: ModelDef[] }[] = [
  { id:"openai",   name:"Gyan Intelligence", icon:"openai",   color:"#7c3aed",
    models:[
      { id:"openai/gpt-4o-mini", label:"Gyan AI Fast", provider:"openai",   color:"#7c3aed", desc:"Fast & affordable" },
      { id:"openai/gpt-4o",      label:"Gyan AI Pro",  provider:"openai",   color:"#7c3aed", desc:"Most capable" },
    ]},
  { id:"claude",   name:"Gyan Pro Series",   icon:"claude",   color:"#a855f7",
    models:[
      { id:"anthropic/claude-sonnet-4.6", label:"Gyan Smart",      provider:"claude", color:"#a855f7", desc:"Best balance" },
      { id:"anthropic/claude-opus-4.6",   label:"Gyan Ultra",      provider:"claude", color:"#a855f7", desc:"Most intelligent" },
    ]},
  { id:"gemini",   name:"Gyan Vision Series",icon:"gemini",   color:"#ec4899",
    models:[
      { id:"google/gemini-3.1-flash-lite",  label:"Gyan Flash",      provider:"gemini", color:"#ec4899", desc:"Fastest engine" },
      { id:"google/gemini-3.1-pro-preview", label:"Gyan Vision Pro", provider:"gemini", color:"#ec4899", desc:"Most powerful vision" },
      { id:"google/gemma-4-31b-it:free",    label:"Gyan Open",       provider:"gemini", color:"#10b981", desc:"Free · Open source", tag:"FREE" },
    ]},
  { id:"llama",    name:"Gyan Open Series",  icon:"llama",    color:"#06b6d4",
    models:[
      { id:"meta-llama/llama-3.3-70b-instruct:free", label:"Gyan Open 70B", provider:"llama", color:"#06b6d4", desc:"Free · Open source", tag:"FREE" },
      { id:"meta-llama/llama-3.1-8b-instruct",       label:"Gyan Open 8B",  provider:"llama", color:"#06b6d4", desc:"Lightweight & fast" },
    ]},
  { id:"mistral",  name:"Gyan Precision",    icon:"mistral",  color:"#8b5cf6",
    models:[
      { id:"mistralai/mistral-small-2603", label:"Gyan Mini", provider:"mistral", color:"#8b5cf6", desc:"Efficient & smart" },
      { id:"mistralai/mistral-large-2512", label:"Gyan Max",  provider:"mistral", color:"#8b5cf6", desc:"Maximum precision" },
    ]},
  { id:"qwen",     name:"Gyan QX Series",    icon:"qwen",     color:"#d946ef",
    models:[
      { id:"qwen/qwen3.6-flash", label:"Gyan QX Flash", provider:"qwen", color:"#d946ef", desc:"Fast & efficient" },
      { id:"qwen/qwen3.6-27b",   label:"Gyan QX 27B",   provider:"qwen", color:"#d946ef", desc:"High capability" },
    ]},
  { id:"deepseek", name:"Gyan Deep Series",  icon:"deepseek", color:"#3b82f6",
    models:[
      { id:"deepseek/deepseek-v3.2",    label:"Gyan Deep V3",    provider:"deepseek", color:"#3b82f6", desc:"Reasoning powerhouse" },
      { id:"deepseek/deepseek-v4-flash",label:"Gyan Deep Flash", provider:"deepseek", color:"#3b82f6", desc:"Blazing fast" },
    ]},
  { id:"grok",     name:"Gyan X Series",     icon:"grok",     color:"#6366f1",
    models:[{ id:"x-ai/grok-4.3", label:"Gyan X", provider:"grok", color:"#6366f1", desc:"Real-time reasoning" }]},
  { id:"phi",      name:"Gyan Phi Series",   icon:"phi",      color:"#0ea5e9",
    models:[{ id:"microsoft/phi-4-mini-instruct", label:"Gyan Phi Mini", provider:"phi", color:"#0ea5e9", desc:"Compact & smart" }]},
];

const ALL_MODELS: ModelDef[] = PROVIDER_GROUPS.flatMap(g => g.models);
const VISION_MODELS = new Set(["openai/gpt-4o-mini","openai/gpt-4o","anthropic/claude-sonnet-4.6","anthropic/claude-opus-4.6","google/gemini-3.1-flash-lite","google/gemini-3.1-pro-preview"]);
const TEXT_EXTS = ".txt,.md,.js,.ts,.jsx,.tsx,.py,.json,.csv,.html,.css,.xml,.yaml,.yml,.sh,.sql,.java,.cpp,.c,.go,.rs,.rb,.php,.swift";

function ProviderIcon({ id, size = 16, className }: { id: string; size?: number; className?: string }) {
  const badges: Record<string,{emoji:string;bg:string}> = {
    openai:  {emoji:"⚡", bg:"#7c3aed"},
    gemini:  {emoji:"✦",  bg:"#ec4899"},
    claude:  {emoji:"◆",  bg:"#a855f7"},
    llama:   {emoji:"🌐", bg:"#0064e0"},
    mistral: {emoji:"🌀", bg:"#8b5cf6"},
    qwen:    {emoji:"Q",  bg:"#6b4ff8"},
    deepseek:{emoji:"DS", bg:"#1677ff"},
    grok:    {emoji:"G",  bg:"#3b3b3b"},
    phi:     {emoji:"φ",  bg:"#00a4ef"},
  };
  const b = badges[id];
  if (b) return <div style={{width:size,height:size,background:b.bg,borderRadius:4,fontSize:size*0.55,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,lineHeight:1}} className={className}>{b.emoji}</div>;
  return null;
}

function HistoryPanel({ sessions, onLoad, onDelete, onClose }: {
  sessions: ChatSession[];
  onLoad: (s: ChatSession) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute right-0 top-0 bottom-0 w-72 bg-[#09091c] border-l border-white/[0.08] z-30 flex flex-col shadow-[-12px_0_40px_rgba(0,0,0,0.4)]">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.07]">
        <div className="flex items-center gap-2">
          <FiClock className="w-3.5 h-3.5 text-violet-400" />
          <span className="text-white font-bold text-sm">Chat History</span>
        </div>
        <button onClick={onClose} className="p-1 text-white/30 hover:text-white/70 transition-colors">
          <FiX className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar py-2">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
            <span className="text-3xl">💬</span>
            <div className="text-white/30 text-xs">No saved chats yet</div>
          </div>
        ) : sessions.map(s => (
          <div key={s.id} className="flex items-start gap-2 px-3 py-2.5 hover:bg-white/[0.04] group cursor-pointer border-b border-white/[0.03]"
            onClick={() => onLoad(s)}>
            <span className="text-base shrink-0 mt-0.5">{AI_MODES.find(m => m.id === s.mode)?.emoji || "💬"}</span>
            <div className="flex-1 min-w-0">
              <div className="text-white/80 text-xs font-semibold truncate">{s.title}</div>
              <div className="text-white/30 text-[10px] mt-0.5">{s.messages.length} messages · {new Date(s.updatedAt).toLocaleDateString()}</div>
            </div>
            <button onClick={e => { e.stopPropagation(); onDelete(s.id); }}
              className="opacity-0 group-hover:opacity-100 p-1 text-white/20 hover:text-red-400 transition-all shrink-0">
              <FiTrash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ChatPage() {
  // Session management
  const [allSessions, setAllSessions] = useState<ChatSession[]>(loadSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const activeSession = activeSessionId ? allSessions.find(s => s.id === activeSessionId) : null;

  // Current chat state (synced to active session)
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeMode, setActiveMode] = useState("Normal");
  const [attachedFile, setAttachedFile] = useState<{ name: string; content: string } | null>(null);
  const [attachedImage, setAttachedImage] = useState<{ name: string; base64: string; mimeType: string; previewUrl: string } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [searchMode, setSearchMode] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const baseTextRef = useRef("");
  const { user } = useAuth();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const resize = () => {
    const ta = taRef.current;
    if (ta) { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 160) + "px"; }
  };

  // Auto-save messages to current session
  const saveCurrentSession = useCallback((msgs: Message[], mode: string, sessionId: string | null) => {
    if (msgs.length === 0) return;
    const title = msgs[0].content?.slice(0, 45) || "New Chat";
    setAllSessions(prev => {
      const existing = sessionId ? prev.find(s => s.id === sessionId) : null;
      if (existing) {
        const updated = prev.map(s => s.id === sessionId ? { ...s, messages: msgs, mode, title, updatedAt: Date.now() } : s);
        saveSessions(updated);
        return updated;
      }
      const newSession: ChatSession = { id: sessionId || Math.random().toString(36).slice(2), title, messages: msgs, mode, createdAt: Date.now(), updatedAt: Date.now() };
      const updated = [newSession, ...prev];
      saveSessions(updated);
      setActiveSessionId(newSession.id);
      setOpenTabs(t => t.includes(newSession.id) ? t : [newSession.id, ...t].slice(0, 5));
      return updated;
    });
  }, []);

  const loadSession = (s: ChatSession) => {
    setMessages(s.messages);
    setActiveMode(s.mode);
    setActiveSessionId(s.id);
    if (!openTabs.includes(s.id)) setOpenTabs(t => [s.id, ...t].slice(0, 5));
    setShowHistory(false);
    setInput("");
    setAttachedFile(null);
    setAttachedImage(null);
  };

  const newChat = () => {
    saveCurrentSession(messages, activeMode, activeSessionId);
    setMessages([]);
    setActiveSessionId(null);
    setInput("");
    setAttachedFile(null);
    setAttachedImage(null);
    setIsRecording(false);
    setSearchMode(false);
  };

  const deleteSession = (id: string) => {
    setAllSessions(prev => {
      const updated = prev.filter(s => s.id !== id);
      saveSessions(updated);
      return updated;
    });
    setOpenTabs(t => t.filter(tid => tid !== id));
    if (activeSessionId === id) {
      setMessages([]); setActiveSessionId(null);
    }
  };

  const exportChat = () => {
    const text = messages.map(m => `${m.role === "user" ? "You" : "GyanTechNet AI"} [${new Date(m.ts || Date.now()).toLocaleTimeString()}]:\n${m.content}`).join("\n\n---\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `chat-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
  };

  const starMessage = (i: number) => {
    setMessages(prev => prev.map((m, idx) => idx === i ? { ...m, starred: !m.starred } : m));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAttachedFile({ name: file.name, content: (ev.target?.result as string).slice(0, 60000) });
    reader.readAsText(file); e.target.value = "";
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setAttachedImage({ name: file.name, base64: dataUrl.split(",")[1], mimeType: file.type, previewUrl: dataUrl });
    };
    reader.readAsDataURL(file); e.target.value = "";
  };

  const toggleMic = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Voice input not supported. Use Chrome or Edge."); return; }
    if (isRecording) { recognitionRef.current?.stop(); setIsRecording(false); return; }
    baseTextRef.current = input;
    const recognition = new SR();
    recognition.continuous = true; recognition.interimResults = true; recognition.lang = "en-US";
    recognitionRef.current = recognition;
    recognition.onresult = (event: any) => {
      let interim = "", finalAdd = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t: string = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalAdd += t; else interim += t;
      }
      if (finalAdd) baseTextRef.current = baseTextRef.current ? baseTextRef.current + " " + finalAdd.trim() : finalAdd.trim();
      const live = interim ? (baseTextRef.current ? baseTextRef.current + " " : "") + interim : baseTextRef.current;
      setInput(live); setTimeout(resize, 0);
    };
    recognition.onend = () => { setInput(baseTextRef.current); setTimeout(resize, 0); setIsRecording(false); };
    recognition.onerror = (e: any) => { if (e.error !== "no-speech") setInput(baseTextRef.current); setIsRecording(false); };
    recognition.start(); setIsRecording(true);
  };

  const send = async (text?: string) => {
    const rawText = (text ?? input).trim();
    const hasContent = rawText || attachedFile || attachedImage;
    if (!hasContent || loading) return;

    let displayContent = rawText, apiContent = rawText;
    if (attachedFile) {
      const fb = `[File: ${attachedFile.name}]\n\`\`\`\n${attachedFile.content}\n\`\`\``;
      apiContent = apiContent ? `${apiContent}\n\n${fb}` : fb;
      displayContent = displayContent ? `${displayContent}\n\n📎 ${attachedFile.name}` : `📎 ${attachedFile.name}`;
    }
    if (searchMode && apiContent) apiContent = `Search the web and answer this thoroughly: ${apiContent}`;

    const userMsg: Message = { role:"user", content: displayContent || (attachedImage ? "🖼️ Image attached" : ""), imageUrl: attachedImage?.previewUrl, fileName: attachedFile?.name, ts: Date.now() };
    setInput(""); if (taRef.current) taRef.current.style.height = "auto";
    const capturedImage = attachedImage;
    setAttachedFile(null); setAttachedImage(null);
    const newMessages: Message[] = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    const apiMessages = newMessages.filter(m => m.content || m.imageUrl).map(m => ({ role: m.role, content: m.content || (m.imageUrl ? "[image attached]" : "") }));
    const isMultiMode = activeMode === "ALL AI" || activeMode === "Axol";

    if (!isMultiMode) {
      // ── Streaming path ─────────────────────────────────────────────────
      const placeholder: Message = { role: "assistant", content: "", ts: Date.now() };
      setMessages([...newMessages, placeholder]);
      setIsStreaming(true);

      let accumulated = "";
      let finalModel = "openai/gpt-4o-mini";

      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 60000);

        const response = await fetch("/api/chat-stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: apiMessages,
            mode: activeMode,
            model: "openai/gpt-4o-mini",
            imageBase64: capturedImage?.base64,
            imageMimeType: capturedImage?.mimeType,
            searchMode,
          }),
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (!response.ok) {
          const d = await response.json().catch(() => ({ error: "Server error" }));
          setMessages([...newMessages, { role:"assistant", content:`⚠️ ${d.error || "Server error"}`, ts: Date.now() }]);
          setLoading(false); setIsStreaming(false); return;
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buf = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (!raw || raw === "[DONE]") continue;
            try {
              const data = JSON.parse(raw);
              if (data.text) {
                accumulated += data.text;
                const snap = accumulated;
                setMessages(prev => {
                  const next = [...prev];
                  const li = next.length - 1;
                  if (next[li]?.role === "assistant") next[li] = { ...next[li], content: snap };
                  return next;
                });
              }
              if (data.model) finalModel = data.model;
              if (data.error) {
                accumulated = `⚠️ ${data.error}`;
                setMessages(prev => {
                  const next = [...prev];
                  const li = next.length - 1;
                  if (next[li]?.role === "assistant") next[li] = { ...next[li], content: accumulated };
                  return next;
                });
              }
            } catch { /* ignore JSON parse errors */ }
          }
        }

        const finalMsg: Message = { role:"assistant", content: accumulated || "No response.", model: finalModel, ts: Date.now() };
        const finalMessages = [...newMessages, finalMsg];
        setMessages(finalMessages);
        try { localStorage.setItem("gyan_stat_chats", String(parseInt(localStorage.getItem("gyan_stat_chats") || "0") + 1)); } catch { /* ignore */ }
        saveCurrentSession(finalMessages, activeMode, activeSessionId);
      } catch (err: unknown) {
        const isAbort = err instanceof Error && err.name === "AbortError";
        setMessages([...newMessages, {
          role:"assistant",
          content: isAbort ? "⚠️ Request timed out. Please try again." : "⚠️ Connection error. Please check your network.",
          ts: Date.now(),
        }]);
      }
      setIsStreaming(false);
    } else {
      // ── Multi-model path ────────────────────────────────────────────────
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 60000);

        const r = await fetch("/api/chat-unified", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages, mode: activeMode }),
          signal: controller.signal,
        });
        clearTimeout(timer);

        const d = await r.json();
        const aiMsg: Message = d.error
          ? { role:"assistant", content: `⚠️ ${d.error}`, ts: Date.now() }
          : { role:"assistant", content: d.content || "No response.", sources: d.sources || [], ts: Date.now() };
        const finalMessages = [...newMessages, aiMsg];
        setMessages(finalMessages);
        try { localStorage.setItem("gyan_stat_chats", String(parseInt(localStorage.getItem("gyan_stat_chats") || "0") + 1)); } catch { /* ignore */ }
        saveCurrentSession(finalMessages, activeMode, activeSessionId);
      } catch (err: unknown) {
        const isAbort = err instanceof Error && err.name === "AbortError";
        setMessages(prev => [...prev, {
          role:"assistant",
          content: isAbort ? "⚠️ Multi-model synthesis timed out. Please try again." : "⚠️ Connection error. Please check your network.",
          ts: Date.now(),
        }]);
      }
    }

    setLoading(false);
  };

  const copyMsg = (content: string) => navigator.clipboard.writeText(content).catch(() => {});

  const isEmpty = messages.length === 0;
  const hasAttachment = !!(attachedFile || attachedImage);
  const canSend = (input.trim() || hasAttachment) && !loading && !isStreaming;
  const recentSessions = allSessions.slice(0, 5);

  return (
    <div className="flex flex-col h-full bg-[#06060f] overflow-hidden relative">

      {/* Session tabs + toolbar */}
      <div className="shrink-0 border-b border-white/[0.05] bg-[#06060f]/98 backdrop-blur-sm">
        {/* Tabs row */}
        <div className="flex items-center gap-0 px-2 pt-2 overflow-x-auto no-scrollbar">
          {/* New chat */}
          <button onClick={newChat}
            className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 mr-1 rounded-t-lg bg-white/[0.04] border border-white/[0.07] border-b-0 text-white/40 hover:text-white/80 hover:bg-white/[0.08] transition-all text-[11px] font-medium">
            <FiPlus className="w-3 h-3" />
            <span>New</span>
          </button>
          {/* Open tab sessions */}
          {openTabs.map(tid => {
            const s = allSessions.find(sess => sess.id === tid);
            if (!s) return null;
            const active = activeSessionId === tid;
            return (
              <div key={tid} onClick={() => loadSession(s)}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg border border-b-0 text-[11px] cursor-pointer transition-all max-w-[140px] group",
                  active
                    ? "bg-[#06060f] border-white/[0.12] text-white font-semibold"
                    : "bg-white/[0.02] border-white/[0.05] text-white/40 hover:text-white/70 hover:bg-white/[0.05]"
                )}>
                <span className="shrink-0">{AI_MODES.find(m => m.id === s.mode)?.emoji || "💬"}</span>
                <span className="truncate flex-1">{s.title.slice(0, 18)}</span>
                <button onClick={e => { e.stopPropagation(); setOpenTabs(t => t.filter(x => x !== tid)); if (active) { setMessages([]); setActiveSessionId(null); }}}
                  className="opacity-0 group-hover:opacity-100 shrink-0 p-0.5 hover:text-red-400 transition-all">
                  <FiX className="w-2.5 h-2.5" />
                </button>
              </div>
            );
          })}
          <div className="flex-1" />
          {/* Multi-chat link */}
          <Link href="/multi-chat"
            className="shrink-0 flex items-center gap-1 px-2 py-1 mr-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/15 text-blue-400 text-[10px] font-bold transition-all">
            <FiZap className="w-3 h-3" /> Multi
          </Link>
          {/* History */}
          <button onClick={() => setShowHistory(v => !v)}
            className={cn("shrink-0 flex items-center gap-1 px-2 py-1 mr-1 rounded-lg text-[10px] font-bold transition-all border",
              showHistory ? "bg-violet-500/20 border-violet-500/25 text-violet-300" : "bg-white/[0.04] border-white/[0.07] text-white/40 hover:text-white")}>
            <FiClock className="w-3 h-3" /> History
          </button>
          {/* Export */}
          {messages.length > 0 && (
            <button onClick={exportChat}
              className="shrink-0 flex items-center gap-1 px-2 py-1 mr-2 rounded-lg bg-white/[0.04] border border-white/[0.07] text-white/40 hover:text-white text-[10px] font-bold transition-all">
              <FiDownload className="w-3 h-3" />
            </button>
          )}
        </div>
        {/* Mode pills */}
        <div className="flex items-center gap-1.5 px-3 pb-2 overflow-x-auto no-scrollbar">
          <div className="w-px h-4 bg-white/[0.07] shrink-0 mr-0.5" />
          {AI_MODES.map(mode => (
            <button key={mode.id} onClick={() => setActiveMode(mode.id)} title={mode.desc}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11.5px] font-medium whitespace-nowrap transition-all shrink-0",
                activeMode === mode.id
                  ? "bg-gradient-to-r from-primary to-pink-500 text-white shadow-[0_0_14px_rgba(124,58,237,0.35)]"
                  : "bg-white/[0.04] text-white/40 hover:bg-white/[0.07] hover:text-white/75 border border-white/[0.05]"
              )}>
              <span className="text-[12px]">{mode.emoji}</span>
              <span className="hidden xs:inline">{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto no-scrollbar overscroll-bounce relative" ref={scrollRef}>
        {isEmpty ? (
          <div className="relative flex flex-col items-center min-h-full px-4 py-6 overflow-hidden">

            {/* Ambient background orbs */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
              <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] rounded-full opacity-20"
                style={{background:"radial-gradient(circle, rgba(124,58,237,0.8) 0%, transparent 70%)", filter:"blur(80px)", animation:"pulse 6s ease-in-out infinite"}} />
              <div className="absolute top-[40%] right-[10%] w-[400px] h-[400px] rounded-full opacity-15"
                style={{background:"radial-gradient(circle, rgba(236,72,153,0.9) 0%, transparent 70%)", filter:"blur(80px)", animation:"pulse 8s ease-in-out infinite 2s"}} />
              <div className="absolute bottom-[10%] left-[30%] w-[350px] h-[350px] rounded-full opacity-10"
                style={{background:"radial-gradient(circle, rgba(6,182,212,0.9) 0%, transparent 70%)", filter:"blur(80px)", animation:"pulse 7s ease-in-out infinite 1s"}} />
            </div>

            <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center">

              {/* Hero section */}
              <div className="flex flex-col items-center text-center mb-6 mt-2">
                <div className="relative mb-4">
                  <div className="absolute inset-[-30px] rounded-full"
                    style={{background:"radial-gradient(circle, rgba(124,58,237,0.4) 0%, transparent 70%)", filter:"blur(20px)"}} />
                  <div className="absolute inset-[-4px] rounded-2xl border border-violet-500/30 animate-pulse" />
                  <img src="/gyan-logo.jpg" alt="GyanTechNet AI"
                    className="relative w-[72px] h-[72px] rounded-2xl object-cover border-2 border-violet-500/50 shadow-[0_0_40px_rgba(124,58,237,0.6)]" />
                  <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#06060f] shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <div className="h-px w-16 bg-gradient-to-r from-transparent to-violet-500/50" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400">GyanTechNet AI Platform</span>
                  <div className="h-px w-16 bg-gradient-to-l from-transparent to-violet-500/50" />
                </div>

                <h1 className="text-[28px] sm:text-[36px] font-black text-white leading-tight mb-2">
                  Hello, <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">{user?.name?.split(" ")[0] || "there"}</span> 👋
                </h1>
                <p className="text-[13px] text-white/40 max-w-sm leading-relaxed">
                  The world's most powerful multitasking AI — 17 models working in perfect parallel.
                </p>
              </div>

              {/* Stats strip */}
              <div className="flex items-center gap-3 mb-6 flex-wrap justify-center">
                {[
                  { n: "17", l: "AI Models", c: "from-violet-500 to-purple-600" },
                  { n: "50+", l: "Workspace Tools", c: "from-blue-500 to-cyan-600" },
                  { n: "∞", l: "Parallel Queries", c: "from-pink-500 to-rose-600" },
                  { n: "0ms", l: "Context Switch", c: "from-emerald-500 to-teal-600" },
                ].map(s => (
                  <div key={s.l} className="flex flex-col items-center px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.07] backdrop-blur-sm min-w-[80px]">
                    <div className={`text-[20px] font-black bg-gradient-to-r ${s.c} bg-clip-text text-transparent leading-none`}>{s.n}</div>
                    <div className="text-[9px] text-white/30 font-bold uppercase tracking-wider mt-0.5">{s.l}</div>
                  </div>
                ))}
              </div>

              {/* Model group cards */}
              <div className="w-full mb-5">
                <div className="text-[10px] text-white/25 font-black uppercase tracking-[0.18em] mb-2.5 flex items-center gap-2">
                  <div className="h-px flex-1 bg-white/[0.06]" />
                  <span>Active AI Models</span>
                  <div className="h-px flex-1 bg-white/[0.06]" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PROVIDER_GROUPS.slice(0, 6).map(g => (
                    <div key={g.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] transition-all group cursor-default"
                      style={{borderColor: `${g.color}22`}}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{background: `${g.color}20`}}>
                        <ProviderIcon id={g.id} size={14} className="opacity-80" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-white/70 group-hover:text-white/90 truncate transition-colors">{g.name}</div>
                        <div className="text-[9px] text-white/25 mt-0.5">{g.models.length} model{g.models.length>1?"s":""} ready</div>
                      </div>
                      <div className="ml-auto w-1.5 h-1.5 rounded-full shrink-0 animate-pulse" style={{background: g.color, boxShadow:`0 0 6px ${g.color}`}} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent sessions */}
              {recentSessions.length > 0 && (
                <div className="w-full mb-4">
                  <div className="text-[10px] text-white/25 font-black uppercase tracking-[0.18em] mb-2 flex items-center gap-2">
                    <FiClock className="w-3 h-3" /> Recent Chats
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSessions.map(s => (
                      <button key={s.id} onClick={() => loadSession(s)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:bg-violet-500/[0.10] hover:border-violet-500/20 text-white/50 hover:text-white text-[12px] transition-all">
                        <span>{AI_MODES.find(m => m.id === s.mode)?.emoji || "💬"}</span>
                        <span className="truncate max-w-[150px]">{s.title}</span>
                        <FiChevronRight className="w-3 h-3 opacity-40 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestion cards */}
              <div className="w-full">
                <div className="text-[10px] text-white/25 font-black uppercase tracking-[0.18em] mb-2.5 flex items-center gap-2">
                  <div className="h-px flex-1 bg-white/[0.06]" />
                  <span>Try asking</span>
                  <div className="h-px flex-1 bg-white/[0.06]" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SUGGESTIONS.map((s, i) => (
                    <button key={i} onClick={() => send(s.title)}
                      className="relative p-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] hover:bg-white/[0.05] hover:border-violet-500/25 text-left transition-all group active:scale-[0.98] overflow-hidden">
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{background:"radial-gradient(circle at 0% 0%, rgba(124,58,237,0.08) 0%, transparent 60%)"}} />
                      <div className="relative z-10">
                        <div className="text-[22px] mb-2.5">{s.icon}</div>
                        <div className="text-[13px] font-bold text-white/80 group-hover:text-white mb-1 leading-snug transition-colors">{s.title}</div>
                        <div className="text-[11px] text-white/30 leading-snug">{s.sub}</div>
                      </div>
                      <FiChevronRight className="absolute right-3.5 bottom-3.5 w-3.5 h-3.5 text-white/15 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-center text-[10px] text-white/12 mt-5 pb-2">
                Powered by GyanTechNet Intelligence — 17 parallel AI engines
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex gap-2.5 sm:gap-3 group", msg.role === "user" ? "justify-end" : "justify-start")}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(124,58,237,0.4)] mt-0.5">
                    <span className="text-[13px]">🔮</span>
                  </div>
                )}
                <div className={cn("flex flex-col gap-1", msg.role === "user" ? "items-end" : "items-start", "max-w-[84%] sm:max-w-[80%]")}>
                  {msg.imageUrl && (
                    <img src={msg.imageUrl} alt="Attached"
                      className="rounded-xl max-w-[220px] sm:max-w-[280px] max-h-48 object-cover border border-white/[0.08] mb-1" />
                  )}
                  {msg.content !== undefined && (msg.content || isStreaming) && (
                    <div className={cn(
                      "rounded-2xl px-3.5 py-2.5 relative",
                      msg.role === "user"
                        ? "bg-gradient-to-br from-primary via-violet-600 to-primary text-white rounded-tr-md shadow-[0_2px_20px_rgba(124,58,237,0.28)]"
                        : "bg-white/[0.05] border border-white/[0.07] text-white/88 rounded-tl-md"
                    )}>
                      {msg.role === "assistant"
                        ? <MessageContent content={msg.content} isStreaming={isStreaming && i === messages.length - 1} />
                        : <pre className="whitespace-pre-wrap font-sans text-[13.5px] leading-relaxed">{msg.content}</pre>
                      }
                      {/* Action buttons on hover */}
                      <div className="absolute -bottom-6 right-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => copyMsg(msg.content)}
                          className="p-1 rounded bg-white/[0.08] text-white/40 hover:text-white transition-colors">
                          <FiCopy className="w-2.5 h-2.5" />
                        </button>
                        <button onClick={() => starMessage(i)}
                          className={cn("p-1 rounded transition-colors", msg.starred ? "text-amber-400" : "bg-white/[0.08] text-white/40 hover:text-amber-400")}>
                          <FiStar className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  )}
                  {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                    <div className="flex items-center gap-1.5 px-1 mt-2 flex-wrap">
                      <span className="text-[9px] text-white/20 font-medium uppercase tracking-wider shrink-0">{msg.sources.length} models</span>
                      <div className="flex gap-1 flex-wrap">
                        {msg.sources.map((s, idx) => (
                          <div key={idx} title={s.label} className="w-2 h-2 rounded-full ring-1 ring-white/10" style={{ background: s.color }} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-primary/40 to-pink-500/30 border border-white/[0.08] flex items-center justify-center text-white font-bold text-[11px] shrink-0">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </div>
            ))}
            {loading && !isStreaming && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center shrink-0 animate-pulse">
                  <span className="text-[13px]">🔮</span>
                </div>
                <div className="flex flex-col gap-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-1">
                      {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{animationDelay:`${i*0.15}s`}} />)}
                    </div>
                    <span className="text-[11px] text-white/25">
                      {(activeMode === "ALL AI" || activeMode === "Axol") ? "Synthesising from 17 models…" : "Thinking…"}
                    </span>
                  </div>
                  {(activeMode === "ALL AI" || activeMode === "Axol") && (
                    <div className="flex gap-1 flex-wrap max-w-xs">
                      {ALL_MODELS.map(m => <div key={m.id} className="w-2 h-2 rounded-full animate-pulse ring-1 ring-white/10" style={{background: m.color}} title={m.label} />)}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* History panel */}
        {showHistory && (
          <HistoryPanel
            sessions={allSessions}
            onLoad={loadSession}
            onDelete={deleteSession}
            onClose={() => setShowHistory(false)}
          />
        )}
      </div>

      {/* Input bar */}
      <div className="shrink-0 px-3 sm:px-4 pt-2 pb-3 border-t border-white/[0.05] bg-[#06060f]/98 backdrop-blur-md"
        style={{paddingBottom:"max(12px, env(safe-area-inset-bottom, 12px))"}}>
        <div className="max-w-2xl mx-auto">
          {(attachedFile || attachedImage || searchMode) && (
            <div className="flex flex-wrap gap-2 mb-2">
              {searchMode && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/25 text-blue-400 text-[11px] font-medium">
                  <FiGlobe className="w-3 h-3" /><span>Web Search On</span>
                </div>
              )}
              {attachedFile && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.1] text-white/60 text-[11px] max-w-[200px]">
                  <FiPaperclip className="w-3 h-3 shrink-0 text-primary" />
                  <span className="truncate">{attachedFile.name}</span>
                  <button onClick={() => setAttachedFile(null)} className="shrink-0 text-white/30 hover:text-white/70 ml-0.5"><FiX className="w-3 h-3" /></button>
                </div>
              )}
              {attachedImage && (
                <div className="flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.1] text-white/60 text-[11px]">
                  <img src={attachedImage.previewUrl} alt="" className="w-5 h-5 rounded-full object-cover shrink-0" />
                  <span className="truncate max-w-[120px]">{attachedImage.name}</span>
                  <button onClick={() => setAttachedImage(null)} className="shrink-0 text-white/30 hover:text-white/70 ml-0.5"><FiX className="w-3 h-3" /></button>
                </div>
              )}
            </div>
          )}
          <div className={cn(
            "relative bg-[#0d0d1e] border border-white/[0.09] rounded-2xl transition-all overflow-hidden",
            "focus-within:border-primary/40 focus-within:shadow-[0_0_28px_rgba(124,58,237,0.10)]",
            isRecording && "border-red-500/40 shadow-[0_0_16px_rgba(239,68,68,0.12)]"
          )}>
            <div className="flex items-center gap-0.5 px-2.5 pt-2.5 pb-1">
              <button title="Attach file" onClick={() => fileRef.current?.click()}
                className={cn("p-2 rounded-xl hover:bg-white/[0.06] transition-all active:scale-95", attachedFile ? "text-primary" : "text-white/20 hover:text-white/55")}>
                <FiPaperclip className="w-4 h-4" />
              </button>
              <button title="Upload image" onClick={() => imageRef.current?.click()}
                className={cn("p-2 rounded-xl hover:bg-white/[0.06] transition-all active:scale-95", attachedImage ? "text-primary" : "text-white/20 hover:text-white/55")}>
                <FiCamera className="w-4 h-4" />
              </button>
              <button title={isRecording ? "Stop recording" : "Voice input"} onClick={toggleMic}
                className={cn("p-2 rounded-xl transition-all active:scale-95", isRecording ? "text-red-400 bg-red-500/10 animate-pulse" : "text-white/20 hover:text-white/55 hover:bg-white/[0.06]")}>
                <FiMic className="w-4 h-4" />
              </button>
              <button title={searchMode ? "Turn off web search" : "Enable web search"} onClick={() => setSearchMode(v => !v)}
                className={cn("p-2 rounded-xl transition-all active:scale-95", searchMode ? "text-blue-400 bg-blue-500/10" : "text-white/20 hover:text-white/55 hover:bg-white/[0.06]")}>
                <FiSearch className="w-4 h-4" />
              </button>
            </div>
            <textarea ref={taRef} value={input}
              onChange={e => { setInput(e.target.value); resize(); }}
              onKeyDown={e => { if (e.key==="Enter"&&!e.shiftKey&&!e.ctrlKey) { e.preventDefault(); send(); } }}
              placeholder={isRecording ? "🎙️ Listening…" : attachedImage ? "Ask about this image…" : "Message all 17 AI models…"}
              className="w-full bg-transparent resize-none min-h-[44px] max-h-[160px] py-1.5 px-3.5 text-[14px] text-white placeholder:text-white/18 outline-none no-scrollbar leading-relaxed border-none focus:ring-0"
              rows={1}
            />
            <div className="flex items-center justify-between px-2.5 pb-2.5 pt-1 gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-primary/20 bg-primary/[0.06] text-[11px] text-primary/70 shrink-0">
                <span className="text-[12px]">🔮</span>
                <span className="font-semibold hidden xs:inline">17 Models · Parallel</span>
                <span className="font-semibold xs:hidden">×17</span>
              </div>
              <button onClick={() => send()} disabled={!canSend}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-xl font-semibold transition-all active:scale-95 shrink-0 disabled:opacity-25 disabled:cursor-not-allowed",
                  canSend
                    ? "px-4 py-2 bg-gradient-to-r from-primary to-pink-500 text-white text-[12px] shadow-[0_0_16px_rgba(124,58,237,0.35)] hover:shadow-[0_0_24px_rgba(124,58,237,0.5)]"
                    : "w-9 h-9 bg-white/[0.06] text-white/25"
                )}>
                <FiSend className="w-3.5 h-3.5" />
                {canSend && <span className="hidden sm:inline text-[12px]">Send</span>}
              </button>
            </div>
          </div>
          <p className="text-center text-[10px] text-white/14 mt-2">
            17 Gyan AI models · Fast · Smart · Vision · Open · Precision · Max
          </p>
        </div>
      </div>
      <input ref={fileRef} type="file" accept={TEXT_EXTS} className="hidden" onChange={handleFileChange} />
      <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
    </div>
  );
}
