import Link from "next/link"; import { db } from "@/lib/db";
export const revalidate = 300; export const metadata = { title: "Products", alternates: { canonical: "/products" } };
export default async function Products() {
  const cats = await db.category.findMany({ where:{status:"PUBLISHED"}, orderBy:{sortOrder:"asc"}, include:{ products:{ where:{status:"PUBLISHED"}, orderBy:{sortOrder:"asc"} } } });
  return <main className="max-w-7xl mx-auto px-6 py-16">
    <h1 className="text-5xl font-semibold tracking-tight">Products</h1>
    {cats.length===0 && <p className="mt-8 text-stone">No products published yet.</p>}
    {cats.map(c=><section key={c.id} className="mt-14"><h2 className="text-2xl font-bold"><Link href={`/products/${c.slug}`}>{c.name}</Link></h2>
      <ul className="mt-4 grid md:grid-cols-3 gap-4">{c.products.map(p=><li key={p.id} className="rounded-2xl border border-line bg-white p-5"><Link className="font-semibold hover:underline" href={`/products/${c.slug}/${p.slug}`}>{p.name}</Link><p className="text-sm text-stone mt-1">{p.shortDescription}</p></li>)}</ul></section>)}
  </main>;
}
