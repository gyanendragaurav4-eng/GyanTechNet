import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, Link } from "wouter";
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi";

export default function RegisterPage() {
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]       = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]     = useState("");
  const { register } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = register(name.trim(), email.trim(), password);
    if (!res.ok) { setError(res.error || "Registration failed."); return; }
    setLocation("/chat");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#07071a] relative overflow-hidden p-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/8 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 mb-8 flex flex-col items-center">
        <div className="relative mb-4">
          <div className="absolute inset-[-8px] rounded-2xl pointer-events-none" style={{ background: "radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)", filter: "blur(8px)" }} />
          <img src="/gyan-logo.jpg" alt="GyanTechNet" className="relative w-16 h-16 rounded-2xl object-cover border border-purple-500/35" style={{ boxShadow: "0 0 25px rgba(168,85,247,0.5)" }} />
        </div>
        <h1 className="text-2xl font-bold text-white">GyanTechNet</h1>
        <p className="text-white/40 text-sm mt-1">Create your account — start for free</p>
      </div>

      <div className="relative z-10 w-full max-w-sm bg-[#0d0d20] border border-white/8 rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        <div className="flex bg-[#07071a] rounded-xl p-1 mb-6">
          <Link href="/login" className="flex-1 py-2 text-sm font-semibold rounded-lg text-center text-white/40 hover:text-white transition-colors">Sign In</Link>
          <div className="flex-1 py-2 text-sm font-semibold rounded-lg text-center bg-gradient-to-r from-primary to-pink-500 text-white shadow-lg">Sign Up</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Full Name</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name"
                className="w-full bg-[#07071a] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@gyan.tech" required
                className="w-full bg-[#07071a] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a password" required
                className="w-full bg-[#07071a] border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                {showPass ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
              <FiAlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span className="text-[12px] text-red-400">{error}</span>
            </div>
          )}
          <button type="submit"
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-primary via-violet-500 to-pink-500 text-white font-bold rounded-xl shadow-[0_0_30px_rgba(124,58,237,0.3)] hover:shadow-[0_0_50px_rgba(124,58,237,0.5)] transition-all text-sm mt-2">
            <span>🚀</span> Create Account
          </button>
        </form>

        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-white/25">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Free forever · No credit card required
        </div>
      </div>

      <Link href="/" className="relative z-10 mt-4 text-xs text-white/20 hover:text-white/50 transition-colors">← Back to home</Link>
    </div>
  );
}
