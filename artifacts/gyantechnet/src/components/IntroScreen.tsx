import { useEffect, useState, useRef } from "react";

const PARTICLES = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.5 + 0.5,
  delay: Math.random() * 2,
  dur: Math.random() * 3 + 2,
  opacity: Math.random() * 0.6 + 0.2,
}));

const GRID_LINES_H = Array.from({ length: 10 }, (_, i) => i);
const GRID_LINES_V = Array.from({ length: 16 }, (_, i) => i);

const TAGLINES = [
  "17 AI Models · Infinite Parallel",
  "50+ Workspace Tools · One Platform",
  "The Father of Multitasking AI",
];

export default function IntroScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [taglineIdx, setTaglineIdx] = useState(0);
  const [exiting, setExiting] = useState(false);
  const progRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Phase timeline ── */
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 200);   // grid fades in
    const t2 = setTimeout(() => setPhase(2), 700);   // logo burst
    const t3 = setTimeout(() => setPhase(3), 1400);  // name reveal
    const t4 = setTimeout(() => setPhase(4), 2100);  // tagline cycling
    const t5 = setTimeout(() => setPhase(5), 2600);  // progress bar
    return () => [t1,t2,t3,t4,t5].forEach(clearTimeout);
  }, []);

  /* ── Tagline cycling ── */
  useEffect(() => {
    if (phase < 4) return;
    let idx = 0;
    const iv = setInterval(() => {
      idx = (idx + 1) % TAGLINES.length;
      setTaglineIdx(idx);
    }, 600);
    return () => clearInterval(iv);
  }, [phase]);

  /* ── Progress bar ── */
  useEffect(() => {
    if (phase < 5) return;
    progRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(progRef.current!);
          return 100;
        }
        return p + 1.8;
      });
    }, 22);
    return () => clearInterval(progRef.current!);
  }, [phase]);

  /* ── Exit when progress hits 100 ── */
  useEffect(() => {
    if (progress < 100) return;
    const t = setTimeout(() => {
      setExiting(true);
      setTimeout(onDone, 650);
    }, 120);
    return () => clearTimeout(t);
  }, [progress, onDone]);

  const skip = () => {
    clearInterval(progRef.current!);
    setExiting(true);
    setTimeout(onDone, 500);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-hidden flex items-center justify-center select-none"
      style={{
        background: "#000008",
        transition: exiting ? "opacity 0.6s ease, transform 0.6s ease" : undefined,
        opacity: exiting ? 0 : 1,
        transform: exiting ? "scale(1.06)" : "scale(1)",
      }}
    >
      {/* ── Animated grid ── */}
      <div
        className="absolute inset-0"
        style={{
          transition: "opacity 1s ease",
          opacity: phase >= 1 ? 1 : 0,
        }}
      >
        {GRID_LINES_H.map(i => (
          <div key={`h${i}`} className="absolute w-full"
            style={{
              top: `${(i + 1) * 10}%`,
              height: "1px",
              background: "linear-gradient(90deg, transparent 0%, rgba(124,58,237,0.15) 50%, transparent 100%)",
            }} />
        ))}
        {GRID_LINES_V.map(i => (
          <div key={`v${i}`} className="absolute h-full"
            style={{
              left: `${(i + 1) * 6.25}%`,
              width: "1px",
              background: "linear-gradient(180deg, transparent 0%, rgba(124,58,237,0.12) 50%, transparent 100%)",
            }} />
        ))}
      </div>

      {/* ── Particles ── */}
      {phase >= 1 && PARTICLES.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.id % 3 === 0 ? "rgba(124,58,237,0.8)" : p.id % 3 === 1 ? "rgba(236,72,153,0.7)" : "rgba(6,182,212,0.7)",
            opacity: p.opacity,
            animation: `float-particle ${p.dur}s ${p.delay}s ease-in-out infinite alternate`,
            boxShadow: `0 0 ${p.size * 3}px currentColor`,
          }}
        />
      ))}

      {/* ── Central ambient glow ── */}
      <div
        className="absolute"
        style={{
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(124,58,237,0.25) 0%, rgba(236,72,153,0.08) 50%, transparent 75%)",
          filter: "blur(60px)",
          transition: "opacity 0.8s ease, transform 1.2s ease",
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? "scale(1)" : "scale(0.4)",
        }}
      />

      {/* ── Main content ── */}
      <div className="relative z-10 flex flex-col items-center gap-6">

        {/* Logo ring + icon */}
        <div
          className="relative flex items-center justify-center"
          style={{
            transition: "opacity 0.5s ease, transform 0.7s cubic-bezier(0.34,1.56,0.64,1)",
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? "scale(1)" : "scale(0.2)",
          }}
        >
          {/* Outer rotating ring */}
          <div
            className="absolute rounded-full border-2"
            style={{
              width: "140px",
              height: "140px",
              borderColor: "rgba(124,58,237,0.3)",
              borderTopColor: "rgba(124,58,237,0.9)",
              borderRightColor: "rgba(236,72,153,0.6)",
              animation: "spin-slow 3s linear infinite",
            }}
          />
          {/* Middle pulse ring */}
          <div
            className="absolute rounded-full border"
            style={{
              width: "116px",
              height: "116px",
              borderColor: "rgba(124,58,237,0.15)",
              animation: "pulse-ring 2s ease-in-out infinite",
            }}
          />
          {/* Inner glow disc */}
          <div
            className="absolute rounded-full"
            style={{
              width: "90px",
              height: "90px",
              background: "radial-gradient(circle, rgba(124,58,237,0.4) 0%, rgba(124,58,237,0.1) 70%, transparent 100%)",
              filter: "blur(6px)",
              animation: "pulse-glow 2s ease-in-out infinite",
            }}
          />
          {/* Logo image */}
          <div
            className="relative rounded-full overflow-hidden"
            style={{
              width: "80px",
              height: "80px",
              boxShadow: "0 0 40px rgba(124,58,237,0.8), 0 0 80px rgba(124,58,237,0.3)",
            }}
          >
            <img src="/gyan-logo.jpg" alt="GyanTechNet" className="w-full h-full object-cover" />
          </div>

          {/* Orbit dots */}
          {[0, 60, 120, 180, 240, 300].map((deg, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: i % 2 === 0 ? "6px" : "4px",
                height: i % 2 === 0 ? "6px" : "4px",
                background: i % 3 === 0 ? "#7c3aed" : i % 3 === 1 ? "#ec4899" : "#06b6d4",
                boxShadow: `0 0 8px ${i % 3 === 0 ? "#7c3aed" : i % 3 === 1 ? "#ec4899" : "#06b6d4"}`,
                transformOrigin: "50% 50%",
                transform: `rotate(${deg}deg) translateX(70px)`,
                animation: `orbit ${2.5 + i * 0.1}s linear infinite`,
              }}
            />
          ))}
        </div>

        {/* Brand name */}
        <div
          style={{
            transition: "opacity 0.6s ease, transform 0.8s cubic-bezier(0.34,1.56,0.64,1)",
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? "translateY(0)" : "translateY(30px)",
          }}
        >
          <div className="text-center">
            <div
              className="font-black tracking-tight leading-none"
              style={{
                fontSize: "clamp(36px, 7vw, 64px)",
                background: "linear-gradient(135deg, #ffffff 0%, #c084fc 40%, #f0abfc 70%, #ffffff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 20px rgba(192,132,252,0.5))",
              }}
            >
              GYANTECHNET
            </div>
            <div
              className="flex items-center justify-center gap-2 mt-2"
              style={{
                transition: "opacity 0.6s ease 0.3s",
                opacity: phase >= 3 ? 1 : 0,
              }}
            >
              <div style={{ width: "30px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.6))" }} />
              <span
                className="text-[11px] font-black uppercase tracking-[0.35em]"
                style={{ color: "rgba(192,132,252,0.7)" }}
              >
                AI Platform
              </span>
              <div style={{ width: "30px", height: "1px", background: "linear-gradient(90deg, rgba(124,58,237,0.6), transparent)" }} />
            </div>
          </div>
        </div>

        {/* Tagline cycling */}
        <div
          className="h-6 flex items-center"
          style={{
            transition: "opacity 0.5s ease",
            opacity: phase >= 4 ? 1 : 0,
          }}
        >
          <div
            key={taglineIdx}
            className="text-[13px] font-semibold text-center"
            style={{
              color: "rgba(255,255,255,0.45)",
              animation: "fade-in-up 0.4s ease forwards",
              letterSpacing: "0.05em",
            }}
          >
            {TAGLINES[taglineIdx]}
          </div>
        </div>

        {/* Progress bar */}
        <div
          className="flex flex-col items-center gap-3"
          style={{
            transition: "opacity 0.5s ease",
            opacity: phase >= 5 ? 1 : 0,
            width: "240px",
          }}
        >
          {/* Bar track */}
          <div
            className="w-full rounded-full overflow-hidden"
            style={{ height: "2px", background: "rgba(255,255,255,0.07)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #7c3aed, #ec4899, #06b6d4)",
                boxShadow: "0 0 10px rgba(124,58,237,0.8), 0 0 20px rgba(236,72,153,0.4)",
                transition: "width 0.05s linear",
              }}
            />
          </div>
          <div
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.2)" }}
          >
            {progress < 100 ? "Initializing AI Systems…" : "Ready"}
          </div>
        </div>
      </div>

      {/* ── Skip button ── */}
      <button
        onClick={skip}
        className="absolute bottom-6 right-6"
        style={{
          fontSize: "11px",
          fontWeight: 700,
          color: "rgba(255,255,255,0.18)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          padding: "6px 14px",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "100px",
          background: "rgba(255,255,255,0.03)",
          cursor: "pointer",
          transition: "color 0.2s, border-color 0.2s",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.55)";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.2)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.18)";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)";
        }}
      >
        Skip intro ›
      </button>

      {/* ── Keyframe styles ── */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes orbit {
          from { transform: rotate(var(--start, 0deg)) translateX(70px) rotate(calc(-1 * var(--start, 0deg))); }
          to   { transform: rotate(calc(var(--start, 0deg) + 360deg)) translateX(70px) rotate(calc(-1 * (var(--start, 0deg) + 360deg))); }
        }
        @keyframes pulse-ring {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50%       { transform: scale(1.06); opacity: 0.9; }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.1); }
        }
        @keyframes float-particle {
          from { transform: translate(0, 0); }
          to   { transform: translate(${Math.random() > 0.5 ? "" : "-"}${(Math.random() * 14 + 4).toFixed(0)}px, ${Math.random() > 0.5 ? "" : "-"}${(Math.random() * 14 + 4).toFixed(0)}px); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
