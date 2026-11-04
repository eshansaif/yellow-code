"use server";
import { revalidatePath } from "next/cache"; import { redirect } from "next/navigation"; import { z } from "zod"; import { db } from "@/lib/db"; import { requireAdmin } from "@/auth"; import { fail, friendly, type FormState } from "@/lib/friendly";
const LineSchema = z.array(z.object({ description: z.string().max(300), qty: z.coerce.number().positive().max(1e9), unit: z.string().max(20).default("pcs"), unitPrice: z.coerce.number().min(0).max(1e9) }));
function parseLines(raw: FormDataEntryValue | null) {
  let j: unknown; try { j = JSON.parse(String(raw ?? "[]")); } catch { throw new Error("Invalid line items."); }
  if (!Array.isArray(j)) throw new Error("Invalid line items.");
  const rows = LineSchema.parse((j as { description?: string }[]).filter(r => r.description?.trim())); if (!rows.length) throw new Error("Add at least one line item.");
  return rows.map((r, i) => ({ ...r, description: r.description.trim(), sortOrder: i }));
}
const money = z.object({ currency: z.enum(["USD", "BDT", "EUR", "GBP"]), discountType: z.enum(["PERCENT", "FIXED"]), discountValue: z.coerce.number().min(0, "Discount cannot be negative").max(1e9), taxPct: z.coerce.number().min(0).max(100, "Tax cannot exceed 100%") })
  .refine(v => v.discountType !== "PERCENT" || v.discountValue <= 100, { message: "A percentage discount cannot exceed 100", path: ["discountValue"] });
type FormState2 = { error?: string } | null;
const customerSchema = z.object({ name: z.string().trim().min(2, "enter the contact person's name").max(120), company: z.string().trim().min(2, "enter the company name").max(160), email: z.string().trim().email("enter a valid email"), phone: z.string().trim().max(40).optional(), country: z.string().trim().max(80).optional(), address: z.string().trim().max(400).optional(), taxId: z.string().trim().max(60).optional() });
const note = (quoteId: string, authorId: string, body: string) => db.quoteNote.create({ data: { quoteId, authorId, body } });

export async function saveQuoteEdit(id: string, _p: FormState2, fd: FormData): Promise<FormState2> {
  try { await requireAdmin(["ADMIN", "SALES"]); const q = await db.quoteRequest.findUniqueOrThrow({ where: { id } }); if (q.approval === "APPROVED" || q.approval === "PENDING_APPROVAL") throw new Error("This quotation is locked.");
    const c = z.object({ name: z.string().trim().min(2, "too short"), company: z.string().trim().min(2, "too short"), email: z.string().trim().email("enter a valid email"), phone: z.string().trim().min(6, "too short").max(40), country: z.string().trim().min(2, "too short"), city: z.string().max(80).optional(), validUntil: z.string().optional(), terms: z.string().max(3000).optional() }).parse(Object.fromEntries(fd));
    const m = money.parse(Object.fromEntries(fd)); const lines = parseLines(fd.get("lines"));
    await db.$transaction([db.quoteLine.deleteMany({ where: { quoteId: id } }), db.quoteRequest.update({ where: { id }, data: { ...c, validUntil: c.validUntil ? new Date(c.validUntil) : null, ...m, lines: { create: lines } } })]);
  } catch (e) { return { error: friendly(e) }; }
  revalidatePath(`/admin/quotes/${id}`); redirect(`/admin/quotes/${id}`); }
export async function submitForApproval(id: string): Promise<FormState> { try { const s = await requireAdmin(["ADMIN", "SALES"]);
  const q = await db.quoteRequest.findUniqueOrThrow({ where: { id }, include: { lines: true } });
  if (!["DRAFT", "REJECTED"].includes(q.approval)) return { error: "This quotation was already submitted for approval." };
  if (!q.lines.length || q.lines.some(l => Number(l.unitPrice) <= 0)) return { error: "Every line needs a unit price above 0 before this can be submitted for approval." };
  await db.quoteRequest.update({ where: { id }, data: { approval: "PENDING_APPROVAL", rejectionReason: null } }); await note(id, (s.user as { id: string }).id, "Submitted for approval"); revalidatePath(`/admin/quotes/${id}`); return { ok: "Submitted for approval." }; } catch (e) { return fail(e); } }
export async function approveQuote(id: string): Promise<FormState> { try { const s = await requireAdmin(["ADMIN"]); const uid = (s.user as { id: string }).id;
  const q = await db.quoteRequest.findUniqueOrThrow({ where: { id } }); if (q.approval !== "PENDING_APPROVAL") return { error: "This quotation is not waiting for approval." };
  await db.quoteRequest.update({ where: { id }, data: { approval: "APPROVED", approvedById: uid, approvedAt: new Date() } }); await note(id, uid, "Quotation approved"); revalidatePath(`/admin/quotes/${id}`); return { ok: "Quotation approved." }; } catch (e) { return fail(e); } }
