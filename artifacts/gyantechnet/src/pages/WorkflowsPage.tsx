import { useState, useCallback } from "react";
import { FiPlay, FiPlus, FiX, FiZap, FiArrowRight, FiCheck, FiClock, FiRefreshCw, FiCopy, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { cn } from "@/lib/utils";

type StepType = "ai-chat" | "ai-research" | "ai-code" | "ai-summarize" | "ai-translate" | "ai-creative" | "ai-analyze";

type WorkflowStep = {
  id: string;
  type: StepType;
  label: string;
  prompt: string;
  model: string;
  mode: string;
  output?: string;
  status: "idle" | "running" | "done" | "error";
};

type WorkflowTemplate = {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  color: string;
  steps: Omit<WorkflowStep, "id" | "output" | "status">[];
};

const MODELS = [
  { id: "openai/gpt-4o-mini",          label: "Gyan AI Fast" },
  { id: "openai/gpt-4o",               label: "Gyan AI Pro" },
  { id: "anthropic/claude-sonnet-4.6", label: "Gyan Smart" },
  { id: "google/gemini-3.1-flash-lite", label: "Gyan Flash" },
  { id: "deepseek/deepseek-v3.2",       label: "Gyan Deep" },
  { id: "mistralai/mistral-large-2512", label: "Gyan Max" },
];

const STEP_TYPES: Record<StepType, { emoji: string; color: string; label: string }> = {
  "ai-chat":      { emoji: "💬", color: "#7c3aed", label: "AI Chat" },
  "ai-research":  { emoji: "🔬", color: "#2563eb", label: "Research" },
  "ai-code":      { emoji: "💻", color: "#059669", label: "Code" },
  "ai-summarize": { emoji: "📝", color: "#d97706", label: "Summarize" },
  "ai-translate": { emoji: "🌐", color: "#db2777", label: "Translate" },
  "ai-creative":  { emoji: "🎨", color: "#7c3aed", label: "Creative" },
  "ai-analyze":   { emoji: "📊", color: "#0891b2", label: "Analyze" },
};

const MODE_MAP: Record<StepType, string> = {
  "ai-chat":      "Normal",
  "ai-research":  "Research",
  "ai-code":      "Code",
  "ai-summarize": "Summarize",
  "ai-translate": "Translate",
  "ai-creative":  "Creative",
  "ai-analyze":   "Business",
};

const TEMPLATES: WorkflowTemplate[] = [
  {
    id: "research-write",
    name: "Research & Write",
    desc: "Deep research → structured article → proofread",
    emoji: "📰",
    color: "from-blue-600 to-violet-700",
    steps: [
      { type:"ai-research",  label:"Deep Research",    prompt:"Research this topic comprehensively with key facts and insights: {{input}}", model:"openai/gpt-4o-mini", mode:"Research" },
      { type:"ai-chat",      label:"Structure Article", prompt:"Based on the research above, write a well-structured article with introduction, main sections, and conclusion.", model:"openai/gpt-4o-mini", mode:"Normal" },
      { type:"ai-summarize", label:"Executive Summary",prompt:"Summarize the article above into a concise executive summary (3-4 sentences).", model:"openai/gpt-4o-mini", mode:"Summarize" },
    ],
  },
  {
    id: "code-review",
    name: "Code & Review",
    desc: "Write code → review → optimize → document",
    emoji: "💻",
    color: "from-emerald-600 to-teal-700",
    steps: [
      { type:"ai-code",   label:"Write Code",     prompt:"Write clean, well-structured code for: {{input}}", model:"openai/gpt-4o-mini", mode:"Code" },
      { type:"ai-analyze",label:"Code Review",    prompt:"Review the code above. Identify bugs, security issues, and improvements.", model:"openai/gpt-4o-mini", mode:"Business" },
      { type:"ai-code",   label:"Optimize",       prompt:"Optimize the original code based on the review above. Return only the improved code.", model:"openai/gpt-4o-mini", mode:"Code" },
    ],
  },
  {
    id: "business-plan",
    name: "Business Plan",
    desc: "Idea → strategy → pitch → financial outline",
    emoji: "💼",
    color: "from-amber-600 to-orange-700",
    steps: [
      { type:"ai-analyze", label:"Market Analysis",  prompt:"Analyze the market opportunity for: {{input}}", model:"openai/gpt-4o-mini", mode:"Business" },
      { type:"ai-chat",    label:"Business Strategy",prompt:"Based on the market analysis, create a detailed business strategy.", model:"openai/gpt-4o-mini", mode:"Business" },
      { type:"ai-creative",label:"Pitch Deck",       prompt:"Create a compelling 10-slide pitch deck outline based on the strategy above.", model:"openai/gpt-4o-mini", mode:"Creative" },
    ],
  },
  {
    id: "content-machine",
    name: "Content Machine",
    desc: "Topic → blog post → social media → SEO tags",
    emoji: "📢",
    color: "from-pink-600 to-rose-700",
    steps: [
      { type:"ai-research",  label:"Topic Research", prompt:"Research trending angles and key points for content about: {{input}}", model:"openai/gpt-4o-mini", mode:"Research" },
      { type:"ai-creative",  label:"Blog Post",      prompt:"Write an engaging 800-word blog post based on the research above.", model:"openai/gpt-4o-mini", mode:"Creative" },
      { type:"ai-chat",      label:"Social Media",   prompt:"Create 5 social media posts (Twitter/LinkedIn/Instagram) promoting the blog post above.", model:"openai/gpt-4o-mini", mode:"Normal" },
      { type:"ai-summarize", label:"SEO Summary",    prompt:"Generate 10 SEO keywords and a 150-character meta description for the blog post.", model:"openai/gpt-4o-mini", mode:"Summarize" },
    ],
  },
  {
    id: "learn-master",
    name: "Learn & Master",
    desc: "Topic → explain → quiz → study guide",
    emoji: "🎓",
    color: "from-violet-600 to-indigo-700",
    steps: [
      { type:"ai-research",  label:"Deep Explanation",prompt:"Explain {{input}} in depth — concepts, mechanisms, and real-world examples.", model:"openai/gpt-4o-mini", mode:"Research" },
      { type:"ai-chat",      label:"Key Concepts",   prompt:"List the 10 most important concepts from the explanation above with brief definitions.", model:"openai/gpt-4o-mini", mode:"Normal" },
      { type:"ai-creative",  label:"Study Quiz",     prompt:"Create a 10-question quiz based on the concepts above, with answers.", model:"openai/gpt-4o-mini", mode:"Creative" },
    ],
  },
  {
    id: "translate-adapt",
    name: "Translate & Adapt",
    desc: "Original → translate → cultural adapt → localize",
    emoji: "🌍",
    color: "from-cyan-600 to-blue-700",
    steps: [
      { type:"ai-translate", label:"Translate",      prompt:"Translate the following text to the target language accurately: {{input}}", model:"openai/gpt-4o-mini", mode:"Translate" },
      { type:"ai-chat",      label:"Cultural Adapt", prompt:"Culturally adapt the translated text above to feel natural to native speakers.", model:"openai/gpt-4o-mini", mode:"Normal" },
    ],
  },
];

function mkStep(type: StepType = "ai-chat"): WorkflowStep {
  return {
    id: Math.random().toString(36).slice(2),
    type,
    label: STEP_TYPES[type].label,
    prompt: "",
    model: "openai/gpt-4o-mini",
    mode: MODE_MAP[type],
    status: "idle",
  };
}

async function runStep(step: WorkflowStep, previousOutput: string): Promise<string> {
  const prompt = step.prompt.replace("{{input}}", previousOutput);
  const messages = [{ role: "user", content: prompt }];
  if (previousOutput && !step.prompt.includes("{{input}}")) {
    messages.unshift({ role: "user", content: `Context from previous step:\n${previousOutput}` });
  }

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, mode: step.mode, model: step.model }),
  });
  const data = await res.json();
  return data.content || data.error || "No response";
}

