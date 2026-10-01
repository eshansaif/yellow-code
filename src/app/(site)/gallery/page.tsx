import Link from "next/link"; import { db } from "@/lib/db"; import Gallery from "@/components/Gallery";
export const revalidate = 300; export const metadata = { title: "Gallery", alternates: { canonical: "/gallery" } };
export default async function G({ searchParams }:{searchParams:Promise<{c?:string}>}) { const { c } = await searchParams;
  const cats = await db.category.findMany({ where:{status:"PUBLISHED"}, orderBy:{sortOrder:"asc"}, select:{slug:true,name:true} });
  const imgs = await db.productImage.findMany({ where:{ product:{ status:"PUBLISHED", ...(c?{category:{slug:c}}:{}) } }, include:{media:true}, orderBy:{sortOrder:"asc"}, take:60 });
  return <main className="max-w-7xl mx-auto px-6 py-16"><h1 className="text-5xl md:text-7xl font-semibold tracking-tight">Gallery</h1>
    <nav aria-label="Filter" className="mt-8 flex flex-wrap gap-2 text-sm">{[{slug:"",name:"All"},...cats].map(k=><Link key={k.slug} href={k.slug?`/gallery?c=${k.slug}`:"/gallery"} aria-current={(c??"")===k.slug} className={`border px-4 py-2 ${(c??"")===k.slug?"bg-ink text-paper border-ink":"border-line hover:border-ink"}`}>{k.name}</Link>)}</nav>
    <div className="mt-10">{imgs.length?<Gallery images={imgs.map(i=>({id:i.id,url:i.media.url,alt:i.media.alt,caption:i.media.caption}))}/>:<p className="text-stone">No images yet. Upload product images in the admin.</p>}</div></main>; }
