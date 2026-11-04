"use client";
import { createContext, useCallback, useContext, useState } from "react";
// Dependency-free toast system for the admin panel.
export type ToastKind = "ok" | "err" | "info";
type Toast = { id: number; kind: ToastKind; msg: string };
const Ctx = createContext<(kind: ToastKind, msg: string) => void>(() => {});
export const useToast = () => useContext(Ctx);
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [list, setList] = useState<Toast[]>([]);
  const push = useCallback((kind: ToastKind, msg: string) => {
    const id = Date.now() + Math.random();
    setList(l => [...l.slice(-3), { id, kind, msg }]);
    setTimeout(() => setList(l => l.filter(t => t.id !== id)), kind === "err" ? 8000 : 3800);
  }, []);
  return <Ctx.Provider value={push}>{children}
    <div aria-live="polite" className="toasts">{list.map(t =>
      <div key={t.id} role={t.kind === "err" ? "alert" : "status"} className={`toast toast-${t.kind}`}><span aria-hidden className="toast-dot" />{t.msg}</div>)}</div></Ctx.Provider>;
}
