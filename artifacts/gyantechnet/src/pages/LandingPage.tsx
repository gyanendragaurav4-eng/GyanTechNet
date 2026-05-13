import { Link } from "wouter";
import { FiArrowRight, FiShield, FiLock, FiZap, FiCheck, FiStar } from "react-icons/fi";

function GyanLogo({ size = 40 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size }} className="relative shrink-0">
      <img
        src="/gyan-logo.jpg" alt="GyanTechNet"
        className="w-full h-full rounded-xl object-cover border border-purple-500/30"
        style={{ boxShadow: "0 0 14px rgba(168,85,247,0.45)" }}
      />
    </div>
  );
}

const features = [
  { emoji: "🤖", title: "11 AI Chat Modes", desc: "Normal, Code, Creative, Research, Reasoning, Business, Debate, Math, Translate, Summarise & more", gradient: "from-violet-600/20 to-purple-600/10", border: "border-violet-500/20", glow: "group-hover:shadow-[0_0_40px_rgba(124,58,237,0.12)]" },
  { emoji: "🖼️", title: "Image & Video AI", desc: "Generate stunning visuals and cinematic videos with state-of-the-art generative AI models instantly", gradient: "from-pink-600/20 to-rose-600/10", border: "border-pink-500/20", glow: "group-hover:shadow-[0_0_40px_rgba(236,72,153,0.12)]" },
  { emoji: "📊", title: "50+ Workspace Tools", desc: "Notes, Calendar, Tasks, Sheets, Slides, Whiteboard, Docs — all in one seamless, interconnected platform", gradient: "from-blue-600/20 to-cyan-600/10", border: "border-blue-500/20", glow: "group-hover:shadow-[0_0_40px_rgba(59,130,246,0.12)]" },
  { emoji: "⚡", title: "Multi-Engine AI", desc: "Compare responses from Gyan AI Fast, Gyan Smart, Gyan Vision and Gyan Deep side-by-side in real time", gradient: "from-amber-600/20 to-orange-600/10", border: "border-amber-500/20", glow: "group-hover:shadow-[0_0_40px_rgba(245,158,11,0.12)]" },
  { emoji: "🔒", title: "End-to-End Encrypted", desc: "Your data is private and secured with enterprise-grade encryption, zero-knowledge architecture", gradient: "from-emerald-600/20 to-teal-600/10", border: "border-emerald-500/20", glow: "group-hover:shadow-[0_0_40px_rgba(16,185,129,0.12)]" },
  { emoji: "🌐", title: "100+ Languages", desc: "Translate instantly with AI-powered accuracy, natural fluency, and real-time voice synthesis", gradient: "from-cyan-600/20 to-sky-600/10", border: "border-cyan-500/20", glow: "group-hover:shadow-[0_0_40px_rgba(6,182,212,0.12)]" },
];

const pricingPlans = [
  {
    name: "Free", price: "₹0", period: "", badge: null, popular: false,
    features: ["1,000 AI images/month", "10 AI videos/month", "5 music generations", "Unlimited AI chat", "Basic workspace tools"],
  },
  {
    name: "Axol Pro", price: "₹499", period: "/mo", badge: "Most Popular", popular: true,
    features: ["Unlimited AI images", "100 videos/month", "60 music generations", "API key access", "Priority speeds", "All 50+ workspace apps"],
  },
  {
    name: "Axol Ultra", price: "₹999", period: "/mo", badge: "Best Value", popular: false,
    features: ["Everything in Pro", "Unlimited videos", "Unlimited music", "Premium API access", "Fastest responses", "Team collaboration"],
  },
];

const stats = [
  { value: "50+", label: "AI Tools", icon: "🛠️" },
  { value: "100K+", label: "Active Users", icon: "👥" },
  { value: "11", label: "AI Modes", icon: "🧠" },
  { value: "99.9%", label: "Uptime SLA", icon: "⚡" },
];

