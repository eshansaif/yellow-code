"use client";
import { useState } from "react"; import SearchSelect from "@/components/SearchSelect"; import { totals, fmt, CURRENCIES } from "@/lib/money";
export type Line = { id: string; product: string; description: string; qty: string; unit: string; unitPrice: string };
export type Pricing = { lines: Line[]; currency: string; discountType: "PERCENT" | "FIXED"; discountValue: string; taxPct: string };
type Set = React.Dispatch<React.SetStateAction<Pricing>>;
export const uid = () => Math.random().toString(36).slice(2, 10);
export const blankLine = (): Line => ({ id: uid(), product: "", description: "", qty: "1", unit: "pcs", unitPrice: "" });
export function usePricing(init?: Partial<Pricing>) { return useState<Pricing>({ lines: init?.lines?.length ? init.lines : [blankLine()], currency: init?.currency ?? "USD", discountType: init?.discountType ?? "PERCENT", discountValue: init?.discountValue ?? "0", taxPct: init?.taxPct ?? "0" }); }
const calc = (p: Pricing) => totals(p.lines.map(l => ({ qty: Number(l.qty) || 0, unitPrice: Number(l.unitPrice) || 0 })), Number(p.discountValue) || 0, Number(p.taxPct) || 0, p.discountType);
export function PricingHidden({ p }: { p: Pricing }) {
  return <><input type="hidden" name="lines" value={JSON.stringify(p.lines.map(({ description, qty, unit, unitPrice }) => ({ description, qty, unit, unitPrice })))} /><input type="hidden" name="currency" value={p.currency} /><input type="hidden" name="discountType" value={p.discountType} /><input type="hidden" name="discountValue" value={p.discountValue || "0"} /><input type="hidden" name="taxPct" value={p.taxPct || "0"} /></>;
}
const L = ({ t, children }: { t: string; children: React.ReactNode }) => <label className="block text-xs font-medium text-[#6b6a66]"><span className="block">{t}</span>{children}</label>;
export function LineItems({ p, set, products }: { p: Pricing; set: Set; products: { value: string; label: string }[] }) {
  const upd = (id: string, patch: Partial<Line>) => set(s => ({ ...s, lines: s.lines.map(l => (l.id === id ? { ...l, ...patch } : l)) }));
  const pick = (id: string, v: string) => set(s => ({ ...s, lines: s.lines.map(l => (l.id === id ? { ...l, product: v, description: !l.description || l.description === l.product ? v : l.description } : l)) }));
  return <div className="space-y-3">{p.lines.map((l, i) => <div key={l.id} className="rounded-xl border border-[#e7e0d2] bg-[#fbfaf6] p-3">
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1.5fr)_5.5rem_5rem_7.5rem]">
      <L t={`Product (line ${i + 1})`}><SearchSelect compact name={`_p${l.id}`} placeholder="Search products…" defaultValue={l.product} options={products} onChange={v => pick(l.id, v)} /></L>
      <L t="Description"><input value={l.description} onChange={e => upd(l.id, { description: e.target.value })} placeholder="Item description / specification" className="mt-1" /></L>
      <L t="Qty"><input type="number" min="0" step="any" value={l.qty} onChange={e => upd(l.id, { qty: e.target.value })} className="mt-1" /></L>
      <L t="Unit"><input value={l.unit} onChange={e => upd(l.id, { unit: e.target.value })} className="mt-1" /></L>
      <L t="Unit price"><input type="number" min="0" step="any" value={l.unitPrice} onChange={e => upd(l.id, { unitPrice: e.target.value })} placeholder="0.00" className="mt-1" /></L></div>
    <div className="mt-2 flex items-center justify-between text-sm"><span className="text-[#6b6a66]">Amount: <b className="text-[#16130d]">{fmt((Number(l.qty) || 0) * (Number(l.unitPrice) || 0), p.currency)}</b></span>
      {p.lines.length > 1 && <button type="button" onClick={() => set(s => ({ ...s, lines: s.lines.filter(x => x.id !== l.id) }))} className="adm-plain text-sm text-red-700 underline">Remove line</button>}</div></div>)}
    <button type="button" onClick={() => set(s => ({ ...s, lines: [...s.lines, blankLine()] }))} className="adm-plain rounded-full border border-dashed border-[#16130d]/40 px-4 py-2 text-sm font-medium hover:bg-white">+ Add line</button></div>;
}
// compact renders a 2-column grid that fits the sticky summary sidebar.
export function PricingFields({ p, set, compact = false }: { p: Pricing; set: Set; compact?: boolean }) {
  return <div className={compact ? "grid grid-cols-2 gap-3" : "grid gap-4 sm:grid-cols-2 lg:grid-cols-4"}>
    <L t="Currency"><SearchSelect compact={compact} name="_cur" defaultValue={p.currency} options={CURRENCIES.map(c => ({ value: c, label: c }))} onChange={v => v && set(s => ({ ...s, currency: v }))} /></L>
    <L t="Discount type"><SearchSelect compact={compact} name="_dt" defaultValue={p.discountType} options={[{ value: "PERCENT", label: "Percentage (%)" }, { value: "FIXED", label: "Fixed amount" }]} onChange={v => v && set(s => ({ ...s, discountType: v as Pricing["discountType"] }))} /></L>
    <L t={p.discountType === "PERCENT" ? "Discount (%)" : `Discount (${p.currency})`}><input type="number" min="0" step="any" value={p.discountValue} onChange={e => set(s => ({ ...s, discountValue: e.target.value }))} className="mt-1" /></L>
    <L t="Tax / VAT (%)"><input type="number" min="0" max="100" step="any" value={p.taxPct} onChange={e => set(s => ({ ...s, taxPct: e.target.value }))} className="mt-1" /></L></div>;
}
export function Summary({ p }: { p: Pricing }) { const t = calc(p); const row = (k: string, v: string, b = false) => <div className={`flex justify-between py-1.5 text-sm ${b ? "border-t border-[#e7e0d2] pt-3 text-base font-semibold" : ""}`}><dt className={b ? "" : "text-[#6b6a66]"}>{k}</dt><dd>{v}</dd></div>;
  return <dl>{row("Subtotal", fmt(t.subtotal, p.currency))}{row(p.discountType === "PERCENT" ? `Discount (${Number(p.discountValue) || 0}%)` : "Discount", `-${fmt(t.discount, p.currency)}`)}{row(`Tax (${Number(p.taxPct) || 0}%)`, fmt(t.tax, p.currency))}{row("Total", fmt(t.total, p.currency), true)}</dl>; }
