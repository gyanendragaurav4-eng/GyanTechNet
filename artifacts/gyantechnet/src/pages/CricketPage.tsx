import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const COMMENTARY = [
  { type:"four",    text:"FOUR! Kohli drives through covers beautifully", ball:"4" },
  { type:"dot",     text:"Dot ball. Good length, defended solidly", ball:"0" },
  { type:"six",     text:"SIX! Sharma pulls it over square leg!", ball:"6" },
  { type:"wicket",  text:"WICKET! Caught behind, departs for 34", ball:"W" },
  { type:"wide",    text:"Wide ball, called by the on-field umpire", ball:"Wd" },
  { type:"runs",    text:"Two runs taken, excellent running between wickets", ball:"2" },
  { type:"noball",  text:"No-ball! Free hit coming up", ball:"NB" },
  { type:"one",     text:"Single taken, rotates strike", ball:"1" },
  { type:"three",   text:"Three runs! Great effort in the outfield", ball:"3" },
  { type:"six",     text:"SIX again! Into the stands! Crowd goes wild", ball:"6" },
  { type:"dot",     text:"Beaten! Outside edge, just misses the stumps", ball:"0" },
  { type:"four",    text:"FOUR! Edged through third man", ball:"4" },
];

const BALL_COLOR: Record<string,string> = {
  four:    "bg-blue-500 text-white",
  six:     "bg-orange-500 text-white",
  wicket:  "bg-red-600 text-white",
  wide:    "bg-amber-500 text-black",
  noball:  "bg-yellow-500 text-black",
  dot:     "bg-white/[0.08] text-white/60",
  runs:    "bg-emerald-600 text-white",
  one:     "bg-emerald-600/70 text-white",
  three:   "bg-teal-500 text-white",
};

type Ball = { type:string; text:string; ball:string; id:number };

const BATSMEN = [
  { name:"V. Kohli",    runs:87, balls:65, fours:9, sixes:4, sr:133.8 },
  { name:"R. Sharma",   runs:54, balls:38, fours:6, sixes:3, sr:142.1 },
];

const BOWLERS = [
  { name:"P. Cummins",    overs:8,  maidens:0, runs:62, wickets:2, econ:7.75 },
  { name:"M. Starc",      overs:6,  maidens:1, runs:41, wickets:3, econ:6.83 },
  { name:"N. Lyon",       overs:5,  maidens:0, runs:38, wickets:1, econ:7.60 },
];

const RECENT_MATCHES = [
  { teams:"IND vs PAK", result:"IND won by 6 wkts", icon:"🏏" },
  { teams:"AUS vs ENG", result:"AUS won by 3 runs", icon:"🏏" },
  { teams:"SA vs NZ",   result:"SA won by 42 runs", icon:"🏏" },
];

