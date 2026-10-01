import RichText from "@/lib/richtext";
import Link from "next/link"; import { notFound } from "next/navigation"; import { db } from "@/lib/db"; export const revalidate = 300;
type P = { params: Promise<{ slug: string }> };
const load = (slug: string) => db.service.findFirst({ where: { slug, status: "PUBLISHED" } });
export async function generateMetadata({ params }: P) { const s = await load((await params).slug); return s ? { title: s.seoTitle ?? s.name, description: s.seoDescription ?? s.description ?? undefined, alternates: { canonical: `/services/${s.slug}` } } : {}; }
export default async function Page({ params }: P) { const s = await load((await params).slug); if (!s) notFound();
  return <main className="max-w-4xl mx-auto px-6 py-16"><nav aria-label="Breadcrumb" className="text-sm text-stone"><Link href="/services">Services</Link> / {s.name}</nav><h1 className="mt-4 text-5xl font-semibold tracking-tight">{s.name}</h1><p className="mt-6 text-xl text-stone">{s.description}</p><div className="mt-10"><RichText text={s.body ?? ""}/></div>
    <Link href="/request-a-quote" className="mt-12 inline-block rounded-full bg-yc px-8 py-4 font-semibold">Request a quote</Link></main>; }
