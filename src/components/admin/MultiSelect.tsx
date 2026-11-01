"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
export type MOpt = { value: string; label: string };
export default function MultiSelect({ name, options, defaultValues = [], placeholder = "Search to add…", max = 12 }: { name: string; options: MOpt[]; defaultValues?: string[]; placeholder?: string; max?: number }) {
  const [vals, setVals] = useState<string[]>(defaultValues), [q, setQ] = useState(""), [open, setOpen] = useState(false), [hi, setHi] = useState(0); const id = useId(), root = useRef<HTMLDivElement>(null);
  const list = useMemo(() => options.filter(o => !vals.includes(o.value) && o.label.toLowerCase().includes(q.toLowerCase())).slice(0, 50), [options, vals, q]);
  useEffect(() => { const c = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) { setOpen(false); setQ(""); } }; document.addEventListener("mousedown", c); return () => document.removeEventListener("mousedown", c); }, []);
  const add = (o: MOpt) => { if (vals.length >= max) return; setVals([...vals, o.value]); setQ(""); setHi(0); };
  const key = (e: React.KeyboardEvent) => { if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setHi(h => Math.min(h + 1, list.length - 1)); } else if (e.key === "ArrowUp") { e.preventDefault(); setHi(h => Math.max(h - 1, 0)); }
    else if (e.key === "Enter" && open) { e.preventDefault(); if (list[hi]) add(list[hi]); } else if (e.key === "Escape") { setOpen(false); setQ(""); } else if (e.key === "Backspace" && !q && vals.length) setVals(vals.slice(0, -1)); };
  return <div ref={root} className="relative">{vals.map(v => <input key={v} type="hidden" name={name} value={v} />)}
    {vals.length > 0 && <ul className="mb-2 flex flex-wrap gap-2">{vals.map(v => <li key={v} className="inline-flex items-center gap-1 rounded-full bg-[#fff3bf] py-1 pl-3 pr-1 text-sm">{options.find(o => o.value === v)?.label ?? v}<button type="button" aria-label="Remove" onClick={() => setVals(vals.filter(x => x !== v))} className="adm-plain grid size-6 place-items-center rounded-full hover:bg-black/10">×</button></li>)}</ul>}
    <input role="combobox" aria-expanded={open} aria-controls={id} autoComplete="off" disabled={vals.length >= max} placeholder={vals.length >= max ? `Maximum ${max} reached` : placeholder} value={q} onFocus={() => setOpen(true)} onChange={e => { setQ(e.target.value); setHi(0); setOpen(true); }} onKeyDown={key} />
    {open && vals.length < max && <ul id={id} role="listbox" className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-line bg-white p-1 text-sm shadow-xl">{list.length === 0 && <li className="px-3 py-2 text-stone">No matches</li>}
      {list.map((o, i) => <li key={o.value} role="option" aria-selected={false} onMouseDown={e => { e.preventDefault(); add(o); }} onMouseEnter={() => setHi(i)} className={`cursor-pointer rounded-lg px-3 py-2 ${i === hi ? "bg-paper" : ""}`}>{o.label}</li>)}</ul>}</div>;
}
