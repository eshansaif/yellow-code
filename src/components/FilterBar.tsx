"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation"; import { useState, useTransition } from "react"; import SearchSelect from "@/components/SearchSelect";
type Field = { name: string; label: string; options: { value: string; label: string }[] };
export default function FilterBar({ fields, placeholder = "Search…", search = true }: { fields: Field[]; placeholder?: string; search?: boolean }) {
  const sp = useSearchParams(), path = usePathname(), router = useRouter(); const [q, setQ] = useState(sp.get("q") ?? ""); const [pending, start] = useTransition();
  const push = (k: string, v: string) => { const p = new URLSearchParams(sp.toString()); if (v) p.set(k, v); else p.delete(k); p.delete("page"); const s = p.toString(); start(() => router.push(s ? `${path}?${s}` : path)); };
  const active = [...sp.keys()].some(k => k !== "page");
  return <div role="search" aria-busy={pending} className="flex flex-wrap items-end gap-3">
    {search && <form onSubmit={e => { e.preventDefault(); push("q", q.trim()); }} className="min-w-[14rem] flex-1"><input value={q} onChange={e => setQ(e.target.value)} placeholder={placeholder} aria-label="Search" className="w-full rounded-full border border-line bg-white px-5 py-2.5 outline-none focus:border-ink" /></form>}
    {fields.map(f => <div key={f.name + (sp.get(f.name) ?? "")} className="w-full min-w-[11rem] sm:w-auto"><SearchSelect name={f.name} placeholder={f.label} defaultValue={sp.get(f.name) ?? ""} options={[{ value: "", label: `All (${f.label})` }, ...f.options]} onChange={v => push(f.name, v)} /></div>)}
    {active && <button type="button" className="underline pb-2 text-sm" onClick={() => { setQ(""); start(() => router.push(path)); }}>Clear filters</button>}</div>;
}
