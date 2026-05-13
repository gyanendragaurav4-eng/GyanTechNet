import { useState } from "react";
import { useAuth, getUsersDB, saveUsersDB, UserPlan } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import {
  FiCheck, FiX, FiZap, FiStar, FiBriefcase, FiGlobe,
  FiCreditCard, FiSmartphone, FiShield, FiArrowRight,
  FiCheckCircle, FiAlertCircle, FiLoader, FiWifi,
} from "react-icons/fi";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
type PayMethod = "upi" | "card" | "netbanking" | "wallet";

type PlanDef = {
  id: UserPlan;
  name: string;
  price: string;
  priceNum: number;
  period: string;
  color: string;
  icon: React.ReactNode;
  badge?: string;
  desc: string;
  features: string[];
  limit: string;
};

// ─── Plans ────────────────────────────────────────────────────────────────────
const PLANS: PlanDef[] = [
  {
    id: "Free", name: "Free", price: "₹0", priceNum: 0, period: "forever",
    color: "#94a3b8",
    icon: <FiGlobe className="w-5 h-5" />,
    desc: "Get started with basic AI access",
    limit: "50 messages/day",
    features: [
      "Gyan AI Fast (basic)",
      "5 workspace apps",
      "50 AI messages/day",
      "Basic file uploads",
      "Community support",
    ],
  },
  {
    id: "Axol Pro", name: "Axol Pro", price: "₹499", priceNum: 499, period: "/month",
    color: "#3b82f6",
    icon: <FiZap className="w-5 h-5" />,
    badge: "POPULAR",
    desc: "Unlock the full AI powerhouse",
    limit: "Unlimited messages",
    features: [
      "All 17 AI models",
      "All 50+ workspace apps",
      "Unlimited AI messages",
      "Image & Video AI",
      "Priority support",
      "5 GB file storage",
      "Custom AI modes",
    ],
  },
  {
    id: "Axol Ultra", name: "Axol Ultra", price: "₹999", priceNum: 999, period: "/month",
    color: "#7c3aed",
    icon: <FiBriefcase className="w-5 h-5" />,
    badge: "BEST VALUE",
    desc: "Built for teams and power users",
    limit: "Unlimited everything",
    features: [
      "Everything in Axol Pro",
      "Team workspaces (10 seats)",
      "Analytics dashboard",
      "CRM + Invoicing tools",
      "API access & webhooks",
      "25 GB file storage",
      "Dedicated support",
    ],
  },
  {
    id: "Enterprise", name: "Enterprise", price: "Custom", priceNum: 0, period: "",
    color: "#f59e0b",
    icon: <FiStar className="w-5 h-5" />,
    desc: "Custom solutions for large teams",
    limit: "Custom limits",
    features: [
      "Everything in Business",
      "Unlimited seats",
      "Custom AI fine-tuning",
      "On-premise deployment",
      "SLA guarantee",
      "Dedicated account manager",
      "Custom integrations",
    ],
  },
];

// ─── Orders DB ────────────────────────────────────────────────────────────────
type OrderRecord = {
  id: string;
  email: string;
  plan: UserPlan;
  amount: number;
  method: PayMethod;
  ref?: string;
  status: "pending" | "confirmed";
  createdAt: number;
};

const ORDERS_KEY = "gyan_orders_db";
function getOrders(): OrderRecord[] {
  try { return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]"); } catch { return []; }
}
function saveOrder(o: OrderRecord) {
  const orders = getOrders();
  localStorage.setItem(ORDERS_KEY, JSON.stringify([o, ...orders].slice(0, 100)));
}

