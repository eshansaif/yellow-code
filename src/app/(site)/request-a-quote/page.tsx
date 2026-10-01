import { db } from "@/lib/db"; import QuoteForm from "@/components/QuoteForm";
export const metadata = { title: "Request a quote", alternates: { canonical: "/request-a-quote" } };
export default async function Page({ searchParams }: { searchParams: Promise<{ product?: string }> }) { const { product } = await searchParams;
  const p = product ? await db.product.findUnique({ where: { id: product }, select: { id: true, name: true } }) : null;
  return <main className="max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-[1fr_1.6fr] gap-12 items-start">
    <div className="lg:sticky lg:top-28"><h1 className="text-4xl md:text-5xl font-semibold">Request a quote</h1><p className="mt-5 text-stone">Tell us what you need. No product selected? No problem, describe your project and we'll help you choose.</p>
      <ul className="mt-8 space-y-4 text-sm">{["Share your contact details and project basics","Add specifications and artwork","Review and send"].map((t, i) => <li key={t} className="flex gap-3"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-yc text-xs font-semibold">{i + 1}</span>{t}</li>)}</ul></div>
    <QuoteForm product={p} /></main>; }