function StepCard({ step, idx, total, onUpdate, onRemove }: {
  step: WorkflowStep; idx: number; total: number;
  onUpdate: (u: Partial<WorkflowStep>) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(idx === 0);
  const info = STEP_TYPES[step.type];
  const statusIcon = step.status === "running" ? <FiRefreshCw className="w-3 h-3 animate-spin text-blue-400" />
    : step.status === "done" ? <FiCheck className="w-3 h-3 text-emerald-400" />
    : step.status === "error" ? <span className="text-red-400 text-[10px]">⚠</span>
    : <FiClock className="w-3 h-3 text-white/20" />;

  return (
    <div className={cn(
      "bg-[#0d0d1e] border rounded-xl overflow-hidden transition-all",
      step.status === "running" ? "border-blue-500/40 shadow-[0_0_20px_rgba(37,99,235,0.15)]"
        : step.status === "done" ? "border-emerald-500/30"
        : step.status === "error" ? "border-red-500/30"
        : "border-white/[0.08]"
    )}>
      {/* Step header */}
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-sm"
          style={{ background: `${info.color}22`, border: `1px solid ${info.color}44` }}>
          {info.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-bold text-sm truncate">{step.label || `Step ${idx + 1}`}</div>
          <div className="text-white/35 text-[11px]">{info.label} · {step.model.split("/").pop()}</div>
        </div>
        {statusIcon}
        {idx < total - 1 && (
          <FiArrowRight className="w-3 h-3 text-white/20 shrink-0" />
        )}
        {expanded ? <FiChevronUp className="w-3.5 h-3.5 text-white/30" /> : <FiChevronDown className="w-3.5 h-3.5 text-white/30" />}
        <button onClick={e => { e.stopPropagation(); onRemove(); }}
          className="p-1 text-white/20 hover:text-red-400 transition-colors">
          <FiX className="w-3 h-3" />
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/[0.06]">
          <div className="pt-3 grid grid-cols-3 gap-2">
            <div className="col-span-1">
              <label className="text-[10px] text-white/30 font-semibold uppercase tracking-wide block mb-1">Step Type</label>
              <select value={step.type} onChange={e => {
                const t = e.target.value as StepType;
                onUpdate({ type: t, mode: MODE_MAP[t], label: STEP_TYPES[t].label });
              }} className="w-full bg-white/[0.05] border border-white/[0.09] rounded-lg px-2 py-1.5 text-white text-xs outline-none" style={{ colorScheme: "dark" }}>
                {(Object.keys(STEP_TYPES) as StepType[]).map(t => (
                  <option key={t} value={t}>{STEP_TYPES[t].emoji} {STEP_TYPES[t].label}</option>
                ))}
              </select>
            </div>
            <div className="col-span-1">
              <label className="text-[10px] text-white/30 font-semibold uppercase tracking-wide block mb-1">Model</label>
              <select value={step.model} onChange={e => onUpdate({ model: e.target.value })}
                className="w-full bg-white/[0.05] border border-white/[0.09] rounded-lg px-2 py-1.5 text-white text-xs outline-none" style={{ colorScheme: "dark" }}>
                {MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </div>
            <div className="col-span-1">
              <label className="text-[10px] text-white/30 font-semibold uppercase tracking-wide block mb-1">Label</label>
              <input value={step.label} onChange={e => onUpdate({ label: e.target.value })}
                className="w-full bg-white/[0.05] border border-white/[0.09] rounded-lg px-2 py-1.5 text-white text-xs outline-none placeholder:text-white/20"
                placeholder="Step name..." />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-white/30 font-semibold uppercase tracking-wide block mb-1">
              Prompt <span className="text-violet-400 normal-case font-normal">· use {"{{input}}"} for workflow input or previous step output</span>
            </label>
            <textarea value={step.prompt} onChange={e => onUpdate({ prompt: e.target.value })}
              rows={3} placeholder={`Enter prompt for this step... Use {{input}} to inject the user's original input.`}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs outline-none resize-none placeholder:text-white/20 focus:border-violet-500/40" />
          </div>
          {step.output && (
            <div className="bg-black/30 border border-white/[0.07] rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wide">Output</div>
                <button onClick={() => navigator.clipboard.writeText(step.output!).catch(() => {})}
                  className="text-white/30 hover:text-white/60 transition-colors">
                  <FiCopy className="w-3 h-3" />
                </button>
              </div>
              <div className="text-white/70 text-xs leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto no-scrollbar">
                {step.output}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function WorkflowsPage() {
  const [steps, setSteps] = useState<WorkflowStep[]>([mkStep("ai-research"), mkStep("ai-summarize")]);
  const [userInput, setUserInput] = useState("");
  const [running, setRunning] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [tab, setTab] = useState<"builder" | "templates" | "history">("templates");
  const [history, setHistory] = useState<{ ts: number; name: string; steps: WorkflowStep[] }[]>([]);

  const updateStep = (id: string, updates: Partial<WorkflowStep>) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const loadTemplate = (t: WorkflowTemplate) => {
    setActiveTemplate(t.id);
    setSteps(t.steps.map(s => ({ ...s, id: Math.random().toString(36).slice(2), output: undefined, status: "idle" })));
    setTab("builder");
  };

  const runWorkflow = useCallback(async () => {
    if (!userInput.trim() || running || steps.length === 0) return;
    setRunning(true);
    const workingSteps: WorkflowStep[] = steps.map(s => ({ ...s, output: undefined, status: "idle" as const }));
    setSteps(workingSteps);

    let previousOutput = userInput.trim();
    const finalSteps: WorkflowStep[] = [...workingSteps];

    for (let i = 0; i < finalSteps.length; i++) {
      finalSteps[i] = { ...finalSteps[i], status: "running" as const };
      setSteps([...finalSteps]);
      try {
        const output = await runStep(finalSteps[i], previousOutput);
        finalSteps[i] = { ...finalSteps[i], status: "done" as const, output };
        previousOutput = output;
      } catch {
        finalSteps[i] = { ...finalSteps[i], status: "error" as const, output: "⚠️ Step failed" };
        break;
      }
      setSteps([...finalSteps]);
    }

    const templateName = TEMPLATES.find(t => t.id === activeTemplate)?.name ?? "Custom Workflow";
    setHistory(h => [{ ts: Date.now(), name: templateName, steps: finalSteps }, ...h].slice(0, 20));
    setRunning(false);
  }, [userInput, running, steps, activeTemplate]);

  const doneCount = steps.filter(s => s.status === "done").length;
  const progress = steps.length > 0 ? (doneCount / steps.length) * 100 : 0;

  return (
    <div className="h-full flex flex-col bg-[#06060f] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.07] shrink-0 bg-[#08081a]">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/25">
          <FiZap className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <h1 className="text-white font-black text-base leading-none">AI Workflows</h1>
          <p className="text-white/30 text-[10px]">Chain AI tasks into powerful automated pipelines</p>
        </div>
        <div className="flex-1" />
        <div className="flex gap-1 bg-white/[0.04] border border-white/[0.08] rounded-lg p-1">
          {(["templates","builder","history"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("px-3 py-1 rounded text-[11px] font-semibold capitalize transition-all",
                tab === t ? "bg-violet-500/20 text-violet-300" : "text-white/40 hover:text-white")}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-5">

        {/* Templates tab */}
        {tab === "templates" && (
          <div>
            <div className="text-white font-bold mb-4">Pre-built Workflows</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => loadTemplate(t)}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all hover:-translate-y-0.5 hover:shadow-lg",
                    activeTemplate === t.id
                      ? "border-violet-500/50 bg-violet-500/[0.08] shadow-[0_0_20px_rgba(124,58,237,0.15)]"
                      : "border-white/[0.08] bg-[#0d0d1e] hover:border-white/[0.15]"
                  )}>
                  <div className={`h-16 rounded-lg bg-gradient-to-br ${t.color} flex items-center justify-center text-3xl mb-3`}>
                    {t.emoji}
                  </div>
                  <div className="text-white font-bold text-sm mb-1">{t.name}</div>
                  <div className="text-white/40 text-xs mb-3">{t.desc}</div>
                  <div className="flex flex-wrap gap-1">
                    {t.steps.map((s, i) => (
                      <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.06] text-[10px] text-white/40">
                        {STEP_TYPES[s.type].emoji}
                        <span>{s.label}</span>
                        {i < t.steps.length - 1 && <FiArrowRight className="w-2.5 h-2.5" />}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Builder tab */}
        {tab === "builder" && (
          <div className="max-w-2xl mx-auto space-y-5">
            {/* Input */}
            <div className="bg-[#0d0d1e] border border-white/[0.08] rounded-xl p-4">
              <label className="text-[11px] text-white/40 font-bold uppercase tracking-wide block mb-2">
                Workflow Input <span className="text-white/20 normal-case font-normal">— this becomes {"{{input}}"} in your steps</span>
              </label>
              <textarea value={userInput} onChange={e => setUserInput(e.target.value)}
                rows={3} placeholder="Enter your topic, code, text, or question..."
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm outline-none resize-none placeholder:text-white/20 focus:border-violet-500/40" />
            </div>

            {/* Steps */}
            <div className="space-y-3">
              {steps.map((step, i) => (
                <div key={step.id}>
                  {i > 0 && (
                    <div className="flex items-center justify-center py-1">
                      <div className="flex flex-col items-center gap-0.5">
                        <div className="w-0.5 h-3 bg-white/10 rounded-full" />
                        <FiArrowRight className="w-3.5 h-3.5 text-white/20 rotate-90" />
                        <div className="w-0.5 h-3 bg-white/10 rounded-full" />
                      </div>
                    </div>
                  )}
                  <StepCard
                    step={step} idx={i} total={steps.length}
                    onUpdate={u => updateStep(step.id, u)}
                    onRemove={() => setSteps(p => p.filter(s => s.id !== step.id))}
                  />
                </div>
              ))}
            </div>

            {/* Add step + Run */}
            <div className="flex items-center gap-3">
              <button onClick={() => setSteps(p => [...p, mkStep()])}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-white/50 hover:text-white text-sm transition-all border border-white/[0.07]">
                <FiPlus className="w-4 h-4" /> Add Step
              </button>
              <div className="flex-1" />
              <button onClick={runWorkflow} disabled={!userInput.trim() || running || steps.length === 0}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                  userInput.trim() && !running
                    ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:from-violet-500 hover:to-blue-500 shadow-[0_4px_16px_rgba(124,58,237,0.4)]"
                    : "bg-white/[0.05] text-white/25"
                )}>
                {running ? <FiRefreshCw className="w-4 h-4 animate-spin" /> : <FiPlay className="w-4 h-4" />}
                {running ? `Running (${doneCount}/${steps.length})` : "Run Workflow"}
              </button>
            </div>

            {/* Progress bar */}
            {running && (
              <div className="bg-white/[0.04] rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-600 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
        )}

        {/* History tab */}
        {tab === "history" && (
          <div className="max-w-2xl mx-auto">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-5xl mb-3">📋</div>
                <div className="text-white/40 text-sm">No workflow runs yet</div>
                <div className="text-white/20 text-xs mt-1">Run a workflow to see history here</div>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((h, i) => (
                  <div key={i} className="bg-[#0d0d1e] border border-white/[0.08] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-white font-bold text-sm">{h.name}</div>
                        <div className="text-white/30 text-[11px]">{new Date(h.ts).toLocaleString()}</div>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-emerald-400">
                        <FiCheck className="w-3 h-3" />
                        {h.steps.filter(s => s.status === "done").length}/{h.steps.length} steps
                      </div>
                    </div>
                    <div className="space-y-2">
                      {h.steps.map((s, j) => s.output && (
                        <div key={j} className="bg-black/20 rounded-lg p-3">
                          <div className="text-[10px] text-white/30 font-bold mb-1">{STEP_TYPES[s.type].emoji} {s.label}</div>
                          <div className="text-white/60 text-xs leading-relaxed line-clamp-2">{s.output}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
