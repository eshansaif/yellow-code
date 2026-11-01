"use server";
import { revalidatePath } from "next/cache"; import { redirect } from "next/navigation"; import { db } from "@/lib/db"; import { requireAdmin } from "@/auth"; import { issueInvoice, emailInvoiceById, billRef, getCompany } from "@/lib/invoice"; import { fail, type FormState } from "@/lib/friendly";
const BILLERS = ["ADMIN", "ACCOUNTS"];
const str = (v: FormDataEntryValue | null) => (typeof v === "string" && v.trim() ? v.trim().slice(0, 120) : undefined);
export async function generateBills(fd: FormData): Promise<FormState> {
  const s = await requireAdmin(BILLERS); const uid = (s.user as { id: string }).id;
  // Fail fast with a clear, actionable message before touching anything.
  const company = await getCompany();
  if (!company.legalName) return { error: "The company profile is not set yet. Open Admin > Company profile, fill in the legal company name and save, then generate the bills again." };
  const ids = [...new Set(fd.getAll("orderIds").map(String))]; if (!ids.length) return { error: "Select at least one sales order to bill." }; if (ids.length > 100) return { error: "Select at most 100 orders at a time." };
  const dueRaw = str(fd.get("dueDate")); const due = dueRaw ? new Date(dueRaw) : null; if (due && isNaN(due.getTime())) return { error: "The due date is not a valid date." };
  const bill = await db.bill.create({ data: { number: crypto.randomUUID(), createdById: uid } }); let ok = 0; const failed: string[] = [];
  for (const id of ids) { try { await issueInvoice(id, uid, { dueDate: due, lcNumber: str(fd.get(`lc_${id}`)), portOfLoading: str(fd.get(`pol_${id}`)), portOfDischarge: str(fd.get(`pod_${id}`)), incoterm: str(fd.get(`inco_${id}`)), billId: bill.id }); ok++; } catch (e) { failed.push(e instanceof Error ? e.message : "Failed"); } }
  if (!ok) { await db.bill.delete({ where: { id: bill.id } }); return { error: failed[0] ?? "Nothing was billed. Please try again." }; }
  await db.bill.update({ where: { id: bill.id }, data: { number: billRef(bill.seq, bill.createdAt) } }); revalidatePath("/admin/billing"); revalidatePath("/admin/sales-orders"); revalidatePath("/admin");
  redirect(`/admin/billing/bills/${bill.id}?skipped=${failed.length}`); }
export async function emailBill(id: string): Promise<FormState> { try { await requireAdmin(BILLERS);
  const invs = await db.invoice.findMany({ where: { billId: id, status: { not: "VOID" }, emailedAt: null } }); if (!invs.length) return { error: "Nothing left to send — every invoice in this bill was already emailed or void." };
  let ok = 0; let last = "Email failed."; for (const i of invs) { try { await emailInvoiceById(i.id); ok++; } catch (e) { last = e instanceof Error ? e.message : last; } }
  if (!ok) return { error: last }; revalidatePath(`/admin/billing/bills/${id}`); return { ok: `Emailed ${ok} invoice${ok === 1 ? "" : "s"}.` }; } catch (e) { return fail(e); } }
