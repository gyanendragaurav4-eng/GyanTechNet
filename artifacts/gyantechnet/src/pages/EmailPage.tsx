import { useState } from "react";
import {
  FiMail, FiStar, FiSend, FiInbox, FiTrash2, FiEdit2, FiZap, FiX,
  FiCheck, FiRefreshCw, FiSearch, FiPaperclip,
} from "react-icons/fi";
import { cn } from "@/lib/utils";

type Email = {
  id: number; sender: string; avatar: string; color: string;
  subject: string; preview: string; body: string;
  time: string; unread: boolean; starred: boolean; folder: string;
};

const INITIAL_EMAILS: Email[] = [
  { id:1, sender:"GyanTechNet Team",   avatar:"GT", color:"bg-violet-500",  subject:"Welcome to GyanTechNet AI Platform", preview:"We're thrilled to have you on board! Here's everything you need to know...", body:"Welcome to GyanTechNet AI! 🎉\n\nYour account is now active. Here's a quick guide to get you started:\n\n1. **AI Chat** — 11 chat modes for any task\n2. **Image AI** — Generate stunning visuals\n3. **Workflows** — Automate your tasks with AI pipelines\n4. **Command Center** — Your AI hub dashboard\n\nHappy exploring!\n\n– GyanTechNet Team", time:"10:30 AM", unread:true, starred:false, folder:"Inbox" },
  { id:2, sender:"GyanTechNet Updates", avatar:"GU", color:"bg-blue-500",   subject:"Your Weekly AI Insights", preview:"Discover new ways to leverage AI in your daily workflow with these productivity tips...", body:"This week in AI:\n\n• Gyan AI Pro gets 2M token context window\n• Gyan Vision Pro achieves new reasoning benchmarks\n• GyanTechNet launches Workflows feature\n\nTop tips this week:\n1. Use Chain-of-Thought prompting for complex tasks\n2. Try Multi-Chat to compare model responses\n3. Set up an AI Workflow for your research process", time:"Yesterday", unread:false, starred:true, folder:"Inbox" },
  { id:3, sender:"Priya Sharma",        avatar:"PS", color:"bg-pink-500",   subject:"Project Proposal Review", preview:"Hi, I've reviewed the proposal and have a few suggestions. The overall direction looks great...", body:"Hi,\n\nI've reviewed the project proposal you shared.\n\nOverall the direction looks excellent. A few suggestions:\n\n1. Add more detail to the timeline section\n2. The budget estimate seems conservative — consider adding a buffer\n3. The risk assessment section is strong\n\nLet's schedule a call to discuss further.\n\nBest,\nPriya", time:"Oct 25", unread:false, starred:false, folder:"Inbox" },
  { id:4, sender:"Rahul Gupta",          avatar:"RG", color:"bg-emerald-500",subject:"Re: API Integration",    preview:"The integration is working perfectly now. I've pushed the changes to the staging branch...", body:"Hi,\n\nGreat news! The API integration is working.\n\nChanges pushed to staging:\n- Fixed authentication headers\n- Added retry logic for rate limits\n- Improved error handling\n\nCan you review and merge?\n\nThanks,\nRahul", time:"Oct 23", unread:false, starred:false, folder:"Inbox" },
  { id:5, sender:"GyanTechNet Team",   avatar:"GT", color:"bg-violet-500",  subject:"New Feature: Business Workspace", preview:"Generate proposals and invoices instantly with AI. Business tools are now live...", body:"Announcing Business Workspace!\n\nNew AI-powered tools now available:\n• Business Strategy Generator\n• Proposal Builder\n• Pitch Deck Assistant\n• Invoice Generator\n• SWOT Analysis\n\nAccess from your sidebar under Business.", time:"Oct 20", unread:false, starred:false, folder:"Inbox" },
];

const FOLDERS = [
  { name:"Inbox",   icon:FiMail,   count:2 },
  { name:"Starred", icon:FiStar,   count:1 },
  { name:"Sent",    icon:FiSend,   count:0 },
  { name:"Archive", icon:FiInbox,  count:0 },
  { name:"Trash",   icon:FiTrash2, count:0 },
];

