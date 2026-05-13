import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { FiSearch, FiZap, FiArrowRight, FiClock, FiX, FiCornerDownLeft } from "react-icons/fi";
import { cn } from "@/lib/utils";

const ALL_APPS = [
  { emoji:"💬", name:"AI Chat",          href:"/chat",          cat:"AI Tools" },
  { emoji:"🖼️", name:"Image AI",         href:"/image-ai",      cat:"AI Tools" },
  { emoji:"🎬", name:"Video AI",          href:"/video-ai",      cat:"AI Tools" },
  { emoji:"🎵", name:"Music AI",          href:"/music-ai",      cat:"AI Tools" },
  { emoji:"🔊", name:"Text to Speech",    href:"/tts",           cat:"AI Tools" },
  { emoji:"🌐", name:"Translator",        href:"/translator",    cat:"AI Tools" },
  { emoji:"✍️", name:"Stories",           href:"/stories",       cat:"AI Tools" },
  { emoji:"🔍", name:"Research",          href:"/research",      cat:"AI Tools" },
  { emoji:"📹", name:"AI Video Call",     href:"/video-call",    cat:"AI Tools" },
  { emoji:"⚡", name:"Multi-Chat",        href:"/multi-chat",    cat:"AI Tools" },
  { emoji:"📋", name:"AI Workflows",      href:"/workflows",     cat:"AI Tools" },
  { emoji:"🧠", name:"Command Center",    href:"/command-center",cat:"AI Tools" },
  { emoji:"📝", name:"Notes",             href:"/notes",         cat:"Workspace" },
  { emoji:"📅", name:"Calendar",          href:"/calendar",      cat:"Workspace" },
  { emoji:"✅", name:"Tasks",             href:"/tasks",         cat:"Workspace" },
  { emoji:"⏱️", name:"Focus Timer",       href:"/focus",         cat:"Workspace" },
  { emoji:"📊", name:"Projects",          href:"/projects",      cat:"Workspace" },
  { emoji:"📋", name:"Forms",             href:"/forms",         cat:"Workspace" },
  { emoji:"🎯", name:"Slides",            href:"/slides",        cat:"Workspace" },
  { emoji:"📈", name:"Sheets",            href:"/sheets",        cat:"Workspace" },
  { emoji:"🎨", name:"Whiteboard",        href:"/whiteboard",    cat:"Workspace" },
  { emoji:"📄", name:"GyanDocs",          href:"/docs",          cat:"Workspace" },
  { emoji:"✏️", name:"Draw",              href:"/draw",          cat:"Workspace" },
  { emoji:"📁", name:"Files",             href:"/files",         cat:"Workspace" },
  { emoji:"🧠", name:"Memory",            href:"/memory",        cat:"Workspace" },
  { emoji:"📦", name:"Workspaces",        href:"/workspaces",    cat:"Workspace" },
  { emoji:"📧", name:"Email",             href:"/email",         cat:"Workspace" },
  { emoji:"💬", name:"Conversation",      href:"/conversation",  cat:"Workspace" },
  { emoji:"🧮", name:"Calculator",        href:"/calculator",    cat:"Tools" },
  { emoji:"📷", name:"QR Generator",      href:"/qr-generator",  cat:"Tools" },
  { emoji:"☁️", name:"Weather",           href:"/weather",       cat:"Tools" },
  { emoji:"🔄", name:"File Converter",    href:"/converter",     cat:"Tools" },
  { emoji:"🔒", name:"Passwords",         href:"/passwords",     cat:"Tools" },
  { emoji:"🎮", name:"Games",             href:"/games",         cat:"Tools" },
  { emoji:"🏏", name:"Live Cricket",      href:"/cricket",       cat:"Tools" },
  { emoji:"🎧", name:"Music Player",      href:"/music-player",  cat:"Tools" },
  { emoji:"🎞️", name:"Video Editor",     href:"/video-editor",  cat:"Tools" },
  { emoji:"📊", name:"Analytics",         href:"/analytics",     cat:"Pro" },
  { emoji:"📚", name:"Wiki",              href:"/wiki",          cat:"Pro" },
  { emoji:"🎓", name:"Learn",             href:"/learn",         cat:"Pro" },
  { emoji:"📹", name:"Meet",              href:"/meet",          cat:"Pro" },
  { emoji:"👥", name:"CRM",               href:"/crm",           cat:"Pro" },
  { emoji:"💰", name:"Invoices",          href:"/invoices",      cat:"Pro" },
  { emoji:"💼", name:"Business",          href:"/business",      cat:"Pro" },
  { emoji:"🛠️", name:"API Tester",        href:"/api-tester",    cat:"Developer" },
  { emoji:"🗄️", name:"DB Manager",        href:"/db-manager",    cat:"Developer" },
  { emoji:"🔑", name:"API Keys",          href:"/api-keys",      cat:"Developer" },
  { emoji:"⚙️", name:"Settings",          href:"/settings",      cat:"Developer" },
  { emoji:"🤖", name:"Gyan Intelligence", href:"/intelligence",  cat:"Developer" },
  { emoji:"💻", name:"Dev Console",       href:"/dev-console",   cat:"Developer" },
];

const QUICK_ACTIONS = [
  { emoji:"💬", label:"Ask AI anything",   prefix:"ask: " },
  { emoji:"💻", label:"Write code",         prefix:"code: " },
  { emoji:"🔬", label:"Research a topic",   prefix:"research: " },
  { emoji:"📝", label:"Summarize text",     prefix:"summarize: " },
  { emoji:"🌐", label:"Translate text",     prefix:"translate: " },
];

type Item = { emoji: string; label: string; sub?: string; href?: string; action?: () => void; badge?: string };

