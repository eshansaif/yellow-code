import RichText from "@/lib/richtext";
import Link from "next/link"; import { notFound } from "next/navigation"; import { db } from "@/lib/db"; import Gallery from "@/components/Gallery";
export const revalidate = 300;
const load = (category:string, product:string) => db.product.findFirst({ where:{ slug:product, status:"PUBLISHED", category:{slug:category} },
  include:{ category:true, specs:{orderBy:{sortOrder:"asc"}}, applications:true, options:{orderBy:{sortOrder:"asc"}}, faqs:{orderBy:{sortOrder:"asc"}}, images:{include:{media:true},orderBy:{sortOrder:"asc"}}, related:{where:{status:"PUBLISHED"},include:{category:true},take:4} } });
type P = {params:Promise<{category:string;product:string}>};
export async function generateMetadata({ params }:P) { const { category, product } = await params; const p = await load(category, product); if(!p) return {};
  return { title: p.seoTitle ?? p.name, description: p.seoDescription ?? p.shortDescription ?? undefined, alternates:{canonical:`/products/${category}/${product}`} }; }
export default async function ProductPage({ params }:P) { const { category, product } = await params; const p = await load(category, product); if(!p) notFound();
  const ld = { "@context":"https://schema.org", "@type":"Product", name:p.name, description:p.shortDescription, category:p.category.name, brand:{"@type":"Brand",name:"Yellow Code Trims"}, image:p.images.map(i=>i.media.url) };
  return <main className="max-w-7xl mx-auto px-6 py-12">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(ld)}} />
    <nav aria-label="Breadcrumb" className="text-sm text-stone"><Link href="/products">Products</Link> / <Link href={`/products/${category}`}>{p.category.name}</Link> / {p.name}</nav>
    <div className="mt-8 grid md:grid-cols-2 gap-10">
      <Gallery layout="product" images={p.images.map(i=>({id:i.id,url:i.media.url,alt:i.media.alt,caption:i.media.caption}))}/>
      <div><h1 className="text-5xl font-semibold tracking-tight">{p.name}</h1>{p.tagline&&<p className="mt-3 text-lg">{p.tagline}</p>}<p className="mt-4 text-stone">{p.shortDescription}</p>
        <Link href={`/request-a-quote?product=${p.id}`} className="mt-8 inline-block rounded-full bg-yc px-7 py-3.5 font-semibold">Request a quote for this product</Link></div></div>
    {p.longDescription && <section className="mt-16 max-w-2xl"><h2 className="text-2xl font-bold">Overview</h2><div className="mt-3 text-stone"><RichText text={p.longDescription}/></div></section>}
    {p.specs.length>0 && <section className="mt-16"><h2 className="text-2xl font-bold">Specifications</h2><dl className="mt-4 border-t border-line">{p.specs.map(s=><div key={s.id} className="grid grid-cols-3 border-b border-line py-3"><dt className="text-stone">{s.label}</dt><dd className="col-span-2">{s.value}</dd></div>)}</dl></section>}
    {p.options.length>0 && <section className="mt-16"><h2 className="text-2xl font-bold">Customization</h2><ul className="mt-4 grid md:grid-cols-3 gap-4">{p.options.map(o=><li key={o.id}><b>{o.name}</b><br/><span className="text-stone">{o.values.join(", ")}</span></li>)}</ul></section>}
    {p.applications.length>0 && <section className="mt-16"><h2 className="text-2xl font-bold">Applications</h2><p className="mt-3 text-stone">{p.applications.map(a=>a.name).join(", ")}</p></section>}
    {p.faqs.length>0 && <section className="mt-16 max-w-2xl"><h2 className="text-2xl font-bold">FAQ</h2>{p.faqs.map(f=><details key={f.id} className="border-b border-line py-3"><summary className="cursor-pointer font-semibold">{f.question}</summary><p className="mt-2 text-stone">{f.answer}</p></details>)}</section>}
  </main>; }