export default function EmailPage() {
  const [emails, setEmails]         = useState<Email[]>(INITIAL_EMAILS);
  const [folder, setFolder]         = useState("Inbox");
  const [selected, setSelected]     = useState<Email | null>(null);
  const [compose, setCompose]       = useState(false);
  const [search, setSearch]         = useState("");
  const [composeForm, setComposeForm] = useState({ to:"", subject:"", body:"" });
  const [aiLoading, setAiLoading]   = useState(false);
  const [aiDraft, setAiDraft]       = useState<string|null>(null);

  const filtered = emails.filter(e => {
    if (folder === "Starred") return e.starred;
    if (e.folder !== folder) return false;
    if (search && !e.subject.toLowerCase().includes(search.toLowerCase()) && !e.sender.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const markRead = (id: number) => setEmails(p => p.map(e => e.id === id ? { ...e, unread: false } : e));
  const toggleStar = (id: number) => setEmails(p => p.map(e => e.id === id ? { ...e, starred: !e.starred } : e));
  const deleteEmail = (id: number) => { setEmails(p => p.filter(e => e.id !== id)); if (selected?.id === id) setSelected(null); };

  const aiCompose = async () => {
    if (!composeForm.subject.trim()) return;
    setAiLoading(true); setAiDraft(null);
    try {
      const res = await fetch("/api/chat", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          messages:[{ role:"user", content:`Write a professional email for: "${composeForm.subject}"${composeForm.to ? ` to ${composeForm.to}` : ""}. Keep it concise, professional, and warm. Include greeting, body, and sign-off. Just the email text, no extra explanation.` }],
          mode:"Business", model:"openai/gpt-4o-mini",
        }),
      });
      const data = await res.json();
      const draft = data.content || "";
      setAiDraft(draft);
      setComposeForm(f => ({...f, body: draft }));
    } catch { setAiDraft("Could not generate draft."); }
    setAiLoading(false);
  };

  const renderBody = (body: string) => body.split("\n").map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-2.5" />;
    if (line.startsWith("• ") || line.startsWith("- ")) return (
      <div key={i} className="flex items-start gap-2 mb-1 ml-2">
        <span className="text-violet-400 mt-1.5 text-[8px] shrink-0">◆</span>
        <span className="text-white/70 text-[13.5px] leading-relaxed">{line.slice(2)}</span>
      </div>
    );
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return (
      <p key={i} className="text-white/70 text-[13.5px] leading-[1.8] mb-0.5">
        {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-white font-semibold">{part}</strong> : part)}
      </p>
    );
  });

  return (
    <div className="flex h-full bg-[#06060f] overflow-hidden">

      {/* Sidebar */}
      <div className="hidden sm:flex w-52 shrink-0 bg-[#08081a] border-r border-white/[0.06] flex-col p-3">
        <button onClick={() => setCompose(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-[13px] font-bold hover:from-violet-500 hover:to-blue-500 shadow-[0_4px_12px_rgba(124,58,237,0.3)] transition-all mb-4">
          <FiEdit2 className="w-4 h-4" /> Compose
        </button>

        <div className="space-y-0.5 mb-5">
          {FOLDERS.map(f => (
            <button key={f.name} onClick={() => setFolder(f.name)}
              className={cn("w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[12.5px] font-medium transition-all",
                folder === f.name ? "bg-white/[0.08] text-white" : "text-white/40 hover:bg-white/[0.04] hover:text-white")}>
              <f.icon className="w-3.5 h-3.5" />
              <span className="flex-1">{f.name}</span>
              {f.count > 0 && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-bold">{f.count}</span>}
            </button>
          ))}
        </div>

        <div className="mt-auto space-y-2">
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-white/[0.07] text-white/35 text-[11.5px] hover:text-white hover:border-white/[0.14] transition-all">
            <FiMail className="w-3.5 h-3.5" /> Connect Gmail
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-white/[0.07] text-white/35 text-[11.5px] hover:text-white hover:border-white/[0.14] transition-all">
            <FiMail className="w-3.5 h-3.5" /> Connect Outlook
          </button>
        </div>
      </div>

      {/* Email list */}
      <div className={cn("flex flex-col border-r border-white/[0.06] overflow-hidden",
        selected ? "hidden sm:flex sm:w-72 shrink-0" : "flex-1")}>
        <div className="px-3 py-3 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-bold text-[14px]">{folder}</span>
            <span className="text-white/30 text-[11px]">{filtered.length}</span>
          </div>
          <div className="relative">
            <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search emails..."
              className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl pl-8 pr-3 py-1.5 text-white text-[12px] outline-none placeholder:text-white/20" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {filtered.map(email => (
            <button key={email.id} onClick={() => { setSelected(email); markRead(email.id); }}
              className={cn("w-full flex items-start gap-3 px-3 py-3 border-b border-white/[0.04] transition-all text-left hover:bg-white/[0.03]",
                selected?.id === email.id && "bg-white/[0.05]",
                email.unread && "bg-primary/[0.03]")}>
              <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black text-white shrink-0 mt-0.5", email.color)}>
                {email.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={cn("text-[12.5px] truncate flex-1", email.unread ? "text-white font-semibold" : "text-white/65 font-medium")}>{email.sender}</span>
                  <span className="text-white/25 text-[10px] shrink-0">{email.time}</span>
                </div>
                <div className={cn("text-[12px] truncate mb-0.5", email.unread ? "text-white/80 font-medium" : "text-white/50")}>{email.subject}</div>
                <div className="text-[11px] text-white/30 truncate">{email.preview}</div>
              </div>
              {email.unread && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-3xl mb-2">📭</div>
              <div className="text-white/30 text-[13px]">No emails in {folder}</div>
            </div>
          )}
        </div>
      </div>

      {/* Email viewer */}
      {selected ? (
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] shrink-0">
            <button onClick={() => setSelected(null)} className="sm:hidden p-1.5 text-white/30 hover:text-white">← Back</button>
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-bold text-[14px] truncate">{selected.subject}</h2>
            </div>
            <button onClick={() => toggleStar(selected.id)}
              className={cn("p-1.5 rounded-lg transition-all", selected.starred ? "text-amber-400 bg-amber-500/10" : "text-white/25 hover:text-amber-400 bg-white/[0.04]")}>
              <FiStar className="w-4 h-4" />
            </button>
            <button onClick={() => deleteEmail(selected.id)} className="p-1.5 text-white/25 hover:text-red-400 bg-white/[0.04] rounded-lg transition-all">
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-5">
            <div className="max-w-2xl">
              <div className="flex items-start gap-3 mb-5">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-[12px] font-black text-white shrink-0", selected.color)}>
                  {selected.avatar}
                </div>
                <div className="flex-1">
                  <div className="text-white font-bold text-[14px]">{selected.sender}</div>
                  <div className="text-white/35 text-[12px]">{selected.time}</div>
                </div>
              </div>
              <div className="mb-4">{renderBody(selected.body)}</div>
              <div className="flex gap-2 mt-6">
                <button onClick={() => { setCompose(true); setComposeForm(f => ({...f, to: selected.sender, subject: `Re: ${selected.subject}`})); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/15 text-primary text-[12.5px] font-bold border border-primary/20 hover:bg-primary/25 transition-all">
                  <FiSend className="w-3.5 h-3.5" /> Reply
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] text-white/50 text-[12.5px] font-bold border border-white/[0.08] hover:bg-white/[0.08] transition-all">
                  <FiSend className="w-3.5 h-3.5" /> Forward
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 hidden sm:flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-3">✉️</div>
            <div className="text-white/30 font-medium">Select an email to read</div>
          </div>
        </div>
      )}

      {/* Compose modal */}
      {compose && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4" onClick={() => setCompose(false)}>
          <div className="w-full sm:w-[540px] bg-[#0d0d1e] border border-white/[0.1] rounded-t-2xl sm:rounded-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.08]">
              <span className="text-white font-bold text-[14px] flex-1">New Message</span>
              <button onClick={aiCompose} disabled={aiLoading || !composeForm.subject.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-500/15 text-violet-300 text-[11px] font-bold hover:bg-violet-500/25 border border-violet-500/20 disabled:opacity-40 transition-all">
                {aiLoading ? <FiRefreshCw className="w-3 h-3 animate-spin" /> : <FiZap className="w-3 h-3" />}
                AI Draft
              </button>
              <button onClick={() => setCompose(false)} className="p-1.5 text-white/30 hover:text-white transition-all">
                <FiX className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
              {[["to","To","recipient@example.com"],["subject","Subject","Email subject..."]].map(([id,label,ph]) => (
                <div key={id} className="flex items-center gap-3 border-b border-white/[0.05] pb-3">
                  <span className="text-white/30 text-[12px] font-semibold w-14">{label}</span>
                  <input value={(composeForm as Record<string,string>)[id]} onChange={e => setComposeForm(f => ({...f,[id]:e.target.value}))}
                    placeholder={ph}
                    className="flex-1 bg-transparent text-white text-[13px] outline-none placeholder:text-white/20" />
                </div>
              ))}
              <textarea value={composeForm.body} onChange={e => setComposeForm(f => ({...f, body:e.target.value}))}
                placeholder="Write your message... or click 'AI Draft' to auto-generate"
                rows={10}
                className="w-full bg-transparent text-white/75 text-[13px] outline-none placeholder:text-white/20 resize-none leading-relaxed" />
            </div>
            <div className="flex items-center gap-2 px-4 py-3 border-t border-white/[0.07]">
              <button onClick={() => setCompose(false)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white text-[13px] font-bold hover:from-primary/90 hover:to-blue-500 shadow-[0_4px_12px_rgba(124,58,237,0.3)] transition-all">
                <FiSend className="w-4 h-4" /> Send
              </button>
              <button className="p-2.5 text-white/30 hover:text-white bg-white/[0.04] rounded-xl transition-all">
                <FiPaperclip className="w-4 h-4" />
              </button>
              <div className="flex-1" />
              <button onClick={() => setCompose(false)} className="p-2.5 text-white/30 hover:text-red-400 transition-all">
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
