import { notFound } from "next/navigation"; import { db } from "@/lib/db"; import { auth } from "@/auth"; import { soRef } from "@/lib/money"; import InvoiceDocument from "@/components/InvoiceDocument"; import PrintButton from "@/components/PrintButton";
export const metadata = { robots: { index: false } };
export default async function PrintBill({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const s = await auth(); const role = (s?.user as { role?: string } | undefined)?.role;
  if (!role || !["ADMIN", "SALES", "ACCOUNTS"].includes(role)) notFound();
  const b = await db.bill.findUnique({ where: { id }, include: { invoices: { where: { status: { not: "VOID" } }, orderBy: { seq: "asc" }, include: { lines: { orderBy: { sortOrder: "asc" } }, order: true, payments: { orderBy: { paidAt: "asc" } } } } } }); if (!b) notFound();
  return <main className="min-h-screen bg-[#e9e6df] py-8 print:bg-white print:py-0"><div className="mx-auto mb-4 flex max-w-[210mm] justify-end print:hidden"><PrintButton /></div>
    {b.invoices.map(i => <div key={i.id} className="mb-8 print:mb-0 print:break-after-page"><InvoiceDocument inv={i} orderRef={soRef(i.order.seq, i.order.createdAt)} /></div>)}</main>; }
