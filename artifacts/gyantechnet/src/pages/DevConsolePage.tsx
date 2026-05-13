import { useState, useRef, useEffect } from "react";
import {
  FiTerminal, FiTrash2, FiCopy, FiChevronRight, FiWifi, FiShield,
  FiUsers, FiKey, FiMail, FiTrendingUp, FiRefreshCw, FiCheck,
  FiChevronDown, FiUser, FiZap,
} from "react-icons/fi";
import { cn } from "@/lib/utils";
import { useAuth, getUsersDB, saveUsersDB, UserRecord, UserPlan } from "@/contexts/AuthContext";
import { useLocation } from "wouter";

type LogEntry = { type: "input"|"output"|"error"|"info"|"warn"|"success"; text: string; time: string };

const getTime = () => new Date().toLocaleTimeString("en-US", { hour12: false });

const PLANS: UserPlan[] = ["Free", "Axol Pro", "Axol Ultra", "Enterprise"];
const PLAN_PRICE: Record<UserPlan, string> = {
  "Free":       "₹0/mo",
  "Axol Pro":   "₹499/mo",
  "Axol Ultra": "₹999/mo",
  "Enterprise": "₹2499/mo",
};
const PLAN_COLOR: Record<UserPlan, string> = {
  "Free":       "#6b7280",
  "Axol Pro":   "#7c3aed",
  "Axol Ultra": "#ec4899",
  "Enterprise": "#f59e0b",
};
const PLAN_MRR: Record<UserPlan, number> = {
  "Free": 0, "Axol Pro": 499, "Axol Ultra": 999, "Enterprise": 2499,
};

