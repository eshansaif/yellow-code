"use server";
import { revalidatePath } from "next/cache"; import { z } from "zod"; import { db } from "@/lib/db"; import { requireAdmin } from "@/auth"; import { emailInvoiceById } from "@/lib/invoice"; import { fail, type FormState } from "@/lib/friendly";
const BILLERS = ["ADMIN", "ACCOUNTS"];
export async function emailInvoice(id: string, fd: FormData): Promise<FormState> { try { await requireAdmin(BILLERS); const to = z.string().email("enter a valid email address").optional().or(z.literal("")).parse(fd.get("to")); await emailInvoiceById(id, to || undefined); revalidatePath(`/admin/invoices/${id}`); return { ok: "Email sent." }; } catch (e) { return fail(e); } }
export async function voidInvoice(id: string, fd: FormData): Promise<FormState> { try { await requireAdmin(BILLERS); const reason = z.string().min(3, "write a short reason (at least 3 characters)").max(300).parse(fd.get("reason"));
  const inv = await db.invoice.findUniqueOrThrow({ where: { id } }); if (inv.status === "PAID") return { error: "A paid invoice cannot be voided." }; if (inv.status === "VOID") return { error: "This invoice is already void." };
  const pays = await db.payment.count({ where: { invoiceId: id } }); if (pays > 0) return { error: `This invoice has ${pays} recorded payment${pays === 1 ? "" : "s"}. Delete them on the invoice page first, then void it.` };
  // Sequential instead of an interactive transaction: safe on pooled Postgres (Neon).
  await db.invoice.update({ where: { id }, data: { status: "VOID", voidedAt: new Date(), voidReason: reason } });
  const active = await db.invoice.count({ where: { orderId: inv.orderId, status: { not: "VOID" } } });
  if (active === 0) await db.salesOrder.update({ where: { id: inv.orderId }, data: { billingStatus: "UNBILLED" } });
  revalidatePath(`/admin/invoices/${id}`); revalidatePath("/admin/invoices"); return { ok: "Invoice void." }; } catch (e) { return fail(e); } }
export async function saveCompany(fd: FormData): Promise<FormState> { try { await requireAdmin(BILLERS);
  const c = z.object({ legalName: z.string().min(2, "the legal company name is required").max(160), siteUrl: z.string().trim().max(200).optional(), address: z.string().max(400).optional(), phone: z.string().max(60).optional(), email: z.string().max(160).optional(), taxId: z.string().max(80).optional(), bankName: z.string().max(160).optional(), bankAccount: z.string().max(160).optional(), swift: z.string().max(40).optional(), footer: z.string().max(400).optional() }).parse(Object.fromEntries(fd));
  if (c.siteUrl && !/^https?:\/\//i.test(c.siteUrl)) return { error: "The public site URL must start with http:// or https:// — for example https://yellow-code.vercel.app" };
  const v = { ...c, siteUrl: c.siteUrl ? c.siteUrl.replace(/\/+$/, "") : "", autoEmail: fd.get("autoEmail") === "on" }; await db.siteSetting.upsert({ where: { key: "company" }, update: { value: v }, create: { key: "company", value: v } }); revalidatePath("/admin/company"); revalidatePath("/admin/billing"); return { ok: "Company profile saved." }; } catch (e) { return fail(e); } }
