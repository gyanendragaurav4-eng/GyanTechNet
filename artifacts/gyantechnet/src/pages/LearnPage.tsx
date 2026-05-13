import { useState } from "react";
import {
  FiBook, FiStar, FiPlay, FiChevronRight, FiZap, FiCheck, FiRefreshCw,
  FiAward, FiTrendingUp, FiClock, FiBookmark,
} from "react-icons/fi";
import { cn } from "@/lib/utils";

const COURSES = [
  { id:1, cat:"AI & ML",      color:"from-violet-600 to-purple-700", icon:"🧠", title:"Prompt Engineering Mastery",     desc:"Master the art of crafting precise, effective prompts for any AI model — from basic to advanced chain-of-thought techniques.", rating:4.9, lessons:8,  duration:"4h 30m", progress:60, level:"Intermediate" },
  { id:2, cat:"Development",  color:"from-blue-600 to-cyan-700",     icon:"💻", title:"Full Stack with React & Node",   desc:"Build production-grade web apps using React, Node.js, Express, PostgreSQL, and modern deployment practices.", rating:4.8, lessons:12, duration:"8h 15m", progress:35, level:"Advanced" },
  { id:3, cat:"Business",     color:"from-amber-500 to-orange-600",  icon:"📈", title:"Digital Marketing with AI",      desc:"Use AI tools to supercharge your marketing — content creation, SEO optimisation, ad copy, and campaign analytics.", rating:4.7, lessons:6,  duration:"3h 20m", progress:0,  level:"Beginner" },
  { id:4, cat:"Design",       color:"from-pink-600 to-rose-700",     icon:"🎨", title:"UI/UX Design Principles",        desc:"Master design fundamentals — typography, colour theory, Figma workflows, and building beautiful accessible interfaces.", rating:4.9, lessons:9,  duration:"5h 45m", progress:75, level:"Intermediate" },
  { id:5, cat:"AI & ML",      color:"from-emerald-600 to-teal-700",  icon:"🤖", title:"LLM Fine-tuning & RAG",          desc:"Deep dive into fine-tuning large language models, RAG architectures, vector databases, and production AI systems.", rating:4.8, lessons:10, duration:"6h 00m", progress:20, level:"Expert" },
  { id:6, cat:"Data",         color:"from-cyan-600 to-blue-700",     icon:"📊", title:"Data Science with Python",      desc:"From pandas and NumPy to machine learning with scikit-learn. Build real data pipelines and visualisations.", rating:4.7, lessons:11, duration:"7h 30m", progress:0,  level:"Intermediate" },
];

const CATEGORIES = ["All","AI & ML","Development","Design","Business","Data"];

const ACHIEVEMENTS = [
  { icon:"🏆", title:"First Lesson",    desc:"Completed your first lesson", earned:true },
  { icon:"🔥", title:"5-Day Streak",    desc:"5 consecutive days of learning", earned:true },
  { icon:"⚡", title:"Fast Learner",    desc:"Complete 3 lessons in one day", earned:false },
  { icon:"🎯", title:"Course Complete", desc:"Finish any full course", earned:false },
];

const LEVEL_STYLE: Record<string,string> = {
  Beginner:     "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Intermediate: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  Advanced:     "text-orange-400 bg-orange-500/10 border-orange-500/20",
  Expert:       "text-red-400 bg-red-500/10 border-red-500/20",
};

