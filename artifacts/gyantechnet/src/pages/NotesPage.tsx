import { useState, useRef, useEffect } from "react";
import {
  FiBookOpen, FiPlus, FiSearch, FiX, FiZap, FiCopy, FiDownload,
  FiTag, FiEdit2, FiTrash2, FiStar, FiSave,
} from "react-icons/fi";
import { cn } from "@/lib/utils";

type Note = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  color: string;
  starred: boolean;
  createdAt: number;
  updatedAt: number;
};

const COLORS = ["bg-violet-500","bg-blue-500","bg-emerald-500","bg-amber-500","bg-pink-500","bg-cyan-500"];
const STORAGE_KEY = "gyan_notes";

function loadNotes(): Note[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch { /* ignore */ }
  return [
    { id:"1", title:"Platform Architecture", content:"The new GyanTechNet uses Vite and React. It is styled with Tailwind CSS v4 and uses heavily customized CSS variables for its dark theme.\n\nTech Stack: React 19, Vite, Tailwind CSS v4, Wouter for routing, shadcn/ui components.\n\nThe backend is Express 5 with Gyan AI API. All routes are prefixed with /api.", tags:["tech","guide"], color:"bg-blue-500", starred:false, createdAt:Date.now()-86400000*3, updatedAt:Date.now()-86400000*2 },
    { id:"2", title:"Meeting Notes — Oct 2026", content:"Discussed the release of the Business Workspace with CRM, Invoices, and Analytics modules.\n\nAction items:\n- Finish mobile responsive pass\n- Test all 50+ pages\n- Deploy to production\n\nNext meeting: Monday 10am. Topic: GyanVerse feature roadmap.", tags:["meetings"], color:"bg-violet-500", starred:true, createdAt:Date.now()-86400000*5, updatedAt:Date.now()-86400000*4 },
    { id:"3", title:"Design System Tokens", content:"Primary color is #7c3aed (hsl 262 84% 58%). Background is #06060f (near black).\n\nCard background: #0d0d1e. Sidebar: #08081a. Border: rgba(255,255,255,0.07).\n\nFont: Inter. Radii: 8px cards, 12px inputs, 16px modals, 24px hero elements.", tags:["design","work"], color:"bg-pink-500", starred:false, createdAt:Date.now()-86400000*7, updatedAt:Date.now()-86400000*6 },
  ];
}

function saveNotes(notes: Note[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notes)); } catch { /* ignore */ }
}

