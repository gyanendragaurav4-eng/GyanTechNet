import { useState } from "react";
import { FiKey, FiPlus, FiCopy, FiTrash2, FiEye, FiEyeOff, FiCheck, FiActivity, FiShield, FiX, FiRefreshCw } from "react-icons/fi";
import { cn } from "@/lib/utils";

type APIKey = {
  id:number; name:string; key:string; description:string;
  created:string; lastUsed:string; requests:number; rateLimit:string; status:"active"|"revoked";
};

const INITIAL_KEYS: APIKey[] = [
  { id:1, name:"Production Key",   key:"gtn_sk_prod_a1b2c3d4e5f6g7h8i9j0k1l2",  description:"Main production environment",  created:"2026-01-15", lastUsed:"Today",      requests:1247, rateLimit:"1000/min", status:"active" },
  { id:2, name:"Development Key",  key:"gtn_sk_dev_k1l2m3n4o5p6q7r8s9t0u1v2",   description:"Local development and testing", created:"2026-02-20", lastUsed:"Yesterday",  requests:358,  rateLimit:"500/min",  status:"active" },
  { id:3, name:"Testing Key",      key:"gtn_sk_test_u1v2w3x4y5z6a7b8c9d0e1f2", description:"Automated testing suite",       created:"2026-04-01", lastUsed:"Oct 25",     requests:89,   rateLimit:"100/min",  status:"active" },
  { id:4, name:"Old Integration",  key:"gtn_sk_old_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx", description:"Deprecated integration key",    created:"2025-11-01", lastUsed:"Jan 2026",   requests:4210, rateLimit:"—",        status:"revoked" },
];

function genKey(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return "gtn_sk_" + Array.from({length:30},()=>chars[Math.floor(Math.random()*chars.length)]).join("");
}

