import Link from "next/link"; import { db } from "@/lib/db"; export const revalidate = 300; export const metadata = { title: "Resources", alternates: { canonical: "/resources" } };
export default async function R() { const rows = await db.article.findMany({ where:{status:"PUBLISHED"}, orderBy:{publishedAt:"desc"} });
  return <main className="max-w-4xl mx-auto px-6 py-16"><h1 className="text-5xl md:text-7xl font-semibold tracking-tight">Resources</h1>{rows.length===0&&<p className="mt-8 text-stone">No articles published yet.</p>}
    <ul className="mt-12 divide-y divide-line">{rows.map(a=><li key={a.id} className="py-6"><Link href={`/resources/${a.slug}`} className="text-2xl font-bold hover:underline">{a.title}</Link><p className="mt-2 text-stone">{a.excerpt}</p></li>)}</ul></main>; }
