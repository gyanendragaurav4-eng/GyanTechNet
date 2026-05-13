import { useState } from "react";
import {
  FiPlus, FiDownload, FiEye, FiFileText, FiX, FiCheck, FiZap, FiRefreshCw,
  FiMail, FiTrash2,
} from "react-icons/fi";
import { cn } from "@/lib/utils";

type Invoice = {
  id: string; client: string; email: string; amount: string;
  date: string; due: string; status: string; items?: InvoiceItem[];
};

type InvoiceItem = { desc: string; qty: number; rate: string; };

const INITIAL_INVOICES: Invoice[] = [
  { id:"INV-001", client:"TechCorp India",       email:"billing@techcorp.in",    amount:"₹45,000", date:"2026-05-01", due:"2026-05-31", status:"Paid",    items:[{desc:"UI/UX Design Services",qty:1,rate:"₹25,000"},{desc:"Frontend Development",qty:2,rate:"₹10,000"}] },
  { id:"INV-002", client:"StartupIn Pvt Ltd",    email:"finance@startupin.com",  amount:"₹12,500", date:"2026-05-05", due:"2026-06-05", status:"Pending",  items:[{desc:"AI Consulting",qty:5,rate:"₹2,500"}] },
  { id:"INV-003", client:"Enterprise Solutions", email:"accounts@enterprise.io", amount:"₹95,000", date:"2026-04-15", due:"2026-05-15", status:"Overdue",  items:[{desc:"Full Platform Licence",qty:1,rate:"₹95,000"}] },
  { id:"INV-004", client:"Creative Agency",      email:"pay@creative.co",        amount:"₹28,000", date:"2026-05-08", due:"2026-06-08", status:"Pending",  items:[{desc:"Brand Identity Package",qty:1,rate:"₹28,000"}] },
  { id:"INV-005", client:"FinTech IO",            email:"invoice@fintech.io",     amount:"₹55,000", date:"2026-05-10", due:"2026-06-10", status:"Draft",    items:[{desc:"API Integration Work",qty:10,rate:"₹5,500"}] },
];

const STATUS_STYLE: Record<string,string> = {
  Paid:    "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  Pending: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  Overdue: "bg-red-500/15 text-red-400 border-red-500/25",
  Draft:   "bg-white/[0.08] text-white/50 border-white/[0.12]",
};

