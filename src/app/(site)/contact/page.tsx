import ContactForm from "@/components/ContactForm"; import { db } from "@/lib/db";
export const metadata = { title: "Contact", alternates: { canonical: "/contact" } };
export default async function C() { const rows = await db.siteSetting.findUnique({ where: { key: "contact" } }); const info = (rows?.value ?? {}) as Record<string,string>;
  return <main className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-14"><div><h1 className="text-5xl md:text-7xl font-semibold tracking-tight">Contact</h1>
    <dl className="mt-10 space-y-4 text-sm">{[["Office",info.office],["Factory",info.factory],["Phone",info.phone],["Email",info.email],["Hours",info.hours]].filter(([,v])=>v).map(([k,v])=><div key={k}><dt className="text-stone">{k}</dt><dd className="whitespace-pre-line">{v}</dd></div>)}</dl>
    {!rows && <p className="mt-6 text-stone text-sm">Contact details are set in the admin site settings.</p>}</div><ContactForm/></main>; }
