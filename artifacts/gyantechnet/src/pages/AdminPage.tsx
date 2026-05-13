import { useState, useEffect } from "react";
import { useAuth, getUsersDB, saveUsersDB, UserRecord, UserPlan } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import {
  FiUsers, FiShield, FiActivity, FiSettings, FiTrash2, FiEdit2,
  FiLock, FiUnlock, FiStar, FiZap, FiBriefcase, FiGlobe,
  FiRefreshCw, FiCheck, FiX, FiSearch, FiChevronDown, FiBarChart2,
  FiAlertTriangle, FiCpu, FiClock,
} from "react-icons/fi";
import { cn } from "@/lib/utils";

type Tab = "overview" | "users" | "subscriptions" | "platform";

const PLANS: UserPlan[] = ["Free", "Axol Pro", "Axol Ultra", "Enterprise"];

const PLAN_CONFIG: Record<UserPlan, { color: string; icon: React.ReactNode; price: string; badge: string }> = {
  "Free":       { color: "text-white/50",    icon: <FiGlobe className="w-3.5 h-3.5" />,     price: "₹0/mo",    badge: "bg-white/[0.08] text-white/50" },
  "Axol Pro":   { color: "text-blue-400",    icon: <FiZap className="w-3.5 h-3.5" />,        price: "₹499/mo",  badge: "bg-blue-500/15 text-blue-400 border border-blue-500/20" },
  "Axol Ultra": { color: "text-violet-400",  icon: <FiBriefcase className="w-3.5 h-3.5" />, price: "₹999/mo",  badge: "bg-violet-500/15 text-violet-400 border border-violet-500/20" },
  "Enterprise": { color: "text-amber-400",   icon: <FiStar className="w-3.5 h-3.5" />,       price: "Custom",   badge: "bg-amber-500/15 text-amber-400 border border-amber-500/20" },
};

function PlanBadge({ plan }: { plan: UserPlan }) {
  const cfg = PLAN_CONFIG[plan];
  return <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", cfg.badge)}>{plan}</span>;
}

