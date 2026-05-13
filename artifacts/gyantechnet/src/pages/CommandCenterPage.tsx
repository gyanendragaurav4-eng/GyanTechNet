import { useState, useEffect } from "react";
import { Link } from "wouter";
import { FiZap, FiMessageSquare, FiCpu, FiTrendingUp, FiStar, FiClock, FiArrowRight, FiPlus, FiX } from "react-icons/fi";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const ALL_APPS = [
  { emoji:"💬", name:"AI Chat",        href:"/chat",          cat:"ai",        hot:true },
  { emoji:"⚡", name:"Multi-Chat",     href:"/multi-chat",    cat:"ai",        hot:true, badge:"NEW" },
  { emoji:"📋", name:"AI Workflows",   href:"/workflows",     cat:"ai",        hot:true, badge:"NEW" },
  { emoji:"🖼️", name:"Image AI",      href:"/image-ai",      cat:"ai" },
  { emoji:"🎬", name:"Video AI",       href:"/video-ai",      cat:"ai" },
  { emoji:"🎵", name:"Music AI",       href:"/music-ai",      cat:"ai" },
  { emoji:"🔊", name:"Text to Speech", href:"/tts",           cat:"ai" },
  { emoji:"🌐", name:"Translator",     href:"/translator",    cat:"ai" },
  { emoji:"✍️", name:"Stories",        href:"/stories",       cat:"ai" },
  { emoji:"🔍", name:"Research",       href:"/research",      cat:"ai" },
  { emoji:"📝", name:"Notes",          href:"/notes",         cat:"workspace" },
  { emoji:"📅", name:"Calendar",       href:"/calendar",      cat:"workspace" },
  { emoji:"✅", name:"Tasks",          href:"/tasks",         cat:"workspace" },
  { emoji:"⏱️", name:"Focus Timer",    href:"/focus",         cat:"workspace" },
  { emoji:"📊", name:"Projects",       href:"/projects",      cat:"workspace" },
  { emoji:"🎯", name:"Slides",         href:"/slides",        cat:"workspace" },
  { emoji:"📈", name:"Sheets",         href:"/sheets",        cat:"workspace" },
  { emoji:"🎨", name:"Whiteboard",     href:"/whiteboard",    cat:"workspace" },
  { emoji:"✏️", name:"Draw",           href:"/draw",          cat:"workspace" },
  { emoji:"📁", name:"Files",          href:"/files",         cat:"workspace" },
  { emoji:"📄", name:"GyanDocs",       href:"/docs",          cat:"workspace" },
  { emoji:"📧", name:"Email",          href:"/email",         cat:"workspace" },
  { emoji:"🧮", name:"Calculator",     href:"/calculator",    cat:"tools" },
  { emoji:"📷", name:"QR Generator",   href:"/qr-generator",  cat:"tools" },
  { emoji:"☁️", name:"Weather",        href:"/weather",       cat:"tools" },
  { emoji:"🔄", name:"File Converter", href:"/converter",     cat:"tools" },
  { emoji:"🔒", name:"Passwords",      href:"/passwords",     cat:"tools" },
  { emoji:"🎮", name:"Games",          href:"/games",         cat:"tools" },
  { emoji:"🏏", name:"Live Cricket",   href:"/cricket",       cat:"tools" },
  { emoji:"📊", name:"Analytics",      href:"/analytics",     cat:"pro" },
  { emoji:"📚", name:"Wiki",           href:"/wiki",          cat:"pro" },
  { emoji:"🎓", name:"Learn",          href:"/learn",         cat:"pro" },
  { emoji:"📹", name:"Meet",           href:"/meet",          cat:"pro" },
  { emoji:"👥", name:"CRM",            href:"/crm",           cat:"pro" },
  { emoji:"💰", name:"Invoices",       href:"/invoices",      cat:"pro" },
  { emoji:"💼", name:"Business",       href:"/business",      cat:"pro" },
  { emoji:"🛠️", name:"API Tester",     href:"/api-tester",    cat:"dev" },
  { emoji:"🗄️", name:"DB Manager",     href:"/db-manager",    cat:"dev" },
  { emoji:"🔑", name:"API Keys",       href:"/api-keys",      cat:"dev" },
  { emoji:"⚙️", name:"Settings",       href:"/settings",      cat:"dev" },
  { emoji:"🤖", name:"Gyan Intelligence",href:"/intelligence", cat:"dev" },
  { emoji:"💻", name:"Dev Console",    href:"/dev-console",   cat:"dev" },
];

const STATS_CONFIG = [
  { key:"total_chats",   label:"Total Chats",     icon:"💬", color:"from-violet-600/20 to-purple-700/10", border:"border-violet-500/20" },
  { key:"ai_queries",    label:"AI Queries",      icon:"🤖", color:"from-blue-600/20 to-cyan-700/10",     border:"border-blue-500/20" },
  { key:"tasks_done",    label:"Tasks Done",      icon:"✅", color:"from-emerald-600/20 to-teal-700/10",  border:"border-emerald-500/20" },
  { key:"time_saved",    label:"Hours Saved",     icon:"⏱️", color:"from-amber-600/20 to-orange-700/10",  border:"border-amber-500/20" },
];