const appGrid = [
  { emoji: "💬", name: "AI Chat" },     { emoji: "⚡", name: "Multi-Chat" },  { emoji: "🖼️", name: "Image AI" },
  { emoji: "🎬", name: "Video AI" },    { emoji: "🎵", name: "Music AI" },    { emoji: "🔊", name: "TTS" },
  { emoji: "🌐", name: "Translator" },  { emoji: "📝", name: "Notes" },       { emoji: "📅", name: "Calendar" },
  { emoji: "✅", name: "Tasks" },       { emoji: "⏱️", name: "Focus" },       { emoji: "📊", name: "Projects" },
  { emoji: "📋", name: "Forms" },       { emoji: "🎯", name: "Slides" },      { emoji: "📈", name: "Sheets" },
  { emoji: "🎨", name: "Whiteboard" },  { emoji: "✏️", name: "Draw" },        { emoji: "📄", name: "Docs" },
  { emoji: "🧮", name: "Calculator" },  { emoji: "📷", name: "QR Gen" },      { emoji: "☁️", name: "Weather" },
  { emoji: "🔒", name: "Passwords" },   { emoji: "📚", name: "Wiki" },        { emoji: "🎮", name: "Games" },
];

const testimonials = [
  { name: "Priya Sharma", role: "Product Designer", text: "GyanTechNet replaced 6 apps for me. The AI chat modes are incredibly intelligent — it's like having an expert team available 24/7.", avatar: "PS", color: "bg-violet-500" },
  { name: "Rahul Gupta", role: "Full Stack Dev", text: "The Code AI mode is phenomenal. It understands context like no other tool. Multi-model comparison saves hours every week.", avatar: "RG", color: "bg-blue-500" },
  { name: "Ananya Singh", role: "Content Creator", text: "From stories to slides to music — everything is on one platform. The creative AI is genuinely world-class. 10/10 recommend.", avatar: "AS", color: "bg-pink-500" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050510] text-white overflow-x-hidden relative selection:bg-violet-500/30">
      {/* Starfield */}
      <div className="stars-bg" />

      {/* Ambient orbs — fixed behind everything */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.18)_0%,transparent_65%)]" />
        <div className="absolute top-[30%] -left-40 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(139,92,246,0.07)_0%,transparent_70%)]" />
        <div className="absolute top-[25%] -right-40 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(236,72,153,0.06)_0%,transparent_70%)]" />
        <div className="absolute bottom-[20%] left-1/3 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(59,130,246,0.05)_0%,transparent_70%)]" />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)", backgroundSize: "72px 72px" }} />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.05] bg-[#050510]/75 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-[58px] flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <GyanLogo size={30} />
              <span className="text-[15px] font-black text-white tracking-tight group-hover:text-white/90 transition-colors">GyanTechNet</span>
            </Link>
            <div className="hidden md:flex items-center gap-0.5 text-sm">
              {["Features", "Pricing", "About", "Contact"].map(n => (
                <a key={n} href={`#${n.toLowerCase()}`}
                  className="px-3.5 py-1.5 text-white/45 hover:text-white rounded-lg hover:bg-white/[0.05] transition-all text-[13px] font-medium">{n}</a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-[13px] text-white/55 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/[0.05]">Sign In</Link>
            <Link href="/register"
              className="relative text-[13px] font-bold bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4.5 py-2 rounded-xl transition-all shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_35px_rgba(124,58,237,0.6)] hover:from-violet-500 hover:to-purple-500">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10">
        {/* ── HERO ─────────────────────────────────────────── */}
        <section className="pt-36 pb-20 px-6 text-center">
          <div className="max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-violet-500/25 bg-violet-500/[0.08] text-[12.5px] font-semibold text-violet-300 mb-10 backdrop-blur-sm">
              <span className="flex w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              Now with Gyan AI v4 Pro, Gyan Vision Ultra &amp; Gyan Deep engines
            </div>

            <h1 className="text-[44px] sm:text-[58px] md:text-[72px] lg:text-[80px] font-black leading-[0.98] tracking-[-0.03em] mb-6 text-white">
              One Platform.<br />
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                  Infinite Intelligence.
                </span>
                <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-violet-500/0 via-fuchsia-500/60 to-pink-500/0" />
              </span>
            </h1>

            <p className="text-[17px] sm:text-[19px] text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
              GyanTechNet is India's most advanced all-in-one AI workspace — 50+ tools, 11 AI modes, multi-model chat, and a full productivity suite in one seamless platform.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14">
              <Link href="/register"
                className="group relative inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-2xl transition-all shadow-[0_0_50px_rgba(124,58,237,0.5)] hover:shadow-[0_0_80px_rgba(124,58,237,0.7)] hover:from-violet-500 hover:to-purple-500 text-[15px] active:scale-[0.98]">
                <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                Start for Free
                <FiArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#features"
                className="inline-flex items-center gap-2.5 px-8 py-4 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] hover:border-white/[0.2] text-white font-semibold rounded-2xl transition-all text-[15px] backdrop-blur-sm">
                See all 50+ tools
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center flex-wrap gap-5 text-[12px] text-white/30">
              <div className="flex items-center gap-1.5"><FiShield className="w-3.5 h-3.5 text-violet-400/60" /> SOC 2 Certified</div>
              <div className="w-px h-3 bg-white/10" />
              <div className="flex items-center gap-1.5"><FiLock className="w-3.5 h-3.5 text-violet-400/60" /> End-to-end Encrypted</div>
              <div className="w-px h-3 bg-white/10" />
              <div className="flex items-center gap-1.5"><FiZap className="w-3.5 h-3.5 text-violet-400/60" /> 99.9% Uptime</div>
              <div className="w-px h-3 bg-white/10" />
              <div className="flex items-center gap-1.5"><span className="text-amber-400/60">★</span> Built in India</div>
            </div>
          </div>
        </section>

        {/* ── BROWSER MOCKUP ──────────────────────────────── */}
        <section className="px-6 pb-28">
          <div className="max-w-5xl mx-auto float">
            <div className="rounded-3xl border border-white/[0.07] overflow-hidden shadow-[0_0_150px_rgba(124,58,237,0.18),0_60px_120px_rgba(0,0,0,0.7)] bg-[#07071a]/80 backdrop-blur-sm">
              {/* Title bar */}
              <div className="flex items-center gap-3 px-5 py-3.5 bg-[#090916] border-b border-white/[0.06]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57] shadow-[0_0_6px_rgba(255,95,87,0.6)]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-[0_0_6px_rgba(255,189,46,0.4)]" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840] shadow-[0_0_6px_rgba(40,200,64,0.4)]" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white/[0.05] border border-white/[0.06] rounded-lg px-3 py-1 text-[11.5px] text-white/30 max-w-[220px] font-mono">
                    🔒 gyantechnet.com/chat
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-white/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Connected · Gyan AI Pro
                </div>
              </div>
              {/* App interior */}
              <div className="flex h-[340px] sm:h-[420px]">
                {/* Sidebar */}
                <div className="w-[170px] bg-[#060614]/90 border-r border-white/[0.04] p-3 flex flex-col gap-1 shrink-0">
                  <div className="flex items-center gap-2 px-2 py-2 mb-2">
                    <GyanLogo size={22} />
                    <span className="text-[11.5px] font-black text-white tracking-tight">GyanTechNet</span>
                  </div>
                  <div className="text-[9px] font-bold text-white/20 uppercase tracking-[0.14em] px-2 mb-1">AI Tools</div>
                  {[
                    { e: "💬", n: "AI Chat", a: true },
                    { e: "⚡", n: "Multi-Chat", badge: "NEW" },
                    { e: "🖼️", n: "Image AI" },
                    { e: "🎬", n: "Video AI" },
                    { e: "🌐", n: "Translator" },
                  ].map(a => (
                    <div key={a.n} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] cursor-default transition-all ${
                      a.a ? "bg-violet-500/15 text-violet-300 font-semibold shadow-[inset_0_0_12px_rgba(124,58,237,0.1)]"
                      : "text-white/35 hover:text-white/60"
                    }`}>
                      <span className="text-sm">{a.e}</span>
                      <span className="flex-1 truncate">{a.n}</span>
                      {a.badge && <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1 rounded font-bold">{a.badge}</span>}
                    </div>
                  ))}
                  <div className="mt-2 text-[9px] font-bold text-white/20 uppercase tracking-[0.14em] px-2 mb-1">Workspace</div>
                  {[
                    { e: "📝", n: "Notes" },
                    { e: "✅", n: "Tasks" },
                    { e: "📈", n: "Sheets" },
                  ].map(a => (
                    <div key={a.n} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] text-white/30 cursor-default">
                      <span className="text-sm">{a.e}</span> {a.n}
                    </div>
                  ))}
                </div>
                {/* Chat */}
                <div className="flex-1 flex flex-col bg-[#06060f]/90 min-w-0">
                  {/* Chat header */}
                  <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-white/[0.04] bg-[#07071a]/50">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-black text-[10px] shadow-[0_0_10px_rgba(124,58,237,0.4)]">G</div>
                    <span className="text-white/80 text-[12px] font-bold">GyanTechNet AI</span>
                    <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-400/70 font-medium">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />Online
                    </span>
                  </div>
                  {/* Messages */}
                  <div className="flex-1 flex flex-col justify-end gap-3.5 p-5 overflow-hidden">
                    <div className="flex justify-end">
                      <div className="bg-gradient-to-br from-violet-600 to-purple-700 text-white text-[11.5px] px-4 py-3 rounded-2xl rounded-tr-sm max-w-[65%] shadow-[0_0_20px_rgba(124,58,237,0.25)] leading-relaxed">
                        Write a tagline for a premium AI platform that feels powerful and trustworthy
                      </div>
                    </div>
                    <div className="flex justify-start gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center text-white font-black text-[10px] shrink-0 mt-auto shadow-[0_0_12px_rgba(124,58,237,0.4)]">G</div>
                      <div className="bg-white/[0.04] border border-white/[0.07] text-white/70 text-[11.5px] px-4 py-3 rounded-2xl rounded-tl-sm max-w-[68%] leading-relaxed">
                        ✦ <span className="text-violet-300 font-semibold">GyanTechNet</span> — Where Intelligence Meets Imagination. Deliver faster, think deeper, build smarter with India's most advanced AI platform.
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-gradient-to-br from-violet-600 to-purple-700 text-white text-[11.5px] px-4 py-3 rounded-2xl rounded-tr-sm max-w-[55%] shadow-[0_0_20px_rgba(124,58,237,0.2)] leading-relaxed">
                        Now write it in Hindi 🇮🇳
                      </div>
                    </div>
                    <div className="flex justify-start gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center text-white font-black text-[10px] shrink-0 mt-auto shadow-[0_0_12px_rgba(124,58,237,0.4)]">G</div>
                      <div className="bg-white/[0.04] border border-white/[0.07] text-white/70 text-[11.5px] px-4 py-3 rounded-2xl rounded-tl-sm max-w-[68%] leading-relaxed">
                        ✦ <span className="text-violet-300 font-semibold">ज्ञान टेकनेट</span> — जहाँ बुद्धिमत्ता और कल्पना का संगम होता है। भारत का सबसे शक्तिशाली AI प्लेटफॉर्म।
                      </div>
                    </div>
                  </div>
                  {/* Input */}
                  <div className="px-4 pb-4">
                    <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3 text-[12px] text-white/20 flex items-center justify-between hover:border-violet-500/20 transition-colors">
                      <span>Ask anything in any language...</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-white/15 font-mono hidden sm:block">Normal ▾</span>
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 flex items-center justify-center shadow-[0_0_12px_rgba(124,58,237,0.4)]">
                          <FiArrowRight className="w-3.5 h-3.5 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS ────────────────────────────────────────── */}
        <section className="px-6 py-16 border-y border-white/[0.04]">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(s => (
              <div key={s.value} className="text-center relative group">
                <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(124,58,237,0.06)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-[38px] sm:text-[44px] font-black bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent leading-none mb-1.5">{s.value}</div>
                <div className="text-[13px] text-white/35 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────── */}
        <section id="features" className="px-6 py-28">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/25 bg-violet-500/[0.07] text-[12.5px] font-semibold text-violet-300 mb-6">
                ✦ Everything you need
              </div>
              <h2 className="text-[36px] sm:text-[48px] md:text-[56px] font-black mb-5 leading-[1.05] tracking-tight">
                Built for peak<br />
                <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">productivity &amp; creativity</span>
              </h2>
              <p className="text-white/40 max-w-xl mx-auto text-[16px] leading-relaxed">One platform for all your AI needs — chat, create, analyse and build without switching apps</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map(f => (
                <div key={f.title}
                  className={`relative bg-gradient-to-br ${f.gradient} border ${f.border} rounded-2xl p-7 hover:border-opacity-50 transition-all group overflow-hidden ${f.glow} cursor-default`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(255,255,255,0.03)_0%,transparent_60%)]" />
                  <div className="relative">
                    <div className="text-4xl mb-5">{f.emoji}</div>
                    <h3 className="text-[16px] font-bold text-white mb-2.5">{f.title}</h3>
                    <p className="text-[13.5px] text-white/45 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── APPS GRID ─────────────────────────────────────── */}
        <section className="px-6 py-24 border-y border-white/[0.04] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.05)_0%,transparent_70%)] pointer-events-none" />
          <div className="max-w-6xl mx-auto text-center relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/25 bg-violet-500/[0.07] text-[12.5px] font-semibold text-violet-300 mb-6">
              ✦ 50+ AI Tools
            </div>
            <h2 className="text-[36px] sm:text-[48px] font-black mb-4 tracking-tight">One platform,<br />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">endless possibilities</span>
            </h2>
            <p className="text-white/40 max-w-lg mx-auto mb-14 text-[16px] leading-relaxed">From AI chat to image generation, music creation to business tools — everything in one place</p>
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2">
              {appGrid.map((a, i) => (
                <div key={a.name}
                  className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-2.5 flex flex-col items-center gap-1.5 hover:border-violet-500/35 hover:bg-violet-500/[0.07] transition-all cursor-default group"
                  style={{ animationDelay: `${i * 40}ms` }}>
                  <span className="text-xl group-hover:scale-110 transition-transform">{a.emoji}</span>
                  <span className="text-[9px] text-white/35 group-hover:text-white/65 transition-colors text-center leading-tight">{a.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ──────────────────────────────────── */}
        <section className="px-6 py-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-1.5 mb-5">
                {[1,2,3,4,5].map(i => <FiStar key={i} className="w-4.5 h-4.5 text-amber-400 fill-amber-400" />)}
                <span className="text-white/40 text-[13px] ml-1">Loved by thousands</span>
              </div>
              <h2 className="text-[36px] sm:text-[46px] font-black tracking-tight">What users are saying</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {testimonials.map(t => (
                <div key={t.name} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-7 hover:border-violet-500/20 hover:bg-violet-500/[0.03] transition-all">
                  <div className="flex items-center gap-1.5 mb-5">
                    {[1,2,3,4,5].map(i => <FiStar key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
                  </div>
                  <p className="text-[14px] text-white/60 leading-relaxed mb-6">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-white font-black text-[12px] shrink-0`}>{t.avatar}</div>
                    <div>
                      <div className="text-white/85 font-semibold text-[13px]">{t.name}</div>
                      <div className="text-white/35 text-[11.5px]">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ──────────────────────────────────────── */}
        <section id="pricing" className="px-6 py-24 border-t border-white/[0.04] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.06)_0%,transparent_60%)] pointer-events-none" />
          <div className="max-w-5xl mx-auto relative">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/25 bg-violet-500/[0.07] text-[12.5px] font-semibold text-violet-300 mb-6">
                ✦ Simple Pricing
              </div>
              <h2 className="text-[36px] sm:text-[48px] font-black mb-4 tracking-tight">Transparent pricing.<br />No surprises.</h2>
              <p className="text-white/40 text-[16px]">Start free. Upgrade when ready. Cancel anytime.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {pricingPlans.map(plan => (
                <div key={plan.name}
                  className={`relative rounded-2xl p-8 flex flex-col border transition-all ${
                    plan.popular
                      ? "bg-gradient-to-b from-violet-900/40 to-purple-900/20 border-violet-500/40 shadow-[0_0_80px_rgba(124,58,237,0.2)]"
                      : "bg-white/[0.02] border-white/[0.08] hover:border-white/[0.15]"
                  }`}>
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[11.5px] font-black bg-gradient-to-r from-violet-500 to-pink-500 text-white whitespace-nowrap shadow-[0_0_25px_rgba(168,85,247,0.5)]">
                      {plan.badge}
                    </div>
                  )}
                  <div className="text-[16px] font-bold text-white mb-5">{plan.name}</div>
                  <div className="mb-8">
                    <span className="text-[52px] font-black text-white leading-none">{plan.price}</span>
                    {plan.period && <span className="text-[15px] text-white/40 ml-1">{plan.period}</span>}
                  </div>
                  <div className="flex-1 space-y-3.5 mb-8">
                    {plan.features.map(f => (
                      <div key={f} className="flex items-center gap-3 text-[13.5px] text-white/65">
                        <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 ${plan.popular ? "bg-violet-500/30 text-violet-300" : "bg-white/[0.07] text-white/40"}`}>
                          <FiCheck className="w-2.5 h-2.5" />
                        </div>
                        {f}
                      </div>
                    ))}
                  </div>
                  <Link href="/register"
                    className={`block text-center py-3.5 rounded-xl font-bold text-[14px] transition-all ${
                      plan.popular
                        ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:shadow-[0_0_50px_rgba(124,58,237,0.6)]"
                        : "bg-white/[0.05] border border-white/[0.12] text-white hover:bg-white/[0.1] hover:border-white/[0.2]"
                    }`}>
                    Get Started
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────── */}
        <section className="px-6 py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="relative rounded-3xl overflow-hidden">
              {/* BG */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-900/60 via-purple-900/40 to-pink-900/30" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.2)_0%,transparent_70%)]" />
              <div className="absolute inset-0 border border-violet-500/25 rounded-3xl" />
              <div className="absolute inset-0 opacity-[0.04]"
                style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.4) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
              <div className="relative z-10 p-14 sm:p-20">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-400/30 bg-violet-500/10 text-[12px] font-bold text-violet-300 mb-8">
                  ✦ Free to start · No credit card needed
                </div>
                <h2 className="text-[36px] sm:text-[50px] font-black mb-5 leading-[1.05] tracking-tight">
                  Start using GyanTechNet<br />
                  <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">for free today</span>
                </h2>
                <p className="text-white/45 mb-10 text-[16px] max-w-md mx-auto leading-relaxed">Join 100,000+ users already using the most advanced AI platform built in India</p>
                <Link href="/register"
                  className="group inline-flex items-center gap-2.5 px-10 py-4.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-black rounded-2xl shadow-[0_0_60px_rgba(124,58,237,0.5)] hover:shadow-[0_0_100px_rgba(124,58,237,0.7)] transition-all text-[16px] hover:from-violet-500 hover:to-purple-500 active:scale-[0.98]">
                  Get Started Free
                  <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────── */}
        <footer className="px-6 py-10 border-t border-white/[0.05]">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-3">
                <GyanLogo size={28} />
                <div>
                  <div className="text-[14px] font-black text-white">GyanTechNet</div>
                  <div className="text-white/30 text-[11px]">© 2026 · Built with ♥ in India</div>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-white/35">
                {["Features", "Pricing", "Privacy", "Terms", "Blog", "About", "Contact"].map(l => (
                  <a key={l} href="#" className="hover:text-white/65 transition-colors">{l}</a>
                ))}
              </div>
            </div>
            <div className="pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-white/20">
              <span>GyanTechNet AI Platform · India's most advanced all-in-one AI workspace</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> All systems operational</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
