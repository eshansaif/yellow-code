import type { NextRequest } from "next/server"; import { auth } from "@/auth"; import { db } from "@/lib/db";
// Global admin search used by the sidebar search box. Returns small groups of
// links for customers, products, quotes, sales orders and invoices, plus
// "#123" / "SO-2026-000123" style number lookups.
export async function GET(req: NextRequest) {
  const s = await auth(); if (!s) return Response.json({ groups: [] }, { status: 401 });
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 60);
  if (q.length < 2) return Response.json({ groups: [] });
  const ci = { contains: q, mode: "insensitive" as const };
  const seq = Number((q.match(/^(?:#|(?:SO|INV|PI|BL)-\d{4}-?)?0*(\d{1,6})$/i) ?? [])[1] ?? 0);
  const [customers, products, quotes, orders, invoices] = await Promise.all([
    db.customer.findMany({ where: { OR: [{ company: ci }, { name: ci }, { email: ci }] }, orderBy: { company: "asc" }, take: 4, select: { id: true, company: true, name: true, email: true } }),
    db.product.findMany({ where: { OR: [{ name: ci }, { slug: ci }] }, orderBy: { name: "asc" }, take: 4, select: { id: true, name: true, category: { select: { name: true } } } }),
    db.quoteRequest.findMany({ where: { OR: [{ company: ci }, { name: ci }, { email: ci }, ...(seq ? [{ seq }] : [])] }, orderBy: { createdAt: "desc" }, take: 4, select: { id: true, seq: true, company: true, name: true, status: true } }),
    db.salesOrder.findMany({ where: { OR: [{ customer: { company: ci } }, { customerPo: ci }, ...(seq ? [{ seq }] : [])] }, orderBy: { createdAt: "desc" }, take: 4, select: { id: true, seq: true, createdAt: true, customer: { select: { company: true } }, status: true } }),
    db.invoice.findMany({ where: { OR: [{ number: ci }, { customerName: ci }] }, orderBy: { createdAt: "desc" }, take: 4, select: { id: true, number: true, customerName: true, status: true } }),
  ]);
  const groups = [
    customers.length && { title: "Customers", items: customers.map(c => ({ label: c.company, sub: `${c.name} · ${c.email}`, href: `/admin/customers/${c.id}` })) },
    products.length && { title: "Products", items: products.map(p => ({ label: p.name, sub: p.category.name, href: `/admin/products/${p.id}` })) },
    quotes.length && { title: "Quote requests", items: quotes.map(x => ({ label: x.company, sub: `Quote #${x.seq} · ${x.status.replaceAll("_", " ").toLowerCase()}`, href: `/admin/quotes/${x.id}` })) },
    orders.length && { title: "Sales orders", items: orders.map(o => ({ label: `SO-${o.createdAt.getFullYear()}-${String(o.seq).padStart(6, "0")}`, sub: `${o.customer.company} · ${o.status.replaceAll("_", " ").toLowerCase()}`, href: `/admin/sales-orders/${o.id}` })) },
    invoices.length && { title: "Invoices", items: invoices.map(i => ({ label: i.number, sub: `${i.customerName} · ${i.status}`, href: `/admin/invoices/${i.id}` })) },
  ].filter(Boolean);
  return Response.json({ groups });
}
