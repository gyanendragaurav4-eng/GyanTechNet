import { useState, useEffect, useRef } from "react";
import { FiPlay, FiPause, FiSkipForward, FiRotateCcw, FiZap, FiCheck, FiX, FiPlus } from "react-icons/fi";
import { cn } from "@/lib/utils";

const TIMER_MODES = [
  { id:"focus",  label:"Focus",      duration:25*60, color:"#7c3aed", emoji:"🧠" },
  { id:"short",  label:"Short Break",duration:5*60,  color:"#10b981", emoji:"☕" },
  { id:"long",   label:"Long Break", duration:15*60, color:"#3b82f6", emoji:"🌿" },
  { id:"custom", label:"Custom",     duration:45*60, color:"#f59e0b", emoji:"⚙️" },
];

const AMBIENT_SOUNDS = [
  { id:"silence", label:"Silence",     emoji:"🤫" },
  { id:"rain",    label:"Rain",         emoji:"🌧️" },
  { id:"forest",  label:"Forest",       emoji:"🌲" },
  { id:"cafe",    label:"Café",         emoji:"☕" },
  { id:"waves",   label:"Ocean",        emoji:"🌊" },
  { id:"fire",    label:"Fireplace",    emoji:"🔥" },
];

const QUICK_TASKS = [
  "Deep work session",
  "Code review",
  "Write documentation",
  "Design exploration",
  "Email responses",
];

type Session = { mode: string; duration: number; completed: boolean; ts: number };

const STORAGE_KEY = "gyan_focus_sessions";

function loadSessions(): Session[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveSessions(s: Session[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s.slice(0, 50))); } catch { /* ignore */ }
}

