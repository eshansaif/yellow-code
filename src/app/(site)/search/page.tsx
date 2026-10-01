import Link from "next/link"; import { db } from "@/lib/db";
export const metadata = { title: "Search", robots: { index: false } };
export default async function S({ searchParams }:{searchParams:Promise<{q?:string}>}) { const q = (await searchParams).q?.trim().slice(0,80);
  const r = q ? await db.product.findMany({ where:{ status:"PUBLISHED", OR:[{name:{contains:q,mode:"insensitive"}},{shortDescription:{contains:q,mode:"insensitive"}},{category:{name:{contains:q,mode:"insensitive"}}}] }, include:{category:true}, take:30 }) : [];
  return <main className="max-w-3xl mx-auto px-6 py-16"><h1 className="text-5xl font-semibold tracking-tight">Search</h1>
    <form className="mt-8 flex gap-2" role="search"><input name="q" defaultValue={q} placeholder="Labels, patches, hang tags…" className="flex-1 rounded-full border border-line bg-white px-5 py-3 outline-none focus:border-ink"/><button className="rounded-full bg-ink text-paper px-6">Search</button></form>
    {q && r.length===0 && <p className="mt-8 text-stone">No products match “{q}”. Try a broader word, or <Link className="underline" href="/request-a-quote">request a quote</Link> for something custom.</p>}
    <ul className="mt-8 divide-y divide-line">{r.map(p=><li key={p.id} className="py-4"><Link href={`/products/${p.category.slug}/${p.slug}`} className="font-bold text-lg hover:underline">{p.name}</Link><p className="text-sm text-stone">{p.category.name}. {p.shortDescription}</p></li>)}</ul></main>; }
