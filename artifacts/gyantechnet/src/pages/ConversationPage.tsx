import { useState, useRef, useEffect } from "react";
import {
  FiMessageCircle, FiSearch, FiPhone, FiVideo, FiMoreVertical,
  FiSend, FiSmile, FiPaperclip, FiCheck, FiLock, FiPlus,
} from "react-icons/fi";
import { cn } from "@/lib/utils";

type Msg = { id: number; text: string; time: string; sender: "me" | "other"; read?: boolean };

type Contact = {
  id: number; name: string; lastMsg: string; time: string;
  avatar: string; initials: string; unread?: number; online?: boolean; status?: string;
};

const CONTACTS: Contact[] = [
  { id:1, name:"Aryan Raj",     lastMsg:"See you tomorrow! 👋",       time:"10:42 AM", avatar:"bg-blue-500",    initials:"AR", unread:2, online:true,  status:"Hey there, I'm using GyanTechNet!" },
  { id:2, name:"Dev Team",      lastMsg:"Deployment complete ✅",     time:"Yesterday", avatar:"bg-violet-500", initials:"DT", online:false, status:"Team workspace" },
  { id:3, name:"Priya Sharma",  lastMsg:"Can you send the files?",    time:"Monday",    avatar:"bg-pink-500",   initials:"PS", unread:1, online:true, status:"Available" },
  { id:4, name:"AI Assistant",  lastMsg:"How can I help you today?",  time:"Mon",       avatar:"bg-gradient-to-br from-primary to-violet-700", initials:"🤖", online:true, status:"Always available" },
  { id:5, name:"GyanTechNet",   lastMsg:"Your account is active",     time:"Oct 22",    avatar:"bg-gradient-to-br from-emerald-600 to-teal-700", initials:"GT", status:"Platform notifications" },
];

const INITIAL_MSGS: Record<number, Msg[]> = {
  1: [
    { id:1, text:"Hey! How's the new GyanTechNet app coming along? 🚀", time:"10:30 AM", sender:"other" },
    { id:2, text:"It's going great! The UI looks amazing. We have 50+ pages now!", time:"10:32 AM", sender:"me", read:true },
    { id:3, text:"Awesome. I'll test it out later. Send me the link.", time:"10:38 AM", sender:"other" },
    { id:4, text:"Sure! It's live at gyantechnet.com — try the AI chat 🤖", time:"10:40 AM", sender:"me", read:true },
    { id:5, text:"See you tomorrow! 👋", time:"10:42 AM", sender:"other" },
  ],
  2: [
    { id:1, text:"v2 build completed successfully.", time:"Yesterday 3:00 PM", sender:"other" },
    { id:2, text:"All 50 pages are rendering. TypeScript checks pass.", time:"Yesterday 3:02 PM", sender:"other" },
    { id:3, text:"Deployment complete ✅", time:"Yesterday 3:10 PM", sender:"other" },
  ],
  3: [
    { id:1, text:"Hi! I reviewed the new design system. Love the dark theme 💜", time:"Monday 9:00 AM", sender:"other" },
    { id:2, text:"Thank you! It matches gyantechnet.com closely now.", time:"Monday 9:05 AM", sender:"me", read:true },
    { id:3, text:"Can you send the design files?", time:"Monday 9:07 AM", sender:"other" },
  ],
};

const EMOJIS = ["👍","❤️","😂","😮","😢","🙏","🔥","✅","🚀","💜"];

