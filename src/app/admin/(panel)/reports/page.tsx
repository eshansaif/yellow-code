import Link from "next/link";
const REPORTS: [string, string, string, string][] = [
  ["/admin/reports/sales", "Sales report", "Invoices issued in a period — totals, collected and outstanding, per invoice.", "#7fb7a4"],
  ["/admin/reports/receivables", "Receivables (due)", "Unpaid local invoices with age and overdue buckets, so you know who owes what.", "#e8c468"],
  ["/admin/reports/collections", "Payment collections", "Every payment received, filterable by date, method and customer.", "#9bb7d4"],
  ["/admin/reports/products", "Sales by item", "Which items sell, in what quantity, and their share of revenue.", "#d8cfb8"],
  ["/admin/reports/statement", "Customer statement", "Per-customer ledger: invoices, payments and running balance.", "#e9a6a0"],
  ["/admin/reports/pipeline", "Business pipeline", "Quotations and sales orders by status, and the quotation conversion rate.", "#b9a7d8"],
];
export default function Reports() {
  return <><h1>Reports</h1><p className="text-sm text-[#6b6a66]">Standard business reports with filters and CSV export. Numbers come live from invoices, orders and payments.</p>
    <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">{REPORTS.map(([h, l, d, col]) => <li key={h}><Link href={h} className="group block h-full rounded-2xl border border-[#e7e0d2] bg-white p-5 shadow-[0_1px_2px_rgba(22,19,13,.04)] transition hover:-translate-y-0.5 hover:border-[#cfc7b4] hover:shadow-md">
      <div className="flex items-start justify-between gap-2"><p className="flex items-center gap-2 text-sm font-medium text-[#16130d]"><span className="size-2 rounded-full" style={{ background: col }} />{l}</p><span aria-hidden className="text-[#b9b2a0] transition group-hover:translate-x-0.5 group-hover:text-[#16130d]">→</span></div>
      <p className="mt-2 text-sm text-[#6b6a66]">{d}</p></Link></li>)}</ul></>;
}