export default function CricketPage() {
  const [balls, setBalls]   = useState<Ball[]>([]);
  const [overCount, setOverCount] = useState(0);
  const [score, setScore]   = useState({ runs:287, wickets:6, overs:42.3 });
  const [tab, setTab]       = useState<"live"|"scorecard"|"schedule">("live");
  const [ballCount, setBallCount] = useState(3); // balls in current over

  useEffect(() => {
    const t = setInterval(() => {
      const c = COMMENTARY[Math.floor(Math.random() * COMMENTARY.length)];
      setBalls(prev => [{ ...c, id: Date.now() }, ...prev.slice(0, 29)]);
      setScore(s => {
        const runs = c.type === "six" ? 6 : c.type === "four" ? 4 : c.type === "runs" ? 2 : c.type === "three" ? 3 : c.type === "one" ? 1 : 0;
        const wk = c.type === "wicket" ? 1 : 0;
        return { ...s, runs: s.runs + runs, wickets: Math.min(s.wickets + wk, 10) };
      });
      setBallCount(b => (b + 1) % 6);
      if (ballCount === 5) setOverCount(o => o + 1);
    }, 3000);
    return () => clearInterval(t);
  }, [ballCount]);

  const overDisplay = `${43 + Math.floor(overCount / 6)}.${ballCount}`;

  return (
    <div className="h-full overflow-y-auto no-scrollbar bg-[#06060f]">
      <div className="max-w-3xl mx-auto px-4 py-4">

        {/* Match header */}
        <div className="bg-gradient-to-br from-emerald-900/40 to-teal-900/20 border border-emerald-500/20 rounded-2xl p-5 mb-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjgwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMTYsMTg1LDEyOSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIyMCIvPjwvc3ZnPg==')] opacity-30" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[10px] text-white/40 font-semibold uppercase tracking-widest">ICC World Cup 2026 · Match 42</div>
              <div className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/25 px-2.5 py-1 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                <span className="text-red-300 text-[10px] font-bold">LIVE</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <div className="text-4xl mb-1">🇮🇳</div>
                <div className="text-white font-black text-[24px]">IND</div>
                <div className="text-primary font-black text-[38px] leading-none">{score.runs}/{score.wickets}</div>
                <div className="text-white/40 text-[12px] mt-1">{overDisplay} overs</div>
              </div>

              <div className="px-6 text-center">
                <div className="text-white/40 font-bold text-[13px] mb-1">VS</div>
                <div className="text-white/25 text-[10px]">Target: —</div>
              </div>

              <div className="text-center flex-1">
                <div className="text-4xl mb-1">🇦🇺</div>
                <div className="text-white font-black text-[24px]">AUS</div>
                <div className="text-white/40 font-black text-[38px] leading-none">0/0</div>
                <div className="text-white/40 text-[12px] mt-1">Yet to bat</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.07] rounded-xl p-1 mb-4">
          {(["live","scorecard","schedule"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("flex-1 py-1.5 rounded-lg text-[12px] font-semibold capitalize transition-all",
                tab === t ? "bg-white/[0.1] text-white" : "text-white/35 hover:text-white")}>
              {t === "live" ? "🔴 Live" : t === "scorecard" ? "📊 Scorecard" : "📅 Schedule"}
            </button>
          ))}
        </div>

        {tab === "live" && (
          <>
            {/* Current over balls */}
            {balls.length > 0 && (
              <div className="bg-[#0d0d1e] border border-white/[0.07] rounded-2xl p-4 mb-4">
                <div className="text-[10px] text-white/30 uppercase font-bold tracking-widest mb-3">This Over</div>
                <div className="flex items-center gap-2 flex-wrap">
                  {balls.slice(0, 6).reverse().map((b, i) => (
                    <div key={b.id} className={cn("w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black transition-all",
                      i === balls.slice(0,6).length - 1 ? "ring-2 ring-white/30 scale-110" : "",
                      BALL_COLOR[b.type] || "bg-white/[0.08] text-white/60")}>
                      {b.ball}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Commentary */}
            <div className="bg-[#0d0d1e] border border-white/[0.07] rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <span className="text-white font-bold text-[13px]">Ball-by-Ball Commentary</span>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {balls.length === 0 ? (
                  <div className="text-center py-8 text-white/25 text-[13px]">Loading commentary…</div>
                ) : balls.map(b => (
                  <div key={b.id} className={cn("flex items-start gap-3 px-4 py-3 transition-all",
                    b.type === "wicket" && "bg-red-500/[0.04]",
                    b.type === "six" && "bg-orange-500/[0.04]")}>
                    <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5",
                      BALL_COLOR[b.type] || "bg-white/[0.08] text-white/60")}>
                      {b.ball}
                    </div>
                    <p className={cn("text-[13px] leading-relaxed",
                      b.type === "wicket" ? "text-red-300 font-semibold" : b.type === "six" || b.type === "four" ? "text-amber-300 font-medium" : "text-white/65")}>
                      {b.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === "scorecard" && (
          <div className="space-y-4">
            {/* Batting */}
            <div className="bg-[#0d0d1e] border border-white/[0.07] rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <span className="text-white font-bold text-[13px]">🇮🇳 India Batting</span>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    {["Batter","R","B","4s","6s","SR"].map(h => (
                      <th key={h} className="text-right first:text-left px-4 py-2 text-[10px] text-white/25 font-bold uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {BATSMEN.map((b, i) => (
                    <tr key={i} className="border-b border-white/[0.04] last:border-0">
                      <td className="px-4 py-3">
                        <div className="text-white/80 text-[13px] font-medium">{b.name}</div>
                        <div className="text-white/30 text-[10px]">batting *</div>
                      </td>
                      <td className="px-4 py-3 text-right text-white font-bold text-[13px]">{b.runs}</td>
                      <td className="px-4 py-3 text-right text-white/50 text-[12px]">{b.balls}</td>
                      <td className="px-4 py-3 text-right text-white/50 text-[12px]">{b.fours}</td>
                      <td className="px-4 py-3 text-right text-white/50 text-[12px]">{b.sixes}</td>
                      <td className="px-4 py-3 text-right text-emerald-400 text-[12px] font-semibold">{b.sr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bowling */}
            <div className="bg-[#0d0d1e] border border-white/[0.07] rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <span className="text-white font-bold text-[13px]">🇦🇺 Australia Bowling</span>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    {["Bowler","O","M","R","W","Econ"].map(h => (
                      <th key={h} className="text-right first:text-left px-4 py-2 text-[10px] text-white/25 font-bold uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {BOWLERS.map((b, i) => (
                    <tr key={i} className="border-b border-white/[0.04] last:border-0">
                      <td className="px-4 py-3 text-white/80 text-[13px] font-medium">{b.name}</td>
                      <td className="px-4 py-3 text-right text-white/50 text-[12px]">{b.overs}</td>
                      <td className="px-4 py-3 text-right text-white/50 text-[12px]">{b.maidens}</td>
                      <td className="px-4 py-3 text-right text-white/50 text-[12px]">{b.runs}</td>
                      <td className="px-4 py-3 text-right text-primary font-bold text-[13px]">{b.wickets}</td>
                      <td className="px-4 py-3 text-right text-amber-400 text-[12px] font-semibold">{b.econ}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "schedule" && (
          <div className="bg-[#0d0d1e] border border-white/[0.07] rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <span className="text-white font-bold text-[13px]">Recent Matches</span>
            </div>
            {RECENT_MATCHES.map((m, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.04] last:border-0">
                <div className="text-2xl">{m.icon}</div>
                <div>
                  <div className="text-white/80 font-semibold text-[13px]">{m.teams}</div>
                  <div className="text-white/40 text-[11px] mt-0.5">{m.result}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
