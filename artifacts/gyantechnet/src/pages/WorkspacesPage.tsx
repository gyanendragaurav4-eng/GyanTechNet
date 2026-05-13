import { useState, useMemo } from "react";
import { useLocation } from "wouter";

type App = {
  name: string;
  emoji: string;
  gradient: string;
  route?: string;
  category: string;
};

const ALL_APPS: App[] = [
  // ─── GyanVerse ───────────────────────────────────────────
  { name: "GyanGames",    emoji: "🎮", gradient: "from-orange-500 to-red-500",      route: "/games",               category: "GyanVerse" },
  { name: "GyanTutor",    emoji: "🎓", gradient: "from-orange-400 to-amber-500",    route: "/gyanverse/tutor",     category: "GyanVerse" },
  { name: "Science Lab",  emoji: "🔬", gradient: "from-teal-500 to-cyan-500",       route: "/gyanverse/science",   category: "GyanVerse" },
  { name: "GyanViz",      emoji: "📊", gradient: "from-indigo-500 to-violet-500",   route: "/gyanverse/viz",       category: "GyanVerse" },
  { name: "GyanStudio",   emoji: "🎵", gradient: "from-purple-600 to-fuchsia-500",  route: "/gyanverse/studio",    category: "GyanVerse" },
  { name: "GyanPixel",    emoji: "🎨", gradient: "from-pink-500 to-rose-500",       route: "/gyanverse/pixel",     category: "GyanVerse" },
  { name: "GyanScreen",   emoji: "📺", gradient: "from-red-500 to-orange-500",      route: "/gyanverse/screen",    category: "GyanVerse" },
  { name: "GyanBoard",    emoji: "📋", gradient: "from-cyan-500 to-blue-500",       route: "/gyanverse/board",     category: "GyanVerse" },
  { name: "GyanMind",     emoji: "🧠", gradient: "from-violet-600 to-purple-500",   route: "/gyanverse/mind",      category: "GyanVerse" },
  { name: "GyanWrite",    emoji: "✍️",  gradient: "from-emerald-500 to-teal-500",   route: "/gyanverse/write",     category: "GyanVerse" },
  { name: "GyanResume",   emoji: "📄", gradient: "from-blue-500 to-indigo-500",     route: "/gyanverse/resume",    category: "GyanVerse" },
  { name: "GyanLab",      emoji: "⚗️",  gradient: "from-green-500 to-emerald-600",  route: "/gyanverse/lab",       category: "GyanVerse" },
  { name: "GyanDebate",   emoji: "⚖️",  gradient: "from-amber-500 to-orange-500",   route: "/gyanverse/debate",    category: "GyanVerse" },
  { name: "GyanReview",   emoji: "🔍", gradient: "from-slate-500 to-indigo-500",    route: "/gyanverse/review",    category: "GyanVerse" },
  { name: "GyanRunner",   emoji: "🏃", gradient: "from-green-500 to-lime-500",      route: "/gyanverse/runner",    category: "GyanVerse" },
  { name: "GyanAvatar",   emoji: "🧑‍🎨", gradient: "from-fuchsia-600 to-purple-600", route: "/gyanverse/avatar",   category: "GyanVerse" },
  { name: "GyanVoice",    emoji: "🎙️", gradient: "from-teal-500 to-sky-500",       route: "/gyanverse/voice",     category: "GyanVerse" },
  { name: "GyanPDF",      emoji: "📑", gradient: "from-red-600 to-red-500",         route: "/gyanverse/pdf",       category: "GyanVerse" },
  { name: "GyanSocial",   emoji: "💬", gradient: "from-blue-500 to-sky-500",        route: "/gyanverse/social",    category: "GyanVerse" },
  { name: "GyanHealth",   emoji: "❤️",  gradient: "from-green-500 to-emerald-500",  route: "/gyanverse/health",    category: "GyanVerse" },
  { name: "GyanTravel",   emoji: "✈️",  gradient: "from-sky-500 to-cyan-500",       route: "/gyanverse/travel",    category: "GyanVerse" },
  { name: "GyanCrypto",   emoji: "₿",  gradient: "from-orange-500 to-amber-500",   route: "/gyanverse/crypto",    category: "GyanVerse" },
  { name: "GyanStocks",   emoji: "📈", gradient: "from-green-600 to-teal-500",      route: "/gyanverse/stocks",    category: "GyanVerse" },
  { name: "GyanChef",     emoji: "👨‍🍳", gradient: "from-amber-500 to-orange-400",  route: "/gyanverse/chef",      category: "GyanVerse" },
  { name: "GyanNews",     emoji: "📰", gradient: "from-blue-700 to-blue-500",       route: "/gyanverse/news",      category: "GyanVerse" },
  { name: "GyanZen",      emoji: "🧘", gradient: "from-teal-500 to-emerald-500",    route: "/gyanverse/zen",       category: "GyanVerse" },
  { name: "GyanMoney",    emoji: "💰", gradient: "from-green-600 to-lime-500",      route: "/gyanverse/money",     category: "GyanVerse" },
  { name: "GyanLegal",    emoji: "⚖️",  gradient: "from-violet-700 to-indigo-500",  route: "/gyanverse/legal",     category: "GyanVerse" },
  { name: "GyanSpace",    emoji: "🚀", gradient: "from-indigo-700 to-violet-600",   route: "/gyanverse/space",     category: "GyanVerse" },

  // ─── Core AI ─────────────────────────────────────────────
  { name: "AI Chat",        emoji: "💬", gradient: "from-violet-600 to-purple-500",   route: "/chat",       category: "Core AI" },
  { name: "Image AI",       emoji: "🎨", gradient: "from-pink-500 to-rose-500",       route: "/image-ai",   category: "Core AI" },
  { name: "Video AI",       emoji: "🎬", gradient: "from-teal-500 to-cyan-500",       route: "/video-ai",   category: "Core AI" },
  { name: "AI Video Call",  emoji: "📹", gradient: "from-fuchsia-600 to-purple-600",  route: "/video-call", category: "Core AI" },
  { name: "Music AI",       emoji: "🎵", gradient: "from-orange-500 to-amber-400",    route: "/music-ai",   category: "Core AI" },
  { name: "Text to Speech", emoji: "🔊", gradient: "from-green-500 to-emerald-500",   route: "/tts",        category: "Core AI" },
  { name: "Deep Research",  emoji: "🔭", gradient: "from-blue-500 to-indigo-500",     route: "/research",   category: "Core AI" },
  { name: "Intelligence",   emoji: "🤖", gradient: "from-indigo-700 to-violet-600",   route: "/intelligence",category: "Core AI" },

  // ─── Productivity ─────────────────────────────────────────
  { name: "GyanDocs",   emoji: "📝", gradient: "from-blue-500 to-indigo-500",    route: "/docs",       category: "Productivity" },
  { name: "GyanDraw",   emoji: "🖌️", gradient: "from-orange-500 to-red-500",    route: "/draw",       category: "Productivity" },
  { name: "GyanEdit",   emoji: "🎞️", gradient: "from-fuchsia-600 to-violet-600",route: "/video-editor",category: "Productivity" },
  { name: "Whiteboard", emoji: "🖊️", gradient: "from-teal-500 to-cyan-500",     route: "/whiteboard", category: "Productivity" },
  { name: "GyanSlides", emoji: "📊", gradient: "from-orange-500 to-amber-400",  route: "/slides",     category: "Productivity" },
  { name: "GyanSheets", emoji: "📋", gradient: "from-green-600 to-emerald-500", route: "/sheets",     category: "Productivity" },
  { name: "Notes",      emoji: "📓", gradient: "from-emerald-500 to-teal-500",  route: "/notes",      category: "Productivity" },

  // ─── Business ─────────────────────────────────────────────
  { name: "Business AI", emoji: "💼", gradient: "from-orange-500 to-red-500",     route: "/business",  category: "Business" },
  { name: "Invoice",     emoji: "🧾", gradient: "from-emerald-500 to-teal-500",   route: "/invoices",  category: "Business" },
  { name: "GyanCRM",    emoji: "🤝", gradient: "from-amber-500 to-orange-400",   route: "/crm",       category: "Business" },
  { name: "Analytics",  emoji: "📈", gradient: "from-blue-500 to-indigo-500",    route: "/analytics", category: "Business" },
  { name: "GyanForms",  emoji: "📋", gradient: "from-violet-600 to-purple-500",  route: "/forms",     category: "Business" },

  // ─── Developer ────────────────────────────────────────────
  { name: "GyanIDE",        emoji: "💻", gradient: "from-blue-700 to-blue-500",     route: "/dev-console",category: "Developer" },
  { name: "API Tester",     emoji: "🔌", gradient: "from-cyan-500 to-sky-500",      route: "/api-tester", category: "Developer" },
  { name: "DB Manager",     emoji: "🗄️", gradient: "from-violet-700 to-indigo-500", route: "/db-manager", category: "Developer" },
  { name: "API Keys",       emoji: "🔑", gradient: "from-amber-500 to-orange-400",  route: "/api-keys",   category: "Developer" },
  { name: "Website Creator",emoji: "🌐", gradient: "from-blue-500 to-cyan-500",  route: "/gyanverse/website", category: "Developer" },

  // ─── Tools ────────────────────────────────────────────────
  { name: "Files",        emoji: "📁", gradient: "from-amber-600 to-amber-400",  route: "/files",       category: "Tools" },
  { name: "Calculator",   emoji: "🧮", gradient: "from-violet-600 to-indigo-500",route: "/calculator",  category: "Tools" },
  { name: "Translate",    emoji: "🌍", gradient: "from-cyan-500 to-sky-500",     route: "/translator",  category: "Tools" },
  { name: "Converter",    emoji: "🔄", gradient: "from-orange-500 to-red-500",   route: "/converter",   category: "Tools" },
  { name: "Weather",      emoji: "🌤️", gradient: "from-sky-500 to-blue-500",    route: "/weather",     category: "Tools" },
  { name: "QR Generator", emoji: "⬛", gradient: "from-slate-600 to-slate-500",  route: "/qr-generator",category: "Tools" },
  { name: "Passwords",    emoji: "🔒", gradient: "from-red-600 to-red-500",      route: "/passwords",   category: "Tools" },

  // ─── Communication ────────────────────────────────────────
  { name: "GyanMail",  emoji: "📧", gradient: "from-pink-500 to-rose-500",     route: "/email",        category: "Communication" },
  { name: "GyanMeet",  emoji: "📹", gradient: "from-green-500 to-emerald-500", route: "/meet",         category: "Communication" },
  { name: "Team Chat", emoji: "💬", gradient: "from-violet-600 to-purple-500", route: "/conversation", category: "Communication" },
  { name: "GyanBook",  emoji: "📖", gradient: "from-blue-600 to-blue-500",  route: "/gyanverse/book",  category: "Communication" },

  // ─── Learning ─────────────────────────────────────────────
  { name: "GyanLearn", emoji: "📚", gradient: "from-orange-500 to-amber-400",  route: "/learn",   category: "Learning" },
  { name: "Cricket",   emoji: "🏏", gradient: "from-green-600 to-lime-500",    route: "/cricket", category: "Learning" },
  { name: "Stories",   emoji: "📖", gradient: "from-violet-600 to-purple-500", route: "/stories", category: "Learning" },
  { name: "GyanWiki",  emoji: "🌐", gradient: "from-slate-600 to-slate-400",   route: "/wiki",    category: "Learning" },

  // ─── Personal ─────────────────────────────────────────────
  { name: "Tasks",        emoji: "✅", gradient: "from-green-500 to-emerald-500",  route: "/tasks",        category: "Personal" },
  { name: "Calendar",     emoji: "📅", gradient: "from-blue-500 to-sky-500",       route: "/calendar",     category: "Personal" },
  { name: "Projects",     emoji: "🗂️", gradient: "from-violet-600 to-purple-500",  route: "/projects",     category: "Personal" },
  { name: "Focus Mode",   emoji: "⏱️", gradient: "from-red-500 to-orange-500",     route: "/focus",        category: "Personal" },
  { name: "Music Player", emoji: "🎧", gradient: "from-purple-500 to-pink-500",    route: "/music-player", category: "Personal" },
  { name: "AI Memory",    emoji: "🧠", gradient: "from-indigo-600 to-violet-600",  route: "/memory",       category: "Personal" },
];

