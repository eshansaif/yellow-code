import Link from "next/link"; import { db } from "@/lib/db";
type Data = { title: string; intro?: string; sections?: { heading: string; body: string }[] };
export async function cmsMeta(key: string) { const r = await db.pageContent.findUnique({ where: { key } }); const d = r?.data as Data | undefined; return { title: d?.title ?? key, description: d?.intro?.slice(0, 160), alternates: { canonical: `/${key}` } }; }
export default async function CmsPage({ k }: { k: string }) {
  const r = await db.pageContent.findUnique({ where: { key: k } }); const d = (r?.data ?? { title: k }) as Data;
  const certs = k === "about" ? await db.certification.findMany({ where: { published: true } }) : [];
  return <main className="max-w-7xl mx-auto px-6 py-16"><h1 className="text-5xl md:text-7xl font-semibold tracking-tight max-w-4xl">{d.title}</h1>
    {d.intro && <p className="mt-8 max-w-2xl text-xl text-stone">{d.intro}</p>}
    <div className="mt-16 grid md:grid-cols-2 gap-x-14 gap-y-12">{d.sections?.map((s, i) => <section key={i} className="border-t-4 border-ink pt-4"><h2 className="text-2xl font-bold">{s.heading}</h2><p className="mt-3 text-stone whitespace-pre-line max-w-prose">{s.body}</p></section>)}</div>
    {certs.length>0&&<section className="mt-16"><h2 className="text-2xl font-bold">Certifications</h2><ul className="mt-4 flex flex-wrap gap-6">{certs.map(c=><li key={c.id} className="text-sm">{c.fileUrl&&<img src={c.fileUrl} alt={c.name} loading="lazy" className="h-24 w-auto"/>}<b>{c.name}</b><br/><span className="text-stone">{c.issuer}</span></li>)}</ul></section>}
    <div className="mt-20"><Link href="/request-a-quote" className="rounded-full bg-yc px-8 py-4 font-semibold inline-block">Request a quote</Link></div></main>;
}
