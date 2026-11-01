import Link from "next/link"; import { db } from "@/lib/db"; import MobileMenu from "@/components/MobileMenu";
export const revalidate = 300;
const company: [string, string][] = [["/about", "About"], ["/capabilities", "Capabilities"], ["/sustainability", "Sustainability"], ["/certifications", "Certifications"], ["/clients", "Clients"]];
const mobile: [string, string][] = [["/services", "Services"], ...company, ["/gallery", "Gallery"], ["/resources", "Resources"], ["/search", "Search"], ["/contact", "Contact"]];
function Dropdown({ label, href, items }: { label: string; href?: string; items: [string, string][] }) {
  return <div className="group relative"><Link href={href ?? items[0][0]} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 hover:bg-white">{label} <span aria-hidden className="text-[10px] transition-transform duration-200 group-hover:rotate-180">▾</span></Link>
    <div className="invisible absolute left-0 top-full z-50 w-64 pt-2 opacity-0 transition duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"><ul className="rounded-xl border border-line bg-white p-2 shadow-xl">{items.map(([h, l]) => <li key={h}><Link className="block rounded-lg px-3 py-2 hover:bg-paper" href={h}>{l}</Link></li>)}</ul></div></div>;
}
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [cats, siteRow] = await Promise.all([db.category.findMany({ where: { status: "PUBLISHED", parentId: null }, orderBy: { sortOrder: "asc" }, select: { slug: true, name: true } }), db.siteSetting.findUnique({ where: { key: "site" } })]);
  const site = (siteRow?.value ?? {}) as { footerText?: string; links?: { label: string; href: string }[] }; const link = "rounded-lg px-3 py-2 hover:bg-white";
  const catItems: [string, string][] = [...cats.map(c => [`/products/${c.slug}`, c.name] as [string, string]), ["/products", "All products"]];
  return <>
    <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-yc focus:p-3">Skip to content</a>
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
      <Link href="/" className="shrink-0"><img src="/logo.png" alt="Yellow Code Trims" className="h-9 w-auto" /></Link>
      <nav aria-label="Main" className="hidden items-center text-sm font-medium lg:flex"><Dropdown label="Products" href="/products" items={catItems} /><Link className={link} href="/services">Services</Link><Dropdown label="Company" items={company} /><Link className={link} href="/gallery">Gallery</Link><Link className={link} href="/resources">Resources</Link><Link className={link} href="/contact">Contact</Link><Link className={link} href="/search">Search</Link></nav>
      <div className="flex items-center gap-2"><Link href="/request-a-quote" className="rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-paper hover:bg-yc hover:text-ink sm:px-5">Get a quote</Link><MobileMenu cats={cats} links={mobile} /></div></div></header>
    <div id="main">{children}</div>
    <footer className="mt-24 bg-ink text-paper"><div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 px-6 py-16 text-sm md:grid-cols-4">
      <div className="col-span-2"><img src="/logo.png" alt="Yellow Code Trims" className="h-10 w-auto rounded bg-paper p-1" /><p className="mt-5 max-w-sm text-stone">{site.footerText || "Garment trims and accessories manufacturer based in Bangladesh."}</p><Link href="/request-a-quote" className="mt-6 inline-block rounded-full bg-yc px-5 py-2.5 font-semibold text-ink">Request a quote</Link></div>
      <div><h2 className="font-semibold">Products</h2><ul className="mt-3 space-y-2 text-stone">{cats.map(c => <li key={c.slug}><Link className="hover:text-yc" href={`/products/${c.slug}`}>{c.name}</Link></li>)}</ul></div>
      <div><h2 className="font-semibold">Company</h2><ul className="mt-3 space-y-2 text-stone">{[["/services", "Services"], ...company, ["/gallery", "Gallery"], ["/resources", "Resources"], ["/contact", "Contact"]].map(([h, l]) => <li key={h}><Link className="hover:text-yc" href={h}>{l}</Link></li>)}{site.links?.map(l => <li key={l.href}><Link className="hover:text-yc" href={l.href}>{l.label}</Link></li>)}</ul></div></div>
      <p className="border-t border-white/10 py-5 text-center text-xs text-stone">© Yellow Code Trims. All rights reserved.</p></footer></>;
}
