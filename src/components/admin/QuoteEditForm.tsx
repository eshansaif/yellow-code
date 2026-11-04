"use client";
import { useActionState } from "react"; import Link from "next/link"; import SubmitButton from "@/components/admin/SubmitButton"; import { LineItems, PricingFields, PricingHidden, Summary, usePricing, type Line } from "@/components/admin/PricingEditor";
type Q = { name: string; company: string; email: string; phone: string; country: string; city: string; validUntil: string; terms: string; currency: string; discountType: "PERCENT" | "FIXED"; discountValue: string; taxPct: string; lines: Line[] };
const CARD = "rounded-2xl border border-[#e7e0d2] bg-white p-5 shadow-[0_1px_2px_rgba(22,19,13,.04)] sm:p-6";
const F = ({ n, l, v, t = "text", r }: { n: string; l: string; v: string; t?: string; r?: boolean }) => <label className="block text-sm">{l}{r && <span className="text-red-600"> *</span>}<input name={n} type={t} defaultValue={v} required={r} className="mt-1" /></label>;
export default function QuoteEditForm({ q, id, products, action }: { q: Q; id: string; products: { value: string; label: string }[]; action: (p: { error?: string } | null, fd: FormData) => Promise<{ error?: string } | null> }) {
  const [state, formAction] = useActionState(action, null); const [p, setP] = usePricing({ lines: q.lines, currency: q.currency, discountType: q.discountType, discountValue: q.discountValue, taxPct: q.taxPct });
  return <form action={formAction} className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]"><PricingHidden p={p} />
    <div className="space-y-6">{state?.error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{state.error}</p>}
      <section className={CARD}><h2>Customer</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><F n="name" l="Name" v={q.name} r /><F n="company" l="Company" v={q.company} r /><F n="email" l="Email" v={q.email} t="email" r /><F n="phone" l="Phone" v={q.phone} r /><F n="country" l="Country" v={q.country} r /><F n="city" l="City" v={q.city} /></div></section>
      <section className={CARD}><h2>Line items</h2><div className="mt-4"><LineItems p={p} set={setP} products={products} /></div></section>
      <section className={CARD}><h2>Validity and terms</h2><div className="mt-4 grid gap-4"><F n="validUntil" l="Valid until" v={q.validUntil} t="date" /><label className="block text-sm">Terms and notes<textarea name="terms" rows={4} defaultValue={q.terms} className="mt-1" /></label></div></section></div>
    <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
      <section className={CARD}><h2 className="!text-base">Currency, discount and tax</h2><div className="mt-3"><PricingFields p={p} set={setP} compact /></div></section>
      <section className={CARD}><h2 className="!text-base">Quotation summary</h2><div className="mt-3"><Summary p={p} /></div></section>
      <SubmitButton className="w-full !py-3">Save quotation</SubmitButton><Link href={`/admin/quotes/${id}`} className="block text-center text-sm text-[#6b6a66] underline">Cancel</Link></aside></form>;
}
