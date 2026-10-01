import Link from "next/link"; import MobileMenu from "@/components/MobileMenu"; import { db } from "@/lib/db";
export const revalidate = 300;
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const cats = await db.category.findMany({ where: { status: "PUBLISHED", parentId: null }, orderBy: { sortOrder: "asc" }, select: { slug: true, name: true } });
  const site = ((await db.siteSetting.findUnique({ where: { key: "site" } }))?.value ?? {}) as { footerText?: string; links?: { label: string; href: string }[] };
  const link = "px-3 py-2 hover:underline underline-offset-4 decoration-yc decoration-2";
  return <>
    <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:bg-yc focus:p-3">Skip to content</a>
    <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur border-b border-line">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        <Link href="/"><img src="/logo.png" alt="Yellow Code Trims" className="h-9 w-auto"/></Link>
        <nav aria-label="Main" className="hidden md:flex items-center text-sm font-medium">
          <div className="group relative"><Link href="/products" className={`${link} inline-flex items-center gap-1`}>Products <span aria-hidden className="text-xs transition-transform duration-200 group-hover:rotate-180">▾</span></Link>
            <div className="invisible absolute left-0 top-full w-64 pt-2 opacity-0 transition duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"><ul className="rounded-xl border border-line bg-white p-2 shadow-xl">{cats.map(c=><li key={c.slug}><Link className="block rounded-lg px-3 py-2 hover:bg-paper" href={`/products/${c.slug}`}>{c.name}</Link></li>)}<li><Link className="block rounded-lg px-3 py-2 text-stone hover:bg-paper" href="/products">All products</Link></li></ul></div></div>
          <Link className={link} href="/services">Services</Link><Link className={link} href="/about">About</Link><Link className={link} href="/capabilities">Capabilities</Link><Link className={link} href="/sustainability">Sustainability</Link><Link className={link} href="/gallery">Gallery</Link><Link className={link} href="/resources">Resources</Link><Link className={link} href="/search">Search</Link><Link className={link} href="/contact">Contact</Link></nav>
        <div className="flex items-center gap-3">
          <Link href="/request-a-quote" className="rounded-full bg-ink text-paper px-5 py-2.5 text-sm font-semibold hover:bg-yc hover:text-ink transition-colors">Get a quote</Link>
          <MobileMenu cats={cats} links={[["/services","Services"],["/resources","Resources"],["/about","About"],["/capabilities","Capabilities"],["/sustainability","Sustainability"],["/gallery","Gallery"],["/search","Search"],["/contact","Contact"]]}/></div></div></header>
    <div id="main">{children}</div>
    <footer className="bg-ink text-paper mt-24"><div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-10 text-sm">
      <div className="md:col-span-2"><img src="/logo.png" alt="Yellow Code Trims" className="h-10 w-auto bg-paper p-1"/><p className="mt-5 max-w-sm text-stone">{site.footerText || "Garment trims and accessories manufacturer based in Bangladesh."}</p>
        <Link href="/request-a-quote" className="mt-6 inline-block rounded-full bg-yc text-ink px-5 py-2.5 font-semibold">Request a quote</Link></div>
      <div><h2 className="font-semibold">Products</h2><ul className="mt-3 space-y-2 text-stone">{cats.map(c=><li key={c.slug}><Link className="hover:text-yc" href={`/products/${c.slug}`}>{c.name}</Link></li>)}</ul></div>
      <div><h2 className="font-semibold">Company</h2><ul className="mt-3 space-y-2 text-stone"><li><Link className="hover:text-yc" href="/about">About</Link></li><li><Link className="hover:text-yc" href="/capabilities">Capabilities</Link></li><li><Link className="hover:text-yc" href="/sustainability">Sustainability</Link></li><li><Link className="hover:text-yc" href="/gallery">Gallery</Link></li>{site.links?.map(l=><li key={l.href}><Link className="hover:text-yc" href={l.href}>{l.label}</Link></li>)}<li><Link className="hover:text-yc" href="/contact">Contact</Link></li></ul></div></div>
      <p className="border-t border-white/10 py-5 text-center text-xs text-stone">© Yellow Code Trims. All rights reserved.</p></footer></>;
}
