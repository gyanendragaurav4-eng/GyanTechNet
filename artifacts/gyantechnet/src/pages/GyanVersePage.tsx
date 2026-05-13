import { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import { useLocation } from "wouter";
import {
  FiArrowLeft, FiPlus, FiTrash2, FiCheck, FiPlay, FiSquare,
  FiHeart, FiDownload, FiGlobe, FiBookmark, FiVolume2,
} from "react-icons/fi";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

// ── App metadata ──────────────────────────────────────────────
const META: Record<string, { name: string; emoji: string; desc: string; gradient: string }> = {
  tutor:   { name:"GyanTutor",       emoji:"🎓", desc:"AI-powered personalised tutor",      gradient:"from-orange-400 to-amber-500" },
  science: { name:"Science Lab",     emoji:"🔬", desc:"Interactive science experiments",    gradient:"from-teal-500 to-cyan-500" },
  viz:     { name:"GyanViz",         emoji:"📊", desc:"Data visualisation builder",         gradient:"from-indigo-500 to-violet-500" },
  studio:  { name:"GyanStudio",      emoji:"🎵", desc:"Music production studio",            gradient:"from-purple-600 to-fuchsia-500" },
  pixel:   { name:"GyanPixel",       emoji:"🎨", desc:"Pixel art canvas",                   gradient:"from-pink-500 to-rose-500" },
  screen:  { name:"GyanScreen",      emoji:"📺", desc:"Screen recording & sharing",         gradient:"from-red-500 to-orange-500" },
  board:   { name:"GyanBoard",       emoji:"📋", desc:"Kanban project board",               gradient:"from-cyan-500 to-blue-500" },
  mind:    { name:"GyanMind",        emoji:"🧠", desc:"Visual mind mapping",                gradient:"from-violet-600 to-purple-500" },
  write:   { name:"GyanWrite",       emoji:"✍️",  desc:"AI writing assistant",               gradient:"from-emerald-500 to-teal-500" },
  resume:  { name:"GyanResume",      emoji:"📄", desc:"Professional resume builder",        gradient:"from-blue-500 to-indigo-500" },
  lab:     { name:"GyanLab",         emoji:"⚗️",  desc:"Code experiments & sandboxes",      gradient:"from-green-500 to-emerald-600" },
  debate:  { name:"GyanDebate",      emoji:"⚖️",  desc:"AI-powered debate platform",        gradient:"from-amber-500 to-orange-500" },
  review:  { name:"GyanReview",      emoji:"🔍", desc:"Review & feedback aggregator",       gradient:"from-slate-500 to-indigo-500" },
  runner:  { name:"GyanRunner",      emoji:"🏃", desc:"Fitness & run tracker",              gradient:"from-green-500 to-lime-500" },
  avatar:  { name:"GyanAvatar",      emoji:"🧑‍🎨", desc:"AI avatar & profile creator",     gradient:"from-fuchsia-600 to-purple-600" },
  voice:   { name:"GyanVoice",       emoji:"🎙️", desc:"Voice cloning & synthesis",         gradient:"from-teal-500 to-sky-500" },
  pdf:     { name:"GyanPDF",         emoji:"📑", desc:"PDF tools & editor",                 gradient:"from-red-600 to-red-500" },
  social:  { name:"GyanSocial",      emoji:"💬", desc:"Social feed & community",            gradient:"from-blue-500 to-sky-500" },
  health:  { name:"GyanHealth",      emoji:"❤️",  desc:"Health & wellness tracker",         gradient:"from-green-500 to-emerald-500" },
  travel:  { name:"GyanTravel",      emoji:"✈️",  desc:"Travel planner & guide",            gradient:"from-sky-500 to-cyan-500" },
  crypto:  { name:"GyanCrypto",      emoji:"₿",  desc:"Crypto portfolio tracker",           gradient:"from-orange-500 to-amber-500" },
  stocks:  { name:"GyanStocks",      emoji:"📈", desc:"Stock market tracker",               gradient:"from-green-600 to-teal-500" },
  chef:    { name:"GyanChef",        emoji:"👨‍🍳", desc:"AI recipe generator",             gradient:"from-amber-500 to-orange-400" },
  news:    { name:"GyanNews",        emoji:"📰", desc:"Personalised news feed",             gradient:"from-blue-700 to-blue-500" },
  zen:     { name:"GyanZen",         emoji:"🧘", desc:"Meditation & mindfulness",           gradient:"from-teal-500 to-emerald-500" },
  money:   { name:"GyanMoney",       emoji:"💰", desc:"Personal finance tracker",           gradient:"from-green-600 to-lime-500" },
  legal:   { name:"GyanLegal",       emoji:"⚖️",  desc:"AI legal assistant",               gradient:"from-violet-700 to-indigo-500" },
  space:   { name:"GyanSpace",       emoji:"🚀", desc:"Space & astronomy explorer",         gradient:"from-indigo-700 to-violet-600" },
  website: { name:"Website Creator", emoji:"🌐", desc:"No-code website builder",           gradient:"from-blue-500 to-cyan-500" },
  book:    { name:"GyanBook",        emoji:"📖", desc:"Digital notebook & library",         gradient:"from-blue-600 to-blue-500" },
};

// ─────────────────────────────────────────────────────────────
// ── Kanban Board ──────────────────────────────────────────────
function KanbanBoard() {
  type Card = { id: number; text: string };
  type Col  = { title: string; color: string; cards: Card[] };
  const [cols, setCols] = useState<Col[]>([
    { title:"To Do",       color:"border-slate-500",  cards:[{id:1,text:"Design homepage"},{id:2,text:"Setup database"},{id:3,text:"Write API docs"}] },
    { title:"In Progress", color:"border-blue-500",   cards:[{id:4,text:"Build auth system"},{id:5,text:"Create UI components"}] },
    { title:"Review",      color:"border-yellow-500", cards:[{id:6,text:"Test payment flow"}] },
    { title:"Done",        color:"border-green-500",  cards:[{id:7,text:"Project setup"},{id:8,text:"DB schema design"}] },
  ]);
  const [input, setInput] = useState<Record<number,string>>({});
  const nextId = useRef(20);

  const addCard = (ci: number) => {
    const txt = (input[ci]||"").trim(); if (!txt) return;
    const nc = [...cols]; nc[ci].cards.push({id:nextId.current++, text:txt});
    setCols(nc); setInput(p=>({...p,[ci]:""}));
  };
  const removeCard = (ci: number, id: number) => {
    const nc = [...cols]; nc[ci].cards = nc[ci].cards.filter(c=>c.id!==id); setCols(nc);
  };
  const moveCard = (fromCol: number, cardId: number, toCol: number) => {
    if (fromCol===toCol) return;
    const nc = cols.map(c=>({...c,cards:[...c.cards]}));
    const card = nc[fromCol].cards.find(c=>c.id===cardId);
    if (!card) return;
    nc[fromCol].cards = nc[fromCol].cards.filter(c=>c.id!==cardId);
    nc[toCol].cards.push(card);
    setCols(nc);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {cols.map((col, ci) => (
        <div key={ci} className={`shrink-0 w-60 bg-[#0d0d1e] border-t-2 ${col.color} rounded-xl p-3`}>
          <div className="flex justify-between items-center mb-3">
            <span className="text-white font-bold text-sm">{col.title}</span>
            <span className="text-white/40 text-xs bg-white/5 px-2 py-0.5 rounded-full">{col.cards.length}</span>
          </div>
          <div className="space-y-2 mb-3 min-h-[40px]">
            {col.cards.map(card => (
              <div key={card.id} className="bg-[#06060f] border border-white/10 rounded-lg p-2.5 text-white/80 text-xs flex justify-between items-start gap-2">
                <span className="leading-relaxed">{card.text}</span>
                <div className="flex gap-1 shrink-0">
                  {ci < cols.length-1 && <button onClick={()=>moveCard(ci,card.id,ci+1)} className="text-blue-400 hover:text-blue-300 text-[10px]">→</button>}
                  <button onClick={()=>removeCard(ci,card.id)} className="text-red-400/60 hover:text-red-400"><FiTrash2 className="w-3 h-3"/></button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-1">
            <input value={input[ci]||""} onChange={e=>setInput(p=>({...p,[ci]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addCard(ci)}
              placeholder="Add card..." className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs outline-none focus:border-blue-500/50 placeholder:text-white/20"/>
            <button onClick={()=>addCard(ci)} className="w-7 h-7 bg-blue-600/30 hover:bg-blue-600/60 text-blue-400 rounded-lg flex items-center justify-center"><FiPlus className="w-3 h-3"/></button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Mind Map ──────────────────────────────────────────────────
function MindMap() {
  type Node = { id: number; text: string; x: number; y: number; parent?: number; color: string };
  const colors = ["bg-violet-600","bg-blue-600","bg-teal-600","bg-emerald-600","bg-amber-600","bg-rose-600","bg-fuchsia-600"];
  const [nodes, setNodes] = useState<Node[]>([
    {id:0,text:"GyanTechNet AI",x:50,y:50,color:"bg-violet-700"},
    {id:1,text:"Chat AI",x:20,y:25,parent:0,color:"bg-blue-600"},
    {id:2,text:"Image AI",x:75,y:20,parent:0,color:"bg-pink-600"},
    {id:3,text:"Productivity",x:20,y:72,parent:0,color:"bg-teal-600"},
    {id:4,text:"Analytics",x:75,y:72,parent:0,color:"bg-amber-600"},
  ]);
  const [editing, setEditing] = useState<number|null>(null);
  const [newText, setNewText] = useState("");
  const nextId = useRef(10);

  const addNode = (parentId: number) => {
    const parent = nodes.find(n=>n.id===parentId);
    if (!parent) return;
    const children = nodes.filter(n=>n.parent===parentId).length;
    const nx = Math.min(90,Math.max(10,parent.x+(Math.random()*30-15)));
    const ny = Math.min(85,Math.max(5,parent.y+(children%2===0?-15:15)));
    setNodes(ns=>[...ns,{id:nextId.current++,text:"New idea",x:nx,y:ny,parent:parentId,color:colors[nextId.current%colors.length]}]);
  };

  return (
    <div className="relative w-full h-72 bg-[#06060f] rounded-xl border border-white/10 overflow-hidden select-none">
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {nodes.filter(n=>n.parent!==undefined).map(n=>{
          const p = nodes.find(p2=>p2.id===n.parent);
          if (!p) return null;
          return <line key={n.id} x1={`${p.x}%`} y1={`${p.y}%`} x2={`${n.x}%`} y2={`${n.y}%`} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>;
        })}
      </svg>
      {nodes.map(n=>(
        <div key={n.id} className="absolute -translate-x-1/2 -translate-y-1/2 group" style={{left:`${n.x}%`,top:`${n.y}%`}}>
          {editing===n.id
            ? <input autoFocus value={newText} onChange={e=>setNewText(e.target.value)}
                onBlur={()=>{setNodes(ns=>ns.map(node=>node.id===n.id?{...node,text:newText||node.text}:node));setEditing(null);}}
                onKeyDown={e=>e.key==="Enter"&&(setNodes(ns=>ns.map(node=>node.id===n.id?{...node,text:newText||node.text}:node)),setEditing(null))}
                className="w-28 text-center text-xs bg-white text-black rounded-lg px-2 py-1 outline-none"/>
            : <div className={`${n.color} rounded-xl px-3 py-1.5 text-white text-xs font-semibold whitespace-nowrap shadow-lg cursor-pointer hover:brightness-110 transition-all`}
                onDoubleClick={()=>{setEditing(n.id);setNewText(n.text);}}
                onClick={()=>addNode(n.id)}>
                {n.text}<span className="ml-1 opacity-50 text-[9px]">+</span>
              </div>}
        </div>
      ))}
      <div className="absolute bottom-2 right-2 text-white/30 text-[10px]">Click node to branch · Double-click to rename</div>
    </div>
  );
}

// ── Health Tracker ────────────────────────────────────────────
function HealthTracker() {
  const [logs, setLogs] = useState([
    {date:"Today",steps:8432,water:6,sleep:7.5,mood:"😊"},
    {date:"Yesterday",steps:6210,water:5,sleep:6,mood:"😐"},
    {date:"Mon",steps:10500,water:8,sleep:8,mood:"😄"},
  ]);
  const [form, setForm] = useState({steps:"",water:"",sleep:"",mood:"😊"});
  const moods = ["😄","😊","😐","😟","😴"];

  const add = () => {
    if (!form.steps) return;
    setLogs(l=>[{date:"Just now",steps:parseInt(form.steps)||0,water:parseInt(form.water)||0,sleep:parseFloat(form.sleep)||0,mood:form.mood},...l]);
    setForm({steps:"",water:"",sleep:"",mood:"😊"});
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[["👣","Steps","8,432","10,000 goal"],["💧","Water","6 glasses","8 goal"],["😴","Sleep","7.5 hrs","8 hrs goal"]].map(([ic,label,val,goal])=>(
          <div key={label as string} className="bg-[#06060f] border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl mb-1">{ic}</div>
            <div className="text-white font-black">{val}</div>
            <div className="text-white/40 text-xs">{label}</div>
            <div className="text-white/25 text-[10px]">{goal}</div>
          </div>
        ))}
      </div>
      <div className="bg-[#06060f] border border-white/10 rounded-xl p-4">
        <div className="text-white font-semibold text-sm mb-3">Log Today's Activity</div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          {[["Steps","steps","🚶"],["Water (glasses)","water","💧"],["Sleep (hours)","sleep","😴"]].map(([label,key,ic])=>(
            <div key={key as string} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
              <span>{ic}</span>
              <input placeholder={label as string} value={form[key as keyof typeof form]} onChange={e=>setForm(f=>({...f,[key as string]:e.target.value}))}
                className="bg-transparent text-white text-sm outline-none flex-1 placeholder:text-white/30" type="number"/>
            </div>
          ))}
          <div className="flex gap-1 items-center bg-white/5 rounded-lg px-3 py-2">
            <span className="text-white/60 text-xs mr-1">Mood:</span>
            {moods.map(m=><button key={m} onClick={()=>setForm(f=>({...f,mood:m}))} className={`text-lg ${form.mood===m?"scale-125":""} transition-all`}>{m}</button>)}
          </div>
        </div>
        <button onClick={add} className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold">Log Entry</button>
      </div>
      <div className="space-y-2">
        {logs.map((l,i)=>(
          <div key={i} className="bg-[#06060f] border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-white/60 text-xs w-16">{l.date}</span>
            <span className="text-white/80 text-xs">👣 {l.steps.toLocaleString()}</span>
            <span className="text-white/80 text-xs">💧 {l.water}</span>
            <span className="text-white/80 text-xs">😴 {l.sleep}h</span>
            <span className="text-xl">{l.mood}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Zen Meditation Timer ──────────────────────────────────────
function ZenTimer() {
  const [duration, setDuration] = useState(5);
  const [remaining, setRemaining] = useState(5*60);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<"idle"|"running"|"done">("idle");
  const ivRef = useRef<ReturnType<typeof setInterval>|undefined>(undefined);

  const start = () => {
    setRemaining(duration*60); setPhase("running"); setRunning(true);
    ivRef.current = setInterval(()=>{
      setRemaining(r=>{ if (r<=1){clearInterval(ivRef.current);setPhase("done");setRunning(false);return 0;} return r-1; });
    },1000);
  };
  const stop = () => {clearInterval(ivRef.current);setRunning(false);setPhase("idle");setRemaining(duration*60);};
  const mm = String(Math.floor(remaining/60)).padStart(2,"0");
  const ss = String(remaining%60).padStart(2,"0");
  const prog = 1-(remaining/(duration*60));

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-white/60 text-sm">Choose your meditation duration</div>
      <div className="flex gap-2">
        {[1,3,5,10,15,20].map(d=>(
          <button key={d} onClick={()=>{if(!running){setDuration(d);setRemaining(d*60);}}}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${duration===d&&!running?"bg-teal-500 text-white":"bg-white/10 text-white/60 hover:bg-white/20"}`}>
            {d}m
          </button>
        ))}
      </div>
      <div className="relative w-44 h-44">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6"/>
          <circle cx="50" cy="50" r="45" fill="none" stroke="url(#zen-grad)" strokeWidth="6"
            strokeDasharray={`${2*Math.PI*45}`} strokeDashoffset={`${2*Math.PI*45*(1-prog)}`}
            strokeLinecap="round" className="transition-all duration-1000"/>
          <defs><linearGradient id="zen-grad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#14b8a6"/><stop offset="100%" stopColor="#10b981"/></linearGradient></defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {phase==="done"?<div className="text-4xl">🙏</div>:<>
            <div className="text-4xl font-black text-white">{mm}:{ss}</div>
            <div className="text-white/40 text-xs">{phase==="idle"?"ready":"breathe..."}</div>
          </>}
        </div>
      </div>
      {phase==="done"
        ?<div className="flex flex-col items-center gap-3"><div className="text-teal-400 font-bold text-lg">Session complete 🌿</div><button onClick={stop} className="px-6 py-2 bg-teal-700 text-white rounded-lg font-bold">Go again</button></div>
        :<button onClick={running?stop:start} className={`px-10 py-3 rounded-xl font-bold text-white transition-all text-lg ${running?"bg-red-700 hover:bg-red-600":"bg-teal-600 hover:bg-teal-500"}`}>{running?"Stop":"Begin"}</button>}
    </div>
  );
}

// ── Expense Tracker ───────────────────────────────────────────
function MoneyTracker() {
  type Tx = {id:number;desc:string;amount:number;type:"in"|"out";cat:string};
  const [txs, setTxs] = useState<Tx[]>([
    {id:1,desc:"Salary",amount:50000,type:"in",cat:"💼"},
    {id:2,desc:"Groceries",amount:1200,type:"out",cat:"🛒"},
    {id:3,desc:"Netflix",amount:199,type:"out",cat:"📺"},
    {id:4,desc:"Freelance",amount:8000,type:"in",cat:"💻"},
    {id:5,desc:"Electricity",amount:800,type:"out",cat:"⚡"},
  ]);
  const [form, setForm] = useState({desc:"",amount:"",type:"out" as "in"|"out",cat:"🛒"});
  const cats = ["🛒","💼","📺","🚗","💊","🍕","💻","✈️","🎮","⚡"];
  const nextId = useRef(10);

  const income  = txs.filter(t=>t.type==="in").reduce((a,b)=>a+b.amount,0);
  const expense = txs.filter(t=>t.type==="out").reduce((a,b)=>a+b.amount,0);

  const add = () => {
    if (!form.desc||!form.amount) return;
    setTxs(t=>[{id:nextId.current++,desc:form.desc,amount:parseFloat(form.amount),type:form.type,cat:form.cat},...t]);
    setForm(f=>({...f,desc:"",amount:""}));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {([["💰","Balance","Rs."+(income-expense).toLocaleString(),"text-white"],["📈","Income","Rs."+income.toLocaleString(),"text-green-400"],["📉","Expense","Rs."+expense.toLocaleString(),"text-red-400"]] as string[][]).map(([ic,l,v,cls])=>(
          <div key={l} className="bg-[#06060f] border border-white/10 rounded-xl p-3 text-center">
            <div className="text-xl mb-1">{ic}</div>
            <div className={`font-black text-sm ${cls}`}>{v}</div>
            <div className="text-white/40 text-[10px]">{l}</div>
          </div>
        ))}
      </div>
      <div className="bg-[#06060f] border border-white/10 rounded-xl p-3 space-y-2">
        <div className="flex gap-2">
          <input placeholder="Description" value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none placeholder:text-white/30"/>
          <input placeholder="Amount" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} type="number"
            className="w-28 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none placeholder:text-white/30"/>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1 flex-wrap">{cats.map(c=><button key={c} onClick={()=>setForm(f=>({...f,cat:c}))} className={`text-lg ${form.cat===c?"ring-2 ring-violet-500":""} rounded`}>{c}</button>)}</div>
          <div className="ml-auto flex gap-2">
            {(["in","out"] as const).map(t=><button key={t} onClick={()=>setForm(f=>({...f,type:t}))} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${form.type===t?(t==="in"?"bg-green-600":"bg-red-600"):"bg-white/10"} text-white`}>{t==="in"?"+ Income":"- Expense"}</button>)}
            <button onClick={add} className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold">Add</button>
          </div>
        </div>
      </div>
      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {txs.map(t=>(
          <div key={t.id} className="flex items-center gap-3 bg-[#06060f] border border-white/8 rounded-xl px-3 py-2.5">
            <span className="text-lg">{t.cat}</span>
            <span className="text-white/80 text-sm flex-1">{t.desc}</span>
            <span className={`font-bold text-sm ${t.type==="in"?"text-green-400":"text-red-400"}`}>{t.type==="in"?"+":"-"}Rs.{t.amount.toLocaleString()}</span>
            <button onClick={()=>setTxs(ts=>ts.filter(x=>x.id!==t.id))} className="text-white/20 hover:text-red-400"><FiTrash2 className="w-3 h-3"/></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Crypto Tracker ────────────────────────────────────────────
function CryptoTracker() {
  const coins = [
    {sym:"BTC",name:"Bitcoin",   price:6842320,change:2.4, icon:"₿", color:"text-amber-400"},
    {sym:"ETH",name:"Ethereum",  price:302450, change:-1.2,icon:"Ξ", color:"text-indigo-400"},
    {sym:"SOL",name:"Solana",    price:13240,  change:5.8, icon:"◎", color:"text-purple-400"},
    {sym:"BNB",name:"BNB",       price:51800,  change:0.9, icon:"⬡", color:"text-yellow-400"},
    {sym:"ADA",name:"Cardano",   price:38,     change:-3.1,icon:"₳", color:"text-blue-400"},
    {sym:"DOGE",name:"Dogecoin", price:12,     change:8.2, icon:"Ð", color:"text-amber-500"},
  ];
  const [portfolio] = useState([{sym:"BTC",qty:0.05},{sym:"ETH",qty:0.8},{sym:"SOL",qty:5}]);

  return (
    <div className="space-y-4">
      <div className="bg-[#06060f] border border-white/10 rounded-xl p-4">
        <div className="text-white/60 text-xs mb-3 font-semibold uppercase tracking-wider">Portfolio Value</div>
        <div className="text-3xl font-black text-white mb-1">
          Rs.{portfolio.reduce((acc,p)=>{const c=coins.find(c=>c.sym===p.sym);return acc+(c?c.price*p.qty:0);},0).toLocaleString(undefined,{maximumFractionDigits:0})}
        </div>
        <div className="text-green-400 text-sm">+Rs.14,230 today (+2.1%)</div>
      </div>
      <div className="space-y-2">
        {coins.map(c=>(
          <div key={c.sym} className="flex items-center gap-3 bg-[#06060f] border border-white/8 rounded-xl px-4 py-3">
            <div className={`w-9 h-9 rounded-full bg-white/10 flex items-center justify-center font-black text-lg ${c.color}`}>{c.icon}</div>
            <div className="flex-1"><div className="text-white font-semibold text-sm">{c.name}</div><div className="text-white/40 text-xs">{c.sym}</div></div>
            <div className="text-right">
              <div className="text-white font-semibold text-sm">Rs.{c.price.toLocaleString()}</div>
              <div className={`text-xs font-bold ${c.change>=0?"text-green-400":"text-red-400"}`}>{c.change>=0?"+":""}{c.change}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── News Feed ─────────────────────────────────────────────────
function NewsFeed() {
  const news = [
    {cat:"🤖 AI",title:"GyanTechNet launches Gyan AI v5 with unprecedented reasoning and vision capabilities",time:"2 min ago",src:"GyanTechNet Blog"},
    {cat:"💹 Market",title:"Sensex surges 800 points as IT stocks rally on strong Q4 results",time:"15 min ago",src:"Economic Times"},
    {cat:"🚀 Space",title:"ISRO successfully tests next-generation cryogenic engine for Gaganyaan mission",time:"1 hr ago",src:"NDTV"},
    {cat:"⚡ Energy",title:"India achieves 100 GW solar energy milestone ahead of 2030 target",time:"2 hrs ago",src:"Reuters"},
    {cat:"🎮 Tech",title:"Meta unveils new AR glasses with full holographic display support",time:"3 hrs ago",src:"The Verge"},
    {cat:"🧬 Science",title:"Scientists discover new protein that reverses cellular aging in mice",time:"5 hrs ago",src:"Nature"},
    {cat:"💻 Dev",title:"Gyan Code Assistant adds real-time multi-file context for smarter code suggestions",time:"6 hrs ago",src:"GyanTechNet Dev"},
  ];
  const [saved, setSaved] = useState<number[]>([]);

  return (
    <div className="space-y-3">
      {news.map((n,i)=>(
        <div key={i} className="bg-[#06060f] border border-white/8 rounded-xl p-4 hover:border-white/20 transition-all group">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs bg-white/10 text-white/60 rounded-full px-2 py-0.5">{n.cat}</span>
            <button onClick={()=>setSaved(s=>s.includes(i)?s.filter(x=>x!==i):[...s,i])} className="text-white/20 hover:text-amber-400 transition-colors">
              {saved.includes(i)?"⭐":"☆"}
            </button>
          </div>
          <div className="text-white font-semibold text-sm leading-relaxed group-hover:text-violet-300 transition-colors cursor-pointer">{n.title}</div>
          <div className="flex gap-2 mt-2 text-white/30 text-[10px]"><span>{n.src}</span><span>·</span><span>{n.time}</span></div>
        </div>
      ))}
    </div>
  );
}

// ── AI Write Assistant ────────────────────────────────────────
function AIWrite() {
  const templates = ["Blog Post","Email","Story","Essay","Summary","Cover Letter","Product Description"];
  const [sel, setSel] = useState("Blog Post");
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({messages:[{role:"user",content:`Write a short ${sel} about: ${topic}. Keep it concise (150-200 words).`}],model:"openai/gpt-4o-mini"})});
      const data = await res.json();
      setContent(data.message||"Generated content will appear here.");
    } catch { setContent("Error generating content. Please try again."); }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {templates.map(t=><button key={t} onClick={()=>setSel(t)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${sel===t?"bg-emerald-600 text-white":"bg-white/10 text-white/60 hover:text-white"}`}>{t}</button>)}
      </div>
      <div className="flex gap-2">
        <input value={topic} onChange={e=>setTopic(e.target.value)} onKeyDown={e=>e.key==="Enter"&&generate()}
          placeholder={`Topic for your ${sel}...`} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-emerald-500/50 placeholder:text-white/30"/>
        <button onClick={generate} disabled={loading} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm disabled:opacity-50">
          {loading?"✨ Writing...":"✨ Generate"}
        </button>
      </div>
      {content&&<div className="bg-[#06060f] border border-white/10 rounded-xl p-4 text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{content}</div>}
    </div>
  );
}

// ── Travel Planner ────────────────────────────────────────────
function TravelPlanner() {
  const destinations = [
    {city:"Goa",     emoji:"🏖️",country:"India",temp:"29°C",tag:"Beach",    color:"from-cyan-600 to-blue-700"},
    {city:"Manali",  emoji:"🏔️",country:"India",temp:"8°C", tag:"Mountains",color:"from-indigo-700 to-violet-800"},
    {city:"Jaipur",  emoji:"🏰",country:"India",temp:"34°C",tag:"Heritage", color:"from-amber-600 to-orange-700"},
    {city:"Kerala",  emoji:"🌴",country:"India",temp:"27°C",tag:"Backwaters",color:"from-green-700 to-teal-700"},
    {city:"Varanasi",emoji:"🕌",country:"India",temp:"25°C",tag:"Spiritual",color:"from-rose-700 to-pink-700"},
    {city:"Andaman", emoji:"🐠",country:"India",temp:"28°C",tag:"Island",   color:"from-teal-600 to-cyan-700"},
  ];
  const [saved, setSaved] = useState<string[]>([]);

  return (
    <div className="space-y-4">
      <div className="text-white/60 text-sm">🌍 Discover & plan your next trip</div>
      <div className="grid grid-cols-2 gap-3">
        {destinations.map(d=>(
          <div key={d.city} className={`bg-gradient-to-br ${d.color} rounded-2xl p-4 relative overflow-hidden cursor-pointer hover:scale-105 transition-all`}>
            <div className="absolute top-2 right-2">
              <button onClick={()=>setSaved(s=>s.includes(d.city)?s.filter(x=>x!==d.city):[...s,d.city])} className="text-white/80 hover:text-white text-lg">
                {saved.includes(d.city)?"❤️":"🤍"}
              </button>
            </div>
            <div className="text-3xl mb-2">{d.emoji}</div>
            <div className="text-white font-bold">{d.city}</div>
            <div className="text-white/60 text-xs">{d.country}</div>
            <div className="flex justify-between mt-2 text-xs">
              <span className="bg-black/25 text-white px-2 py-0.5 rounded-full">{d.tag}</span>
              <span className="text-white/80">{d.temp}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================
// ── NEW APPS ──────────────────────────────────────────────────
// =============================================================

// ── GyanTutor ─────────────────────────────────────────────────
function GyanTutorApp() {
  const subjects = ["Mathematics","Science","History","English","Geography","Computer Science","Economics"];
  const [subject, setSubject] = useState("Mathematics");
  const [topic, setTopic] = useState("");
  const [quiz, setQuiz] = useState<{question:string;options:string[];answer:number;explanation:string}|null>(null);
  const [selected, setSelected] = useState<number|null>(null);
  const [score, setScore] = useState({correct:0,total:0});
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true); setQuiz(null); setSelected(null);
    try {
      const res = await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({messages:[{role:"user",content:`Generate a multiple choice quiz question about ${topic||subject} (${subject}). Return ONLY valid JSON: {"question":"...","options":["A","B","C","D"],"answer":0,"explanation":"..."} where answer is the correct index (0-3). No markdown, no explanation outside JSON.`}],model:"openai/gpt-4o-mini"})});
      const data = await res.json();
      const txt = data.message||"";
      const match = txt.match(/\{[\s\S]*\}/);
      if (match) setQuiz(JSON.parse(match[0]));
    } catch {}
    setLoading(false);
  };

  const pick = (i:number) => {
    if (selected!==null||!quiz) return;
    setSelected(i);
    setScore(s=>({correct:s.correct+(i===quiz.answer?1:0),total:s.total+1}));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 bg-[#06060f] border border-white/10 rounded-xl p-3">
        <span className="text-white/40 text-xs">Score:</span>
        <span className="text-emerald-400 font-black text-lg">{score.correct}/{score.total}</span>
        <div className="ml-auto text-amber-400 font-black text-xl">🎓 {score.total>0?Math.round(score.correct/score.total*100):0}%</div>
      </div>
      <div className="flex flex-wrap gap-2">
        {subjects.map(s=>(
          <button key={s} onClick={()=>setSubject(s)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${subject===s?"bg-orange-500 text-white":"bg-white/10 text-white/60 hover:text-white"}`}>{s}</button>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder='Specific topic (optional, e.g. "Pythagoras Theorem")'
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-orange-500/50 placeholder:text-white/30"/>
        <button onClick={generate} disabled={loading} className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-sm disabled:opacity-50 whitespace-nowrap">
          {loading?"Generating...":"New Question"}
        </button>
      </div>
      {quiz && (
        <div className="bg-[#06060f] border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="text-white font-semibold text-base leading-relaxed">{quiz.question}</div>
          <div className="space-y-2">
            {quiz.options.map((opt,i)=>{
              let cls = "bg-white/5 border-white/10 text-white/70";
              if (selected!==null) {
                if (i===quiz.answer) cls="bg-emerald-600/20 border-emerald-500/60 text-emerald-300";
                else if (i===selected) cls="bg-red-600/20 border-red-500/60 text-red-300";
              }
              return (
                <button key={i} onClick={()=>pick(i)} className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${cls} ${selected===null?"hover:bg-white/10 cursor-pointer":""}`}>
                  <span className="text-white/40 mr-2">{["A","B","C","D"][i]}.</span>{opt}
                </button>
              );
            })}
          </div>
          {selected!==null&&<div className="bg-white/5 border border-white/10 rounded-xl p-3 text-white/70 text-sm">💡 {quiz.explanation}</div>}
          {selected!==null&&<button onClick={generate} className="w-full py-2.5 bg-orange-600/30 hover:bg-orange-600/60 text-orange-400 rounded-xl font-bold text-sm border border-orange-500/20">Next Question →</button>}
        </div>
      )}
      {!quiz&&!loading&&<div className="text-center py-8 text-white/30 text-sm">Select a subject and click "New Question" to start</div>}
    </div>
  );
}

// ── Science Lab ───────────────────────────────────────────────
function ScienceLabApp() {
  const elements = [
    {sym:"H", name:"Hydrogen",  num:1, mass:"1.008",  group:"Nonmetal",        color:"bg-sky-700"},
    {sym:"He",name:"Helium",    num:2, mass:"4.003",  group:"Noble Gas",       color:"bg-indigo-700"},
    {sym:"Li",name:"Lithium",   num:3, mass:"6.941",  group:"Alkali Metal",    color:"bg-red-700"},
    {sym:"C", name:"Carbon",    num:6, mass:"12.011", group:"Nonmetal",        color:"bg-slate-700"},
    {sym:"N", name:"Nitrogen",  num:7, mass:"14.007", group:"Nonmetal",        color:"bg-sky-700"},
    {sym:"O", name:"Oxygen",    num:8, mass:"15.999", group:"Nonmetal",        color:"bg-sky-700"},
    {sym:"Na",name:"Sodium",    num:11,mass:"22.990", group:"Alkali Metal",    color:"bg-red-700"},
    {sym:"Mg",name:"Magnesium", num:12,mass:"24.305", group:"Alkaline Earth",  color:"bg-orange-700"},
    {sym:"Al",name:"Aluminium", num:13,mass:"26.982", group:"Post-transition", color:"bg-blue-700"},
    {sym:"Si",name:"Silicon",   num:14,mass:"28.086", group:"Metalloid",       color:"bg-amber-700"},
    {sym:"P", name:"Phosphorus",num:15,mass:"30.974", group:"Nonmetal",        color:"bg-sky-700"},
    {sym:"S", name:"Sulfur",    num:16,mass:"32.065", group:"Nonmetal",        color:"bg-sky-700"},
    {sym:"Cl",name:"Chlorine",  num:17,mass:"35.453", group:"Halogen",         color:"bg-green-700"},
    {sym:"K", name:"Potassium", num:19,mass:"39.098", group:"Alkali Metal",    color:"bg-red-700"},
    {sym:"Ca",name:"Calcium",   num:20,mass:"40.078", group:"Alkaline Earth",  color:"bg-orange-700"},
    {sym:"Fe",name:"Iron",      num:26,mass:"55.845", group:"Transition Metal",color:"bg-yellow-700"},
    {sym:"Cu",name:"Copper",    num:29,mass:"63.546", group:"Transition Metal",color:"bg-yellow-700"},
    {sym:"Zn",name:"Zinc",      num:30,mass:"65.38",  group:"Transition Metal",color:"bg-yellow-700"},
    {sym:"Ag",name:"Silver",    num:47,mass:"107.868",group:"Transition Metal",color:"bg-yellow-700"},
    {sym:"Au",name:"Gold",      num:79,mass:"196.967",group:"Transition Metal",color:"bg-yellow-700"},
    {sym:"Pb",name:"Lead",      num:82,mass:"207.2",  group:"Post-transition", color:"bg-indigo-700"},
    {sym:"U", name:"Uranium",   num:92,mass:"238.029",group:"Actinide",        color:"bg-green-900"},
  ];
  const [selected, setSelected] = useState(elements[5]);
  const [formula, setFormula] = useState("");
  const [result, setResult] = useState("");

  const calc = () => {
    const matches = [...formula.matchAll(/([A-Z][a-z]?)(\d*)/g)];
    let mass = 0; const parts: string[] = [];
    for (const m of matches) {
      const el = elements.find(e=>e.sym===m[1]);
      if (el) { const n=parseInt(m[2]||"1"); mass+=parseFloat(el.mass)*n; parts.push(`${el.name}×${n}`); }
    }
    setResult(parts.length?`${parts.join(" + ")} = ${mass.toFixed(3)} g/mol`:"Unknown formula — use element symbols like H, O, Fe");
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className={`${selected.color} rounded-2xl p-5 text-center w-36 shrink-0`}>
          <div className="text-white/60 text-xs">{selected.num}</div>
          <div className="text-white font-black text-4xl">{selected.sym}</div>
          <div className="text-white/90 font-semibold text-sm mt-1">{selected.name}</div>
          <div className="text-white/60 text-xs mt-1">{selected.mass} g/mol</div>
          <div className="text-white/50 text-[10px] mt-1">{selected.group}</div>
        </div>
        <div className="flex-1 bg-[#06060f] border border-white/10 rounded-xl p-4 space-y-3">
          <div className="text-white font-semibold text-sm">Molecular Mass Calculator</div>
          <div className="flex gap-2">
            <input value={formula} onChange={e=>setFormula(e.target.value)} onKeyDown={e=>e.key==="Enter"&&calc()}
              placeholder="e.g. H2O, CO2, NaCl, H2SO4"
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-teal-500/50 placeholder:text-white/30 font-mono"/>
            <button onClick={calc} className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm font-bold">Calc</button>
          </div>
          {result&&<div className="text-teal-300 text-sm bg-teal-950/30 border border-teal-800/30 rounded-lg px-3 py-2">{result}</div>}
          <div className="text-white/25 text-xs">Click an element below to view its properties</div>
        </div>
      </div>
      <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8">
        {elements.map(el=>(
          <button key={el.sym} onClick={()=>setSelected(el)}
            className={`${el.color} ${selected.sym===el.sym?"ring-2 ring-white":""} rounded-lg p-1.5 text-center hover:brightness-125 transition-all`}>
            <div className="text-white/50 text-[8px]">{el.num}</div>
            <div className="text-white font-black text-sm leading-none">{el.sym}</div>
            <div className="text-white/60 text-[8px] truncate">{el.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── GyanViz ───────────────────────────────────────────────────
function GyanVizApp() {
  type ChartType = "bar"|"line"|"pie";
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [rawData, setRawData] = useState("Jan,120\nFeb,180\nMar,150\nApr,220\nMay,170\nJun,260");

  const data = rawData.split("\n").map(line=>{
    const [name,value] = line.split(",");
    return {name:(name||"").trim(),value:parseInt((value||"0").trim())||0};
  }).filter(d=>d.name);

  const COLORS = ["#7c3aed","#ec4899","#06b6d4","#10b981","#f59e0b","#f43f5e","#8b5cf6"];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["bar","line","pie"] as ChartType[]).map(t=>(
          <button key={t} onClick={()=>setChartType(t)} className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${chartType===t?"bg-violet-600 text-white":"bg-white/10 text-white/60 hover:text-white"}`}>
            {t} Chart
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#06060f] border border-white/10 rounded-xl p-3">
          <div className="text-white/40 text-xs mb-2 font-semibold uppercase tracking-wide">Data (name,value per line)</div>
          <textarea value={rawData} onChange={e=>setRawData(e.target.value)} rows={8}
            className="w-full bg-transparent text-white/80 text-sm font-mono outline-none resize-none"/>
        </div>
        <div className="bg-[#06060f] border border-white/10 rounded-xl p-3 flex items-center justify-center">
          <ResponsiveContainer width="100%" height={220}>
            {chartType==="bar"?(
              <BarChart data={data}>
                <XAxis dataKey="name" tick={{fill:"rgba(255,255,255,0.4)",fontSize:10}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:"rgba(255,255,255,0.4)",fontSize:10}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:"#0d0d1e",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,color:"#fff"}}/>
                <Bar dataKey="value" fill="#7c3aed" radius={[4,4,0,0]}/>
              </BarChart>
            ):chartType==="line"?(
              <LineChart data={data}>
                <XAxis dataKey="name" tick={{fill:"rgba(255,255,255,0.4)",fontSize:10}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:"rgba(255,255,255,0.4)",fontSize:10}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:"#0d0d1e",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,color:"#fff"}}/>
                <Line type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={2.5} dot={{fill:"#7c3aed",r:4}}/>
              </LineChart>
            ):(
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label={({name})=>name} labelLine={false}>
                  {data.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Tooltip contentStyle={{background:"#0d0d1e",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,color:"#fff"}}/>
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ── GyanStudio ────────────────────────────────────────────────
function GyanStudioApp() {
  const STEPS = 16;
  const ROWS = ["Kick","Snare","Hi-Hat","Bass"];
  const [grid, setGrid] = useState<boolean[][]>(()=>ROWS.map(()=>Array(STEPS).fill(false)));
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const [bpm, setBpm] = useState(120);
  const ctxRef = useRef<AudioContext|null>(null);
  const stepRef = useRef(0);
  const gridRef = useRef(grid);
  const intervalRef = useRef<ReturnType<typeof setInterval>|undefined>(undefined);
  gridRef.current = grid;

  const playSound = (row: number) => {
    const ctx = ctxRef.current; if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    if (row===0) {
      osc.frequency.setValueAtTime(150,ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(0.01,ctx.currentTime+0.3);
      gain.gain.setValueAtTime(1,ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+0.3);
      osc.start(); osc.stop(ctx.currentTime+0.3);
    } else if (row===1) {
      osc.type="sawtooth"; osc.frequency.value=200;
      gain.gain.setValueAtTime(0.4,ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+0.12);
      osc.start(); osc.stop(ctx.currentTime+0.12);
    } else if (row===2) {
      osc.type="square"; osc.frequency.value=800;
      gain.gain.setValueAtTime(0.12,ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+0.05);
      osc.start(); osc.stop(ctx.currentTime+0.05);
    } else {
      osc.type="sawtooth"; osc.frequency.value=80;
      gain.gain.setValueAtTime(0.3,ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01,ctx.currentTime+0.2);
      osc.start(); osc.stop(ctx.currentTime+0.2);
    }
  };

  const startPlay = () => {
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    setPlaying(true);
    const interval = (60/bpm/4)*1000;
    intervalRef.current = setInterval(()=>{
      const s = stepRef.current;
      gridRef.current.forEach((row,ri)=>{if(row[s]) playSound(ri);});
      stepRef.current = (s+1)%STEPS;
      setStep(stepRef.current);
    },interval);
  };
  const stopPlay = () => { clearInterval(intervalRef.current); setPlaying(false); setStep(0); stepRef.current=0; };
  const toggle = (ri:number,si:number) => setGrid(g=>g.map((row,r)=>r===ri?row.map((v,s)=>s===si?!v:v):row));

  useEffect(()=>()=>clearInterval(intervalRef.current),[]);

  const presets: {name:string;g:number[][]}[] = [
    {name:"Hip-Hop",g:[[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],[1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0]]},
    {name:"Trap",   g:[[1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0]]},
  ];
  const rowColors = ["bg-violet-600","bg-blue-600","bg-cyan-600","bg-amber-600"];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={playing?stopPlay:startPlay}
          className={`px-5 py-2.5 rounded-xl font-bold text-white text-sm flex items-center gap-2 ${playing?"bg-red-600 hover:bg-red-500":"bg-violet-600 hover:bg-violet-500"}`}>
          {playing?<><FiSquare className="w-4 h-4"/>Stop</>:<><FiPlay className="w-4 h-4"/>Play</>}
        </button>
        <div className="flex items-center gap-2">
          <span className="text-white/50 text-xs">BPM</span>
          <input type="range" min="60" max="180" value={bpm} onChange={e=>setBpm(parseInt(e.target.value))} disabled={playing} className="w-24 accent-violet-500"/>
          <span className="text-white font-bold text-sm w-8">{bpm}</span>
        </div>
        <div className="flex gap-2">
          {presets.map(p=>(
            <button key={p.name} onClick={()=>setGrid(p.g.map(r=>r.map(v=>!!v)))}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/70 rounded-lg text-xs font-semibold">{p.name}</button>
          ))}
          <button onClick={()=>setGrid(ROWS.map(()=>Array(STEPS).fill(false)))}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-red-400 rounded-lg text-xs font-semibold">Clear</button>
        </div>
      </div>
      <div className="bg-[#06060f] border border-white/10 rounded-xl p-3 space-y-2 overflow-x-auto">
        {grid.map((row,ri)=>(
          <div key={ri} className="flex items-center gap-2 min-w-max">
            <div className="w-14 text-right text-white/50 text-xs shrink-0">{ROWS[ri]}</div>
            <div className="flex gap-1">
              {row.map((on,si)=>(
                <button key={si} onClick={()=>toggle(ri,si)}
                  className={`w-7 h-7 rounded transition-all ${si===step&&playing?"ring-2 ring-white/60":""} ${on?rowColors[ri]+" opacity-100":"bg-white/5 hover:bg-white/15"}`}/>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── GyanPixel ─────────────────────────────────────────────────
function GyanPixelApp() {
  const SIZE = 16;
  const PALETTE = ["#7c3aed","#ec4899","#ef4444","#f97316","#eab308","#22c55e","#06b6d4","#3b82f6","#ffffff","#94a3b8","#1e293b","#000000"];
  const [pixels, setPixels] = useState<string[][]>(()=>Array(SIZE).fill(null).map(()=>Array(SIZE).fill("transparent")));
  const [color, setColor] = useState("#7c3aed");
  const [drawing, setDrawing] = useState(false);
  const [tool, setTool] = useState<"draw"|"erase">("draw");

  const paint = (r:number,c:number) => setPixels(p=>p.map((row,ri)=>ri===r?row.map((v,ci)=>ci===c?(tool==="erase"?"transparent":color):v):row));

  return (
    <div className="space-y-3">
      <div className="flex gap-3 items-center flex-wrap">
        <div className="flex gap-1.5 flex-wrap">
          {PALETTE.map(c=>(
            <button key={c} onClick={()=>{setColor(c);setTool("draw");}}
              style={{background:c==="transparent"?"transparent":c,border:`2.5px solid ${color===c&&tool==="draw"?"white":"rgba(255,255,255,0.15)"}`}}
              className="w-6 h-6 rounded"/>
          ))}
        </div>
        <div className="flex gap-1.5">
          <button onClick={()=>setTool("draw")} className={`px-3 py-1 rounded-lg text-xs font-semibold ${tool==="draw"?"bg-violet-600 text-white":"bg-white/10 text-white/60"}`}>✏️ Draw</button>
          <button onClick={()=>setTool("erase")} className={`px-3 py-1 rounded-lg text-xs font-semibold ${tool==="erase"?"bg-white/20 text-white":"bg-white/10 text-white/60"}`}>🧹 Erase</button>
          <button onClick={()=>setPixels(Array(SIZE).fill(null).map(()=>Array(SIZE).fill("transparent")))}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white/60 rounded-lg text-xs">Clear</button>
        </div>
      </div>
      <div className="inline-block bg-[#06060f] border border-white/10 rounded-xl p-2 select-none" onMouseLeave={()=>setDrawing(false)}>
        {pixels.map((row,ri)=>(
          <div key={ri} className="flex">
            {row.map((px,ci)=>(
              <div key={ci}
                style={{background:px==="transparent"?"rgba(255,255,255,0.04)":px,width:20,height:20}}
                className="border border-black/20 cursor-crosshair"
                onMouseDown={()=>{setDrawing(true);paint(ri,ci);}}
                onMouseEnter={()=>{if(drawing)paint(ri,ci);}}
                onMouseUp={()=>setDrawing(false)}/>
            ))}
          </div>
        ))}
      </div>
      <div className="text-white/25 text-xs">Click & drag to paint · 16×16 canvas</div>
    </div>
  );
}

// ── GyanScreen ────────────────────────────────────────────────
function GyanScreenApp() {
  const [recording, setRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string|null>(null);
  const [error, setError] = useState<string|null>(null);
  const mediaRef = useRef<MediaRecorder|null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const start = async () => {
    try {
      setError(null);
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({video:true,audio:true});
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = e=>{if(e.data.size>0)chunksRef.current.push(e.data);};
      rec.onstop = ()=>{
        const blob = new Blob(chunksRef.current,{type:"video/webm"});
        setVideoUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t:MediaStreamTrack)=>t.stop());
        setRecording(false);
      };
      rec.start();
      mediaRef.current = rec;
      setRecording(true);
      setVideoUrl(null);
    } catch(e:any) { setError(e.message||"Permission denied or not supported"); }
  };
  const stop = () => { mediaRef.current?.stop(); };
  const download = () => {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href=videoUrl; a.download="gyanscreen.webm"; a.click();
  };

  return (
    <div className="space-y-5 flex flex-col items-center py-4">
      <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-5xl shadow-2xl ${recording?"animate-pulse":""}`}>
        {recording?"🔴":"📺"}
      </div>
      {recording&&<div className="flex items-center gap-2 text-red-400 font-bold text-sm"><span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-pulse"/>Recording in progress...</div>}
      <div className="flex gap-3">
        {!recording
          ?<button onClick={start} className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-sm flex items-center gap-2"><FiPlay className="w-4 h-4"/>Start Recording</button>
          :<button onClick={stop} className="px-8 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold text-sm flex items-center gap-2"><FiSquare className="w-4 h-4"/>Stop Recording</button>}
      </div>
      {error&&<div className="text-red-400 text-sm bg-red-950/30 border border-red-900/30 rounded-xl px-4 py-2 text-center">{error}</div>}
      {videoUrl&&(
        <div className="w-full space-y-3">
          <video src={videoUrl} controls className="w-full rounded-xl border border-white/10"/>
          <button onClick={download} className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold text-sm flex items-center gap-2 justify-center">
            <FiDownload className="w-4 h-4"/>Download Recording (.webm)
          </button>
        </div>
      )}
      <div className="text-white/30 text-xs text-center max-w-xs">
        Captures your entire screen or a selected window.<br/>Your browser will ask for screen-share permission.
      </div>
    </div>
  );
}

// ── GyanLab ───────────────────────────────────────────────────
function GyanLabApp() {
  const examples = [
    {name:"Fibonacci",code:`function fib(n) {\n  if (n <= 1) return n;\n  return fib(n-1) + fib(n-2);\n}\n\nfor (let i = 0; i <= 10; i++) {\n  console.log(\`fib(\${i}) = \${fib(i)}\`);\n}`},
    {name:"Sort Array", code:`const arr = [64, 25, 12, 22, 11];\nconst sorted = [...arr].sort((a,b)=>a-b);\nconsole.log("Original:", arr);\nconsole.log("Sorted:", sorted);`},
    {name:"Classes",    code:`class Shape {\n  constructor(color) { this.color = color; }\n  describe() { return \`A \${this.color} shape\`; }\n}\nclass Circle extends Shape {\n  constructor(color, r) { super(color); this.radius = r; }\n  area() { return (Math.PI*this.radius**2).toFixed(2); }\n}\nconst c = new Circle("blue", 5);\nconsole.log(c.describe());\nconsole.log("Area:", c.area());`},
  ];
  const [code, setCode] = useState(examples[0].code);
  const [output, setOutput] = useState<string[]>([]);
  const [error, setError] = useState<string|null>(null);

  const run = () => {
    const logs: string[] = [];
    setError(null);
    const orig = console.log;
    // eslint-disable-next-line no-console
    console.log = (...args) => logs.push(args.map(a=>typeof a==="object"?JSON.stringify(a,null,2):String(a)).join(" "));
    try {
      // eslint-disable-next-line no-new-func
      new Function(code)();
      setOutput(logs);
    } catch(e:any) { setError(e.message); setOutput([]); }
    finally { console.log = orig; }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-center flex-wrap">
        <span className="text-white/40 text-xs">Examples:</span>
        {examples.map(e=><button key={e.name} onClick={()=>{setCode(e.code);setOutput([]);setError(null);}} className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white/70 rounded-lg text-xs font-semibold">{e.name}</button>)}
        <span className="ml-auto text-green-400 text-[10px] bg-green-950/30 border border-green-900/20 rounded px-2 py-0.5">JavaScript</span>
        <button onClick={run} className="px-5 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-sm flex items-center gap-2">
          <FiPlay className="w-3.5 h-3.5"/>Run
        </button>
      </div>
      <textarea value={code} onChange={e=>setCode(e.target.value)} rows={8} spellCheck={false}
        className="w-full bg-[#030309] border border-white/10 rounded-xl p-4 text-green-300 text-sm font-mono outline-none resize-none focus:border-green-500/30"/>
      <div className="bg-[#030309] border border-white/10 rounded-xl p-4 min-h-[80px]">
        <div className="text-white/20 text-[10px] mb-2 font-semibold tracking-wider uppercase">Output</div>
        {error?<div className="text-red-400 text-sm font-mono">{error}</div>
          :output.length?output.map((l,i)=><div key={i} className="text-green-300 text-sm font-mono">{l}</div>)
          :<div className="text-white/20 text-sm">Run your code to see output here.</div>}
      </div>
    </div>
  );
}

// ── GyanDebate ────────────────────────────────────────────────
function GyanDebateApp() {
  const topics = ["AI will replace all jobs","Social media does more harm than good","Remote work is better than office","Cryptocurrency is the future of money","Space exploration should be privatised"];
  const [topic, setTopic] = useState(topics[0]);
  const [custom, setCustom] = useState("");
  const [args, setArgs] = useState<{for:string;against:string}|null>(null);
  const [side, setSide] = useState<"for"|"against"|null>(null);
  const [userArg, setUserArg] = useState("");
  const [loading, setLoading] = useState(false);

  const start = async () => {
    setLoading(true); setArgs(null); setSide(null); setUserArg("");
    const t = custom.trim()||topic;
    try {
      const res = await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({messages:[{role:"user",content:`Give ONE strong argument FOR and one AGAINST: "${t}". Return ONLY JSON: {"for":"...","against":"..."} Each under 60 words. No markdown.`}],model:"openai/gpt-4o-mini"})});
      const data = await res.json();
      const match = (data.message||"").match(/\{[\s\S]*\}/);
      if (match) setArgs(JSON.parse(match[0]));
    } catch {}
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {topics.map(t=>(
          <button key={t} onClick={()=>{setTopic(t);setCustom("");setArgs(null);setSide(null);}}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${topic===t&&!custom?"bg-amber-600 text-white":"bg-white/10 text-white/60 hover:text-white"}`}>{t}</button>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={custom} onChange={e=>setCustom(e.target.value)} placeholder="Or type your own topic..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-amber-500/50 placeholder:text-white/30"/>
        <button onClick={start} disabled={loading} className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-sm disabled:opacity-50 whitespace-nowrap">
          {loading?"Loading...":"Start Debate"}
        </button>
      </div>
      {args&&(
        <div className="space-y-3">
          <div className="text-white/50 text-sm text-center font-semibold">Pick a side to argue:</div>
          <div className="grid grid-cols-2 gap-3">
            {(["for","against"] as const).map(s=>(
              <button key={s} onClick={()=>setSide(s)}
                className={`p-4 rounded-xl border text-left transition-all ${side===s?(s==="for"?"bg-green-600/20 border-green-500/60":"bg-red-600/20 border-red-500/60"):"bg-[#06060f] border-white/10 hover:border-white/25"}`}>
                <div className={`font-bold text-sm mb-2 ${s==="for"?"text-green-400":"text-red-400"}`}>{s==="for"?"👍 FOR":"👎 AGAINST"}</div>
                <div className="text-white/70 text-xs leading-relaxed">{args[s]}</div>
              </button>
            ))}
          </div>
          {side&&(
            <div className="space-y-2">
              <textarea value={userArg} onChange={e=>setUserArg(e.target.value)} placeholder="Add your argument to strengthen this side..."
                rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none resize-none focus:border-amber-500/50 placeholder:text-white/30"/>
              {userArg.trim()&&<div className="text-amber-400 text-sm bg-amber-950/20 border border-amber-900/30 rounded-xl p-3">💪 Strong point! Your argument reinforces the {side.toUpperCase()} side.</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── GyanReview ────────────────────────────────────────────────
function GyanReviewApp() {
  type Review = {id:number;name:string;rating:number;text:string;date:string};
  const [reviews, setReviews] = useState<Review[]>([
    {id:1,name:"Arjun S.",rating:5,text:"Amazing platform! The AI tools are incredibly powerful and the UI is beautiful.",date:"Oct 20"},
    {id:2,name:"Priya M.",rating:4,text:"Really good experience overall. The AI chat is very impressive and fast.",date:"Oct 18"},
    {id:3,name:"Rohit K.",rating:5,text:"Best all-in-one AI workspace I've used. Absolutely love it!",date:"Oct 15"},
  ]);
  const [form, setForm] = useState({name:"",rating:5,text:""});
  const nextId = useRef(10);

  const avg = reviews.length?(reviews.reduce((a,b)=>a+b.rating,0)/reviews.length).toFixed(1):"0";
  const dist = [5,4,3,2,1].map(s=>({stars:s,count:reviews.filter(r=>r.rating===s).length}));
  const add = () => {
    if (!form.name.trim()||!form.text.trim()) return;
    setReviews(r=>[{id:nextId.current++,name:form.name,rating:form.rating,text:form.text,date:"Just now"},...r]);
    setForm({name:"",rating:5,text:""});
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 bg-[#06060f] border border-white/10 rounded-xl p-4">
        <div className="text-center shrink-0">
          <div className="text-5xl font-black text-white">{avg}</div>
          <div className="text-amber-400 text-lg">{"⭐".repeat(Math.round(parseFloat(avg)))}</div>
          <div className="text-white/40 text-xs">{reviews.length} reviews</div>
        </div>
        <div className="flex-1 space-y-1.5">
          {dist.map(d=>(
            <div key={d.stars} className="flex items-center gap-2">
              <span className="text-white/40 text-xs w-4">{d.stars}</span>
              <span className="text-amber-400 text-xs">⭐</span>
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all" style={{width:`${reviews.length?d.count/reviews.length*100:0}%`}}/>
              </div>
              <span className="text-white/30 text-xs w-3">{d.count}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-[#06060f] border border-white/10 rounded-xl p-4 space-y-3">
        <div className="text-white font-semibold text-sm">Write a Review</div>
        <div className="flex gap-2">
          <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Your name"
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none placeholder:text-white/30"/>
          <div className="flex gap-0.5">{[1,2,3,4,5].map(s=><button key={s} onClick={()=>setForm(f=>({...f,rating:s}))} className={`text-xl ${s<=form.rating?"text-amber-400":"text-white/20"} hover:scale-110 transition-all`}>⭐</button>)}</div>
        </div>
        <textarea value={form.text} onChange={e=>setForm(f=>({...f,text:e.target.value}))} placeholder="Share your experience..." rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm outline-none resize-none placeholder:text-white/30"/>
        <button onClick={add} className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-sm">Submit Review</button>
      </div>
      <div className="space-y-3">
        {reviews.map(r=>(
          <div key={r.id} className="bg-[#06060f] border border-white/8 rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <div><div className="text-white font-semibold text-sm">{r.name}</div><div className="text-amber-400 text-xs">{"⭐".repeat(r.rating)}</div></div>
              <span className="text-white/30 text-xs">{r.date}</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── GyanRunner ────────────────────────────────────────────────
function GyanRunnerApp() {
  type Run = {id:number;date:string;km:number;minutes:number;calories:number};
  const [runs, setRuns] = useState<Run[]>([
    {id:1,date:"Today",km:5.2,minutes:32,calories:380},
    {id:2,date:"Yesterday",km:3.8,minutes:24,calories:278},
    {id:3,date:"Monday",km:8.0,minutes:52,calories:584},
  ]);
  const [form, setForm] = useState({km:"",minutes:""});
  const nextId = useRef(10);

  const totalKm = runs.reduce((a,b)=>a+b.km,0);
  const totalCal = runs.reduce((a,b)=>a+b.calories,0);
  const bestPace = runs.length?Math.min(...runs.map(r=>r.minutes/r.km)):0;
  const pace = (r:Run) => { const p=r.minutes/r.km; return `${Math.floor(p)}:${String(Math.round((p%1)*60)).padStart(2,"0")}/km`; };

  const add = () => {
    const km=parseFloat(form.km); const min=parseFloat(form.minutes);
    if (!km||!min) return;
    setRuns(r=>[{id:nextId.current++,date:"Just now",km,minutes:min,calories:Math.round(km*75)},...r]);
    setForm({km:"",minutes:""});
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[["🏃","Total Distance",`${totalKm.toFixed(1)} km`],["🔥","Total Calories",`${totalCal} kcal`],["⚡","Best Pace",bestPace?`${Math.floor(bestPace)}:${String(Math.round((bestPace%1)*60)).padStart(2,"0")}/km`:"—"]].map(([ic,l,v])=>(
          <div key={l as string} className="bg-[#06060f] border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl mb-1">{ic}</div>
            <div className="text-white font-black text-sm">{v}</div>
            <div className="text-white/40 text-[10px]">{l}</div>
          </div>
        ))}
      </div>
      <div className="bg-[#06060f] border border-white/10 rounded-xl p-4 space-y-3">
        <div className="text-white font-semibold text-sm">Log a Run</div>
        <div className="flex gap-2">
          <input type="number" value={form.km} onChange={e=>setForm(f=>({...f,km:e.target.value}))} placeholder="Distance (km)"
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none placeholder:text-white/30"/>
          <input type="number" value={form.minutes} onChange={e=>setForm(f=>({...f,minutes:e.target.value}))} placeholder="Duration (min)"
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none placeholder:text-white/30"/>
          <button onClick={add} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold text-sm">Log</button>
        </div>
      </div>
      <div className="space-y-2">
        {runs.map(r=>(
          <div key={r.id} className="flex items-center gap-4 bg-[#06060f] border border-white/8 rounded-xl px-4 py-3">
            <div className="w-10 h-10 rounded-xl bg-green-600/20 flex items-center justify-center text-xl">🏃</div>
            <div className="flex-1"><div className="text-white font-semibold text-sm">{r.km} km run</div><div className="text-white/40 text-xs">{r.date} · {pace(r)}</div></div>
            <div className="text-right"><div className="text-white font-bold text-sm">{r.minutes} min</div><div className="text-orange-400 text-xs">{r.calories} kcal</div></div>
            <button onClick={()=>setRuns(rs=>rs.filter(x=>x.id!==r.id))} className="text-white/20 hover:text-red-400"><FiTrash2 className="w-3.5 h-3.5"/></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── GyanAvatar ────────────────────────────────────────────────
function GyanAvatarApp() {
  const [skin,   setSkin]   = useState("#f4a261");
  const [hair,   setHair]   = useState("#3d2314");
  const [hairStyle, setHairStyle] = useState(0);
  const [eyes,   setEyes]   = useState("#1e3a5f");
  const [shirt,  setShirt]  = useState("#7c3aed");
  const skinTones  = ["#fde8d8","#f4a261","#e07b54","#c1694f","#8d5524","#4a2512"];
  const hairColors = ["#3d2314","#1c1c1c","#d4a853","#e0756a","#a85c7a","#ffffff"];
  const eyeColors  = ["#1e3a5f","#4a3728","#2d6a4f","#9b8ea0","#1e7fc4"];
  const shirtColors= ["#7c3aed","#2563eb","#dc2626","#16a34a","#d97706","#0e7490"];

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <svg width="200" height="210" viewBox="0 0 200 210">
          {/* Body */}
          <ellipse cx="100" cy="195" rx="55" ry="35" fill={shirt}/>
          {/* Neck */}
          <rect x="88" y="125" width="24" height="22" fill={skin} rx="6"/>
          {/* Head */}
          <ellipse cx="100" cy="97" rx="42" ry="44" fill={skin}/>
          {/* Hair base */}
          <ellipse cx="100" cy="58" rx="42" ry="22" fill={hair}/>
          {hairStyle===1&&<ellipse cx="100" cy="97" rx="44" ry="44" fill={hair} clipPath="url(#hair-sides)"/>}
          {hairStyle===2&&[68,80,92,108,120,132].map((x,i)=><circle key={i} cx={x} cy={52} r={11} fill={hair}/>)}
          <defs>
            <clipPath id="hair-sides">
              <rect x="56" y="60" width="16" height="50"/>
              <rect x="128" y="60" width="16" height="50"/>
            </clipPath>
          </defs>
          {/* Eyebrows */}
          <path d="M 75 83 Q 83 79 91 83" stroke={hair} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          <path d="M 109 83 Q 117 79 125 83" stroke={hair} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          {/* Eyes whites */}
          <ellipse cx="83" cy="92" rx="7" ry="8" fill="white"/>
          <ellipse cx="117" cy="92" rx="7" ry="8" fill="white"/>
          {/* Iris */}
          <circle cx="83" cy="93" r="4" fill={eyes}/>
          <circle cx="117" cy="93" r="4" fill={eyes}/>
          {/* Pupils */}
          <circle cx="84" cy="93" r="1.5" fill="#000"/>
          <circle cx="118" cy="93" r="1.5" fill="#000"/>
          {/* Nose */}
          <ellipse cx="100" cy="106" rx="4" ry="3" fill="rgba(0,0,0,0.12)"/>
          {/* Mouth */}
          <path d="M 88 116 Q 100 124 112 116" stroke="rgba(0,0,0,0.25)" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[
          {label:"Skin Tone", colors:skinTones,  val:skin,  set:setSkin},
          {label:"Hair Color",colors:hairColors, val:hair,  set:setHair},
          {label:"Eye Color", colors:eyeColors,  val:eyes,  set:setEyes},
          {label:"Shirt",     colors:shirtColors,val:shirt, set:setShirt},
        ].map(({label,colors,val,set})=>(
          <div key={label}>
            <div className="text-white/40 text-xs mb-1.5">{label}</div>
            <div className="flex gap-1.5 flex-wrap">
              {colors.map(c=><button key={c} onClick={()=>set(c)} style={{background:c,border:`2.5px solid ${val===c?"white":"transparent"}`}} className="w-6 h-6 rounded-full transition-all"/>)}
            </div>
          </div>
        ))}
      </div>
      <div>
        <div className="text-white/40 text-xs mb-1.5">Hair Style</div>
        <div className="flex gap-2">
          {["Short","Side-Long","Curly"].map((s,i)=>(
            <button key={s} onClick={()=>setHairStyle(i)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${hairStyle===i?"bg-violet-600 text-white":"bg-white/10 text-white/60"}`}>{s}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── GyanVoice ─────────────────────────────────────────────────
function GyanVoiceApp() {
  const [text, setText] = useState("Welcome to GyanTechNet! This is Gyan Voice — your AI-powered text to speech engine. Type anything and press Speak.");
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceIdx, setVoiceIdx] = useState(0);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);

  useEffect(()=>{
    const load = ()=>setVoices(speechSynthesis.getVoices().filter(v=>v.lang.startsWith("en")));
    load(); speechSynthesis.onvoiceschanged = load;
    return ()=>{speechSynthesis.cancel();};
  },[]);

  const speak = () => {
    if (!text.trim()) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (voices[voiceIdx]) u.voice = voices[voiceIdx];
    u.rate=rate; u.pitch=pitch;
    u.onstart=()=>setSpeaking(true);
    u.onend=()=>setSpeaking(false);
    u.onerror=()=>setSpeaking(false);
    speechSynthesis.speak(u);
  };
  const stop = ()=>{speechSynthesis.cancel();setSpeaking(false);};

  return (
    <div className="space-y-4">
      <textarea value={text} onChange={e=>setText(e.target.value)} rows={5}
        className="w-full bg-[#06060f] border border-white/10 rounded-xl p-4 text-white text-sm outline-none resize-none focus:border-teal-500/40 placeholder:text-white/30"
        placeholder="Enter text to convert to speech..."/>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-white/40 text-xs mb-1.5">Voice</div>
          <select value={voiceIdx} onChange={e=>setVoiceIdx(parseInt(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none">
            {voices.map((v,i)=><option key={i} value={i} className="bg-[#0d0d1e]">{v.name}</option>)}
            {!voices.length&&<option value={0} className="bg-[#0d0d1e]">Default Voice</option>}
          </select>
        </div>
        <div className="space-y-2">
          {[["Speed",rate,setRate],["Pitch",pitch,setPitch]].map(([label,val,setter])=>(
            <div key={label as string} className="flex items-center gap-2">
              <span className="text-white/40 text-xs w-10">{label as string}</span>
              <input type="range" min="0.5" max="2" step="0.1" value={val as number} onChange={e=>(setter as (v:number)=>void)(parseFloat(e.target.value))} className="flex-1 accent-teal-500"/>
              <span className="text-white/60 text-xs w-6">{(val as number).toFixed(1)}x</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-3 items-center">
        <button onClick={speaking?stop:speak}
          className={`flex-1 py-3 rounded-xl font-bold text-white text-sm flex items-center gap-2 justify-center ${speaking?"bg-red-600 hover:bg-red-500":"bg-teal-600 hover:bg-teal-500"}`}>
          {speaking?<><FiSquare className="w-4 h-4"/>Stop Speaking</>:<><FiVolume2 className="w-4 h-4"/>Speak</>}
        </button>
        {speaking&&<div className="flex items-end gap-0.5">{[4,7,11,9,5,8,12,6].map((h,i)=><div key={i} className="w-1 bg-teal-400 rounded-full animate-pulse" style={{height:h,animationDelay:`${i*0.1}s`}}/>)}</div>}
      </div>
      <div className="text-white/20 text-xs text-center">{text.length} characters · Uses your device's built-in speech engine</div>
    </div>
  );
}

// ── GyanPDF ───────────────────────────────────────────────────
function GyanPDFApp() {
  const [title, setTitle] = useState("My Document");
  const [content, setContent] = useState("# Welcome to GyanPDF\n\nThis document was created using GyanPDF — your intelligent document tool.\n\n## How to use\n\n- Write your content using markdown-style formatting\n- Use # for headings, ## for sub-headings\n- Use - for bullet points\n- Click \"Export PDF\" to print or save as PDF\n\n## Key Features\n\n- Clean document formatting\n- Instant PDF export via browser print\n- Supports headings, lists, and paragraphs");

  const exportPDF = () => {
    const html = content.split("\n").map(l=>{
      if (l.startsWith("# ")) return `<h1>${l.slice(2)}</h1>`;
      if (l.startsWith("## ")) return `<h2>${l.slice(3)}</h2>`;
      if (l.startsWith("### ")) return `<h3>${l.slice(4)}</h3>`;
      if (l.startsWith("- ")) return `<li>${l.slice(2)}</li>`;
      if (l.trim()==="") return "<br/>";
      return `<p>${l}</p>`;
    }).join("");
    const w = window.open("","_blank");
    if (w){
      w.document.write(`<!DOCTYPE html><html><head><title>${title}</title><style>body{font-family:Georgia,serif;max-width:700px;margin:40px auto;padding:20px;color:#1a1a1a;line-height:1.7;font-size:14px}h1{font-size:2em;border-bottom:2px solid #333;padding-bottom:8px;margin-bottom:16px}h2{font-size:1.4em;color:#333;margin-top:24px}h3{font-size:1.1em;color:#555}li{margin:4px 0}ul{padding-left:20px}@media print{body{margin:0}}</style></head><body>${html}<script>window.onload=function(){window.print();}<\/script></body></html>`);
      w.document.close();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Document title"
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-red-500/50 placeholder:text-white/30"/>
        <button onClick={exportPDF} className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-sm flex items-center gap-2">
          <FiDownload className="w-4 h-4"/>Export PDF
        </button>
      </div>
      <textarea value={content} onChange={e=>setContent(e.target.value)} rows={13} spellCheck={false}
        className="w-full bg-[#06060f] border border-white/10 rounded-xl p-4 text-white text-sm font-mono outline-none resize-none focus:border-red-500/30"
        placeholder="Write your document..."/>
      <div className="grid grid-cols-3 gap-2 opacity-50">
        {[["📄","Merge PDFs","Combine files"],["📦","Compress","Reduce size"],["🔍","OCR Extract","Extract text"]].map(([ic,l,d])=>(
          <div key={l as string} className="bg-[#06060f] border border-white/8 rounded-xl p-3 text-center">
            <div className="text-2xl mb-1">{ic}</div>
            <div className="text-white text-xs font-semibold">{l}</div>
            <div className="text-white/40 text-[10px]">{d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── GyanSocial ────────────────────────────────────────────────
function GyanSocialApp() {
  type Post = {id:number;user:string;avatar:string;time:string;content:string;likes:number;liked:boolean;comments:number};
  const [posts, setPosts] = useState<Post[]>([
    {id:1,user:"Arjun Dev",    avatar:"AD",time:"2 min ago", content:"Just generated my first AI video with GyanTechNet! The Gyan Video engine is absolutely mind-blowing 🚀🎬 #GyanVerse #AI",likes:42,liked:false,comments:5},
    {id:2,user:"Priya Singh",  avatar:"PS",time:"15 min ago",content:"Building a complete app with GyanLab and Gyan AI. This platform is incredible for developers! 💻✨ #BuildInPublic",likes:28,liked:true,comments:8},
    {id:3,user:"Rohit Kumar",  avatar:"RK",time:"1 hr ago",  content:"GyanZen + GyanHealth combo is my new daily wellness routine. Mind and body — fully optimised 🧘‍♂️❤️",likes:67,liked:false,comments:12},
    {id:4,user:"Sneha Patel",  avatar:"SP",time:"2 hrs ago", content:"Created a full pitch deck with GyanSlides in 10 minutes flat. Presented it to investors and they loved it! 📊🎉",likes:134,liked:false,comments:21},
  ]);
  const [newPost, setNewPost] = useState("");

  const like = (id:number)=>setPosts(p=>p.map(post=>post.id===id?{...post,liked:!post.liked,likes:post.liked?post.likes-1:post.likes+1}:post));
  const addPost = ()=>{
    if (!newPost.trim()) return;
    setPosts(p=>[{id:Date.now(),user:"You",avatar:"ME",time:"Just now",content:newPost,likes:0,liked:false,comments:0},...p]);
    setNewPost("");
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#06060f] border border-white/10 rounded-xl p-4 space-y-3">
        <textarea value={newPost} onChange={e=>setNewPost(e.target.value)} placeholder="What's happening in your GyanVerse?" rows={2}
          className="w-full bg-white/5 rounded-lg p-3 text-white text-sm outline-none resize-none placeholder:text-white/30"/>
        <div className="flex justify-end"><button onClick={addPost} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm">Post</button></div>
      </div>
      {posts.map(p=>(
        <div key={p.id} className="bg-[#06060f] border border-white/8 rounded-xl p-4">
          <div className="flex gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold text-xs shrink-0">{p.avatar}</div>
            <div><div className="text-white font-semibold text-sm">{p.user}</div><div className="text-white/30 text-xs">{p.time}</div></div>
          </div>
          <p className="text-white/80 text-sm leading-relaxed mb-3">{p.content}</p>
          <div className="flex gap-5 border-t border-white/5 pt-2.5">
            <button onClick={()=>like(p.id)} className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${p.liked?"text-red-400":"text-white/30 hover:text-red-400"}`}>
              <FiHeart className="w-4 h-4"/>{p.likes}
            </button>
            <span className="flex items-center gap-1.5 text-white/30 text-xs">💬 {p.comments}</span>
            <span className="flex items-center gap-1.5 text-white/30 text-xs hover:text-white/60 cursor-pointer">↗ Share</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── GyanStocks ────────────────────────────────────────────────
function GyanStocksApp() {
  const stocks = [
    {sym:"RELIANCE",name:"Reliance Ind.",  price:2842.50, change:1.8,  data:[2700,2730,2780,2760,2800,2830,2842]},
    {sym:"TCS",     name:"Tata Consult.",   price:3950.75, change:-0.5, data:[4000,3980,3970,3960,3975,3965,3950]},
    {sym:"INFY",    name:"Infosys Ltd.",    price:1654.20, change:2.3,  data:[1600,1615,1630,1625,1640,1650,1654]},
    {sym:"HDFC",    name:"HDFC Bank",       price:1732.85, change:-1.1, data:[1760,1755,1748,1740,1738,1735,1732]},
    {sym:"WIPRO",   name:"Wipro Ltd.",      price:478.60,  change:3.1,  data:[455,460,465,470,475,477,478]},
    {sym:"BAJAJ",   name:"Bajaj Finance",   price:7240.00, change:0.7,  data:[7180,7200,7210,7220,7230,7235,7240]},
  ];
  const [selected, setSelected] = useState(stocks[0]);

  return (
    <div className="space-y-4">
      <div className="bg-[#06060f] border border-white/10 rounded-xl p-4">
        <div className="flex justify-between mb-2">
          <div><div className="text-white font-black text-xl">{selected.sym}</div><div className="text-white/50 text-xs">{selected.name}</div></div>
          <div className="text-right"><div className="text-white font-black text-2xl">₹{selected.price.toFixed(2)}</div><div className={`text-sm font-bold ${selected.change>=0?"text-emerald-400":"text-red-400"}`}>{selected.change>=0?"+":""}{selected.change}%</div></div>
        </div>
        <ResponsiveContainer width="100%" height={70}>
          <LineChart data={selected.data.map((v,i)=>({v,i}))}>
            <Line type="monotone" dataKey="v" stroke={selected.change>=0?"#10b981":"#ef4444"} strokeWidth={2} dot={false}/>
            <Tooltip contentStyle={{background:"#0d0d1e",border:"none",fontSize:11,color:"#fff"}} formatter={(v:number)=>[`₹${v.toLocaleString()}`,"Price"]}/>
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2">
        {stocks.map(s=>(
          <button key={s.sym} onClick={()=>setSelected(s)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${selected.sym===s.sym?"bg-white/8 border-white/20":"bg-[#06060f] border-white/5 hover:border-white/15"}`}>
            <div className="flex-1"><div className="text-white font-semibold text-sm">{s.sym}</div><div className="text-white/40 text-xs">{s.name}</div></div>
            <div className="text-right"><div className="text-white text-sm font-semibold">₹{s.price.toFixed(2)}</div><div className={`text-xs font-bold ${s.change>=0?"text-emerald-400":"text-red-400"}`}>{s.change>=0?"+":""}{s.change}%</div></div>
          </button>
        ))}
      </div>
      <div className="text-white/20 text-xs text-center">Prices shown are for demonstration purposes only</div>
    </div>
  );
}

// ── GyanChef ──────────────────────────────────────────────────
function GyanChefApp() {
  const [ingredients, setIngredients] = useState("chicken, rice, tomatoes, onion, garlic, olive oil, cumin");
  const [diet, setDiet] = useState("Any");
  const [recipe, setRecipe] = useState("");
  const [loading, setLoading] = useState(false);
  const diets = ["Any","Vegetarian","Vegan","Keto","High Protein","Low Carb","Indian"];

  const generate = async () => {
    if (!ingredients.trim()) return;
    setLoading(true); setRecipe("");
    try {
      const res = await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({messages:[{role:"user",content:`Create a practical ${diet!=="Any"?diet+" ":""}recipe using: ${ingredients}. Include: Recipe name, prep time, cook time, servings, ingredients with quantities, step-by-step method. Keep it delicious and easy to follow.`}],model:"openai/gpt-4o-mini"})});
      const data = await res.json();
      setRecipe(data.message||"Could not generate recipe. Please try again.");
    } catch { setRecipe("Error generating recipe."); }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {diets.map(d=><button key={d} onClick={()=>setDiet(d)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${diet===d?"bg-amber-600 text-white":"bg-white/10 text-white/60 hover:text-white"}`}>{d}</button>)}
      </div>
      <div className="space-y-2">
        <div className="text-white/50 text-xs">Enter the ingredients you have available:</div>
        <textarea value={ingredients} onChange={e=>setIngredients(e.target.value)} rows={3}
          className="w-full bg-[#06060f] border border-white/10 rounded-xl p-3 text-white text-sm outline-none resize-none focus:border-amber-500/40 placeholder:text-white/30"
          placeholder="e.g. chicken, rice, tomatoes, onion, garlic, spices..."/>
        <button onClick={generate} disabled={loading} className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-sm disabled:opacity-50 flex items-center gap-2 justify-center">
          {loading?"👨‍🍳 Creating recipe...":"👨‍🍳 Generate Recipe"}
        </button>
      </div>
      {recipe&&<div className="bg-[#06060f] border border-white/10 rounded-xl p-4 text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{recipe}</div>}
    </div>
  );
}

// ── GyanLegal ─────────────────────────────────────────────────
function GyanLegalApp() {
  const topics = ["Employment Rights","Contract Review","Consumer Rights","Rental/Tenancy","Startup Legal","Privacy Law","IP Rights","Tax Basics"];
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const ask = async (q?: string) => {
    const query = q||question;
    if (!query.trim()) return;
    setQuestion(query);
    setLoading(true); setAnswer("");
    try {
      const res = await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({messages:[{role:"user",content:`You are a helpful legal information assistant for India. Answer clearly and practically: "${query}". End with a short disclaimer that this is general information, not legal advice.`}],model:"openai/gpt-4o-mini"})});
      const data = await res.json();
      setAnswer(data.message||"Could not get answer. Please try again.");
    } catch { setAnswer("Error fetching answer."); }
    setLoading(false);
  };

  const quickQ = [
    {q:"What are my rights if wrongfully terminated?",icon:"💼"},
    {q:"How do I protect my startup's intellectual property?",icon:"🏢"},
    {q:"What should I check before signing a rental agreement?",icon:"🏠"},
    {q:"What are consumer rights for online purchases in India?",icon:"🛒"},
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {topics.map(t=><button key={t} onClick={()=>ask(`Explain ${t} basics in India`)} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-white/60 hover:bg-violet-600/30 hover:text-violet-300 transition-all">{t}</button>)}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {quickQ.map(q=>(
          <button key={q.q} onClick={()=>ask(q.q)} className="bg-[#06060f] border border-white/8 hover:border-violet-500/30 rounded-xl p-3 text-left transition-all">
            <span className="text-xl">{q.icon}</span>
            <div className="text-white/65 text-xs mt-1 leading-relaxed">{q.q}</div>
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>e.key==="Enter"&&ask()}
          placeholder="Ask any legal question..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-violet-500/50 placeholder:text-white/30"/>
        <button onClick={()=>ask()} disabled={loading} className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold text-sm disabled:opacity-50">
          {loading?"...":"Ask"}
        </button>
      </div>
      {answer&&<div className="bg-[#06060f] border border-violet-500/20 rounded-xl p-4 text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{answer}</div>}
    </div>
  );
}

// ── GyanSpace ─────────────────────────────────────────────────
function GyanSpaceApp() {
  const planets = [
    {name:"Mercury",color:"#b5b5b5",size:5,  orbit:55, speed:5,   desc:"Closest to Sun. No atmosphere. Temperature swings -180°C to 430°C. Smallest planet.",moons:0},
    {name:"Venus",  color:"#e8c56a",size:11, orbit:85, speed:2.4, desc:"Hottest planet (462°C avg). Thick CO₂ atmosphere. Spins backward. No moons.",moons:0},
    {name:"Earth",  color:"#3b82f6",size:12, orbit:120,speed:2,   desc:"Our home. Only known planet with life. 71% water. One moon. Perfect orbit.",moons:1},
    {name:"Mars",   color:"#ef4444",size:7,  orbit:158,speed:1.6, desc:"The Red Planet. Thin CO₂ atmosphere. Home to Olympus Mons — solar system's tallest volcano.",moons:2},
    {name:"Jupiter",color:"#d97706",size:24, orbit:215,speed:0.85,desc:"Largest planet. Great Red Spot (300-year storm). 95 confirmed moons. Protects inner planets.",moons:95},
    {name:"Saturn", color:"#eab308",size:20, orbit:275,speed:0.6, desc:"Famous ring system of ice & rock. Gas giant. 146 moons including Titan with thick atmosphere.",moons:146},
  ];
  const [selected, setSelected] = useState(planets[2]);
  const [angle, setAngle] = useState(planets.map((_,i)=>i*60));

  useEffect(()=>{
    const iv = setInterval(()=>setAngle(a=>a.map((ang,i)=>(ang+planets[i].speed)%360)),50);
    return ()=>clearInterval(iv);
  },[]);

  return (
    <div className="space-y-4">
      <div className="relative bg-[#010108] border border-white/10 rounded-xl overflow-hidden" style={{height:300}}>
        <div className="absolute inset-0" style={{backgroundImage:"radial-gradient(circle,rgba(255,255,255,0.7) 1px,transparent 1px)",backgroundSize:"35px 35px",opacity:0.25}}/>
        <div className="absolute rounded-full shadow-2xl" style={{width:28,height:28,background:"radial-gradient(circle at 40% 40%,#fff7e6,#f59e0b,#b45309)",left:"50%",top:"50%",transform:"translate(-50%,-50%)",boxShadow:"0 0 25px #f59e0b,0 0 60px rgba(245,158,11,0.4)"}}/>
        {planets.map(p=>(
          <div key={p.name} className="absolute rounded-full border border-white/[0.07]" style={{width:p.orbit*2,height:p.orbit*2,left:`calc(50% - ${p.orbit}px)`,top:`calc(50% - ${p.orbit}px)`}}/>
        ))}
        {planets.map((p,i)=>{
          const rad = angle[i]*Math.PI/180;
          return (
            <div key={p.name} className="absolute cursor-pointer hover:scale-150 transition-all"
              style={{width:p.size,height:p.size,background:`radial-gradient(circle at 35% 35%,rgba(255,255,255,0.35),${p.color})`,borderRadius:"50%",left:`calc(50% + ${Math.cos(rad)*p.orbit}px - ${p.size/2}px)`,top:`calc(50% + ${Math.sin(rad)*p.orbit}px - ${p.size/2}px)`,boxShadow:`0 0 ${p.size}px ${p.color}70`}}
              onClick={()=>setSelected(p)} title={p.name}/>
          );
        })}
      </div>
      <div className="bg-[#06060f] border border-white/10 rounded-xl p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-full shrink-0" style={{background:`radial-gradient(circle at 35% 35%,rgba(255,255,255,0.35),${selected.color})`}}/>
        <div>
          <div className="text-white font-black text-base">{selected.name} · {selected.moons} moon{selected.moons!==1?"s":""}</div>
          <p className="text-white/65 text-sm mt-1 leading-relaxed">{selected.desc}</p>
        </div>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {planets.map(p=>(
          <button key={p.name} onClick={()=>setSelected(p)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${selected.name===p.name?"text-white":"text-white/50 hover:text-white/80"}`}
            style={{background:selected.name===p.name?p.color:"rgba(255,255,255,0.07)"}}>
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Website Creator ───────────────────────────────────────────
function WebsiteCreatorApp() {
  type Section = {id:number;type:string;[key:string]:unknown};
  const [sections, setSections] = useState<Section[]>([
    {id:1,type:"hero",title:"Welcome to My Website",subtitle:"Built with GyanTechNet Website Creator — no code required",btn:"Get Started",bg:"#7c3aed"},
    {id:2,type:"features",items:[{icon:"⚡",title:"Lightning Fast",desc:"Blazing performance"},{icon:"🔒",title:"Secure",desc:"Enterprise grade"},{icon:"🎨",title:"Beautiful",desc:"Modern design"}]},
    {id:3,type:"contact",email:"hello@mysite.com",phone:"+91 98765 43210"},
  ]);

  const set = (si:number,field:string,val:unknown) => setSections(p=>p.map((s,i)=>i===si?{...s,[field]:val}:s));

  const preview = () => {
    const html = sections.map(s=>{
      if (s.type==="hero") return `<section style="background:${s.bg};color:white;padding:80px 40px;text-align:center"><h1 style="font-size:2.5em;margin-bottom:16px">${s.title}</h1><p style="font-size:1.2em;opacity:0.85;margin-bottom:32px">${s.subtitle}</p><a href="#" style="background:white;color:${s.bg};padding:14px 32px;border-radius:8px;font-weight:bold;text-decoration:none;font-size:1em">${s.btn}</a></section>`;
      if (s.type==="features") return `<section style="padding:60px 40px;background:#f9fafb;text-align:center"><h2 style="font-size:1.8em;margin-bottom:40px">Features</h2><div style="display:flex;gap:32px;justify-content:center;flex-wrap:wrap">${(s.items as any[]).map(it=>`<div style="max-width:180px"><div style="font-size:2.5em">${it.icon}</div><h3 style="margin:8px 0">${it.title}</h3><p style="color:#666;font-size:0.9em">${it.desc}</p></div>`).join("")}</div></section>`;
      if (s.type==="contact") return `<section style="padding:60px 40px;text-align:center;background:#1e1e2e;color:white"><h2 style="margin-bottom:20px;font-size:1.8em">Contact Us</h2><p>📧 ${s.email}</p><p>📞 ${s.phone}</p></section>`;
      return "";
    }).join("");
    const w=window.open("","_blank");
    if(w){w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>My Website</title></head><body style="margin:0;font-family:system-ui,sans-serif">${html}</body></html>`);w.document.close();}
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={preview} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm flex items-center gap-2">
          <FiGlobe className="w-4 h-4"/>Preview Website
        </button>
      </div>
      <div className="space-y-3">
        {sections.map((s,si)=>(
          <div key={s.id} className="bg-[#06060f] border border-white/10 rounded-xl p-4 space-y-2">
            {s.type==="hero"&&(
              <>
                <div className="flex justify-between items-center">
                  <span className="text-violet-400 text-xs font-bold uppercase tracking-wider">🦸 Hero Section</span>
                  <div className="flex items-center gap-2"><span className="text-white/30 text-xs">Color:</span><input type="color" value={s.bg as string} onChange={e=>set(si,"bg",e.target.value)} className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"/></div>
                </div>
                <input value={s.title as string} onChange={e=>set(si,"title",e.target.value)} placeholder="Headline" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none"/>
                <input value={s.subtitle as string} onChange={e=>set(si,"subtitle",e.target.value)} placeholder="Subtitle" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none"/>
                <input value={s.btn as string} onChange={e=>set(si,"btn",e.target.value)} placeholder="Button text" className="w-36 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none"/>
              </>
            )}
            {s.type==="features"&&(
              <div>
                <span className="text-blue-400 text-xs font-bold uppercase tracking-wider">⚡ Features Section</span>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {(s.items as any[]).map((it,ii)=>(
                    <div key={ii} className="bg-white/5 rounded-lg p-2 text-center">
                      <div className="text-xl">{it.icon}</div>
                      <div className="text-white/70 text-xs font-semibold">{it.title}</div>
                      <div className="text-white/40 text-[10px]">{it.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {s.type==="contact"&&(
              <div className="space-y-2">
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">📬 Contact Section</span>
                <div className="flex gap-2">
                  <input value={s.email as string} onChange={e=>set(si,"email",e.target.value)} placeholder="Email" className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none"/>
                  <input value={s.phone as string} onChange={e=>set(si,"phone",e.target.value)} placeholder="Phone" className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none"/>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── GyanBook ──────────────────────────────────────────────────
function GyanBookApp() {
  type Page = {id:number;title:string;content:string;bookmark:boolean};
  const [pages, setPages] = useState<Page[]>([
    {id:1,title:"Introduction",    content:"Welcome to GyanBook — your personal digital notebook.\n\nThis is your first page. Start writing your thoughts, ideas, and research notes here.\n\nDouble-click the title to rename any page.",bookmark:false},
    {id:2,title:"Research Notes",  content:"Key AI trends 2026:\n• Multi-modal models dominate\n• Edge AI accelerates\n• Agent frameworks mature\n• AI-first products everywhere\n\nGyanTechNet insights: Platform usage doubled this quarter.",bookmark:true},
    {id:3,title:"Ideas",           content:"App ideas:\n1. AI-powered habit tracker\n2. Smart recipe planner with nutrition AI\n3. Voice journal with auto-transcription\n4. Code review bot for PRs",bookmark:false},
  ]);
  const [active, setActive] = useState(1);
  const [editTitle, setEditTitle] = useState(false);
  const nextId = useRef(10);

  const cur = pages.find(p=>p.id===active)||pages[0];
  const upd = (field:"title"|"content",val:string)=>setPages(p=>p.map(pg=>pg.id===active?{...pg,[field]:val}:pg));
  const addPage = ()=>{const id=nextId.current++;setPages(p=>[...p,{id,title:"New Page",content:"",bookmark:false}]);setActive(id);};
  const toggleBm = (id:number)=>setPages(p=>p.map(pg=>pg.id===id?{...pg,bookmark:!pg.bookmark}:pg));
  const del = (id:number)=>{
    if (pages.length<=1) return;
    const remaining=pages.filter(pg=>pg.id!==id);
    setPages(remaining);
    if (active===id) setActive(remaining[0]?.id||0);
  };

  return (
    <div className="flex gap-3" style={{height:320}}>
      <div className="w-44 shrink-0 bg-[#06060f] border border-white/10 rounded-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-2.5 border-b border-white/5 shrink-0">
          <span className="text-white/40 text-xs font-bold uppercase tracking-wider">Pages</span>
          <button onClick={addPage} className="w-5 h-5 bg-violet-600/30 hover:bg-violet-600/60 text-violet-400 rounded flex items-center justify-center"><FiPlus className="w-3 h-3"/></button>
        </div>
        <div className="overflow-y-auto flex-1">
          {pages.map(p=>(
            <div key={p.id} onClick={()=>setActive(p.id)}
              className={`flex items-center gap-1 px-2.5 py-2 cursor-pointer border-b border-white/[0.04] group ${active===p.id?"bg-violet-600/20":""} hover:bg-white/5`}>
              {p.bookmark&&<FiBookmark className="w-3 h-3 text-amber-400 shrink-0"/>}
              <span className="text-white/70 text-xs flex-1 truncate">{p.title}</span>
              <button onClick={e=>{e.stopPropagation();toggleBm(p.id);}} className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-amber-400"><FiBookmark className="w-3 h-3"/></button>
              <button onClick={e=>{e.stopPropagation();del(p.id);}} className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400"><FiTrash2 className="w-3 h-3"/></button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 bg-[#06060f] border border-white/10 rounded-xl flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] shrink-0">
          {editTitle
            ?<input autoFocus value={cur?.title||""} onChange={e=>upd("title",e.target.value)} onBlur={()=>setEditTitle(false)} onKeyDown={e=>e.key==="Enter"&&setEditTitle(false)}
                className="flex-1 bg-transparent text-white font-bold text-sm outline-none border-b border-violet-500/60 pb-0.5"/>
            :<span className="text-white font-bold text-sm flex-1 cursor-pointer" onDoubleClick={()=>setEditTitle(true)} title="Double-click to rename">{cur?.title}</span>}
          <span className="text-white/20 text-xs">{cur?.content.length||0} chars</span>
        </div>
        <textarea value={cur?.content||""} onChange={e=>upd("content",e.target.value)}
          className="flex-1 bg-transparent text-white/80 text-sm p-4 outline-none resize-none font-mono leading-relaxed placeholder:text-white/20"
          placeholder="Start writing... Double-click page title to rename it."/>
      </div>
    </div>
  );
}

// ── GyanResume ────────────────────────────────────────────────
function GyanResumeApp() {
  const [form, setForm] = useState({
    name:"Arjun Sharma", title:"Full Stack Developer",
    email:"arjun@example.com", phone:"+91 98765 43210", location:"Bangalore, India",
    summary:"Passionate developer with 3+ years building scalable web applications. Expert in React, Node.js and cloud architecture. Delivered 10+ production apps serving 50K+ users.",
    experience:[
      {company:"TechCorp India", role:"Senior Developer",   period:"2022–Present",desc:"Led development of AI-powered SaaS platform. Reduced API latency by 40% and scaled to 50K+ users."},
      {company:"StartupXYZ",    role:"Frontend Developer",  period:"2020–2022",   desc:"Built React component library, implemented design system, mentored 3 junior developers."},
    ],
    skills:["React","Node.js","TypeScript","Python","AWS","PostgreSQL","Docker","Git","REST APIs"],
    education:{degree:"B.Tech Computer Science",school:"IIT Bangalore",year:"2020"},
  });
  const f = (k:string,v:string)=>setForm(p=>({...p,[k]:v}));
  const updExp = (i:number,k:string,v:string)=>setForm(p=>({...p,experience:p.experience.map((ex,xi)=>xi===i?{...ex,[k]:v}:ex)}));

  const print = () => {
    const expHtml = form.experience.map(e=>`<div style="margin-bottom:14px"><strong>${e.role}</strong> at ${e.company}<span style="float:right;color:#888;font-size:11px">${e.period}</span><p style="margin:4px 0;color:#555">${e.desc}</p></div>`).join("");
    const html=`<!DOCTYPE html><html><head><title>${form.name} — Resume</title><style>
    body{font-family:Arial,sans-serif;max-width:750px;margin:30px auto;padding:24px;color:#1a1a1a;font-size:13px;line-height:1.5}
    h1{font-size:24px;margin:0 0 4px}h2{font-size:13px;text-transform:uppercase;letter-spacing:1px;border-bottom:1.5px solid #ccc;padding-bottom:4px;margin:18px 0 10px;color:#333}
    .meta{color:#555;font-size:12px}.skills{display:flex;flex-wrap:wrap;gap:6px}.skill{background:#f0f0f0;padding:3px 10px;border-radius:20px;font-size:11px}
    @media print{body{margin:0}}</style></head>
    <body>
    <h1>${form.name}</h1><div class="meta">${form.title} · ${form.email} · ${form.phone} · ${form.location}</div>
    <h2>Summary</h2><p>${form.summary}</p>
    <h2>Experience</h2>${expHtml}
    <h2>Skills</h2><div class="skills">${form.skills.map(s=>`<span class="skill">${s}</span>`).join("")}</div>
    <h2>Education</h2><p>${form.education.degree} — ${form.education.school}, ${form.education.year}</p>
    <script>window.onload=function(){window.print();}<\/script></body></html>`;
    const w=window.open("","_blank");if(w){w.document.write(html);w.document.close();}
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button onClick={print} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm flex items-center gap-2">
          <FiDownload className="w-4 h-4"/>Export Resume PDF
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {[["Full Name","name"],["Job Title","title"],["Email","email"],["Phone","phone"],["Location","location"]].map(([l,k])=>(
          <div key={k}>
            <div className="text-white/35 text-[10px] mb-1 uppercase tracking-wide">{l}</div>
            <input value={(form as any)[k]} onChange={e=>f(k,e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500/40"/>
          </div>
        ))}
      </div>
      <div>
        <div className="text-white/35 text-[10px] mb-1 uppercase tracking-wide">Professional Summary</div>
        <textarea value={form.summary} onChange={e=>f("summary",e.target.value)} rows={2}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none resize-none focus:border-blue-500/40"/>
      </div>
      <div>
        <div className="text-white/35 text-[10px] mb-1 uppercase tracking-wide">Skills (comma-separated)</div>
        <input value={form.skills.join(", ")} onChange={e=>setForm(p=>({...p,skills:e.target.value.split(",").map(s=>s.trim()).filter(Boolean)}))}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500/40"/>
      </div>
      <div>
        <div className="text-white/35 text-[10px] mb-2 uppercase tracking-wide">Experience</div>
        <div className="space-y-2">
          {form.experience.map((exp,i)=>(
            <div key={i} className="bg-[#06060f] border border-white/8 rounded-xl p-3 space-y-2">
              <div className="grid grid-cols-3 gap-2">
                {[["role","Role"],["company","Company"],["period","Period"]].map(([k,l])=>(
                  <input key={k} value={(exp as any)[k]} onChange={e=>updExp(i,k,e.target.value)} placeholder={l}
                    className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs outline-none placeholder:text-white/25"/>
                ))}
              </div>
              <input value={exp.desc} onChange={e=>updExp(i,"desc",e.target.value)} placeholder="Describe your key achievements..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs outline-none placeholder:text-white/25"/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Content Router ────────────────────────────────────────────
function AppContent({ id }: { id: string }) {
  switch(id) {
    case "board":   return <KanbanBoard />;
    case "mind":    return <MindMap />;
    case "health":  return <HealthTracker />;
    case "zen":     return <ZenTimer />;
    case "money":   return <MoneyTracker />;
    case "crypto":  return <CryptoTracker />;
    case "news":    return <NewsFeed />;
    case "write":   return <AIWrite />;
    case "travel":  return <TravelPlanner />;
    case "tutor":   return <GyanTutorApp />;
    case "science": return <ScienceLabApp />;
    case "viz":     return <GyanVizApp />;
    case "studio":  return <GyanStudioApp />;
    case "pixel":   return <GyanPixelApp />;
    case "screen":  return <GyanScreenApp />;
    case "lab":     return <GyanLabApp />;
    case "debate":  return <GyanDebateApp />;
    case "review":  return <GyanReviewApp />;
    case "runner":  return <GyanRunnerApp />;
    case "avatar":  return <GyanAvatarApp />;
    case "voice":   return <GyanVoiceApp />;
    case "pdf":     return <GyanPDFApp />;
    case "social":  return <GyanSocialApp />;
    case "stocks":  return <GyanStocksApp />;
    case "chef":    return <GyanChefApp />;
    case "legal":   return <GyanLegalApp />;
    case "space":   return <GyanSpaceApp />;
    case "website": return <WebsiteCreatorApp />;
    case "book":    return <GyanBookApp />;
    case "resume":  return <GyanResumeApp />;
    default:
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${META[id]?.gradient||"from-violet-600 to-purple-700"} flex items-center justify-center text-4xl mb-5 shadow-2xl`}>
            {META[id]?.emoji||"🎯"}
          </div>
          <h2 className="text-2xl font-black text-white mb-2">{META[id]?.name||id}</h2>
          <p className="text-white/40 text-sm">{META[id]?.desc||"GyanVerse App"}</p>
          <div className="flex items-center gap-2 mt-6">
            <FiCheck className="w-4 h-4 text-violet-400"/><span className="text-white/50 text-sm">App loaded successfully</span>
          </div>
        </div>
      );
  }
}

// ── Main Page ─────────────────────────────────────────────────
export default function GyanVersePage() {
  const params = useParams<{id:string}>();
  const id = params.id || "";
  const meta = META[id] || {name:"GyanVerse App", emoji:"🎯", desc:"", gradient:"from-violet-600 to-purple-700"};
  const [, navigate] = useLocation();

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{background:"#06060f"}}>
      <div className={`bg-gradient-to-r ${meta.gradient} px-5 py-4 flex items-center gap-4 shrink-0`}>
        <button onClick={()=>navigate("/workspaces")} className="w-8 h-8 bg-black/20 hover:bg-black/40 rounded-lg flex items-center justify-center text-white transition-all">
          <FiArrowLeft className="w-4 h-4"/>
        </button>
        <span className="text-3xl">{meta.emoji}</span>
        <div>
          <div className="text-white font-black text-lg leading-tight">{meta.name}</div>
          <div className="text-white/70 text-xs">{meta.desc}</div>
        </div>
        <div className="ml-auto text-white/60 text-xs bg-black/20 px-3 py-1 rounded-full">GyanVerse</div>
      </div>
      <div className="flex-1 overflow-y-auto p-5">
        <AppContent id={id} />
      </div>
    </div>
  );
}
