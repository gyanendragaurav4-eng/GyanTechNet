import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from "recharts";
import { FiRefreshCw, FiDownload, FiTrendingUp, FiUsers, FiDollarSign, FiActivity } from "react-icons/fi";
import { useState } from "react";

const data = [
  { month: "Oct", users: 3200,  sessions: 6800 },
  { month: "Nov", users: 4100,  sessions: 7200 },
  { month: "Dec", users: 4800,  sessions: 7900 },
  { month: "Jan", users: 5200,  sessions: 9100 },
  { month: "Feb", users: 6800,  sessions: 12000 },
  { month: "Mar", users: 7900,  sessions: 14200 },
  { month: "Apr", users: 8912,  sessions: 16832 },
];

function StatCard({ icon: Icon, label, value, change, positive }: {
  icon: React.ElementType; label: string; value: string; change: string; positive: boolean;
}) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 bg-primary/10 rounded-xl">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <span className={`text-[12px] font-bold ${positive ? "text-emerald-400" : "text-red-400"}`}>
          {positive ? "↑" : "↓"} {change}
        </span>
      </div>
      <div className="text-[20px] font-black text-white mb-0.5">{value}</div>
      <div className="text-[12px] text-white/35">{label}</div>
    </div>
  );
}

const TOOLTIP_STYLE = { background: "#0d0d1e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#fff" };

export default function AnalyticsPage() {
  const [chartType, setChartType] = useState<"Area" | "Line" | "Bar">("Area");
  const [range, setRange] = useState("7d");

  return (
    <div className="h-full overflow-y-auto no-scrollbar bg-[#06060f]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-[20px] sm:text-[22px] font-black text-white">GyanDashboard</h1>
              <span className="text-[10px] bg-amber-500 text-black font-black px-2 py-0.5 rounded-full">PRO</span>
            </div>
            <p className="text-[12px] text-white/35">Platform analytics &amp; insights</p>
          </div>
          <div className="sm:ml-auto flex items-center gap-2 flex-wrap">
            <div className="flex bg-white/[0.05] rounded-xl p-1 text-[12px]">
              {["1d","7d","30d","90d"].map(t => (
                <button key={t} onClick={() => setRange(t)}
                  className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${range===t ? "bg-primary text-white" : "text-white/35 hover:text-white/70"}`}>{t}</button>
              ))}
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-white/[0.07] rounded-xl text-[12px] text-white/45 hover:text-white/80 transition-colors">
              <FiRefreshCw className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Refresh</span>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-white/[0.07] rounded-xl text-[12px] text-white/45 hover:text-white/80 transition-colors">
              <FiDownload className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <StatCard icon={FiUsers}      label="Total Users"     value="8,912"   change="24.3%" positive={true} />
          <StatCard icon={FiDollarSign} label="Revenue"         value="Rs.68K"  change="31.2%" positive={true} />
          <StatCard icon={FiActivity}   label="Active Sessions" value="16,832"  change="18.7%" positive={true} />
          <StatCard icon={FiTrendingUp} label="Churn Rate"      value="2.4%"    change="0.8%"  positive={false} />
        </div>

        {/* ── Growth chart ── */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 sm:p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold text-white">Growth Overview</h2>
            <div className="flex bg-white/[0.05] rounded-xl p-0.5 text-[11px]">
              {(["Area","Line","Bar"] as const).map(t => (
                <button key={t} onClick={() => setChartType(t)}
                  className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${chartType===t ? "bg-primary text-white" : "text-white/35 hover:text-white/65"}`}>{t}</button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            {chartType === "Bar" ? (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#555" tick={{fontSize:11}} />
                <YAxis stroke="#555" tick={{fontSize:11}} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="users"    fill="#7c3aed" name="Users"    radius={[4,4,0,0]} />
                <Bar dataKey="sessions" fill="#22d3ee" name="Sessions" radius={[4,4,0,0]} />
              </BarChart>
            ) : chartType === "Line" ? (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#555" tick={{fontSize:11}} />
                <YAxis stroke="#555" tick={{fontSize:11}} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Line type="monotone" dataKey="users"    stroke="#7c3aed" strokeWidth={2} dot={false} name="Users" />
                <Line type="monotone" dataKey="sessions" stroke="#22d3ee" strokeWidth={2} dot={false} name="Sessions" />
              </LineChart>
            ) : (
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22d3ee" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#555" tick={{fontSize:11}} />
                <YAxis stroke="#555" tick={{fontSize:11}} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="users"    stroke="#7c3aed" fill="url(#gUsers)"    strokeWidth={2} name="Users" />
                <Area type="monotone" dataKey="sessions" stroke="#22d3ee" fill="url(#gSessions)" strokeWidth={2} name="Sessions" />
              </AreaChart>
            )}
          </ResponsiveContainer>
          <div className="flex gap-5 mt-3 justify-center text-[12px]">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-primary" /><span className="text-white/40">Users</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-cyan-400" /><span className="text-white/40">Sessions</span></div>
          </div>
        </div>

        {/* ── Quick stats row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label:"Top Country", value:"India 🇮🇳", sub:"42% of users" },
            { label:"Avg Session", value:"8m 32s",    sub:"+12% vs last week" },
            { label:"Bounce Rate", value:"34.2%",     sub:"Below industry avg" },
          ].map(item => (
            <div key={item.label} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4">
              <div className="text-[11px] font-bold text-white/30 uppercase tracking-widest mb-2">{item.label}</div>
              <div className="text-[18px] font-black text-white mb-0.5">{item.value}</div>
              <div className="text-[11.5px] text-white/30">{item.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
