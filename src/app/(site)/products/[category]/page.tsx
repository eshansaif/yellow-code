import Link from "next/link"; import { notFound } from "next/navigation"; import { db } from "@/lib/db";
export const revalidate = 300;
export async function generateMetadata({ params }:{params:Promise<{category:string}>}) { const { category } = await params;
  const c = await db.category.findUnique({ where:{slug:category} }); return { title: c?.seoTitle ?? c?.name, description: c?.seoDescription ?? c?.description ?? undefined, alternates:{canonical:`/products/${category}`} }; }
export default async function Cat({ params }:{params:Promise<{category:string}>}) { const { category } = await params;
  const c = await db.category.findUnique({ where:{slug:category, status:"PUBLISHED"}, include:{products:{where:{status:"PUBLISHED"},orderBy:{sortOrder:"asc"}}} });
  if (!c) notFound();
  return <main className="max-w-7xl mx-auto px-6 py-16"><nav aria-label="Breadcrumb" className="text-sm text-stone"><Link href="/products">Products</Link> / {c.name}</nav>
    <h1 className="mt-4 text-5xl font-semibold">{c.name}</h1><p className="mt-4 max-w-xl text-stone">{c.description}</p>
    <ul className="mt-10 grid md:grid-cols-3 gap-4">{c.products.map(p=><li key={p.id} className="rounded-2xl border border-line bg-white p-6 min-h-40"><Link className="text-xl font-bold hover:underline" href={`/products/${c.slug}/${p.slug}`}>{p.name}</Link><p className="mt-2 text-sm text-stone">{p.shortDescription}</p></li>)}</ul></main>;
}
