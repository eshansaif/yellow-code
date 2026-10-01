"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
export type Opt = { value: string; label: string };
export default function SearchSelect({ name, options, defaultValue = "", placeholder = "Select…", required = false }: { name: string; options: Opt[]; defaultValue?: string; placeholder?: string; required?: boolean }) {
  const [val, setVal] = useState(defaultValue), [q, setQ] = useState(""), [open, setOpen] = useState(false), [hi, setHi] = useState(0);
  const id = useId(), root = useRef<HTMLDivElement>(null), sel = options.find(o => o.value === val);
  const list = useMemo(() => options.filter(o => o.label.toLowerCase().includes(q.toLowerCase())), [options, q]);
  useEffect(() => { const c = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) { setOpen(false); setQ(""); } }; document.addEventListener("mousedown", c); return () => document.removeEventListener("mousedown", c); }, []);
  const pick = (o: Opt) => { setVal(o.value); setQ(""); setOpen(false); };
  const key = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setHi(h => Math.min(h + 1, list.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHi(h => Math.max(h - 1, 0)); }
    else if (e.key === "Enter" && open) { e.preventDefault(); if (list[hi]) pick(list[hi]); }
    else if (e.key === "Escape") { setOpen(false); setQ(""); } };
  return <div ref={root} className="relative min-w-48">
    <input type="hidden" name={name} value={val} />
    <input role="combobox" aria-expanded={open} aria-controls={id} aria-autocomplete="list" required={required} autoComplete="off" placeholder={placeholder}
      value={open ? q : sel?.label ?? ""} onFocus={() => { setOpen(true); setHi(0); }} onChange={e => { setQ(e.target.value); setHi(0); setOpen(true); }} onKeyDown={key}
      className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 pr-8 outline-none focus:border-ink" />
    <span aria-hidden className="pointer-events-none absolute right-3 top-1/2 mt-0.5 -translate-y-1/2 text-xs text-stone">▾</span>
    {open && <ul id={id} role="listbox" className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-line bg-white p-1 text-sm shadow-xl">
      {list.length === 0 && <li className="px-3 py-2 text-stone">No matches</li>}
      {list.map((o, i) => <li key={o.value} role="option" aria-selected={o.value === val} onMouseDown={e => { e.preventDefault(); pick(o); }} onMouseEnter={() => setHi(i)}
        className={`cursor-pointer rounded-lg px-3 py-2 ${i === hi ? "bg-paper" : ""} ${o.value === val ? "font-semibold" : ""}`}>{o.label}</li>)}</ul>}</div>;
}