export default function ConversationPage() {
  const [activeId, setActiveId]     = useState(1);
  const [messages, setMessages]     = useState<Record<number, Msg[]>>(INITIAL_MSGS);
  const [input, setInput]           = useState("");
  const [search, setSearch]         = useState("");
  const [showEmoji, setShowEmoji]   = useState(false);
  const [showInfo, setShowInfo]     = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const contact = CONTACTS.find(c => c.id === activeId)!;
  const msgs = messages[activeId] || [];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs, activeId]);

  const send = () => {
    if (!input.trim()) return;
    const msg: Msg = { id: Date.now(), text: input.trim(), time: new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}), sender:"me" };
    setMessages(p => ({ ...p, [activeId]: [...(p[activeId]||[]), msg] }));
    setInput("");
    setShowEmoji(false);
  };

  const filteredContacts = CONTACTS.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.lastMsg.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full bg-[#06060f] overflow-hidden">
      {/* Contacts sidebar */}
      <div className="hidden sm:flex w-72 shrink-0 bg-[#08081a] border-r border-white/[0.06] flex-col">
        <div className="px-4 pt-3 pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-white font-bold text-[14px] flex-1">Messages</h2>
            <button className="p-1.5 rounded-xl text-white/25 hover:text-white hover:bg-white/[0.06] transition-all">
              <FiPlus className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-xl text-white/25 hover:text-white hover:bg-white/[0.06] transition-all">
              <FiMoreVertical className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations"
              className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl pl-8 pr-3 py-2 text-white text-[12.5px] outline-none placeholder:text-white/20 focus:border-white/[0.18] transition-all" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {filteredContacts.map(c => (
            <button key={c.id} onClick={() => setActiveId(c.id)}
              className={cn("w-full flex items-center gap-3 px-3 py-3 border-b border-white/[0.04] transition-all text-left",
                activeId === c.id ? "bg-white/[0.06]" : "hover:bg-white/[0.03]")}>
              <div className="relative shrink-0">
                <div className={cn("w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-[13px] bg-gradient-to-br", c.avatar)}>
                  {c.initials}
                </div>
                {c.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#08081a]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1 mb-0.5">
                  <span className="text-white text-[13px] font-semibold truncate flex-1">{c.name}</span>
                  <span className={cn("text-[10px] shrink-0", c.unread ? "text-primary font-bold" : "text-white/25")}>{c.time}</span>
                </div>
                <div className="flex items-center gap-1">
                  <p className="text-white/35 text-[11.5px] truncate flex-1">{c.lastMsg}</p>
                  {c.unread && (
                    <span className="shrink-0 w-4.5 h-4.5 bg-primary rounded-full text-white text-[9px] font-black flex items-center justify-center" style={{width:"18px",height:"18px"}}>
                      {c.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] bg-[#08081a] shrink-0">
          <div className="relative">
            <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-[12px] bg-gradient-to-br", contact.avatar)}>
              {contact.initials}
            </div>
            {contact.online && <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#08081a]" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-bold text-[13.5px]">{contact.name}</div>
            <div className="text-white/30 text-[11px]">{contact.online ? "Online" : "Last seen recently"}</div>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-xl text-white/25 hover:text-white hover:bg-white/[0.06] transition-all">
              <FiPhone className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-xl text-white/25 hover:text-white hover:bg-white/[0.06] transition-all">
              <FiVideo className="w-4 h-4" />
            </button>
            <button onClick={() => setShowInfo(v=>!v)} className="p-2 rounded-xl text-white/25 hover:text-white hover:bg-white/[0.06] transition-all">
              <FiMoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-3 bg-[#06060f]">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/[0.04] rounded-full text-[10.5px] text-white/25">
              <FiLock className="w-2.5 h-2.5" />
              Messages are end-to-end encrypted
            </div>
          </div>

          {msgs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className={cn("w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl bg-gradient-to-br", contact.avatar)}>
                {contact.initials}
              </div>
              <div className="text-center">
                <div className="text-white font-bold text-[14px]">{contact.name}</div>
                <div className="text-white/30 text-[12px] mt-0.5">{contact.status}</div>
              </div>
              <div className="text-white/20 text-[12px] mt-2">Say hello! 👋</div>
            </div>
          )}

          {msgs.map(m => (
            <div key={m.id} className={cn("flex", m.sender === "me" ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[70%] group")}>
                <div className={cn("px-4 py-2.5 rounded-2xl text-[13.5px] leading-relaxed",
                  m.sender === "me"
                    ? "bg-gradient-to-br from-primary to-violet-700 text-white rounded-br-md"
                    : "bg-white/[0.07] text-white/85 rounded-bl-md border border-white/[0.06]")}>
                  {m.text}
                </div>
                <div className={cn("flex items-center gap-1 mt-1 px-1", m.sender === "me" ? "justify-end" : "justify-start")}>
                  <span className="text-[10px] text-white/20">{m.time}</span>
                  {m.sender === "me" && m.read && <FiCheck className="w-3 h-3 text-primary" />}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Emoji picker */}
        {showEmoji && (
          <div className="px-4 py-2 border-t border-white/[0.06] bg-[#08081a] shrink-0">
            <div className="flex gap-2">
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setInput(p => p + e)}
                  className="text-[18px] hover:scale-125 transition-transform">
                  {e}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex items-center gap-2 px-3 py-3 border-t border-white/[0.06] bg-[#08081a] shrink-0">
          <button className="p-2 rounded-xl text-white/25 hover:text-white hover:bg-white/[0.06] transition-all">
            <FiPaperclip className="w-4 h-4" />
          </button>
          <div className="flex-1 flex items-center bg-white/[0.04] border border-white/[0.08] rounded-2xl px-3 py-2.5 gap-2 focus-within:border-primary/30 transition-all">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Type a message…"
              className="flex-1 bg-transparent text-white text-[13.5px] outline-none placeholder:text-white/20" />
          </div>
          <button onClick={() => setShowEmoji(v => !v)}
            className={cn("p-2 rounded-xl transition-all", showEmoji ? "text-primary bg-primary/10" : "text-white/25 hover:text-white hover:bg-white/[0.06]")}>
            <FiSmile className="w-4 h-4" />
          </button>
          <button onClick={send} disabled={!input.trim()}
            className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white disabled:opacity-40 hover:bg-primary/90 transition-all shadow-[0_2px_8px_rgba(124,58,237,0.4)]">
            <FiSend className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