function StatCard({ label, value, sub, icon, color }: { label: string; value: string | number; sub?: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-[#0d0d1e] border border-white/[0.08] rounded-2xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", color)}>{icon}</div>
      </div>
      <div className="text-[26px] font-black text-white leading-none mb-1">{value}</div>
      <div className="text-white/40 text-[12px] font-semibold">{label}</div>
      {sub && <div className="text-white/25 text-[10px] mt-0.5">{sub}</div>}
    </div>
  );
}

export default function AdminPage() {
  const { user, isDeveloper } = useAuth();
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<Tab>("overview");
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [search, setSearch] = useState("");
  const [editUser, setEditUser] = useState<UserRecord | null>(null);
  const [editPlan, setEditPlan] = useState<UserPlan>("Free");
  const [saved, setSaved] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [announceSaved, setAnnounceSaved] = useState(false);

  useEffect(() => {
    if (!isDeveloper) { setLocation("/login"); return; }
    setUsers(getUsersDB());
  }, [isDeveloper, setLocation]);

  const refresh = () => setUsers(getUsersDB());

  const banUser = (email: string) => {
    const updated = getUsersDB().map(u => u.email === email ? { ...u, banned: !u.banned } : u);
    saveUsersDB(updated);
    refresh();
  };

  const deleteUser = (email: string) => {
    if (!confirm("Delete this user permanently?")) return;
    saveUsersDB(getUsersDB().filter(u => u.email !== email));
    refresh();
  };

  const openEdit = (u: UserRecord) => { setEditUser(u); setEditPlan(u.plan); };

  const saveEdit = () => {
    if (!editUser) return;
    saveUsersDB(getUsersDB().map(u => u.email === editUser.email ? { ...u, plan: editPlan, name: editUser.name } : u));
    setEditUser(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    refresh();
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: users.length,
    active: users.filter(u => !u.banned).length,
    banned: users.filter(u => u.banned).length,
    pro: users.filter(u => u.plan === "Axol Pro").length,
    business: users.filter(u => u.plan === "Axol Ultra").length,
    enterprise: users.filter(u => u.plan === "Enterprise").length,
    free: users.filter(u => u.plan === "Free").length,
  };

  if (!isDeveloper) return null;

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview",       label: "Overview",       icon: <FiBarChart2 className="w-4 h-4" /> },
    { id: "users",          label: "Users",          icon: <FiUsers className="w-4 h-4" /> },
    { id: "subscriptions",  label: "Subscriptions",  icon: <FiStar className="w-4 h-4" /> },
    { id: "platform",       label: "Platform",       icon: <FiSettings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#050510] text-white">
      {/* Top bar */}
      <div className="border-b border-white/[0.07] bg-[#08081a] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center shadow-[0_0_16px_rgba(124,58,237,0.5)]">
              <FiShield className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-white font-black text-[15px] leading-none">Admin Console</div>
              <div className="text-[10px] text-violet-400 font-semibold mt-0.5">GyanTechNet Platform Control</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-emerald-400 font-semibold">{user?.name}</span>
              <span className="text-[10px] text-emerald-400/60">· Developer</span>
            </div>
            <button onClick={() => setLocation("/chat")}
              className="text-[12px] text-white/40 hover:text-white border border-white/10 hover:border-white/20 rounded-xl px-3 py-1.5 transition-all">
              ← Back to App
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[#0d0d1e] border border-white/[0.07] rounded-2xl p-1 w-fit">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all",
                tab === t.id ? "bg-gradient-to-r from-violet-600 to-violet-700 text-white shadow-[0_2px_12px_rgba(124,58,237,0.3)]" : "text-white/40 hover:text-white/70"
              )}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {/* ─── OVERVIEW ─── */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="Total Users" value={stats.total} icon={<FiUsers className="w-4.5 h-4.5 text-violet-400" />} color="bg-violet-500/15" />
              <StatCard label="Active Users" value={stats.active} sub={`${stats.banned} suspended`} icon={<FiActivity className="w-4.5 h-4.5 text-emerald-400" />} color="bg-emerald-500/15" />
              <StatCard label="Paid Plans" value={stats.pro + stats.business + stats.enterprise} sub={`${stats.free} on Free`} icon={<FiStar className="w-4.5 h-4.5 text-amber-400" />} color="bg-amber-500/15" />
              <StatCard label="Suspended" value={stats.banned} icon={<FiLock className="w-4.5 h-4.5 text-red-400" />} color="bg-red-500/15" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Plan distribution */}
              <div className="bg-[#0d0d1e] border border-white/[0.08] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-5">
                  <FiBarChart2 className="w-4 h-4 text-violet-400" />
                  <h3 className="text-white font-bold text-[14px]">Plan Distribution</h3>
                </div>
                <div className="space-y-3">
                  {PLANS.map(plan => {
                    const count = users.filter(u => u.plan === plan).length;
                    const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
                    const cfg = PLAN_CONFIG[plan];
                    return (
                      <div key={plan}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className={cfg.color}>{cfg.icon}</span>
                            <span className="text-white/70 text-[12px] font-semibold">{plan}</span>
                          </div>
                          <span className="text-white/40 text-[11px]">{count} users · {pct}%</span>
                        </div>
                        <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: plan === "Free" ? "#ffffff20" : plan === "Axol Pro" ? "#3b82f6" : plan === "Axol Ultra" ? "#7c3aed" : "#f59e0b" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent signups */}
              <div className="bg-[#0d0d1e] border border-white/[0.08] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <FiClock className="w-4 h-4 text-blue-400" />
                  <h3 className="text-white font-bold text-[14px]">Recent Sign-ups</h3>
                </div>
                {users.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <FiUsers className="w-8 h-8 text-white/10 mb-2" />
                    <div className="text-white/30 text-[12px]">No users yet</div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {[...users].sort((a,b) => b.createdAt - a.createdAt).slice(0, 6).map(u => (
                      <div key={u.email} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600/40 to-blue-600/40 flex items-center justify-center shrink-0">
                          <span className="text-[12px] font-bold text-white">{u.name[0]?.toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white/80 text-[12px] font-semibold truncate">{u.name}</div>
                          <div className="text-white/30 text-[10px] truncate">{u.email}</div>
                        </div>
                        <PlanBadge plan={u.plan} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* System status */}
            <div className="bg-[#0d0d1e] border border-white/[0.08] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <FiCpu className="w-4 h-4 text-cyan-400" />
                <h3 className="text-white font-bold text-[14px]">System Status</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "API Server",     status: "Operational" },
                  { label: "Gyan AI Engine", status: "Operational" },
                  { label: "Frontend (Vite)",status: "Operational" },
                  { label: "Auth System",    status: "Operational" },
                ].map(s => (
                  <div key={s.label} className="bg-emerald-500/[0.06] border border-emerald-500/15 rounded-xl px-3 py-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-emerald-400 text-[10px] font-bold">{s.status}</span>
                    </div>
                    <div className="text-white/60 text-[11px] font-semibold">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── USERS ─── */}
        {tab === "users" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name or email…"
                  className="w-full bg-[#0d0d1e] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-[13px] text-white placeholder:text-white/25 focus:outline-none focus:border-primary/50 transition-all" />
              </div>
              <button onClick={refresh} className="p-2.5 text-white/30 hover:text-white bg-[#0d0d1e] border border-white/[0.08] rounded-xl transition-all hover:border-white/20">
                <FiRefreshCw className="w-4 h-4" />
              </button>
              <div className="text-white/30 text-[12px]">{filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}</div>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="bg-[#0d0d1e] border border-white/[0.08] rounded-2xl p-12 text-center">
                <FiUsers className="w-10 h-10 text-white/10 mx-auto mb-3" />
                <div className="text-white/30 text-[13px]">{search ? "No users match your search." : "No users registered yet."}</div>
              </div>
            ) : (
              <div className="bg-[#0d0d1e] border border-white/[0.08] rounded-2xl overflow-hidden">
                <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-3 px-4 py-3 border-b border-white/[0.06] text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  <span>User</span><span>Email</span><span>Plan</span><span>Status</span><span>Actions</span>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {filteredUsers.map(u => (
                    <div key={u.email} className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-3 items-center px-4 py-3 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600/30 to-blue-600/30 flex items-center justify-center shrink-0 text-[12px] font-bold text-white">
                          {u.name[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-white text-[12px] font-semibold truncate">{u.name}</div>
                          <div className="text-white/25 text-[10px]">{new Date(u.createdAt).toLocaleDateString("en-IN")}</div>
                        </div>
                      </div>
                      <div className="text-white/50 text-[11px] truncate">{u.email}</div>
                      <PlanBadge plan={u.plan} />
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full",
                        u.banned ? "bg-red-500/15 text-red-400" : "bg-emerald-500/15 text-emerald-400")}>
                        {u.banned ? "Banned" : "Active"}
                      </span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(u)} title="Edit" className="p-1.5 text-white/25 hover:text-violet-400 rounded-lg hover:bg-violet-500/10 transition-all">
                          <FiEdit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => banUser(u.email)} title={u.banned ? "Unban" : "Ban"} className="p-1.5 text-white/25 hover:text-amber-400 rounded-lg hover:bg-amber-500/10 transition-all">
                          {u.banned ? <FiUnlock className="w-3.5 h-3.5" /> : <FiLock className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => deleteUser(u.email)} title="Delete" className="p-1.5 text-white/25 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all">
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {saved && (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 w-fit">
                <FiCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 text-[13px] font-semibold">User updated successfully</span>
              </div>
            )}
          </div>
        )}

        {/* ─── SUBSCRIPTIONS ─── */}
        {tab === "subscriptions" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PLANS.map(plan => {
                const count = users.filter(u => u.plan === plan).length;
                const cfg = PLAN_CONFIG[plan];
                return (
                  <div key={plan} className="bg-[#0d0d1e] border border-white/[0.08] rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={cfg.color}>{cfg.icon}</span>
                      <span className="text-white font-bold text-[14px]">{plan}</span>
                    </div>
                    <div className="text-[28px] font-black text-white leading-none mb-1">{count}</div>
                    <div className="text-white/35 text-[11px]">users · {cfg.price}</div>
                  </div>
                );
              })}
            </div>

            <div className="bg-[#0d0d1e] border border-white/[0.08] rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
                <FiStar className="w-4 h-4 text-amber-400" />
                <h3 className="text-white font-bold text-[14px]">Manage User Subscriptions</h3>
              </div>
              {users.length === 0 ? (
                <div className="p-10 text-center text-white/30 text-[13px]">No users registered yet.</div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {users.map(u => (
                    <div key={u.email} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02]">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600/30 to-pink-600/30 flex items-center justify-center shrink-0 text-[12px] font-bold text-white">{u.name[0]?.toUpperCase()}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-[13px] font-semibold">{u.name}</div>
                        <div className="text-white/35 text-[11px] truncate">{u.email}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <PlanBadge plan={u.plan} />
                        <div className="flex gap-1">
                          {PLANS.filter(p => p !== u.plan).map(p => (
                            <button key={p} onClick={() => {
                              saveUsersDB(getUsersDB().map(usr => usr.email === u.email ? { ...usr, plan: p } : usr));
                              refresh();
                            }} className="text-[10px] font-semibold px-2 py-1 rounded-lg border border-white/[0.08] text-white/40 hover:text-white hover:border-white/20 transition-all">
                              → {p}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── PLATFORM ─── */}
        {tab === "platform" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-[#0d0d1e] border border-white/[0.08] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <FiAlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-white font-bold text-[14px]">Platform Announcement</h3>
              </div>
              <textarea value={announcement} onChange={e => setAnnouncement(e.target.value)}
                placeholder="Write a platform-wide announcement for all users…"
                rows={5}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-[13px] text-white placeholder:text-white/25 focus:outline-none focus:border-primary/40 transition-all resize-none mb-3" />
              <button onClick={() => { setAnnounceSaved(true); setTimeout(() => setAnnounceSaved(false), 2000); }}
                className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all",
                  announceSaved ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" : "bg-violet-600 hover:bg-violet-500 text-white")}>
                {announceSaved ? <><FiCheck className="w-4 h-4" /> Saved!</> : "Save Announcement"}
              </button>
            </div>

            <div className="bg-[#0d0d1e] border border-white/[0.08] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <FiShield className="w-4 h-4 text-violet-400" />
                <h3 className="text-white font-bold text-[14px]">Developer Info</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Developer Email", value: "gyanendra@gyan.tech" },
                  { label: "Role", value: "Platform Developer" },
                  { label: "Access Level", value: "Full Admin — All Permissions" },
                  { label: "Platform Version", value: "GyanTechNet v2.0.0" },
                  { label: "Total Apps", value: "50+ Workspace Apps" },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                    <span className="text-white/40 text-[12px]">{item.label}</span>
                    <span className="text-white text-[12px] font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0d0d1e] border border-white/[0.08] rounded-2xl p-5 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <FiSettings className="w-4 h-4 text-blue-400" />
                <h3 className="text-white font-bold text-[14px]">Danger Zone</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => { if (confirm("Delete ALL user accounts? This cannot be undone.")) { saveUsersDB([]); refresh(); } }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[13px] font-semibold hover:bg-red-500/15 transition-all">
                  <FiTrash2 className="w-4 h-4" /> Delete All Users
                </button>
                <button onClick={() => { saveUsersDB(getUsersDB().map(u => ({ ...u, banned: false }))); refresh(); }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[13px] font-semibold hover:bg-emerald-500/15 transition-all">
                  <FiUnlock className="w-4 h-4" /> Unban All Users
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit user modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0d0d1e] border border-white/[0.1] rounded-2xl p-6 w-full max-w-md shadow-[0_40px_80px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <FiEdit2 className="w-4 h-4 text-violet-400" />
                <h3 className="text-white font-bold text-[15px]">Edit User</h3>
              </div>
              <button onClick={() => setEditUser(null)} className="p-1.5 text-white/30 hover:text-white rounded-lg hover:bg-white/[0.06] transition-all">
                <FiX className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Display Name</label>
                <input value={editUser.name} onChange={e => setEditUser({ ...editUser, name: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-[13px] text-white focus:outline-none focus:border-primary/40 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Email</label>
                <input value={editUser.email} disabled className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl px-3 py-2.5 text-[13px] text-white/40" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Subscription Plan</label>
                <div className="relative">
                  <select value={editPlan} onChange={e => setEditPlan(e.target.value as UserPlan)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-[13px] text-white focus:outline-none focus:border-primary/40 transition-all appearance-none">
                    {PLANS.map(p => <option key={p} value={p} className="bg-[#0d0d1e]">{p}</option>)}
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={saveEdit} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-[13px] transition-all">
                  <FiCheck className="w-4 h-4" /> Save Changes
                </button>
                <button onClick={() => setEditUser(null)} className="px-5 py-2.5 border border-white/[0.08] text-white/50 hover:text-white rounded-xl text-[13px] transition-all">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
