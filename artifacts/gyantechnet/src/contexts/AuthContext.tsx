import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "developer" | "user";
export type UserPlan = "Free" | "Axol Pro" | "Axol Ultra" | "Enterprise";

export type AuthUser = {
  name: string;
  email: string;
  role: UserRole;
  plan: UserPlan;
};

export type UserRecord = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  plan: UserPlan;
  banned: boolean;
  createdAt: number;
  lastLogin: number;
};

const DEVELOPER_EMAIL    = "gyanendra@gyan.tech";
const DEVELOPER_PASSWORD = "aman916241";
const DEVELOPER_NAME     = "Gyanendra";

const USERS_DB_KEY = "gyan_users_db";
const AUTH_KEY     = "auth_user";

export function getUsersDB(): UserRecord[] {
  try { return JSON.parse(localStorage.getItem(USERS_DB_KEY) || "[]"); } catch { return []; }
}
export function saveUsersDB(users: UserRecord[]) {
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
}

type AuthContextType = {
  user: AuthUser | null;
  isDeveloper: boolean;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  register: (name: string, email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  upgradePlan: (plan: UserPlan) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try { const s = localStorage.getItem(AUTH_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
  });

  const persist = (u: AuthUser) => {
    setUser(u);
    localStorage.setItem(AUTH_KEY, JSON.stringify(u));
  };

  const login = (email: string, password: string): { ok: boolean; error?: string } => {
    if (email === DEVELOPER_EMAIL) {
      if (password !== DEVELOPER_PASSWORD) return { ok: false, error: "Invalid password." };
      persist({ name: DEVELOPER_NAME, email: DEVELOPER_EMAIL, role: "developer", plan: "Enterprise" });
      return { ok: true };
    }
    const users = getUsersDB();
    const found = users.find(u => u.email === email);
    if (!found || found.password !== password) return { ok: false, error: "Invalid email or password." };
    if (found.banned) return { ok: false, error: "Your account has been suspended. Contact support." };
    saveUsersDB(users.map(u => u.email === email ? { ...u, lastLogin: Date.now() } : u));
    persist({ name: found.name, email: found.email, role: found.role, plan: found.plan });
    return { ok: true };
  };

  const register = (name: string, email: string, password: string): { ok: boolean; error?: string } => {
    if (email === DEVELOPER_EMAIL) return { ok: false, error: "This email is reserved." };
    const users = getUsersDB();
    if (users.find(u => u.email === email)) return { ok: false, error: "Email already registered. Please sign in." };
    if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
    const rec: UserRecord = {
      name: name.trim() || email.split("@")[0],
      email, password, role: "user", plan: "Free",
      banned: false, createdAt: Date.now(), lastLogin: Date.now(),
    };
    saveUsersDB([...users, rec]);
    persist({ name: rec.name, email: rec.email, role: "user", plan: "Free" });
    return { ok: true };
  };

  const logout = () => { setUser(null); localStorage.removeItem(AUTH_KEY); };

  const upgradePlan = (plan: UserPlan) => {
    if (!user) return;
    const updated: AuthUser = { ...user, plan };
    setUser(updated);
    localStorage.setItem(AUTH_KEY, JSON.stringify(updated));
    if (user.role !== "developer") {
      const users = getUsersDB();
      saveUsersDB(users.map(u => u.email === user.email ? { ...u, plan } : u));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isDeveloper: user?.role === "developer", login, register, logout, upgradePlan }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