// ─── Fake QR pattern (no real UPI ID shown) ──────────────────────────────────
function QRPlaceholder({ plan }: { plan: PlanDef }) {
  const cells = Array.from({ length: 25 * 25 }, (_, i) => {
    const r = Math.floor(i / 25), c = i % 25;
    const corner = (r < 7 && c < 7) || (r < 7 && c > 17) || (r > 17 && c < 7);
    const innerCorner = (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
      (r >= 2 && r <= 4 && c >= 20 && c <= 22) ||
      (r >= 20 && r <= 22 && c >= 2 && c <= 4);
    const borderCorner = corner && !innerCorner &&
      !((r === 1 || r === 5) && (c >= 1 && c <= 5)) &&
      !((c === 1 || c === 5) && (r >= 1 && r <= 5)) &&
      !((r === 1 || r === 5) && (c >= 19 && c <= 23)) &&
      !((c === 19 || c === 23) && (r >= 1 && r <= 5)) &&
      !((r === 19 || r === 23) && (c >= 1 && c <= 5)) &&
      !((c === 1 || c === 5) && (r >= 19 && r <= 23));
    if (innerCorner) return true;
    if (borderCorner) return false;
    if (corner) return true;
    const seed = (r * 31 + c * 17 + r * c * 7) % 100;
    return seed < 45;
  });
  return (
    <div className="flex justify-center">
      <div className="p-3 bg-white rounded-2xl shadow-[0_0_40px_rgba(124,58,237,0.3)] relative">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(25, 7px)", gap: "0.5px" }}>
          {cells.map((filled, i) => (
            <div key={i} style={{ width: 7, height: 7, borderRadius: 1,
              background: filled ? "#1a0533" : "transparent" }} />
          ))}
        </div>
        {/* Center logo overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-[11px] font-black text-violet-700 leading-none text-center">G<br/>TN</span>
          </div>
        </div>
        {/* Plan amount label */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#7c3aed] text-white text-[9px] font-black px-3 py-0.5 rounded-full whitespace-nowrap border-2 border-[#06060f]">
          {plan.price}{plan.period}
        </div>
      </div>
    </div>
  );
}

// ─── UPI App buttons ──────────────────────────────────────────────────────────
const UPI_APPS = [
  { id: "phonepe", name: "PhonePe",    bg: "#6739b7", text: "#fff", symbol: "Pe" },
  { id: "gpay",    name: "Google Pay", bg: "#4285f4", text: "#fff", symbol: "G" },
  { id: "paytm",   name: "Paytm",      bg: "#00b9f1", text: "#fff", symbol: "Pt" },
  { id: "bhim",    name: "BHIM",       bg: "#00a859", text: "#fff", symbol: "₹" },
  { id: "amazon",  name: "Amazon Pay", bg: "#ff9900", text: "#000", symbol: "a" },
  { id: "cred",    name: "CRED",       bg: "#1a1a2e", text: "#c0a060", symbol: "C" },
  { id: "mobikwik",name: "MobiKwik",   bg: "#5dade2", text: "#fff", symbol: "M" },
  { id: "other",   name: "Any UPI App",bg: "#374151", text: "#fff", symbol: "⋯" },
];

// ─── UPI Form ─────────────────────────────────────────────────────────────────
function UPIForm({ plan, onSuccess, onClose }: { plan: PlanDef; onSuccess: () => void; onClose: () => void }) {
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [step, setStep] = useState<"select" | "scan" | "utr" | "processing" | "done">("select");
  const [utr, setUtr] = useState("");
  const [err, setErr] = useState("");

  const proceed = (appId: string) => {
    setSelectedApp(appId);
    setStep("scan");
  };

  const submitUTR = async () => {
    const clean = utr.replace(/\s/g, "");
    if (clean.length < 10) { setErr("Please enter a valid UTR / reference number (min 10 digits)."); return; }
    setErr(""); setStep("processing");
    await new Promise(r => setTimeout(r, 2200));
    setStep("done");
    onSuccess();
    saveOrder({
      id: Math.random().toString(36).slice(2).toUpperCase(),
      email: "", plan: plan.id, amount: plan.priceNum,
      method: "upi", ref: clean, status: "confirmed", createdAt: Date.now(),
    });
  };

  if (step === "done") return (
    <div className="flex flex-col items-center py-8 gap-3 text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-1">
        <FiCheckCircle className="w-8 h-8 text-emerald-400" />
      </div>
      <div className="text-white font-black text-[18px]">Payment Verified!</div>
      <div className="text-white/50 text-[13px]">Your <span className="text-violet-400 font-bold">{plan.name}</span> plan is now active. Welcome aboard!</div>
      <button onClick={onClose} className="mt-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-[13px] transition-all">
        Go to Dashboard
      </button>
    </div>
  );

  if (step === "processing") return (
    <div className="flex flex-col items-center py-12 gap-4">
      <div className="w-16 h-16 rounded-full border-4 border-violet-500/30 border-t-violet-500 animate-spin" />
      <div className="text-white font-bold text-[15px]">Verifying Payment…</div>
      <div className="text-white/40 text-[12px]">Checking transaction with bank</div>
    </div>
  );

  if (step === "utr") return (
    <div className="space-y-4">
      <button onClick={() => setStep("scan")} className="text-[11px] text-violet-400 hover:text-violet-300 flex items-center gap-1">
        ← Back
      </button>
      <div className="bg-violet-500/[0.08] border border-violet-500/20 rounded-2xl p-4 text-center">
        <div className="text-[11px] text-white/40 mb-1">Amount paid</div>
        <div className="text-white font-black text-[22px]">{plan.price}<span className="text-[13px] text-white/35 font-semibold">{plan.period}</span></div>
        <div className="text-violet-400 text-[11px] font-semibold mt-0.5">{plan.name} Plan</div>
      </div>
      <div>
        <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">
          UTR / Transaction Reference Number
        </label>
        <input
          value={utr}
          onChange={e => setUtr(e.target.value.replace(/[^0-9a-zA-Z]/g, ""))}
          placeholder="Enter 12-digit UTR from your payment app"
          className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl px-4 py-3 text-[14px] text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 transition-all font-mono tracking-wider"
          autoFocus
        />
        <div className="text-[10px] text-white/25 mt-1.5 leading-relaxed">
          Find UTR in: PhonePe → History → Transaction Details · GPay → Payment Receipt · Paytm → Order History
        </div>
      </div>
      {err && (
        <div className="flex items-center gap-2 bg-red-500/8 border border-red-500/20 rounded-xl px-3 py-2.5">
          <FiAlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="text-[12px] text-red-400">{err}</span>
        </div>
      )}
      <div className="flex items-center gap-2 text-[10px] text-white/25">
        <FiShield className="w-3 h-3 text-emerald-400/70 shrink-0" />
        <span>Your UTR is used only for payment verification. It is encrypted and not shared.</span>
      </div>
      <button onClick={submitUTR}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-violet-600 to-pink-600 text-white font-black rounded-xl shadow-[0_4px_20px_rgba(124,58,237,0.4)] hover:shadow-[0_4px_30px_rgba(124,58,237,0.6)] transition-all text-[14px] active:scale-[0.98]">
        <FiCheckCircle className="w-4 h-4" />
        Confirm & Activate Plan
      </button>
    </div>
  );

  if (step === "scan") {
    const app = UPI_APPS.find(a => a.id === selectedApp);
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <button onClick={() => setStep("select")} className="text-[11px] text-violet-400 hover:text-violet-300 flex items-center gap-1">
            ← Change App
          </button>
          {app && (
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white/60">
              <div className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-black"
                style={{ background: app.bg, color: app.text }}>{app.symbol}</div>
              {app.name}
            </div>
          )}
        </div>

        {/* QR */}
        <QRPlaceholder plan={plan} />

        <div className="mt-5 text-center text-[11px] text-white/35 leading-relaxed">
          Open <span className="text-white/60 font-semibold">{app?.name || "your UPI app"}</span> → Scan QR →
          Pay <span className="text-violet-400 font-bold">{plan.price}</span>
        </div>

        {/* UPI apps grid */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-3">
          <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-2.5 text-center">Or open directly in your app</div>
          <div className="grid grid-cols-4 gap-2">
            {UPI_APPS.slice(0,8).map(app2 => (
              <button key={app2.id}
                onClick={() => setSelectedApp(app2.id)}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
                  selectedApp === app2.id ? "ring-2 ring-violet-500 bg-violet-500/10" : "hover:bg-white/[0.04]"
                )}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-black"
                  style={{ background: app2.bg, color: app2.text }}>{app2.symbol}</div>
                <span className="text-[8.5px] text-white/40 font-semibold leading-none text-center">{app2.name.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 bg-amber-500/8 border border-amber-500/20 rounded-xl px-3.5 py-3">
          <FiAlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-[11px] text-amber-400/80 leading-relaxed">
            After completing payment in your app, click below and enter the UTR to activate your plan instantly.
          </span>
        </div>

        <button onClick={() => setStep("utr")}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-violet-600 to-pink-600 text-white font-black rounded-xl shadow-[0_4px_20px_rgba(124,58,237,0.4)] hover:shadow-[0_4px_30px_rgba(124,58,237,0.6)] transition-all text-[14px] active:scale-[0.98]">
          <FiCheckCircle className="w-4 h-4" />
          I've Paid — Enter UTR Number
          <FiArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // step === "select"
  return (
    <div className="space-y-4">
      <div className="text-center pb-1">
        <div className="text-[12px] text-white/40 mb-0.5">Pay with any UPI app</div>
        <div className="text-white font-black text-[24px]">{plan.price}<span className="text-[14px] text-white/35 font-semibold">{plan.period}</span></div>
        <div className="text-violet-400 text-[12px] font-semibold">{plan.name} Plan</div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {UPI_APPS.map(app => (
          <button key={app.id}
            onClick={() => proceed(app.id)}
            className="flex items-center gap-3 p-3.5 rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/[0.16] transition-all text-left group active:scale-[0.97]">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[15px] font-black shrink-0"
              style={{ background: app.bg, color: app.text }}>{app.symbol}</div>
            <div className="min-w-0">
              <div className="text-white text-[13px] font-bold truncate">{app.name}</div>
              <div className="text-white/30 text-[10px]">UPI · Instant</div>
            </div>
            <FiArrowRight className="w-3.5 h-3.5 text-white/15 group-hover:text-white/40 ml-auto shrink-0 transition-all" />
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 text-[10px] text-white/20 justify-center pt-1">
        <FiShield className="w-3 h-3 text-emerald-400/60" />
        <span>Secured by 256-bit SSL · Zero data stored</span>
      </div>
    </div>
  );
}

// ─── Card Form ────────────────────────────────────────────────────────────────
function CardForm({ plan, onSuccess, onClose }: { plan: PlanDef; onSuccess: () => void; onClose: () => void }) {
  const [num, setNum]     = useState("");
  const [exp, setExp]     = useState("");
  const [cvv, setCvv]     = useState("");
  const [cname, setCname] = useState("");
  const [step, setStep]   = useState<"form" | "processing" | "done">("form");
  const [err, setErr]     = useState("");

  const formatNum = (v: string) => v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();
  const formatExp = (v: string) => { const d = v.replace(/\D/g,"").slice(0,4); return d.length > 2 ? d.slice(0,2)+"/"+d.slice(2) : d; };

  const cardType = () => {
    const n = num.replace(/\s/g,"");
    if (n.startsWith("4")) return "VISA";
    if (n.startsWith("5") || n.startsWith("2")) return "MC";
    if (n.startsWith("6")) return "RUPAY";
    if (n.startsWith("3")) return "AMEX";
    return null;
  };

  const submit = async () => {
    if (num.replace(/\s/g,"").length < 16) { setErr("Enter a valid 16-digit card number."); return; }
    if (exp.length < 5) { setErr("Enter a valid expiry date (MM/YY)."); return; }
    if (cvv.length < 3) { setErr("Enter a valid CVV."); return; }
    if (!cname.trim()) { setErr("Enter the cardholder name."); return; }
    setErr(""); setStep("processing");
    await new Promise(r => setTimeout(r, 3000));
    setStep("done");
    onSuccess();
    saveOrder({
      id: Math.random().toString(36).slice(2).toUpperCase(),
      email: "", plan: plan.id, amount: plan.priceNum,
      method: "card", ref: `****${num.replace(/\s/g,"").slice(-4)}`,
      status: "confirmed", createdAt: Date.now(),
    });
  };

  if (step === "processing") return (
    <div className="flex flex-col items-center py-12 gap-4">
      <div className="w-16 h-16 rounded-full border-4 border-violet-500/30 border-t-violet-500 animate-spin" />
      <div className="text-white font-bold text-[15px]">Processing Payment…</div>
      <div className="text-white/40 text-[12px]">Connecting to payment gateway</div>
    </div>
  );

  if (step === "done") return (
    <div className="flex flex-col items-center py-8 gap-3 text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-1">
        <FiCheckCircle className="w-8 h-8 text-emerald-400" />
      </div>
      <div className="text-white font-black text-[18px]">Payment Successful!</div>
      <div className="text-white/50 text-[13px]">Your <span className="text-violet-400 font-bold">{plan.name}</span> plan is now active.</div>
      <button onClick={onClose} className="mt-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-[13px] transition-all">
        Go to Dashboard
      </button>
    </div>
  );

  const ct = cardType();
  return (
    <div className="space-y-4">
      {/* Card preview */}
      <div className="relative h-40 rounded-2xl overflow-hidden bg-gradient-to-br from-violet-900 via-purple-800 to-pink-900 p-5 border border-white/10 shadow-xl">
        <div className="absolute inset-0 opacity-20" style={{backgroundImage:"radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)"}} />
        <div className="flex justify-between items-start mb-6">
          <div className="text-white/60 text-[10px] font-bold uppercase tracking-widest">GyanTechNet Pay</div>
          {ct && <div className="text-white font-black text-[11px] tracking-widest">{ct}</div>}
        </div>
        <div className="font-mono text-white/80 text-[16px] tracking-[0.2em] mb-4 h-6">
          {num || "•••• •••• •••• ••••"}
        </div>
        <div className="flex justify-between">
          <div><div className="text-white/30 text-[8px] uppercase tracking-widest">Card Holder</div>
            <div className="text-white/70 text-[11px] font-semibold uppercase">{cname || "YOUR NAME"}</div></div>
          <div><div className="text-white/30 text-[8px] uppercase tracking-widest">Expires</div>
            <div className="text-white/70 text-[11px] font-semibold">{exp || "MM/YY"}</div></div>
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-1.5">Card Number</label>
        <div className="relative">
          <FiCreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
          <input value={num} onChange={e => setNum(formatNum(e.target.value))}
            placeholder="1234 5678 9012 3456" maxLength={19}
            className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl pl-10 pr-4 py-3 text-[14px] text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 transition-all font-mono tracking-wider" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-1.5">Expiry</label>
          <input value={exp} onChange={e => setExp(formatExp(e.target.value))}
            placeholder="MM/YY" maxLength={5}
            className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl px-4 py-3 text-[14px] text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 transition-all font-mono" />
        </div>
        <div>
          <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-1.5">CVV</label>
          <input value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g,"").slice(0,4))}
            placeholder="• • •" type="password" maxLength={4}
            className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl px-4 py-3 text-[14px] text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 transition-all" />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-1.5">Cardholder Name</label>
        <input value={cname} onChange={e => setCname(e.target.value.toUpperCase())}
          placeholder="AS ON CARD"
          className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl px-4 py-3 text-[14px] text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 transition-all font-mono tracking-widest" />
      </div>

      {err && (
        <div className="flex items-center gap-2 bg-red-500/8 border border-red-500/20 rounded-xl px-3 py-2.5">
          <FiAlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="text-[12px] text-red-400">{err}</span>
        </div>
      )}

      <div className="flex items-center gap-2 text-[10px] text-white/25">
        <FiShield className="w-3 h-3 text-emerald-400/60" />
        <span>256-bit SSL encrypted · Card details are never stored</span>
      </div>

      <button onClick={submit}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-violet-600 to-pink-600 text-white font-black rounded-xl shadow-[0_4px_20px_rgba(124,58,237,0.4)] hover:shadow-[0_4px_30px_rgba(124,58,237,0.6)] transition-all text-[14px] active:scale-[0.98]">
        <FiCreditCard className="w-4 h-4" />
        Pay {plan.price}{plan.period} Securely
      </button>

      <div className="flex items-center justify-center gap-2 pt-0.5">
        {["VISA","MC","RUPAY","AMEX"].map(c => (
          <div key={c} className="px-2 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[8px] font-black text-white/35 tracking-widest">{c}</div>
        ))}
      </div>
    </div>
  );
}

// ─── Net Banking Form ─────────────────────────────────────────────────────────
const BANKS = [
  { id:"sbi",   name:"SBI",      color:"#22577a" },
  { id:"hdfc",  name:"HDFC",     color:"#003b6f" },
  { id:"icici", name:"ICICI",    color:"#ff6b35" },
  { id:"axis",  name:"Axis",     color:"#97002b" },
  { id:"kotak", name:"Kotak",    color:"#ed1c24" },
  { id:"yes",   name:"Yes Bank", color:"#006fba" },
  { id:"pnb",   name:"PNB",      color:"#1e3a5f" },
  { id:"bob",   name:"Bank of Baroda", color:"#f7941d" },
];

function NetBankingForm({ plan, onSuccess, onClose }: { plan: PlanDef; onSuccess: () => void; onClose: () => void }) {
  const [bank, setBank]   = useState("");
  const [step, setStep]   = useState<"select" | "otp" | "processing" | "done">("select");
  const [otp, setOtp]     = useState("");
  const [err, setErr]     = useState("");

  const proceed = () => {
    if (!bank) { setErr("Please select your bank."); return; }
    setErr(""); setStep("otp");
  };

  const submitOTP = async () => {
    if (otp.replace(/\D/g,"").length < 6) { setErr("Enter the 6-digit OTP sent to your registered mobile."); return; }
    setErr(""); setStep("processing");
    await new Promise(r => setTimeout(r, 2800));
    setStep("done");
    onSuccess();
    saveOrder({
      id: Math.random().toString(36).slice(2).toUpperCase(),
      email: "", plan: plan.id, amount: plan.priceNum,
      method: "netbanking", ref: bank.toUpperCase(),
      status: "confirmed", createdAt: Date.now(),
    });
  };

  if (step === "done") return (
    <div className="flex flex-col items-center py-8 gap-3 text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-1">
        <FiCheckCircle className="w-8 h-8 text-emerald-400" />
      </div>
      <div className="text-white font-black text-[18px]">Payment Successful!</div>
      <div className="text-white/50 text-[13px]">Your <span className="text-violet-400 font-bold">{plan.name}</span> plan is now active.</div>
      <button onClick={onClose} className="mt-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-[13px] transition-all">
        Go to Dashboard
      </button>
    </div>
  );

  if (step === "processing") return (
    <div className="flex flex-col items-center py-12 gap-4">
      <div className="w-16 h-16 rounded-full border-4 border-violet-500/30 border-t-violet-500 animate-spin" />
      <div className="text-white font-bold text-[15px]">Connecting to {BANKS.find(b=>b.id===bank)?.name || "Bank"}…</div>
      <div className="text-white/40 text-[12px]">Verifying OTP and processing</div>
    </div>
  );

  if (step === "otp") return (
    <div className="space-y-4">
      <button onClick={() => setStep("select")} className="text-[11px] text-violet-400 hover:text-violet-300">← Back</button>
      <div className="text-center">
        <div className="text-white font-bold">{BANKS.find(b=>b.id===bank)?.name}</div>
        <div className="text-white/40 text-[12px]">Net Banking · {plan.price}{plan.period}</div>
      </div>
      <div>
        <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest mb-1.5">OTP (sent to registered mobile)</label>
        <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,"").slice(0,6))}
          placeholder="6-digit OTP" maxLength={6} type="tel"
          className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl px-4 py-3 text-[14px] text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 transition-all font-mono tracking-[0.3em] text-center" autoFocus />
      </div>
      {err && <div className="flex items-center gap-2 bg-red-500/8 border border-red-500/20 rounded-xl px-3 py-2.5"><FiAlertCircle className="w-4 h-4 text-red-400 shrink-0" /><span className="text-[12px] text-red-400">{err}</span></div>}
      <button onClick={submitOTP} className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-violet-600 to-pink-600 text-white font-black rounded-xl shadow-[0_4px_20px_rgba(124,58,237,0.4)] transition-all text-[14px] active:scale-[0.98]">
        <FiWifi className="w-4 h-4" />
        Verify & Pay {plan.price}
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="text-center pb-1">
        <div className="text-[12px] text-white/40">Select your bank</div>
        <div className="text-white font-black text-[22px]">{plan.price}<span className="text-[13px] text-white/35 font-semibold">{plan.period}</span></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {BANKS.map(b => (
          <button key={b.id} onClick={() => setBank(b.id)}
            className={cn(
              "flex items-center gap-2.5 p-3 rounded-xl border transition-all text-left",
              bank === b.id ? "border-violet-500/50 bg-violet-500/10" : "border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06]"
            )}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[8px] font-black shrink-0"
              style={{background:b.color}}>{b.name.slice(0,3).toUpperCase()}</div>
            <span className="text-white/70 text-[12px] font-semibold">{b.name}</span>
            {bank === b.id && <FiCheck className="w-3.5 h-3.5 text-violet-400 ml-auto shrink-0" />}
          </button>
        ))}
      </div>
      {err && <div className="flex items-center gap-2 bg-red-500/8 border border-red-500/20 rounded-xl px-3 py-2.5"><FiAlertCircle className="w-4 h-4 text-red-400 shrink-0" /><span className="text-[12px] text-red-400">{err}</span></div>}
      <button onClick={proceed} className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-violet-600 to-pink-600 text-white font-black rounded-xl shadow-[0_4px_20px_rgba(124,58,237,0.4)] transition-all text-[14px] active:scale-[0.98]">
        <FiWifi className="w-4 h-4" />
        Continue to Bank
        <FiArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Wallet Form ──────────────────────────────────────────────────────────────
const WALLETS = [
  { id:"paytm",   name:"Paytm Wallet",   bg:"#00b9f1", symbol:"Pt" },
  { id:"amazon",  name:"Amazon Pay",      bg:"#ff9900", symbol:"a",  textColor:"#000" },
  { id:"jio",     name:"JioMoney",        bg:"#0062cc", symbol:"J" },
  { id:"airtel",  name:"Airtel Money",    bg:"#e40000", symbol:"A" },
  { id:"ola",     name:"Ola Money",       bg:"#23b14d", symbol:"O" },
  { id:"mobikwik",name:"MobiKwik",        bg:"#5dade2", symbol:"M" },
];

function WalletForm({ plan, onSuccess, onClose }: { plan: PlanDef; onSuccess: () => void; onClose: () => void }) {
  const [wallet, setWallet] = useState("");
  const [step, setStep] = useState<"select" | "processing" | "done">("select");
  const [err, setErr] = useState("");

  const pay = async () => {
    if (!wallet) { setErr("Please select a wallet."); return; }
    setErr(""); setStep("processing");
    await new Promise(r => setTimeout(r, 2500));
    setStep("done");
    onSuccess();
    saveOrder({
      id: Math.random().toString(36).slice(2).toUpperCase(),
      email: "", plan: plan.id, amount: plan.priceNum,
      method: "wallet", ref: wallet,
      status: "confirmed", createdAt: Date.now(),
    });
  };

  if (step === "done") return (
    <div className="flex flex-col items-center py-8 gap-3 text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-1">
        <FiCheckCircle className="w-8 h-8 text-emerald-400" />
      </div>
      <div className="text-white font-black text-[18px]">Payment Successful!</div>
      <div className="text-white/50 text-[13px]">Your <span className="text-violet-400 font-bold">{plan.name}</span> plan is now active.</div>
      <button onClick={onClose} className="mt-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-[13px] transition-all">Go to Dashboard</button>
    </div>
  );

  if (step === "processing") return (
    <div className="flex flex-col items-center py-12 gap-4">
      <div className="w-16 h-16 rounded-full border-4 border-violet-500/30 border-t-violet-500 animate-spin" />
      <div className="text-white font-bold text-[15px]">Processing Wallet Payment…</div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="text-center pb-1">
        <div className="text-[12px] text-white/40">Select your wallet</div>
        <div className="text-white font-black text-[22px]">{plan.price}<span className="text-[13px] text-white/35 font-semibold">{plan.period}</span></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {WALLETS.map(w => (
          <button key={w.id} onClick={() => setWallet(w.id)}
            className={cn(
              "flex items-center gap-2.5 p-3 rounded-xl border transition-all",
              wallet === w.id ? "border-violet-500/50 bg-violet-500/10" : "border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06]"
            )}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-[11px] shrink-0"
              style={{background:w.bg, color: (w as any).textColor || "#fff"}}>{w.symbol}</div>
            <span className="text-white/70 text-[11px] font-semibold leading-tight">{w.name}</span>
            {wallet === w.id && <FiCheck className="w-3.5 h-3.5 text-violet-400 ml-auto shrink-0" />}
          </button>
        ))}
      </div>
      {err && <div className="flex items-center gap-2 bg-red-500/8 border border-red-500/20 rounded-xl px-3 py-2.5"><FiAlertCircle className="w-4 h-4 text-red-400 shrink-0" /><span className="text-[12px] text-red-400">{err}</span></div>}
      <button onClick={pay} className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-violet-600 to-pink-600 text-white font-black rounded-xl shadow-[0_4px_20px_rgba(124,58,237,0.4)] transition-all text-[14px] active:scale-[0.98]">
        <FiSmartphone className="w-4 h-4" />
        Pay from Wallet
      </button>
    </div>
  );
}

// ─── Payment Modal ────────────────────────────────────────────────────────────
const METHOD_TABS: { id: PayMethod; label: string; icon: React.ReactNode }[] = [
  { id: "upi",        label: "UPI / QR",    icon: <FiSmartphone className="w-3.5 h-3.5" /> },
  { id: "card",       label: "Card",         icon: <FiCreditCard className="w-3.5 h-3.5" /> },
  { id: "netbanking", label: "Net Banking",  icon: <FiWifi className="w-3.5 h-3.5" /> },
  { id: "wallet",     label: "Wallet",       icon: <FiStar className="w-3.5 h-3.5" /> },
];

function PaymentModal({ plan, onClose, onActivate }: {
  plan: PlanDef;
  onClose: () => void;
  onActivate: () => void;
}) {
  const [method, setMethod] = useState<PayMethod>("upi");
  const [activated, setActivated] = useState(false);

  const handleSuccess = () => {
    setActivated(true);
    onActivate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative w-full sm:max-w-md bg-[#0c0c1e] border border-white/[0.1] sm:rounded-3xl rounded-t-3xl shadow-[0_-20px_60px_rgba(0,0,0,0.7),0_0_0_1px_rgba(124,58,237,0.12)] flex flex-col max-h-[95vh] sm:max-h-[90vh]">

        {/* Top gradient bar */}
        <div className="h-1 bg-gradient-to-r from-violet-600 via-pink-500 to-cyan-500 rounded-t-3xl shrink-0" />

        {/* Drag handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-2 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.07] shrink-0">
          <div>
            <div className="text-white font-black text-[15px]">Complete Payment</div>
            <div className="text-[10.5px] text-white/30 mt-0.5">Secure Checkout · GyanTechNet</div>
          </div>
          <button onClick={onClose} className="p-2 text-white/30 hover:text-white rounded-xl hover:bg-white/[0.07] transition-all">
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Plan summary strip */}
        {!activated && (
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{background:`${plan.color}18`, border:`1px solid ${plan.color}30`}}>
                <span style={{color:plan.color}}>{plan.icon}</span>
              </div>
              <div>
                <div className="text-white font-bold text-[13px] leading-none">{plan.name} Plan</div>
                <div className="text-[10px] text-white/30 mt-0.5">{plan.desc}</div>
              </div>
            </div>
            <div className="text-right shrink-0 ml-3">
              <div className="text-white font-black text-[17px] leading-none">{plan.price}</div>
              <div className="text-[9px] text-white/30">{plan.period}</div>
            </div>
          </div>
        )}

        {/* Method tabs */}
        {!activated && (
          <div className="flex gap-1 px-4 pt-3 pb-2 overflow-x-auto no-scrollbar shrink-0">
            {METHOD_TABS.map(t => (
              <button key={t.id} onClick={() => setMethod(t.id)}
                className={cn(
                  "flex-1 min-w-0 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold transition-all border whitespace-nowrap shrink-0",
                  method === t.id
                    ? "bg-violet-600 border-violet-500 text-white shadow-[0_2px_14px_rgba(124,58,237,0.4)]"
                    : "bg-white/[0.04] border-white/[0.07] text-white/40 hover:text-white/70"
                )}>
                {t.icon}
                <span className="hidden xs:inline">{t.label}</span>
                <span className="xs:hidden">{t.label.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        )}

        {/* Scrollable form body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-2">
          {!activated && method === "upi"        && <UPIForm        plan={plan} onSuccess={handleSuccess} onClose={onClose} />}
          {!activated && method === "card"       && <CardForm       plan={plan} onSuccess={handleSuccess} onClose={onClose} />}
          {!activated && method === "netbanking" && <NetBankingForm plan={plan} onSuccess={handleSuccess} onClose={onClose} />}
          {!activated && method === "wallet"     && <WalletForm     plan={plan} onSuccess={handleSuccess} onClose={onClose} />}
          {activated && (
            <div className="flex flex-col items-center py-8 gap-3 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-1">
                <FiCheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="text-white font-black text-[18px]">All Done!</div>
              <div className="text-white/50 text-[13px]">{plan.name} plan is now active on your account.</div>
              <button onClick={onClose} className="mt-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-[13px] transition-all">
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SubscriptionPage() {
  const { user, upgradePlan } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<PlanDef | null>(null);
  const [justUpgraded, setJustUpgraded] = useState<UserPlan | null>(null);

  const handleActivate = (plan: PlanDef) => {
    upgradePlan(plan.id);
    setJustUpgraded(plan.id);
    // Also persist in user DB
    if (user) {
      const users = getUsersDB();
      saveUsersDB(users.map(u => u.email === user.email ? { ...u, plan: plan.id } : u));
    }
  };

  const currentPlan = user?.plan || "Free";

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-[#050510]">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-10"
          style={{background:"radial-gradient(circle, rgba(124,58,237,1) 0%, transparent 70%)", filter:"blur(100px)"}} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-8"
          style={{background:"radial-gradient(circle, rgba(236,72,153,1) 0%, transparent 70%)", filter:"blur(100px)"}} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 pb-12">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[11px] font-bold uppercase tracking-widest mb-4">
            <FiZap className="w-3 h-3" /> GyanTechNet Plans
          </div>
          <h1 className="text-[32px] sm:text-[42px] font-black text-white leading-tight mb-3">
            Choose Your AI Power
          </h1>
          <p className="text-[14px] text-white/40 max-w-md mx-auto leading-relaxed">
            17 AI models, 50+ workspace tools — one plan. Pay with UPI, Card, Net Banking or Wallet.
          </p>

          {justUpgraded && (
            <div className="mt-5 inline-flex items-center gap-2 px-5 py-3 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl">
              <FiCheckCircle className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400 font-bold text-[14px]">
                🎉 You're now on the {justUpgraded} plan! Enjoy all features.
              </span>
            </div>
          )}
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {PLANS.map(plan => {
            const isCurrent = currentPlan === plan.id;
            const isEnterprise = plan.id === "Enterprise";

            return (
              <div key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-3xl border overflow-hidden transition-all duration-200",
                  isCurrent
                    ? "border-violet-500/50 shadow-[0_0_30px_rgba(124,58,237,0.25)] scale-[1.02]"
                    : "border-white/[0.08] hover:border-white/[0.18] hover:scale-[1.01]"
                )}>

                {/* Color top bar */}
                <div className="h-1.5" style={{background:`linear-gradient(90deg, ${plan.color}, ${plan.color}55)`}} />

                {/* Badges */}
                {plan.badge && !isCurrent && (
                  <div className="absolute top-4 right-3 text-[8.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{background:`${plan.color}22`, color:plan.color, border:`1px solid ${plan.color}40`}}>
                    {plan.badge}
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute top-4 right-3 text-[8.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    ✓ Active
                  </div>
                )}

                <div className="flex flex-col flex-1 p-5 bg-[#0d0d1e]">
                  {/* Icon + name */}
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{background:`${plan.color}18`, border:`1px solid ${plan.color}30`}}>
                      <span style={{color:plan.color}}>{plan.icon}</span>
                    </div>
                    <div>
                      <div className="text-white font-black text-[15px] leading-none">{plan.name}</div>
                      <div className="text-[9px] text-white/30 mt-0.5 font-semibold uppercase tracking-wide">{plan.limit}</div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-1">
                    <span className="text-[30px] font-black text-white leading-none">{plan.price}</span>
                    <span className="text-[12px] text-white/35 ml-1">{plan.period}</span>
                  </div>
                  <div className="text-[11px] text-white/35 mb-4 leading-relaxed">{plan.desc}</div>

                  {/* Features */}
                  <ul className="space-y-1.5 flex-1 mb-5">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-[11.5px] text-white/65">
                        <FiCheck className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{color:plan.color}} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  {isCurrent ? (
                    <div className="w-full py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[12px] font-bold text-center">
                      ✓ Current Plan
                    </div>
                  ) : isEnterprise ? (
                    <button onClick={() => setLocation("/chat")}
                      className="w-full py-2.5 rounded-xl border border-amber-500/30 text-amber-400 text-[12px] font-bold hover:bg-amber-500/10 transition-all">
                      Contact Us →
                    </button>
                  ) : (
                    <button onClick={() => setSelectedPlan(plan)}
                      className="w-full py-2.5 rounded-xl text-white text-[12px] font-black transition-all active:scale-[0.97] shadow-lg hover:shadow-xl hover:brightness-110"
                      style={{
                        background:`linear-gradient(135deg, ${plan.color}, ${plan.color}99)`,
                        boxShadow:`0 4px 16px ${plan.color}35`,
                      }}>
                      Get {plan.name} →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Payment methods strip */}
        <div className="bg-[#0d0d1e] border border-white/[0.07] rounded-2xl px-5 py-4 mb-6">
          <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-3 text-center">Accepted Payment Methods</div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { label: "PhonePe",    color: "#6739b7" },
              { label: "GPay",       color: "#4285f4" },
              { label: "Paytm",      color: "#00b9f1" },
              { label: "BHIM UPI",   color: "#00a859" },
              { label: "Amazon Pay", color: "#ff9900" },
              { label: "VISA",       color: "#1a1f71" },
              { label: "Mastercard", color: "#eb001b" },
              { label: "RuPay",      color: "#097c69" },
              { label: "Net Banking",color: "#64748b" },
              { label: "Wallets",    color: "#8b5cf6" },
            ].map(m => (
              <div key={m.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-[11px] font-semibold text-white/50">
                <div className="w-2 h-2 rounded-full shrink-0" style={{background:m.color}} />
                {m.label}
              </div>
            ))}
          </div>
        </div>

        {/* Trust section */}
        <div className="bg-[#0d0d1e] border border-white/[0.07] rounded-3xl p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: "🔒", title: "Secure Payments",    sub: "256-bit SSL encryption" },
              { icon: "⚡", title: "Instant Activation", sub: "Active within minutes" },
              { icon: "🔄", title: "Cancel Anytime",     sub: "No lock-in contracts" },
              { icon: "🛡️", title: "7-Day Refund",       sub: "Money-back guarantee" },
            ].map(t => (
              <div key={t.title} className="flex items-start gap-3">
                <span className="text-xl shrink-0 mt-0.5">{t.icon}</span>
                <div>
                  <div className="text-white text-[12px] font-bold">{t.title}</div>
                  <div className="text-white/30 text-[10px] mt-0.5">{t.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment modal */}
      {selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onActivate={() => handleActivate(selectedPlan)}
        />
      )}
    </div>
  );
}
