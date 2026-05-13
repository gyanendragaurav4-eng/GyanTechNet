import { useState } from "react";
import {
  FiLock, FiPlus, FiEye, FiEyeOff, FiCopy, FiTrash2, FiSearch, FiCheck,
  FiZap, FiShield, FiRefreshCw, FiX,
} from "react-icons/fi";
import { cn } from "@/lib/utils";

type Password = {
  id: number; name: string; username: string; password: string;
  category: string; strength: string; initials: string; color: string;
  url?: string; notes?: string;
};

const COLORS = ["bg-red-500","bg-orange-500","bg-amber-500","bg-blue-500","bg-violet-500","bg-emerald-500","bg-pink-500","bg-cyan-500"];
const CATEGORIES = ["All","Social","Banking","Work","Shopping","Entertainment","Other"];
const STRENGTH_STYLE: Record<string,string> = {
  Strong:  "text-emerald-400 bg-emerald-500/10",
  Good:    "text-blue-400 bg-blue-500/10",
  Weak:    "text-red-400 bg-red-500/10",
  Fair:    "text-amber-400 bg-amber-500/10",
};

const INITIAL: Password[] = [
  { id:1, name:"Gmail",      username:"user@gyantechnet.com",  password:"Gm@il$ecure2026!",   category:"Work",      strength:"Strong", initials:"G",  color:"bg-red-500",    url:"gmail.com" },
  { id:2, name:"GitHub",     username:"gyantechnet-dev",        password:"G!tHub#Dev2026##",   category:"Work",      strength:"Strong", initials:"GH", color:"bg-gray-700",   url:"github.com" },
  { id:3, name:"ICICI Bank", username:"user9876543",             password:"Bank@IC1CI#2026",    category:"Banking",   strength:"Strong", initials:"IC", color:"bg-orange-600", notes:"OTP on registered mobile" },
  { id:4, name:"Amazon",     username:"user@gyantechnet.com",   password:"Amaz0n@Shop99",      category:"Shopping",  strength:"Good",   initials:"A",  color:"bg-amber-500",  url:"amazon.in" },
  { id:5, name:"Twitter/X",  username:"@gyantechnet",           password:"tw!tterX#2026",      category:"Social",    strength:"Good",   initials:"X",  color:"bg-blue-400",   url:"x.com" },
  { id:6, name:"LinkedIn",   username:"user@gyantechnet.com",   password:"L!nkd3n@Pro26",      category:"Social",    strength:"Strong", initials:"Li", color:"bg-blue-600",   url:"linkedin.com" },
  { id:7, name:"Netflix",    username:"user@gyantechnet.com",   password:"netflix123",          category:"Entertainment", strength:"Weak", initials:"N", color:"bg-red-600", url:"netflix.com" },
];

function generatePassword(len = 16) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_+=";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function getStrength(pass: string): string {
  if (pass.length < 6) return "Weak";
  let score = 0;
  if (pass.length >= 12) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^a-zA-Z0-9]/.test(pass)) score++;
  return ["Weak","Fair","Good","Strong","Strong"][score] || "Weak";
}

