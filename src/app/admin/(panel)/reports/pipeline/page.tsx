import { db } from "@/lib/db"; import ReportFilter from "@/components/admin/ReportFilter"; import Badge from "@/components/admin/Badge";
import { range, dateFilter, rangeLabel, Stat, ReportShell } from "@/lib/reports"; import { r2 } from "@/lib/payments"; import type { SP } from "@/lib/list";
export default async function Pipeline({ searchParams }: { searchParams: Promise<SP> }) { const sp = await searchParams; const r = range(sp);
  const [quoteGroups, statusGroups, orderGroups, tradeGroups, sourceGroups] = await Promise.all([
    db.quoteRequest.groupBy({ by: ["approval"], _count: { _all: true }, where: dateFilter("createdAt", r) }),
    db.quoteRequest.groupBy({ by: ["status"], _count: { _all: true }, where: dateFilter("createdAt", r) }),
    db.salesOrder.groupBy({ by: ["status"], _count: { _all: true }, where: dateFilter("orderDate", r) }),
    db.salesOrder.groupBy({ by: ["trade"], _count: { _all: true }, where: dateFilter("orderDate", r) }),
    db.salesOrder.groupBy({ by: ["source"], _count: { _all: true }, where: dateFilter("orderDate", r) }),
  ]);
  const cnt = <T extends string>(arr: { [k: string]: unknown }[], key: string, v: T) => arr.find(x => x[key] === v)?._count as { _all: number } | undefined ?? { _all: 0 };
  const qTotal = quoteGroups.reduce((a, g) => a + g._count._all, 0), oTotal = orderGroups.reduce((a, g) => a + g._count._all, 0);
  const approved = cnt(quoteGroups, "approval", "APPROVED")._all + cnt(quoteGroups, "approval", "PENDING_APPROVAL")._all;
  const converted = cnt(sourceGroups, "source", "QUOTATION")._all;
  const conv = approved > 0 ? r2((converted / approved) * 100) : 0;
  const rows: Record<string, [string, number][]> = {
    "Quotations by approval": (["DRAFT", "PENDING_APPROVAL", "APPROVED", "REJECTED"] as const).map(k => [k, cnt(quoteGroups, "approval", k)._all]),
    "Quotations by stage": (["NEW", "REVIEWING", "CONTACTED", "QUOTED", "SAMPLE_REQUESTED", "SAMPLE_SENT", "PRODUCTION", "COMPLETED", "CANCELLED"] as const).map(k => [k, cnt(statusGroups, "status", k)._all]),
    "Sales orders by status": (["OPEN", "CONFIRMED", "IN_PRODUCTION", "READY", "SHIPPED", "COMPLETED", "CANCELLED"] as const).map(k => [k, cnt(orderGroups, "status", k)._all]),
    "Sales orders by type and source": [["LOCAL", cnt(tradeGroups, "trade", "LOCAL")._all], ["IMPORT", cnt(tradeGroups, "trade", "IMPORT")._all], ["From quotation", converted], ["Direct", cnt(sourceGroups, "source", "DIRECT")._all]] as [string, number][],
  };
  return <ReportShell title="Business pipeline" desc={`Quotations created and sales orders placed ${rangeLabel(r)} — where every deal stands and how many quotes become orders.`}>
    <div className="mt-4"><ReportFilter dates /></div>
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3"><Stat t="Quotations" v={qTotal} s="created in the period" tone="#9bb7d4" /><Stat t="Sales orders" v={oTotal} s="placed in the period" tone="#7fb7a4" /><Stat t="Quote → order conversion" v={`${conv}%`} s={`${converted} of ${approved} live quotations became orders`} tone="#f2c10e" /></div>
    <div className="mt-4 grid gap-6 lg:grid-cols-2">{Object.entries(rows).map(([t, list]) => <section key={t} className="rounded-2xl border border-[#e7e0d2] bg-white p-5"><h2 className="!text-base">{t}</h2>
      <table className="mt-2"><thead><tr><th>Stage</th><th className="text-right">Count</th></tr></thead><tbody>{list.map(([k, v]) => <tr key={k}><td><Badge s={k} /></td><td className="text-right font-semibold">{v}</td></tr>)}</tbody></table></section>)}</div>
    <p className="mt-4 text-xs text-[#8a857a]">Tip: conversion above 50% usually means pricing is competitive. Follow up on REJECTED quotes to learn why they were lost.</p></ReportShell>;
}
