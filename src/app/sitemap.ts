import type { MetadataRoute } from "next"; import { db } from "@/lib/db";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> { const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.yellowcodebd.com";
  const ps = await db.product.findMany({ where:{status:"PUBLISHED"}, include:{category:true} }); const cs = await db.category.findMany({ where:{status:"PUBLISHED"} });
  const sv = await db.service.findMany({ where:{status:"PUBLISHED"} }); const ar = await db.article.findMany({ where:{status:"PUBLISHED"} });
  return [...["/services","/resources","/about","/capabilities","/sustainability","/contact","/gallery"].map(u=>({url:base+u})), ...sv.map(x=>({url:`${base}/services/${x.slug}`})), ...ar.map(x=>({url:`${base}/resources/${x.slug}`})), ...["","/products","/request-a-quote"].map(u=>({url:base+u})), ...cs.map(c=>({url:`${base}/products/${c.slug}`})), ...ps.map(p=>({url:`${base}/products/${p.category.slug}/${p.slug}`,lastModified:p.updatedAt}))]; }
