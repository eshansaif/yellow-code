<<<<<<< HEAD
import type { Invoice, InvoiceLine, Payment } from "@prisma/client"; import { totals, fmt, discountLabel } from "@/lib/money"; import { paidOf, dueOf, METHOD_LABEL } from "@/lib/payments"; import type { Company } from "@/lib/invoice";
export default function InvoiceDocument({ inv, orderRef }: { inv: Invoice & { lines: InvoiceLine[]; payments?: Payment[] }; orderRef: string }) {
  const co = inv.company as unknown as Company; const t = totals(inv.lines, inv.discountValue, inv.taxPct, inv.discountType); const pro = inv.type === "PROFORMA"; const d = (x?: Date | null) => (x ? x.toLocaleDateString("en-GB") : "");
  // Payment-aware totals. Only LOCAL invoices track payments; a proforma is a
  // pre-payment document and void invoices are cancelled, so they keep the
  // original "total due". Paid = sum of recorded payments, due = total - paid.
  const trackPay = !pro && inv.status !== "VOID";
  const pays = trackPay ? (inv.payments ?? []) : [];
  const paid = trackPay ? paidOf(inv) : 0; const due = trackPay ? dueOf(inv) : t.total;
  const overdue = trackPay && inv.status !== "PAID" && inv.status !== "PARTIAL" && !!inv.dueDate && inv.dueDate.getTime() < Date.now();
  const badge = inv.status === "PAID" ? { text: "Paid", cls: "border-emerald-300 bg-emerald-50 text-emerald-800" } : inv.status === "PARTIAL" ? { text: "Partially paid", cls: "border-amber-300 bg-amber-50 text-amber-800" } : overdue ? { text: "Overdue", cls: "border-red-300 bg-red-50 text-red-800" } : { text: "Unpaid", cls: "border-[#e0dacc] bg-[#f7f4ec] text-[#55524a]" };
=======
import type { Invoice, InvoiceLine } from "@prisma/client"; import { totals, fmt, discountLabel } from "@/lib/money"; import type { Company } from "@/lib/invoice";
export default function InvoiceDocument({ inv, orderRef }: { inv: Invoice & { lines: InvoiceLine[] }; orderRef: string }) {
  const co = inv.company as unknown as Company; const t = totals(inv.lines, inv.discountValue, inv.taxPct, inv.discountType); const pro = inv.type === "PROFORMA"; const d = (x?: Date | null) => (x ? x.toLocaleDateString("en-GB") : "");
>>>>>>> d9fed78e03f868a9b4e58ed4836b94388798d1cc
  const meta: [string, string | null | undefined][] = [["Invoice no.", inv.number], ["Date", d(inv.issueDate)], ["Due date", d(inv.dueDate)], ["Sales order", orderRef], ["Customer PO", inv.customerPo], ["Payment terms", inv.paymentTerms], ["Currency", inv.currency],
    ...(pro ? ([["L/C no.", inv.lcNumber], ["Port of loading", inv.portOfLoading], ["Port of discharge", inv.portOfDischarge], ["Incoterm", inv.incoterm]] as [string, string | null][]) : [])];
  return <article className="relative mx-auto w-full max-w-[210mm] bg-white p-5 text-[13px] sm:p-10 leading-relaxed text-[#16130d] print:p-0">
    {inv.status === "VOID" && <p aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center text-[8rem] font-bold text-red-600/15 -rotate-12">VOID</p>}
    <header className="flex flex-wrap items-start justify-between gap-6 border-b-2 border-[#16130d] pb-5"><div><img src="/logo.png" alt="" className="h-12 w-auto" /><p className="mt-3 text-base font-semibold">{co.legalName}</p><p className="whitespace-pre-line text-[#555]">{co.address}</p><p className="text-[#555]">{[co.phone, co.email].filter(Boolean).join(" · ")}</p>{co.taxId && <p className="text-[#555]">BIN/VAT: {co.taxId}</p>}</div>
<<<<<<< HEAD
      <div className="text-right"><h1 className="text-2xl font-bold tracking-wide">{pro ? "PROFORMA INVOICE" : "INVOICE"}</h1>{pro && <p className="mt-1 text-[11px] text-[#777]">This document is not a tax invoice.</p>}{trackPay && <p className="mt-2 print:mt-1"><span className={`inline-block rounded-full border px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider ${badge.cls}`}>{badge.text}</span></p>}</div></header>
=======
      <div className="text-right"><h1 className="text-2xl font-bold tracking-wide">{pro ? "PROFORMA INVOICE" : "INVOICE"}</h1>{pro && <p className="mt-1 text-[11px] text-[#777]">This document is not a tax invoice.</p>}</div></header>
>>>>>>> d9fed78e03f868a9b4e58ed4836b94388798d1cc
    <section className="mt-6 grid gap-8 sm:grid-cols-2 print:grid-cols-2"><div><p className="text-[11px] font-semibold uppercase tracking-wider text-[#777]">Bill to</p><p className="mt-1 font-semibold">{inv.customerName}</p><p>{inv.contactName}</p><p className="whitespace-pre-line">{inv.customerAddress}</p><p>{inv.customerCountry}</p>{inv.customerTaxId && <p>BIN/VAT: {inv.customerTaxId}</p>}</div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 text-right">{meta.filter(([, v]) => v).map(([k, v]) => <div key={k} className="contents"><dt className="text-[#777]">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl></section>
    <div className="mt-8 overflow-x-auto"><table className="w-full min-w-[34rem] border-collapse"><thead><tr className="border-y border-[#16130d] text-left text-[11px] uppercase tracking-wider"><th className="py-2">#</th><th>Description</th><th className="text-right">Qty</th><th className="text-right">Unit price</th><th className="text-right">Amount</th></tr></thead>
      <tbody>{inv.lines.map((l, i) => <tr key={l.id} className="border-b border-[#e5e5e5]"><td className="py-2 pr-2 align-top">{i + 1}</td><td className="align-top">{l.description}</td><td className="text-right align-top">{Number(l.qty)} {l.unit}</td><td className="text-right align-top">{fmt(Number(l.unitPrice), inv.currency)}</td><td className="text-right align-top">{fmt(Number(l.qty) * Number(l.unitPrice), inv.currency)}</td></tr>)}</tbody></table></div>
<<<<<<< HEAD
    <dl className="ml-auto mt-4 grid max-w-xs grid-cols-2 gap-1"><dt className="text-[#777]">Subtotal</dt><dd className="text-right">{fmt(t.subtotal, inv.currency)}</dd><dt className="text-[#777]">{discountLabel(inv.discountType, inv.discountValue)}</dt><dd className="text-right">-{fmt(t.discount, inv.currency)}</dd><dt className="text-[#777]">Tax ({Number(inv.taxPct)}%)</dt><dd className="text-right">{fmt(t.tax, inv.currency)}</dd><dt className="text-[#777]">Total</dt><dd className="text-right font-medium">{fmt(t.total, inv.currency)}</dd>
      {trackPay && <><dt className="text-[#777]">Paid</dt><dd className={`text-right ${paid > 0.009 ? "text-emerald-700" : ""}`}>{fmt(paid, inv.currency)}</dd></>}
      <dt className="border-t border-[#16130d] pt-1 font-bold">{trackPay ? "Amount due" : "Total due"}</dt><dd className={`border-t border-[#16130d] pt-1 text-right font-bold ${trackPay && due <= 0.009 ? "text-emerald-700" : ""}`}>{fmt(due, inv.currency)}</dd></dl>
    {trackPay && pays.length > 0 && <section className="mt-6"><p className="text-[11px] font-semibold uppercase tracking-wider text-[#777]">Payments received</p>
      <div className="mt-2 overflow-x-auto"><table className="w-full min-w-[26rem] border-collapse text-[12px]"><thead><tr className="border-y border-[#16130d] text-left text-[10px] uppercase tracking-wider"><th className="py-1.5 pr-3">Date</th><th className="pr-3">Method</th><th className="pr-3">Reference</th><th className="pr-3">Note</th><th className="text-right">Amount</th></tr></thead><tbody>
        {[...pays].sort((a, b) => a.paidAt.getTime() - b.paidAt.getTime()).map(p => <tr key={p.id} className="border-b border-[#e5e5e5]"><td className="whitespace-nowrap py-1.5 pr-3">{p.paidAt.toLocaleDateString("en-GB")}</td><td className="pr-3">{METHOD_LABEL[p.method] ?? p.method}</td><td className="pr-3">{p.reference ?? "\u2014"}</td><td className="pr-3">{p.note ?? "\u2014"}</td><td className="whitespace-nowrap text-right font-semibold">{fmt(Number(p.amount), inv.currency)}</td></tr>)}</tbody></table></div>
      {due > 0.009 && <p className="mt-2 text-[12px] text-[#555]">Outstanding balance: <b>{fmt(due, inv.currency)}</b></p>}
      {due <= 0.009 && <p className="mt-2 text-[12px] text-emerald-700">This invoice is fully paid. Thank you!</p>}</section>}
=======
    <dl className="ml-auto mt-4 grid max-w-xs grid-cols-2 gap-1"><dt className="text-[#777]">Subtotal</dt><dd className="text-right">{fmt(t.subtotal, inv.currency)}</dd><dt className="text-[#777]">{discountLabel(inv.discountType, inv.discountValue)}</dt><dd className="text-right">-{fmt(t.discount, inv.currency)}</dd><dt className="text-[#777]">Tax ({Number(inv.taxPct)}%)</dt><dd className="text-right">{fmt(t.tax, inv.currency)}</dd><dt className="border-t border-[#16130d] pt-1 font-bold">Total due</dt><dd className="border-t border-[#16130d] pt-1 text-right font-bold">{fmt(t.total, inv.currency)}</dd></dl>
>>>>>>> d9fed78e03f868a9b4e58ed4836b94388798d1cc
    {(co.bankName || co.bankAccount) && <section className="mt-8 rounded border border-[#e5e5e5] p-4"><p className="text-[11px] font-semibold uppercase tracking-wider text-[#777]">Payment details</p><p className="mt-1">{co.bankName}{co.bankAccount && <> · A/C {co.bankAccount}</>}{pro && co.swift && <> · SWIFT {co.swift}</>}</p></section>}
    {inv.notes && <p className="mt-6 whitespace-pre-line text-[#555]">{inv.notes}</p>}{co.footer && <p className="mt-10 border-t border-[#e5e5e5] pt-3 text-center text-[11px] text-[#777]">{co.footer}</p>}</article>;
}
