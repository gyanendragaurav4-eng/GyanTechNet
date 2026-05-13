import { useState } from "react";
import { FiClipboard, FiPlus, FiActivity, FiTrash2, FiX, FiCheck, FiZap, FiRefreshCw, FiCopy, FiLink } from "react-icons/fi";
import { cn } from "@/lib/utils";

type FieldType = "text"|"textarea"|"email"|"number"|"select"|"checkbox"|"radio"|"date";
type Field = { id:string; type:FieldType; label:string; required:boolean; options?:string[] };
type Form = { id:number; title:string; desc:string; fields:Field[]; responses:number; status:"live"|"draft" };

const FIELD_TYPES: { type:FieldType; label:string; emoji:string }[] = [
  { type:"text",     label:"Short Text",  emoji:"📝" },
  { type:"textarea", label:"Long Text",   emoji:"📄" },
  { type:"email",    label:"Email",       emoji:"📧" },
  { type:"number",   label:"Number",      emoji:"🔢" },
  { type:"select",   label:"Dropdown",    emoji:"▽" },
  { type:"radio",    label:"Multiple Choice", emoji:"⚬" },
  { type:"checkbox", label:"Checkbox",    emoji:"☑" },
  { type:"date",     label:"Date",        emoji:"📅" },
];

const INITIAL_FORMS: Form[] = [
  {
    id:1, title:"Customer Feedback Survey", desc:"Help us improve our service", responses:142, status:"live",
    fields:[
      { id:"f1", type:"text",     label:"Full Name",          required:true },
      { id:"f2", type:"email",    label:"Email Address",      required:true },
      { id:"f3", type:"radio",    label:"How satisfied are you?", required:true, options:["Very Satisfied","Satisfied","Neutral","Unsatisfied"] },
      { id:"f4", type:"textarea", label:"What can we improve?",   required:false },
    ],
  },
  {
    id:2, title:"Event Registration", desc:"Gyan AI Summit 2026", responses:67, status:"live",
    fields:[
      { id:"g1", type:"text",  label:"Name",    required:true },
      { id:"g2", type:"email", label:"Email",   required:true },
      { id:"g3", type:"select",label:"Session", required:true, options:["Morning Keynote","AI Workshop","Panel Discussion"] },
      { id:"g4", type:"checkbox", label:"I agree to terms", required:true },
    ],
  },
  {
    id:3, title:"Job Application", desc:"Apply to join GyanTechNet", responses:23, status:"draft",
    fields:[
      { id:"h1", type:"text",     label:"Full Name",   required:true },
      { id:"h2", type:"email",    label:"Email",       required:true },
      { id:"h3", type:"text",     label:"Role Applied",required:true },
      { id:"h4", type:"textarea", label:"Cover Letter",required:false },
    ],
  },
];

function FieldPreview({ field }: { field: Field }) {
  const common = "w-full bg-white/[0.04] border border-white/[0.09] rounded-xl px-3 py-2 text-white/60 text-[12.5px] outline-none placeholder:text-white/20";
  return (
    <div className="mb-4">
      <label className="block text-[12.5px] font-semibold text-white/75 mb-1.5">
        {field.label} {field.required && <span className="text-red-400">*</span>}
      </label>
      {field.type === "text"     && <input disabled placeholder={`Enter ${field.label.toLowerCase()}...`} className={common} />}
      {field.type === "email"    && <input disabled type="email" placeholder="user@example.com" className={common} />}
      {field.type === "number"   && <input disabled type="number" placeholder="0" className={common} />}
      {field.type === "date"     && <input disabled type="date" className={common} />}
      {field.type === "textarea" && <textarea disabled rows={3} placeholder={`Enter ${field.label.toLowerCase()}...`} className={`${common} resize-none`} />}
      {field.type === "select"   && (
        <select disabled className={common} style={{ colorScheme:"dark" }}>
          <option>-- Select an option --</option>
          {field.options?.map(o => <option key={o}>{o}</option>)}
        </select>
      )}
      {field.type === "radio" && (
        <div className="space-y-2">
          {field.options?.map(o => (
            <label key={o} className="flex items-center gap-2.5 cursor-pointer group">
              <div className="w-4 h-4 rounded-full border-2 border-white/[0.2] group-hover:border-primary transition-colors" />
              <span className="text-white/55 text-[12.5px]">{o}</span>
            </label>
          ))}
        </div>
      )}
      {field.type === "checkbox" && (
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <div className="w-4 h-4 rounded border-2 border-white/[0.2] group-hover:border-primary transition-colors flex items-center justify-center" />
          <span className="text-white/55 text-[12.5px]">{field.options?.[0] || field.label}</span>
        </label>
      )}
    </div>
  );
}

