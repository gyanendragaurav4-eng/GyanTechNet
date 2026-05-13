import { useState } from "react";
import {
  FiUsers, FiPlus, FiSearch, FiDollarSign, FiTrendingUp, FiPhone,
  FiMail, FiX, FiEdit2, FiZap, FiRefreshCw, FiCheck, FiStar,
} from "react-icons/fi";
import { cn } from "@/lib/utils";

type Contact = {
  id: number;
  name: string;
  email: string;
  company: string;
  status: string;
  value: string;
  initials: string;
  color: string;
  starred: boolean;
  lastContact?: string;
  notes?: string;
};

const INITIAL_CONTACTS: Contact[] = [
  { id:1, name:"Priya Sharma",   email:"priya@techcorp.com",    company:"TechCorp",        status:"Customer",  value:"₹45,000", initials:"PS", color:"bg-violet-500", starred:true,  lastContact:"2 days ago",  notes:"Key decision maker for enterprise plan" },
  { id:2, name:"Rahul Gupta",    email:"rahul@startup.in",      company:"StartupIn",       status:"Lead",      value:"₹12,000", initials:"RG", color:"bg-blue-500",   starred:false, lastContact:"1 week ago" },
  { id:3, name:"Ananya Singh",   email:"ananya@design.co",      company:"Design Co",       status:"Prospect",  value:"₹28,000", initials:"AS", color:"bg-pink-500",   starred:false, lastContact:"3 days ago",  notes:"Interested in AI chat integration" },
  { id:4, name:"Vikram Patel",   email:"vikram@enterprise.com", company:"Enterprise Ltd",  status:"Customer",  value:"₹95,000", initials:"VP", color:"bg-emerald-500",starred:true,  lastContact:"Today",       notes:"Annual contract renewal due in 2 months" },
  { id:5, name:"Sneha Verma",    email:"sneha@agency.in",       company:"Creative Agency", status:"Lead",      value:"₹7,500",  initials:"SV", color:"bg-amber-500",  starred:false, lastContact:"5 days ago" },
  { id:6, name:"Arjun Kumar",    email:"arjun@fintech.io",      company:"FinTech IO",      status:"Prospect",  value:"₹55,000", initials:"AK", color:"bg-cyan-500",   starred:false, lastContact:"Yesterday",   notes:"Requested demo" },
];

const STATUS_STYLE: Record<string,string> = {
  Customer: "bg-emerald-500/12 text-emerald-400 border-emerald-500/20",
  Lead:     "bg-blue-500/12 text-blue-400 border-blue-500/20",
  Prospect: "bg-amber-500/12 text-amber-400 border-amber-500/20",
  Churned:  "bg-red-500/12 text-red-400 border-red-500/20",
};

const PIPELINE_STAGES = ["Lead","Prospect","Customer"];