export async function rejectQuote(id: string, fd: FormData): Promise<FormState> { try { const s = await requireAdmin(["ADMIN"]); const uid = (s.user as { id: string }).id;
  const reason = z.string().min(3, "write a short reason (at least 3 characters)").max(500).parse(fd.get("reason")); const q = await db.quoteRequest.findUniqueOrThrow({ where: { id } }); if (q.approval !== "PENDING_APPROVAL") return { error: "This quotation is not waiting for approval." };
  await db.quoteRequest.update({ where: { id }, data: { approval: "REJECTED", rejectionReason: reason } }); await note(id, uid, `Quotation rejected: ${reason}`); revalidatePath(`/admin/quotes/${id}`); return { ok: "Quotation rejected." }; } catch (e) { return fail(e); } }
export async function convertQuoteToOrder(id: string, fd: FormData): Promise<FormState> {
  let target = "";
  try { const s = await requireAdmin(["ADMIN", "SALES"]); const uid = (s.user as { id: string }).id;
    const trade = z.enum(["LOCAL", "IMPORT"]).parse(fd.get("trade"));
    const q = await db.quoteRequest.findUniqueOrThrow({ where: { id }, include: { lines: true, salesOrder: true } });
    if (q.approval !== "APPROVED") return { error: "Only approved quotations can be converted to a sales order." }; if (q.salesOrder) return { error: "This quotation was already converted." };
    const cust = (await db.customer.findFirst({ where: { email: q.email } })) ?? (await db.customer.create({ data: { name: q.name, company: q.company, email: q.email, phone: q.phone, country: q.country } }));
    const so = await db.salesOrder.create({ data: { customerId: cust.id, quoteId: id, source: "QUOTATION", trade, currency: q.currency, discountType: q.discountType, discountValue: q.discountValue, taxPct: q.taxPct, notes: q.terms, createdById: uid,
      lines: { create: q.lines.map(l => ({ description: l.description, qty: l.qty, unit: l.unit, unitPrice: l.unitPrice, sortOrder: l.sortOrder })) } } });
    await note(id, uid, "Converted to Sales Order"); revalidatePath(`/admin/sales-orders`); target = `/admin/sales-orders/${so.id}`; } catch (e) { return fail(e); }
  redirect(target); }
export async function createSalesOrder(_p: FormState2, fd: FormData): Promise<FormState2> {
  let orderId = "";
  try { const s = await requireAdmin(["ADMIN", "SALES"]); const uid = (s.user as { id: string }).id; const raw = Object.fromEntries(fd);
    const o = z.object({ trade: z.enum(["LOCAL", "IMPORT"]), customerPo: z.string().max(80).optional(), paymentTerms: z.string().max(200).optional(), deliveryDate: z.string().optional(), notes: z.string().max(3000).optional() }).parse(raw);
    const m = money.parse(raw); const lines = parseLines(fd.get("lines")); let customerId = String(raw.customerId ?? "");
    if (raw.customerMode === "existing") { if (!customerId) return { error: "Choose a customer, or switch to “New customer”." }; if (!(await db.customer.findUnique({ where: { id: customerId } }))) return { error: "That customer no longer exists." }; }
    else { const c = customerSchema.parse(raw); const found = await db.customer.findFirst({ where: { email: { equals: c.email, mode: "insensitive" } } }); customerId = (found ?? (await db.customer.create({ data: c }))).id; }
    const so = await db.salesOrder.create({ data: { customerId, source: "DIRECT", ...o, deliveryDate: o.deliveryDate ? new Date(o.deliveryDate) : null, ...m, createdById: uid, lines: { create: lines } } }); orderId = so.id;
  } catch (e) { return { error: friendly(e) }; }
  revalidatePath("/admin/sales-orders"); redirect(`/admin/sales-orders/${orderId}`); }
export async function createCustomer(_p: FormState2, fd: FormData): Promise<FormState2> {
  try { await requireAdmin(["ADMIN", "SALES"]); await db.customer.create({ data: customerSchema.parse(Object.fromEntries(fd)) }); } catch (e) { return { error: friendly(e) }; }
  revalidatePath("/admin/customers"); redirect("/admin/customers"); }
export async function updateCustomer(id: string, _p: FormState2, fd: FormData): Promise<FormState2> {
  try { await requireAdmin(["ADMIN", "SALES"]); await db.customer.update({ where: { id }, data: customerSchema.parse(Object.fromEntries(fd)) }); } catch (e) { return { error: friendly(e) }; }
  revalidatePath("/admin/customers"); redirect("/admin/customers"); }
export async function setOrderStatus(id: string, fd: FormData): Promise<FormState> { try { await requireAdmin(["ADMIN", "SALES"]);
  const status = z.enum(["OPEN", "CONFIRMED", "IN_PRODUCTION", "READY", "SHIPPED", "COMPLETED", "CANCELLED"]).parse(fd.get("status"));
  const so = await db.salesOrder.findUniqueOrThrow({ where: { id } }); if (status === "CANCELLED" && so.billingStatus === "BILLED") return { error: "This order was already billed. Void its invoice first if you really need to cancel it." };
  await db.salesOrder.update({ where: { id }, data: { status } }); revalidatePath(`/admin/sales-orders/${id}`); revalidatePath("/admin/sales-orders"); return { ok: "Order status updated." }; } catch (e) { return fail(e); } }
