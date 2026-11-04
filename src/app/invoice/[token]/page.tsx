import { notFound } from "next/navigation"; import { db } from "@/lib/db"; import { soRef } from "@/lib/money"; import InvoiceDocument from "@/components/InvoiceDocument"; import PrintButton from "@/components/PrintButton";
export const metadata = { title: "Invoice", robots: { index: false, follow: false } };
export default async function PublicInvoice({ params }: { params: Promise<{ token: string }> }) { const { token } = await params;
<<<<<<< HEAD
  const inv = await db.invoice.findUnique({ where: { publicToken: token }, include: { lines: { orderBy: { sortOrder: "asc" } }, order: true, payments: { orderBy: { paidAt: "asc" } } } }); if (!inv) notFound();
=======
  const inv = await db.invoice.findUnique({ where: { publicToken: token }, include: { lines: { orderBy: { sortOrder: "asc" } }, order: true } }); if (!inv) notFound();
>>>>>>> d9fed78e03f868a9b4e58ed4836b94388798d1cc
  return <main className="min-h-screen bg-[#e9e6df] py-8 print:bg-white print:py-0"><div className="mx-auto mb-4 flex max-w-[210mm] justify-end px-4 print:hidden"><PrintButton /></div><InvoiceDocument inv={inv} orderRef={soRef(inv.order.seq, inv.order.createdAt)} /></main>; }