type TabId = "All" | "GyanVerse" | "Core AI" | "Productivity" | "Business" | "Developer" | "Tools" | "Communication" | "Learning" | "Personal";

const TABS: { id: TabId; emoji: string; color: string; activeStyle: string }[] = [
  { id: "All",           emoji: "✦",  color: "text-white",       activeStyle: "bg-white text-black" },
  { id: "GyanVerse",     emoji: "☀️",  color: "text-amber-400",   activeStyle: "bg-gradient-to-r from-amber-500 to-orange-500 text-white" },
  { id: "Core AI",       emoji: "🔵",  color: "text-blue-400",    activeStyle: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white" },
  { id: "Productivity",  emoji: "⚡",  color: "text-yellow-400",  activeStyle: "bg-gradient-to-r from-yellow-500 to-amber-500 text-black" },
  { id: "Business",      emoji: "🟥",  color: "text-red-400",     activeStyle: "bg-gradient-to-r from-red-600 to-rose-600 text-white" },
  { id: "Developer",     emoji: "💻",  color: "text-cyan-400",    activeStyle: "bg-gradient-to-r from-teal-600 to-cyan-600 text-white" },
  { id: "Tools",         emoji: "🔧",  color: "text-slate-400",   activeStyle: "bg-gradient-to-r from-slate-600 to-slate-500 text-white" },
  { id: "Communication", emoji: "💬",  color: "text-pink-400",    activeStyle: "bg-gradient-to-r from-pink-600 to-fuchsia-600 text-white" },
  { id: "Learning",      emoji: "📚",  color: "text-teal-400",    activeStyle: "bg-gradient-to-r from-teal-600 to-green-600 text-white" },
  { id: "Personal",      emoji: "🌟",  color: "text-orange-400",  activeStyle: "bg-gradient-to-r from-orange-500 to-amber-400 text-white" },
];

const SECTION_ICON: Record<string, string> = {
  "GyanVerse": "☀️", "Core AI": "🤖", "Productivity": "⚡", "Business": "💼",
  "Developer": "💻", "Tools": "🔧", "Communication": "💬", "Learning": "📚", "Personal": "🌟",
};
const SECTION_COLOR: Record<string, string> = {
  "GyanVerse": "text-amber-400", "Core AI": "text-blue-400", "Productivity": "text-yellow-400",
  "Business": "text-red-400", "Developer": "text-cyan-400", "Tools": "text-slate-400",
  "Communication": "text-pink-400", "Learning": "text-teal-400", "Personal": "text-orange-400",
};

function AppTile({ app, onClick }: { app: App; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 group cursor-pointer"
    >
      <div
        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${app.gradient} flex items-center justify-center text-2xl shadow-lg transition-all duration-200 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]`}
      >
        {app.emoji}
      </div>
      <span className="text-[11px] text-white/70 group-hover:text-white font-medium text-center leading-tight max-w-[72px] transition-colors">
        {app.name}
      </span>
    </button>
  );
}

export default function WorkspacesPage() {
  const [activeTab, setActiveTab] = useState<TabId>("All");
  const [search, setSearch] = useState("");
  const [, navigate] = useLocation();

  const filtered = useMemo(() => {
    let apps = ALL_APPS;
    if (activeTab !== "All") apps = apps.filter(a => a.category === activeTab);
    if (search.trim()) apps = apps.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));
    return apps;
  }, [activeTab, search]);

  const categories: TabId[] = activeTab === "All"
    ? (["GyanVerse", "Core AI", "Productivity", "Business", "Developer", "Tools", "Communication", "Learning", "Personal"] as TabId[])
    : [activeTab];

  const handleApp = (app: App) => {
    if (app.route) navigate(app.route);
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#06060f" }}>
      {/* Search bar */}
      <div className="px-5 pt-5 pb-3">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search all tools..."
            className="w-full bg-[#0d0d1e] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-violet-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 pb-3">
        <div className="flex gap-1.5 flex-wrap">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 whitespace-nowrap ${
                  isActive
                    ? tab.activeStyle + " shadow-lg"
                    : "bg-[#0d0d1e] border border-white/10 text-white/60 hover:text-white hover:border-white/25"
                }`}
              >
                <span>{tab.emoji}</span>
                <span>{tab.id}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* App grid */}
      <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-8">
        {search.trim() ? (
          /* Search results flat grid */
          filtered.length === 0 ? (
            <div className="text-center text-white/40 py-16 text-sm">No apps found for "{search}"</div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 xl:grid-cols-10 gap-4 pt-2">
              {filtered.map(app => <AppTile key={app.name} app={app} onClick={() => handleApp(app)} />)}
            </div>
          )
        ) : (
          /* Sectioned view */
          categories.map(cat => {
            const apps = filtered.filter(a => a.category === cat);
            if (!apps.length) return null;
            return (
              <section key={cat}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-base">{SECTION_ICON[cat]}</span>
                  <span className={`text-xs font-bold tracking-widest uppercase ${SECTION_COLOR[cat]}`}>{cat}</span>
                  <span className="text-xs text-white/30 ml-1">({apps.length})</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 xl:grid-cols-10 gap-x-3 gap-y-5">
                  {apps.map(app => <AppTile key={app.name} app={app} onClick={() => handleApp(app)} />)}
                </div>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}
