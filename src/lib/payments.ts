import { db } from "@/lib/db";
import { totals } from "@/lib/money";
// Shared payment maths. "Paid" is the sum of recorded payments; "due" is the
// invoice total minus what has been paid. Everything is rounded to 2 decimals.
type InvLike = { lines: { qty: unknown; unitPrice: unknown }[]; discountValue: unknown; discountType: unknown; taxPct: unknown; status?: string; payments?: { amount: unknown }[] };
export const paidOf = (inv: InvLike) => Math.round((inv.payments ?? []).reduce((a, p) => a + Number(p.amount), 0) * 100) / 100;
export const dueOf = (inv: InvLike) => Math.max(0, Math.round((totals(inv.lines, inv.discountValue, inv.taxPct, inv.discountType).total - paidOf(inv)) * 100) / 100);
export const METHOD_LABEL: Record<string, string> = { CASH: "Cash", BANK_TRANSFER: "Bank transfer", CHEQUE: "Cheque", MOBILE_BANKING: "Mobile banking", CARD: "Card", OTHER: "Other" };
export const r2 = (x: number) => Math.round(x * 100) / 100;
// Recompute an invoice's status from its payments after any payment change.
//   all money collected -> PAID (paidAt = date of the last payment)
//   some money collected -> PARTIAL
//   no payments left -> ISSUED (it can be emailed again to become SENT)
// Void invoices are never touched.
export async function syncPaymentStatus(invoiceId: string) {
  const inv = await db.invoice.findUniqueOrThrow({ where: { id: invoiceId }, include: { lines: true, payments: { orderBy: { paidAt: "asc" } } } });
  if (inv.status === "VOID") return "VOID";
  const paid = paidOf(inv), due = dueOf(inv);
  const last = inv.payments.length ? inv.payments[inv.payments.length - 1].paidAt : null;
  const data = due <= 0.009 ? { status: "PAID" as const, paidAt: last ?? new Date() } : paid > 0 ? { status: "PARTIAL" as const, paidAt: last } : { status: "ISSUED" as const, paidAt: null };
  await db.invoice.update({ where: { id: invoiceId }, data });
  return data.status;
}
