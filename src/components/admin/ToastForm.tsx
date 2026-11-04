"use client";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useToast } from "./Toast";
// Shape every converted server action returns.
export type R = { error?: string; ok?: string } | null | undefined;
const isRedirect = (e: unknown) => { const d = (e as { digest?: unknown })?.digest; return typeof d === "string" && d.startsWith("NEXT_"); };
// <ToastForm> replaces <form action={serverAction}> 1:1. Server errors become a
// toast (and stay visible inline if the form renders {st.error}), successes
// toast okMsg. Redirects from the server action still work.
export function ToastForm({ action, children, className, okMsg, confirm }: {
  action: (fd: FormData) => Promise<R>; children: React.ReactNode; className?: string; okMsg?: string; confirm?: string; }) {
  const toast = useToast();
  const [st, formAction] = useActionState(async (prev: R, fd: FormData): Promise<R> => {
    try { return (await action(fd)) ?? {}; }
    catch (e) { if (isRedirect(e)) throw e; return { error: e instanceof Error ? e.message : "Something went wrong. Please try again." }; }
  }, null);
  const seen = useRef<R>(null);
  useEffect(() => { if (!st || seen.current === st) return; seen.current = st;
    if (st.error) toast("err", st.error); else { const m = st.ok || okMsg; if (m) toast("ok", m); } }, [st]); // eslint-disable-line react-hooks/exhaustive-deps
  return <form action={formAction} className={className} onSubmit={e => { if (confirm && !window.confirm(confirm)) e.preventDefault(); }}>{children}</form>;
}
// For buttons that call a server action with no form inputs of their own.
export function ActionButton({ action, children, className, okMsg, confirm }: {
  action: () => Promise<R>; children: React.ReactNode; className?: string; okMsg?: string; confirm?: string; }) {
  const toast = useToast(); const [pending, start] = useTransition();
  return <button type="button" disabled={pending} aria-busy={pending} className={`${className ?? ""} disabled:cursor-wait disabled:opacity-60`}
    onClick={() => { if (confirm && !window.confirm(confirm)) return;
      start(async () => { try { const r = await action(); if (r?.error) toast("err", r.error); else { const m = r?.ok || okMsg; if (m) toast("ok", m); else toast("ok", "Done."); } }
        catch (e) { if (isRedirect(e)) throw e; toast("err", "Something went wrong. Please try again."); } }); }}>
    {pending ? "Working…" : children}</button>;
}
