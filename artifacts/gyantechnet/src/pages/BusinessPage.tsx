import { useState } from "react";
import { FiBriefcase, FiZap, FiDownload, FiCopy, FiRefreshCw, FiChevronRight } from "react-icons/fi";
import { cn } from "@/lib/utils";

const TOOLS = [
  { id:"strategy",  label:"Business Strategy",  emoji:"🎯", desc:"AI-crafted growth strategy" },
  { id:"proposal",  label:"Business Proposal",  emoji:"📄", desc:"Professional proposals" },
  { id:"pitch",     label:"Pitch Deck Content", emoji:"🚀", desc:"Investor-ready pitches" },
  { id:"email",     label:"Business Email",     emoji:"📧", desc:"Professional email copy" },
  { id:"swot",      label:"SWOT Analysis",      emoji:"🔍", desc:"Strength/Weakness analysis" },
  { id:"marketing", label:"Marketing Plan",     emoji:"📊", desc:"Go-to-market strategies" },
  { id:"job",       label:"Job Description",    emoji:"👥", desc:"Talent acquisition copy" },
  { id:"press",     label:"Press Release",      emoji:"📰", desc:"Media-ready releases" },
  { id:"sop",       label:"SOP Document",       emoji:"📋", desc:"Standard procedures" },
];

const TEMPLATES: Record<string, { fields: { id: string; label: string; placeholder: string; multiline?: boolean }[]; prompt: (f: Record<string,string>) => string }> = {
  strategy: {
    fields: [
      { id:"company",  label:"Company Name",    placeholder:"e.g. GyanTechNet" },
      { id:"industry", label:"Industry",         placeholder:"e.g. AI Platform, SaaS" },
      { id:"goal",     label:"Primary Goal",     placeholder:"e.g. 10x revenue in 12 months" },
      { id:"context",  label:"Current Situation",placeholder:"Brief context...", multiline:true },
    ],
    prompt: f => `Create a comprehensive business strategy for ${f.company} in the ${f.industry} industry. Goal: ${f.goal}. Context: ${f.context}. Include: Executive Summary, Market Analysis, Strategic Initiatives, KPIs, Timeline, and Risk Assessment. Format with clear headers.`,
  },
  proposal: {
    fields: [
      { id:"company",  label:"Your Company",     placeholder:"Your company name" },
      { id:"client",   label:"Client Name",      placeholder:"Client or prospect name" },
      { id:"service",  label:"Service / Product",placeholder:"What you're offering" },
      { id:"value",    label:"Value Proposition",placeholder:"Key benefits...", multiline:true },
    ],
    prompt: f => `Write a professional business proposal from ${f.company} to ${f.client} for ${f.service}. Value: ${f.value}. Include: Cover Page content, Executive Summary, Problem Statement, Proposed Solution, Deliverables, Timeline, Pricing (leave as [AMOUNT]), and Call to Action.`,
  },
  pitch: {
    fields: [
      { id:"startup",  label:"Startup Name",     placeholder:"Your startup name" },
      { id:"problem",  label:"Problem Statement",placeholder:"What problem do you solve?" },
      { id:"solution", label:"Your Solution",    placeholder:"How do you solve it?" },
      { id:"market",   label:"Target Market",    placeholder:"Who are your customers?" },
    ],
    prompt: f => `Create investor pitch deck content for ${f.startup}. Problem: ${f.problem}. Solution: ${f.solution}. Market: ${f.market}. Create compelling slide content for: Hook/Tagline, Problem, Solution, Market Size (TAM/SAM/SOM), Business Model, Traction, Team, Ask. Format each slide clearly.`,
  },
  email: {
    fields: [
      { id:"from",     label:"From (Your Role)",  placeholder:"e.g. CEO, Sales Manager" },
      { id:"to",       label:"To (Recipient)",    placeholder:"e.g. potential client, investor" },
      { id:"purpose",  label:"Email Purpose",     placeholder:"e.g. partnership, follow-up, intro" },
      { id:"context",  label:"Key Points",        placeholder:"What to include...", multiline:true },
    ],
    prompt: f => `Write a professional business email from a ${f.from} to a ${f.to}. Purpose: ${f.purpose}. Key points: ${f.context}. Make it concise, persuasive, and professional. Include subject line and full email body.`,
  },
  swot: {
    fields: [
      { id:"company",  label:"Company / Product", placeholder:"Company or product name" },
      { id:"industry", label:"Industry",           placeholder:"Your industry" },
      { id:"context",  label:"Business Context",  placeholder:"Current situation...", multiline:true },
    ],
    prompt: f => `Perform a detailed SWOT Analysis for ${f.company} in the ${f.industry} industry. Context: ${f.context}. Provide 5-6 points for each quadrant: Strengths, Weaknesses, Opportunities, Threats. Then provide 3 strategic recommendations based on the analysis.`,
  },
  marketing: {
    fields: [
      { id:"product",  label:"Product / Service", placeholder:"What you're marketing" },
      { id:"audience", label:"Target Audience",   placeholder:"Who are your customers?" },
      { id:"budget",   label:"Budget Range",       placeholder:"e.g. ₹50K/mo, $10K/mo" },
      { id:"goal",     label:"Marketing Goal",     placeholder:"e.g. 1000 signups in 90 days" },
    ],
    prompt: f => `Create a detailed marketing plan for ${f.product} targeting ${f.audience}. Budget: ${f.budget}. Goal: ${f.goal}. Include: Marketing Strategy, Channels (social, content, paid, SEO), Content Calendar outline, Key Messages, KPIs, and 90-day action plan.`,
  },
  job: {
    fields: [
      { id:"title",    label:"Job Title",          placeholder:"e.g. Senior React Developer" },
      { id:"company",  label:"Company",             placeholder:"Company name" },
      { id:"skills",   label:"Key Requirements",   placeholder:"Required skills...", multiline:true },
    ],
    prompt: f => `Write a compelling job description for ${f.title} at ${f.company}. Requirements: ${f.skills}. Include: Role Overview, Key Responsibilities (6-8 points), Requirements (must-have), Nice-to-have, What We Offer, and Company Culture section.`,
  },
  press: {
    fields: [
      { id:"headline", label:"News Headline",      placeholder:"What is the announcement?" },
      { id:"company",  label:"Company",             placeholder:"Company name" },
      { id:"details",  label:"Key Details",        placeholder:"Date, location, specifics...", multiline:true },
    ],
    prompt: f => `Write a professional press release for: ${f.headline}. Company: ${f.company}. Details: ${f.details}. Follow standard press release format: Headline, Dateline, Lead paragraph (5 Ws), Body (2-3 paragraphs), Quote from executive, Boilerplate, Contact information.`,
  },
  sop: {
    fields: [
      { id:"process",  label:"Process Name",       placeholder:"e.g. Customer Onboarding" },
      { id:"company",  label:"Company",             placeholder:"Company name" },
      { id:"scope",    label:"Scope & Context",    placeholder:"Who uses this and when...", multiline:true },
    ],
    prompt: f => `Create a Standard Operating Procedure (SOP) document for ${f.process} at ${f.company}. Scope: ${f.scope}. Include: Purpose, Scope, Definitions, Responsibilities, Step-by-step Procedure (numbered), Quality Checks, Exceptions/Edge Cases, Document Control section.`,
  },
};

