import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, Link } from "wouter";
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiAlertCircle, FiZap } from "react-icons/fi";

const BRAND_MODELS = [
  { name: "Gyan AI Pro",    desc: "Most Capable",       color: "#7c3aed" },
  { name: "Gyan Smart",     desc: "Best Balance",       color: "#a855f7" },
  { name: "Gyan Flash",     desc: "Fastest Engine",     color: "#ec4899" },
  { name: "Gyan Deep V3",   desc: "Reasoning Power",    color: "#3b82f6" },
  { name: "Gyan Open 70B",  desc: "Open Source Free",   color: "#06b6d4" },
  { name: "Gyan X",         desc: "Real-time Intel",    color: "#6366f1" },
  { name: "Gyan Ultra",     desc: "Most Intelligent",   color: "#8b5cf6" },
  { name: "Gyan Max",       desc: "Max Precision",      color: "#d946ef" },
];

const FEATURES = [
  { emoji: "⚡", title: "17 AI Models in Parallel",  sub: "All respond simultaneously — pick the best" },
  { emoji: "🏢", title: "50+ Workspace Tools",        sub: "Notes, tasks, slides, sheets & more" },
  { emoji: "🔒", title: "Private & Secure",           sub: "End-to-end encrypted sessions" },
  { emoji: "🌐", title: "Works Everywhere",           sub: "Web, mobile, desktop — any device" },
];

type Tab = "signin" | "signup";

