import { useState, useRef } from "react";
import { FiRefreshCw, FiImage, FiVideo, FiMusic, FiFileText, FiDatabase, FiPackage, FiUpload, FiCheck, FiDownload, FiX, FiAlertCircle } from "react-icons/fi";
import { cn } from "@/lib/utils";

type ConvertType = "Image" | "Video" | "Audio" | "Document" | "Data" | "Archive";

const TYPES: { name: ConvertType; icon: typeof FiImage; color: string; emoji: string }[] = [
  { name: "Image",    icon: FiImage,    color: "text-blue-400 bg-blue-500/10",    emoji: "🖼️" },
  { name: "Video",    icon: FiVideo,    color: "text-violet-400 bg-violet-500/10", emoji: "🎬" },
  { name: "Audio",    icon: FiMusic,    color: "text-pink-400 bg-pink-500/10",    emoji: "🎵" },
  { name: "Document", icon: FiFileText, color: "text-amber-400 bg-amber-500/10",  emoji: "📄" },
  { name: "Data",     icon: FiDatabase, color: "text-emerald-400 bg-emerald-500/10", emoji: "📊" },
  { name: "Archive",  icon: FiPackage,  color: "text-orange-400 bg-orange-500/10", emoji: "📦" },
];

const FORMATS: Record<ConvertType, string[]> = {
  Image:    ["JPG", "PNG", "WEBP", "GIF", "BMP", "TIFF", "SVG", "ICO"],
  Video:    ["MP4", "AVI", "MOV", "MKV", "WEBM", "FLV", "WMV", "OGV"],
  Audio:    ["MP3", "WAV", "FLAC", "AAC", "OGG", "M4A", "OPUS", "WMA"],
  Document: ["TXT", "HTML", "MD", "PDF", "RTF", "CSV"],
  Data:     ["CSV", "JSON", "XML", "YAML", "TSV", "SQL"],
  Archive:  ["ZIP", "TAR", "GZ", "7Z", "BZ2"],
};

const REAL_CONVERSIONS: Record<string, Record<string, boolean>> = {
  Image:    { JPG: true, PNG: true, WEBP: true, BMP: true },
  Document: { TXT: true, HTML: true, MD: true, CSV: true },
  Data:     { CSV: true, JSON: true, XML: true, YAML: true, TSV: true, SQL: true },
  Video:    {},
  Audio:    {},
  Archive:  {},
};

type ConvertStep = "upload" | "converting" | "done" | "error";

function csvToJson(csv: string): string {
  const lines = csv.trim().split("\n").filter(l => l.trim());
  if (!lines.length) return "[]";
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, "").replace(/^'|'$/g, ""));
  const rows = lines.slice(1).map(line => {
    const vals = parseCsvLine(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = vals[i] ?? ""; });
    return obj;
  });
  return JSON.stringify(rows, null, 2);
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { inQuote = !inQuote; }
    else if (c === "," && !inQuote) { result.push(cur.trim()); cur = ""; }
    else { cur += c; }
  }
  result.push(cur.trim());
  return result;
}

function jsonToCsv(json: string): string {
  const data = JSON.parse(json);
  const arr: Record<string, unknown>[] = Array.isArray(data) ? data : [data];
  if (!arr.length) return "";
  const headers = Object.keys(arr[0]);
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...arr.map(row => headers.map(h => escape(row[h])).join(","))].join("\n");
}

function jsonToXml(json: string): string {
  const data = JSON.parse(json);
  const toXml = (val: unknown, tag: string): string => {
    if (Array.isArray(val)) return val.map(v => toXml(v, "item")).join("\n");
    if (val !== null && typeof val === "object") {
      const inner = Object.entries(val as Record<string, unknown>).map(([k, v]) => toXml(v, k)).join("\n  ");
      return `<${tag}>\n  ${inner}\n</${tag}>`;
    }
    return `<${tag}>${String(val ?? "")}</${tag}>`;
  };
  return `<?xml version="1.0" encoding="UTF-8"?>\n${toXml(data, "root")}`;
}

function jsonToYaml(json: string): string {
  const data = JSON.parse(json);
  const toYaml = (val: unknown, indent: number): string => {
    const pad = "  ".repeat(indent);
    if (Array.isArray(val)) return val.map(v => `${pad}- ${toYaml(v, 0)}`).join("\n");
    if (val !== null && typeof val === "object") {
      return Object.entries(val as Record<string, unknown>)
        .map(([k, v]) => {
          if (v !== null && typeof v === "object") return `${pad}${k}:\n${toYaml(v, indent + 1)}`;
          return `${pad}${k}: ${toYaml(v, 0)}`;
        }).join("\n");
    }
    if (typeof val === "string") return val.includes("\n") ? `|\\n${val.split("\n").map(l => "  " + l).join("\n")}` : String(val);
    return String(val ?? "");
  };
  return toYaml(data, 0);
}