export default function BusinessPage() {
  const [activeTool, setActiveTool] = useState("strategy");
  const [fields, setFields] = useState<Record<string,string>>({});
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const tool = TOOLS.find(t => t.id === activeTool)!;
  const template = TEMPLATES[activeTool];

  const generate = async () => {
    const prompt = template.prompt(fields);
    setLoading(true); setOutput(null);
    try {
      const res = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, type: "business" }),
      });
      const data = await res.json();
      setOutput(data.content || data.error || "Generation failed.");
    } catch { setOutput("⚠️ Connection error. Please try again."); }
    setLoading(false);
  };

  const copyOutput = () => { if (output) navigator.clipboard.writeText(output).catch(() => {}); };
  const downloadOutput = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `${activeTool}-${Date.now()}.txt`; a.click();
  };

  const renderOutput = (text: string) => text.split("\n").map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-2" />;
    if (line.startsWith("# "))   return <h1 key={i} className="text-xl font-black text-white mt-4 mb-2 first:mt-0">{line.slice(2)}</h1>;
    if (line.startsWith("## "))  return <h2 key={i} className="text-base font-bold text-violet-300 mt-3 mb-1">{line.slice(3)}</h2>;
    if (line.startsWith("### ")) return <h3 key={i} className="text-sm font-bold text-white/80 mt-2 mb-1">{line.slice(4)}</h3>;
    if (line.startsWith("- ") || line.startsWith("• ")) return (
      <div key={i} className="flex items-start gap-2 mb-1 ml-2">
        <span className="text-violet-400 mt-1.5 shrink-0 text-[8px]">◆</span>
        <span className="text-white/75 text-[13px] leading-relaxed">{line.slice(2)}</span>
      </div>
    );
    if (/^\d+\.\s/.test(line)) return (
      <div key={i} className="flex items-start gap-2 mb-1 ml-2">
        <span className="text-violet-400 shrink-0 text-[11px] font-bold mt-0.5">{line.match(/^\d+/)?.[0]}.</span>
        <span className="text-white/75 text-[13px] leading-relaxed">{line.replace(/^\d+\.\s/, "")}</span>
      </div>
    );
    return <p key={i} className="text-white/70 text-[13px] leading-relaxed mb-1">{line}</p>;
  });

  return (
    <div className="flex h-full bg-[#06060f] overflow-hidden">

      {/* Tool sidebar */}
      <div className="hidden md:flex w-64 shrink-0 bg-[#08081a] border-r border-white/[0.06] flex-col">
        <div className="px-4 pt-4 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <FiBriefcase className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-white font-black text-[14px] leading-none">Business AI</h1>
              <p className="text-white/30 text-[10px]">AI-powered business tools</p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar py-2 px-2">
          {TOOLS.map(t => (
            <button key={t.id} onClick={() => { setActiveTool(t.id); setFields({}); setOutput(null); }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-left transition-all",
                activeTool === t.id ? "bg-primary/12 border border-primary/20 text-white" : "text-white/50 hover:bg-white/[0.04] hover:text-white"
              )}>
              <span className="text-base">{t.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold truncate">{t.label}</div>
                <div className="text-[10px] opacity-50 truncate">{t.desc}</div>
              </div>
              {activeTool === t.id && <FiChevronRight className="w-3 h-3 text-primary shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06] bg-[#06060f] shrink-0">
          <span className="text-2xl">{tool.emoji}</span>
          <div>
            <h2 className="text-white font-bold text-[15px]">{tool.label}</h2>
            <p className="text-white/30 text-[11px]">{tool.desc}</p>
          </div>
          {/* Mobile tool picker */}
          <select value={activeTool} onChange={e => { setActiveTool(e.target.value); setFields({}); setOutput(null); }}
            className="md:hidden ml-auto bg-[#0d0d1e] text-white text-[12px] rounded-lg px-2 py-1 outline-none border border-white/[0.1]"
            style={{ colorScheme:"dark" }}>
            {TOOLS.map(t => <option key={t.id} value={t.id}>{t.emoji} {t.label}</option>)}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="max-w-4xl mx-auto px-5 py-5 flex flex-col lg:flex-row gap-5">
            {/* Input form */}
            <div className="lg:w-80 shrink-0 space-y-3">
              <div className="bg-[#0d0d1e] border border-white/[0.08] rounded-2xl p-4">
                <h3 className="text-white font-bold text-[13px] mb-3">Input Details</h3>
                {template.fields.map(f => (
                  <div key={f.id} className="mb-3">
                    <label className="text-[10px] text-white/35 uppercase font-bold tracking-widest block mb-1">{f.label}</label>
                    {f.multiline ? (
                      <textarea value={fields[f.id] || ""} onChange={e => setFields(prev => ({ ...prev, [f.id]: e.target.value }))}
                        placeholder={f.placeholder}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-[12.5px] outline-none placeholder:text-white/20 focus:border-primary/40 transition-all resize-none"
                        rows={3} />
                    ) : (
                      <input value={fields[f.id] || ""} onChange={e => setFields(prev => ({ ...prev, [f.id]: e.target.value }))}
                        placeholder={f.placeholder}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-[12.5px] outline-none placeholder:text-white/20 focus:border-primary/40 transition-all" />
                    )}
                  </div>
                ))}
                <button onClick={generate} disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-[13px] transition-all bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-400 hover:to-orange-500 shadow-[0_4px_12px_rgba(245,158,11,0.25)] disabled:opacity-50">
                  {loading ? <FiRefreshCw className="w-4 h-4 animate-spin" /> : <FiZap className="w-4 h-4" />}
                  {loading ? "Generating..." : "Generate with AI"}
                </button>
              </div>
            </div>

            {/* Output */}
            <div className="flex-1 min-w-0">
              {output ? (
                <div className="bg-[#0d0d1e] border border-white/[0.08] rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <span>{tool.emoji}</span>
                      <span className="text-white font-bold text-[13px]">{tool.label}</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Generated</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={copyOutput} className="p-1.5 rounded-lg text-white/30 hover:text-white bg-white/[0.04] transition-all">
                        <FiCopy className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={downloadOutput} className="p-1.5 rounded-lg text-white/30 hover:text-white bg-white/[0.04] transition-all">
                        <FiDownload className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setOutput(null)} className="p-1.5 rounded-lg text-white/30 hover:text-white bg-white/[0.04] transition-all">
                        <FiRefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-5">{renderOutput(output)}</div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/15 flex items-center justify-center">
                    <span className="text-3xl">{tool.emoji}</span>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-bold mb-1">{tool.label}</div>
                    <div className="text-white/35 text-sm max-w-xs">{tool.desc} — fill in the form and click Generate</div>
                  </div>
                  {loading && (
                    <div className="flex items-center gap-2 text-amber-400 text-sm animate-pulse">
                      <FiRefreshCw className="w-4 h-4 animate-spin" /> Generating...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
