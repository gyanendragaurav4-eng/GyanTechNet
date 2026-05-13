import { Link, useLocation } from "wouter";
import { ReactNode, useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FiShield } from "react-icons/fi";
import {
  FiSettings, FiChevronDown, FiChevronRight, FiLogOut,
  FiMenu, FiX, FiBell, FiCommand, FiZap, FiPlus,
} from "react-icons/fi";
import { cn } from "@/lib/utils";
import { CommandPalette } from "@/components/CommandPalette";
import { FloatingAI } from "@/components/FloatingAI";
import { useNotifications } from "@/contexts/NotificationContext";

type AppItem = { emoji: string; name: string; href: string; badge?: string };

const aiApps: AppItem[] = [
  { emoji: "💬", name: "AI Chat",          href: "/chat" },
  { emoji: "⚡", name: "Multi-Chat",       href: "/multi-chat",     badge: "NEW" },
  { emoji: "📋", name: "AI Workflows",     href: "/workflows",      badge: "NEW" },
  { emoji: "🧠", name: "Command Center",   href: "/command-center", badge: "NEW" },
  { emoji: "🖼️", name: "Image AI",        href: "/image-ai" },
  { emoji: "🎬", name: "Video AI",         href: "/video-ai" },
  { emoji: "📞", name: "AI Video Call",    href: "/video-call" },
  { emoji: "🎵", name: "Music AI",         href: "/music-ai" },
  { emoji: "🔊", name: "Text to Speech",   href: "/tts" },
  { emoji: "🌐", name: "Translator",       href: "/translator" },
  { emoji: "✍️", name: "Stories",          href: "/stories",  badge: "AI" },
  { emoji: "🔍", name: "Research",         href: "/research", badge: "AI" },
];
const workspaceApps: AppItem[] = [
  { emoji: "📝", name: "Notes",        href: "/notes" },
  { emoji: "📅", name: "Calendar",     href: "/calendar" },
  { emoji: "✅", name: "Tasks",        href: "/tasks" },
  { emoji: "⏱️", name: "Focus Timer",  href: "/focus" },
  { emoji: "📊", name: "Projects",     href: "/projects" },
  { emoji: "📋", name: "Forms",        href: "/forms" },
  { emoji: "🎯", name: "Slides",       href: "/slides" },
  { emoji: "📈", name: "Sheets",       href: "/sheets" },
  { emoji: "🎨", name: "Whiteboard",   href: "/whiteboard" },
  { emoji: "📄", name: "GyanDocs",     href: "/docs" },
  { emoji: "✏️", name: "Draw",         href: "/draw" },
  { emoji: "📁", name: "Files",        href: "/files" },
  { emoji: "🧠", name: "Memory",       href: "/memory" },
  { emoji: "📦", name: "Workspaces",   href: "/workspaces" },
  { emoji: "📧", name: "Email",        href: "/email" },
  { emoji: "💬", name: "Conversation", href: "/conversation" },
];
const toolApps: AppItem[] = [
  { emoji: "🧮", name: "Calculator",    href: "/calculator" },
  { emoji: "📷", name: "QR Generator",  href: "/qr-generator" },
  { emoji: "☁️", name: "Weather",       href: "/weather" },
  { emoji: "🔄", name: "File Converter",href: "/converter" },
  { emoji: "🔒", name: "Passwords",     href: "/passwords" },
  { emoji: "🎮", name: "Games",         href: "/games" },
  { emoji: "🏏", name: "Live Cricket",  href: "/cricket" },
  { emoji: "🎧", name: "Music Player",  href: "/music-player" },
  { emoji: "🎞️", name: "Video Editor", href: "/video-editor" },
];
const proApps: AppItem[] = [
  { emoji: "📊", name: "Analytics", href: "/analytics", badge: "PRO" },
  { emoji: "📚", name: "Wiki",      href: "/wiki" },
  { emoji: "🎓", name: "Learn",     href: "/learn" },
  { emoji: "📹", name: "Meet",      href: "/meet" },
  { emoji: "👥", name: "CRM",       href: "/crm",       badge: "PRO" },
  { emoji: "💰", name: "Invoices",  href: "/invoices",  badge: "PRO" },
  { emoji: "💼", name: "Business",  href: "/business",  badge: "NEW" },
];
const devApps: AppItem[] = [
  { emoji: "🛠️", name: "API Tester",      href: "/api-tester" },
  { emoji: "🗄️", name: "DB Manager",      href: "/db-manager" },
  { emoji: "🔑", name: "API Keys",         href: "/api-keys" },
  { emoji: "⚙️", name: "Settings",         href: "/settings" },
  { emoji: "🤖", name: "Gyan Intelligence",href: "/intelligence" },
  { emoji: "💻", name: "Dev Console",      href: "/dev-console" },
];

