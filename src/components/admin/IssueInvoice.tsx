import Link from "next/link"; import { db } from "@/lib/db"; import Badge from "@/components/admin/Badge";
export default async function IssueInvoice({ id }: { id: string }) {
  const o = await db.salesOrder.findUnique({ where: { id }, include: { invoices: { orderBy: { createdAt: "desc" } } } }); if (!o) return null;
  return <section className="mt-6 rounded-2xl border border-line bg-white p-6"><h2>Billing</h2>
    {o.invoices.length > 0 && <ul className="mt-3 space-y-1 text-sm">{o.invoices.map(i => <li key={i.id} className="flex items-center gap-2"><Link className="underline" href={`/admin/invoices/${i.id}`}>{i.number}</Link><Badge s={i.type} /><Badge s={i.status} /></li>)}</ul>}
    <p className="mt-3 text-sm text-stone">{o.billingStatus === "BILLED" ? "This order has been billed." : o.status === "CANCELLED" ? "Cancelled orders cannot be billed." : <>Not billed yet. Generate the bill from <Link className="underline" href="/admin/billing">Bill generation</Link>.</>}</p></section>;
}