export default function PasswordsPage() {
  const [passwords, setPasswords] = useState<Password[]>(INITIAL);
  const [activeCat, setActiveCat] = useState("All");
  const [search, setSearch] = useState("");
  const [reveal, setReveal] = useState<Record<number,boolean>>({});
  const [copied, setCopied] = useState<number|null>(null);
  const [selected, setSelected] = useState<Password|null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ name:"", username:"", password:"", category:"Work", url:"", notes:"" });

  const filtered = passwords.filter(p => {
    const q = search.toLowerCase();
    if (q && !p.name.toLowerCase().includes(q) && !p.username.toLowerCase().includes(q)) return false;
    if (activeCat !== "All" && p.category !== activeCat) return false;
    return true;
  });

  const securityScore = Math.round(passwords.filter(p => p.strength === "Strong").length / passwords.length * 100);

  const copyPass = (id: number, pass: string) => {
    navigator.clipboard.writeText(pass).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const deletePass = (id: number) => {
    setPasswords(p => p.filter(pw => pw.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const addPassword = () => {
    if (!newForm.name.trim() || !newForm.password.trim()) return;
    const initials = newForm.name.slice(0, 2).toUpperCase();
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const strength = getStrength(newForm.password);
    setPasswords(p => [...p, { id: Date.now(), ...newForm, strength, initials, color }]);
    setNewForm({ name:"", username:"", password:"", category:"Work", url:"", notes:"" });
    setShowNew(false);
  };

  const maskPassword = (pass: string) => "•".repeat(Math.min(pass.length, 14));

  return (
    <div className="flex h-full bg-[#06060f] overflow-hidden">

      {/* Sidebar */}
      <div className="hidden md:flex w-60 shrink-0 bg-[#08081a] border-r border-white/[0.06] flex-col">
        <div className="px-4 pt-4 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
              <FiLock className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-white font-black text-[14px] leading-none">GyanPasswords</h1>
              <p className="text-white/30 text-[10px]">{passwords.length} saved passwords</p>
            </div>
          </div>

          {/* Security score */}
          <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <FiShield className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-white/60 text-[11px] font-semibold">Security Score</span>
              </div>
              <span className={cn("font-black text-[14px]", securityScore >= 80 ? "text-emerald-400" : securityScore >= 60 ? "text-amber-400" : "text-red-400")}>
                {securityScore}/100
              </span>
            </div>
            <div className="h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
              <div className={cn("h-full rounded-full transition-all", securityScore >= 80 ? "bg-emerald-400" : securityScore >= 60 ? "bg-amber-400" : "bg-red-400")}
                style={{ width: `${securityScore}%` }} />
            </div>
          </div>

          <button onClick={() => setShowNew(true)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-primary/15 text-primary text-[12px] font-bold border border-primary/20 hover:bg-primary/25 transition-all">
            <FiPlus className="w-3.5 h-3.5" /> Add Password
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar py-2 px-3">
          <div className="text-[9px] text-white/25 uppercase font-bold tracking-widest px-1 mb-1.5">Categories</div>
          {CATEGORIES.map(cat => {
            const count = cat === "All" ? passwords.length : passwords.filter(p => p.category === cat).length;
            return (
              <button key={cat} onClick={() => setActiveCat(cat)}
                className={cn("w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-[12px] font-medium transition-all mb-0.5",
                  activeCat === cat ? "bg-primary/10 text-primary" : "text-white/40 hover:bg-white/[0.04] hover:text-white")}>
                <span>{cat}</span>
                <span className="text-[10px] bg-white/[0.07] px-2 py-0.5 rounded-full text-white/40 font-bold">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main panel */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Search header */}
        <div className="px-4 py-3 border-b border-white/[0.06] bg-[#06060f] shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search passwords..."
                className="w-full bg-[#0d0d1e] border border-white/[0.08] rounded-xl pl-9 pr-3 py-2 text-white text-[13px] outline-none placeholder:text-white/20 focus:border-primary/40 transition-all" />
            </div>
            <button onClick={() => setShowNew(true)}
              className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/15 text-primary text-[12px] font-bold border border-primary/20 hover:bg-primary/25 transition-all">
              <FiPlus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="p-3 space-y-1.5">
            {filtered.map(p => (
              <button key={p.id} onClick={() => setSelected(p)}
                className={cn("w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all text-left group",
                  selected?.id === p.id ? "bg-white/[0.07] ring-1 ring-white/[0.09]" : "hover:bg-white/[0.04]")}>
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-black text-white shrink-0", p.color)}>
                  {p.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-[13px]">{p.name}</span>
                    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full", STRENGTH_STYLE[p.strength])}>{p.strength}</span>
                  </div>
                  <div className="text-white/35 text-[11px] truncate mt-0.5">{p.username}</div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                  <button onClick={e => { e.stopPropagation(); setReveal(r => ({...r,[p.id]:!r[p.id]})); }}
                    className="p-1.5 text-white/25 hover:text-white bg-white/[0.04] rounded-lg transition-all">
                    {reveal[p.id] ? <FiEyeOff className="w-3.5 h-3.5" /> : <FiEye className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={e => { e.stopPropagation(); copyPass(p.id, p.password); }}
                    className="p-1.5 text-white/25 hover:text-white bg-white/[0.04] rounded-lg transition-all">
                    {copied === p.id ? <FiCheck className="w-3.5 h-3.5 text-emerald-400" /> : <FiCopy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="text-white/25 text-[12px] font-mono shrink-0 hidden sm:block">
                  {reveal[p.id] ? p.password : maskPassword(p.password)}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="hidden md:flex w-72 shrink-0 flex-col bg-[#08081a] border-l border-white/[0.06]">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
            <span className="text-white font-bold flex-1 text-[13px]">Password Details</span>
            <button onClick={() => deletePass(selected.id)} className="p-1.5 text-white/25 hover:text-red-400 bg-white/[0.04] rounded-lg transition-all">
              <FiTrash2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setSelected(null)} className="p-1.5 text-white/25 hover:text-white bg-white/[0.04] rounded-lg transition-all">
              <FiX className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-4">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-2 py-3">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-[0_0_20px_rgba(0,0,0,0.4)]", selected.color)}>
                {selected.initials}
              </div>
              <div className="text-center">
                <div className="text-white font-bold text-[16px]">{selected.name}</div>
                {selected.url && <div className="text-white/35 text-[12px]">{selected.url}</div>}
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block", STRENGTH_STYLE[selected.strength])}>
                  {selected.strength} Password
                </span>
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-2.5">
              {[
                { label:"Username / Email", value:selected.username, copy:true },
                { label:"Category",         value:selected.category, copy:false },
              ].map(f => (
                <div key={f.label} className="bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2.5">
                  <div className="text-[9px] text-white/25 uppercase font-bold tracking-widest">{f.label}</div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-white/75 text-[12.5px] font-medium">{f.value}</span>
                    {f.copy && (
                      <button onClick={() => navigator.clipboard.writeText(f.value).catch(()=>{})} className="p-1 text-white/25 hover:text-white transition-colors">
                        <FiCopy className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Password reveal */}
              <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2.5">
                <div className="text-[9px] text-white/25 uppercase font-bold tracking-widest">Password</div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-white/75 text-[12.5px] font-mono">
                    {reveal[selected.id] ? selected.password : maskPassword(selected.password)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setReveal(r => ({...r,[selected.id]:!r[selected.id]}))} className="p-1 text-white/25 hover:text-white transition-colors">
                      {reveal[selected.id] ? <FiEyeOff className="w-3.5 h-3.5" /> : <FiEye className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => copyPass(selected.id, selected.password)} className="p-1 text-white/25 hover:text-white transition-colors">
                      {copied === selected.id ? <FiCheck className="w-3.5 h-3.5 text-emerald-400" /> : <FiCopy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {selected.notes && (
                <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2.5">
                  <div className="text-[9px] text-white/25 uppercase font-bold tracking-widest">Notes</div>
                  <div className="text-white/60 text-[12px] mt-0.5">{selected.notes}</div>
                </div>
              )}
            </div>

            {/* Generate new password */}
            <div className="bg-violet-500/[0.06] border border-violet-500/15 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <FiZap className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-violet-300 font-bold text-[11.5px]">Generate New Password</span>
              </div>
              <button onClick={() => {
                const newPass = generatePassword(18);
                setPasswords(p => p.map(pw => pw.id === selected.id ? { ...pw, password: newPass, strength: getStrength(newPass) } : pw));
                setSelected(s => s ? { ...s, password: newPass, strength: getStrength(newPass) } : s);
              }} className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-violet-600/15 text-violet-300 text-[12px] font-bold border border-violet-500/20 hover:bg-violet-600/25 transition-all">
                <FiRefreshCw className="w-3.5 h-3.5" /> Generate Secure Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add password modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowNew(false)}>
          <div className="w-full max-w-md bg-[#0d0d1e] border border-white/[0.1] rounded-2xl p-5" onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-bold text-[15px] mb-4">Add Password</h3>
            <div className="space-y-3">
              {([["name","Site / App","Gmail"],["username","Username / Email","user@example.com"],["url","URL (optional)","gmail.com"],["notes","Notes (optional)","Two-factor enabled"]] as const).map(([id,label,ph]) => (
                <div key={id}>
                  <label className="text-[10px] text-white/30 uppercase font-bold tracking-widest block mb-1">{label}</label>
                  <input value={newForm[id]} onChange={e => setNewForm(f => ({...f,[id]:e.target.value}))}
                    placeholder={ph}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-[12.5px] outline-none placeholder:text-white/20 focus:border-primary/40 transition-all" />
                </div>
              ))}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Password</label>
                  <button onClick={() => setNewForm(f => ({...f, password: generatePassword(18)}))}
                    className="flex items-center gap-1 text-[10px] text-violet-400 hover:text-violet-300 font-bold transition-colors">
                    <FiRefreshCw className="w-2.5 h-2.5" /> Generate
                  </button>
                </div>
                <input value={newForm.password} onChange={e => setNewForm(f => ({...f, password: e.target.value}))}
                  placeholder="Enter or generate password"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-[12.5px] font-mono outline-none placeholder:text-white/20 focus:border-primary/40 transition-all" />
              </div>
              <div>
                <label className="text-[10px] text-white/30 uppercase font-bold tracking-widest block mb-1">Category</label>
                <select value={newForm.category} onChange={e => setNewForm(f => ({...f, category: e.target.value}))}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-[12.5px] outline-none" style={{ colorScheme:"dark" }}>
                  {CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowNew(false)} className="flex-1 py-2.5 rounded-xl border border-white/[0.1] text-white/50 text-[13px] hover:text-white transition-all">Cancel</button>
              <button onClick={addPassword} disabled={!newForm.name.trim() || !newForm.password.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[13px] font-bold disabled:opacity-30 transition-all">
                <FiCheck className="w-4 h-4" /> Save Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
