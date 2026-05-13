import { useState, useRef, useCallback } from "react";
import {
  FiBold, FiItalic, FiUnderline, FiAlignLeft, FiAlignCenter, FiAlignRight,
  FiList, FiSave, FiDownload, FiShare2, FiZap, FiRefreshCw, FiRotateCcw,
  FiRotateCw, FiLink, FiMinus, FiGrid, FiX, FiCheck,
} from "react-icons/fi";
import { cn } from "@/lib/utils";

type Tab = "Home" | "Insert" | "Layout" | "View";

const FONTS = ["Calibri","Arial","Times New Roman","Georgia","Courier New","Verdana","Trebuchet MS","Palatino Linotype","Comic Sans MS","Impact"];
const FONT_SIZES = [8,9,10,11,12,14,16,18,20,22,24,26,28,32,36,40,48,56,64,72];
const TEXT_COLORS = ["#000000","#1f2937","#ef4444","#f97316","#eab308","#22c55e","#06b6d4","#3b82f6","#8b5cf6","#ec4899","#6b7280","#9ca3af","#ffffff"];
const HIGHLIGHT_COLORS = ["#fef08a","#bbf7d0","#bfdbfe","#fecaca","#e9d5ff","#fed7aa","#f0f9ff","transparent"];

const AI_PROMPTS = [
  { label:"✍️ Improve Writing",    prompt:"Rewrite the following to be clearer, more professional and engaging. Return only the improved text:\n\n" },
  { label:"📝 Summarise",          prompt:"Summarise the following in 3 concise bullet points:\n\n" },
  { label:"🔁 Expand",             prompt:"Expand with more detail, examples and context:\n\n" },
  { label:"🔍 Proofread & Fix",    prompt:"Proofread and fix all grammar, spelling and punctuation errors:\n\n" },
  { label:"💼 Make Professional",  prompt:"Rewrite in a formal, business-professional tone:\n\n" },
  { label:"🌐 Translate to Hindi", prompt:"Translate the following to Hindi:\n\n" },
];

// Max content height per page (px at 100% zoom) — A4 content area
const CONTENT_MAX_H = 870;

