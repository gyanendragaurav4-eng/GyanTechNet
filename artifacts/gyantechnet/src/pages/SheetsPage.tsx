import { useState, useCallback } from "react";
import { FiTable, FiDownload, FiZap, FiPlus, FiRefreshCw, FiX } from "react-icons/fi";
import { cn } from "@/lib/utils";

const COLS = ["A","B","C","D","E","F","G","H","I","J"];
const ROWS_COUNT = 25;

const INITIAL_DATA: Record<string, string> = {
  "A1":"MONTH","B1":"REVENUE","C1":"EXPENSES","D1":"PROFIT","E1":"GROWTH%","F1":"TARGET","G1":"VARIANCE",
  "A2":"Jan", "B2":"₹45,000", "C2":"₹32,000", "D2":"₹13,000", "E2":"—",      "F2":"₹50,000","G2":"₹-5,000",
  "A3":"Feb", "B3":"₹52,000", "C3":"₹33,500", "D3":"₹18,500", "E3":"42.3%",  "F3":"₹55,000","G3":"₹-3,000",
  "A4":"Mar", "B4":"₹61,000", "C4":"₹35,000", "D4":"₹26,000", "E4":"40.5%",  "F4":"₹60,000","G4":"₹1,000",
  "A5":"Apr", "B5":"₹58,000", "C5":"₹36,200", "D5":"₹21,800", "E5":"-16.2%", "F5":"₹65,000","G5":"₹-7,000",
  "A6":"May", "B6":"₹72,000", "C6":"₹38,000", "D6":"₹34,000", "E6":"56.0%",  "F6":"₹70,000","G6":"₹2,000",
  "A7":"Jun", "B7":"₹89,000", "C7":"₹41,500", "D7":"₹47,500", "E7":"39.7%",  "F7":"₹80,000","G7":"₹9,000",
};

const SHEETS = ["Financial 2026","Q1 Report","Budget"];