export default function LearnPage() {
  const [catFilter, setCatFilter] = useState("All");
  const [tab, setTab] = useState<"courses"|"progress"|"achievements">("courses");
  const [activeCourse, setActiveCourse] = useState<typeof COURSES[0] | null>(null);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState<string|null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const filtered = COURSES.filter(c => catFilter === "All" || c.cat === catFilter);
  const inProgress = COURSES.filter(c => c.progress > 0 && c.progress < 100);
  const enrolled   = COURSES.length;
  const avgProgress = Math.round(COURSES.reduce((a, c) => a + c.progress, 0) / COURSES.length);

  const askAI = async () => {
    if (!aiQuestion.trim()) return;
    setAiLoading(true); setAiAnswer(null);
    try {
      const context = activeCourse ? `For the course "${activeCourse.title}" (${activeCourse.cat}):` : "As a learning tutor:";
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role:"user", content:`${context} ${aiQuestion}` }],
          mode: "Research", model: "openai/gpt-4o-mini",
        }),
      });
      const data = await res.json();
      setAiAnswer(data.content || "Could not get answer.");
    } catch { setAiAnswer("Connection error."); }
    setAiLoading(false);
    setAiQuestion("");
  };

  return (
    <div className="flex h-full bg-[#06060f] overflow-hidden">

      {/* Course detail */}
      {activeCourse && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0d0d1e] border border-white/[0.1] rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className={cn("h-32 relative flex items-end px-5 pb-5 bg-gradient-to-r", activeCourse.color)}>
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative z-10">
                <div className="text-4xl mb-2">{activeCourse.icon}</div>
                <h2 className="text-white font-black text-xl">{activeCourse.title}</h2>
                <div className="flex items-center gap-3 text-white/70 text-[12px] mt-1">
                  <span>{activeCourse.cat}</span>
                  <span>·</span>
                  <span>{activeCourse.lessons} lessons</span>
                  <span>·</span>
                  <span>{activeCourse.duration}</span>
                </div>
              </div>
              <button onClick={() => setActiveCourse(null)} className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/30 text-white/70 hover:text-white z-10">
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white/50 text-[12px]">Progress</span>
                  <span className="text-white font-bold text-[12px]">{activeCourse.progress}%</span>
                </div>
                <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all"
                    style={{ width: `${activeCourse.progress}%` }} />
                </div>
              </div>

              <p className="text-white/65 text-[13.5px] leading-relaxed">{activeCourse.desc}</p>

              {/* AI Tutor */}
              <div className="bg-violet-500/[0.07] border border-violet-500/15 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FiZap className="w-4 h-4 text-violet-400" />
                  <span className="text-violet-300 font-bold text-[13px]">AI Tutor — Ask anything about this course</span>
                </div>
                {aiAnswer && (
                  <div className="text-white/70 text-[12.5px] leading-relaxed bg-white/[0.04] rounded-xl p-3 mb-3 whitespace-pre-wrap">{aiAnswer}</div>
                )}
                <div className="flex items-center gap-2">
                  <input value={aiQuestion} onChange={e => setAiQuestion(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") askAI(); }}
                    placeholder="Ask the AI tutor a question..."
                    className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-[12.5px] outline-none placeholder:text-white/20" />
                  <button onClick={askAI} disabled={aiLoading || !aiQuestion.trim()}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-violet-600/20 text-violet-300 text-[12px] font-bold hover:bg-violet-600/30 disabled:opacity-30 border border-violet-500/20 transition-all">
                    {aiLoading ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FiZap className="w-3.5 h-3.5" />}
                    Ask
                  </button>
                </div>
              </div>

              <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:from-violet-500 hover:to-blue-500 shadow-[0_4px_12px_rgba(124,58,237,0.3)] transition-all">
                <FiPlay className="w-4 h-4" /> Continue Learning
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-white/[0.06] bg-[#08081a] shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
              <FiBook className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-white font-black text-[15px] leading-none">GyanLearn</h1>
              <p className="text-white/30 text-[10px]">AI-powered learning platform</p>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] rounded-xl p-1">
              {(["courses","progress","achievements"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={cn("px-3 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition-all",
                    tab === t ? "bg-white/[0.1] text-white" : "text-white/35 hover:text-white")}>
                  {t === "courses" ? "Courses" : t === "progress" ? "Progress" : "🏆"}
                </button>
              ))}
            </div>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label:"Enrolled",    value:enrolled,         color:"text-white" },
              { label:"In Progress", value:inProgress.length,color:"text-blue-400" },
              { label:"Avg Progress",value:`${avgProgress}%`,color:"text-emerald-400" },
              { label:"Streak 🔥",   value:"5 days",         color:"text-amber-400" },
            ].map(s => (
              <div key={s.label} className="text-center py-2 px-1 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <div className={cn("font-black text-[15px]", s.color)}>{s.value}</div>
                <div className="text-white/25 text-[9px]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {tab === "courses" && (
            <div className="px-4 py-4">
              {/* Category filter */}
              <div className="flex gap-1.5 mb-4 overflow-x-auto no-scrollbar">
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setCatFilter(c)}
                    className={cn("shrink-0 px-3 py-1.5 rounded-full text-[11.5px] font-semibold transition-all",
                      catFilter === c ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/25" : "text-white/35 hover:text-white bg-white/[0.03] border border-white/[0.06]")}>
                    {c}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filtered.map(c => (
                  <button key={c.id} onClick={() => setActiveCourse(c)}
                    className="bg-[#0d0d1e] border border-white/[0.07] rounded-2xl overflow-hidden hover:border-white/[0.15] transition-all text-left group active:scale-[0.99]">
                    {/* Card top */}
                    <div className={cn("h-20 flex items-center justify-center bg-gradient-to-r relative overflow-hidden", c.color)}>
                      <div className="absolute inset-0 bg-black/20" />
                      <span className="text-4xl relative z-10 group-hover:scale-110 transition-transform">{c.icon}</span>
                      <div className="absolute top-2 right-2 z-10">
                        <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full border", LEVEL_STYLE[c.level])}>
                          {c.level}
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[9px] text-white/30 font-semibold uppercase tracking-widest">{c.cat}</span>
                        <span className="text-white/20 text-[9px]">·</span>
                        <div className="flex items-center gap-0.5 text-amber-400 text-[10px]">
                          <FiStar className="w-2.5 h-2.5" /> {c.rating}
                        </div>
                      </div>
                      <h3 className="text-white font-bold text-[13px] leading-snug mb-1.5 group-hover:text-violet-200 transition-colors">{c.title}</h3>
                      <p className="text-white/40 text-[11px] leading-relaxed mb-3 line-clamp-2">{c.desc}</p>

                      <div className="flex items-center gap-3 text-[10px] text-white/30 mb-3">
                        <div className="flex items-center gap-1"><FiBook className="w-3 h-3" /> {c.lessons} lessons</div>
                        <div className="flex items-center gap-1"><FiClock className="w-3 h-3" /> {c.duration}</div>
                      </div>

                      {/* Progress bar */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-white/30">Progress</span>
                          <span className="text-[10px] font-bold text-white/60">{c.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${c.progress}%`, background: `linear-gradient(90deg, #7c3aed, #2563eb)` }} />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <div className={cn("flex items-center gap-1.5 flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all text-center justify-center",
                          c.progress > 0 ? "bg-violet-500/15 text-violet-300 border border-violet-500/20" : "bg-white/[0.06] text-white/50 border border-white/[0.08]")}>
                          {c.progress > 0 ? <FiPlay className="w-3 h-3" /> : <FiPlay className="w-3 h-3" />}
                          {c.progress > 0 ? "Continue" : "Start"}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === "progress" && (
            <div className="px-5 py-5 max-w-2xl mx-auto">
              <div className="text-[11px] text-white/25 uppercase font-bold tracking-widest mb-4">In Progress</div>
              {inProgress.length === 0 && (
                <div className="text-center py-8 text-white/30">No courses in progress yet — start learning!</div>
              )}
              {inProgress.map(c => (
                <div key={c.id} className="bg-[#0d0d1e] border border-white/[0.07] rounded-2xl p-4 mb-3 flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 bg-gradient-to-br", c.color)}>
                    {c.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-bold text-[13px] mb-1">{c.title}</div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-1.5 flex-1 bg-white/[0.06] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${c.progress}%`, background: "linear-gradient(90deg, #7c3aed, #2563eb)" }} />
                      </div>
                      <span className="text-white/50 text-[11px] font-bold shrink-0">{c.progress}%</span>
                    </div>
                    <div className="text-white/30 text-[10px]">{c.lessons} lessons · {c.duration}</div>
                  </div>
                  <button onClick={() => setActiveCourse(c)} className="px-3 py-1.5 rounded-xl bg-violet-500/15 text-violet-300 text-[11px] font-bold border border-violet-500/20 hover:bg-violet-500/25 transition-all shrink-0">
                    Continue
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === "achievements" && (
            <div className="px-5 py-5 max-w-2xl mx-auto">
              <div className="text-[11px] text-white/25 uppercase font-bold tracking-widest mb-4">Achievements</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {ACHIEVEMENTS.map(a => (
                  <div key={a.title} className={cn(
                    "flex flex-col items-center p-4 rounded-2xl border text-center transition-all",
                    a.earned ? "bg-amber-500/[0.07] border-amber-500/20" : "bg-white/[0.02] border-white/[0.06] opacity-50"
                  )}>
                    <span className="text-3xl mb-2">{a.icon}</span>
                    <div className="text-white font-bold text-[12px] mb-1">{a.title}</div>
                    <div className="text-white/40 text-[10px]">{a.desc}</div>
                    {a.earned && <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-400 font-bold"><FiCheck className="w-3 h-3" /> Earned</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