type Section = { label: string; items: AppItem[]; color: string };
const sections: Section[] = [
  { label: "AI Tools",     items: aiApps,        color: "text-violet-400/60" },
  { label: "Workspace",    items: workspaceApps, color: "text-blue-400/60" },
  { label: "Tools",        items: toolApps,      color: "text-emerald-400/60" },
  { label: "Pro Features", items: proApps,       color: "text-amber-400/60" },
  { label: "Developer",    items: devApps,       color: "text-pink-400/60" },
];

function getPageTitle(loc: string): string {
  const all = [...aiApps,...workspaceApps,...toolApps,...proApps,...devApps];
  return all.find(a => a.href === loc)?.name ?? "GyanTechNet";
}

const BOTTOM_TABS = [
  { emoji: "🧠", label: "Hub",   href: "/command-center", match: ["/command-center"] },
  { emoji: "💬", label: "Chat",  href: "/chat",           match: ["/chat","/multi-chat"] },
  { emoji: "📋", label: "Flow",  href: "/workflows",      match: ["/workflows"] },
  { emoji: "🎮", label: "Games", href: "/games",          match: ["/games"] },
  { emoji: "👤", label: "Me",    href: "/settings",       match: ["/settings","/api-keys","/intelligence","/dev-console","/api-tester","/db-manager"] },
];

function NavItem({ app, active, onNav }: { app: AppItem; active: boolean; onNav?: () => void }) {
  return (
    <Link href={app.href} onClick={onNav}
      className={cn(
        "flex items-center gap-2.5 px-2.5 py-[6.5px] rounded-lg text-[12.5px] transition-all relative group",
        active
          ? "bg-gradient-to-r from-violet-500/[0.18] to-purple-500/[0.08] text-violet-300 font-semibold shadow-[inset_0_0_12px_rgba(124,58,237,0.08)]"
          : "text-white/40 hover:bg-white/[0.05] hover:text-white/80"
      )}>
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-gradient-to-b from-violet-400 to-purple-500 rounded-full" />
      )}
      <span className={cn("text-[13.5px] shrink-0 leading-none transition-transform", active && "scale-110")}>{app.emoji}</span>
      <span className="truncate">{app.name}</span>
      {app.badge && (
        <span className={cn(
          "ml-auto text-[8.5px] font-bold px-1.5 py-0.5 rounded-full shrink-0 border",
          app.badge === "PRO" ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
          : app.badge === "NEW" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          : "bg-violet-500/10 text-violet-300 border-violet-500/20"
        )}>{app.badge}</span>
      )}
    </Link>
  );
}

function SectionGroup({ section, location, onNav }: { section: Section; location: string; onNav?: () => void }) {
  const hasActive = section.items.some(a => a.href === location);
  const [open, setOpen] = useState(hasActive || section.label === "AI Tools" || section.label === "Workspace");
  return (
    <div>
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-2.5 py-1.5 mb-0.5 rounded-md hover:bg-white/[0.03] transition-colors group">
        <span className={cn("text-[9.5px] font-black uppercase tracking-[0.14em] transition-colors group-hover:opacity-80", section.color)}>{section.label}</span>
        {open
          ? <FiChevronDown className="w-3 h-3 text-white/10 group-hover:text-white/25 transition-colors" />
          : <FiChevronRight className="w-3 h-3 text-white/10 group-hover:text-white/25 transition-colors" />
        }
      </button>
      {open && (
        <div className="space-y-px mb-2">
          {section.items.map(app => <NavItem key={app.href} app={app} active={location === app.href} onNav={onNav} />)}
        </div>
      )}
    </div>
  );
}

