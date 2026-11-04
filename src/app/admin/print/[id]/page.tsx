import { notFound } from "next/navigation"; import { db } from "@/lib/db"; import { auth } from "@/auth"; import { soRef } from "@/lib/money"; import InvoiceDocument from "@/components/InvoiceDocument"; import PrintButton from "@/components/PrintButton";
export const metadata = { robots: { index: false } };
export default async function Print({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const s = await auth(); const role = (s?.user as { role?: string } | undefined)?.role;
  if (!role || !["ADMIN", "SALES", "ACCOUNTS"].includes(role)) notFound();
<<<<<<< HEAD
  const inv = await db.invoice.findUnique({ where: { id }, include: { lines: { orderBy: { sortOrder: "asc" } }, order: true, payments: { orderBy: { paidAt: "asc" } } } }); if (!inv) notFound();
=======
  const inv = await db.invoice.findUnique({ where: { id }, include: { lines: { orderBy: { sortOrder: "asc" } }, order: true } }); if (!inv) notFound();
>>>>>>> d9fed78e03f868a9b4e58ed4836b94388798d1cc
  return <main className="min-h-screen bg-[#e9e6df] py-8 print:bg-white print:py-0"><div className="mx-auto mb-4 flex max-w-[210mm] justify-end print:hidden"><PrintButton /></div><InvoiceDocument inv={inv} orderRef={soRef(inv.order.seq, inv.order.createdAt)} /></main>; }
