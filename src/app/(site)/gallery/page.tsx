import { db } from "@/lib/db"; import Gallery from "@/components/Gallery"; import FilterBar from "@/components/FilterBar"; import Pagination from "@/components/Pagination"; import { pg, type SP } from "@/lib/list";
export const metadata = { title: "Gallery", alternates: { canonical: "/gallery" } };
export default async function G({ searchParams }: { searchParams: Promise<SP> }) { const sp = await searchParams; const { page, skip, take } = pg(sp, 24);
  const where = { product: { status: "PUBLISHED" as const, ...(sp.c ? { category: { slug: sp.c } } : {}) } };
  const [cats, total, imgs] = await Promise.all([db.category.findMany({ where: { status: "PUBLISHED" }, orderBy: { sortOrder: "asc" }, select: { slug: true, name: true } }), db.productImage.count({ where }), db.productImage.findMany({ where, include: { media: true }, orderBy: [{ sortOrder: "asc" }, { id: "asc" }], skip, take })]);
  return <main className="mx-auto max-w-7xl px-6 py-14"><h1 className="text-4xl font-semibold md:text-6xl">Gallery</h1>
    <div className="mt-8"><FilterBar search={false} fields={[{ name: "c", label: "Category", options: cats.map(c => ({ value: c.slug, label: c.name })) }]} /></div>
    <div className="mt-8">{imgs.length ? <Gallery images={imgs.map(i => ({ id: i.id, url: i.media.url, alt: i.media.alt, caption: i.media.caption }))} /> : <p className="text-stone">No images yet.</p>}</div>
    <Pagination total={total} per={take} page={page} path="/gallery" params={sp} /></main>; }
