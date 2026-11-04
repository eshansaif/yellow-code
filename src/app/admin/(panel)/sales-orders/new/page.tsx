import { db } from "@/lib/db"; import SalesOrderForm from "@/components/admin/SalesOrderForm"; import { createSalesOrder } from "@/app/admin/(panel)/commercial-actions";
export default async function New() {
  const [cs, ps] = await Promise.all([db.customer.findMany({ orderBy: { company: "asc" }, take: 1000 }), db.product.findMany({ where: { status: { not: "ARCHIVED" } }, select: { name: true, category: { select: { name: true } } }, orderBy: { name: "asc" }, take: 2000 })]);
  return <><div className="mb-6"><h1>New sales order</h1><p className="text-sm text-[#6b6a66]">Create an order directly. Orders made from an approved quotation are created from the quotation page.</p></div>
    <SalesOrderForm action={createSalesOrder} customers={cs.map(c => ({ id: c.id, company: c.company, name: c.name, email: c.email, phone: c.phone, country: c.country, taxId: c.taxId }))} products={ps.map(p => ({ value: p.name, label: `${p.name} · ${p.category.name}` }))} /></>; }