export default function CRMPage() {
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ name:"", email:"", company:"", value:"₹0", status:"Lead" });
  const [view, setView] = useState<"list"|"pipeline">("list");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string|null>(null);

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase();
    if (q && !c.name.toLowerCase().includes(q) && !c.company.toLowerCase().includes(q) && !c.email.toLowerCase().includes(q)) return false;
    if (statusFilter !== "All" && c.status !== statusFilter) return false;
    return true;
  });

  const totalValue = contacts.reduce((acc, c) => {
    const n = parseInt(c.value.replace(/[^\d]/g, ""));
    return acc + (isNaN(n) ? 0 : n);
  }, 0);

  const addContact = () => {
    if (!newForm.name.trim()) return;
    const initials = newForm.name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
    const colors = ["bg-violet-500","bg-blue-500","bg-pink-500","bg-emerald-500","bg-amber-500","bg-cyan-500"];
    setContacts(prev => [...prev, {
      id: Date.now(), ...newForm, initials,
      color: colors[Math.floor(Math.random() * colors.length)],
      starred: false,
    }]);
    setNewForm({ name:"", email:"", company:"", value:"₹0", status:"Lead" });
    setShowNew(false);
  };

  const toggleStar = (id: number) =>
    setContacts(prev => prev.map(c => c.id === id ? { ...c, starred: !c.starred } : c));

  const deleteContact = (id: number) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    if (activeContact?.id === id) setActiveContact(null);
  };

  const getAiInsight = async (contact: Contact) => {
    setAiLoading(true); setAiInsight(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role:"user", content:`CRM contact analysis: ${contact.name} from ${contact.company}, Status: ${contact.status}, Value: ${contact.value}, Last contact: ${contact.lastContact || "unknown"}, Notes: ${contact.notes || "none"}. Give 3-4 short actionable insights and next steps. Keep it concise.` }],
          mode: "Business", model: "openai/gpt-4o-mini",
        }),
      });
      const data = await res.json();
      setAiInsight(data.content || "Could not generate insight.");
    } catch { setAiInsight("Could not connect to AI."); }
    setAiLoading(false);
  };

  return (
    <div className="flex h-full bg-[#06060f] overflow-hidden">
      {/* List / Pipeline panel */}
      <div className={cn("flex flex-col bg-[#06060f] overflow-hidden transition-all",
        activeContact ? "hidden md:flex md:flex-1" : "flex-1")}>

        {/* Header */}
        <div className="px-4 py-3 border-b border-white/[0.06] bg-[#08081a] shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
              <FiUsers className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-white font-black text-[15px] leading-none">GyanCRM</h1>
              <p className="text-white/30 text-[10px]">{contacts.length} contacts · AI-powered</p>
            </div>
            <div className="flex-1" />
            {/* View toggle */}
            <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] rounded-lg p-1">
              {(["list","pipeline"] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={cn("px-2.5 py-1 rounded text-[11px] font-semibold capitalize transition-all",
                    view === v ? "bg-violet-500/20 text-violet-300" : "text-white/35 hover:text-white")}>
                  {v}
                </button>
              ))}
            </div>
            <button onClick={() => setShowNew(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/15 hover:bg-primary/25 text-primary text-[12px] font-bold border border-primary/20 transition-all">
              <FiPlus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[
              { label:"Contacts",    value:contacts.length,                                           color:"text-white" },
              { label:"Customers",   value:contacts.filter(c=>c.status==="Customer").length,          color:"text-emerald-400" },
              { label:"Leads",       value:contacts.filter(c=>c.status==="Lead").length,              color:"text-blue-400" },
              { label:"Pipeline",    value:`₹${Math.round(totalValue/1000)}K`,                        color:"text-violet-400" },
            ].map(s => (
              <div key={s.label} className="text-center p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <div className={cn("font-black text-[15px]", s.color)}>{s.value}</div>
                <div className="text-white/25 text-[9px]">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Search + filters */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search contacts..."
                className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg pl-8 pr-3 py-1.5 text-white text-[12px] outline-none placeholder:text-white/20 focus:border-primary/40 transition-all" />
            </div>
            <div className="flex gap-1">
              {["All","Customer","Lead","Prospect"].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={cn("px-2.5 py-1.5 rounded-lg text-[10.5px] font-semibold transition-all whitespace-nowrap",
                    statusFilter === s ? "bg-violet-500/20 text-violet-300 border border-violet-500/25" : "text-white/35 hover:text-white bg-white/[0.03] border border-white/[0.06]")}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {view === "list" ? (
          <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-2">
            {/* New contact form */}
            {showNew && (
              <div className="bg-[#0d0d1e] border border-primary/25 rounded-xl p-4 mb-3">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {[["name","Name","Priya Sharma"],["email","Email","priya@company.com"],["company","Company","Company Inc"],["value","Value","₹25,000"]].map(([id,label,ph]) => (
                    <div key={id}>
                      <label className="text-[9px] text-white/30 uppercase font-bold tracking-widest block mb-1">{label}</label>
                      <input value={(newForm as Record<string,string>)[id] || ""} onChange={e => setNewForm(f => ({...f,[id]:e.target.value}))}
                        placeholder={ph}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-white text-[12px] outline-none placeholder:text-white/20" />
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={addContact} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-[12px] font-bold border border-primary/20">
                    <FiCheck className="w-3 h-3" /> Add Contact
                  </button>
                  <button onClick={() => setShowNew(false)} className="p-1.5 text-white/30 hover:text-white">
                    <FiX className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {filtered.map(c => (
              <button key={c.id} onClick={() => setActiveContact(c)}
                className={cn("w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-1.5 transition-all text-left group",
                  activeContact?.id === c.id ? "bg-white/[0.07] ring-1 ring-white/[0.1]" : "hover:bg-white/[0.04]")}>
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-[13px] font-black text-white shrink-0", c.color)}>
                  {c.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-[13px] font-semibold truncate">{c.name}</span>
                    {c.starred && <FiStar className="w-3 h-3 text-amber-400 shrink-0" />}
                    <span className={cn("shrink-0 text-[9px] px-1.5 py-0.5 rounded-full border font-bold ml-auto", STATUS_STYLE[c.status])}>{c.status}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-white/40 text-[11px] truncate">{c.company}</span>
                    <span className="text-white/20 text-[10px]">·</span>
                    <span className="text-violet-400 text-[11px] font-bold shrink-0">{c.value}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* Pipeline view */
          <div className="flex-1 overflow-x-auto overflow-y-hidden p-3">
            <div className="flex gap-3 h-full min-w-max">
              {PIPELINE_STAGES.map(stage => (
                <div key={stage} className="w-64 flex flex-col">
                  <div className="flex items-center gap-2 mb-2.5 px-1">
                    <div className={cn("w-2 h-2 rounded-full", STATUS_STYLE[stage].split(" ")[0])} />
                    <span className="text-white font-bold text-[12px]">{stage}</span>
                    <span className="w-5 h-5 rounded-full bg-white/[0.08] flex items-center justify-center text-[10px] font-bold text-white/50">
                      {contacts.filter(c => c.status === stage).length}
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
                    {contacts.filter(c => c.status === stage).map(c => (
                      <button key={c.id} onClick={() => setActiveContact(c)}
                        className="w-full bg-[#0d0d1e] border border-white/[0.07] rounded-xl p-3 text-left hover:border-white/[0.14] transition-all">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0", c.color)}>
                            {c.initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-[12px] font-semibold truncate">{c.name}</div>
                            <div className="text-white/35 text-[10px] truncate">{c.company}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-violet-400 text-[12px] font-bold">{c.value}</span>
                          <span className="text-white/25 text-[10px]">{c.lastContact || "No contact"}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contact detail panel */}
      {activeContact && (
        <div className="w-full md:w-80 shrink-0 flex flex-col bg-[#08081a] border-l border-white/[0.06] overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] shrink-0">
            <span className="text-white font-bold text-[13px] flex-1">Contact</span>
            <button onClick={() => getAiInsight(activeContact)} disabled={aiLoading}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-500/15 text-violet-300 text-[11px] font-bold hover:bg-violet-500/25 border border-violet-500/20 transition-all disabled:opacity-50">
              {aiLoading ? <FiRefreshCw className="w-3 h-3 animate-spin" /> : <FiZap className="w-3 h-3" />}
              AI Insight
            </button>
            <button onClick={() => toggleStar(activeContact.id)}
              className={cn("p-1.5 rounded-lg transition-all", activeContact.starred ? "text-amber-400" : "text-white/25 hover:text-amber-400")}>
              <FiStar className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => { deleteContact(activeContact.id); }} className="p-1.5 rounded-lg text-white/25 hover:text-red-400 transition-all">
              <FiX className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setActiveContact(null)} className="md:hidden p-1.5 text-white/30 hover:text-white">
              ←
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-4">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-2 py-4">
              <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-[0_0_20px_rgba(0,0,0,0.3)]", activeContact.color)}>
                {activeContact.initials}
              </div>
              <div className="text-center">
                <div className="text-white font-bold text-[16px]">{activeContact.name}</div>
                <div className="text-white/40 text-[13px]">{activeContact.company}</div>
                <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-bold mt-1 inline-block", STATUS_STYLE[activeContact.status])}>
                  {activeContact.status}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2.5">
              {[
                { icon:FiMail, label:"Email",        value:activeContact.email },
                { icon:FiDollarSign, label:"Value",  value:activeContact.value },
                { icon:FiPhone, label:"Last Contact",value:activeContact.lastContact || "No contact" },
              ].map(d => (
                <div key={d.label} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                  <d.icon className="w-3.5 h-3.5 text-white/30 shrink-0" />
                  <div>
                    <div className="text-[9px] text-white/25 uppercase font-bold tracking-widest">{d.label}</div>
                    <div className="text-white/75 text-[12.5px] font-medium">{d.value}</div>
                  </div>
                </div>
              ))}
              {activeContact.notes && (
                <div className="px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                  <div className="text-[9px] text-white/25 uppercase font-bold tracking-widest mb-1">Notes</div>
                  <div className="text-white/60 text-[12px] leading-relaxed">{activeContact.notes}</div>
                </div>
              )}
            </div>

            {/* AI Insight */}
            {aiInsight && (
              <div className="px-3 py-3 rounded-xl bg-violet-500/[0.07] border border-violet-500/15">
                <div className="flex items-center gap-1.5 mb-2">
                  <FiZap className="w-3 h-3 text-violet-400" />
                  <span className="text-[10px] text-violet-400 font-bold uppercase tracking-widest">AI Insight</span>
                </div>
                <div className="text-white/65 text-[12px] leading-relaxed whitespace-pre-wrap">{aiInsight}</div>
              </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon:FiMail,  label:"Send Email", color:"bg-blue-500/15 text-blue-400 border-blue-500/20" },
                { icon:FiPhone, label:"Call",        color:"bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
                { icon:FiEdit2, label:"Edit",        color:"bg-white/[0.05] text-white/50 border-white/[0.08]" },
                { icon:FiZap,   label:"Follow Up",   color:"bg-violet-500/15 text-violet-400 border-violet-500/20" },
              ].map(a => (
                <button key={a.label} className={cn("flex items-center gap-2 px-3 py-2 rounded-xl border text-[12px] font-semibold transition-all hover:brightness-125", a.color)}>
                  <a.icon className="w-3.5 h-3.5" /> {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
