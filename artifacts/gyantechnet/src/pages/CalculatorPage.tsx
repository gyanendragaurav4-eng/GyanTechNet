import { useState } from "react";
import { FiHash } from "react-icons/fi";
import { cn } from "@/lib/utils";

const CALC_MODES = [
  { id:"basic",   label:"Basic",         emoji:"🔢" },
  { id:"sci",     label:"Scientific",    emoji:"🧪" },
  { id:"emi",     label:"EMI Calc",      emoji:"🏦" },
  { id:"bmi",     label:"BMI",           emoji:"⚖️" },
  { id:"unit",    label:"Unit Converter",emoji:"📐" },
];

const BASIC_BUTTONS = [
  ["AC","Del","%","÷"],
  ["7","8","9","×"],
  ["4","5","6","-"],
  ["1","2","3","+"],
  ["0",".","±","="],
];

const SCI_EXTRA = ["sin","cos","tan","π","√","x²","xʸ","log","ln","1/x","(",")","EXP"];

const BTN_COLOR = (b: string) => {
  if (["÷","×","-","+","="].includes(b)) return "bg-primary text-white hover:bg-primary/90 shadow-[0_2px_8px_rgba(124,58,237,0.3)]";
  if (["AC","Del"].includes(b)) return "bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/20";
  if (["%","±","(",")",].includes(b)) return "bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 border border-violet-500/15";
  if (["sin","cos","tan","π","√","x²","xʸ","log","ln","1/x","EXP"].includes(b)) return "bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 border border-blue-500/15 text-[11px]";
  return "bg-white/[0.06] text-white hover:bg-white/[0.1] border border-white/[0.07]";
};

