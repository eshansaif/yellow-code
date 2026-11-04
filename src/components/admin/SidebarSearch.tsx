"use client";
import { useRouter } from "next/navigation"; import { useEffect, useRef, useState } from "react";
type Item = { label: string; sub?: string; href: string };
type Group = { title: string; items: Item[] };
// Sidebar global search: type at least 2 characters, debounce 300 ms, hit
// /api/admin-search, and also match admin page names locally ("invo" → Invoices).
export default function SidebarSearch({ pages = [] }: { pages?: [string, string][] }) {
  const r = useRouter(); const [q, setQ] = useState(""); const [open, setOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]); const [busy, setBusy] = useState(false);
  const box = useRef<HTMLDivElement>(null); const input = useRef<HTMLInputElement>(null);
  const trimmed = q.trim();
  useEffect(() => { const h = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, []);
  useEffect(() => {
    if (trimmed.length < 2) { setGroups([]); return; }
    const ctrl = new AbortController(); setBusy(true);
    const t = setTimeout(async () => { try { const res = await fetch(`/api/admin-search?q=${encodeURIComponent(trimmed)}`, { signal: ctrl.signal });
      const d = await res.json(); setGroups(res.ok ? d.groups ?? [] : []); } catch { /* aborted or offline */ } finally { setBusy(false); } }, 300);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [trimmed]);
  const ql = trimmed.toLowerCase();
  const pageHits = trimmed.length >= 2 ? pages.filter(([, l]) => l.toLowerCase().includes(ql)).slice(0, 3).map(([h, l]) => ({ label: l, href: h })) : [];
  const all: Group[] = [...(pageHits.length ? [{ title: "Pages", items: pageHits }] : []), ...groups];
  const go = (href: string) => { setOpen(false); setQ(""); r.push(href); };
  return <div ref={box} className="relative">
    <div className="relative">
      <svg aria-hidden viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
      <input ref={input} value={q} onChange={e => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)}
        onKeyDown={e => { if (e.key === "Escape") { setOpen(false); setQ(""); } if (e.key === "Enter" && all[0]?.items[0]) { e.preventDefault(); go(all[0].items[0].href); } }}
        placeholder="Search admin…" aria-label="Search the admin panel" className="!w-full rounded-full !border !border-white/15 !bg-white/10 !py-2 !pl-9 !pr-3 !text-sm !text-white !shadow-none !placeholder:text-white/40 outline-none focus:!border-[#f2c10e] focus:!bg-white/15" />
    </div>
    {open && trimmed.length >= 2 && <div className="absolute inset-x-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-xl bg-white p-2 text-[#16130d] shadow-xl ring-1 ring-black/10">
      {busy && <p className="px-2 py-1.5 text-xs text-stone">Searching…</p>}
      {!busy && all.length === 0 && <p className="px-2 py-1.5 text-xs text-stone">No matches for “{trimmed}”.</p>}
      {all.map(g => <div key={g.title} className="mb-1"><p className="px-2 pb-0.5 pt-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone">{g.title}</p>
        {g.items.map(it => <button key={it.href + it.label} type="button" onClick={() => go(it.href)} className="adm-plain !block !w-full !rounded-lg !px-2 !py-1.5 !text-left !text-sm !font-medium !normal-case hover:!bg-[#f4f1ea]">
          <span className="block truncate">{it.label}</span>{it.sub && <span className="block truncate !text-xs !font-normal !text-stone">{it.sub}</span>}</button>)}</div>)}
    </div>}
  </div>;
}