export default function InvoicesPage() {
  const [invoices, setInvoices]     = useState<Invoice[]>(INITIAL_INVOICES);
  const [showNew, setShowNew]       = useState(false);
  const [preview, setPreview]       = useState<Invoice | null>(null);
  const [aiLoading, setAiLoading]   = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");

  // New invoice form
  const [form, setForm] = useState({ client:"", email:"", due:"", notes:"" });
  const [formItems, setFormItems] = useState<InvoiceItem[]>([{ desc:"", qty:1, rate:"₹" }]);

  const totalRevenue = invoices.filter(i=>i.status==="Paid").reduce((a,i)=>a+parseInt(i.amount.replace(/[^\d]/g,"")||"0"),0);
  const totalPending = invoices.filter(i=>i.status==="Pending").reduce((a,i)=>a+parseInt(i.amount.replace(/[^\d]/g,"")||"0"),0);
  const totalOverdue = invoices.filter(i=>i.status==="Overdue").reduce((a,i)=>a+parseInt(i.amount.replace(/[^\d]/g,"")||"0"),0);

  const filtered = invoices.filter(i => filterStatus === "All" || i.status === filterStatus);

  const addItem = () => setFormItems(p => [...p, { desc:"", qty:1, rate:"₹" }]);
  const updateItem = (idx: number, key: keyof InvoiceItem, val: string | number) =>
    setFormItems(p => p.map((item, i) => i === idx ? { ...item, [key]: val } : item));
  const removeItem = (idx: number) => setFormItems(p => p.filter((_, i) => i !== idx));

  const createInvoice = () => {
    if (!form.client.trim()) return;
    const total = formItems.reduce((a, item) => {
      const n = parseInt(String(item.rate).replace(/[^\d]/g,"") || "0");
      return a + n * item.qty;
    }, 0);
    const inv: Invoice = {
      id: `INV-${String(invoices.length + 1).padStart(3,"0")}`,
      client: form.client,
      email: form.email,
      amount: `₹${total.toLocaleString()}`,
      date: new Date().toISOString().slice(0,10),
      due: form.due || new Date(Date.now() + 30*86400000).toISOString().slice(0,10),
      status: "Draft",
      items: formItems,
    };
    setInvoices(p => [inv, ...p]);
    setForm({ client:"", email:"", due:"", notes:"" });
    setFormItems([{ desc:"", qty:1, rate:"₹" }]);
    setShowNew(false);
  };

  const changeStatus = (id: string, status: string) =>
    setInvoices(p => p.map(i => i.id === id ? { ...i, status } : i));

  const deleteInvoice = (id: string) => {
    setInvoices(p => p.filter(i => i.id !== id));
    if (preview?.id === id) setPreview(null);
  };

  const generateAiInvoice = async () => {
    if (!form.client.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          messages:[{ role:"user", content:`Generate professional invoice line items for client "${form.client}". Return ONLY a JSON array like: [{"desc":"Service name","qty":1,"rate":"₹10,000"}]. Create 3-4 realistic items. Use Indian Rupee (₹) amounts.` }],
          mode:"Business", model:"openai/gpt-4o-mini",
        }),
      });
      const data = await res.json();
      const parsed: InvoiceItem[] = JSON.parse(data.content || "[]");
      if (parsed.length > 0) setFormItems(parsed);
    } catch { /* ignore */ }
    setAiLoading(false);
  };

  const exportInvoice = (inv: Invoice) => {
    const text = `INVOICE\n\n${inv.id}\nClient: ${inv.client}\nEmail: ${inv.email}\nDate: ${inv.date}\nDue: ${inv.due}\nStatus: ${inv.status}\n\nItems:\n${inv.items?.map(i=>`${i.desc} × ${i.qty} @ ${i.rate}`).join("\n") || ""}\n\nTotal: ${inv.amount}`;
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], {type:"text/plain"}));
    a.download = `${inv.id}.txt`; a.click();
  };

  return (
    <div className="flex h-full bg-[#06060f] overflow-hidden">

      {/* Invoice list */}
      <div className={cn("flex flex-col overflow-hidden", preview ? "hidden md:flex md:flex-1" : "flex-1")}>
        <div className="px-4 py-3.5 border-b border-white/[0.06] bg-[#08081a] shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
              <FiFileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-white font-black text-[15px] leading-none">Invoices</h1>
              <p className="text-white/30 text-[10px]">{invoices.length} invoices · billing management</p>
            </div>
            <div className="flex-1" />
            <button onClick={() => setShowNew(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/15 hover:bg-primary/25 text-primary text-[12px] font-bold border border-primary/20 transition-all">
              <FiPlus className="w-3.5 h-3.5" /> New Invoice
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label:"Revenue",  value:`₹${Math.round(totalRevenue/1000)}K`, color:"text-emerald-400" },
              { label:"Pending",  value:`₹${Math.round(totalPending/1000)}K`, color:"text-amber-400" },
              { label:"Overdue",  value:`₹${Math.round(totalOverdue/1000)}K`, color:"text-red-400" },
            ].map(s => (
              <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-center">
                <div className={cn("font-black text-[16px]", s.color)}>{s.value}</div>
                <div className="text-white/25 text-[9px]">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {["All","Paid","Pending","Overdue","Draft"].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={cn("shrink-0 px-2.5 py-1 rounded-full text-[10.5px] font-semibold border transition-all",
                  filterStatus === s ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/25" : "text-white/35 border-white/[0.07] hover:text-white bg-white/[0.03]")}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {/* Desktop table */}
          <div className="hidden sm:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {["Invoice","Client","Amount","Date","Due","Status",""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-white/25 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => (
                  <tr key={inv.id} onClick={() => setPreview(inv)}
                    className={cn("border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors cursor-pointer group",
                      preview?.id === inv.id && "bg-white/[0.05]")}>
                    <td className="px-4 py-3.5 text-[12px] font-mono text-primary font-semibold">{inv.id}</td>
                    <td className="px-4 py-3.5">
                      <div className="text-white/80 text-[13px] font-medium">{inv.client}</div>
                      <div className="text-white/30 text-[10px]">{inv.email}</div>
                    </td>
                    <td className="px-4 py-3.5 text-white font-bold text-[13px]">{inv.amount}</td>
                    <td className="px-4 py-3.5 text-white/35 text-[12px]">{inv.date}</td>
                    <td className="px-4 py-3.5 text-white/35 text-[12px]">{inv.due}</td>
                    <td className="px-4 py-3.5">
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold border", STATUS_STYLE[inv.status])}>{inv.status}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={e=>{e.stopPropagation();exportInvoice(inv);}} className="p-1.5 text-white/25 hover:text-white bg-white/[0.04] rounded-lg transition-all"><FiDownload className="w-3.5 h-3.5" /></button>
                        <button onClick={e=>{e.stopPropagation();deleteInvoice(inv.id);}} className="p-1.5 text-white/25 hover:text-red-400 bg-white/[0.04] rounded-lg transition-all"><FiTrash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-white/[0.04]">
            {filtered.map(inv => (
              <div key={inv.id} onClick={() => setPreview(inv)} className="p-4 flex items-center gap-3 hover:bg-white/[0.03] transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <FiFileText className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-primary font-semibold">{inv.id}</span>
                    <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-bold border", STATUS_STYLE[inv.status])}>{inv.status}</span>
                  </div>
                  <div className="text-white/75 text-[13px] font-medium truncate">{inv.client}</div>
                  <div className="text-white/30 text-[11px]">Due {inv.due}</div>
                </div>
                <div className="text-white font-black text-[14px]">{inv.amount}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invoice detail panel */}
      {preview && (
        <div className="w-full md:w-80 shrink-0 flex flex-col bg-[#08081a] border-l border-white/[0.06]">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] shrink-0">
            <span className="text-white font-bold flex-1 text-[13px]">{preview.id}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => exportInvoice(preview)} className="p-1.5 rounded-lg text-white/30 hover:text-white bg-white/[0.04] transition-all"><FiDownload className="w-3.5 h-3.5" /></button>
              <button onClick={() => deleteInvoice(preview.id)} className="p-1.5 rounded-lg text-white/30 hover:text-red-400 bg-white/[0.04] transition-all"><FiTrash2 className="w-3.5 h-3.5" /></button>
              <button onClick={() => setPreview(null)} className="md:hidden p-1.5 text-white/30 hover:text-white"><FiX className="w-3.5 h-3.5" /></button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-4">
            <div className="text-center py-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <FiFileText className="w-6 h-6 text-primary" />
              </div>
              <div className="text-white font-bold text-[15px]">{preview.client}</div>
              <div className="text-white/40 text-[12px]">{preview.email}</div>
              <span className={cn("text-[10px] px-2.5 py-0.5 rounded-full font-bold border mt-2 inline-block", STATUS_STYLE[preview.status])}>{preview.status}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[["Amount",preview.amount],["Date",preview.date],["Due",preview.due],["Issued",preview.date]].map(([k,v]) => (
                <div key={k} className="bg-white/[0.04] rounded-xl p-3">
                  <div className="text-white/25 text-[9px] uppercase font-bold tracking-widest">{k}</div>
                  <div className="text-white text-[12.5px] font-semibold mt-0.5">{v}</div>
                </div>
              ))}
            </div>

            {preview.items && (
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden">
                <div className="px-3 py-2 border-b border-white/[0.06]">
                  <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Line Items</span>
                </div>
                {preview.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2.5 border-b border-white/[0.04] last:border-0">
                    <div>
                      <div className="text-white/75 text-[12px] font-medium">{item.desc}</div>
                      <div className="text-white/30 text-[10px]">Qty: {item.qty}</div>
                    </div>
                    <div className="text-white font-bold text-[12.5px]">{item.rate}</div>
                  </div>
                ))}
                <div className="flex items-center justify-between px-3 py-3 bg-white/[0.03]">
                  <span className="text-white/50 text-[12px] font-bold">Total</span>
                  <span className="text-white font-black text-[15px]">{preview.amount}</span>
                </div>
              </div>
            )}

            {/* Change status */}
            <div>
              <div className="text-[10px] text-white/25 uppercase font-bold tracking-widest mb-2">Change Status</div>
              <div className="flex gap-1.5 flex-wrap">
                {["Draft","Pending","Paid","Overdue"].map(s => (
                  <button key={s} onClick={() => { changeStatus(preview.id, s); setPreview(prev => prev ? { ...prev, status: s } : prev); }}
                    className={cn("px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all",
                      preview.status === s
                        ? cn("font-bold", STATUS_STYLE[s])
                        : "text-white/35 border-white/[0.07] hover:text-white bg-white/[0.03]")}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-500/15 text-blue-300 text-[12px] font-bold border border-blue-500/20 hover:bg-blue-500/25 transition-all">
                <FiMail className="w-3.5 h-3.5" /> Send
              </button>
              <button onClick={() => exportInvoice(preview)} className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/[0.06] text-white/60 text-[12px] font-bold border border-white/[0.1] hover:bg-white/[0.1] transition-all">
                <FiDownload className="w-3.5 h-3.5" /> Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New invoice modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowNew(false)}>
          <div className="w-full max-w-lg bg-[#0d0d1e] border border-white/[0.1] rounded-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
              <h2 className="text-white font-bold text-[15px]">New Invoice</h2>
              <button onClick={generateAiInvoice} disabled={aiLoading || !form.client.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-500/15 text-violet-300 text-[11px] font-bold hover:bg-violet-500/25 border border-violet-500/20 disabled:opacity-40 transition-all">
                {aiLoading ? <FiRefreshCw className="w-3 h-3 animate-spin" /> : <FiZap className="w-3 h-3" />}
                AI Fill Items
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[["client","Client Name","TechCorp India"],["email","Email","billing@client.com"],["due","Due Date","YYYY-MM-DD"],["notes","Notes","Optional notes"]].map(([id,label,ph]) => (
                  <div key={id} className={id==="notes" ? "col-span-2" : ""}>
                    <label className="text-[10px] text-white/30 uppercase font-bold tracking-widest block mb-1">{label}</label>
                    <input value={(form as Record<string,string>)[id]} onChange={e => setForm(f=>({...f,[id]:e.target.value}))}
                      placeholder={ph}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-[12.5px] outline-none placeholder:text-white/20 focus:border-primary/40 transition-all" />
                  </div>
                ))}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Line Items</span>
                  <button onClick={addItem} className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 font-bold transition-colors">
                    <FiPlus className="w-3 h-3" /> Add Item
                  </button>
                </div>
                <div className="space-y-2">
                  {formItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input value={item.desc} onChange={e => updateItem(idx,"desc",e.target.value)}
                        placeholder="Description" className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-2 text-white text-[12px] outline-none placeholder:text-white/20" />
                      <input value={item.qty} onChange={e => updateItem(idx,"qty",parseInt(e.target.value)||1)} type="number" min={1}
                        className="w-12 bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-2 text-white text-[12px] outline-none text-center" />
                      <input value={item.rate} onChange={e => updateItem(idx,"rate",e.target.value)}
                        placeholder="₹0" className="w-20 bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-2 text-white text-[12px] outline-none placeholder:text-white/20" />
                      <button onClick={() => removeItem(idx)} className="p-1.5 text-white/20 hover:text-red-400 transition-colors">
                        <FiX className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowNew(false)} className="flex-1 py-2.5 rounded-xl border border-white/[0.1] text-white/50 text-[13px] hover:text-white transition-all">Cancel</button>
                <button onClick={createInvoice} disabled={!form.client.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white text-[13px] font-bold disabled:opacity-30 transition-all">
                  <FiCheck className="w-4 h-4" /> Create Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
