const n = (v: unknown) => Number(v ?? 0); const r2 = (x: number) => Math.round(x * 100) / 100;
export type DiscountType = "PERCENT" | "FIXED";
export function totals(lines: { qty: unknown; unitPrice: unknown }[], discount: unknown, tax: unknown, type: unknown = "PERCENT") {
  const sub = lines.reduce((a, l) => a + n(l.qty) * n(l.unitPrice), 0); const d = Math.max(0, n(discount));
  const disc = type === "FIXED" ? Math.min(d, sub) : (sub * Math.min(d, 100)) / 100; const tx = ((sub - disc) * Math.max(0, n(tax))) / 100;
  return { subtotal: r2(sub), discount: r2(disc), tax: r2(tx), total: r2(sub - disc + tx) };
}
export const fmt = (v: number, cur = "USD") => { try { return new Intl.NumberFormat("en-US", { style: "currency", currency: cur }).format(v); } catch { return `${cur} ${v.toFixed(2)}`; } };
export const soRef = (seq: number, d = new Date()) => `SO-${d.getFullYear()}-${String(seq).padStart(6, "0")}`;
export const discountLabel = (type: unknown, value: unknown) => (type === "FIXED" ? "Discount" : `Discount (${n(value)}%)`);
export const CURRENCIES = ["USD", "BDT", "EUR", "GBP"];
