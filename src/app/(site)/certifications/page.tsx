import { db } from "@/lib/db"; import Pagination from "@/components/Pagination"; import { pg, type SP } from "@/lib/list";
export const revalidate = 300; export const metadata = { title: "Certifications", alternates: { canonical: "/certifications" } };
export default async function Certs({ searchParams }: { searchParams: Promise<SP> }) { const sp = await searchParams; const { page, skip, take } = pg(sp, 12);
  const [total, rows] = await Promise.all([db.certification.count({ where: { published: true } }), db.certification.findMany({ where: { published: true }, orderBy: { name: "asc" }, skip, take })]);
  return <main className="mx-auto max-w-7xl px-6 py-14"><h1 className="text-4xl font-semibold md:text-6xl">Certifications</h1>
    {rows.length === 0 ? <p className="mt-12 text-stone">No certifications published yet.</p> : <ul className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">{rows.map(c => <li key={c.id} className="rounded-2xl border border-line bg-white p-6 text-center">{c.fileUrl && <img src={c.fileUrl} alt={c.name} loading="lazy" className="mx-auto h-28 w-auto max-w-full object-contain" />}<p className="mt-4 font-semibold">{c.name}</p><p className="text-sm text-stone">{c.issuer}</p></li>)}</ul>}
    <Pagination total={total} per={take} page={page} path="/certifications" params={sp} /></main>; }
