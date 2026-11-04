"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation"; import { useState, useTransition } from "react"; import SearchSelect from "@/components/SearchSelect";
type Field = { name: string; label: string; options: { value: string; label: string }[] };
// Filter bar for report pages: date range, dropdowns and a search box. Every
// change updates the URL (server component re-renders with the new data).
export default function ReportFilter({ fields = [], q = false, qPlaceholder = "Search…", dates = true }: {
  fields?: Field[]; q?: boolean; qPlaceholder?: string; dates?: boolean; }) {
  const sp = useSearchParams(), path = usePathname(), router = useRouter();
  const [qq, setQq] = useState(sp.get("q") ?? ""); const [pending, start] = useTransition();
  const push = (patch: Record<string, string>) => { const p = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) { if (v) p.set(k, v); else p.delete(k); } p.delete("page");
    const s = p.toString(); start(() => router.push(s ? `${path}?${s}` : path)); };
  const active = [...sp.keys()].some(k => k !== "page");
  return <div role="search" aria-busy={pending} className="rounded-2xl border border-line bg-white p-4">
    <div className="flex flex-wrap items-end gap-3">
      {dates && <label className="block text-sm">From<input type="date" defaultValue={sp.get("from") ?? ""} onChange={e => push({ from: e.target.value })} className="mt-1" /></label>}
      {dates && <label className="block text-sm">To<input type="date" defaultValue={sp.get("to") ?? ""} onChange={e => push({ to: e.target.value })} className="mt-1" /></label>}
      {fields.map(f => <div key={f.name + (sp.get(f.name) ?? "")} className="w-full min-w-[11rem] sm:w-auto"><SearchSelect name={f.name} placeholder={f.label} defaultValue={sp.get(f.name) ?? ""} options={[{ value: "", label: `All (${f.label})` }, ...f.options]} onChange={v => push({ [f.name]: v })} /></div>)}
      {q && <form onSubmit={e => { e.preventDefault(); push({ q: qq.trim() }); }} className="min-w-[14rem] flex-1"><input value={qq} onChange={e => setQq(e.target.value)} placeholder={qPlaceholder} aria-label="Search" className="w-full rounded-full border border-line bg-white px-5 py-2.5 outline-none focus:border-ink" /></form>}
      {active && <button type="button" className="underline pb-2 text-sm" onClick={() => { setQq(""); start(() => router.push(path)); }}>Clear filters</button>}
    </div></div>;
}