export default function FocusTimerPage() {
  const [modeId, setModeId] = useState("focus");
  const [customMinutes, setCustomMinutes] = useState(45);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [activeSound, setActiveSound] = useState("silence");
  const [currentTask, setCurrentTask] = useState("");
  const [taskInput, setTaskInput] = useState("");
  const [sessions, setSessions] = useState<Session[]>(loadSessions);
  const [showCompleted, setShowCompleted] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const initialDurationRef = useRef<number>(25 * 60);

  const currentMode = TIMER_MODES.find(m => m.id === modeId) || TIMER_MODES[0];
  const totalDuration = modeId === "custom" ? customMinutes * 60 : currentMode.duration;

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            // Session completed
            const s: Session = { mode: currentMode.label, duration: totalDuration, completed: true, ts: Date.now() };
            setSessions(prev2 => { const updated = [s, ...prev2]; saveSessions(updated); return updated; });
            if (modeId === "focus") {
              setCompletedPomodoros(p => p + 1);
              setPomodoroCount(p => p + 1);
            }
            // Play a notification if possible
            try { new Notification("🎉 Session complete!", { body: `${currentMode.label} session done!` }); } catch { /* ignore */ }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, modeId, currentMode.label, totalDuration]);

  const switchMode = (id: string) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setModeId(id);
    const m = TIMER_MODES.find(t => t.id === id);
    const d = id === "custom" ? customMinutes * 60 : (m?.duration || 25 * 60);
    setTimeLeft(d);
    initialDurationRef.current = d;
  };

  const toggleTimer = () => {
    if (!running) {
      initialDurationRef.current = timeLeft;
      Notification.requestPermission().catch(() => {});
    }
    setRunning(r => !r);
  };

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    const m = TIMER_MODES.find(t => t.id === modeId);
    const d = modeId === "custom" ? customMinutes * 60 : (m?.duration || 25 * 60);
    setTimeLeft(d);
  };

  const skip = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    const nextMode = modeId === "focus"
      ? (completedPomodoros > 0 && completedPomodoros % 4 === 3 ? "long" : "short")
      : "focus";
    switchMode(nextMode);
  };

  const formatTime = (s: number) => `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;
  const progress = 1 - timeLeft / totalDuration;
  const circumference = 2 * Math.PI * 100;
  const strokeDashoffset = circumference * (1 - progress);

  const todaySessions = sessions.filter(s => new Date(s.ts).toDateString() === new Date().toDateString());
  const todayFocusMin = todaySessions.filter(s => s.mode === "Focus").reduce((acc, s) => acc + Math.floor(s.duration / 60), 0);

  return (
    <div className="flex flex-col lg:flex-row h-full bg-[#06060f] overflow-hidden">

      {/* Main timer */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none transition-all duration-1000"
            style={{ background: `${currentMode.color}22`, opacity: running ? 1 : 0.4 }} />
        </div>

        {/* Mode selector */}
        <div className="flex items-center gap-2 mb-8 bg-white/[0.04] rounded-2xl p-1 border border-white/[0.08] z-10">
          {TIMER_MODES.map(m => (
            <button key={m.id} onClick={() => switchMode(m.id)}
              className={cn("flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all",
                modeId === m.id ? "text-white shadow-[0_0_12px_rgba(0,0,0,0.3)]" : "text-white/35 hover:text-white/70")}
              style={modeId === m.id ? { background: m.color + "30", border: `1px solid ${m.color}50` } : {}}>
              <span>{m.emoji}</span>
              <span className="hidden sm:inline">{m.label}</span>
            </button>
          ))}
        </div>

        {/* Current task */}
        {currentTask ? (
          <div className="flex items-center gap-2 mb-6 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.09] z-10">
            <span className="text-sm text-white/70 font-medium">{currentTask}</span>
            <button onClick={() => setCurrentTask("")} className="p-0.5 text-white/30 hover:text-white transition-colors">
              <FiX className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-6 z-10">
            <input value={taskInput} onChange={e => setTaskInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && taskInput.trim()) { setCurrentTask(taskInput.trim()); setTaskInput(""); } }}
              placeholder="What are you working on?"
              className="bg-white/[0.04] border border-white/[0.07] rounded-xl px-4 py-2 text-white text-[13px] outline-none placeholder:text-white/20 focus:border-white/[0.15] transition-all w-56 text-center" />
          </div>
        )}

        {/* SVG timer ring */}
        <div className="relative mb-8 z-10">
          <svg width="240" height="240" viewBox="0 0 240 240">
            {/* Background track */}
            <circle cx="120" cy="120" r="100" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
            {/* Progress arc */}
            <circle cx="120" cy="120" r="100" fill="none"
              stroke={currentMode.color}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 120 120)"
              style={{ transition: "stroke-dashoffset 1s linear", filter: `drop-shadow(0 0 8px ${currentMode.color}66)` }}
            />
            {/* Dots on track */}
            {[0,1,2,3].map(i => {
              const angle = (i / 4) * 360 - 90;
              const x = 120 + 100 * Math.cos(angle * Math.PI / 180);
              const y = 120 + 100 * Math.sin(angle * Math.PI / 180);
              return <circle key={i} cx={x} cy={y} r="3" fill="rgba(255,255,255,0.15)" />;
            })}
          </svg>

          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-[52px] font-black text-white tabular-nums leading-none tracking-tight"
              style={{ textShadow: `0 0 30px ${currentMode.color}44` }}>
              {formatTime(timeLeft)}
            </div>
            <div className="text-white/30 text-sm font-medium mt-1">{currentMode.emoji} {currentMode.label}</div>
            {running && (
              <div className="flex items-center gap-1.5 mt-2">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: currentMode.color }} />
                <span className="text-[10px] font-medium" style={{ color: currentMode.color }}>In Progress</span>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mb-6 z-10">
          <button onClick={reset}
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white/30 hover:text-white bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all active:scale-95">
            <FiRotateCcw className="w-4 h-4" />
          </button>
          <button onClick={toggleTimer}
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white transition-all active:scale-95 shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${currentMode.color}, ${currentMode.color}bb)`, boxShadow: `0 4px 24px ${currentMode.color}44` }}>
            {running ? <FiPause className="w-7 h-7" /> : <FiPlay className="w-7 h-7 ml-0.5" />}
          </button>
          <button onClick={skip}
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white/30 hover:text-white bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all active:scale-95">
            <FiSkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Pomodoro dots */}
        <div className="flex items-center gap-2 mb-5 z-10">
          {Array.from({length: 4}).map((_, i) => (
            <div key={i} className={cn("w-2.5 h-2.5 rounded-full border transition-all",
              i < (completedPomodoros % 4)
                ? "border-primary/60" : "border-white/[0.12] bg-transparent")}
              style={i < (completedPomodoros % 4) ? { background: currentMode.color, boxShadow: `0 0 6px ${currentMode.color}` } : {}} />
          ))}
          <span className="text-white/25 text-[11px] ml-1">{completedPomodoros} today</span>
        </div>

        {/* Ambient sounds */}
        <div className="flex items-center gap-1.5 z-10">
          {AMBIENT_SOUNDS.map(s => (
            <button key={s.id} onClick={() => setActiveSound(s.id)} title={s.label}
              className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all",
                activeSound === s.id ? "bg-white/[0.12] border border-white/[0.2]" : "text-white/30 hover:bg-white/[0.06] hover:text-white/60")}>
              {s.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:w-72 shrink-0 border-t lg:border-t-0 lg:border-l border-white/[0.06] bg-[#08081a] flex flex-col max-h-64 lg:max-h-none overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center p-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <div className="text-white font-black text-lg">{todayFocusMin}</div>
              <div className="text-white/30 text-[9px]">min focused</div>
            </div>
            <div className="text-center p-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <div className="text-white font-black text-lg">{completedPomodoros}</div>
              <div className="text-white/30 text-[9px]">pomodoros</div>
            </div>
            <div className="text-center p-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <div className="text-white font-black text-lg">{todaySessions.length}</div>
              <div className="text-white/30 text-[9px]">sessions</div>
            </div>
          </div>
          {/* Quick tasks */}
          <div className="text-[10px] text-white/25 uppercase font-bold tracking-widest mb-1.5">Quick Tasks</div>
          <div className="flex flex-wrap gap-1">
            {QUICK_TASKS.map(t => (
              <button key={t} onClick={() => setCurrentTask(t)}
                className="text-[10px] px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.07] text-white/45 hover:text-white hover:bg-white/[0.08] transition-all">
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-2">
          <div className="text-[10px] text-white/25 uppercase font-bold tracking-widest mb-2">Session History</div>
          {sessions.slice(0, 10).map((s, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5 border-b border-white/[0.03]">
              <FiCheck className="w-3 h-3 text-emerald-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-white/60 text-[11px] font-medium">{s.mode}</span>
              </div>
              <span className="text-white/25 text-[10px]">{Math.floor(s.duration/60)}m</span>
              <span className="text-white/20 text-[9px]">{new Date(s.ts).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</span>
            </div>
          ))}
          {sessions.length === 0 && <div className="text-white/20 text-[11px] py-4 text-center">No sessions yet — start focusing!</div>}
        </div>
      </div>
    </div>
  );
}
