"use client";
import Link from "next/link"; import { usePathname } from "next/navigation"; import { useEffect, useState } from "react";
const groups: [string, [string, string][]][] = [
  ["Overview", [["/admin", "Dashboard"]]],
  ["Sales", [["/admin/quotes", "Quote requests"], ["/admin/messages", "Messages"], ["/admin/clients", "Clients"]]],
  ["Catalogue", [["/admin/products", "Products"], ["/admin/categories", "Categories"], ["/admin/services", "Services"], ["/admin/media", "Media library"]]],
  ["Content", [["/admin/homepage", "Homepage"], ["/admin/pages", "Pages"], ["/admin/articles", "Resources"], ["/admin/certifications", "Certifications"], ["/admin/navigation", "Footer and links"], ["/admin/settings", "Contact settings"]]],
  ["System", [["/admin/users", "Users"]]],
];
export default function AdminSidebar({ name, role, signOutSlot }: { name: string; role: string; signOutSlot: React.ReactNode }) {
  const path = usePathname(); const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  const nav = <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 pb-4">{groups.map(([g, items]) => <div key={g} className="mt-5"><p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-white/40">{g}</p>
    {items.map(([h, l]) => { const on = h === "/admin" ? path === h : path.startsWith(h); return <Link key={h} href={h} aria-current={on ? "page" : undefined} className={`mt-1 block rounded-lg px-3 py-2 text-sm ${on ? "bg-[#f2c10e] font-semibold text-[#16130d]" : "text-white/75 hover:bg-white/10 hover:text-white"}`}>{l}</Link>; })}</div>)}</nav>;
  const foot = <div className="border-t border-white/10 p-4 text-sm"><p className="font-medium text-white">{name}</p><p className="text-xs text-white/50">{role}</p><div className="mt-3">{signOutSlot}</div></div>;
  const logo = <div className="p-5"><span className="inline-block rounded-lg bg-white p-1.5"><img src="/logo.png" alt="Yellow Code Trims" className="h-7 w-auto" /></span></div>;
  return <>
    <aside className="sticky top-0 hidden h-screen flex-col bg-[#16130d] lg:flex">{logo}{nav}{foot}</aside>
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#e7e0d2] bg-white px-4 py-3 lg:hidden">
      <img src="/logo.png" alt="Yellow Code Trims" className="h-7 w-auto" />
      <button onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"} className="adm-plain grid size-10 place-items-center rounded-full border border-[#e7e0d2]"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>{open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}</svg></button></header>
    {open && <div className="fixed inset-0 z-40 lg:hidden"><button aria-label="Close menu" onClick={() => setOpen(false)} className="adm-plain absolute inset-0 bg-black/50" /><div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-[#16130d]">{logo}{nav}{foot}</div></div>}
  </>;
}
