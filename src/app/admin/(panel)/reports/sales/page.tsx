import Link from "next/link"; import { db } from "@/lib/db"; import ReportFilter from "@/components/admin/ReportFilter"; import CsvButton from "@/components/admin/CsvButton"; import Badge from "@/components/admin/Badge";
import { range, dateFilter, rangeLabel, Stat, ReportShell } from "@/lib/reports"; import { paidOf, dueOf, r2 } from "@/lib/payments"; import { totals, fmt } from "@/lib/money"; import { ci, type SP } from "@/lib/list";
export default async function SalesReport({ searchParams }: { searchParams: Promise<SP> }) { const sp = await searchParams; const r = range(sp);
  const customers = await db.customer.findMany({ select: { id: true, company: true }, orderBy: { company: "asc" }, take: 500 });
  const sel = customers.find(c => c.id === sp.customer);
  const where = { status: { not: "VOID" as const }, ...dateFilter("issueDate", r),
    ...(sp.type ? { type: sp.type as never } : {}), ...(sp.status ? { status: sp.status as never } : {}),
    ...(sel ? { customerName: sel.company } : {}), ...(sp.q ? { OR: [{ number: ci(sp.q) }, { customerName: ci(sp.q) }] } : {}) };
  const rows = (await db.invoice.findMany({ where, include: { lines: true, payments: true }, orderBy: { issueDate: "desc" }, take: 500 })).map(i => {
    const t = totals(i.lines, i.discountValue, i.taxPct, i.discountType); const paid = paidOf(i), due = dueOf(i); return { i, t, paid, due }; });
  const invoiced = r2(rows.reduce((a, x) => a + x.t.total, 0)), collected = r2(rows.reduce((a, x) => a + x.paid, 0)), outstanding = r2(rows.reduce((a, x) => a + x.due, 0));
  const csv: (string | number)[][] = rows.map(({ i, t, paid, due }) => [i.number, i.issueDate.toISOString().slice(0, 10), i.customerName, i.type, i.currency, t.subtotal.toFixed(2), t.discount.toFixed(2), t.tax.toFixed(2), t.total.toFixed(2), paid.toFixed(2), due.toFixed(2), i.status]);
  return <ReportShell title="Sales report" desc={`Invoices issued ${rangeLabel(r)}. Void invoices are excluded.`}><div className="mt-4"><ReportFilter q qPlaceholder="Invoice number or customer" fields={[
    { name: "customer", label: "Customer", options: customers.slice(0, 200).map(c => ({ value: c.id, label: c.company })) },
    { name: "type", label: "Type", options: [{ value: "LOCAL", label: "Local" }, { value: "PROFORMA", label: "Proforma" }] },
    { name: "status", label: "Status", options: [{ value: "ISSUED", label: "Issued" }, { value: "SENT", label: "Sent" }, { value: "PARTIAL", label: "Partial" }, { value: "PAID", label: "Paid" }] }]} /></div>
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3"><Stat t="Invoiced" v={invoiced.toLocaleString("en-US", { minimumFractionDigits: 2 })} s={`${rows.length} invoice${rows.length === 1 ? "" : "s"} — each amount in its own currency`} tone="#7fb7a4" /><Stat t="Collected" v={collected.toLocaleString("en-US", { minimumFractionDigits: 2 })} s="payments recorded on these invoices" tone="#9bb7d4" /><Stat t="Outstanding" v={outstanding.toLocaleString("en-US", { minimumFractionDigits: 2 })} s="still to be collected" tone="#e8c468" /></div>
    <div className="mt-4 flex justify-end"><CsvButton name="sales-report" headers={["Invoice", "Issued", "Customer", "Type", "Currency", "Subtotal", "Discount", "Tax", "Total", "Paid", "Due", "Status"]} rows={csv} /></div>
    <div className="adm-scroll mt-2"><table><thead><tr><th>Invoice</th><th>Issued</th><th>Customer</th><th>Type</th><th>Total</th><th>Paid</th><th>Due</th><th>Status</th></tr></thead><tbody>{rows.map(({ i, t, paid, due }) => <tr key={i.id}>
      <td><Link className="underline" href={`/admin/invoices/${i.id}`}>{i.number}</Link></td><td>{i.issueDate.toLocaleDateString("en-GB")}</td><td>{i.customerName}</td><td><Badge s={i.type} /></td>
      <td>{fmt(t.total, i.currency)}</td><td>{fmt(paid, i.currency)}</td><td>{due > 0 ? fmt(due, i.currency) : "—"}</td><td><Badge s={i.status} /></td></tr>)}</tbody></table></div>
    {rows.length === 0 && <p className="mt-4 text-stone">No invoices match these filters.</p>}</ReportShell>;
}
