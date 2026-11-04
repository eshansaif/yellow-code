import { db } from "@/lib/db"; import { totals, fmt } from "@/lib/money"; import { esc, sendMailStrict } from "@/lib/mail";
<<<<<<< HEAD
export type Company = { legalName?: string; address?: string; phone?: string; email?: string; taxId?: string; bankName?: string; bankAccount?: string; swift?: string; footer?: string; autoEmail?: boolean; siteUrl?: string };
export const invoiceRef = (type: "LOCAL" | "PROFORMA", seq: number, d = new Date()) => `${type === "PROFORMA" ? "PI" : "INV"}-${d.getFullYear()}-${String(seq).padStart(6, "0")}`;
// Base URL used for customer-facing invoice links. Priority:
//   1. Company profile "Public site URL"   (Admin > Company profile — set it once, e.g. https://yellow-code.vercel.app)
//   2. NEXT_PUBLIC_SITE_URL environment variable
//   3. http://localhost:3000 (local development fallback)
export const DEFAULT_SITE_URL = "http://localhost:3000";
export const cleanUrl = (u: string | undefined | null) => { const t = (u ?? "").trim().replace(/\/+$/, ""); return /^https?:\/\//i.test(t) ? t : ""; };
export async function getSiteBase(): Promise<string> {
  const co = await getCompany();
  return cleanUrl(co.siteUrl) || cleanUrl(process.env.NEXT_PUBLIC_SITE_URL) || DEFAULT_SITE_URL;
}
export const publicUrl = (token: string, base: string) => `${base}/invoice/${token}`;
=======
export type Company = { legalName?: string; address?: string; phone?: string; email?: string; taxId?: string; bankName?: string; bankAccount?: string; swift?: string; footer?: string; autoEmail?: boolean };
export const invoiceRef = (type: "LOCAL" | "PROFORMA", seq: number, d = new Date()) => `${type === "PROFORMA" ? "PI" : "INV"}-${d.getFullYear()}-${String(seq).padStart(6, "0")}`;
export const publicUrl = (token: string) => `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/invoice/${token}`;
>>>>>>> d9fed78e03f868a9b4e58ed4836b94388798d1cc
export async function getCompany() { const r = await db.siteSetting.findUnique({ where: { key: "company" } }); return (r?.value ?? {}) as Company; }
type Opts = { dueDate?: Date | null; lcNumber?: string; portOfLoading?: string; portOfDischarge?: string; incoterm?: string; notes?: string; billId?: string };
// NOTE: deliberately NO interactive $transaction(async ...) here. Prisma
// interactive transactions fail on pooled Postgres (Neon / PgBouncer in
// transaction mode) with "Transaction API error: Transaction not found".
// Instead the billing status is claimed atomically with updateMany: exactly one
// caller can flip UNBILLED -> BILLED, which is the only thing we need to guard.
export async function issueInvoice(orderId: string, userId: string, o: Opts) {
  const company = await getCompany();
  if (!company.legalName) throw new Error("The company profile is not set yet. Open Admin > Company profile, fill in the legal company name and save, then generate the bills again.");
  const claim = await db.salesOrder.updateMany({ where: { id: orderId, billingStatus: "UNBILLED", status: { not: "CANCELLED" } }, data: { billingStatus: "BILLED" } });
  if (claim.count === 0) throw new Error("This order is already billed or was cancelled.");
  const so = await db.salesOrder.findUniqueOrThrow({ where: { id: orderId }, include: { customer: true, lines: { orderBy: { sortOrder: "asc" } } } });
  if (!so.lines.length) {
    await db.salesOrder.update({ where: { id: orderId }, data: { billingStatus: "UNBILLED" } }); // undo the claim
    throw new Error("The order has no line items.");
  }
  const type = so.trade === "IMPORT" ? "PROFORMA" : "LOCAL"; const imp = type === "PROFORMA";
  const c = await db.invoice.create({ data: { type, number: crypto.randomUUID(), orderId, customerName: so.customer.company, contactName: so.customer.name, customerEmail: so.customer.email, customerAddress: so.customer.address, customerTaxId: so.customer.taxId, customerCountry: so.customer.country,
    currency: so.currency, discountType: so.discountType, discountValue: so.discountValue, taxPct: so.taxPct, customerPo: so.customerPo, paymentTerms: so.paymentTerms, dueDate: o.dueDate ?? null, lcNumber: imp ? o.lcNumber || null : null, portOfLoading: imp ? o.portOfLoading || null : null, portOfDischarge: imp ? o.portOfDischarge || null : null, incoterm: imp ? o.incoterm || null : null,
    notes: o.notes || so.notes, billId: o.billId ?? null, company: company as never, createdById: userId, lines: { create: so.lines.map(l => ({ description: l.description, qty: l.qty, unit: l.unit, unitPrice: l.unitPrice, sortOrder: l.sortOrder })) } } });
  return db.invoice.update({ where: { id: c.id }, data: { number: invoiceRef(type, c.seq, c.createdAt) } });
}
<<<<<<< HEAD
export function invoiceEmailHtml(inv: { number: string; type: string; customerName: string; currency: string; discountValue: unknown; discountType: unknown; taxPct: unknown; dueDate: Date | null; publicToken: string; company: unknown; lines: { description: string; qty: unknown; unit: string; unitPrice: unknown }[] }, base: string) {
=======
export function invoiceEmailHtml(inv: { number: string; type: string; customerName: string; currency: string; discountValue: unknown; discountType: unknown; taxPct: unknown; dueDate: Date | null; publicToken: string; company: unknown; lines: { description: string; qty: unknown; unit: string; unitPrice: unknown }[] }) {
>>>>>>> d9fed78e03f868a9b4e58ed4836b94388798d1cc
  const co = inv.company as Company; const t = totals(inv.lines, inv.discountValue, inv.taxPct, inv.discountType); const label = inv.type === "PROFORMA" ? "Proforma Invoice" : "Invoice";
  const rows = inv.lines.map(l => `<tr><td style="padding:6px 8px;border-bottom:1px solid #eee">${esc(l.description)}</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">${Number(l.qty)} ${esc(l.unit)}</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">${fmt(Number(l.qty) * Number(l.unitPrice), inv.currency)}</td></tr>`).join("");
  return `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#16130d"><h2 style="margin:0 0 4px">${label} ${esc(inv.number)}</h2><p style="color:#666;margin:0 0 16px">From ${esc(co.legalName)} to ${esc(inv.customerName)}</p>
  <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}<tr><td colspan="2" style="padding:8px;text-align:right"><b>Total</b></td><td style="padding:8px;text-align:right"><b>${fmt(t.total, inv.currency)}</b></td></tr></table>
<<<<<<< HEAD
  ${inv.dueDate ? `<p>Due date: ${inv.dueDate.toLocaleDateString("en-GB")}</p>` : ""}<p><a href="${publicUrl(inv.publicToken, base)}" style="display:inline-block;background:#16130d;color:#fff;padding:10px 20px;border-radius:999px;text-decoration:none">View, print or save as PDF</a></p>
=======
  ${inv.dueDate ? `<p>Due date: ${inv.dueDate.toLocaleDateString("en-GB")}</p>` : ""}<p><a href="${publicUrl(inv.publicToken)}" style="display:inline-block;background:#16130d;color:#fff;padding:10px 20px;border-radius:999px;text-decoration:none">View, print or save as PDF</a></p>
>>>>>>> d9fed78e03f868a9b4e58ed4836b94388798d1cc
  <p style="color:#888;font-size:12px">${esc(co.legalName)} · ${esc(co.address)} · ${esc(co.email)}</p></div>`;
}
export async function emailInvoiceById(id: string, to?: string) {
  const inv = await db.invoice.findUniqueOrThrow({ where: { id }, include: { lines: { orderBy: { sortOrder: "asc" } } } }); if (inv.status === "VOID") throw new Error("A void invoice cannot be sent.");
  const co = inv.company as Company; const dest = to || inv.customerEmail;
<<<<<<< HEAD
  await sendMailStrict(dest, `${inv.type === "PROFORMA" ? "Proforma Invoice" : "Invoice"} ${inv.number} from ${co.legalName}`, invoiceEmailHtml(inv, await getSiteBase()));
=======
  await sendMailStrict(dest, `${inv.type === "PROFORMA" ? "Proforma Invoice" : "Invoice"} ${inv.number} from ${co.legalName}`, invoiceEmailHtml(inv));
>>>>>>> d9fed78e03f868a9b4e58ed4836b94388798d1cc
  await db.invoice.update({ where: { id }, data: { emailedAt: new Date(), emailedTo: dest, status: inv.status === "ISSUED" ? "SENT" : inv.status } });
}
export const billRef = (seq: number, d = new Date()) => `BL-${d.getFullYear()}-${String(seq).padStart(6, "0")}`;