export default function APIKeysPage() {
  const [keys, setKeys]     = useState<APIKey[]>(INITIAL_KEYS);
  const [visible, setVisible] = useState<Set<number>>(new Set());
  const [copied, setCopied]  = useState<number|null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ name:"", description:"", rateLimit:"500/min" });

  const toggle = (id: number) => setVisible(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const copy   = (id: number, key: string) => { navigator.clipboard.writeText(key).catch(()=>{}); setCopied(id); setTimeout(() => setCopied(null), 2000); };

  const createKey = () => {
    if (!newForm.name.trim()) return;
    const newKey: APIKey = {
      id: Date.now(), name: newForm.name, key: genKey(),
      description: newForm.description, created: "Today", lastUsed: "—",
      requests: 0, rateLimit: newForm.rateLimit, status:"active",
    };
    setKeys(p => [newKey, ...p]);
    setNewForm({ name:"", description:"", rateLimit:"500/min" }); setShowNew(false);
  };

  const revokeKey = (id: number) => setKeys(p => p.map(k => k.id === id ? {...k, status:"revoked"} : k));
  const deleteKey = (id: number) => setKeys(p => p.filter(k => k.id !== id));

  const maskKey = (key: string) => key.slice(0, 11) + "•".repeat(20) + key.slice(-4);

  const totalRequests = keys.filter(k => k.status === "active").reduce((a, k) => a + k.requests, 0).toLocaleString();

  return (
    <div className="h-full overflow-y-auto no-scrollbar bg-[#06060f]">
      <div className="max-w-4xl mx-auto px-4 py-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h1 className="text-white font-black text-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-primary/20 flex items-center justify-center">
                <FiKey className="w-4.5 h-4.5 text-primary" />
              </div>
              API Keys
            </h1>
            <p className="text-white/35 text-[13px] mt-1 ml-12">Manage your GyanTechNet API credentials</p>
          </div>
          <button onClick={() => setShowNew(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl text-[13px] font-bold hover:from-primary/90 hover:to-blue-500 shadow-[0_4px_12px_rgba(124,58,237,0.3)] transition-all">
            <FiPlus className="w-4 h-4" /> Generate New Key
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label:"Active Keys",     value:keys.filter(k=>k.status==="active").length, icon:FiKey,      color:"text-primary bg-primary/10" },
            { label:"Total Requests",  value:totalRequests,                               icon:FiActivity, color:"text-blue-400 bg-blue-500/10" },
            { label:"Rate Limit",      value:"1000/min",                                  icon:FiRefreshCw,color:"text-emerald-400 bg-emerald-500/10" },
            { label:"Security Level",  value:"High",                                      icon:FiShield,   color:"text-violet-400 bg-violet-500/10" },
          ].map(s => (
            <div key={s.label} className="bg-[#0d0d1e] border border-white/[0.07] rounded-2xl p-4">
              <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mb-3", s.color)}>
                <s.icon className="w-3.5 h-3.5" />
              </div>
              <div className="text-white font-black text-[22px] leading-none">{s.value}</div>
              <div className="text-white/35 text-[11px] mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* API Keys list */}
        <div className="space-y-3">
          {keys.map(k => (
            <div key={k.id} className={cn("bg-[#0d0d1e] border rounded-2xl p-5 transition-all",
              k.status === "revoked" ? "border-red-500/15 opacity-60" : "border-white/[0.07] hover:border-white/[0.12]")}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center",
                    k.status === "revoked" ? "bg-red-500/10" : "bg-primary/10")}>
                    <FiKey className={cn("w-4 h-4", k.status === "revoked" ? "text-red-400" : "text-primary")} />
                  </div>
                  <div>
                    <div className="text-white font-bold text-[14px] flex items-center gap-2">
                      {k.name}
                      <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full uppercase",
                        k.status === "active" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400")}>
                        {k.status}
                      </span>
                    </div>
                    <div className="text-white/35 text-[11.5px] mt-0.5">{k.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {k.status === "active" && (
                    <button onClick={() => revokeKey(k.id)} className="px-2.5 py-1 rounded-lg text-[11px] text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-all font-semibold">
                      Revoke
                    </button>
                  )}
                  <button onClick={() => deleteKey(k.id)} className="p-1.5 text-white/20 hover:text-red-400 bg-white/[0.04] rounded-lg transition-all">
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Key display */}
              <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2 mb-3 font-mono">
                <span className="flex-1 text-[12px] text-white/50 truncate min-w-0">
                  {visible.has(k.id) ? k.key : maskKey(k.key)}
                </span>
                <button onClick={() => toggle(k.id)} className="p-1 text-white/25 hover:text-white transition-colors shrink-0">
                  {visible.has(k.id) ? <FiEyeOff className="w-3.5 h-3.5" /> : <FiEye className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => copy(k.id, k.key)} className="p-1 text-white/25 hover:text-white transition-colors shrink-0">
                  {copied === k.id ? <FiCheck className="w-3.5 h-3.5 text-emerald-400" /> : <FiCopy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label:"Created",    value:k.created },
                  { label:"Last Used",  value:k.lastUsed },
                  { label:"Requests",   value:k.requests.toLocaleString() },
                  { label:"Rate Limit", value:k.rateLimit },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <div className="text-white/65 text-[12px] font-semibold">{s.value}</div>
                    <div className="text-white/25 text-[9.5px] uppercase font-bold tracking-wide">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Docs notice */}
        <div className="mt-6 bg-blue-500/[0.06] border border-blue-500/15 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0">
              <FiShield className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div>
              <div className="text-blue-300 font-bold text-[13px] mb-1">Keep your keys secure</div>
              <div className="text-white/40 text-[12px] leading-relaxed">Never share your API keys in public repositories or client-side code. Use environment variables and server-side code only.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Create key modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowNew(false)}>
          <div className="w-full max-w-md bg-[#0d0d1e] border border-white/[0.1] rounded-2xl p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-[15px]">Generate API Key</h3>
              <button onClick={() => setShowNew(false)} className="p-1 text-white/30 hover:text-white"><FiX className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-white/30 uppercase font-bold tracking-widest block mb-1">Key Name</label>
                <input value={newForm.name} onChange={e => setNewForm(f=>({...f,name:e.target.value}))}
                  placeholder="e.g. Production Key"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-[13px] outline-none placeholder:text-white/20 focus:border-primary/40 transition-all" />
              </div>
              <div>
                <label className="text-[10px] text-white/30 uppercase font-bold tracking-widest block mb-1">Description</label>
                <input value={newForm.description} onChange={e => setNewForm(f=>({...f,description:e.target.value}))}
                  placeholder="What's this key used for?"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-[13px] outline-none placeholder:text-white/20 focus:border-primary/40 transition-all" />
              </div>
              <div>
                <label className="text-[10px] text-white/30 uppercase font-bold tracking-widest block mb-1">Rate Limit</label>
                <select value={newForm.rateLimit} onChange={e => setNewForm(f=>({...f,rateLimit:e.target.value}))}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-[13px] outline-none" style={{colorScheme:"dark"}}>
                  {["100/min","500/min","1000/min","Unlimited"].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowNew(false)} className="flex-1 py-2.5 rounded-xl border border-white/[0.1] text-white/50 text-[13px]">Cancel</button>
              <button onClick={createKey} disabled={!newForm.name.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white text-[13px] font-bold disabled:opacity-30 transition-all">
                <FiKey className="w-4 h-4" /> Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
