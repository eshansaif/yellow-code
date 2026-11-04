import { db } from "@/lib/db"; import ReportFilter from "@/components/admin/ReportFilter"; import CsvButton from "@/components/admin/CsvButton";
import { range, dateFilter, rangeLabel, Stat, ReportShell } from "@/lib/reports"; import { fmt } from "@/lib/money"; import { ci, type SP } from "@/lib/list";
export default async function SalesByItem({ searchParams }: { searchParams: Promise<SP> }) { const sp = await searchParams; const r = range(sp);
  const lines = await db.invoiceLine.findMany({ where: { invoice: { status: { not: "VOID" }, ...dateFilter("issueDate", r) } }, select: { description: true, qty: true, unitPrice: true, invoiceId: true, invoice: { select: { currency: true } } }, take: 5000 });
  type Agg = { qty: number; amount: number; invoices: Set<string>; currency: string };
  const map = new Map<string, Agg>();
  for (const l of lines) { const key = l.description.trim(); const a = map.get(key) ?? { qty: 0, amount: 0, invoices: new Set<string>(), currency: l.invoice.currency };
    a.qty += Number(l.qty); a.amount += Number(l.qty) * Number(l.unitPrice); a.invoices.add(l.invoiceId); map.set(key, a); }
  const q = (sp.q ?? "").toLowerCase();
  const rows = [...map.entries()].map(([item, a]) => ({ item, ...a, n: a.invoices.size })).filter(x => !q || x.item.toLowerCase().includes(q)).sort((a, b) => b.amount - a.amount).slice(0, 200);
  const grand = rows.reduce((a, x) => a + x.amount, 0); const cur = rows[0]?.currency ?? "BDT";
  const csv: (string | number)[][] = rows.map(x => [x.item, x.qty.toFixed(2), x.n, x.amount.toFixed(2), grand > 0 ? `${((x.amount / grand) * 100).toFixed(1)}%` : "0%"]);
  return <ReportShell title="Sales by item" desc={`Invoice line items grouped by description ${rangeLabel(r)}. Void invoices are excluded.`}><div className="mt-4"><ReportFilter dates q qPlaceholder="Item description" /></div>
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3"><Stat t="Distinct items" v={rows.length} s="top items shown" tone="#d8cfb8" /><Stat t="Revenue" v={fmt(grand, cur)} s="sum across currencies as recorded" tone="#7fb7a4" /><Stat t="Lines analysed" v={lines.length} s="invoice line rows in range" tone="#9bb7d4" /></div>
    <div className="mt-4 flex justify-end"><CsvButton name="sales-by-item" headers={["Item", "Total qty", "Invoices", "Amount", "Share of revenue"]} rows={csv} /></div>
    <div className="adm-scroll mt-2"><table><thead><tr><th>Item</th><th>Total qty</th><th>Invoices</th><th className="text-right">Amount</th><th>Share</th></tr></thead><tbody>{rows.map(x => <tr key={x.item}>
      <td className="max-w-[24rem] truncate" title={x.item}>{x.item}</td><td>{x.qty.toLocaleString("en-US", { maximumFractionDigits: 2 })}</td><td>{x.n}</td><td className="text-right font-semibold">{fmt(x.amount, x.currency)}</td>
      <td><div className="flex items-center gap-2"><span className="h-1.5 w-16 rounded-full bg-[#efe9dc]"><span className="block h-1.5 rounded-full bg-[#f2c10e]" style={{ width: `${grand > 0 ? Math.min(100, (x.amount / grand) * 100) : 0}%` }} /></span>{grand > 0 ? `${((x.amount / grand) * 100).toFixed(1)}%` : "0%"}</div></td></tr>)}</tbody></table></div>
    {rows.length === 0 && <p className="mt-4 text-stone">No invoice lines in this period.</p>}</ReportShell>;
}
