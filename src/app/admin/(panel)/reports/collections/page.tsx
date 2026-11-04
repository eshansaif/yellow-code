import Link from "next/link"; import { db } from "@/lib/db"; import ReportFilter from "@/components/admin/ReportFilter"; import CsvButton from "@/components/admin/CsvButton";
import { range, dateFilter, rangeLabel, Stat, ReportShell } from "@/lib/reports"; import { METHOD_LABEL } from "@/lib/payments"; import { fmt } from "@/lib/money"; import { ci, type SP } from "@/lib/list";
export default async function Collections({ searchParams }: { searchParams: Promise<SP> }) { const sp = await searchParams; const r = range(sp);
  const customers = await db.customer.findMany({ select: { id: true, company: true }, orderBy: { company: "asc" }, take: 500 });
  const sel = customers.find(c => c.id === sp.customer);
  const where = { ...dateFilter("paidAt", r), ...(sp.method ? { method: sp.method as never } : {}),
    ...(sel ? { invoice: { customerName: sel.company } } : {}),
    ...(sp.q ? { OR: [{ reference: ci(sp.q) }, { note: ci(sp.q) }, { invoice: { number: ci(sp.q) } }, { invoice: { customerName: ci(sp.q) } }] } : {}) };
  const rows = await db.payment.findMany({ where, include: { invoice: { select: { id: true, number: true, customerName: true, currency: true } } }, orderBy: { paidAt: "desc" }, take: 500 });
  const total = rows.reduce((a, p) => a + Number(p.amount), 0); const cur = rows[0]?.invoice.currency ?? "BDT";
  const byMethod = Object.keys(METHOD_LABEL).map(m => ({ m, v: rows.filter(p => p.method === m).reduce((a, p) => a + Number(p.amount), 0) })).filter(x => x.v > 0);
  const csv: (string | number)[][] = rows.map(p => [p.paidAt.toISOString().slice(0, 10), p.invoice.number, p.invoice.customerName, p.invoice.currency, METHOD_LABEL[p.method], p.reference ?? "", p.note ?? "", Number(p.amount).toFixed(2)]);
  return <ReportShell title="Payment collections" desc={`Payments recorded ${rangeLabel(r)}.`} ><div className="mt-4"><ReportFilter q qPlaceholder="Reference, invoice or customer" fields={[
    { name: "customer", label: "Customer", options: customers.slice(0, 200).map(c => ({ value: c.id, label: c.company })) },
    { name: "method", label: "Method", options: Object.entries(METHOD_LABEL).map(([v, l]) => ({ value: v, label: l })) }]} /></div>
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3"><Stat t="Collected" v={fmt(total, cur)} s={`${rows.length} payment${rows.length === 1 ? "" : "s"} — mixed currencies shown as recorded`} tone="#9bb7d4" />
      {byMethod.slice(0, 2).map(({ m, v }) => <Stat key={m} t={METHOD_LABEL[m]} v={fmt(v, cur)} tone="#d8cfb8" />)}</div>
    {byMethod.length > 2 && <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">{byMethod.slice(2).map(({ m, v }) => <Stat key={m} t={METHOD_LABEL[m]} v={fmt(v, cur)} tone="#d8cfb8" />)}<div /></div>}
    <div className="mt-4 flex justify-end"><CsvButton name="collections" headers={["Date", "Invoice", "Customer", "Currency", "Method", "Reference", "Note", "Amount"]} rows={csv} /></div>
    <div className="adm-scroll mt-2"><table><thead><tr><th>Date</th><th>Invoice</th><th>Customer</th><th>Method</th><th>Reference</th><th className="text-right">Amount</th></tr></thead><tbody>{rows.map(p => <tr key={p.id}>
      <td>{p.paidAt.toLocaleDateString("en-GB")}</td><td><Link className="underline" href={`/admin/invoices/${p.invoice.id}`}>{p.invoice.number}</Link></td><td>{p.invoice.customerName}</td>
      <td>{METHOD_LABEL[p.method]}</td><td>{p.reference ?? "—"}</td><td className="text-right font-semibold">{fmt(Number(p.amount), p.invoice.currency)}</td></tr>)}</tbody></table></div>
    {rows.length === 0 && <p className="mt-4 text-stone">No payments match these filters.</p>}</ReportShell>;
}