const AI_ACTIONS = [
  { id:"summarize", label:"Summarise",  emoji:"📝", prompt:(c: string) => `Summarise this note concisely (3-5 bullet points):\n\n${c}` },
  { id:"expand",    label:"Expand",     emoji:"🔍", prompt:(c: string) => `Expand and elaborate on this note with more detail:\n\n${c}` },
  { id:"rewrite",   label:"Rewrite",    emoji:"✏️", prompt:(c: string) => `Rewrite this note in a clearer, more professional style:\n\n${c}` },
  { id:"bullets",   label:"Bullet List",emoji:"🔸", prompt:(c: string) => `Convert this note into a well-structured bullet list:\n\n${c}` },
  { id:"translate", label:"Translate",  emoji:"🌐", prompt:(c: string) => `Translate this note to English (if not already). If already English, translate to Hindi:\n\n${c}` },
  { id:"action",    label:"Action Items",emoji:"✅", prompt:(c: string) => `Extract all action items and to-dos from this note:\n\n${c}` },
];

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>(loadNotes);
  const [activeId, setActiveId] = useState<string | null>(notes[0]?.id ?? null);
  const [search, setSearch] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [draftTags, setDraftTags] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAction, setAiAction] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const textRef = useRef<HTMLTextAreaElement>(null);

  const activeNote = notes.find(n => n.id === activeId) || null;
  const allTags = Array.from(new Set(notes.flatMap(n => n.tags)));

  const filtered = notes.filter(n => {
    const q = search.toLowerCase();
    if (q && !n.title.toLowerCase().includes(q) && !n.content.toLowerCase().includes(q)) return false;
    if (tagFilter && !n.tags.includes(tagFilter)) return false;
    return true;
  }).sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0) || b.updatedAt - a.updatedAt);

  const openNote = (note: Note) => {
    if (editMode) saveEdits();
    setActiveId(note.id);
    setEditMode(false);
  };

  const startEdit = () => {
    if (!activeNote) return;
    setDraftTitle(activeNote.title);
    setDraftContent(activeNote.content);
    setDraftTags(activeNote.tags.join(", "));
    setEditMode(true);
    setTimeout(() => textRef.current?.focus(), 50);
  };

  const saveEdits = () => {
    if (!activeId) return;
    const tags = draftTags.split(",").map(t => t.trim()).filter(Boolean);
    const updated = notes.map(n => n.id === activeId
      ? { ...n, title: draftTitle || "Untitled", content: draftContent, tags, updatedAt: Date.now() }
      : n);
    setNotes(updated);
    saveNotes(updated);
    setEditMode(false);
  };

  const newNote = () => {
    if (editMode) saveEdits();
    const note: Note = {
      id: Math.random().toString(36).slice(2),
      title: "New Note", content: "",
      tags: [], color: COLORS[Math.floor(Math.random() * COLORS.length)],
      starred: false, createdAt: Date.now(), updatedAt: Date.now(),
    };
    const updated = [note, ...notes];
    setNotes(updated); saveNotes(updated);
    setActiveId(note.id);
    setDraftTitle(note.title); setDraftContent(""); setDraftTags("");
    setEditMode(true);
    setTimeout(() => textRef.current?.focus(), 50);
  };

  const deleteNote = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated); saveNotes(updated);
    if (activeId === id) setActiveId(updated[0]?.id ?? null);
    setEditMode(false);
  };

  const toggleStar = (id: string) => {
    const updated = notes.map(n => n.id === id ? { ...n, starred: !n.starred } : n);
    setNotes(updated); saveNotes(updated);
  };

  const runAI = async (actionId: string) => {
    if (!activeNote?.content.trim()) return;
    const action = AI_ACTIONS.find(a => a.id === actionId);
    if (!action) return;
    setAiLoading(true); setAiAction(actionId);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: action.prompt(editMode ? draftContent : (activeNote?.content || "")) }],
          mode: "Normal", model: "openai/gpt-4o-mini",
        }),
      });
      const data = await res.json();
      const aiResult = data.content || "AI could not process the request.";
      if (editMode) {
        setDraftContent(prev => prev + "\n\n---\n✨ AI (" + action.label + "):\n" + aiResult);
      } else {
        const newNote: Note = {
          id: Math.random().toString(36).slice(2),
          title: `${action.emoji} ${action.label}: ${activeNote.title}`,
          content: aiResult,
          tags: ["ai-generated", ...activeNote.tags],
          color: "bg-violet-500",
          starred: false, createdAt: Date.now(), updatedAt: Date.now(),
        };
        const updated = [newNote, ...notes];
        setNotes(updated); saveNotes(updated);
        setActiveId(newNote.id);
      }
    } catch { /* ignore */ }
    setAiLoading(false); setAiAction("");
  };

  const exportNote = () => {
    if (!activeNote) return;
    const text = `# ${activeNote.title}\nTags: ${activeNote.tags.join(", ")}\nDate: ${new Date(activeNote.updatedAt).toLocaleString()}\n\n${activeNote.content}`;
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `note-${activeNote.title.slice(0, 30)}.txt`; a.click();
  };

  return (
    <div className="flex h-full bg-[#06060f] overflow-hidden">

      {/* Notes list */}
      <div className={cn("flex flex-col bg-[#08081a] border-r border-white/[0.06] shrink-0",
        "w-full sm:w-72", activeId ? "hidden sm:flex" : "flex")}>

        <div className="px-3 pt-3 pb-2 border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <FiBookOpen className="w-4 h-4 text-primary" />
              <h2 className="text-white font-bold text-[14px]">Notes</h2>
              <span className="text-white/25 text-[11px]">({notes.length})</span>
            </div>
            <button onClick={newNote}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/15 hover:bg-primary/25 text-primary text-[11px] font-bold transition-all border border-primary/20">
              <FiPlus className="w-3 h-3" /> New
            </button>
          </div>
          <div className="relative">
            <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg pl-7 pr-3 py-1.5 text-white text-[12px] outline-none placeholder:text-white/20 focus:border-primary/40 transition-all" />
          </div>
          {allTags.length > 0 && (
            <div className="flex gap-1 mt-2 overflow-x-auto no-scrollbar">
              <button onClick={() => setTagFilter("")}
                className={cn("shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all",
                  tagFilter === "" ? "bg-violet-500/20 text-violet-300 border-violet-500/25" : "text-white/30 border-white/[0.07] hover:text-white")}>
                All
              </button>
              {allTags.map(t => (
                <button key={t} onClick={() => setTagFilter(t === tagFilter ? "" : t)}
                  className={cn("shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all",
                    tagFilter === t ? "bg-violet-500/20 text-violet-300 border-violet-500/25" : "text-white/30 border-white/[0.07] hover:text-white")}>
                  #{t}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar py-1.5 px-2">
          {filtered.length === 0 && (
            <div className="text-center py-8 text-white/25 text-xs">No notes found</div>
          )}
          {filtered.map(n => (
            <button key={n.id} onClick={() => openNote(n)}
              className={cn(
                "w-full text-left flex items-start gap-2.5 px-2.5 py-2.5 rounded-xl mb-1 transition-all group",
                activeId === n.id ? "bg-white/[0.08] ring-1 ring-white/[0.1]" : "hover:bg-white/[0.04]"
              )}>
              <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", n.color)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-white text-[12.5px] font-semibold truncate flex-1">{n.title}</span>
                  {n.starred && <FiStar className="w-2.5 h-2.5 text-amber-400 shrink-0" />}
                </div>
                <div className="text-white/35 text-[11px] truncate mt-0.5 leading-snug">{n.content.slice(0, 55)}</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-white/20 text-[9px]">{new Date(n.updatedAt).toLocaleDateString()}</span>
                  {n.tags.slice(0, 2).map(t => (
                    <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/[0.05] text-white/30">#{t}</span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Note editor / viewer */}
      {activeNote ? (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] bg-[#06060f] shrink-0">
            <button className="sm:hidden p-1.5 text-white/40 hover:text-white transition-colors" onClick={() => setActiveId(null)}>
              ←
            </button>
            {editMode ? (
              <input value={draftTitle} onChange={e => setDraftTitle(e.target.value)}
                className="flex-1 bg-transparent text-white font-bold text-base outline-none placeholder:text-white/20"
                placeholder="Note title..." />
            ) : (
              <h2 className="flex-1 text-white font-bold text-base truncate">{activeNote.title}</h2>
            )}
            <div className="flex items-center gap-1.5 shrink-0">
              <button onClick={() => toggleStar(activeNote.id)}
                className={cn("p-1.5 rounded-lg transition-all", activeNote.starred ? "text-amber-400" : "text-white/25 hover:text-white")}>
                <FiStar className="w-3.5 h-3.5" />
              </button>
              {editMode ? (
                <button onClick={saveEdits}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/15 hover:bg-primary/25 text-primary text-[12px] font-bold transition-all border border-primary/20">
                  <FiSave className="w-3 h-3" /> Save
                </button>
              ) : (
                <button onClick={startEdit}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white/70 text-[12px] font-bold transition-all">
                  <FiEdit2 className="w-3 h-3" /> Edit
                </button>
              )}
              <button onClick={exportNote} className="p-1.5 rounded-lg text-white/25 hover:text-white transition-all">
                <FiDownload className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => navigator.clipboard.writeText(activeNote.content).catch(() => {})}
                className="p-1.5 rounded-lg text-white/25 hover:text-white transition-all">
                <FiCopy className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => { if (confirm("Delete this note?")) deleteNote(activeNote.id); }}
                className="p-1.5 rounded-lg text-white/25 hover:text-red-400 transition-all">
                <FiTrash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* AI Actions */}
          <div className="flex items-center gap-1.5 px-4 py-2 border-b border-white/[0.04] bg-[#06060f] overflow-x-auto no-scrollbar shrink-0">
            <FiZap className="w-3.5 h-3.5 text-violet-400 shrink-0" />
            <span className="text-[10px] text-white/25 font-bold uppercase tracking-widest shrink-0 mr-1">AI Assist</span>
            {AI_ACTIONS.map(a => (
              <button key={a.id} onClick={() => runAI(a.id)} disabled={aiLoading}
                className={cn(
                  "shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all",
                  aiAction === a.id && aiLoading
                    ? "bg-violet-500/20 text-violet-300 border-violet-500/30 animate-pulse"
                    : "bg-white/[0.04] text-white/40 border-white/[0.07] hover:text-white hover:bg-white/[0.08]",
                  aiLoading && aiAction !== a.id && "opacity-40"
                )}>
                <span>{a.emoji}</span> {a.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-4">
            {editMode ? (
              <div className="space-y-2 max-w-2xl mx-auto">
                <textarea ref={textRef} value={draftContent}
                  onChange={e => setDraftContent(e.target.value)}
                  placeholder="Start writing..."
                  className="w-full bg-transparent text-white/85 text-[14px] leading-relaxed outline-none resize-none placeholder:text-white/15 min-h-[300px] font-mono"
                  style={{ lineHeight: "1.8" }}
                />
                <div className="border-t border-white/[0.06] pt-3 flex items-center gap-2">
                  <FiTag className="w-3.5 h-3.5 text-white/30" />
                  <input value={draftTags} onChange={e => setDraftTags(e.target.value)}
                    placeholder="Tags (comma-separated)"
                    className="flex-1 bg-transparent text-white/60 text-[12px] outline-none placeholder:text-white/20" />
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto">
                {activeNote.content.split("\n").map((line, i) => (
                  line.trim() ? (
                    <p key={i} className="text-white/75 text-[14px] leading-relaxed mb-2">{line}</p>
                  ) : <div key={i} className="h-2" />
                ))}
                {activeNote.tags.length > 0 && (
                  <div className="flex gap-1.5 mt-5 pt-4 border-t border-white/[0.06]">
                    {activeNote.tags.map(t => (
                      <span key={t} className="px-2 py-0.5 rounded-full text-[10px] bg-violet-500/10 text-violet-400 border border-violet-500/15">#{t}</span>
                    ))}
                  </div>
                )}
                <div className="text-white/15 text-[10px] mt-4">
                  Created {new Date(activeNote.createdAt).toLocaleString()} · Updated {new Date(activeNote.updatedAt).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-center">
          <div>
            <div className="text-5xl mb-3">📝</div>
            <div className="text-white font-bold mb-1">No note selected</div>
            <div className="text-white/30 text-sm mb-4">Pick a note from the list or create a new one</div>
            <button onClick={newNote}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/15 hover:bg-primary/25 text-primary font-bold text-sm transition-all border border-primary/20 mx-auto">
              <FiPlus className="w-4 h-4" /> Create Note
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
