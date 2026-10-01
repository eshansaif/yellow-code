"use client";
import Link from "next/link"; import { usePathname } from "next/navigation"; import { useEffect, useState } from "react";
export default function MobileMenu({ cats, links }: { cats: { slug: string; name: string }[]; links: [string, string][] }) {
  const [open, setOpen] = useState(false); const path = usePathname();
  useEffect(() => setOpen(false), [path]);
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, []);
  return <div className="relative md:hidden"><button onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"} className="grid size-10 place-items-center rounded-full border border-line bg-white">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>{open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}</svg></button>
    {open && <div className="absolute right-0 top-full mt-2 max-h-[70vh] w-72 overflow-auto rounded-xl border border-line bg-white p-2 text-sm shadow-xl">
      <p className="px-3 pt-2 text-xs text-stone">Products</p>{cats.map(c => <Link key={c.slug} href={`/products/${c.slug}`} className="block rounded-lg px-3 py-2 hover:bg-paper">{c.name}</Link>)}
      <div className="my-2 border-t border-line" />{links.map(([h, l]) => <Link key={h} href={h} className="block rounded-lg px-3 py-2 hover:bg-paper">{l}</Link>)}</div>}</div>;
}
