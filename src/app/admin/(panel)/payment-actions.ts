"use server";
import { revalidatePath } from "next/cache"; import { z } from "zod"; import { db } from "@/lib/db"; import { requireAdmin } from "@/auth";
import { totals } from "@/lib/money"; import { syncPaymentStatus } from "@/lib/payments"; import { fail, type FormState } from "@/lib/friendly";
const BILLERS = ["ADMIN", "ACCOUNTS"];
const METHODS = ["CASH", "BANK_TRANSFER", "CHEQUE", "MOBILE_BANKING", "CARD", "OTHER"] as const;
const PaymentSchema = z.object({
  amount: z.coerce.number().positive("enter a payment amount above 0").max(1e9, "the amount is too large"),
  method: z.enum(METHODS).default("BANK_TRANSFER"),
  reference: z.string().trim().max(120).optional(),
  paidAt: z.string().optional(),
  note: z.string().trim().max(500).optional(),
});
function revalidate(invoiceId: string, orderId: string) { revalidatePath(`/admin/invoices/${invoiceId}`); revalidatePath("/admin/invoices"); revalidatePath(`/admin/sales-orders/${orderId}`); revalidatePath("/admin/sales-orders"); revalidatePath("/admin"); }
// Record a payment against a local invoice. Amount cannot exceed the remaining
// due; the invoice status is recomputed from its payments (ISSUED/PARTIAL/PAID).
export async function recordPayment(invoiceId: string, fd: FormData): Promise<FormState> {
  try { const s = await requireAdmin(BILLERS); const uid = (s.user as { id: string }).id;
    const inv = await db.invoice.findUniqueOrThrow({ where: { id: invoiceId }, include: { lines: true, payments: true } });
    if (inv.type === "PROFORMA") return { error: "A proforma invoice is not a payment document. Record payments against a local invoice." };
    if (inv.status === "VOID") return { error: "This invoice is void, so payments can no longer be recorded." };
    if (inv.status === "PAID") return { error: "This invoice is already fully paid." };
    const due = Math.max(0, Math.round((totals(inv.lines, inv.discountValue, inv.taxPct, inv.discountType).total - inv.payments.reduce((a, p) => a + Number(p.amount), 0)) * 100) / 100);
    const raw = PaymentSchema.parse(Object.fromEntries(fd));
    const amount = Math.round(raw.amount * 100) / 100;
    if (amount > due + 0.009) return { error: `The payment (${amount.toFixed(2)}) is more than the remaining due (${due.toFixed(2)}). Record the exact amount you received.` };
    const paidAt = raw.paidAt ? new Date(raw.paidAt) : new Date();
    if (isNaN(paidAt.getTime())) return { error: "The payment date is not a valid date." };
    await db.payment.create({ data: { invoiceId, amount, method: raw.method, reference: raw.reference || null, paidAt, note: raw.note || null, recordedById: uid } });
    await syncPaymentStatus(invoiceId);
    revalidate(invoiceId, inv.orderId);
    return { ok: `Payment of ${amount.toFixed(2)} ${inv.currency} recorded.` };
  } catch (e) { return fail(e); }
}
// Delete a mistaken payment. The invoice status is recomputed: with no payments
// left it goes back to ISSUED (email it again to mark it SENT).
export async function deletePayment(paymentId: string): Promise<FormState> {
  try { await requireAdmin(BILLERS);
    const p = await db.payment.findUniqueOrThrow({ where: { id: paymentId }, include: { invoice: true } });
    if (p.invoice.status === "VOID") return { error: "This invoice is void; its payments are part of the audit trail." };
    await db.payment.delete({ where: { id: paymentId } });
    await syncPaymentStatus(p.invoiceId);
    revalidate(p.invoiceId, p.invoice.orderId);
    return { ok: "Payment deleted." };
  } catch (e) { return fail(e); }
}