interface CommandPaletteProps {
  onClose: () => void;
  onAIQuery?: (q: string, mode: string) => void;
}

export function CommandPalette({ onClose, onAIQuery }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(0);
  const [, navigate] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const getRecent = (): Item[] => {
    try {
      const r = JSON.parse(localStorage.getItem("gyan_recent_pages") || "[]") as string[];
      return r.slice(0, 4).map(href => {
        const app = ALL_APPS.find(a => a.href === href);
        return app ? { emoji: app.emoji, label: app.name, sub: "Recent", href: app.href } : null;
      }).filter(Boolean) as Item[];
    } catch { return []; }
  };

  const buildItems = useCallback((): Item[] => {
    const q = query.toLowerCase().trim();

    if (!q) {
      const recent = getRecent();
      const featured: Item[] = [
        { emoji:"⚡", label:"Multi-Chat", sub:"Run multiple AI models side by side", href:"/multi-chat" },
        { emoji:"📋", label:"AI Workflows", sub:"Chain AI tasks together", href:"/workflows" },
        { emoji:"🧠", label:"Command Center", sub:"Your AI dashboard", href:"/command-center" },
      ];
      return [
        ...recent,
        ...(recent.length > 0 ? [] : featured),
        ...QUICK_ACTIONS.map(a => ({ emoji: a.emoji, label: a.label, sub: "Quick action → type to use", action: () => setQuery(a.prefix) })),
      ];
    }

    // Check for AI command prefix
    const aiPrefixes = ["ask: ","code: ","research: ","summarize: ","translate: "];
    for (const p of aiPrefixes) {
      if (q.startsWith(p.toLowerCase())) {
        const prompt = query.slice(p.length).trim();
        if (prompt) {
          const modeMap: Record<string, string> = {
            "ask: ": "Normal","code: ": "Code","research: ": "Research","summarize: ": "Summarize","translate: ": "Translate"
          };
          return [{
            emoji:"🤖",
            label:`Ask AI: "${prompt}"`,
            sub:`Send to AI in ${modeMap[p.toLowerCase()] ?? "Normal"} mode`,
            action: () => {
              if (onAIQuery) onAIQuery(prompt, modeMap[p.toLowerCase()] ?? "Normal");
              else navigate("/chat");
              onClose();
            }
          }];
        }
      }
    }

    const filtered = ALL_APPS.filter(a =>
      a.name.toLowerCase().includes(q) || a.cat.toLowerCase().includes(q)
    ).slice(0, 10).map(a => ({ emoji: a.emoji, label: a.name, sub: a.cat, href: a.href }));

    if (!filtered.length) {
      return [{
        emoji:"🤖",
        label:`Ask AI: "${query}"`,
        sub:"Press Enter to send this to AI Chat",
        action: () => { navigate("/chat"); onClose(); }
      }];
    }
    return filtered;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, navigate, onClose, onAIQuery]);

  const items = buildItems();

  useEffect(() => { setSel(0); }, [query]);

  const select = useCallback((item: Item) => {
    if (item.href) {
      // Save to recent
      try {
        const r = JSON.parse(localStorage.getItem("gyan_recent_pages") || "[]") as string[];
        const updated = [item.href, ...r.filter((x: string) => x !== item.href)].slice(0, 8);
        localStorage.setItem("gyan_recent_pages", JSON.stringify(updated));
      } catch { /* ignore */ }
      navigate(item.href);
      onClose();
    } else if (item.action) {
      item.action();
    }
  }, [navigate, onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setSel(s => Math.min(s + 1, items.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setSel(s => Math.max(s - 1, 0)); }
      if (e.key === "Enter") { e.preventDefault(); if (items[sel]) select(items[sel]); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [items, sel, select, onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[12vh] px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-[#0d0d1e] border border-white/[0.12] rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.7),0_0_0_1px_rgba(124,58,237,0.15)] overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.08]">
          <FiSearch className="w-4.5 h-4.5 text-violet-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search apps, ask AI, or type 'code: ' to write code..."
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30"
          />
          {query && (
            <button onClick={() => setQuery("")} className="p-1 text-white/30 hover:text-white/60 transition-colors">
              <FiX className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-white/[0.06] border border-white/[0.08] text-[10px] text-white/30 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[360px] overflow-y-auto no-scrollbar py-1.5">
          {!query && (
            <div className="px-4 py-1.5 text-[10px] font-bold text-white/20 uppercase tracking-[0.1em] flex items-center gap-2">
              <FiClock className="w-3 h-3" />
              {getRecent().length ? "Recent" : "Quick Actions"}
            </div>
          )}
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => select(item)}
              onMouseEnter={() => setSel(i)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all",
                sel === i ? "bg-violet-500/[0.15]" : "hover:bg-white/[0.03]"
              )}>
              <span className="text-[18px] shrink-0 leading-none">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className={cn("text-sm font-medium truncate", sel === i ? "text-white" : "text-white/75")}>
                  {item.label}
                </div>
                {item.sub && <div className="text-[11px] text-white/30 truncate">{item.sub}</div>}
              </div>
              {sel === i && (
                <FiCornerDownLeft className="w-3.5 h-3.5 text-violet-400 shrink-0" />
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-1.5 text-[11px] text-white/25">
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.07] font-mono text-[10px]">↑↓</kbd>
            <span>navigate</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-white/25">
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.07] font-mono text-[10px]">↵</kbd>
            <span>open</span>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-[11px] text-white/25">
            <FiZap className="w-3 h-3 text-violet-400" />
            <span className="text-violet-400/60">Try: "code: write a sorting algorithm"</span>
          </div>
        </div>
      </div>
    </div>
  );
}