export default function LoginPage() {
  const [tab, setTab]         = useState<Tab>("signin");
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPass]   = useState("");
  const [showPass, setShow]   = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 350));

    if (tab === "signin") {
      const res = login(email.trim(), password);
      if (!res.ok) { setError(res.error || "Login failed."); setLoading(false); return; }
      setLocation(email.trim() === "gyanendra@gyan.tech" ? "/admin" : "/chat");
    } else {
      const res = register(name.trim(), email.trim(), password);
      if (!res.ok) { setError(res.error || "Registration failed."); setLoading(false); return; }
      setLocation("/chat");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-[#04040e] overflow-hidden">

      {/* ── Left branding panel (hidden on mobile) ── */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden">
        {/* Animated gradient blobs */}
        <div className="absolute inset-0">
          <div className="absolute top-[-10%] left-[-10%] w-[700px] h-[700px] rounded-full opacity-30"
            style={{background:"radial-gradient(circle, rgba(124,58,237,1) 0%, transparent 70%)", filter:"blur(100px)", animation:"pulse 6s ease-in-out infinite"}} />
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-20"
            style={{background:"radial-gradient(circle, rgba(236,72,153,1) 0%, transparent 70%)", filter:"blur(100px)", animation:"pulse 8s ease-in-out infinite 2s"}} />
          <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] rounded-full opacity-15"
            style={{background:"radial-gradient(circle, rgba(6,182,212,1) 0%, transparent 70%)", filter:"blur(80px)", animation:"pulse 7s ease-in-out infinite 1s"}} />
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{backgroundImage:"linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize:"40px 40px"}} />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-auto">
            <div className="relative">
              <div className="absolute inset-[-8px] rounded-2xl"
                style={{background:"radial-gradient(circle, rgba(124,58,237,0.6) 0%, transparent 80%)", filter:"blur(12px)"}} />
              <img src="/gyan-logo.jpg" alt="GyanTechNet"
                className="relative w-11 h-11 rounded-xl object-cover border border-violet-500/50"
                style={{boxShadow:"0 0 24px rgba(124,58,237,0.6)"}} />
            </div>
            <div>
              <div className="text-white font-black text-[18px] leading-none">GyanTechNet</div>
              <div className="text-[10px] text-violet-400/70 font-bold tracking-widest uppercase mt-0.5">AI Platform</div>
            </div>
          </div>

          {/* Hero text */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
              <span className="text-[11px] font-bold text-emerald-400 tracking-widest uppercase">All Systems Live</span>
            </div>

            <h1 className="text-[48px] font-black text-white leading-[1.05] mb-4">
              The Father of<br />
              <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Multitasking AI
              </span>
            </h1>
            <p className="text-[15px] text-white/40 leading-relaxed max-w-sm">
              17 AI models respond in perfect parallel. 50+ workspace tools. One unstoppable platform.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-3 mb-10">
            {FEATURES.map(f => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/[0.07] flex items-center justify-center shrink-0 text-base">{f.emoji}</div>
                <div>
                  <div className="text-white font-semibold text-[13px] leading-snug">{f.title}</div>
                  <div className="text-white/30 text-[11px] mt-0.5">{f.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Scrolling model strip */}
          <div className="overflow-hidden">
            <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-2">Active AI Models</div>
            <div className="flex gap-2 overflow-hidden relative">
              <div className="flex gap-2 animate-[marquee_20s_linear_infinite]" style={{animationName:"marquee"}}>
                {[...BRAND_MODELS, ...BRAND_MODELS].map((m, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border shrink-0 whitespace-nowrap"
                    style={{borderColor:`${m.color}30`, background:`${m.color}0d`}}>
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0" style={{background:m.color}} />
                    <span className="text-[10px] font-semibold" style={{color:m.color}}>{m.name}</span>
                    <span className="text-[9px] text-white/25">· {m.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-5 mt-6 pt-6 border-t border-white/[0.07]">
            {[{n:"17", l:"AI Models"},{n:"50+",l:"Apps"},{n:"∞",l:"Parallel"},{n:"1ms",l:"Switch"}].map(s => (
              <div key={s.l}>
                <div className="text-[22px] font-black text-white leading-none">{s.n}</div>
                <div className="text-[9px] text-white/30 font-bold uppercase tracking-wider">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right auth panel ── */}
      <div className="w-full lg:w-[440px] xl:w-[480px] shrink-0 flex flex-col relative">
        {/* Mobile-only background */}
        <div className="lg:hidden absolute inset-0">
          <div className="absolute top-0 left-[-50%] w-[600px] h-[600px] rounded-full opacity-20"
            style={{background:"radial-gradient(circle, rgba(124,58,237,0.8) 0%, transparent 70%)", filter:"blur(80px)"}} />
          <div className="absolute bottom-0 right-[-30%] w-[400px] h-[400px] rounded-full opacity-15"
            style={{background:"radial-gradient(circle, rgba(236,72,153,0.8) 0%, transparent 70%)", filter:"blur(80px)"}} />
        </div>

        {/* Panel background */}
        <div className="absolute inset-0 bg-[#07071a]/90 lg:bg-[#07071a] border-l border-white/[0.06]" />

        {/* Right panel content */}
        <div className="relative z-10 flex flex-col h-full px-8 py-10 justify-center">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <img src="/gyan-logo.jpg" alt="GyanTechNet" className="w-9 h-9 rounded-xl object-cover border border-violet-500/40"
              style={{boxShadow:"0 0 16px rgba(124,58,237,0.5)"}} />
            <div>
              <div className="text-white font-black text-[16px] leading-none">GyanTechNet</div>
              <div className="text-[9px] text-violet-400/60 font-bold tracking-widest uppercase mt-0.5">AI Platform</div>
            </div>
          </div>

          <div className="mb-7">
            <h2 className="text-[26px] font-black text-white leading-tight mb-1.5">
              {tab === "signin" ? "Welcome back" : "Get started free"}
            </h2>
            <p className="text-[13px] text-white/35">
              {tab === "signin" ? "Sign in to your GyanTechNet workspace" : "Create your account and start multitasking with AI"}
            </p>
          </div>

          {/* Tab toggle */}
          <div className="flex bg-white/[0.05] border border-white/[0.08] rounded-2xl p-1 mb-6">
            {(["signin", "signup"] as Tab[]).map(t => (
              <button key={t} onClick={() => { setTab(t); setError(""); }}
                className={`flex-1 py-2.5 text-[13px] font-bold rounded-xl transition-all ${
                  tab === t
                    ? "bg-gradient-to-r from-violet-600 to-violet-700 text-white shadow-[0_2px_16px_rgba(124,58,237,0.4)]"
                    : "text-white/30 hover:text-white/60"
                }`}>
                {t === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === "signup" && (
              <div>
                <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Display Name</label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl pl-11 pr-4 py-3.5 text-[14px] text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.06] transition-all" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="you@gyan.tech"
                  className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl pl-11 pr-4 py-3.5 text-[14px] text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.06] transition-all" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest">Password</label>
                {tab === "signin" && <a href="#" className="text-[11px] text-violet-400/70 hover:text-violet-300 transition-colors">Forgot?</a>}
              </div>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <input type={showPass ? "text" : "password"} value={password} onChange={e => setPass(e.target.value)} required
                  placeholder={tab === "signup" ? "At least 6 characters" : "Enter password"}
                  className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl pl-11 pr-12 py-3.5 text-[14px] text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.06] transition-all" />
                <button type="button" onClick={() => setShow(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/55 transition-colors">
                  {showPass ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3">
                <FiAlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span className="text-[12px] text-red-400">{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-4 mt-1 bg-gradient-to-r from-violet-600 via-violet-500 to-pink-500 text-white font-black text-[14px] rounded-xl shadow-[0_4px_24px_rgba(124,58,237,0.4)] hover:shadow-[0_4px_40px_rgba(124,58,237,0.6)] transition-all active:scale-[0.98] disabled:opacity-60">
              {loading ? (
                <span className="flex gap-1.5">
                  {[0,1,2].map(i => <span key={i} className="w-2 h-2 rounded-full bg-white animate-bounce" style={{animationDelay:`${i*0.12}s`}} />)}
                </span>
              ) : (
                <>
                  <FiZap className="w-4.5 h-4.5" />
                  {tab === "signin" ? "Sign In to GyanTechNet" : "Create Free Account"}
                </>
              )}
            </button>
          </form>

          {/* Trust badges */}
          <div className="mt-6 grid grid-cols-3 gap-2">
            {[
              { icon: "🔒", label: "Encrypted" },
              { icon: "⚡", label: "17 AI Models" },
              { icon: "🌐", label: "Global CDN" },
            ].map(b => (
              <div key={b.label} className="flex flex-col items-center gap-1 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <span className="text-base">{b.icon}</span>
                <span className="text-[9px] text-white/25 font-bold">{b.label}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-[11px] text-white/18 mt-5">
            By continuing, you agree to use GyanTechNet responsibly.
          </p>

          <div className="mt-auto pt-8">
            <Link href="/" className="flex items-center justify-center gap-1.5 text-[11px] text-white/20 hover:text-white/45 transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
