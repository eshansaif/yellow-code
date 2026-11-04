import Link from "next/link"; import { db } from "@/lib/db"; import FilterBar from "@/components/FilterBar"; import Pagination from "@/components/Pagination"; import { pg, ci, type SP } from "@/lib/list";
export const metadata = { title: "Services", alternates: { canonical: "/services" } };
export default async function S({ searchParams }: { searchParams: Promise<SP> }) { const sp = await searchParams; const { page, skip, take } = pg(sp, 12);
  const where = { status: "PUBLISHED" as const, ...(sp.q ? { OR: [{ name: ci(sp.q) }, { description: ci(sp.q) }] } : {}) };
  const [total, rows] = await Promise.all([db.service.count({ where }), db.service.findMany({ where, orderBy: { sortOrder: "asc" }, skip, take })]);
  return <main className="mx-auto max-w-7xl px-6 py-14"><h1 className="text-4xl font-semibold md:text-6xl">Services</h1><div className="mt-8"><FilterBar fields={[]} placeholder="Search services…" /></div>
    {rows.length === 0 ? <p className="mt-12 text-stone">No services found.</p> : <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{rows.map(r => <li key={r.id}><Link href={`/services/${r.slug}`} className="block h-full rounded-2xl border border-line bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl"><h2 className="text-xl font-semibold">{r.name}</h2><p className="mt-2 line-clamp-3 text-sm text-stone">{r.description}</p></Link></li>)}</ul>}
    <Pagination total={total} per={take} page={page} path="/services" params={sp} /></main>; }