function EMICalc() {
  const [principal, setPrincipal] = useState("500000");
  const [rate, setRate]           = useState("8.5");
  const [tenure, setTenure]       = useState("60");

  const p = parseFloat(principal) || 0;
  const r = parseFloat(rate) / 100 / 12;
  const n = parseFloat(tenure) || 1;
  const emi = r > 0 ? (p * r * Math.pow(1+r,n)) / (Math.pow(1+r,n)-1) : p/n;
  const total = emi * n;
  const interest = total - p;

  return (
    <div className="w-full max-w-sm space-y-4">
      <h3 className="text-white font-black text-[16px]">EMI Calculator</h3>
      {[
        { label:"Loan Amount (₹)", val:principal, set:setPrincipal, placeholder:"500000" },
        { label:"Interest Rate (%/yr)", val:rate, set:setRate, placeholder:"8.5" },
        { label:"Tenure (months)",  val:tenure, set:setTenure, placeholder:"60" },
      ].map(f => (
        <div key={f.label}>
          <label className="text-[10px] text-white/30 uppercase font-bold tracking-widest block mb-1">{f.label}</label>
          <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
            className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl px-3 py-2.5 text-white text-[14px] font-mono outline-none focus:border-primary/40 transition-all" />
        </div>
      ))}
      <div className="grid grid-cols-3 gap-3 pt-2">
        {[
          { label:"Monthly EMI",    value:`₹${emi.toLocaleString("en-IN",{maximumFractionDigits:0})}`,   color:"text-primary" },
          { label:"Total Interest", value:`₹${interest.toLocaleString("en-IN",{maximumFractionDigits:0})}`, color:"text-amber-400" },
          { label:"Total Payment",  value:`₹${total.toLocaleString("en-IN",{maximumFractionDigits:0})}`,  color:"text-emerald-400" },
        ].map(s => (
          <div key={s.label} className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-3 text-center">
            <div className={cn("text-[15px] font-black leading-tight", s.color)}>{s.value}</div>
            <div className="text-[9px] text-white/25 font-bold mt-1 uppercase">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BMICalc() {
  const [weight, setWeight] = useState("70");
  const [height, setHeight] = useState("170");

  const h = parseFloat(height) / 100;
  const bmi = h > 0 ? parseFloat(weight) / (h * h) : 0;
  const bmiRounded = bmi.toFixed(1);

  const category = bmi < 18.5 ? { label:"Underweight", color:"text-blue-400" }
    : bmi < 25 ? { label:"Normal Weight", color:"text-emerald-400" }
    : bmi < 30 ? { label:"Overweight", color:"text-amber-400" }
    : { label:"Obese", color:"text-red-400" };

  const pct = Math.min((bmi / 40) * 100, 100);

  return (
    <div className="w-full max-w-sm space-y-4">
      <h3 className="text-white font-black text-[16px]">BMI Calculator</h3>
      {[
        { label:"Weight (kg)", val:weight, set:setWeight },
        { label:"Height (cm)", val:height, set:setHeight },
      ].map(f => (
        <div key={f.label}>
          <label className="text-[10px] text-white/30 uppercase font-bold tracking-widest block mb-1">{f.label}</label>
          <input value={f.val} onChange={e => f.set(e.target.value)}
            className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl px-3 py-2.5 text-white text-[14px] font-mono outline-none focus:border-primary/40 transition-all" />
        </div>
      ))}
      <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5 text-center">
        <div className="text-[48px] font-black text-white mb-1">{bmiRounded}</div>
        <div className={cn("text-[14px] font-bold", category.color)}>{category.label}</div>
        <div className="mt-4 h-2 bg-white/[0.08] rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 via-emerald-500 via-amber-500 to-red-500 transition-all" style={{ width:`${pct}%` }} />
        </div>
        <div className="flex justify-between text-[9px] text-white/20 mt-1 font-bold">
          {["< 18.5","18.5–24.9","25–29.9","30+"].map(l => <span key={l}>{l}</span>)}
        </div>
      </div>
    </div>
  );
}

function UnitConverter() {
  const [val, setVal]   = useState("1");
  const [from, setFrom] = useState("km");
  const [to, setTo]     = useState("miles");

  const CONVERSIONS: Record<string, Record<string, number>> = {
    km:     { km:1, miles:0.621371, meters:1000, feet:3280.84, inches:39370.1 },
    miles:  { km:1.60934, miles:1, meters:1609.34, feet:5280, inches:63360 },
    meters: { km:0.001, miles:0.000621, meters:1, feet:3.28084, inches:39.3701 },
    feet:   { km:0.0003048, miles:0.000189394, meters:0.3048, feet:1, inches:12 },
    inches: { km:0.0000254, miles:0.0000157828, meters:0.0254, feet:0.0833333, inches:1 },
  };

  const result = CONVERSIONS[from]?.[to] ? (parseFloat(val) * CONVERSIONS[from][to]).toFixed(4) : "—";
  const units = Object.keys(CONVERSIONS);

  return (
    <div className="w-full max-w-sm space-y-4">
      <h3 className="text-white font-black text-[16px]">Unit Converter</h3>
      <div>
        <label className="text-[10px] text-white/30 uppercase font-bold tracking-widest block mb-1">Value</label>
        <input value={val} onChange={e => setVal(e.target.value)}
          className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl px-3 py-2.5 text-white text-[14px] font-mono outline-none focus:border-primary/40 transition-all" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[["From", from, setFrom],["To", to, setTo]].map(([label, val, setter]) => (
          <div key={label as string}>
            <label className="text-[10px] text-white/30 uppercase font-bold tracking-widest block mb-1">{label as string}</label>
            <select value={val as string} onChange={e => (setter as (v:string)=>void)(e.target.value)}
              className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl px-3 py-2.5 text-white text-[13px] outline-none" style={{ colorScheme:"dark" }}>
              {units.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
        ))}
      </div>
      <div className="bg-primary/[0.08] border border-primary/20 rounded-2xl p-5 text-center">
        <div className="text-[11px] text-white/35 uppercase font-bold tracking-widest mb-1">{val} {from} =</div>
        <div className="text-[36px] font-black text-white">{result}</div>
        <div className="text-[13px] text-primary font-bold">{to}</div>
      </div>
    </div>
  );
}

export default function CalculatorPage() {
  const [display, setDisplay]   = useState("0");
  const [equation, setEquation] = useState("");
  const [mode, setMode]         = useState("basic");
  const [history, setHistory]   = useState<string[]>([]);

  const handleInput = (val: string) => {
    if (val === "AC") { setDisplay("0"); setEquation(""); return; }
    if (val === "Del") { setDisplay(p => p.length > 1 ? p.slice(0, -1) : "0"); return; }
    if (val === "=") {
      try {
        const eq = equation + display;
        const sanitized = eq.replace(/×/g,"*").replace(/÷/g,"/").replace(/π/g,"3.14159265").replace(/√(\d+)/g,"Math.sqrt($1)");
        // eslint-disable-next-line no-eval
        const result = String(eval(sanitized));
        setHistory(h => [`${eq} = ${result}`, ...h.slice(0,9)]);
        setEquation(""); setDisplay(result);
      } catch { setDisplay("Error"); }
      return;
    }
    if (["+","-","×","÷"].includes(val)) { setEquation(p => p + display + val); setDisplay("0"); return; }
    if (val === "±") { setDisplay(p => p.startsWith("-") ? p.slice(1) : "-" + p); return; }
    if (val === "%") { setDisplay(p => String(parseFloat(p) / 100)); return; }
    if (val === "π") { setDisplay("3.14159265"); return; }
    if (val === "x²") { setDisplay(p => String(parseFloat(p) ** 2)); return; }
    if (val === "√") { setDisplay(p => String(Math.sqrt(parseFloat(p)))); return; }
    if (val === "log") { setDisplay(p => String(Math.log10(parseFloat(p)))); return; }
    if (val === "ln")  { setDisplay(p => String(Math.log(parseFloat(p)))); return; }
    if (val === "1/x") { setDisplay(p => String(1 / parseFloat(p))); return; }
    if (val === "sin") { setDisplay(p => String(Math.sin(parseFloat(p) * Math.PI/180))); return; }
    if (val === "cos") { setDisplay(p => String(Math.cos(parseFloat(p) * Math.PI/180))); return; }
    if (val === "tan") { setDisplay(p => String(Math.tan(parseFloat(p) * Math.PI/180))); return; }
    setDisplay(p => p === "0" ? val : p + val);
  };

  return (
    <div className="flex h-full bg-[#06060f] overflow-hidden">
      {/* Sidebar */}
      <div className="hidden sm:flex w-48 shrink-0 bg-[#08081a] border-r border-white/[0.06] flex-col p-3">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-xl bg-primary/20 flex items-center justify-center">
            <FiHash className="w-3.5 h-3.5 text-primary" />
          </div>
          <h2 className="text-white font-bold text-[13px]">GyanCalc</h2>
        </div>
        <div className="space-y-0.5">
          {CALC_MODES.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className={cn("w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12.5px] font-medium transition-all",
                mode === m.id ? "bg-primary/12 text-primary" : "text-white/40 hover:bg-white/[0.04] hover:text-white")}>
              <span className="text-[14px]">{m.emoji}</span> {m.label}
            </button>
          ))}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-auto border-t border-white/[0.06] pt-3">
            <div className="text-[9px] text-white/25 uppercase font-bold tracking-widest mb-1.5">History</div>
            {history.slice(0,5).map((h,i) => (
              <div key={i} className="text-[10.5px] text-white/35 font-mono py-0.5 truncate hover:text-white/60 transition-colors cursor-default">{h}</div>
            ))}
          </div>
        )}
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#06060f]">
        {/* Mobile mode tabs */}
        <div className="sm:hidden flex gap-1.5 overflow-x-auto no-scrollbar pb-3 w-full max-w-sm">
          {CALC_MODES.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className={cn("px-2.5 py-1.5 rounded-xl text-[10.5px] font-bold whitespace-nowrap shrink-0 border transition-all",
                mode === m.id ? "bg-primary text-white border-primary/50" : "border-white/[0.1] text-white/35 hover:text-white bg-white/[0.04]")}>
              {m.emoji} {m.label}
            </button>
          ))}
        </div>

        <div className="absolute w-[400px] h-[400px] bg-primary/[0.04] rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-sm">
          {(mode === "basic" || mode === "sci") && (
            <div className="bg-[#0d0d20] border border-white/[0.09] rounded-[28px] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
              {/* Display */}
              <div className="bg-[#070710] border border-white/[0.06] rounded-2xl px-5 py-4 mb-4">
                <div className="text-right text-[12px] text-white/30 font-mono mb-1 min-h-[16px] tracking-widest">{equation}</div>
                <div className="text-right text-[40px] font-light text-white font-mono overflow-x-auto no-scrollbar tabular-nums leading-none">
                  {display}
                </div>
              </div>

              {/* Scientific extras */}
              {mode === "sci" && (
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {SCI_EXTRA.map(b => (
                    <button key={b} onClick={() => handleInput(b)}
                      className={cn("h-10 flex items-center justify-center rounded-xl text-[11px] font-bold transition-all active:scale-95", BTN_COLOR(b))}>
                      {b}
                    </button>
                  ))}
                </div>
              )}

              {/* Main keypad */}
              <div className="grid grid-cols-4 gap-2">
                {BASIC_BUTTONS.map((row, ri) =>
                  row.map((btn, ci) => {
                    const isWide = btn === "0" && ri === 4;
                    return (
                      <button key={`${ri}-${ci}`} onClick={() => handleInput(btn)}
                        className={cn(
                          "h-14 flex items-center justify-center rounded-2xl text-[18px] font-semibold transition-all active:scale-95 select-none",
                          isWide && "col-span-2",
                          BTN_COLOR(btn),
                        )}>
                        {btn}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {mode === "emi"  && <EMICalc />}
          {mode === "bmi"  && <BMICalc />}
          {mode === "unit" && <UnitConverter />}
        </div>
      </div>
    </div>
  );
}
