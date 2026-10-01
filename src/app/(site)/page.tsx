import Link from "next/link"; import { db } from "@/lib/db"; import TrimArt, { kindOf } from "@/components/TrimArt";
export const revalidate = 300;
const ORDER = ["hero", "marquee", "products", "why", "spotlight", "clients", "process", "cta"];
const D = { headline: "Trims made to carry your brand.", sub: "Woven and printed labels, hang tags, patches and custom trims, manufactured in Bangladesh for apparel brands and buyers.", cta1Label: "Explore products", cta1Url: "/products", cta2Label: "Request a quote", cta2Url: "/request-a-quote", closing: "Tell us what you need. We'll quote it." };
const tints = ["bg-[#f3ecd9]", "bg-[#fff3bf]", "bg-[#ebe5d6]", "bg-[#f7f4ed]"];
const why: [string, string, string][] = [
  ["Precision", "Careful attention to size, colour and finish on every trim.", "M12 3v3M12 18v3M3 12h3M18 12h3M12 8a4 4 0 100 8 4 4 0 000-8z"],
  ["Quality focus", "Materials and finished pieces checked before they leave the line.", "M9 12l2 2 4-4M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z"],
  ["Customization", "Made to your artwork, shape, material and attachment.", "M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M14 4v4M8 10v4M16 16v4"],
  ["Design support", "Help from artwork preparation through to sample approval.", "M4 20l4-1L19 8l-3-3L5 16l-1 4zM14 7l3 3"],
  ["Reliable production", "A clear process from quotation to delivery, with no surprises.", "M12 7v5l3 2M12 3a9 9 0 100 18 9 9 0 000-18z"],
  ["Customer support", "A real person to talk to at every stage of your order.", "M4 13v-1a8 8 0 0116 0v1M4 13h3v5H5a1 1 0 01-1-1v-4zM20 13h-3v5h2a1 1 0 001-1v-4z"],
];
const Head = ({ k, t, s }: { k: string; t: string; s?: string }) => <div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a6d00]">{k}</p><h2 className="mt-3 text-4xl font-semibold md:text-5xl">{t}</h2>{s && <p className="mt-4 text-stone">{s}</p>}</div>;
export default async function Home() {
  const [cfg, cats, steps, spot, clients] = await Promise.all([
    db.pageContent.findUnique({ where: { key: "home" } }),
    db.category.findMany({ where: { status: "PUBLISHED", parentId: null }, orderBy: { sortOrder: "asc" }, take: 9, include: { products: { where: { status: "PUBLISHED" }, take: 1, include: { images: { include: { media: true }, orderBy: { sortOrder: "asc" }, take: 1 } } } } }),
    db.processStep.findMany({ where: { kind: "order" }, orderBy: { sortOrder: "asc" } }),
    db.product.findFirst({ where: { status: "PUBLISHED", featured: true }, include: { category: true, images: { include: { media: true }, orderBy: { sortOrder: "asc" }, take: 3 } } }),
    db.client.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" }, take: 12 }),
  ]);
  const d = (cfg?.data ?? {}) as { sections?: { id: string; enabled: boolean }[]; hero?: Partial<typeof D> }; const h = { ...D, ...d.hero };
  const saved = d.sections ?? []; const missing = ORDER.filter(id => !saved.some(s => s.id === id)).map(id => ({ id, enabled: true }));
  const sections = saved.length ? [...saved.filter(s => s.id !== "cta"), ...missing.filter(m => m.id !== "cta"), saved.find(s => s.id === "cta") ?? { id: "cta", enabled: true }] : ORDER.map(id => ({ id, enabled: true }));
  const words = cats.length ? cats.map(c => c.name) : ["Woven labels", "Printed labels", "Heat transfer labels", "Hang tags", "PVC and silicone patches", "Leather labels", "Metal tags", "Woven zipper pulls"];
  const R: Record<string, React.ReactNode> = {
    hero: <section key="hero" className="mx-auto grid max-w-7xl items-center gap-10 px-6 pb-16 pt-14 lg:grid-cols-[1.1fr_1fr] lg:pt-20">
      <div><span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-4 py-1.5 text-xs font-medium"><span className="size-1.5 rounded-full bg-yc" />Garment trims manufacturer · Bangladesh</span>
        <h1 className="mt-6 text-[clamp(2.6rem,6vw,5.4rem)] font-semibold">{h.headline}</h1><p className="mt-6 max-w-xl text-lg text-stone">{h.sub}</p>
        <div className="mt-9 flex flex-wrap gap-3"><Link href={h.cta2Url} className="rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-paper shadow-lg shadow-black/10 hover:-translate-y-0.5 hover:bg-yc hover:text-ink">{h.cta2Label}</Link><Link href={h.cta1Url} className="rounded-full border border-ink/20 bg-white px-7 py-3.5 text-sm font-semibold hover:border-ink">{h.cta1Label} →</Link></div></div>
      <div aria-hidden className="relative mx-auto h-[22rem] w-full max-w-md md:h-[30rem] md:max-w-none">
        <div className="absolute inset-x-6 inset-y-8 rounded-[2.5rem] bg-gradient-to-br from-[#fff3bf] via-[#f3ecd9] to-white" />
        <div className="float absolute right-2 top-2 w-44 rotate-6 rounded-2xl bg-white p-3 shadow-xl md:w-64"><TrimArt kind="woven" /></div>
        <div className="float absolute left-0 top-28 w-32 -rotate-6 rounded-2xl bg-white p-3 shadow-xl md:w-48" style={{ animationDelay: "-2s" }}><TrimArt kind="patch" /></div>
        <div className="float absolute bottom-2 right-8 w-36 rotate-3 rounded-2xl bg-white p-3 shadow-xl md:w-52" style={{ animationDelay: "-4s" }}><TrimArt kind="tag" /></div>
        <div className="float absolute bottom-10 left-6 w-24 -rotate-3 rounded-2xl bg-white p-2 shadow-xl md:w-36" style={{ animationDelay: "-1s" }}><TrimArt kind="zipper" /></div></div></section>,
    marquee: <section key="marquee" aria-label="Product range" className="overflow-hidden bg-ink py-4 text-paper"><div className="marquee flex w-max gap-10 whitespace-nowrap text-sm font-medium">{[...words, ...words, ...words, ...words].map((w, i) => <span key={i} className="flex items-center gap-10">{w}<span className="text-yc">✦</span></span>)}</div></section>,
    products: <section key="products" className="mx-auto max-w-7xl px-6 pt-24"><Head k="Product range" t="Built to complete the brand." s="Every trim made to your artwork, material and specification." />
      {cats.length === 0 ? <p className="mt-8 text-stone">No categories published yet.</p> : <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{cats.map((c, i) => { const img = c.products[0]?.images[0]?.media; return <li key={c.id} className={i === 0 ? "lg:col-span-2" : ""}>
        <Link href={`/products/${c.slug}`} className="group block overflow-hidden rounded-3xl border border-line bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className={`grid place-items-center overflow-hidden ${i === 0 ? "aspect-[16/8]" : "aspect-[4/3]"} ${tints[i % 4]}`}>{img ? <img src={img.url} alt={img.alt} loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" /> : <TrimArt kind={kindOf(c.name)} className={`${i === 0 ? "w-1/3" : "w-1/2"} max-w-[260px] transition duration-500 group-hover:-rotate-2 group-hover:scale-105`} />}</div>
          <div className="flex items-end justify-between gap-4 p-6"><div><h3 className="text-xl font-semibold">{c.name}</h3><p className="mt-1 line-clamp-2 text-sm text-stone">{c.description}</p></div><span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full border border-line transition group-hover:border-yc group-hover:bg-yc">→</span></div></Link></li>; })}</ul>}</section>,
    why: <section key="why" className="mx-auto max-w-7xl px-6 pt-28"><Head k="Why Yellow Code" t="Made with care, from first sketch to final carton." />
      <ul className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">{why.map(([t, b, p]) => <li key={t} className="bg-white p-8 transition hover:bg-[#fffbea]"><span className="grid size-11 place-items-center rounded-xl bg-yc/25 text-ink"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={p} /></svg></span><h3 className="mt-5 text-lg font-semibold">{t}</h3><p className="mt-2 text-sm text-stone">{b}</p></li>)}</ul></section>,
    spotlight: spot ? <section key="spotlight" className="mx-auto grid max-w-7xl items-center gap-10 px-6 pt-28 md:grid-cols-2"><div className="grid grid-cols-3 gap-2">{spot.images.map((im, i) => <img key={im.id} src={im.media.url} alt={im.media.alt} loading="lazy" className={`w-full rounded-2xl object-cover ${i === 0 ? "col-span-3 aspect-[4/3]" : "aspect-square"}`} />)}</div><div><Head k={spot.category.name} t={spot.name} s={spot.shortDescription ?? undefined} /><Link href={`/products/${spot.category.slug}/${spot.slug}`} className="mt-8 inline-block rounded-full border border-ink px-6 py-3 text-sm font-semibold hover:bg-ink hover:text-paper">Explore product</Link></div></section> : null,
    clients: clients.length ? <section key="clients" className="mx-auto max-w-7xl px-6 pt-28"><h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-stone">Trusted by</h2><ul className="mt-6 flex flex-wrap items-center gap-x-12 gap-y-6">{clients.map(c => <li key={c.id}>{c.logoUrl ? <img src={c.logoUrl} alt={c.name} loading="lazy" className="h-10 w-auto opacity-70 grayscale" /> : <span className="font-semibold text-stone">{c.name}</span>}</li>)}</ul></section> : null,
    process: steps.length ? <section key="process" className="mx-auto max-w-7xl px-6 pt-28"><Head k="How it works" t="From brief to delivery." />
      <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{steps.map((s, i) => <li key={s.id} className="rounded-2xl border border-line bg-white p-6"><span className="grid size-10 place-items-center rounded-full bg-yc text-sm font-semibold">{i + 1}</span><h3 className="mt-4 font-semibold">{s.title}</h3>{s.body && <p className="mt-1 text-sm text-stone">{s.body}</p>}</li>)}</ol></section> : null,
    cta: <section key="cta" className="mx-auto max-w-7xl px-6 pt-28"><div className="relative overflow-hidden rounded-[2rem] bg-ink p-10 text-paper md:p-16"><div aria-hidden className="absolute -right-16 -top-16 size-80 rounded-full bg-yc/25 blur-3xl" /><div aria-hidden className="absolute inset-4 rounded-[1.5rem] border border-dashed border-yc/30" />
      <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-center"><h2 className="max-w-xl text-3xl font-semibold md:text-5xl">{h.closing}</h2><Link href="/request-a-quote" className="self-start rounded-full bg-yc px-8 py-4 text-sm font-semibold text-ink hover:-translate-y-0.5">Request a quote</Link></div></div></section>,
  };
  return <main>{sections.filter(s => s.enabled).map(s => R[s.id])}</main>;
}