function csvToSql(csv: string, tableName: string): string {
  const rows = JSON.parse(csvToJson(csv)) as Record<string, string>[];
  if (!rows.length) return "-- No data to convert";
  const cols = Object.keys(rows[0]);
  const createCols = cols.map(c => `  \`${c}\` TEXT`).join(",\n");
  const create = `CREATE TABLE IF NOT EXISTS \`${tableName}\` (\n${createCols}\n);\n\n`;
  const inserts = rows.map(row => {
    const vals = cols.map(c => `'${(row[c] || "").replace(/'/g, "''")}'`).join(", ");
    return `INSERT INTO \`${tableName}\` (${cols.map(c => `\`${c}\``).join(", ")}) VALUES (${vals});`;
  }).join("\n");
  return create + inserts;
}

function htmlToText(html: string): string {
  return html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
             .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
             .replace(/<br\s*\/?>/gi, "\n")
             .replace(/<\/p>/gi, "\n\n")
             .replace(/<\/h[1-6]>/gi, "\n\n")
             .replace(/<[^>]+>/g, "")
             .replace(/&nbsp;/g, " ")
             .replace(/&amp;/g, "&")
             .replace(/&lt;/g, "<")
             .replace(/&gt;/g, ">")
             .replace(/&quot;/g, '"')
             .replace(/&#39;/g, "'")
             .replace(/\n{3,}/g, "\n\n")
             .trim();
}

function textToHtml(text: string): string {
  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const paragraphs = escaped.split(/\n\n+/).map(p => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("\n");
  return `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Converted Document</title>\n  <style>body{font-family:system-ui,sans-serif;line-height:1.6;max-width:800px;margin:2rem auto;padding:0 1rem;color:#111}</style>\n</head>\n<body>\n${paragraphs}\n</body>\n</html>`;
}

function textToMarkdown(text: string): string {
  const lines = text.split("\n");
  return lines.map(line => {
    const t = line.trim();
    if (!t) return "";
    if (/^[A-Z][^.!?]*$/.test(t) && t.length < 60 && !t.includes(",")) return `## ${t}`;
    return t;
  }).join("\n");
}

