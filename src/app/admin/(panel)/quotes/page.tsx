import Badge from "@/components/admin/Badge";
import SubmitButton from "@/components/admin/SubmitButton";
import Link from "next/link"; import { db, quoteRef } from "@/lib/db";
export default async function Quotes({ searchParams }:{searchParams:Promise<{status?:string;q?:string}>}) { const { status, q } = await searchParams;
  const rows = await db.quoteRequest.findMany({ where: { ...(status ? { status: status as never } : {}), ...(q ? { OR: [{ company: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] } : {}) }, orderBy: { createdAt: "desc" }, take: 100, include: { items: true } });
  return <><div className="flex items-center justify-between"><h1 className="text-3xl font-bold">Quote requests</h1><a href="/api/admin/quotes-csv" className="rounded-full border border-ink px-4 py-2 text-sm">Export CSV</a></div>
    <form className="mt-4 flex gap-2"><input name="q" defaultValue={q} placeholder="Search name, company, email" className="rounded-lg border border-line bg-white px-3 py-2 outline-none focus:border-ink"/><SubmitButton className="rounded-full bg-ink text-paper px-4">Search</SubmitButton></form>
    <table className="mt-6 w-full text-sm"><thead className="text-left text-stone"><tr><th>Reference</th><th>Company</th><th>Product</th><th>Status</th><th>Received</th></tr></thead><tbody>
      {rows.map(r=><tr key={r.id} className="border-t border-line"><td className="py-2"><Link className="underline" href={`/admin/quotes/${r.id}`}>{quoteRef(r.seq,r.createdAt)}</Link></td><td>{r.company}</td><td>{r.items[0]?.productName ?? "General"}</td><td><Badge s={r.status}/></td><td>{r.createdAt.toLocaleDateString()}</td></tr>)}</tbody></table>
    {rows.length===0&&<p className="mt-6 text-stone">No quote requests match.</p>}</>; }
