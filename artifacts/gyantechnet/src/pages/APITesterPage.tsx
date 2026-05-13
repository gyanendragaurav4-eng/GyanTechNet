import { useState } from "react";
import { FiSend, FiCode, FiPlus, FiTrash2, FiZap, FiCopy, FiCheck, FiRefreshCw } from "react-icons/fi";
import { cn } from "@/lib/utils";

const METHODS = ["GET","POST","PUT","PATCH","DELETE","HEAD","OPTIONS"];
const METHOD_COLORS: Record<string,string> = {
  GET:"text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  POST:"text-blue-400 bg-blue-500/10 border-blue-500/20",
  PUT:"text-amber-400 bg-amber-500/10 border-amber-500/20",
  PATCH:"text-violet-400 bg-violet-500/10 border-violet-500/20",
  DELETE:"text-red-400 bg-red-500/10 border-red-500/20",
  HEAD:"text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  OPTIONS:"text-pink-400 bg-pink-500/10 border-pink-500/20",
};

type HistoryItem = { method:string; url:string; status:number; time:number };
type Header = { key:string; val:string; enabled:boolean };

const INITIAL_HISTORY: HistoryItem[] = [
  { method:"GET",  url:"/api/healthz",    status:200, time:45 },
  { method:"POST", url:"/api/chat",       status:200, time:320 },
  { method:"GET",  url:"https://api.github.com/users/octocat", status:200, time:180 },
];

const PRESET_APIS = [
  { label:"Health Check",      method:"GET",  url:"/api/healthz", body:"" },
  { label:"GitHub User",       method:"GET",  url:"https://api.github.com/users/github", body:"" },
  { label:"JSONPlaceholder",   method:"GET",  url:"https://jsonplaceholder.typicode.com/posts/1", body:"" },
  { label:"IP Info",           method:"GET",  url:"https://ipapi.co/json/", body:"" },
];