export default function FormsPage() {
  const [forms, setForms]         = useState<Form[]>(INITIAL_FORMS);
  const [active, setActive]       = useState<Form>(INITIAL_FORMS[0]);
  const [view, setView]           = useState<"builder"|"preview"|"responses">("preview");
  const [showNew, setShowNew]     = useState(false);
  const [newTitle, setNewTitle]   = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTopic, setAiTopic]     = useState("");
  const [copied, setCopied]       = useState(false);

  const createForm = () => {
    if (!newTitle.trim()) return;
    const newForm: Form = { id: Date.now(), title: newTitle, desc: "", fields: [], responses: 0, status: "draft" };
    setForms(f => [...f, newForm]);
    setActive(newForm);
    setNewTitle(""); setShowNew(false);
    setView("builder");
  };

  const addField = (type: FieldType) => {
    const field: Field = {
      id: `fld_${Date.now()}`, type, label: FIELD_TYPES.find(f => f.type === type)?.label || "Field",
      required: false,
      options: type === "select" || type === "radio" ? ["Option 1","Option 2","Option 3"] : undefined,
    };
    const updated = { ...active, fields: [...active.fields, field] };
    setActive(updated);
    setForms(f => f.map(x => x.id === active.id ? updated : x));
  };

  const removeField = (id: string) => {
    const updated = { ...active, fields: active.fields.filter(f => f.id !== id) };
    setActive(updated);
    setForms(f => f.map(x => x.id === active.id ? updated : x));
  };

  const aiGenerate = async () => {
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          messages:[{ role:"user", content:`Create a form structure for: "${aiTopic}". Return JSON only: {"title":"...","desc":"...","fields":[{"id":"f1","type":"text|textarea|email|number|select|radio|checkbox","label":"...","required":true/false,"options":["opt1","opt2"] (only for select/radio)}]}. Create 4-6 fields.` }],
          mode:"Business", model:"openai/gpt-4o-mini",
        }),
      });
      const data = await res.json();
      const parsed = JSON.parse(data.content || "{}");
      if (parsed.title) {
        const newForm: Form = { id: Date.now(), title: parsed.title, desc: parsed.desc || "", fields: parsed.fields || [], responses: 0, status: "draft" };
        setForms(f => [...f, newForm]);
        setActive(newForm);
        setView("preview");
      }
    } catch { /* ignore */ }
    setAiLoading(false); setAiTopic("");
  };

  return (
    <div className="flex h-full bg-[#06060f] overflow-hidden">

      {/* Sidebar */}
      <div className="hidden sm:flex w-60 shrink-0 bg-[#08081a] border-r border-white/[0.06] flex-col">
        <div className="px-3 pt-3 pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-xl bg-indigo-600/20 flex items-center justify-center">
              <FiClipboard className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <h2 className="text-white font-bold text-[13px]">GyanForms</h2>
          </div>

          {/* AI generate */}
          <div className="flex items-center gap-1.5 bg-violet-500/[0.06] border border-violet-500/15 rounded-xl p-2 mb-2">
            <input value={aiTopic} onChange={e => setAiTopic(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") aiGenerate(); }}
              placeholder="AI: describe a form..."
              className="flex-1 bg-transparent text-white text-[11px] outline-none placeholder:text-white/25 min-w-0" />
            <button onClick={aiGenerate} disabled={aiLoading || !aiTopic.trim()}
              className="p-1.5 rounded-lg bg-violet-600/20 text-violet-300 hover:bg-violet-600/30 disabled:opacity-30 transition-all">
              {aiLoading ? <FiRefreshCw className="w-3 h-3 animate-spin" /> : <FiZap className="w-3 h-3" />}
            </button>
          </div>

          <button onClick={() => setShowNew(true)}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary/10 text-primary text-[12px] font-bold border border-primary/20 hover:bg-primary/20 transition-all">
            <FiPlus className="w-3.5 h-3.5" /> New Form
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
          {forms.map(f => (
            <button key={f.id} onClick={() => { setActive(f); setView("preview"); }}
              className={cn("w-full text-left p-3 rounded-xl transition-all",
                active.id === f.id ? "bg-white/[0.07] ring-1 ring-white/[0.09]" : "hover:bg-white/[0.04]")}>
              <div className="text-white/80 text-[12.5px] font-semibold truncate">{f.title}</div>
              <div className="flex items-center justify-between mt-1.5">
                <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase",
                  f.status === "live" ? "text-emerald-400 bg-emerald-500/10" : "text-amber-400 bg-amber-500/10")}>
                  {f.status}
                </span>
                <span className="text-white/25 text-[10px] flex items-center gap-1">
                  <FiActivity className="w-2.5 h-2.5" /> {f.responses}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="h-11 border-b border-white/[0.06] bg-[#08081a] flex items-center px-4 gap-3 shrink-0">
          <span className="text-white font-bold text-[13px] flex-1 truncate">{active.title}</span>
          <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full uppercase",
            active.status === "live" ? "text-emerald-400 bg-emerald-500/10" : "text-amber-400 bg-amber-500/10")}>
            {active.status}
          </span>

          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.07] rounded-lg p-0.5">
            {(["builder","preview","responses"] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={cn("px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize transition-all",
                  view === v ? "bg-white/[0.1] text-white" : "text-white/30 hover:text-white")}>
                {v === "responses" ? "Responses" : v === "builder" ? "Builder" : "Preview"}
              </button>
            ))}
          </div>

          <button onClick={() => { navigator.clipboard.writeText(`https://forms.gyantechnet.com/f/${active.id}`).catch(()=>{}); setCopied(true); setTimeout(()=>setCopied(false),2000); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] text-white/40 text-[11px] border border-white/[0.07] hover:text-white transition-all">
            {copied ? <FiCheck className="w-3 h-3 text-emerald-400" /> : <FiLink className="w-3 h-3" />}
            {copied ? "Copied!" : "Share"}
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Builder panel */}
          {view === "builder" && (
            <div className="w-56 border-r border-white/[0.06] bg-[#06060f] overflow-y-auto no-scrollbar p-3 shrink-0">
              <div className="text-[9px] text-white/25 uppercase font-bold tracking-widest mb-2">Add Field</div>
              <div className="space-y-1">
                {FIELD_TYPES.map(ft => (
                  <button key={ft.type} onClick={() => addField(ft.type)}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-[11.5px] text-white/45 hover:text-white hover:bg-white/[0.05] transition-all">
                    <span className="text-[14px]">{ft.emoji}</span>
                    {ft.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content area */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {view === "preview" && (
              <div className="max-w-2xl mx-auto px-4 py-6">
                <div className="bg-[#0d0d1e] border border-white/[0.08] rounded-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-primary/20 to-blue-600/20 border-b border-white/[0.07] px-6 py-5">
                    <h2 className="text-white font-black text-[18px]">{active.title}</h2>
                    {active.desc && <p className="text-white/45 text-[13px] mt-1">{active.desc}</p>}
                  </div>
                  <div className="p-6">
                    {active.fields.length === 0 ? (
                      <div className="text-center py-8 text-white/25 text-[13px]">No fields yet. Switch to Builder to add fields.</div>
                    ) : (
                      active.fields.map(f => <FieldPreview key={f.id} field={f} />)
                    )}
                    {active.fields.length > 0 && (
                      <button className="w-full py-3 mt-3 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white font-bold text-[13px] hover:from-primary/90 hover:to-blue-500 shadow-[0_4px_12px_rgba(124,58,237,0.3)] transition-all">
                        Submit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {view === "builder" && (
              <div className="max-w-2xl mx-auto px-4 py-6 space-y-2">
                {active.fields.length === 0 && (
                  <div className="text-center py-10 text-white/25 border border-dashed border-white/[0.1] rounded-2xl">
                    <div className="text-3xl mb-2">📋</div>
                    <div className="text-[13px]">Select fields from the left panel to add them</div>
                  </div>
                )}
                {active.fields.map((f, i) => (
                  <div key={f.id} className="bg-[#0d0d1e] border border-white/[0.08] rounded-xl p-4 flex items-start gap-3 group hover:border-white/[0.15] transition-all">
                    <span className="text-white/30 text-[11px] font-bold mt-0.5 w-4 text-center">{i+1}</span>
                    <div className="flex-1 min-w-0">
                      <input defaultValue={f.label} className="bg-transparent text-white/80 text-[13px] font-semibold outline-none border-b border-transparent hover:border-white/[0.1] focus:border-primary/50 transition-all w-full mb-1.5" />
                      <span className="text-[9px] text-white/25 uppercase font-bold">{FIELD_TYPES.find(t => t.type === f.type)?.label}</span>
                    </div>
                    <button onClick={() => removeField(f.id)} className="p-1.5 text-white/20 hover:text-red-400 bg-white/[0.04] rounded-lg transition-all opacity-0 group-hover:opacity-100">
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {view === "responses" && (
              <div className="max-w-2xl mx-auto px-4 py-6">
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { label:"Total Responses", value:active.responses, color:"text-primary" },
                    { label:"Completion Rate",  value:"87%",           color:"text-emerald-400" },
                    { label:"Avg Time",         value:"2m 14s",        color:"text-blue-400" },
                  ].map(s => (
                    <div key={s.label} className="bg-[#0d0d1e] border border-white/[0.08] rounded-2xl p-4 text-center">
                      <div className={cn("text-[26px] font-black", s.color)}>{s.value}</div>
                      <div className="text-white/35 text-[11px] mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-[#0d0d1e] border border-white/[0.08] rounded-2xl p-4">
                  <div className="text-white/40 text-[13px] text-center py-4">Connect a data source to see individual responses.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New form modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowNew(false)}>
          <div className="bg-[#0d0d1e] border border-white/[0.1] rounded-2xl p-5 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-bold mb-3">New Form</h3>
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") createForm(); }}
              placeholder="Form title..."
              autoFocus
              className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl px-3 py-2.5 text-white text-[13.5px] outline-none placeholder:text-white/20 focus:border-primary/40 transition-all mb-3" />
            <div className="flex gap-2">
              <button onClick={() => setShowNew(false)} className="flex-1 py-2.5 rounded-xl border border-white/[0.1] text-white/50 text-[13px]">Cancel</button>
              <button onClick={createForm} disabled={!newTitle.trim()}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-[13px] font-bold disabled:opacity-30 hover:bg-primary/90 transition-all">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
