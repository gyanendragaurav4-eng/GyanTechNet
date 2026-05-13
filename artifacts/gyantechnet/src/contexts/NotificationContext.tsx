import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type NotifType = "success" | "info" | "warning" | "error" | "ai";

export type Notification = {
  id: string;
  type: NotifType;
  title: string;
  body?: string;
  ts: number;
  read: boolean;
  icon?: string;
};

type NotifCtx = {
  notifications: Notification[];
  unreadCount: number;
  push: (type: NotifType, title: string, body?: string, icon?: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
  clearAll: () => void;
};

const Ctx = createContext<NotifCtx | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const push = useCallback((type: NotifType, title: string, body?: string, icon?: string) => {
    const n: Notification = {
      id: Math.random().toString(36).slice(2),
      type, title, body, ts: Date.now(), read: false, icon,
    };
    setNotifications(prev => [n, ...prev].slice(0, 50));
  }, []);

  const markAllRead = useCallback(() =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true }))), []);

  const dismiss = useCallback((id: string) =>
    setNotifications(prev => prev.filter(n => n.id !== id)), []);

  const clearAll = useCallback(() => setNotifications([]), []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Ctx.Provider value={{ notifications, unreadCount, push, markAllRead, dismiss, clearAll }}>
      {children}
    </Ctx.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useNotifications must be inside NotificationProvider");
  return ctx;
}
