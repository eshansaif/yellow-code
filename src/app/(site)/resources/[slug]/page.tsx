import RichText from "@/lib/richtext";
import Link from "next/link"; import { notFound } from "next/navigation"; import { db } from "@/lib/db"; export const revalidate = 300;
type P = { params: Promise<{ slug: string }> };
const load = (slug: string) => db.article.findFirst({ where: { slug, status: "PUBLISHED" } });
export async function generateMetadata({ params }: P) { const a = await load((await params).slug); return a ? { title: a.seoTitle ?? a.title, description: a.seoDescription ?? a.excerpt ?? undefined, alternates: { canonical: `/resources/${a.slug}` } } : {}; }
export default async function Page({ params }: P) { const a = await load((await params).slug); if (!a) notFound();
  const ld = { "@context": "https://schema.org", "@type": "Article", headline: a.title, datePublished: a.publishedAt, author: a.author ? { "@type": "Person", name: a.author } : undefined };
  return <main className="max-w-3xl mx-auto px-6 py-16"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}/><nav aria-label="Breadcrumb" className="text-sm text-stone"><Link href="/resources">Resources</Link> / {a.title}</nav>
    <h1 className="mt-4 text-5xl font-semibold tracking-tight">{a.title}</h1><p className="mt-3 text-sm text-stone">{a.author} {a.publishedAt?.toLocaleDateString()}</p><div className="mt-10"><RichText text={a.content}/></div></main>; }