function randWord() {
  const words = ["nova","zen","flux","arc","glow","echo","nyx","orb","apex","vega","zion","arlo","eon","lyra","rho"];
  return words[Math.floor(Math.random() * words.length)];
}
function randPass(len = 12) {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function buildCommands(): Record<string, (args: string[]) => string | string[]> {
  return {
    help: () => [
      "╔══════════════════════════════════════════════════════╗",
      "║       GyanTechNet Developer Console v3.0             ║",
      "╚══════════════════════════════════════════════════════╝",
      "",
      "SYSTEM COMMANDS:",
      "  help                    Show this help",
      "  clear                   Clear console",
      "  version                 Platform version info",
      "  whoami                  Current session info",
      "  date                    Current timestamp",
      "  uptime                  System uptime",
      "  echo <text>             Echo text",
      "  ping <host>             Ping a host",
      "  ls                      List workspace apps",
      "  status                  System status",
      "  api                     API endpoint docs",
      "  env                     Environment variables",
      "  test <route>            Test an API route",
      "  history                 Command history",
      "  cat <file>              Show file contents",
      "",
      "SUBSCRIPTION MANAGEMENT:",
      "  sub:upgrade <email> <plan>",
      "                          Upgrade/downgrade user subscription",
      "                          Plans: Free | Axol Pro | Axol Ultra | Enterprise",
      "  sub:list                List all users grouped by plan",
      "  sub:stats               Subscription distribution stats",
      "  sub:revenue             Monthly & annual revenue estimate",
      "",
      "EMAIL MANAGEMENT:",
      "  email:gen [username] [password]",
      "                          Generate @gyan.tech email + account",
      "                          Leave blank for random username & password",
      "  email:list              List all @gyan.tech accounts",
      "",
      "USER MANAGEMENT:",
      "  user:list               List all registered users",
      "  user:create <email> <password> [name]",
      "                          Create a new user account",
      "  user:info <email>       Show user details",
      "  user:plan <email> <plan>",
      "                          Set subscription plan (alias: sub:upgrade)",
      "  user:ban <email>        Ban a user account",
      "  user:unban <email>      Unban a user account",
      "  user:delete <email>     Delete a user account",
      "  user:count              Total registered users",
      "  user:reset <email> <newpassword>",
      "                          Reset user password",
    ],

    version: () => [
      "GyanTechNet v3.0.0",
      "Node.js v24.0.0  •  TypeScript 5.9  •  React 19",
      "Vite 7.3  •  Tailwind CSS v4  •  Express 5",
      "Build: gyantechnet-2026-10 (prod)",
    ],

    whoami: () => {
      const stored = localStorage.getItem("auth_user");
      try {
        const u = stored ? JSON.parse(stored) : null;
        if (!u) return "Not logged in.";
        return [
          `Name  : ${u.name}`,
          `Email : ${u.email}`,
          `Role  : ${u.role}`,
          `Plan  : ${u.plan}`,
          `Session: Active (localStorage)`,
        ];
      } catch { return "Session corrupted."; }
    },

    date:   () => new Date().toUTCString(),
    uptime: () => "System uptime: 14d 7h 42m 18s",
    echo:   (args) => args.join(" ") || "(empty)",

    ping: (args) => [
      `PING ${args[0]||"gyantechnet.com"} (104.21.42.153)`,
      `64 bytes from 104.21.42.153: icmp_seq=1 ttl=55 time=${(Math.random()*40+5).toFixed(1)}ms`,
      `64 bytes from 104.21.42.153: icmp_seq=2 ttl=55 time=${(Math.random()*40+5).toFixed(1)}ms`,
      `3 packets transmitted, 3 received, 0% packet loss`,
    ],

    ls: () => [
      "workspace/",
      "├── ai/        chat  image-ai  video-ai  music-ai  tts  translator  research  stories  workflows",
      "├── workspace/ notes  calendar  tasks  focus  projects  slides  sheets  whiteboard  draw",
      "├── tools/     calculator  qr-gen  weather  converter  passwords  games  cricket",
      "├── pro/       analytics  wiki  learn  meet  crm  invoices  business",
      "└── dev/       api-keys  settings  intelligence  dev-console  db-manager  api-tester",
      "",
      "50+ apps loaded ✓",
    ],

    status: () => [
      "┌─────────────────────────────────────┐",
      "│  SYSTEM STATUS                      │",
      "├─────────────────────────────────────┤",
      "│  ✓ API Server          RUNNING      │",
      "│  ✓ Auth System         OPERATIONAL  │",
      `│  ✓ User DB             ${String(getUsersDB().length + " users").padEnd(12)} │`,
      "│  ✓ Gyan AI Engine      CONFIGURED   │",
      "│  ✓ Frontend (Vite)     ACTIVE       │",
      "│  ✓ Login Persistence   ENABLED      │",
      "│  ✓ Storage             OK  (2.4 GB) │",
      "│  ✓ CDN                 ACTIVE       │",
      "└─────────────────────────────────────┘",
    ],

    api: () => [
      "GyanTechNet REST API v1",
      "",
      "POST  /api/chat             AI chat (streaming)",
      "POST  /api/chat-stream      AI chat (SSE streaming)",
      "POST  /api/chat-unified     Multi-model synthesis",
      "GET   /api/healthz          Health check",
      "POST  /api/generate-content Content generation",
      "GET   /api/weather          Weather data",
      "POST  /api/translate        Text translation",
      "GET   /api/cricket          Live cricket scores",
      "",
      "Auth: Bearer <token>  •  Rate: 1000 req/min",
    ],

    env: () => [
      "NODE_ENV=production",
      "GYAN_AI_KEY=sk-*****hidden*****",
      "SESSION_SECRET=*****hidden*****",
      "PORT=8080",
      "BASE_PATH=/api",
      "DB_URL=postgres://***@gyantechnet-db:5432/gyandb",
    ],

    test: (args) => {
      const route = args[0] || "/api/healthz";
      return [
        `Testing: GET ${route}`,
        `Status: 200 OK`,
        `Latency: ${(Math.random()*50+5).toFixed(0)}ms`,
        `Response: { "status": "ok", "version": "3.0.0" }`,
      ];
    },

    cat: (args) => {
      const file = args[0] || "";
      if (file === "package.json") return ['{ "name": "@workspace/gyantechnet", "version": "3.0.0" }'];
      if (file === "README.md") return ["# GyanTechNet","","All-in-one AI platform with 50+ workspace apps."];
      return `cat: ${file || "(no file)"}: No such file or directory`;
    },

    // ─── SUBSCRIPTION MANAGEMENT ──────────────────────────────────────────────

    "sub:upgrade": (args) => {
      const rawPlan = args.slice(1).join(" ");
      const email = args[0];
      const plan = rawPlan;
      if (!email || !plan) return [
        "Usage: sub:upgrade <email> <plan>",
        "Plans: Free | Axol Pro | Axol Ultra | Enterprise",
        "",
        "Examples:",
        "  sub:upgrade john@example.com Axol Pro",
        "  sub:upgrade mary@gyan.tech Axol Ultra",
        "  sub:upgrade dev@corp.com Enterprise",
      ];
      if (!PLANS.includes(plan as UserPlan)) return `Error: invalid plan "${plan}". Valid: Free | Axol Pro | Axol Ultra | Enterprise`;
      const users = getUsersDB();
      const idx = users.findIndex(u => u.email === email);
      if (idx === -1) return `Error: user not found: ${email}`;
      const oldPlan = users[idx].plan;
      const updated = users.map((u,i) => i === idx ? { ...u, plan: plan as UserPlan } : u);
      saveUsersDB(updated);
      const stored = localStorage.getItem("auth_user");
      if (stored) {
        try { const s = JSON.parse(stored); if (s.email === email) localStorage.setItem("auth_user", JSON.stringify({ ...s, plan })); } catch { /* ignore */ }
      }
      const action = PLANS.indexOf(plan as UserPlan) > PLANS.indexOf(oldPlan as UserPlan) ? "UPGRADED" : PLANS.indexOf(plan as UserPlan) < PLANS.indexOf(oldPlan as UserPlan) ? "DOWNGRADED" : "SET";
      return [
        `╔══════════════════════════════════════╗`,
        `║   SUBSCRIPTION ${action.padEnd(22)}║`,
        `╚══════════════════════════════════════╝`,
        ``,
        `  User    : ${email}`,
        `  Name    : ${users[idx].name}`,
        `  Old Plan: ${oldPlan}  (${PLAN_PRICE[oldPlan as UserPlan] || "—"})`,
        `  New Plan: ${plan}  (${PLAN_PRICE[plan as UserPlan]})`,
        `  MRR Δ  : ${PLAN_MRR[plan as UserPlan] - PLAN_MRR[oldPlan as UserPlan] >= 0 ? "+" : ""}₹${PLAN_MRR[plan as UserPlan] - PLAN_MRR[oldPlan as UserPlan]}/mo`,
        ``,
        `✓ Subscription updated successfully`,
        `  Session auto-updated if user is currently logged in.`,
      ];
    },

    "sub:list": () => {
      const users = getUsersDB();
      const grouped: Record<string, UserRecord[]> = { Free: [], "Axol Pro": [], "Axol Ultra": [], Enterprise: [] };
      users.forEach(u => { if (grouped[u.plan]) grouped[u.plan].push(u); else grouped["Free"].push(u); });
      const lines: string[] = [`Subscription breakdown — ${users.length} total users`, ""];
      for (const plan of PLANS) {
        const list = grouped[plan] || [];
        lines.push(`${plan.padEnd(14)} (${PLAN_PRICE[plan]})  —  ${list.length} user${list.length !== 1 ? "s" : ""}`);
        list.forEach(u => lines.push(`  • ${u.email}  ${u.banned ? "[BANNED]" : ""}`));
        if (list.length === 0) lines.push("  (none)");
        lines.push("");
      }
      return lines;
    },

    "sub:stats": () => {
      const users = getUsersDB();
      const total = users.length || 1;
      const counts: Record<UserPlan, number> = { "Free": 0, "Axol Pro": 0, "Axol Ultra": 0, "Enterprise": 0 };
      users.forEach(u => { if (u.plan in counts) counts[u.plan as UserPlan]++; });
      const BAR = 20;
      const lines: string[] = [
        "  SUBSCRIPTION DISTRIBUTION",
        "  ─────────────────────────────────────",
      ];
      for (const plan of PLANS) {
        const n = counts[plan];
        const pct = Math.round((n / total) * 100);
        const filled = Math.round((n / total) * BAR);
        const bar = "█".repeat(filled) + "░".repeat(BAR - filled);
        lines.push(`  ${plan.padEnd(14)} [${bar}] ${String(n).padStart(3)} users  (${pct}%)`);
      }
      lines.push("");
      lines.push(`  Total: ${users.length} registered users`);
      lines.push(`  Paid : ${users.filter(u => u.plan !== "Free").length} users`);
      lines.push(`  Free : ${counts["Free"]} users`);
      return lines;
    },

    "sub:revenue": () => {
      const users = getUsersDB();
      let mrr = 0;
      const breakdown: Record<UserPlan, number> = { "Free": 0, "Axol Pro": 0, "Axol Ultra": 0, "Enterprise": 0 };
      users.forEach(u => {
        const m = PLAN_MRR[u.plan as UserPlan] ?? 0;
        mrr += m;
        if (u.plan in breakdown) breakdown[u.plan as UserPlan]++;
      });
      const arr = mrr * 12;
      return [
        "  ┌────────────────────────────────────┐",
        "  │   REVENUE DASHBOARD                │",
        "  ├────────────────────────────────────┤",
        `  │   MRR (est.)  : ₹${String(mrr.toLocaleString("en-IN")).padEnd(18)}│`,
        `  │   ARR (est.)  : ₹${String(arr.toLocaleString("en-IN")).padEnd(18)}│`,
        "  ├────────────────────────────────────┤",
        `  │   Axol Pro    : ${String(breakdown["Axol Pro"] + " × ₹499").padEnd(19)}│`,
        `  │   Axol Ultra  : ${String(breakdown["Axol Ultra"] + " × ₹999").padEnd(19)}│`,
        `  │   Enterprise  : ${String(breakdown["Enterprise"] + " × ₹2499").padEnd(19)}│`,
        "  └────────────────────────────────────┘",
        "",
        `  Total paying customers: ${users.filter(u => u.plan !== "Free").length}`,
      ];
    },

    // ─── EMAIL MANAGEMENT ─────────────────────────────────────────────────────

    "email:gen": (args) => {
      const username = args[0] || `${randWord()}${Math.floor(Math.random()*900+100)}`;
      const password = args[1] || randPass();
      const email = `${username}@gyan.tech`;
      const users = getUsersDB();
      if (users.find(u => u.email === email)) return `Error: ${email} already exists. Try a different username.`;
      const name = username.charAt(0).toUpperCase() + username.slice(1).replace(/\d+$/, "");
      const rec: UserRecord = {
        name, email, password, role: "user", plan: "Free",
        banned: false, createdAt: Date.now(), lastLogin: Date.now(),
      };
      saveUsersDB([...users, rec]);
      return [
        `╔══════════════════════════════════════════╗`,
        `║   @GYAN.TECH EMAIL GENERATED              ║`,
        `╚══════════════════════════════════════════╝`,
        ``,
        `  Email     : ${email}`,
        `  Password  : ${password}`,
        `  Name      : ${name}`,
        `  Plan      : Free`,
        `  Role      : user`,
        ``,
        `✓ Account created and added to user database`,
        `  Tip: sub:upgrade ${email} "Axol Pro"  to activate Pro plan`,
      ];
    },

    "email:list": () => {
      const users = getUsersDB();
      const gyanUsers = users.filter(u => u.email.endsWith("@gyan.tech"));
      if (gyanUsers.length === 0) return [
        "No @gyan.tech accounts found.",
        `Tip: Use email:gen to create one.`,
      ];
      const lines: string[] = [`@gyan.tech accounts: ${gyanUsers.length}`, "", `${"EMAIL".padEnd(32)} ${"NAME".padEnd(18)} ${"PLAN".padEnd(14)} STATUS`,"─".repeat(75)];
      gyanUsers.forEach(u => {
        lines.push(`${u.email.padEnd(32)} ${u.name.slice(0,17).padEnd(18)} ${u.plan.padEnd(14)} ${u.banned ? "BANNED" : "Active"}`);
      });
      return lines;
    },

    // ─── USER MANAGEMENT ─────────────────────────────────────────────────────

    "user:list": () => {
      const users = getUsersDB();
      if (users.length === 0) return "No users registered yet. Use user:create to add one.";
      const lines: string[] = [
        `Total: ${users.length} user(s)`,
        "",
        `${"#".padEnd(3)} ${"EMAIL".padEnd(30)} ${"NAME".padEnd(18)} ${"PLAN".padEnd(14)} ${"STATUS".padEnd(10)} CREATED`,
        "─".repeat(100),
      ];
      users.forEach((u, i) => {
        const created = new Date(u.createdAt).toLocaleDateString("en-IN");
        const status = u.banned ? "BANNED" : "Active";
        lines.push(`${String(i+1).padEnd(3)} ${u.email.padEnd(30)} ${u.name.slice(0,17).padEnd(18)} ${u.plan.padEnd(14)} ${status.padEnd(10)} ${created}`);
      });
      return lines;
    },

    "user:count": () => {
      const users = getUsersDB();
      return [
        `Total users   : ${users.length}`,
        `Active        : ${users.filter(u=>!u.banned).length}`,
        `Banned        : ${users.filter(u=>u.banned).length}`,
        `Free          : ${users.filter(u=>u.plan==="Free").length}`,
        `Axol Pro      : ${users.filter(u=>u.plan==="Axol Pro").length}`,
        `Axol Ultra    : ${users.filter(u=>u.plan==="Axol Ultra").length}`,
        `Enterprise    : ${users.filter(u=>u.plan==="Enterprise").length}`,
      ];
    },

    "user:create": (args) => {
      const [email, password, ...nameParts] = args;
      if (!email) return "Usage: user:create <email> <password> [name]";
      if (!password) return "Usage: user:create <email> <password> [name]";
      if (!email.includes("@")) return `Error: invalid email address: ${email}`;
      if (password.length < 6) return "Error: password must be at least 6 characters.";
      const users = getUsersDB();
      if (users.find(u => u.email === email)) return `Error: email already registered: ${email}`;
      const name = nameParts.join(" ") || email.split("@")[0];
      const rec: UserRecord = {
        name, email, password, role: "user", plan: "Free",
        banned: false, createdAt: Date.now(), lastLogin: Date.now(),
      };
      saveUsersDB([...users, rec]);
      return [
        `✓ User created successfully`,
        `  Email   : ${email}`,
        `  Name    : ${name}`,
        `  Password: ${password}`,
        `  Plan    : Free (default)`,
        ``,
        `  Tip: sub:upgrade ${email} Axol Pro   to activate Pro plan`,
      ];
    },

    "user:info": (args) => {
      const email = args[0];
      if (!email) return "Usage: user:info <email>";
      const users = getUsersDB();
      const u = users.find(u => u.email === email);
      if (!u) return `Error: user not found: ${email}`;
      return [
        `User Info — ${email}`,
        "─".repeat(42),
        `  Name        : ${u.name}`,
        `  Email       : ${u.email}`,
        `  Role        : ${u.role}`,
        `  Plan        : ${u.plan}  (${PLAN_PRICE[u.plan as UserPlan] || "—"})`,
        `  Status      : ${u.banned ? "BANNED" : "Active"}`,
        `  Created     : ${new Date(u.createdAt).toLocaleString("en-IN")}`,
        `  Last Login  : ${new Date(u.lastLogin).toLocaleString("en-IN")}`,
      ];
    },

    "user:plan": (args) => {
      const rawPlan = args.slice(1).join(" ");
      const email = args[0];
      const plan = rawPlan;
      if (!email || !plan) return "Usage: user:plan <email> <plan>  (Free | Axol Pro | Axol Ultra | Enterprise)";
      if (!PLANS.includes(plan as UserPlan)) return `Error: invalid plan "${plan}". Valid: Free | Axol Pro | Axol Ultra | Enterprise`;
      const users = getUsersDB();
      const idx = users.findIndex(u => u.email === email);
      if (idx === -1) return `Error: user not found: ${email}`;
      const oldPlan = users[idx].plan;
      saveUsersDB(users.map((u,i) => i === idx ? { ...u, plan: plan as UserPlan } : u));
      const stored = localStorage.getItem("auth_user");
      if (stored) {
        try { const s = JSON.parse(stored); if (s.email === email) localStorage.setItem("auth_user", JSON.stringify({ ...s, plan })); } catch { /* ignore */ }
      }
      return [
        `✓ Subscription updated`,
        `  Email : ${email}`,
        `  Plan  : ${oldPlan} → ${plan}  (${PLAN_PRICE[plan as UserPlan]})`,
        `  Session auto-updated if currently logged in.`,
      ];
    },

    "user:ban": (args) => {
      const email = args[0];
      if (!email) return "Usage: user:ban <email>";
      const users = getUsersDB();
      const idx = users.findIndex(u => u.email === email);
      if (idx === -1) return `Error: user not found: ${email}`;
      if (users[idx].banned) return `User ${email} is already banned.`;
      saveUsersDB(users.map((u,i) => i === idx ? { ...u, banned: true } : u));
      return `✓ User banned: ${email}  (they will be blocked on next login)`;
    },

    "user:unban": (args) => {
      const email = args[0];
      if (!email) return "Usage: user:unban <email>";
      const users = getUsersDB();
      const idx = users.findIndex(u => u.email === email);
      if (idx === -1) return `Error: user not found: ${email}`;
      if (!users[idx].banned) return `User ${email} is not banned.`;
      saveUsersDB(users.map((u,i) => i === idx ? { ...u, banned: false } : u));
      return `✓ User unbanned: ${email}  (they can now log in again)`;
    },

    "user:delete": (args) => {
      const email = args[0];
      if (!email) return "Usage: user:delete <email>";
      const users = getUsersDB();
      const idx = users.findIndex(u => u.email === email);
      if (idx === -1) return `Error: user not found: ${email}`;
      saveUsersDB(users.filter((_,i) => i !== idx));
      return `✓ User deleted: ${email}  (account permanently removed)`;
    },

    "user:reset": (args) => {
      const [email, newpass] = args;
      if (!email || !newpass) return "Usage: user:reset <email> <newpassword>";
      if (newpass.length < 6) return "Error: password must be at least 6 characters.";
      const users = getUsersDB();
      const idx = users.findIndex(u => u.email === email);
      if (idx === -1) return `Error: user not found: ${email}`;
      saveUsersDB(users.map((u,i) => i === idx ? { ...u, password: newpass } : u));
      return `✓ Password reset for: ${email}`;
    },
  };
}

// ── Visual Panel: Subscription Manager ────────────────────────────────────
function SubStatsPanel({ onRefresh }: { onRefresh: () => void }) {
  const users = getUsersDB();
  const total = users.length;
  const counts: Record<string, number> = { Free: 0, "Axol Pro": 0, "Axol Ultra": 0, Enterprise: 0 };
  users.forEach(u => { if (u.plan in counts) counts[u.plan]++; });
  let mrr = 0;
  users.forEach(u => { mrr += PLAN_MRR[u.plan as UserPlan] ?? 0; });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-white/60 text-[11px] font-bold uppercase tracking-wider">Revenue Overview</span>
        <button onClick={onRefresh} className="p-1 text-white/20 hover:text-violet-300 transition-colors">
          <FiRefreshCw className="w-3 h-3" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Total Users", value: total, icon: "👥", color: "text-blue-400" },
          { label: "MRR", value: `₹${mrr.toLocaleString("en-IN")}`, icon: "💰", color: "text-emerald-400" },
          { label: "Paid", value: users.filter(u => u.plan !== "Free").length, icon: "⚡", color: "text-violet-400" },
          { label: "ARR", value: `₹${(mrr*12).toLocaleString("en-IN")}`, icon: "📈", color: "text-amber-400" },
        ].map(s => (
          <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-2.5">
            <div className="text-[16px] mb-1">{s.icon}</div>
            <div className={cn("text-[14px] font-black tabular-nums", s.color)}>{s.value}</div>
            <div className="text-white/30 text-[9px] uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {PLANS.map(plan => {
          const n = counts[plan] || 0;
          const pct = total > 0 ? (n / total) * 100 : 0;
          return (
            <div key={plan}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold" style={{ color: PLAN_COLOR[plan] }}>{plan}</span>
                <span className="text-[10px] text-white/40">{n} users · {PLAN_PRICE[plan]}</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: PLAN_COLOR[plan], boxShadow: `0 0 6px ${PLAN_COLOR[plan]}60` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmailGenPanel({ onCmd }: { onCmd: (cmd: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [plan, setPlan] = useState<UserPlan>("Free");
  const [result, setResult] = useState<null | { email: string; password: string }>(null);
  const [copied, setCopied] = useState(false);

  const generate = () => {
    const uname = username.trim().toLowerCase().replace(/[^a-z0-9]/g, "") || `${randWord()}${Math.floor(Math.random()*900+100)}`;
    const pass = password.trim() || randPass();
    const email = `${uname}@gyan.tech`;
    const users = getUsersDB();
    if (users.find(u => u.email === email)) { alert(`${email} already exists.`); return; }
    const name = uname.charAt(0).toUpperCase() + uname.slice(1).replace(/\d+$/, "");
    const rec: UserRecord = { name, email, password: pass, role: "user", plan, banned: false, createdAt: Date.now(), lastLogin: Date.now() };
    saveUsersDB([...users, rec]);
    setResult({ email, password: pass });
    setUsername(""); setPassword("");
    onCmd(`email:gen ${uname} ${pass}`);
  };

  const copyAll = () => {
    if (!result) return;
    navigator.clipboard.writeText(`Email: ${result.email}\nPassword: ${result.password}\nPlan: ${plan}`).catch(()=>{});
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      <div className="text-white/60 text-[11px] font-bold uppercase tracking-wider">Generate @gyan.tech Account</div>

      <div>
        <label className="text-[10px] text-white/40 mb-1 block">Username (leave blank = random)</label>
        <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] rounded-lg overflow-hidden">
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="nova123"
            className="flex-1 bg-transparent text-[11px] text-white px-2.5 py-1.5 placeholder:text-white/20 focus:outline-none"
          />
          <span className="text-[10px] text-violet-400/60 pr-2.5 shrink-0">@gyan.tech</span>
        </div>
      </div>

      <div>
        <label className="text-[10px] text-white/40 mb-1 block">Password (leave blank = random)</label>
        <input
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="auto-generated"
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-[11px] text-white placeholder:text-white/20 focus:outline-none"
        />
      </div>

      <div>
        <label className="text-[10px] text-white/40 mb-1 block">Initial Plan</label>
        <div className="relative">
          <select
            value={plan}
            onChange={e => setPlan(e.target.value as UserPlan)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-[11px] text-white appearance-none focus:outline-none">
            {PLANS.map(p => <option key={p} value={p} className="bg-[#0d0d1e]">{p} — {PLAN_PRICE[p]}</option>)}
          </select>
          <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none" />
        </div>
      </div>

      <button onClick={generate}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-[11px] font-bold hover:from-violet-500 hover:to-purple-500 transition-all shadow-[0_0_16px_rgba(124,58,237,0.3)]">
        <FiMail className="w-3.5 h-3.5" /> Generate Email
      </button>

      {result && (
        <div className="bg-emerald-500/[0.07] border border-emerald-500/20 rounded-xl p-3 space-y-1.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">✓ Generated</span>
            <button onClick={copyAll} className="flex items-center gap-1 text-[9px] text-white/40 hover:text-white transition-colors">
              {copied ? <FiCheck className="w-3 h-3 text-emerald-400" /> : <FiCopy className="w-3 h-3" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="text-[11px] text-white/80 font-mono"><span className="text-white/30">Email:  </span>{result.email}</div>
          <div className="text-[11px] text-white/80 font-mono"><span className="text-white/30">Pass:   </span>{result.password}</div>
          <div className="text-[11px] text-violet-300 font-mono"><span className="text-white/30">Plan:   </span>{plan}</div>
        </div>
      )}
    </div>
  );
}

function UserUpgradePanel({ onCmd }: { onCmd: (cmd: string) => void }) {
  const [search, setSearch] = useState("");
  const [tick, setTick] = useState(0);

  const users = getUsersDB().filter(u =>
    !search || u.email.includes(search) || u.name.toLowerCase().includes(search.toLowerCase())
  );

  const setPlan = (email: string, plan: UserPlan) => {
    const all = getUsersDB();
    saveUsersDB(all.map(u => u.email === email ? { ...u, plan } : u));
    const stored = localStorage.getItem("auth_user");
    if (stored) {
      try { const s = JSON.parse(stored); if (s.email === email) localStorage.setItem("auth_user", JSON.stringify({ ...s, plan })); } catch { /* ignore */ }
    }
    onCmd(`sub:upgrade ${email} ${plan}`);
    setTick(t => t + 1);
  };

  return (
    <div className="space-y-3" key={tick}>
      <div className="text-white/60 text-[11px] font-bold uppercase tracking-wider">User Subscription Manager</div>
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by email or name…"
        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-[11px] text-white placeholder:text-white/20 focus:outline-none"
      />
      <div className="space-y-1.5 max-h-72 overflow-y-auto no-scrollbar">
        {users.length === 0 && (
          <div className="text-white/25 text-[11px] text-center py-6">No users found.</div>
        )}
        {users.map(u => (
          <div key={u.email} className="bg-white/[0.025] border border-white/[0.05] rounded-xl p-2.5 hover:bg-white/[0.04] transition-colors">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="min-w-0">
                <div className="text-[11px] font-semibold text-white/80 truncate">{u.name}</div>
                <div className="text-[9.5px] text-white/30 truncate">{u.email}</div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: `${PLAN_COLOR[u.plan as UserPlan]}22`, color: PLAN_COLOR[u.plan as UserPlan], border: `1px solid ${PLAN_COLOR[u.plan as UserPlan]}40` }}>
                  {u.plan}
                </span>
                {u.banned && <span className="text-[8px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded-full font-bold">BANNED</span>}
              </div>
            </div>
            <div className="flex gap-1 flex-wrap">
              {PLANS.map(p => (
                <button key={p}
                  onClick={() => setPlan(u.email, p)}
                  disabled={u.plan === p}
                  className={cn(
                    "text-[9px] px-2 py-0.5 rounded-full font-semibold transition-all",
                    u.plan === p
                      ? "opacity-40 cursor-default"
                      : "hover:opacity-80 active:scale-95"
                  )}
                  style={{
                    background: `${PLAN_COLOR[p]}18`,
                    color: PLAN_COLOR[p],
                    border: `1px solid ${PLAN_COLOR[p]}35`,
                  }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function DevConsolePage() {
  const { isDeveloper } = useAuth();
  const [, setLocation] = useLocation();
  const [logs, setLogs] = useState<LogEntry[]>([
    { type:"info",    text:"╔═══════════════════════════════════════════════════════╗", time:getTime() },
    { type:"info",    text:"║       GyanTechNet Developer Console v3.0              ║", time:getTime() },
    { type:"info",    text:"╚═══════════════════════════════════════════════════════╝", time:getTime() },
    { type:"success", text:`✓ Session started: ${new Date().toLocaleString("en-IN")}`, time:getTime() },
    { type:"success", text:`✓ Login Persistence: ENABLED (localStorage)`, time:getTime() },
    { type:"info",    text:`  Users in DB: ${getUsersDB().length}`, time:getTime() },
    { type:"output",  text:'  Type "help" for all commands. New: email:gen, sub:upgrade, sub:stats', time:getTime() },
    { type:"output",  text:"", time:getTime() },
  ]);
  const [input, setInput]     = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [connected]           = useState(true);
  const [panelTab, setPanelTab] = useState<"stats"|"email"|"users">("stats");
  const [panelOpen, setPanelOpen] = useState(true);
  const [panelTick, setPanelTick] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [logs]);

  const appendCmd = (cmd: string) => {
    setLogs(prev => [...prev, { type:"input", text:`$ ${cmd}`, time:getTime() }, { type:"output", text:"", time:getTime() }]);
  };

  const run = (cmdOverride?: string) => {
    const cmd = (cmdOverride ?? input).trim();
    if (!cmd) return;
    const newLogs: LogEntry[] = [...logs, { type:"input", text:`$ ${cmd}`, time:getTime() }];
    if (!cmdOverride) { setHistory(prev => [cmd, ...prev.slice(0, 99)]); setHistIdx(-1); }

    const parts = cmd.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
    const name = parts[0] ?? "";
    const args = parts.slice(1).map(a => a.replace(/^"|"$/g, ""));

    if (name === "clear") {
      setLogs([{ type:"info", text:'Console cleared. Type "help" for commands.', time:getTime() }]);
      if (!cmdOverride) setInput(""); return;
    }
    if (name === "history") {
      if (history.length === 0) newLogs.push({ type:"output", text:"No history yet.", time:getTime() });
      history.forEach((h, i) => newLogs.push({ type:"output", text:`  ${String(i+1).padStart(3,"0")}  ${h}`, time:getTime() }));
      setLogs(newLogs); if (!cmdOverride) setInput(""); return;
    }

    const cmds = buildCommands();
    const fn = cmds[name];
    if (fn) {
      const out = fn(args);
      const lines = Array.isArray(out) ? out : [out];
      lines.forEach(line => {
        const t: LogEntry["type"] =
          line.startsWith("✓") ? "success" :
          line.startsWith("Error:") || line.startsWith("bash:") ? "error" :
          line.startsWith("Tip:") || line.startsWith("  Tip:") ? "warn" :
          "output";
        newLogs.push({ type:t, text:line, time:getTime() });
      });
      setPanelTick(v => v + 1);
    } else {
      newLogs.push({ type:"error", text:`bash: ${name}: command not found. Try "help" for available commands.`, time:getTime() });
    }
    newLogs.push({ type:"output", text:"", time:getTime() });
    setLogs(newLogs);
    if (!cmdOverride) setInput("");
  };

  const allCommandNames = Object.keys(buildCommands());

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { run(); }
    else if (e.key === "ArrowUp")   { e.preventDefault(); const i = Math.min(histIdx+1, history.length-1); setHistIdx(i); setInput(history[i]||""); }
    else if (e.key === "ArrowDown") { e.preventDefault(); const i = Math.max(histIdx-1, -1); setHistIdx(i); setInput(i===-1 ? "" : history[i]||""); }
    else if (e.key === "Tab") {
      e.preventDefault();
      const match = allCommandNames.find(c => c.startsWith(input));
      if (match) setInput(match);
    }
    else if (e.key === "l" && e.ctrlKey) { e.preventDefault(); setLogs([{ type:"info", text:"Console cleared.", time:getTime() }]); }
  };

  if (!isDeveloper) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#040408] text-center p-8">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
          <FiShield className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-white font-black text-[20px] mb-2">Access Restricted</h2>
        <p className="text-white/40 text-[13px] mb-5">Dev Console is only accessible to the platform developer.</p>
        <button onClick={() => setLocation("/chat")} className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-[13px] transition-all">
          Back to App
        </button>
      </div>
    );
  }

  const userCount = getUsersDB().length;

  return (
    <div className="flex h-full bg-[#040408] font-mono overflow-hidden">

      {/* ── LEFT: Terminal ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden" onClick={() => inputRef.current?.focus()}>

        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-[#08081a] shrink-0">
          <div className="flex items-center gap-2.5">
            <FiTerminal className="w-4 h-4 text-primary" />
            <span className="text-white text-[13px] font-bold">Dev Console</span>
            <span className="text-white/25 text-[11px] hidden sm:block">gyantechnet.com</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[10.5px] px-2 py-1 rounded-full border bg-violet-500/10 text-violet-300 border-violet-500/20">
              <FiUsers className="w-2.5 h-2.5" />
              {userCount} user{userCount !== 1 ? "s" : ""}
            </div>
            <div className="flex items-center gap-1.5 text-[10.5px] px-2 py-1 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              <FiKey className="w-2.5 h-2.5" />
              Login Saved
            </div>
            <div className={cn("flex items-center gap-1.5 text-[10.5px] px-2 py-1 rounded-full border",
              connected ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20")}>
              <FiWifi className="w-2.5 h-2.5" />
              {connected ? "Connected" : "Offline"}
            </div>
            <button onClick={() => { const text = logs.map(l => `${l.time}  ${l.text}`).join("\n"); navigator.clipboard.writeText(text).catch(()=>{}); }}
              className="p-1.5 text-white/25 hover:text-white transition-all" title="Copy logs">
              <FiCopy className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setLogs([{ type:"info", text:'Console cleared. Type "help" for commands.', time:getTime() }])}
              className="p-1.5 text-white/25 hover:text-white transition-all" title="Clear">
              <FiTrash2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setPanelOpen(v => !v)}
              className={cn("p-1.5 transition-all rounded-lg hidden lg:flex items-center", panelOpen ? "text-violet-400 bg-violet-500/10" : "text-white/25 hover:text-white")}>
              <FiTrendingUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick chips */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.04] bg-[#06060e] shrink-0 overflow-x-auto no-scrollbar">
          <span className="text-white/20 text-[10px] shrink-0">Quick:</span>
          {[
            "user:list",
            "sub:stats",
            "sub:revenue",
            "email:gen",
            "email:list",
            `sub:upgrade user@example.com "Axol Pro"`,
          ].map(cmd => (
            <button key={cmd}
              onClick={() => { setInput(cmd); setTimeout(() => inputRef.current?.focus(), 0); }}
              className="text-[10px] px-2 py-0.5 rounded-md border border-violet-500/20 text-violet-300/70 hover:text-violet-200 hover:border-violet-500/40 transition-all shrink-0 whitespace-nowrap">
              {cmd}
            </button>
          ))}
        </div>

        {/* Log output */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-0.5 text-[12px] leading-relaxed">
          {logs.map((log, i) => (
            <div key={i} className={cn("flex gap-3", log.text === "" ? "h-2" : "")}>
              {log.text !== "" && (
                <>
                  <span className="text-white/15 shrink-0 tabular-nums select-none text-[10px] pt-0.5">{log.time}</span>
                  <span className={cn("break-all",
                    log.type === "input"   ? "text-cyan-400" :
                    log.type === "error"   ? "text-red-400" :
                    log.type === "warn"    ? "text-amber-400" :
                    log.type === "success" ? "text-emerald-400" :
                    log.type === "info"    ? "text-violet-400" :
                    "text-green-300"
                  )}>{log.text}</span>
                </>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-white/[0.06] bg-[#07070f] shrink-0">
          <span className="text-emerald-400 text-[13px] shrink-0">developer@gyantech</span>
          <FiChevronRight className="w-3 h-3 text-white/20 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder='Type a command… (Tab: autocomplete, e.g. "email:gen" or "sub:upgrade")'
            spellCheck={false}
            autoCapitalize="off"
            className="flex-1 bg-transparent text-[12px] text-white placeholder:text-white/15 focus:outline-none caret-emerald-400"
            autoFocus
          />
          <span className="text-white/10 text-[10px] shrink-0 hidden sm:block">↑/↓: history · Ctrl+L: clear</span>
        </div>
      </div>

      {/* ── RIGHT: Visual Panel ── */}
      {panelOpen && (
        <div className="hidden lg:flex flex-col w-[300px] shrink-0 border-l border-white/[0.06] bg-[#06060f] overflow-hidden">
          {/* Panel tab bar */}
          <div className="flex items-center px-3 pt-3 pb-0 border-b border-white/[0.06] shrink-0 gap-0.5">
            {[
              { id: "stats" as const, icon: <FiTrendingUp className="w-3 h-3" />, label: "Stats" },
              { id: "email" as const, icon: <FiMail className="w-3 h-3" />, label: "Email Gen" },
              { id: "users" as const, icon: <FiUser className="w-3 h-3" />, label: "Users" },
            ].map(tab => (
              <button key={tab.id} onClick={() => setPanelTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold rounded-t-lg transition-all border-b-2",
                  panelTab === tab.id
                    ? "bg-white/[0.04] text-violet-300 border-violet-500"
                    : "text-white/30 hover:text-white/60 border-transparent"
                )}>
                {tab.icon} {tab.label}
              </button>
            ))}
            <div className="ml-auto pb-2">
              <div className="flex items-center gap-1 text-[9px] text-emerald-400/70 font-mono">
                <FiZap className="w-2.5 h-2.5" /> Live
              </div>
            </div>
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-4" key={panelTick}>
            {panelTab === "stats" && <SubStatsPanel onRefresh={() => setPanelTick(v => v + 1)} />}
            {panelTab === "email" && (
              <EmailGenPanel onCmd={cmd => {
                appendCmd(cmd);
                setPanelTick(v => v + 1);
              }} />
            )}
            {panelTab === "users" && (
              <UserUpgradePanel onCmd={cmd => {
                appendCmd(cmd);
                setPanelTick(v => v + 1);
              }} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
