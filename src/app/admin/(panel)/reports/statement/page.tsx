import Link from "next/link"; import { db } from "@/lib/db"; import ReportFilter from "@/components/admin/ReportFilter"; import CsvButton from "@/components/admin/CsvButton";
import { range, rangeLabel, Stat, ReportShell } from "@/lib/reports"; import { paidOf, dueOf, METHOD_LABEL } from "@/lib/payments"; import { totals, fmt } from "@/lib/money"; import type { SP } from "@/lib/list";
export default async function Statement({ searchParams }: { searchParams: Promise<SP> }) { const sp = await searchParams; const r = range(sp);
  const customers = await db.customer.findMany({ select: { id: true, company: true }, orderBy: { company: "asc" }, take: 500 });
  const sel = customers.find(c => c.id === sp.customer);
  const head = <><h1>Customer statement</h1><p className="text-sm text-[#6b6a66]">A running ledger for one customer: every invoice (debit) and payment (credit) with the balance after each entry.</p>
    <div className="mt-4"><ReportFilter dates={false} fields={[{ name: "customer", label: "Customer", options: customers.slice(0, 200).map(c => ({ value: c.id, label: c.company })) }]} />{r.from || r.to ? <p className="mt-2 text-xs text-[#8a857a]">Period: {rangeLabel(r)} — the opening balance includes everything before this period.</p> : null}</div></>;
  if (!sel) return <>{head}<p className="mt-6 text-stone">Choose a customer above to build its statement.</p></>;
  const orders = await db.salesOrder.findMany({ where: { customerId: sel.id }, select: { invoices: { where: { status: { not: "VOID" } }, include: { lines: true, payments: true } } } });
  type Ev = { date: Date; ref: string; href?: string; desc: string; debit: number; credit: number; currency: string };
  const evs: Ev[] = [];
  for (const o of orders) for (const i of o.invoices) {
    evs.push({ date: i.issueDate, ref: i.number, href: `/admin/invoices/${i.id}`, desc: `Invoice ${i.number}`, debit: totals(i.lines, i.discountValue, i.taxPct, i.discountType).total, credit: 0, currency: i.currency });
    for (const p of i.payments) evs.push({ date: p.paidAt, ref: i.number, href: `/admin/invoices/${i.id}`, desc: `Payment · ${METHOD_LABEL[p.method]}${p.reference ? ` · ${p.reference}` : ""}`, debit: 0, credit: Number(p.amount), currency: i.currency });
  }
  const cur = evs[0]?.currency ?? "BDT";
  const before = evs.filter(e => r.from && e.date < r.from); const inR = evs.filter(e => (!r.from || e.date >= r.from) && (!r.to || e.date <= r.to));
  const opening = before.reduce((a, e) => a + e.debit - e.credit, 0);
  inR.sort((a, b) => a.date.getTime() - b.date.getTime() || a.ref.localeCompare(b.ref));
  let bal = opening; const rows = inR.map(e => { bal += e.debit - e.credit; return { ...e, bal }; });
  const invoiced = inR.reduce((a, e) => a + e.debit, 0), paid = inR.reduce((a, e) => a + e.credit, 0);
  const csv: (string | number)[][] = [ ...(r.from ? [["", "", "Opening balance", "", "", opening.toFixed(2)] as (string | number)[]] : []),
    ...rows.map(e => [e.date.toISOString().slice(0, 10), e.ref, e.desc, e.debit ? e.debit.toFixed(2) : "", e.credit ? e.credit.toFixed(2) : "", e.bal.toFixed(2)]) ];
  return <>{head}
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3"><Stat t="Invoiced (period)" v={fmt(invoiced, cur)} tone="#7fb7a4" /><Stat t="Paid (period)" v={fmt(paid, cur)} tone="#9bb7d4" /><Stat t="Balance" v={fmt(bal, cur)} s={bal > 0.009 ? "still owed by the customer" : "settled"} tone={bal > 0.009 ? "#e8c468" : "#7fb7a4"} /></div>
    <div className="mt-4 flex justify-end"><CsvButton name={`statement-${sel.company.replace(/\W+/g, "-").toLowerCase()}`} headers={["Date", "Reference", "Description", "Debit", "Credit", "Balance"]} rows={csv} /></div>
    <div className="adm-scroll mt-2"><table><thead><tr><th>Date</th><th>Reference</th><th>Description</th><th className="text-right">Debit</th><th className="text-right">Credit</th><th className="text-right">Balance</th></tr></thead><tbody>
      {(r.from || opening !== 0) && <tr><td>{r.from ? r.from.toLocaleDateString("en-GB") : "—"}</td><td>—</td><td>Opening balance</td><td /><td /><td className="text-right font-semibold">{fmt(opening, cur)}</td></tr>}
      {rows.map((e, n) => <tr key={`${e.ref}-${n}`}><td>{e.date.toLocaleDateString("en-GB")}</td><td>{e.href ? <Link className="underline" href={e.href}>{e.ref}</Link> : e.ref}</td><td>{e.desc}</td><td className="text-right">{e.debit ? fmt(e.debit, e.currency) : ""}</td><td className="text-right">{e.credit ? fmt(e.credit, e.currency) : ""}</td><td className="text-right font-semibold">{fmt(e.bal, e.currency)}</td></tr>)}</tbody></table></div>
    {rows.length === 0 && <p className="mt-4 text-stone">No invoices or payments for this customer in the selected period.</p>}</>;
}
