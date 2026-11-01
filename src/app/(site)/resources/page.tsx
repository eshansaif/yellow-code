import Link from "next/link"; import { db } from "@/lib/db"; import FilterBar from "@/components/FilterBar"; import Pagination from "@/components/Pagination"; import { pg, ci, type SP } from "@/lib/list";
export const metadata = { title: "Resources", alternates: { canonical: "/resources" } };
export default async function R({ searchParams }: { searchParams: Promise<SP> }) { const sp = await searchParams; const { page, skip, take } = pg(sp, 9);
  const where = { status: "PUBLISHED" as const, ...(sp.q ? { OR: [{ title: ci(sp.q) }, { excerpt: ci(sp.q) }] } : {}) };
  const [total, rows] = await Promise.all([db.article.count({ where }), db.article.findMany({ where, orderBy: { publishedAt: "desc" }, skip, take })]);
  return <main className="mx-auto max-w-7xl px-6 py-14"><h1 className="text-4xl font-semibold md:text-6xl">Resources</h1><div className="mt-8"><FilterBar fields={[]} placeholder="Search articles…" /></div>
    {rows.length === 0 ? <p className="mt-12 text-stone">No articles found.</p> : <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{rows.map(a => <li key={a.id}><Link href={`/resources/${a.slug}`} className="block h-full rounded-2xl border border-line bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl"><p className="text-xs text-stone">{a.publishedAt?.toLocaleDateString("en-GB")}</p><h2 className="mt-2 text-xl font-semibold">{a.title}</h2><p className="mt-2 line-clamp-3 text-sm text-stone">{a.excerpt}</p></Link></li>)}</ul>}
    <Pagination total={total} per={take} page={page} path="/resources" params={sp} /></main>; }