export default function DocsPage() {
  // Multi-page refs (uncontrolled contentEditable per page)
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [pageCount,   setPageCount]   = useState(1);
  const [activePage,  setActivePage]  = useState(0);

  const [tab, setTab] = useState<Tab>("Home");
  const [title, setTitle] = useState("Untitled Document");
  const [fontSize, setFontSize] = useState(12);
  const [font, setFont] = useState("Calibri");
  const [zoom, setZoom] = useState(100);
  const [showRuler, setShowRuler] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [aiPanel, setAiPanel] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [textColor, setTextColor] = useState("#000000");
  const [hlColor, setHlColor] = useState("transparent");
  const [showTextColors, setShowTextColors] = useState(false);
  const [showHlColors, setShowHlColors] = useState(false);

  // Focus a page div (toEnd=true → cursor at end, false → start)
  const focusPage = useCallback((idx: number, toEnd = false) => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const div = pageRefs.current[idx];
      if (!div) return;
      div.focus();
      try {
        const range = document.createRange();
        range.selectNodeContents(div);
        range.collapse(!toEnd);
        window.getSelection()?.removeAllRanges();
        window.getSelection()?.addRange(range);
      } catch { /* ignore */ }
    }));
  }, []);

  // Add a blank page after idx, focus it
  const addPageAfter = useCallback((idx: number) => {
    setPageCount(c => c + 1);
    setActivePage(idx + 1);
    focusPage(idx + 1, false);
  }, [focusPage]);

  // Move the last block of page[idx] to the top of page[idx+1], creating page if needed
  const handleOverflow = useCallback((idx: number) => {
    const div = pageRefs.current[idx];
    if (!div || div.scrollHeight <= CONTENT_MAX_H + 10) return;
    const lastChild = div.lastChild;
    if (!lastChild || div.childNodes.length <= 1) return;

    const overflow = lastChild.cloneNode(true);
    div.removeChild(lastChild);

    setPageCount(prev => {
      const needNew = idx + 1 >= prev;
      const next = needNew ? prev + 1 : prev;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const nextDiv = pageRefs.current[idx + 1];
        if (nextDiv) {
          nextDiv.insertBefore(overflow, nextDiv.firstChild || null);
          nextDiv.focus();
          try {
            const range = document.createRange();
            range.selectNodeContents(overflow as Node);
            range.collapse(true);
            window.getSelection()?.removeAllRanges();
            window.getSelection()?.addRange(range);
          } catch { /* ignore */ }
        }
      }));
      return next;
    });
    setActivePage(idx + 1);
  }, []);

  // Per-page keydown: Enter near bottom → new page; Backspace on empty page → remove
  const handlePageKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>, idx: number) => {
    if (e.key === "Enter") {
      const div = pageRefs.current[idx];
      if (!div) return;
      if (div.scrollHeight >= CONTENT_MAX_H - 55) {
        e.preventDefault();
        addPageAfter(idx);
      }
    } else if (e.key === "Backspace") {
      const div = pageRefs.current[idx];
      if (idx > 0 && div && (div.innerHTML === "" || div.innerHTML === "<br>" || div.innerText.trim() === "")) {
        e.preventDefault();
        setPageCount(c => Math.max(1, c - 1));
        setActivePage(idx - 1);
        focusPage(idx - 1, true);
      }
    }
  }, [addPageAfter, focusPage]);

  // Per-page input: update word count + check overflow
  const handlePageInput = useCallback((idx: number) => {
    // word count
    let total = 0;
    for (const d of pageRefs.current) {
      if (d) { const t = d.innerText.trim(); total += t ? t.split(/\s+/).length : 0; }
    }
    setWordCount(total);
    // check overflow after DOM settles
    requestAnimationFrame(() => handleOverflow(idx));
  }, [handleOverflow]);

  // exec applies to the focused page
  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    pageRefs.current[activePage]?.focus();
  };

  const updateWordCount = useCallback(() => {
    let total = 0;
    for (const d of pageRefs.current) {
      if (d) { const t = d.innerText.trim(); total += t ? t.split(/\s+/).length : 0; }
    }
    setWordCount(total);
  }, []);

  // Collect all pages' HTML for download / AI
  const getAllHTML  = () => pageRefs.current.filter(Boolean).map(d => d!.innerHTML).join("<div style='page-break-after:always'></div>");
  const getAllText  = () => pageRefs.current.filter(Boolean).map(d => d!.innerText).join("\n\n");

  const setFontFamily = (f: string) => { setFont(f); exec("fontName", f); };

  const changeFontSize = (s: number) => {
    setFontSize(s);
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const range = sel.getRangeAt(0);
      try {
        const span = document.createElement("span");
        span.style.fontSize = `${s}px`;
        range.surroundContents(span);
      } catch { /* ignore complex selections */ }
    } else {
      const div = pageRefs.current[activePage];
      if (div) div.style.fontSize = `${s}px`;
    }
    pageRefs.current[activePage]?.focus();
  };

  const applyTextColor = (c: string) => { setTextColor(c); exec("foreColor", c); setShowTextColors(false); };
  const applyHlColor  = (c: string) => { setHlColor(c);   exec("hiliteColor", c === "transparent" ? "transparent" : c); setShowHlColors(false); };

  const saveDoc = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const downloadDoc = () => {
    const content = getAllHTML();
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:${font};font-size:${fontSize}px;max-width:800px;margin:40px auto;padding:20px 96px;line-height:1.6;}h1{font-size:2em;font-weight:bold;margin:1em 0 0.5em}h2{font-size:1.5em;font-weight:bold;margin:1em 0 0.4em}table{width:100%;border-collapse:collapse;}td,th{border:1px solid #ccc;padding:8px;}@media print{div[style*='page-break-after']{page-break-after:always;}}</style></head><body>${content}</body></html>`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([html], { type:"text/html" }));
    a.download = `${title}.html`; a.click();
  };

  const runAI = async (promptPrefix: string) => {
    const content = getAllText();
    if (!content.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ messages:[{role:"user",content:promptPrefix+content}], mode:"Normal", model:"openai/gpt-4o-mini" }),
      });
      const d = await res.json();
      if (d.content) {
        // Put AI result in page 1, clear other pages
        const p0 = pageRefs.current[0];
        if (p0) { p0.innerHTML = d.content.replace(/\n/g,"<br>"); }
        setPageCount(1); setActivePage(0);
        updateWordCount();
      }
    } catch { /* ignore */ }
    setAiLoading(false);
  };

  const customAI = async () => {
    if (!aiPrompt.trim()) return;
    await runAI(`${aiPrompt}\n\nDocument:\n`);
    setAiPrompt("");
  };

  const closeDropdowns = () => { setShowTextColors(false); setShowHlColors(false); };

  return (
    <div className="flex flex-col h-full overflow-hidden select-none" style={{background:"#2b2b2b"}}>

      {/* ── Title bar ── */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1e1e2e] border-b border-white/[0.06] shrink-0">
        <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center shrink-0 shadow-sm">
          <span className="text-white font-black text-[10px]">W</span>
        </div>
        <input value={title} onChange={e => setTitle(e.target.value)}
          className="bg-transparent text-white/80 font-medium text-[13px] outline-none border-b border-transparent hover:border-white/20 focus:border-blue-400/60 transition-all min-w-0 w-64" />
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          <button onClick={() => { setAiPanel(v=>!v); closeDropdowns(); }}
            className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold border transition-all",
              aiPanel ? "bg-violet-600/20 border-violet-500/30 text-violet-300" : "border-white/10 text-white/40 hover:text-white hover:border-white/20")}>
            <FiZap className="w-3 h-3" /> AI
          </button>
          <button onClick={saveDoc}
            className={cn("flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-bold transition-all",
              saved ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30" : "bg-blue-600 text-white hover:bg-blue-500 shadow-sm")}>
            {saved ? <><FiCheck className="w-3 h-3" /> Saved!</> : <><FiSave className="w-3 h-3" /> Save</>}
          </button>
          <button onClick={downloadDoc} title="Download as HTML"
            className="p-1.5 rounded text-white/30 hover:text-white hover:bg-white/[0.07] transition-all">
            <FiDownload className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded text-white/30 hover:text-white hover:bg-white/[0.07] transition-all">
            <FiShare2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Ribbon tab bar ── */}
      <div className="flex items-end px-1 bg-[#272738] border-b border-white/[0.04] shrink-0">
        {(["Home","Insert","Layout","View"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("px-4 py-2 text-[12px] font-medium border-b-2 transition-all",
              tab===t ? "border-blue-400 text-white" : "border-transparent text-white/40 hover:text-white/70 hover:bg-white/[0.04]")}>
            {t}
          </button>
        ))}
      </div>

      {/* ── Ribbon content ── */}
      <div className="bg-[#272738] border-b border-white/[0.08] shrink-0 overflow-x-auto no-scrollbar" onClick={closeDropdowns}>

        {/* HOME */}
        {tab === "Home" && (
          <div className="flex items-stretch gap-0 px-1 min-w-max h-[70px]">

            {/* Clipboard */}
            <div className="flex items-center gap-0.5 px-2 border-r border-white/[0.08]">
              <button onClick={() => exec("paste")}
                className="flex flex-col items-center gap-0.5 w-10 py-1.5 rounded hover:bg-white/[0.07] text-white/40 hover:text-white transition-all">
                <span className="text-[18px] leading-none">📋</span>
                <span className="text-[9px]">Paste</span>
              </button>
              <div className="flex flex-col gap-0.5">
                <button onClick={() => exec("cut")}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/[0.07] text-white/35 hover:text-white text-[10px] transition-all">
                  ✂️ Cut
                </button>
                <button onClick={() => exec("copy")}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/[0.07] text-white/35 hover:text-white text-[10px] transition-all">
                  📄 Copy
                </button>
              </div>
            </div>

            {/* Font */}
            <div className="flex flex-col justify-center gap-1.5 px-2 border-r border-white/[0.08]">
              <div className="flex items-center gap-1">
                <select value={font} onChange={e => setFontFamily(e.target.value)}
                  className="bg-white/[0.05] border border-white/[0.1] rounded px-1.5 py-0.5 text-white/70 text-[11px] outline-none w-32" style={{colorScheme:"dark"}}>
                  {FONTS.map(f => <option key={f}>{f}</option>)}
                </select>
                <select value={fontSize} onChange={e => changeFontSize(+e.target.value)}
                  className="bg-white/[0.05] border border-white/[0.1] rounded px-1 py-0.5 text-white/70 text-[11px] outline-none w-12" style={{colorScheme:"dark"}}>
                  {FONT_SIZES.map(s => <option key={s}>{s}</option>)}
                </select>
                <button onClick={() => changeFontSize(Math.max(8,fontSize-1))}
                  className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/[0.08] text-white/40 hover:text-white text-[11px]">A-</button>
                <button onClick={() => changeFontSize(Math.min(72,fontSize+1))}
                  className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/[0.08] text-white/40 hover:text-white text-[11px] font-bold">A+</button>
              </div>
              <div className="flex items-center gap-0.5">
                <button onClick={() => exec("bold")}    title="Bold (Ctrl+B)"    className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/[0.1] text-white/60 hover:text-white font-bold   text-[13px] transition-all"><FiBold      className="w-3.5 h-3.5"/></button>
                <button onClick={() => exec("italic")}  title="Italic (Ctrl+I)"  className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/[0.1] text-white/60 hover:text-white italic    text-[13px] transition-all"><FiItalic    className="w-3.5 h-3.5"/></button>
                <button onClick={() => exec("underline")} title="Underline (Ctrl+U)" className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/[0.1] text-white/60 hover:text-white underline text-[13px] transition-all"><FiUnderline className="w-3.5 h-3.5"/></button>
                <button onClick={() => exec("strikeThrough")} title="Strikethrough" className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/[0.1] text-white/60 hover:text-white line-through text-[13px] transition-all">S</button>
                <button onClick={() => exec("superscript")} title="Superscript"   className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/[0.1] text-white/50 hover:text-white text-[10px] transition-all">x²</button>
                <button onClick={() => exec("subscript")}   title="Subscript"     className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/[0.1] text-white/50 hover:text-white text-[10px] transition-all">x₂</button>
                <div className="w-px h-4 bg-white/[0.1] mx-0.5"/>
                {/* Text color */}
                <div className="relative">
                  <button onClick={e => { e.stopPropagation(); setShowTextColors(v=>!v); setShowHlColors(false); }}
                    className="w-6 h-6 rounded flex flex-col items-center justify-center hover:bg-white/[0.1] transition-all gap-px">
                    <span className="text-[11px] font-bold text-white/70 leading-none">A</span>
                    <div className="w-4 h-[3px] rounded-full" style={{background:textColor==="transparent"?"white":textColor}}/>
                  </button>
                  {showTextColors && (
                    <div className="absolute top-full left-0 z-50 mt-1 bg-[#1e1e2e] border border-white/[0.14] rounded-lg p-2 shadow-xl" style={{minWidth:"110px"}} onClick={e=>e.stopPropagation()}>
                      <div className="text-[9px] text-white/30 uppercase tracking-widest mb-1.5">Text Color</div>
                      <div className="flex flex-wrap gap-1">
                        {TEXT_COLORS.map(c=>(
                          <button key={c} onClick={()=>applyTextColor(c)}
                            className="w-5 h-5 rounded border border-white/10 hover:scale-110 transition-transform ring-offset-1"
                            style={{backgroundColor:c}} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {/* Highlight color */}
                <div className="relative">
                  <button onClick={e => { e.stopPropagation(); setShowHlColors(v=>!v); setShowTextColors(false); }}
                    className="w-6 h-6 rounded flex flex-col items-center justify-center hover:bg-white/[0.1] transition-all gap-px">
                    <span className="text-[9px] font-bold text-white/60 leading-none">HL</span>
                    <div className="w-4 h-[3px] rounded-full" style={{background:hlColor==="transparent"?"#fef08a":hlColor}}/>
                  </button>
                  {showHlColors && (
                    <div className="absolute top-full left-0 z-50 mt-1 bg-[#1e1e2e] border border-white/[0.14] rounded-lg p-2 shadow-xl" style={{minWidth:"90px"}} onClick={e=>e.stopPropagation()}>
                      <div className="text-[9px] text-white/30 uppercase tracking-widest mb-1.5">Highlight</div>
                      <div className="flex flex-wrap gap-1">
                        {HIGHLIGHT_COLORS.map(c=>(
                          <button key={c} onClick={()=>applyHlColor(c)}
                            className="w-5 h-5 rounded border border-white/20 hover:scale-110 transition-transform"
                            style={{background:c==="transparent"?"linear-gradient(45deg,#ccc 25%,transparent 25%,transparent 75%,#ccc 75%),linear-gradient(45deg,#ccc 25%,transparent 25%,transparent 75%,#ccc 75%)":c,backgroundSize:c==="transparent"?"8px 8px":undefined,backgroundPosition:c==="transparent"?"0 0,4px 4px":undefined}} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button onClick={()=>exec("removeFormat")} title="Clear Formatting"
                  className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/[0.1] text-white/35 hover:text-red-400 text-[10px] transition-all"><FiX className="w-3 h-3"/></button>
              </div>
            </div>

            {/* Paragraph */}
            <div className="flex flex-col justify-center gap-1.5 px-2 border-r border-white/[0.08]">
              <div className="flex items-center gap-0.5">
                <button onClick={()=>exec("insertUnorderedList")} title="Bullet List"  className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/[0.1] text-white/50 hover:text-white transition-all"><FiList       className="w-3.5 h-3.5"/></button>
                <button onClick={()=>exec("insertOrderedList")}   title="Numbered List" className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/[0.1] text-white/50 hover:text-white text-[11px] font-bold transition-all">1.</button>
                <button onClick={()=>exec("outdent")} title="Decrease Indent" className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/[0.1] text-white/50 hover:text-white text-[14px] transition-all">⇤</button>
                <button onClick={()=>exec("indent")}  title="Increase Indent" className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/[0.1] text-white/50 hover:text-white text-[14px] transition-all">⇥</button>
              </div>
              <div className="flex items-center gap-0.5">
                <button onClick={()=>exec("justifyLeft")}  title="Align Left"    className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/[0.1] text-white/50 hover:text-white transition-all"><FiAlignLeft   className="w-3 h-3"/></button>
                <button onClick={()=>exec("justifyCenter")} title="Align Center" className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/[0.1] text-white/50 hover:text-white transition-all"><FiAlignCenter className="w-3 h-3"/></button>
                <button onClick={()=>exec("justifyRight")} title="Align Right"   className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/[0.1] text-white/50 hover:text-white transition-all"><FiAlignRight  className="w-3 h-3"/></button>
                <button onClick={()=>exec("justifyFull")}  title="Justify"       className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/[0.1] text-white/50 hover:text-white text-[12px] font-bold transition-all">≡</button>
              </div>
            </div>

            {/* Styles */}
            <div className="flex flex-col justify-center gap-0.5 px-2 border-r border-white/[0.08]">
              <div className="text-[9px] text-white/25 uppercase tracking-widest mb-0.5">Styles</div>
              <div className="grid grid-cols-2 gap-0.5">
                {[
                  { label:"Normal", cmd:"<p>",   cls:"text-[10px]" },
                  { label:"Title",  cmd:"<h1>",  cls:"text-[10px] font-black" },
                  { label:"Heading 1", cmd:"<h1>", cls:"text-[10px] font-bold" },
                  { label:"Heading 2", cmd:"<h2>", cls:"text-[10px] font-semibold" },
                  { label:"Heading 3", cmd:"<h3>", cls:"text-[10px]" },
                  { label:"Subtitle",  cmd:"<h4>", cls:"text-[10px] italic" },
                ].map(s => (
                  <button key={s.label} onClick={()=>exec("formatBlock",s.cmd)}
                    className={cn("px-2 py-0.5 rounded border border-white/[0.07] hover:bg-blue-600/20 hover:border-blue-500/40 hover:text-white text-white/40 transition-all", s.cls)}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Undo/Redo */}
            <div className="flex flex-col justify-center gap-1 px-2">
              <button onClick={()=>exec("undo")} title="Undo (Ctrl+Z)" className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/[0.08] text-white/30 hover:text-white transition-all"><FiRotateCcw className="w-3.5 h-3.5"/></button>
              <button onClick={()=>exec("redo")} title="Redo (Ctrl+Y)" className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/[0.08] text-white/30 hover:text-white transition-all"><FiRotateCw  className="w-3.5 h-3.5"/></button>
            </div>
          </div>
        )}

        {/* INSERT */}
        {tab === "Insert" && (
          <div className="flex items-center gap-1 px-3 py-1 min-w-max h-[70px]">
            {[
              { label:"Page Break", icon:"⊟", onClick:()=>exec("insertHTML","<div style='page-break-after:always;border-top:2px dashed #ccc;margin:16px 0;'><br/></div>") },
              { label:"Table 3×3",  icon:"⊞", onClick:()=>exec("insertHTML",`<table style="width:100%;border-collapse:collapse;margin:8px 0"><thead><tr>${Array(3).fill(`<th style="border:1px solid #d1d5db;padding:8px 12px;background:#f9fafb;font-weight:600;text-align:left">Header</th>`).join("")}</tr></thead><tbody>${[0,1].map(()=>`<tr>${Array(3).fill(`<td style="border:1px solid #d1d5db;padding:8px 12px">Cell</td>`).join("")}</tr>`).join("")}</tbody></table>`) },
              { label:"H. Rule",    icon:"—",  onClick:()=>exec("insertHorizontalRule") },
              { label:"Hyperlink",  icon:"🔗", onClick:()=>{ const url=prompt("Enter URL (https://...)"); if(url) exec("createLink",url); } },
              { label:"Code Block", icon:"</>", onClick:()=>exec("insertHTML","<pre style='background:#1e1e2e;color:#e2e8f0;border-radius:8px;padding:16px;font-family:monospace;font-size:13px;overflow-x:auto;margin:8px 0'>Code here…</pre>") },
              { label:"Quote",      icon:"❝",  onClick:()=>exec("insertHTML","<blockquote style='border-left:4px solid #6366f1;padding:12px 16px;background:#f8f8ff;color:#374151;font-style:italic;margin:8px 0;border-radius:0 8px 8px 0'>Quoted text here…</blockquote>") },
              { label:"Superscript",icon:"x²", onClick:()=>exec("superscript") },
              { label:"Subscript",  icon:"x₂", onClick:()=>exec("subscript") },
            ].map(item => (
              <button key={item.label} onClick={item.onClick}
                className="flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded hover:bg-white/[0.07] text-white/50 hover:text-white transition-all min-w-[52px]">
                <span className="text-lg leading-none">{item.icon}</span>
                <span className="text-[9px] text-center leading-tight">{item.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* LAYOUT */}
        {tab === "Layout" && (
          <div className="flex items-center gap-4 px-3 h-[70px]">
            <div>
              <div className="text-[9px] text-white/25 uppercase tracking-widest mb-1">Margins</div>
              <div className="space-y-0.5">
                {["Normal (1\")", "Narrow (0.5\")", "Wide (1.5\")", "Moderate (0.75\")"].map(m=>(
                  <button key={m} className="block px-2 py-0.5 rounded text-[10px] text-white/40 hover:text-white hover:bg-white/[0.06] transition-all text-left w-full">{m}</button>
                ))}
              </div>
            </div>
            <div className="h-14 w-px bg-white/[0.08]"/>
            <div>
              <div className="text-[9px] text-white/25 uppercase tracking-widest mb-1">Orientation</div>
              {[{l:"📄 Portrait"},{l:"🖼️ Landscape"}].map(o=>(
                <button key={o.l} className="block px-2 py-1 rounded text-[10px] text-white/40 hover:text-white hover:bg-white/[0.06] transition-all">{o.l}</button>
              ))}
            </div>
            <div className="h-14 w-px bg-white/[0.08]"/>
            <div>
              <div className="text-[9px] text-white/25 uppercase tracking-widest mb-1">Spacing</div>
              {[["Before:","8px"],["After:","8px"],["Line:","1.6"]].map(([k,v])=>(
                <div key={k} className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] text-white/30 w-12">{k}</span>
                  <input defaultValue={v} className="w-12 bg-white/[0.06] border border-white/[0.1] rounded px-1.5 py-0.5 text-[10px] text-white/60 outline-none" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW */}
        {tab === "View" && (
          <div className="flex items-center gap-4 px-3 h-[70px]">
            <div>
              <div className="text-[9px] text-white/25 uppercase tracking-widest mb-2">Show</div>
              {[{label:"Ruler",checked:showRuler,set:setShowRuler}].map(item=>(
                <label key={item.label} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={item.checked} onChange={e=>item.set(e.target.checked)} className="w-3.5 h-3.5 accent-blue-500 rounded"/>
                  <span className="text-[11px] text-white/50 hover:text-white transition-colors">{item.label}</span>
                </label>
              ))}
            </div>
            <div className="h-10 w-px bg-white/[0.08]"/>
            <div>
              <div className="text-[9px] text-white/25 uppercase tracking-widest mb-1.5">Zoom</div>
              <div className="flex items-center gap-1">
                {[75,100,125,150,200].map(z=>(
                  <button key={z} onClick={()=>setZoom(z)}
                    className={cn("px-2 py-0.5 rounded border text-[10px] transition-all",
                      zoom===z ? "bg-blue-600/25 border-blue-500/40 text-blue-300" : "border-white/[0.08] text-white/40 hover:text-white hover:bg-white/[0.06]")}>
                    {z}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Ruler ── */}
      {showRuler && (
        <div className="h-5 bg-[#353550] border-b border-white/[0.06] shrink-0 flex items-end overflow-hidden">
          <div className="flex items-end h-full ml-[calc(50%-408px)]">
            {Array.from({length:48}).map((_,i) => (
              <div key={i} style={{width:"20px",minWidth:"20px"}} className="flex flex-col items-center justify-end h-full">
                {i%5===0 && <span className="text-[7px] text-white/20 leading-none mb-0.5">{i>0?i/5:""}</span>}
                <div className={cn("bg-white/20", i%5===0?"h-2.5":"h-1.5", "w-px")}/>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Main area ── */}
      <div className="flex flex-1 overflow-hidden min-h-0" onClick={closeDropdowns}>

        {/* Document scroll area — multiple A4 pages */}
        <div className="flex-1 overflow-y-auto" style={{background:"#525252", padding:"32px 16px"}}>
          {Array.from({ length: pageCount }).map((_, idx) => (
            <div key={idx}>
              {/* Page label */}
              <div className="text-center text-[10px] text-white/30 mb-2 select-none">
                {idx > 0 ? `— Page ${idx + 1} —` : null}
              </div>
              {/* A4 Paper */}
              <div
                className="mx-auto bg-white shadow-[0_4px_24px_rgba(0,0,0,0.55)] relative"
                style={{
                  width: `${816 * zoom/100}px`,
                  height: `${1056 * zoom/100}px`,
                  fontFamily: font,
                  fontSize: `${fontSize}px`,
                  padding: `${72 * zoom/100}px ${96 * zoom/100}px`,
                  overflow: "hidden",
                  boxSizing: "border-box",
                }}>
                <div
                  ref={el => { pageRefs.current[idx] = el; }}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={() => handlePageInput(idx)}
                  onKeyDown={e => handlePageKeyDown(e, idx)}
                  onFocus={() => setActivePage(idx)}
                  data-placeholder={idx === 0 ? "Start typing your document…" : ""}
                  className="outline-none text-gray-900 leading-[1.7] w-full overflow-hidden
                    [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-gray-300 [&:empty]:before:pointer-events-none
                    [&_h1]:text-[2em] [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:leading-tight [&_h1]:my-4
                    [&_h2]:text-[1.5em] [&_h2]:font-bold [&_h2]:text-gray-800 [&_h2]:my-3
                    [&_h3]:text-[1.25em] [&_h3]:font-semibold [&_h3]:text-gray-800 [&_h3]:my-2.5
                    [&_h4]:text-[1.1em] [&_h4]:font-semibold [&_h4]:text-gray-700 [&_h4]:my-2
                    [&_p]:my-2 [&_a]:text-blue-600 [&_a]:underline
                    [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2
                    [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2
                    [&_blockquote]:border-l-4 [&_blockquote]:border-indigo-400 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:my-4
                    [&_pre]:bg-gray-900 [&_pre]:text-green-300 [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-[13px] [&_pre]:my-4 [&_pre]:overflow-x-auto
                    [&_table]:w-full [&_table]:border-collapse [&_table]:my-4
                    [&_td]:border [&_td]:border-gray-300 [&_td]:px-3 [&_td]:py-2
                    [&_th]:border [&_th]:border-gray-300 [&_th]:px-3 [&_th]:py-2 [&_th]:bg-gray-100 [&_th]:font-semibold [&_th]:text-left
                    [&_hr]:border-gray-300 [&_hr]:my-6"
                  style={{ fontFamily: font, fontSize: `${fontSize}px`, userSelect:"text", minHeight:"40px" }}
                />
                {/* Page number footer */}
                <div className="absolute bottom-5 left-0 right-0 text-center text-gray-300 text-[11px] pointer-events-none select-none">
                  {idx + 1}
                </div>
                {/* Active page highlight ring */}
                {activePage === idx && (
                  <div className="absolute inset-0 pointer-events-none ring-2 ring-blue-400/40 ring-inset" />
                )}
              </div>
              {/* Gap between pages */}
              {idx < pageCount - 1 && <div className="h-8" />}
            </div>
          ))}
          {/* Bottom padding */}
          <div className="h-16" />
        </div>

        {/* AI Panel */}
        {aiPanel && (
          <div className="w-72 shrink-0 bg-[#1e1e2e] border-l border-white/[0.08] flex flex-col p-4 gap-2.5 overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-2">
                <FiZap className="w-4 h-4 text-violet-400" />
                <span className="text-white font-bold text-[13px]">AI Assistant</span>
              </div>
              <button onClick={()=>setAiPanel(false)} className="text-white/25 hover:text-white transition-colors">
                <FiX className="w-3.5 h-3.5"/>
              </button>
            </div>
            <p className="text-white/30 text-[11px]">Applies to entire document content</p>
            {AI_PROMPTS.map(a=>(
              <button key={a.label} onClick={()=>runAI(a.prompt)} disabled={aiLoading}
                className="w-full text-left px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white/55 text-[12px] hover:bg-white/[0.08] hover:text-white disabled:opacity-50 transition-all">
                {aiLoading && <FiRefreshCw className="w-3 h-3 animate-spin inline mr-1.5"/>}{a.label}
              </button>
            ))}
            <div className="border-t border-white/[0.07] pt-3 mt-1">
              <textarea value={aiPrompt} onChange={e=>setAiPrompt(e.target.value)}
                placeholder="Custom instruction…" rows={3}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-[12px] outline-none placeholder:text-white/20 focus:border-violet-500/40 resize-none mb-2" />
              <button onClick={customAI} disabled={!aiPrompt.trim()||aiLoading}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-violet-600/15 text-violet-300 border border-violet-500/25 text-[12px] font-bold disabled:opacity-40 hover:bg-violet-600/25 transition-all">
                {aiLoading ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin"/> : <FiZap className="w-3.5 h-3.5"/>}
                {aiLoading ? "Processing…" : "Run"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Status bar ── */}
      <div className="h-6 bg-[#1e1e2e] border-t border-white/[0.07] flex items-center px-4 gap-4 shrink-0">
        <span className="text-[10px] text-white/35">{wordCount} {wordCount===1?"word":"words"}</span>
        <span className="text-white/10 text-[10px]">|</span>
        <span className="text-[10px] text-white/35">Page {activePage + 1} of {pageCount}</span>
        <span className="text-white/10 text-[10px]">|</span>
        <span className="text-[10px] text-white/35">English (India)</span>
        <div className="flex-1"/>
        <div className="flex items-center gap-2">
          <button onClick={()=>setZoom(z=>Math.max(25,z-25))} className="text-white/25 hover:text-white text-[11px] transition-colors">−</button>
          <div className="w-20 h-1 bg-white/[0.08] rounded-full relative cursor-pointer"
            onClick={e=>{ const r=e.currentTarget.getBoundingClientRect(); const pct=(e.clientX-r.left)/r.width; setZoom(Math.round(25+pct*175)); }}>
            <div className="h-1 bg-blue-400 rounded-full transition-all" style={{width:`${((zoom-25)/175)*100}%`}}/>
          </div>
          <button onClick={()=>setZoom(z=>Math.min(200,z+25))} className="text-white/25 hover:text-white text-[11px] transition-colors">+</button>
          <span className="text-[10px] text-white/40 w-9 text-right">{zoom}%</span>
        </div>
      </div>
    </div>
  );
}
