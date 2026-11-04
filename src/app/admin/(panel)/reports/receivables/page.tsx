import Link from "next/link"; import { db } from "@/lib/db"; import ReportFilter from "@/components/admin/ReportFilter"; import CsvButton from "@/components/admin/CsvButton";
import { range, dateFilter, rangeLabel, Stat, ReportShell } from "@/lib/reports"; import { paidOf, dueOf } from "@/lib/payments"; import { totals, fmt } from "@/lib/money"; import { ci, type SP } from "@/lib/list";
// Standard AR aging: invoices with a due date age from the due date (days past
// due); invoices without one age from the issue date. Not-yet-due money is kept
// out of the overdue buckets.
const BUCKETS = ["Not yet due", "0–30 days", "31–60 days", "61–90 days", "90+ days"] as const;
const bucketOf = (notYetDue: boolean, days: number) => notYetDue ? "Not yet due" : days <= 30 ? "0–30 days" : days <= 60 ? "31–60 days" : days <= 90 ? "61–90 days" : "90+ days";
const DAY = 86400000;
export default async function Receivables({ searchParams }: { searchParams: Promise<SP> }) { const sp = await searchParams; const r = range(sp);
  const customers = await db.customer.findMany({ select: { id: true, company: true }, orderBy: { company: "asc" }, take: 500 });
  const sel = customers.find(c => c.id === sp.customer); const today = new Date();
  const where = { type: "LOCAL" as const, status: { in: ["ISSUED", "SENT", "PARTIAL"] as never[] }, ...dateFilter("issueDate", r),
    ...(sel ? { customerName: sel.company } : {}), ...(sp.q ? { OR: [{ number: ci(sp.q) }, { customerName: ci(sp.q) }] } : {}) };
  const rows = (await db.invoice.findMany({ where, include: { lines: true, payments: true }, orderBy: { issueDate: "asc" }, take: 1000 }))
    .map(i => { const t = totals(i.lines, i.discountValue, i.taxPct, i.discountType); const due = dueOf(i);
      const ref = (i.dueDate ?? i.issueDate).getTime(); const notYetDue = i.dueDate ? i.dueDate.getTime() >= today.getTime() : false;
      const days = Math.max(0, Math.floor((today.getTime() - ref) / DAY));
      const overdue = !notYetDue && days > 0; return { i, total: t.total, paid: paidOf(i), due, days, overdue, notYetDue }; })
    .filter(x => x.due > 0.009);
  const outstanding = rows.reduce((a, x) => a + x.due, 0); const overdueAmt = rows.filter(x => x.overdue).reduce((a, x) => a + x.due, 0);
  const buckets = BUCKETS.map(b => ({ b, v: rows.filter(x => bucketOf(x.notYetDue, x.days) === b).reduce((a, x) => a + x.due, 0) }));
  const get = (b: string) => buckets.find(x => x.b === b)!.v;
  const cur = rows[0]?.i.currency ?? "BDT";
  const csv: (string | number)[][] = rows.map(({ i, total, paid, due, days, overdue, notYetDue }) => [i.number, i.issueDate.toISOString().slice(0, 10), i.customerName, i.currency, total.toFixed(2), paid.toFixed(2), due.toFixed(2), i.dueDate ? i.dueDate.toISOString().slice(0, 10) : "", notYetDue ? "not yet due" : `${days}d overdue`, overdue ? "yes" : "no"]);
  return <ReportShell title="Receivables (due)" desc={`Local invoices with money still owed, as of ${today.toLocaleDateString("en-GB")} · issued ${rangeLabel(r)}. Oldest first.`}><div className="mt-4"><ReportFilter q qPlaceholder="Invoice number or customer" dates fields={[
    { name: "customer", label: "Customer", options: customers.slice(0, 200).map(c => ({ value: c.id, label: c.company })) }]} /></div>
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"><Stat t="Total outstanding" v={fmt(outstanding, cur)} s={`${rows.length} invoice${rows.length === 1 ? "" : "s"}`} tone="#e8c468" /><Stat t="Overdue" v={fmt(overdueAmt, cur)} s="past the due date" tone="#e9a6a0" /><Stat t="Not yet due" v={fmt(get("Not yet due"), cur)} s="within the agreed terms" tone="#9bb7d4" /><Stat t="0–30 days late" v={fmt(get("0–30 days"), cur)} tone="#d8cfb8" /></div>
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{["31–60 days", "61–90 days", "90+ days"].map(b => <Stat key={b} t={b} v={fmt(get(b), cur)} tone="#d8cfb8" />)}<div className="hidden lg:block" /></div>
    <div className="mt-4 flex justify-end"><CsvButton name="receivables" headers={["Invoice", "Issued", "Customer", "Currency", "Total", "Paid", "Due", "Due date", "Age", "Overdue"]} rows={csv} /></div>
    <div className="adm-scroll mt-2"><table><thead><tr><th>Invoice</th><th>Customer</th><th>Issued</th><th>Due date</th><th>Total</th><th>Paid</th><th>Due</th><th>Age</th></tr></thead><tbody>{rows.map(({ i, total, paid, due, days, overdue, notYetDue }) => <tr key={i.id}>
      <td><Link className="underline" href={`/admin/invoices/${i.id}`}>{i.number}</Link></td><td>{i.customerName}</td><td>{i.issueDate.toLocaleDateString("en-GB")}</td><td>{i.dueDate?.toLocaleDateString("en-GB") ?? "—"}</td>
      <td>{fmt(total, i.currency)}</td><td>{fmt(paid, i.currency)}</td><td className={overdue ? "font-semibold text-red-700" : "font-semibold"}>{fmt(due, i.currency)}</td><td>{notYetDue ? `due in ${Math.max(0, Math.ceil(((i.dueDate as Date).getTime() - today.getTime()) / DAY))}d` : `${days}d overdue`}</td></tr>)}</tbody></table></div>
    {rows.length === 0 && <p className="mt-4 text-stone">Nothing outstanding — every local invoice is fully paid.</p>}</ReportShell>;
}
