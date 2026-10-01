"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { submitQuote } from "@/app/(site)/request-a-quote/actions";
import { track } from "@/components/Analytics";
const steps = ["Contact", "Project", "Requirements", "Files & notes", "Review"] as const;
const inp = "mt-1.5 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-[15px] outline-none transition focus:border-ink focus:ring-4 focus:ring-yc/40";
const labels: Record<string, string> = { name: "Name", company: "Company", email: "Email", phone: "Phone / WhatsApp", country: "Country", quantity: "Quantity", unit: "Unit", deadline: "Delivery date", "details.material": "Material", "details.size": "Size", "details.colour": "Colour", "details.finish": "Finish / backing", message: "Notes" };
type Errs = Record<string, string[] | undefined>;
function F({ n, label, type = "text", req, err, hint, span }: { n: string; label: string; type?: string; req?: boolean; err?: string[]; hint?: string; span?: boolean }) {
  return <label className={`block ${span ? "md:col-span-2" : ""}`}><span className="text-sm font-medium">{label}{req && <span className="text-red-600"> *</span>}</span>
    <input name={n} type={type} required={req} aria-invalid={!!err} className={inp} />{hint && <span className="mt-1 block text-xs text-stone">{hint}</span>}
    {err && <span role="alert" className="mt-1 block text-sm text-red-700">{err[0]}</span>}</label>;
}
export default function QuoteForm({ product }: { product?: { id: string; name: string } | null }) {
  const [state, action, pending] = useActionState(submitQuote, null); const [step, setStep] = useState(0); const [sum, setSum] = useState<[string, string][]>([]); const form = useRef<HTMLFormElement>(null);
  const e: Errs = state && "errors" in state ? (state.errors as Errs) ?? {} : {};
  useEffect(() => { if (state?.ok) track("quote_form_completed", { mode: product ? "product" : "general" }); if (state && "errors" in state) setStep(0); }, [state, product]);
  if (state?.ok) return <div role="status" className="rounded-3xl border border-line bg-white p-8 md:p-12 shadow-sm">
    <div className="grid size-12 place-items-center rounded-full bg-yc"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l5 5 9-10"/></svg></div>
    <h2 className="mt-6 text-3xl font-semibold">Thank you. Your project has been received.</h2><p className="mt-3 text-stone">Keep this reference number for any follow-up.</p>
    <p className="mt-4 inline-block rounded-lg bg-paper px-4 py-2 text-lg font-semibold tracking-wide">{state.reference}</p><p className="mt-4 text-sm text-stone">Submitted {new Date().toLocaleDateString()}</p></div>;
  const next = () => { const f = form.current!; const fs = f.querySelectorAll("fieldset")[step];
    if (![...fs.querySelectorAll<HTMLInputElement>("input,textarea,select")].every(i => i.reportValidity())) return;
    if (step === 0) track("quote_form_started");
    if (step === 3) { const fd = new FormData(f); setSum(Object.keys(labels).map(k => [labels[k], String(fd.get(k) ?? "")] as [string, string]).filter(([, v]) => v)); }
    setStep(step + 1); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const show = (i: number) => `${step === i ? "grid" : "hidden"} md:grid-cols-2 gap-5`;
  return <form ref={form} action={action} className="rounded-3xl border border-line bg-white p-6 md:p-10 shadow-sm">
    <ol aria-label="Progress" className="mb-10 flex items-center">{steps.map((s, i) => <li key={s} className="flex flex-1 items-center last:flex-none" aria-current={i === step ? "step" : undefined}>
      <span className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold ${i < step ? "bg-ink text-paper" : i === step ? "bg-yc ring-4 ring-yc/30" : "bg-paper text-stone"}`}>{i < step ? "✓" : i + 1}</span>
      <span className={`ml-2 hidden text-sm md:inline ${i === step ? "font-semibold" : "text-stone"}`}>{s}</span>{i < steps.length - 1 && <span className={`mx-3 h-px flex-1 ${i < step ? "bg-ink" : "bg-line"}`} />}</li>)}</ol>
    <input type="hidden" name="mode" value={product ? "product" : "general"} />{product && <input type="hidden" name="productId" value={product.id} />}
    <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
    {product && <p className="mb-6 rounded-xl bg-paper px-4 py-3 text-sm">Requesting a quote for <b>{product.name}</b></p>}
    {state && "errors" in state && <p role="alert" className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">Please check the highlighted fields.</p>}
    <fieldset className={show(0)}><legend className="mb-5 text-2xl font-semibold md:col-span-2">Who are we quoting for?</legend>
      <F n="name" label="Full name" req err={e.name} /><F n="company" label="Company" req err={e.company} /><F n="email" label="Business email" type="email" req err={e.email} /><F n="phone" label="Phone / WhatsApp" req err={e.phone} /><F n="country" label="Country" req err={e.country} /><F n="jobTitle" label="Job title" /></fieldset>
    <fieldset className={show(1)}><legend className="mb-5 text-2xl font-semibold md:col-span-2">Tell us about the project</legend>
      <F n="quantity" label="Quantity" type="number" /><F n="unit" label="Unit" hint="pcs, sets, rolls…" /><F n="deadline" label="Required delivery date" type="date" span /></fieldset>
    <fieldset className={show(2)}><legend className="mb-5 text-2xl font-semibold md:col-span-2">Product requirements</legend><p className="text-sm text-stone md:col-span-2">Not sure? Write “Need guidance” and we'll help you choose.</p>
      <F n="details.material" label="Material" /><F n="details.size" label="Size" /><F n="details.colour" label="Colour" /><F n="details.finish" label="Finish / backing" /></fieldset>
    <fieldset className={show(3)}><legend className="mb-5 text-2xl font-semibold md:col-span-2">Files and notes</legend>
      <label className="block md:col-span-2"><span className="text-sm font-medium">Artwork</span><input type="file" name="files" multiple accept=".ai,.eps,.pdf,.svg,.png,.jpg,.jpeg,.zip" className="mt-1.5 block w-full rounded-lg border border-dashed border-line bg-paper p-4 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-paper" /><span className="mt-1 block text-xs text-stone">AI, EPS, PDF, SVG, PNG, JPG or ZIP, up to 4 MB each.</span></label>
      <label className="block md:col-span-2"><span className="text-sm font-medium">Notes</span><textarea name="message" rows={4} className={inp} /></label>
      <label className="flex gap-3 text-sm md:col-span-2"><input type="checkbox" name="consent" required className="mt-1 size-4 accent-black" /><span>I agree to Yellow Code contacting me about this request.</span></label>
      {e.consent && <p role="alert" className="text-sm text-red-700 md:col-span-2">{e.consent[0]}</p>}</fieldset>
    <fieldset className={`${step === 4 ? "block" : "hidden"}`}><legend className="mb-5 text-2xl font-semibold">Review your request</legend>
      <dl className="divide-y divide-line rounded-xl border border-line">{sum.map(([k, v]) => <div key={k} className="grid grid-cols-3 gap-4 px-4 py-3 text-sm"><dt className="text-stone">{k}</dt><dd className="col-span-2 break-words">{v}</dd></div>)}</dl>
      {state && "error" in state && <p role="alert" className="mt-4 text-sm text-red-700">{state.error}</p>}</fieldset>
    <div className="mt-10 flex items-center justify-between">{step > 0 ? <button type="button" onClick={() => setStep(step - 1)} className="rounded-full border border-line px-6 py-3 text-sm font-semibold hover:border-ink">Back</button> : <span />}
      {step < 4 ? <button type="button" onClick={next} className="rounded-full bg-ink px-8 py-3 text-sm font-semibold text-paper hover:bg-ink/85">Continue</button>
        : <button disabled={pending} className="rounded-full bg-yc px-8 py-3 text-sm font-semibold hover:brightness-95 disabled:opacity-60">{pending ? "Sending…" : "Submit quote request"}</button>}</div></form>;
}