function NotifPanel({ onClose }: { onClose: () => void }) {
  const { notifications, markAllRead, dismiss, clearAll } = useNotifications();
  useEffect(() => { markAllRead(); }, [markAllRead]);

  const TYPE_COLORS: Record<string, string> = {
    success: "text-emerald-400", info: "text-blue-400", warning: "text-amber-400",
    error: "text-red-400", ai: "text-violet-400",
  };

  return (
    <div className="absolute top-full right-0 mt-2 w-72 bg-[#0d0d1e] border border-white/[0.1] rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.7),0_0_0_1px_rgba(124,58,237,0.08)] z-50 overflow-hidden backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07] bg-white/[0.02]">
        <div className="text-white font-bold text-[13px]">Notifications</div>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button onClick={clearAll} className="text-white/25 hover:text-white/55 text-[10px] transition-colors">Clear all</button>
          )}
          <button onClick={onClose} className="p-1 text-white/25 hover:text-white/60 rounded-md hover:bg-white/[0.07] transition-all">
            <FiX className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="max-h-72 overflow-y-auto no-scrollbar">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.04] flex items-center justify-center text-xl mb-1">🔔</div>
            <div className="text-white/25 text-[12px]">No notifications yet</div>
          </div>
        ) : notifications.map(n => (
          <div key={n.id} className="flex items-start gap-3 px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.025] group transition-colors">
            <span className="text-xl shrink-0 mt-0.5">{n.icon || "🔔"}</span>
            <div className="flex-1 min-w-0">
              <div className={cn("text-[12px] font-bold", TYPE_COLORS[n.type] || "text-white/80")}>{n.title}</div>
              {n.body && <div className="text-white/40 text-[11px] mt-0.5 line-clamp-2 leading-relaxed">{n.body}</div>}
              <div className="text-white/15 text-[10px] mt-1">{new Date(n.ts).toLocaleTimeString()}</div>
            </div>
            <button onClick={() => dismiss(n.id)} className="opacity-0 group-hover:opacity-100 p-1 text-white/20 hover:text-white/50 transition-all rounded-md hover:bg-white/[0.07]">
              <FiX className="w-2.5 h-2.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SidebarContent({ location, onNav, onOpenPalette }: { location: string; onNav?: () => void; onOpenPalette: () => void }) {
  const { user, logout, isDeveloper } = useAuth();
  const { unreadCount } = useNotifications();
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-3 pt-4 pb-3 border-b border-white/[0.05] shrink-0 space-y-2">
        {/* Logo row */}
        <div className="flex items-center gap-2">
          <Link href="/command-center" onClick={onNav}
            className="flex items-center gap-2.5 group flex-1 min-w-0 px-0.5">
            <div className="relative w-7 h-7 shrink-0">
              <img src="/gyan-logo.jpg" alt="GyanTechNet"
                className="w-full h-full rounded-lg object-cover border border-violet-500/30"
                style={{ boxShadow: "0 0 10px rgba(139,92,246,0.5)" }} />
            </div>
            <span className="font-black text-[14px] text-white/90 group-hover:text-white transition-colors truncate tracking-tight">GyanTechNet</span>
            <span className="ml-auto text-[8px] bg-gradient-to-r from-violet-500/20 to-pink-500/20 border border-violet-500/20 text-violet-300 font-bold px-1.5 py-0.5 rounded-full shrink-0">AI</span>
          </Link>
          {/* Bell */}
          <div className="relative shrink-0">
            <button onClick={() => setNotifOpen(v => !v)}
              className="p-1.5 text-white/30 hover:text-white/70 rounded-lg hover:bg-white/[0.06] transition-all relative">
              <FiBell className="w-3.5 h-3.5" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-violet-500 rounded-full border border-[#08081a] shadow-[0_0_6px_rgba(124,58,237,0.8)]" />
              )}
            </button>
            {notifOpen && <NotifPanel onClose={() => setNotifOpen(false)} />}
          </div>
        </div>

        {/* Search / command */}
        <button onClick={onOpenPalette}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white/30 hover:text-white/60 hover:bg-white/[0.07] hover:border-white/[0.12] transition-all text-[12px] group">
          <FiCommand className="w-3 h-3 shrink-0 group-hover:text-violet-400 transition-colors" />
          <span className="flex-1 text-left text-[11.5px]">Search or ask AI...</span>
          <kbd className="text-[9px] font-mono bg-white/[0.08] px-1.5 py-0.5 rounded text-white/20">⌘K</kbd>
        </button>

        {/* Quick actions */}
        <div className="flex gap-1.5">
          <Link href="/chat" onClick={onNav}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600/20 to-purple-600/10 hover:from-violet-600/30 hover:to-purple-600/20 border border-violet-500/20 text-violet-300 text-[11px] font-bold transition-all">
            <FiPlus className="w-3 h-3" /> New Chat
          </Link>
          <Link href="/multi-chat" onClick={onNav}
            className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/15 text-blue-400 text-[11px] font-bold transition-all" title="Multi-Chat">
            <FiZap className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-3 px-2 space-y-3">
        {sections.map(s => <SectionGroup key={s.label} section={s} location={location} onNav={onNav} />)}
      </div>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-white/[0.05] space-y-2 shrink-0">
        {/* Developer admin button */}
        {isDeveloper && (
          <Link href="/admin" onClick={onNav}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-violet-600/20 to-pink-600/10 border border-violet-500/25 hover:border-violet-500/40 transition-all group">
            <FiShield className="w-3.5 h-3.5 text-violet-400 group-hover:text-violet-300 transition-colors" />
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold text-violet-300 group-hover:text-white transition-colors">Admin Console</div>
              <div className="text-[9.5px] text-violet-400/50">Manage users & platform</div>
            </div>
            <span className="text-[8px] font-black bg-violet-500/20 border border-violet-500/30 text-violet-300 px-1.5 py-0.5 rounded-full shrink-0">DEV</span>
          </Link>
        )}

        {/* Upgrade banner — only for non-developers */}
        {!isDeveloper && (
          <Link href="/subscription" onClick={onNav}
            className="block px-3 py-2.5 rounded-xl bg-gradient-to-r from-violet-500/[0.12] via-purple-500/[0.08] to-pink-500/[0.06] border border-violet-500/[0.2] hover:border-violet-500/40 hover:from-violet-500/[0.20] transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-white/80 group-hover:text-white transition-colors">
                  {user?.plan === "Free" ? "Upgrade to Pro" : `${user?.plan} Plan ✓`}
                </div>
                <div className="text-[10px] text-white/35">
                  {user?.plan === "Free" ? "₹499/mo · Unlock all 50+ tools" : "Manage subscription"}
                </div>
              </div>
              <div className="text-[18px]">{user?.plan === "Free" ? "⚡" : "✨"}</div>
            </div>
          </Link>
        )}

        {/* User profile */}
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.09] transition-all group">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-black text-[11px] shrink-0 shadow-[0_0_10px_rgba(124,58,237,0.3)]">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold text-white/85 truncate leading-tight">{user?.name || "User"}</div>
            <div className="text-[10px] text-violet-400/60 truncate">{user?.email || "user@gyan.tech"}</div>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <Link href="/settings" onClick={onNav}
              className="p-1.5 text-white/20 hover:text-white/60 rounded-lg hover:bg-white/[0.07] transition-all">
              <FiSettings className="w-3.5 h-3.5" />
            </Link>
            <button onClick={() => logout()}
              className="p-1.5 text-white/20 hover:text-red-400 rounded-lg hover:bg-red-500/[0.08] transition-all">
              <FiLogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setDrawerOpen(false); }, [location]);
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setPaletteOpen(v => !v); }
    if (e.key === "Escape") { setPaletteOpen(false); setNotifOpen(false); }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    try {
      const r = JSON.parse(localStorage.getItem("gyan_recent_pages") || "[]") as string[];
      const updated = [location, ...r.filter((x: string) => x !== location)].slice(0, 12);
      localStorage.setItem("gyan_recent_pages", JSON.stringify(updated));
    } catch { /* ignore */ }
  }, [location]);

  const pageTitle = getPageTitle(location);
  const isActiveTab = (tab: typeof BOTTOM_TABS[0]) =>
    tab.match.some(m => location === m || location.startsWith(m + "/"));

  return (
    <div className="flex h-screen w-full bg-[#06060f] overflow-hidden text-white">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(124,58,237,0.05)_0%,transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(236,72,153,0.03)_0%,transparent_70%)]" />
      </div>

      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
      <FloatingAI />

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[218px] shrink-0 flex-col h-full relative z-10"
        style={{ background: "linear-gradient(180deg, #08081a 0%, #070714 100%)", borderRight: "1px solid rgba(255,255,255,0.045)" }}>
        {/* Top glow line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
        <SidebarContent location={location} onOpenPalette={() => setPaletteOpen(true)} />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div ref={drawerRef}
            className="relative w-[270px] h-full flex flex-col z-10 shadow-[0_0_80px_rgba(0,0,0,0.8)] animate-slide-in-left"
            style={{ background: "linear-gradient(180deg, #08081a 0%, #070714 100%)", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />
            <button onClick={() => setDrawerOpen(false)}
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-white/[0.06] text-white/50 hover:text-white hover:bg-white/[0.1] transition-all z-10">
              <FiX className="w-3.5 h-3.5" />
            </button>
            <SidebarContent location={location} onNav={() => setDrawerOpen(false)} onOpenPalette={() => { setDrawerOpen(false); setPaletteOpen(true); }} />
          </div>
        </div>
      )}

      {/* Main area */}
      <main className="flex-1 relative flex flex-col h-full overflow-hidden bg-[#06060f] z-10 min-w-0">

        {/* Mobile top header */}
        <header className="md:hidden flex items-center gap-3 px-4 h-[54px] border-b border-white/[0.05] shrink-0 z-20"
          style={{ background: "rgba(8,8,26,0.95)", backdropFilter: "blur(20px)" }}>
          <button onClick={() => setDrawerOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-white/50 hover:text-white hover:bg-white/[0.07] transition-all active:scale-95">
            <FiMenu className="w-5 h-5" />
          </button>
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <img src="/gyan-logo.jpg" alt="" className="w-6 h-6 rounded-lg object-cover border border-violet-500/30 shrink-0" />
            <span className="text-[14px] font-bold text-white/90 truncate">{pageTitle}</span>
          </div>
          <button onClick={() => setPaletteOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-white/40 hover:text-white hover:bg-white/[0.07] transition-all">
            <FiCommand className="w-4 h-4" />
          </button>
          <div className="relative">
            <button onClick={() => setNotifOpen(v => !v)}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-white/40 hover:text-white hover:bg-white/[0.07] transition-all relative">
              <FiBell className="w-4 h-4" />
              {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-violet-500 rounded-full shadow-[0_0_5px_rgba(124,58,237,0.8)]" />}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-full mt-1 z-50">
                <NotifPanel onClose={() => setNotifOpen(false)} />
              </div>
            )}
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-black text-[11px] shadow-[0_0_12px_rgba(124,58,237,0.4)]">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {children}
        </div>

        {/* Mobile bottom nav */}
        <nav className="md:hidden shrink-0 border-t border-white/[0.06] z-20"
          style={{ background: "rgba(7,7,20,0.97)", backdropFilter: "blur(24px)", paddingBottom: "env(safe-area-inset-bottom,0px)" }}>
          <div className="flex items-stretch h-[58px]">
            {BOTTOM_TABS.map(tab => {
              const active = isActiveTab(tab);
              return (
                <Link key={tab.href} href={tab.href}
                  className={cn("flex-1 flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 relative", active ? "text-violet-300" : "text-white/30")}>
                  {active && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[2px] rounded-full bg-gradient-to-r from-violet-500 to-pink-500 shadow-[0_0_8px_rgba(124,58,237,0.7)]" />
                  )}
                  <span className={cn("text-[21px] leading-none transition-transform", active && "scale-115")}>{tab.emoji}</span>
                  <span className={cn("text-[10px] font-bold transition-colors", active ? "text-violet-300" : "text-white/25")}>{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </main>
    </div>
  );
}