const AI_MODELS_STATUS = [
  { name:"Gyan AI Fast",   provider:"Gyan Intelligence", status:"online", latency:"~0.8s", color:"#7c3aed" },
  { name:"Gyan Smart",     provider:"Gyan Pro Series",   status:"online", latency:"~1.2s", color:"#a855f7" },
  { name:"Gyan Flash",     provider:"Gyan Vision",       status:"online", latency:"~0.6s", color:"#ec4899" },
  { name:"Gyan Deep V3",   provider:"Gyan Deep Series",  status:"online", latency:"~1.0s", color:"#3b82f6" },
  { name:"Gyan Open 70B",  provider:"Gyan Open Series",  status:"online", latency:"~1.5s", color:"#06b6d4" },
  { name:"Gyan X",         provider:"Gyan X Series",     status:"online", latency:"~0.9s", color:"#6366f1" },
];

const QUICK_ACTIONS = [
  { emoji:"💬", label:"New Chat",      href:"/chat",         color:"bg-violet-500/15 border-violet-500/25 hover:bg-violet-500/25" },
  { emoji:"⚡", label:"Multi-Chat",   href:"/multi-chat",   color:"bg-blue-500/15 border-blue-500/25 hover:bg-blue-500/25" },
  { emoji:"📋", label:"New Workflow", href:"/workflows",    color:"bg-amber-500/15 border-amber-500/25 hover:bg-amber-500/25" },
  { emoji:"🖼️", label:"Generate Image",href:"/image-ai",   color:"bg-pink-500/15 border-pink-500/25 hover:bg-pink-500/25" },
  { emoji:"✍️", label:"Write Story",   href:"/stories",     color:"bg-emerald-500/15 border-emerald-500/25 hover:bg-emerald-500/25" },
  { emoji:"🔍", label:"Research",      href:"/research",    color:"bg-cyan-500/15 border-cyan-500/25 hover:bg-cyan-500/25" },
];

function StatCard({ label, icon, color, border, value }: { label: string; icon: string; color: string; border: string; value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const step = Math.ceil(value / 40);
    const iv = setInterval(() => setDisplay(d => {
      if (d + step >= value) { clearInterval(iv); return value; }
      return d + step;
    }), 30);
    return () => clearInterval(iv);
  }, [value]);
  return (
    <div className={cn("p-4 rounded-xl bg-gradient-to-br border", color, border)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xl">{icon}</span>
        <FiTrendingUp className="w-3.5 h-3.5 text-white/20" />
      </div>
      <div className="text-2xl font-black text-white">{display.toLocaleString()}</div>
      <div className="text-white/40 text-xs mt-0.5">{label}</div>
    </div>
  );
}

