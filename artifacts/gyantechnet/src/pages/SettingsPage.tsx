import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FiUser, FiLock, FiBell, FiShield, FiCreditCard, FiLogOut, FiCheck } from "react-icons/fi";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

const sections = [
  { id:"profile",       label:"Profile",       icon:FiUser },
  { id:"account",       label:"Account",       icon:FiLock },
  { id:"notifications", label:"Notifications", icon:FiBell },
  { id:"privacy",       label:"Privacy",       icon:FiShield },
  { id:"billing",       label:"Billing",       icon:FiCreditCard },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-white/45 uppercase tracking-wider mb-2">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, type = "text", placeholder }: { value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} type={type} placeholder={placeholder}
      className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl px-4 py-2.5 text-[13.5px] text-white focus:outline-none focus:border-primary/50 focus:bg-white/[0.06] transition-all" />
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [,setLocation] = useLocation();
  const [active, setActive] = useState("profile");
  const [name, setName] = useState(user?.name || "User");
  const [email, setEmail] = useState(user?.email || "user@gyan.tech");
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="flex h-full overflow-hidden bg-[#06060f]">

      {/* ── Desktop sidebar / Mobile hidden ── */}
      <div className="hidden sm:flex w-52 shrink-0 bg-[#08081a] border-r border-white/[0.06] flex-col p-3">
        <h1 className="text-[16px] font-bold text-white px-3 py-2 mb-2">Settings</h1>
        <div className="space-y-0.5 flex-1">
          {sections.map(s => (
            <button key={s.id} onClick={() => setActive(s.id)}
              className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all",
                active===s.id ? "bg-primary/12 text-primary" : "text-white/45 hover:bg-white/[0.04] hover:text-white/80")}>
              <s.icon className="w-4 h-4 shrink-0" />{s.label}
            </button>
          ))}
        </div>
        <button onClick={() => { logout(); setLocation("/login"); }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-all w-full mt-1">
          <FiLogOut className="w-4 h-4 shrink-0" /> Sign Out
        </button>
      </div>

      {/* ── Content area ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Mobile tabs */}
        <div className="sm:hidden border-b border-white/[0.06] overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-0.5 px-2 py-2 min-w-max">
            {sections.map(s => (
              <button key={s.id} onClick={() => setActive(s.id)}
                className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-all",
                  active===s.id ? "bg-primary/15 text-primary" : "text-white/40 hover:text-white/70")}>
                <s.icon className="w-3.5 h-3.5" />{s.label}
              </button>
            ))}
            <button onClick={() => { logout(); setLocation("/login"); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium text-red-400/70 whitespace-nowrap">
              <FiLogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-8">
          <div className="max-w-lg mx-auto sm:mx-0 w-full">

            {active === "profile" && (
              <div className="space-y-6">
                <h2 className="text-[18px] font-bold text-white">Profile</h2>
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center text-white font-black text-2xl sm:text-3xl shadow-[0_0_20px_rgba(124,58,237,0.35)]">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <button className="px-4 py-2 bg-primary/15 border border-primary/30 text-primary text-[12.5px] font-semibold rounded-xl hover:bg-primary/25 transition-all">Change Photo</button>
                    <p className="text-[11px] text-white/30 mt-1.5">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <Field label="Full Name"><Input value={name} onChange={setName} placeholder="Your name" /></Field>
                  <Field label="Email"><Input value={email} onChange={setEmail} type="email" placeholder="you@gyan.tech" /></Field>
                  <Field label="Bio">
                    <textarea
                      placeholder="Tell us about yourself…"
                      className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl px-4 py-2.5 text-[13.5px] text-white placeholder:text-white/25 focus:outline-none focus:border-primary/50 transition-all resize-none min-h-[90px]"
                    />
                  </Field>
                </div>
                <button onClick={save}
                  className={cn("flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-[13px] transition-all",
                    saved
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-gradient-to-r from-primary to-pink-500 text-white shadow-[0_0_16px_rgba(124,58,237,0.35)] hover:shadow-[0_0_24px_rgba(124,58,237,0.5)]")}>
                  {saved ? <><FiCheck className="w-4 h-4" /> Saved!</> : "Save Changes"}
                </button>
              </div>
            )}

            {active === "account" && (
              <div className="space-y-6">
                <h2 className="text-[18px] font-bold text-white">Account Security</h2>
                <div className="space-y-4">
                  <Field label="Current Password"><Input value="" onChange={() => {}} type="password" placeholder="Enter current password" /></Field>
                  <Field label="New Password"><Input value="" onChange={() => {}} type="password" placeholder="Min. 8 characters" /></Field>
                  <Field label="Confirm Password"><Input value="" onChange={() => {}} type="password" placeholder="Repeat new password" /></Field>
                </div>
                <button className="px-5 py-2.5 bg-gradient-to-r from-primary to-pink-500 text-white text-[13px] font-semibold rounded-xl shadow-[0_0_16px_rgba(124,58,237,0.35)] hover:shadow-[0_0_24px_rgba(124,58,237,0.5)] transition-all">
                  Update Password
                </button>
              </div>
            )}

            {active === "notifications" && (
              <div className="space-y-6">
                <h2 className="text-[18px] font-bold text-white">Notifications</h2>
                <div className="space-y-3">
                  {["AI response complete", "New features & updates", "Weekly digest", "Marketing emails"].map(item => (
                    <div key={item} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                      <span className="text-[13.5px] text-white/70">{item}</span>
                      <div className="w-10 h-6 bg-primary/20 rounded-full relative cursor-pointer border border-primary/30">
                        <div className="absolute right-1 top-1 w-4 h-4 bg-primary rounded-full shadow" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {active === "privacy" && (
              <div className="space-y-6">
                <h2 className="text-[18px] font-bold text-white">Privacy</h2>
                <div className="space-y-3">
                  {["Save conversation history", "Improve AI with my data", "Share usage analytics"].map(item => (
                    <div key={item} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                      <span className="text-[13.5px] text-white/70">{item}</span>
                      <div className="w-10 h-6 bg-white/[0.07] rounded-full relative cursor-pointer border border-white/[0.09]">
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white/30 rounded-full shadow" />
                      </div>
                    </div>
                  ))}
                </div>
                <button className="px-5 py-2.5 rounded-xl border border-red-500/30 text-red-400 text-[13px] font-semibold hover:bg-red-500/10 transition-all">
                  Delete All Data
                </button>
              </div>
            )}

            {active === "billing" && (
              <div className="space-y-6">
                <h2 className="text-[18px] font-bold text-white">Billing</h2>
                <div className="p-5 rounded-2xl bg-gradient-to-r from-primary/[0.12] to-pink-500/[0.08] border border-primary/[0.20]">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-[14px] font-bold text-white">Free Plan</div>
                      <div className="text-[12px] text-white/40">Limited AI requests per day</div>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 bg-white/10 text-white/60 rounded-full">ACTIVE</span>
                  </div>
                  <button className="w-full py-2.5 bg-gradient-to-r from-primary to-pink-500 text-white text-[13px] font-bold rounded-xl shadow-[0_0_16px_rgba(124,58,237,0.35)] hover:shadow-[0_0_24px_rgba(124,58,237,0.5)] transition-all">
                    Upgrade to Pro · Rs.499/mo
                  </button>
                </div>
                <div className="space-y-2.5">
                  <div className="text-[12px] font-bold text-white/30 uppercase tracking-widest mb-3">Pro Features</div>
                  {["Unlimited AI messages", "17 AI models access", "Priority processing", "API access", "GyanVerse Pro apps"].map(f => (
                    <div key={f} className="flex items-center gap-3 text-[13px] text-white/60">
                      <span className="text-emerald-400 text-base">✓</span> {f}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