export default function SheetsPage() {
  const [data, setData]             = useState<Record<string,string>>(INITIAL_DATA);
  const [selected, setSelected]     = useState("B2");
  const [input, setInput]           = useState(INITIAL_DATA["B2"] || "");
  const [activeSheet, setActiveSheet] = useState("Financial 2026");
  const [aiLoading, setAiLoading]   = useState(false);
  const [aiPrompt, setAiPrompt]     = useState("");
  const [showAI, setShowAI]         = useState(false);
  const [editCell, setEditCell]     = useState<string|null>(null);

  const selectCell = useCallback((id: string) => {
    setSelected(id);
    setInput(data[id] || "");
    setEditCell(null);
  }, [data]);

  const commitInput = () => {
    setData(d => ({ ...d, [selected]: input }));
    setEditCell(null);
  };

  const getHeader = (colIdx: number) => INITIAL_DATA[`${COLS[colIdx]}1`] || "";
  const isHeaderCol = (colIdx: number) => colIdx < 7;

  const getCellColor = (cellId: string): string => {
    const row = parseInt(cellId.slice(1));
    const col = cellId.charAt(0);
    if (row === 1) return "bg-white/[0.05] text-white/70 font-bold text-[11px] uppercase tracking-wide";
    const val = data[cellId] || "";
    if (col === "D" && val.startsWith("₹")) {
      const n = parseFloat(val.replace(/[^0-9.-]/g,""));
      if (n > 30000) return "text-emerald-400";
      if (n > 15000) return "text-blue-400";
      return "text-white/70";
    }
    if (col === "E") {
      if (val.includes("-")) return "text-red-400";
      if (val && val !== "—") return "text-emerald-400";
    }
    if (col === "G") {
      if (val.includes("-")) return "text-red-400";
      if (val && val !== "—") return "text-emerald-400";
    }
    return "text-white/70";
  };

  const aiFormula = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          messages:[{ role:"user", content:`For a spreadsheet with columns ${COLS.join(",")} and headers: ${Object.entries(INITIAL_DATA).filter(([k])=>k.endsWith("1")).map(([k,v])=>`${k}=${v}`).join(", ")}, answer: "${aiPrompt}". Give a short helpful answer or Excel/Sheets formula. Be concise.` }],
          mode:"Code", model:"openai/gpt-4o-mini",
        }),
      });
      const d = await res.json();
      const answer = d.content || "";
      if (answer) setInput(answer.split("\n")[0].replace(/^=?/, "=").slice(0, 50));
      setShowAI(false); setAiPrompt("");
    } catch { /* ignore */ }
    setAiLoading(false);
  };

  const exportCSV = () => {
    const rows = [COLS.map((c) => data[`${c}1`] || c).join(",")];
    for (let r = 2; r <= ROWS_COUNT; r++) {
      rows.push(COLS.map(c => data[`${c}${r}`] || "").join(","));
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([rows.join("\n")], {type:"text/csv"}));
    a.download = `${activeSheet}.csv`; a.click();
  };

  return (
    <div className="flex flex-col h-full bg-[#06060f] overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-white/[0.06] bg-[#08081a] shrink-0">
        <div className="flex items-center px-3 py-2 border-b border-white/[0.05] gap-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-600/20 flex items-center justify-center shrink-0">
            <FiTable className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <input defaultValue="Financial Projections 2026"
            className="bg-transparent border-none text-white text-[14px] font-semibold focus:outline-none flex-1 min-w-0" />
          <div className="flex items-center gap-1.5">
            <button onClick={() => setShowAI(v => !v)}
              className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all",
                showAI ? "bg-violet-500/15 text-violet-300 border-violet-500/20" : "bg-white/[0.04] text-white/45 border-white/[0.07] hover:text-white")}>
              <FiZap className="w-3 h-3" /> AI Formula
            </button>
            <button onClick={exportCSV}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] text-white/45 text-[11px] border border-white/[0.07] hover:text-white transition-all">
              <FiDownload className="w-3 h-3" /> CSV
            </button>
          </div>
        </div>

        {/* AI formula bar */}
        {showAI && (
          <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.05] bg-violet-500/[0.04]">
            <FiZap className="w-3.5 h-3.5 text-violet-400 shrink-0" />
            <input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") aiFormula(); }}
              placeholder="Ask AI to generate a formula (e.g. 'calculate total profit for all months')..."
              className="flex-1 bg-transparent text-white text-[12.5px] outline-none placeholder:text-white/25" />
            <button onClick={aiFormula} disabled={aiLoading || !aiPrompt.trim()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-violet-600/20 text-violet-300 text-[11px] font-bold disabled:opacity-30 border border-violet-500/20 hover:bg-violet-600/30 transition-all">
              {aiLoading ? <FiRefreshCw className="w-3 h-3 animate-spin" /> : <FiZap className="w-3 h-3" />}
              {aiLoading ? "..." : "Generate"}
            </button>
            <button onClick={() => setShowAI(false)} className="p-1 text-white/25 hover:text-white"><FiX className="w-3 h-3" /></button>
          </div>
        )}

        {/* Format bar */}
        <div className="flex items-center px-3 py-1.5 gap-1.5 text-white/30">
          {[["B","font-bold"],["I","italic"],["U","underline"]].map(([l,cls]) => (
            <button key={l} className={cn("w-6 h-6 rounded text-[11px] flex items-center justify-center hover:bg-white/[0.08] hover:text-white transition-all", cls)}>{l}</button>
          ))}
          <div className="w-px h-4 bg-white/[0.08] mx-1" />
          {["≡","≡","≡"].map((l,i) => (
            <button key={i} className="w-6 h-6 rounded text-[11px] flex items-center justify-center hover:bg-white/[0.08] hover:text-white transition-all">{l}</button>
          ))}
          <div className="w-px h-4 bg-white/[0.08] mx-1" />
          {["$","%",".0"].map(l => (
            <button key={l} className="px-1.5 h-6 rounded text-[10px] font-bold flex items-center justify-center hover:bg-white/[0.08] hover:text-white transition-all">{l}</button>
          ))}
        </div>

        {/* Formula bar */}
        <div className="flex items-center border-t border-white/[0.05] px-2 py-1 gap-2">
          <div className="w-14 text-center font-mono text-[11px] font-semibold text-primary border-r border-white/[0.06] pr-2 shrink-0">{selected}</div>
          <span className="text-violet-400 font-mono font-bold italic text-[12px] shrink-0">fx</span>
          <input value={input} onChange={e => setInput(e.target.value)}
            onBlur={commitInput}
            onKeyDown={e => { if (e.key === "Enter") commitInput(); }}
            className="flex-1 bg-transparent outline-none text-[12.5px] font-mono text-white/80 placeholder:text-white/20" />
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto no-scrollbar bg-[#06060f]">
        <table className="border-collapse table-fixed text-[12px] w-full min-w-max">
          <thead className="sticky top-0 z-20">
            <tr>
              <th className="w-9 border-r border-b border-white/[0.07] bg-[#08081a] shrink-0" />
              {COLS.map(col => (
                <th key={col} className="w-[120px] border-r border-b border-white/[0.07] bg-[#08081a] font-bold text-white/35 text-[10.5px] py-2 select-none">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: ROWS_COUNT }, (_, ri) => ri + 1).map(row => (
              <tr key={row}>
                <td className="border-r border-b border-white/[0.07] bg-[#07070f] text-center text-[10.5px] text-white/25 select-none sticky left-0 w-9 px-1">
                  {row}
                </td>
                {COLS.map((col, ci) => {
                  const cellId = `${col}${row}`;
                  const isSel = selected === cellId;
                  const isEditing = editCell === cellId;
                  const val = data[cellId] || "";
                  const isHdr = row === 1;

                  return (
                    <td key={col}
                      onClick={() => selectCell(cellId)}
                      onDoubleClick={() => setEditCell(cellId)}
                      className={cn(
                        "border-r border-b border-white/[0.05] px-2 py-[5px] truncate cursor-cell relative transition-all",
                        isHdr ? "bg-white/[0.04] border-b-white/[0.08]" : "hover:bg-white/[0.02]",
                        isSel && !isHdr && "ring-1 ring-inset ring-primary z-10",
                        getCellColor(cellId),
                        ci < 7 ? "" : "text-white/25"
                      )}
                      style={{ maxWidth:"120px" }}>
                      {isEditing ? (
                        <input value={input} onChange={e => setInput(e.target.value)}
                          autoFocus
                          onBlur={() => { commitInput(); }}
                          onKeyDown={e => { if (e.key === "Enter" || e.key === "Escape") commitInput(); }}
                          className="absolute inset-0 w-full h-full bg-[#0d0d2e] px-2 text-white text-[12px] font-mono outline-none ring-1 ring-primary z-20" />
                      ) : (
                        val
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sheet tabs */}
      <div className="h-9 border-t border-white/[0.06] bg-[#08081a] flex items-end px-2 shrink-0 overflow-x-auto no-scrollbar">
        <button className="p-1 mb-1 mr-2 text-white/25 hover:text-white rounded hover:bg-white/[0.06] transition-all">
          <FiPlus className="w-3 h-3" />
        </button>
        {SHEETS.map(s => (
          <button key={s} onClick={() => setActiveSheet(s)}
            className={cn("px-4 py-1.5 text-[11.5px] font-medium rounded-t-lg border-t border-l border-r transition-all",
              s === activeSheet
                ? "bg-[#06060f] border-white/[0.08] text-white shadow-sm"
                : "border-transparent text-white/35 hover:text-white/60")}>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