export default function APITesterPage() {
  const [method, setMethod]       = useState("GET");
  const [url, setUrl]             = useState("/api/healthz");
  const [body, setBody]           = useState('{\n  "key": "value"\n}');
  const [tab, setTab]             = useState("Headers");
  const [response, setResponse]   = useState<{status:number;time:number;body:string;size:string}|null>(null);
  const [loading, setLoading]     = useState(false);
  const [headers, setHeaders]     = useState<Header[]>([
    {key:"Content-Type",val:"application/json",enabled:true},
    {key:"Authorization",val:"Bearer ...",enabled:false},
  ]);
  const [history, setHistory]     = useState<HistoryItem[]>(INITIAL_HISTORY);
  const [copied, setCopied]       = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAI, setShowAI]       = useState(false);
  const [aiDesc, setAiDesc]       = useState("");

  const send = async () => {
    setLoading(true);
    const start = Date.now();
    try {
      const opts: RequestInit = { method };
      if (method !== "GET" && method !== "DELETE" && method !== "HEAD") opts.body = body;
      opts.headers = Object.fromEntries(headers.filter(h => h.enabled && h.key).map(h => [h.key, h.val]));
      const res = await fetch(url, opts);
      const text = await res.text();
      let formatted = text;
      try { formatted = JSON.stringify(JSON.parse(text), null, 2); } catch {}
      const elapsed = Date.now() - start;
      const item: HistoryItem = { method, url, status: res.status, time: elapsed };
      setHistory(p => [item, ...p.slice(0,9)]);
      setResponse({ status: res.status, time: elapsed, body: formatted, size: `${(text.length/1024).toFixed(1)} KB` });
    } catch (e: unknown) {
      setResponse({ status:0, time:Date.now()-start, body:e instanceof Error ? e.message : "Request failed", size:"—" });
    }
    setLoading(false);
  };

  const copyResponse = () => {
    if (response) navigator.clipboard.writeText(response.body).catch(()=>{});
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const aiGenerate = async () => {
    if (!aiDesc.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          messages:[{ role:"user", content:`Generate a REST API request for: "${aiDesc}". Return JSON only: {"method":"GET","url":"https://...","body":"","headers":[{"key":"Content-Type","val":"application/json"}]}` }],
          mode:"Code", model:"openai/gpt-4o-mini",
        }),
      });
      const data = await res.json();
      const parsed = JSON.parse(data.content || "{}");
      if (parsed.method) setMethod(parsed.method);
      if (parsed.url) setUrl(parsed.url);
      if (parsed.body) setBody(parsed.body);
      if (parsed.headers) setHeaders(parsed.headers.map((h: Header) => ({...h, enabled:true})));
      setShowAI(false); setAiDesc("");
    } catch { /* ignore */ }
    setAiLoading(false);
  };

  const statusColor = (s: number) => {
    if (s >= 200 && s < 300) return "text-emerald-400 bg-emerald-500/10";
    if (s >= 300 && s < 400) return "text-blue-400 bg-blue-500/10";
    if (s >= 400 && s < 500) return "text-amber-400 bg-amber-500/10";
    if (s >= 500) return "text-red-400 bg-red-500/10";
    return "text-red-400 bg-red-500/10";
  };

  return (
    <div className="flex h-full overflow-hidden bg-[#06060f]">

      {/* Sidebar */}
      <div className="hidden sm:flex w-52 shrink-0 bg-[#08081a] border-r border-white/[0.06] flex-col">
        <div className="p-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-xl bg-blue-600/20 flex items-center justify-center">
              <FiCode className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <h2 className="text-white font-bold text-[13px]">API Tester</h2>
            <span className="text-[9px] bg-amber-500 text-black font-bold px-1.5 py-0.5 rounded-full ml-auto">PRO</span>
          </div>
          <button onClick={() => setShowAI(v => !v)}
            className={cn("w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-[11.5px] font-bold border transition-all",
              showAI ? "bg-violet-500/15 text-violet-300 border-violet-500/20" : "bg-white/[0.04] text-white/45 border-white/[0.07] hover:text-white")}>
            <FiZap className="w-3.5 h-3.5" /> AI Generate
          </button>
        </div>

        {/* Quick presets */}
        <div className="px-3 py-2 border-b border-white/[0.06]">
          <div className="text-[9px] text-white/25 uppercase font-bold tracking-widest mb-1.5">Quick APIs</div>
          {PRESET_APIS.map(p => (
            <button key={p.label} onClick={() => { setMethod(p.method); setUrl(p.url); if (p.body) setBody(p.body); }}
              className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] text-white/35 hover:text-white hover:bg-white/[0.04] transition-all mb-0.5">
              <span className={cn("text-[9px] font-bold px-1 py-0.5 rounded border", METHOD_COLORS[p.method])}>{p.method}</span>
              <span className="truncate">{p.label}</span>
            </button>
          ))}
        </div>

        {/* History */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-2">
          <div className="text-[9px] text-white/25 uppercase font-bold tracking-widest mb-1.5">History</div>
          {history.map((h, i) => (
            <button key={i} onClick={() => { setMethod(h.method); setUrl(h.url); }}
              className="w-full text-left flex items-start gap-2 px-2 py-2 rounded-lg hover:bg-white/[0.04] transition-all mb-0.5 group">
              <span className={cn("text-[8.5px] font-bold px-1 py-0.5 rounded border shrink-0 mt-0.5", METHOD_COLORS[h.method])}>{h.method}</span>
              <div className="flex-1 min-w-0">
                <div className="text-white/45 text-[10.5px] truncate group-hover:text-white/70">{h.url}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={cn("text-[9px] font-bold", h.status >= 200 && h.status < 300 ? "text-emerald-400" : "text-red-400")}>{h.status}</span>
                  <span className="text-white/20 text-[9px]">{h.time}ms</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* AI generator */}
        {showAI && (
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/[0.06] bg-violet-500/[0.04] shrink-0">
            <FiZap className="w-4 h-4 text-violet-400 shrink-0" />
            <input value={aiDesc} onChange={e => setAiDesc(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") aiGenerate(); }}
              placeholder="Describe the API request (e.g. 'get weather for Mumbai from OpenWeather API')..."
              className="flex-1 bg-transparent text-white text-[13px] outline-none placeholder:text-white/25" />
            <button onClick={aiGenerate} disabled={aiLoading || !aiDesc.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600/20 text-violet-300 text-[12px] font-bold border border-violet-500/20 hover:bg-violet-600/30 disabled:opacity-30 transition-all">
              {aiLoading ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FiZap className="w-3.5 h-3.5" />}
              Generate
            </button>
          </div>
        )}

        {/* URL bar */}
        <div className="p-3 border-b border-white/[0.06] bg-[#08081a] flex gap-2 shrink-0">
          <select value={method} onChange={e => setMethod(e.target.value)}
            className={cn("border rounded-xl px-2.5 py-2 text-[11px] font-black focus:outline-none transition-all cursor-pointer", METHOD_COLORS[method] || "text-white bg-white/[0.05] border-white/[0.1]")}
            style={{ colorScheme:"dark" }}>
            {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <input value={url} onChange={e => setUrl(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") send(); }}
            className="flex-1 bg-[#050510] border border-white/[0.09] rounded-xl px-3 py-2 text-white text-[12.5px] focus:outline-none focus:border-blue-500/30 font-mono transition-all" />
          <button onClick={send} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-[12.5px] font-bold hover:from-blue-500 hover:to-indigo-500 shadow-[0_4px_12px_rgba(59,130,246,0.25)] disabled:opacity-60 transition-all">
            {loading ? <FiRefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FiSend className="w-3.5 h-3.5" />}
            {loading ? "Sending…" : "Send"}
          </button>
        </div>

        {/* Content area */}
        <div className="flex flex-1 overflow-hidden gap-0">
          {/* Request panel */}
          <div className="flex-1 flex flex-col overflow-hidden border-r border-white/[0.06]">
            <div className="flex border-b border-white/[0.06] px-3 shrink-0">
              {["Headers","Body","Params","Auth"].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={cn("px-4 py-3 text-[12px] font-semibold transition-colors border-b-2",
                    tab === t ? "border-primary text-primary" : "border-transparent text-white/30 hover:text-white")}>
                  {t}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar p-3">
              {tab === "Headers" && (
                <div className="space-y-2">
                  {headers.map((h, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input type="checkbox" checked={h.enabled} onChange={e => setHeaders(p => p.map((x,j) => j===i ? {...x,enabled:e.target.checked} : x))}
                        className="w-3 h-3 accent-primary shrink-0" />
                      <input value={h.key} onChange={e => setHeaders(p => p.map((x,j) => j===i ? {...x,key:e.target.value} : x))}
                        placeholder="Header" className="flex-1 bg-white/[0.04] border border-white/[0.07] rounded-lg px-2 py-1.5 text-[11.5px] text-white font-mono focus:outline-none focus:border-primary/30" />
                      <input value={h.val} onChange={e => setHeaders(p => p.map((x,j) => j===i ? {...x,val:e.target.value} : x))}
                        placeholder="Value" className="flex-1 bg-white/[0.04] border border-white/[0.07] rounded-lg px-2 py-1.5 text-[11.5px] text-white/65 font-mono focus:outline-none focus:border-primary/30" />
                      <button onClick={() => setHeaders(p => p.filter((_,j) => j!==i))} className="p-1 text-white/20 hover:text-red-400 transition-colors">
                        <FiTrash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => setHeaders(p => [...p, {key:"",val:"",enabled:true}])}
                    className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 font-semibold transition-colors">
                    <FiPlus className="w-3 h-3" /> Add Header
                  </button>
                </div>
              )}
              {tab === "Body" && (
                <textarea value={body} onChange={e => setBody(e.target.value)}
                  className="w-full h-full min-h-[200px] bg-[#050510] border border-white/[0.07] rounded-xl p-3 text-[12px] text-emerald-300/80 font-mono focus:outline-none focus:border-blue-500/25 resize-none leading-relaxed" />
              )}
              {tab === "Params" && (
                <div className="text-[12px] text-white/35 italic mt-2">Add query parameters in the URL above (?key=value) or use the headers tab for request metadata.</div>
              )}
              {tab === "Auth" && (
                <div className="space-y-3">
                  <div className="text-[11px] text-white/30 uppercase font-bold tracking-widest">Bearer Token</div>
                  <input placeholder="Enter your bearer token..."
                    onChange={e => {
                      const token = e.target.value;
                      setHeaders(p => {
                        const authIdx = p.findIndex(h => h.key === "Authorization");
                        if (authIdx >= 0) return p.map((h,i) => i === authIdx ? {...h, val:`Bearer ${token}`, enabled:true} : h);
                        return [...p, {key:"Authorization", val:`Bearer ${token}`, enabled:true}];
                      });
                    }}
                    className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2 text-white text-[12.5px] font-mono focus:outline-none focus:border-primary/30 transition-all" />
                </div>
              )}
            </div>
          </div>

          {/* Response panel */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] shrink-0">
              <span className="text-white/40 text-[12px] font-semibold">Response</span>
              {response && (
                <>
                  <span className={cn("text-[11px] font-black px-2 py-0.5 rounded-full", statusColor(response.status))}>
                    {response.status || "ERR"}
                  </span>
                  <span className="text-white/25 text-[11px]">{response.time}ms</span>
                  <span className="text-white/20 text-[11px]">{response.size}</span>
                  <div className="flex-1" />
                  <button onClick={copyResponse}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] text-white/30 hover:text-white bg-white/[0.04] border border-white/[0.07] transition-all">
                    {copied ? <FiCheck className="w-3 h-3 text-emerald-400" /> : <FiCopy className="w-3 h-3" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </>
              )}
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar p-3">
              {!response ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-2">
                  <div className="text-4xl opacity-20">📡</div>
                  <div className="text-white/25 text-[13px]">Send a request to see the response</div>
                </div>
              ) : (
                <pre className={cn("text-[11.5px] font-mono whitespace-pre-wrap leading-relaxed",
                  response.status >= 200 && response.status < 300 ? "text-emerald-300/80" : "text-red-300/80")}>
                  {response.body}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