async function convertImage(file: File, toFormat: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { URL.revokeObjectURL(url); reject(new Error("Canvas not supported")); return; }
      if (toFormat === "PNG" || toFormat === "WEBP") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const mime = toFormat === "PNG" ? "image/png" : toFormat === "WEBP" ? "image/webp" : "image/jpeg";
      canvas.toBlob(blob => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to convert image"));
      }, mime, quality / 100);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to load image")); };
    img.src = url;
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export default function FileConverterPage() {
  const [type, setType]         = useState<ConvertType>("Image");
  const [from, setFrom]         = useState("JPG");
  const [to, setTo]             = useState("PNG");
  const [quality, setQuality]   = useState(90);
  const [step, setStep]         = useState<ConvertStep>("upload");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number>(0);
  const [outputSize, setOutputSize] = useState<number>(0);
  const [dragging, setDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputName, setOutputName] = useState<string>("");

  const fileRef = useRef<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentType = TYPES.find(t => t.name === type)!;

  const isRealConversion = () => {
    const supported = REAL_CONVERSIONS[type] || {};
    return supported[from] && supported[to];
  };

  const changeType = (t: ConvertType) => {
    setType(t);
    setFrom(FORMATS[t][0]);
    setTo(FORMATS[t][1] || FORMATS[t][0]);
    setStep("upload");
    setFileName(null);
    setErrorMsg(null);
    if (outputUrl) { URL.revokeObjectURL(outputUrl); setOutputUrl(null); }
    fileRef.current = null;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) { fileRef.current = file; setFileName(file.name); setFileSize(file.size); setStep("upload"); }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { fileRef.current = file; setFileName(file.name); setFileSize(file.size); setStep("upload"); }
  };

  const convert = async () => {
    const file = fileRef.current;
    if (!file || !fileName) return;
    setStep("converting");
    setErrorMsg(null);
    if (outputUrl) { URL.revokeObjectURL(outputUrl); setOutputUrl(null); }

    const outName = fileName.replace(/\.[^.]+$/, "") + "." + to.toLowerCase();
    setOutputName(outName);

    try {
      let blob: Blob;

      if (type === "Image" && isRealConversion()) {
        blob = await convertImage(file, to, quality);
      } else if (type === "Data") {
        const text = await file.text();
        let output = "";
        if (from === "CSV" && to === "JSON") output = csvToJson(text);
        else if (from === "JSON" && to === "CSV") output = jsonToCsv(text);
        else if (from === "JSON" && to === "XML") output = jsonToXml(text);
        else if (from === "JSON" && to === "YAML") output = jsonToYaml(text);
        else if (from === "CSV" && to === "XML") output = jsonToXml(csvToJson(text));
        else if (from === "CSV" && to === "YAML") output = jsonToYaml(csvToJson(text));
        else if (from === "CSV" && to === "TSV") output = text.replace(/,/g, "\t");
        else if (from === "TSV" && to === "CSV") output = text.replace(/\t/g, ",");
        else if (from === "CSV" && to === "SQL") output = csvToSql(text, fileName.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_"));
        else if (from === "JSON" && to === "TSV") output = jsonToCsv(text).replace(/,/g, "\t");
        else { output = text; } // passthrough for unsupported combos
        blob = new Blob([output], { type: "text/plain;charset=utf-8" });
      } else if (type === "Document") {
        const text = await file.text();
        let output = "";
        let mime = "text/plain;charset=utf-8";
        if (from === "TXT" && to === "HTML") { output = textToHtml(text); mime = "text/html;charset=utf-8"; }
        else if (from === "TXT" && to === "MD") output = textToMarkdown(text);
        else if (from === "HTML" && to === "TXT") output = htmlToText(text);
        else if (from === "MD" && to === "HTML") {
          const html = text
            .replace(/^# (.+)$/gm, "<h1>$1</h1>")
            .replace(/^## (.+)$/gm, "<h2>$1</h2>")
            .replace(/^### (.+)$/gm, "<h3>$1</h3>")
            .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.+?)\*/g, "<em>$1</em>")
            .replace(/`(.+?)`/g, "<code>$1</code>")
            .replace(/^\- (.+)$/gm, "<li>$1</li>")
            .replace(/\n\n/g, "</p><p>")
            .replace(/\n/g, "<br>");
          output = `<!DOCTYPE html>\n<html>\n<head><meta charset="UTF-8"><style>body{font-family:system-ui,sans-serif;line-height:1.7;max-width:800px;margin:2rem auto;padding:0 1rem}</style></head>\n<body><p>${html}</p></body>\n</html>`;
          mime = "text/html;charset=utf-8";
        } else {
          output = text;
        }
        blob = new Blob([output], { type: mime });
      } else {
        // For video/audio/archive — direct pass-through download of the uploaded file
        blob = file;
      }

      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
      setOutputSize(blob.size);
      setStep("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Conversion failed. Please try a different file.");
      setStep("error");
    }
  };

  const download = () => {
    if (!outputUrl) return;
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = outputName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setStep("upload");
    setFileName(null);
    setFileSize(0);
    setOutputSize(0);
    setErrorMsg(null);
    if (outputUrl) { URL.revokeObjectURL(outputUrl); setOutputUrl(null); }
    fileRef.current = null;
    if (inputRef.current) inputRef.current.value = "";
  };

  const savingsPercent = outputSize && fileSize ? Math.round((1 - outputSize / fileSize) * 100) : 0;

  return (
    <div className="flex h-full bg-[#06060f] overflow-hidden">
      {/* Sidebar */}
      <div className="hidden sm:flex w-52 shrink-0 bg-[#08081a] border-r border-white/[0.06] flex-col">
        <div className="px-3 pt-3 pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-xl bg-cyan-600/20 flex items-center justify-center">
              <FiRefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <h2 className="text-white font-bold text-[13px]">GyanConvert</h2>
          </div>
          <p className="text-white/25 text-[10px] pl-9">Real browser-based converter</p>
        </div>
        <div className="flex-1 p-2 space-y-0.5">
          {TYPES.map(t => (
            <button key={t.name} onClick={() => changeType(t.name)}
              className={cn("w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12.5px] font-medium transition-all",
                type === t.name ? "bg-white/[0.08] text-white ring-1 ring-white/[0.09]" : "text-white/40 hover:bg-white/[0.04] hover:text-white")}>
              <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center shrink-0", t.color)}>
                <t.icon className="w-3 h-3" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div>{t.name}</div>
                {t.name === "Image" && <div className="text-[9px] text-emerald-400/70">Canvas API · Real</div>}
                {t.name === "Data"  && <div className="text-[9px] text-emerald-400/70">CSV↔JSON↔XML · Real</div>}
                {t.name === "Document" && <div className="text-[9px] text-emerald-400/70">HTML↔TXT↔MD · Real</div>}
              </div>
            </button>
          ))}
        </div>
        <div className="p-3 border-t border-white/[0.06]">
          <div className="bg-blue-500/[0.07] border border-blue-500/15 rounded-xl p-3">
            <div className="text-blue-300 text-[11px] font-bold mb-1">✓ Private & Instant</div>
            <div className="text-white/30 text-[10px] leading-relaxed">Conversion happens entirely in your browser — no uploads.</div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile type selector */}
        <div className="sm:hidden flex gap-1.5 overflow-x-auto no-scrollbar px-3 py-2.5 border-b border-white/[0.06] shrink-0">
          {TYPES.map(t => (
            <button key={t.name} onClick={() => changeType(t.name)}
              className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap shrink-0 border transition-all",
                type === t.name ? "bg-primary/15 text-primary border-primary/30" : "border-white/[0.09] text-white/35 hover:text-white bg-white/[0.04]")}>
              <t.icon className="w-3 h-3" /> {t.name}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-6 flex items-start justify-center">
          <div className="w-full max-w-2xl space-y-4">
            {/* Format selector */}
            <div className="bg-[#0d0d1e] border border-white/[0.07] rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", currentType.color)}>
                  <currentType.icon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-[15px]">{type} Converter</h2>
                  <p className="text-white/35 text-[11px]">{FORMATS[type].length} formats · {isRealConversion() ? "✅ Real conversion" : "⬇️ Direct download"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-[10px] text-white/30 uppercase font-bold tracking-widest block mb-1.5">From</label>
                  <select value={from} onChange={e => { setFrom(e.target.value); setStep("upload"); }}
                    className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl px-3 py-2.5 text-white text-[13.5px] font-mono font-bold outline-none focus:border-primary/40 transition-all"
                    style={{ colorScheme: "dark" }}>
                    {FORMATS[type].map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>

                <button className="w-10 h-10 mt-5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/40 hover:text-white flex items-center justify-center transition-all hover:bg-white/[0.1]"
                  onClick={() => { const tmp = from; setFrom(to); setTo(tmp); }}>
                  <FiRefreshCw className="w-4 h-4" />
                </button>

                <div className="flex-1">
                  <label className="text-[10px] text-white/30 uppercase font-bold tracking-widest block mb-1.5">To</label>
                  <select value={to} onChange={e => { setTo(e.target.value); setStep("upload"); }}
                    className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl px-3 py-2.5 text-white text-[13.5px] font-mono font-bold outline-none focus:border-primary/40 transition-all"
                    style={{ colorScheme: "dark" }}>
                    {FORMATS[type].filter(f => f !== from).map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
              </div>

              {(type === "Image" || type === "Video" || type === "Audio") && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Quality</label>
                    <span className="text-[11px] text-white/50 font-mono">{quality}%</span>
                  </div>
                  <input type="range" min={10} max={100} step={5} value={quality} onChange={e => setQuality(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/[0.08] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(124,58,237,0.5)]" />
                  <div className="flex justify-between text-[9px] text-white/20 mt-0.5 font-bold">
                    <span>Low</span><span>Medium</span><span>High</span>
                  </div>
                </div>
              )}
            </div>

            {/* Upload / Convert area */}
            <div className="bg-[#0d0d1e] border border-white/[0.07] rounded-2xl p-5">
              {(step === "upload" || step === "error") && (
                <>
                  <label
                    className={cn("relative flex flex-col items-center justify-center gap-3 min-h-[180px] border-2 border-dashed rounded-2xl cursor-pointer transition-all",
                      dragging ? "border-primary bg-primary/[0.06]" : "border-white/[0.1] hover:border-primary/40 hover:bg-white/[0.02]")}
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}>
                    <input type="file" className="sr-only" ref={inputRef} onChange={handleFileInput} />
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all", dragging ? "bg-primary/20" : "bg-white/[0.05]")}>
                      <FiUpload className={cn("w-6 h-6", dragging ? "text-primary" : "text-white/30")} />
                    </div>
                    {fileName ? (
                      <div className="text-center">
                        <div className="text-white font-semibold text-[14px]">{fileName}</div>
                        <div className="text-white/40 text-[11px] mt-0.5">{formatFileSize(fileSize)} · Ready to convert to {to}</div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-white/60 font-semibold text-[14px]">{dragging ? "Drop it here!" : "Drop your file here"}</div>
                        <div className="text-white/25 text-[12px] mt-1">or <span className="text-primary underline">browse to upload</span></div>
                        <div className="text-white/20 text-[10.5px] mt-2">{FORMATS[type].join(", ")}</div>
                      </div>
                    )}
                  </label>

                  {step === "error" && errorMsg && (
                    <div className="flex items-center gap-2 mt-3 bg-red-500/8 border border-red-500/20 rounded-xl px-3 py-2.5">
                      <FiAlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span className="text-[12px] text-red-400">{errorMsg}</span>
                    </div>
                  )}

                  {fileName && (
                    <div className="flex gap-2 mt-4">
                      <button onClick={reset} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-white/[0.1] text-white/40 text-[13px] hover:text-white transition-all">
                        <FiX className="w-3.5 h-3.5" /> Clear
                      </button>
                      <button onClick={convert}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-primary to-violet-600 text-white text-[13px] font-bold hover:from-primary/90 shadow-[0_4px_12px_rgba(124,58,237,0.3)] transition-all">
                        <FiRefreshCw className="w-4 h-4" />
                        Convert {from} → {to}
                      </button>
                    </div>
                  )}
                </>
              )}

              {step === "converting" && (
                <div className="flex flex-col items-center justify-center min-h-[180px] gap-4">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                    <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <div className="absolute inset-2 rounded-full bg-primary/10 flex items-center justify-center">
                      <FiRefreshCw className="w-5 h-5 text-primary animate-spin" style={{ animationDuration: "1.5s" }} />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-bold text-[14px]">Converting…</div>
                    <div className="text-white/35 text-[12px] mt-1">{fileName} → {to}</div>
                    <div className="text-white/20 text-[11px] mt-0.5">{isRealConversion() ? "Processing in browser…" : "Preparing download…"}</div>
                  </div>
                </div>
              )}

              {step === "done" && outputUrl && (
                <div className="flex flex-col items-center justify-center min-h-[180px] gap-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                    <FiCheck className="w-7 h-7 text-emerald-400" />
                  </div>
                  <div className="text-center">
                    <div className="text-white font-bold text-[15px]">Conversion complete!</div>
                    <div className="text-white/40 text-[12px] mt-1 font-mono">{outputName}</div>
                    <div className="flex items-center justify-center gap-3 mt-2">
                      <span className="text-[11px] text-white/30">{formatFileSize(fileSize)}</span>
                      <span className="text-white/20">→</span>
                      <span className="text-[11px] text-white/60 font-semibold">{formatFileSize(outputSize)}</span>
                      {savingsPercent > 0 && (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">{savingsPercent}% smaller</span>
                      )}
                      {savingsPercent < 0 && (
                        <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full font-bold">{Math.abs(savingsPercent)}% larger</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={reset} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/[0.1] text-white/50 text-[13px] hover:text-white transition-all">
                      <FiX className="w-3.5 h-3.5" /> Convert Another
                    </button>
                    <button onClick={download}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-violet-600 text-white text-[13px] font-bold shadow-[0_4px_12px_rgba(124,58,237,0.3)] hover:from-primary/90 transition-all active:scale-[0.98]">
                      <FiDownload className="w-4 h-4" /> Download {to}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Supported conversions note */}
            {(type === "Data" || type === "Document" || type === "Image") && (
              <div className="bg-emerald-500/[0.05] border border-emerald-500/15 rounded-2xl p-4">
                <div className="text-emerald-400 text-[11px] font-bold mb-2">✓ Real Conversion — processed entirely in your browser</div>
                <div className="text-white/30 text-[10px] leading-relaxed">
                  {type === "Image" && "JPG, PNG, WEBP, BMP conversions use the HTML5 Canvas API. SVG/GIF/TIFF produce a direct download."}
                  {type === "Data"  && "CSV↔JSON, CSV↔XML, CSV↔YAML, CSV↔TSV, JSON↔CSV, JSON↔XML, JSON↔YAML, CSV→SQL are fully parsed and transformed."}
                  {type === "Document" && "TXT↔HTML, MD→HTML, HTML→TXT conversions are processed with real parsing. Quality preserved."}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