export default function CommandCenterPage() {
  const { user } = useAuth();
  const [pinnedApps, setPinnedApps] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("gyan_pinned") || '[]'); }
    catch { return []; }
  });
  const [catFilter, setCatFilter] = useState("all");
  const [appSearch, setAppSearch] = useState("");

  const stats = {
    total_chats: parseInt(localStorage.getItem("gyan_stat_chats") || "0") || 47,
    ai_queries:  parseInt(localStorage.getItem("gyan_stat_queries") || "0") || 312,
    tasks_done:  parseInt(localStorage.getItem("gyan_stat_tasks") || "0") || 89,
    time_saved:  parseInt(localStorage.getItem("gyan_stat_time") || "0") || 24,
  };

  const togglePin = (href: string) => {
    const next = pinnedApps.includes(href) ? pinnedApps.filter(h => h !== href) : [...pinnedApps, href].slice(0, 12);
    setPinnedApps(next);
    localStorage.setItem("gyan_pinned", JSON.stringify(next));
  };

  const CATS = ["all","ai","workspace","tools","pro","dev"];
  const filteredApps = ALL_APPS.filter(a => {
    if (catFilter !== "all" && a.cat !== catFilter) return false;
    if (appSearch && !a.name.toLowerCase().includes(appSearch.toLowerCase())) return false;
    return true;
  });
  const pinnedAppList = ALL_APPS.filter(a => pinnedApps.includes(a.href));

  return (
    <div className="h-full overflow-y-auto no-scrollbar bg-[#06060f]">
      <div className="px-5 py-5 space-y-6 max-w-5xl mx-auto">

        {/* Welcome */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <h1 className="text-white font-black text-2xl">
              Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">
                {user?.name?.split(" ")[0] || "there"} 👋
              </span>
            </h1>
            <p className="text-white/40 text-sm mt-0.5">Your AI command center — everything at your fingertips.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/50 text-xs">All AI models online</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STATS_CONFIG.map(s => (
            <StatCard key={s.key} label={s.label} icon={s.icon} color={s.color} border={s.border}
              value={stats[s.key as keyof typeof stats]} />
          ))}
        </div>

        {/* Quick actions */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FiZap className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-white font-bold text-sm">Quick Actions</span>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {QUICK_ACTIONS.map(a => (
              <Link key={a.href} href={a.href}
                className={cn("flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-center transition-all hover:scale-105 active:scale-95", a.color)}>
                <span className="text-2xl">{a.emoji}</span>
                <span className="text-white/70 text-[11px] font-semibold">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Pinned apps */}
        {pinnedAppList.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FiStar className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-white font-bold text-sm">Pinned Apps</span>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {pinnedAppList.map(a => (
                <div key={a.href} className="relative group">
                  <Link href={a.href}
                    className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-center transition-all">
                    <span className="text-2xl">{a.emoji}</span>
                    <span className="text-white/60 text-[10px] font-semibold truncate w-full text-center">{a.name}</span>
                  </Link>
                  <button onClick={() => togglePin(a.href)}
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-0.5 rounded bg-black/40 text-white/40 hover:text-red-400 transition-all">
                    <FiX className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Model status */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FiCpu className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-white font-bold text-sm">AI Model Status</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {AI_MODELS_STATUS.map(m => (
              <div key={m.name} className="flex items-center gap-3 p-3 rounded-xl bg-[#0d0d1e] border border-white/[0.07]">
                <div className="w-2 h-2 rounded-full shrink-0 shadow-[0_0_6px_currentColor]" style={{ background: m.color, color: m.color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-white text-xs font-semibold truncate">{m.name}</div>
                  <div className="text-white/30 text-[10px]">{m.provider}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-emerald-400 text-[10px] font-bold">{m.status}</div>
                  <div className="text-white/20 text-[10px]">{m.latency}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Apps */}
        <div>
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <div className="flex items-center gap-2">
              <FiMessageSquare className="w-3.5 h-3.5 text-white/50" />
              <span className="text-white font-bold text-sm">All Apps</span>
              <span className="text-white/30 text-xs">({filteredApps.length})</span>
            </div>
            <input value={appSearch} onChange={e => setAppSearch(e.target.value)}
              placeholder="Search apps..."
              className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-white text-xs outline-none placeholder:text-white/20 w-36 focus:border-violet-500/40 focus:w-48 transition-all" />
            <div className="flex gap-1 flex-wrap">
              {CATS.map(c => (
                <button key={c} onClick={() => setCatFilter(c)}
                  className={cn("px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition-all",
                    catFilter === c ? "bg-violet-500/20 text-violet-300 border border-violet-500/25" : "text-white/40 hover:text-white bg-white/[0.03] border border-white/[0.06]")}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {filteredApps.map(a => (
              <div key={a.href} className="relative group">
                <Link href={a.href}
                  className="flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl border border-white/[0.07] bg-[#0d0d1e] hover:bg-white/[0.06] hover:border-white/[0.15] text-center transition-all hover:-translate-y-0.5 active:scale-95">
                  <span className="text-2xl">{a.emoji}</span>
                  <span className="text-white/60 text-[10px] font-medium truncate w-full text-center">{a.name}</span>
                  {a.badge && (
                    <span className="absolute top-1 right-1 text-[8px] font-bold bg-violet-500/80 text-white px-1 py-0.5 rounded-full">{a.badge}</span>
                  )}
                </Link>
                <button onClick={() => togglePin(a.href)}
                  className={cn(
                    "absolute top-1 left-1 p-0.5 rounded transition-all text-[10px]",
                    pinnedApps.includes(a.href)
                      ? "opacity-100 text-amber-400"
                      : "opacity-0 group-hover:opacity-100 text-white/20 hover:text-amber-400"
                  )}>
                  <FiStar className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent pages */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FiClock className="w-3.5 h-3.5 text-white/40" />
            <span className="text-white font-bold text-sm">Recent</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(() => {
              try {
                const r = JSON.parse(localStorage.getItem("gyan_recent_pages") || "[]") as string[];
                return r.slice(0, 8).map(href => {
                  const app = ALL_APPS.find(a => a.href === href);
                  if (!app) return null;
                  return (
                    <Link key={href} href={href}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.08] text-white/60 hover:text-white text-xs transition-all">
                      <span>{app.emoji}</span>
                      <span>{app.name}</span>
                      <FiArrowRight className="w-3 h-3 opacity-40" />
                    </Link>
                  );
                });
              } catch { return null; }
            })()}
            {(() => {
              try {
                const r = JSON.parse(localStorage.getItem("gyan_recent_pages") || "[]") as string[];
                return r.length === 0 ? (
                  <div className="text-white/25 text-xs py-2">Navigate to apps to build your recent history</div>
                ) : null;
              } catch { return null; }
            })()}
          </div>
        </div>

        {/* Pro tip */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-violet-500/[0.08] to-blue-500/[0.06] border border-violet-500/[0.15]">
          <div className="text-2xl shrink-0">💡</div>
          <div>
            <div className="text-white font-bold text-sm mb-1">Pro Tip: Use ⌘K (Ctrl+K)</div>
            <div className="text-white/50 text-xs leading-relaxed">
              Press <kbd className="px-1.5 py-0.5 rounded bg-white/[0.1] text-white/70 font-mono text-[10px]">Ctrl+K</kbd> anywhere to open the command palette — instantly search all 50+ apps, ask AI questions, and navigate without touching the mouse.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
