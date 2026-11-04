import { totals, fmt } from "@/lib/money"; import { paidOf, dueOf, METHOD_LABEL } from "@/lib/payments";
import PaymentForm from "@/components/admin/PaymentForm"; import { ActionButton } from "@/components/admin/ToastForm";
import { recordPayment, deletePayment } from "@/app/admin/(panel)/payment-actions";
type Inv = { id: string; orderId: string; type: string; status: string; currency: string;
  lines: { qty: unknown; unitPrice: unknown }[]; discountValue: unknown; discountType: unknown; taxPct: unknown;
  payments: { id: string; amount: unknown; method: string; reference: string | null; note: string | null; paidAt: Date }[] };
// Payments section for one local invoice: totals, payment history and the
// record-payment form. Rendered on the invoice page and the sales-order page.
export default function PaymentsPanel({ inv, can }: { inv: Inv; can: boolean }) {
  if (inv.type !== "LOCAL" || inv.status === "VOID") return null;
  const total = totals(inv.lines, inv.discountValue, inv.taxPct, inv.discountType).total;
  const paid = paidOf(inv), due = dueOf(inv);
  return <section aria-label="Payments" className="mt-6 rounded-2xl border border-[#e7e0d2] bg-white p-4 shadow-[0_1px_2px_rgba(22,19,13,.04)] sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2>Payments</h2>
      <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm"><div className="flex gap-1.5"><dt className="text-[#6b6a66]">Total</dt><dd className="font-medium">{fmt(total, inv.currency)}</dd></div>
        <div className="flex gap-1.5"><dt className="text-[#6b6a66]">Paid</dt><dd className="font-medium">{fmt(paid, inv.currency)}</dd></div>
        <div className="flex gap-1.5"><dt className="text-[#6b6a66]">Due</dt><dd className={`font-semibold ${due > 0.009 ? "text-[#b45309]" : "text-emerald-700"}`}>{fmt(due, inv.currency)}</dd></div></dl></div>
    {inv.payments.length > 0 ? <div className="adm-scroll mt-3"><table><thead><tr><th>Date</th><th>Method</th><th>Reference</th><th>Note</th><th className="text-right">Amount</th>{can && <th><span className="sr-only">Actions</span></th>}</tr></thead><tbody>
      {[...inv.payments].sort((a, b) => a.paidAt.getTime() - b.paidAt.getTime()).map(p => <tr key={p.id}>
        <td>{p.paidAt.toLocaleDateString("en-GB")}</td><td>{METHOD_LABEL[p.method]}</td><td>{p.reference ?? "—"}</td><td className="max-w-[16rem] truncate" title={p.note ?? ""}>{p.note ?? "—"}</td>
        <td className="text-right font-semibold">{fmt(Number(p.amount), inv.currency)}</td>
        {can && <td className="text-right"><ActionButton action={deletePayment.bind(null, p.id)} confirm="Delete this payment? The invoice status will be recalculated." okMsg="Payment deleted." className="adm-plain text-sm text-red-700 underline">Delete</ActionButton></td>}</tr>)}</tbody></table></div>
      : <p className="mt-3 text-sm text-[#6b6a66]">No payments recorded yet.</p>}
    {can && inv.status !== "PAID" && <PaymentForm key={`${due}`} invoiceId={inv.id} due={due} currency={inv.currency} action={recordPayment.bind(null, inv.id)} />}
    {can && inv.status === "PAID" && <p className="mt-3 text-xs text-[#8a857a]">Fully paid. If an entry is wrong, delete the payment above — the invoice status is recalculated automatically.</p>}
    {!can && <p className="mt-3 text-xs text-[#8a857a]">Only Admin and Accounts users can record or delete payments.</p>}
  </section>;
}
