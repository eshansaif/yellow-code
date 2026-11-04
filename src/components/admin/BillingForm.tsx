"use client";
import { useActionState } from "react"; import { useState } from "react"; import SubmitButton from "@/components/admin/SubmitButton"; import SearchSelect from "@/components/SearchSelect";
export type BillRow = { id: string; ref: string; company: string; trade: "LOCAL" | "IMPORT"; total: string; orderDate: string; deliveryDate: string };
const PER = 20;
export default function BillingForm({ rows, action, canBill }: { rows: BillRow[]; action: (fd: FormData) => Promise<{ error?: string } | null | undefined | void>; canBill: boolean }) {
  const [sel, setSel] = useState<Set<string>>(new Set()); const [q, setQ] = useState(""); const [type, setType] = useState(""); const [pn, setPn] = useState(1);
  // Surface action errors inline (e.g. "Select at least one sales order.") instead of the generic
  // error boundary. Redirect errors (NEXT_*) must pass through untouched.
  const [st, formAction] = useActionState(async (prev: { error?: string } | null, fd: FormData) => {
    try { const r = await action(fd); if (r && typeof r === "object" && "error" in r && r.error) return { error: r.error }; return null; }
    catch (e) { const d = (e as { digest?: unknown })?.digest; if (typeof d === "string" && d.startsWith("NEXT_")) throw e; return { error: e instanceof Error ? e.message : "Something went wrong. Please try again." }; }
  }, null);
  const filtered = rows.filter(r => (!type || r.trade === type) && (!q || `${r.company} ${r.ref}`.toLowerCase().includes(q.toLowerCase()))); const pages = Math.max(1, Math.ceil(filtered.length / PER)); const cur = Math.min(pn, pages); const view = filtered.slice((cur - 1) * PER, cur * PER);
  const all = filtered.length > 0 && filtered.every(r => sel.has(r.id)); const hidden = [...sel].filter(id => !view.some(v => v.id === id)); const imports = rows.filter(r => sel.has(r.id) && r.trade === "IMPORT");
  const toggle = (id: string) => setSel(p => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  if (!rows.length) return <p className="mt-6 text-stone">Nothing to bill. Every active sales order has been billed.</p>;
  return <form action={formAction} className="mt-6">
    {st?.error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{st.error}</p>}
    <div className="mb-4 flex flex-wrap items-end gap-3"><input value={q} onChange={e => { setQ(e.target.value); setPn(1); }} placeholder="Search customer or order" aria-label="Search" className="min-w-[14rem] flex-1" /><div className="min-w-[11rem]"><SearchSelect name="_type" placeholder="Type" defaultValue="" onChange={v => { setType(v); setPn(1); }} options={[{ value: "", label: "All (Type)" }, { value: "LOCAL", label: "Local" }, { value: "IMPORT", label: "Import" }]} /></div></div>
    {hidden.map(id => <input key={id} type="hidden" name="orderIds" value={id} />)}
    <div className="adm-scroll"><table><thead><tr><th className="w-10">{canBill && <input type="checkbox" aria-label="Select all filtered orders" checked={all} onChange={() => setSel(p => { const n = new Set(p); filtered.forEach(r => (all ? n.delete(r.id) : n.add(r.id))); return n; })} />}</th><th>Order</th><th>Customer</th><th>Type</th><th>Order date</th><th>Delivery</th><th className="text-right">Total</th></tr></thead>
      <tbody>{view.map(r => <tr key={r.id}><td>{canBill && <input type="checkbox" name="orderIds" value={r.id} aria-label={`Select ${r.ref}`} checked={sel.has(r.id)} onChange={() => toggle(r.id)} />}</td><td>{r.ref}</td><td>{r.company}</td><td>{r.trade === "IMPORT" ? "Import (proforma)" : "Local"}</td><td>{r.orderDate}</td><td>{r.deliveryDate}</td><td className="text-right">{r.total}</td></tr>)}</tbody></table></div>
    {filtered.length === 0 && <p className="mt-4 text-stone">No orders match.</p>}
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm"><span className="text-stone">{filtered.length} order(s) · page {cur} of {pages} · {sel.size} selected</span><span className="flex gap-2"><button type="button" disabled={cur <= 1} onClick={() => setPn(cur - 1)} className="opacity-90 disabled:opacity-40">Previous</button><button type="button" disabled={cur >= pages} onClick={() => setPn(cur + 1)} className="disabled:opacity-40">Next</button></span></div>
    {imports.length > 0 && <section className="mt-6 rounded-2xl border border-line bg-white p-4"><h2>Import details (optional)</h2>{imports.map(r => <div key={r.id} className="mt-3"><p className="text-sm font-medium">{r.ref} · {r.company}</p><div className="mt-1 grid gap-2 sm:grid-cols-2 lg:grid-cols-4"><input name={`lc_${r.id}`} placeholder="L/C number" /><input name={`pol_${r.id}`} placeholder="Port of loading" /><input name={`pod_${r.id}`} placeholder="Port of discharge" /><input name={`inco_${r.id}`} maxLength={10} placeholder="Incoterm (e.g. FOB)" /></div></div>)}</section>}
    {canBill ? <div className="mt-6 flex flex-wrap items-end gap-3"><label className="block text-sm">Due date (optional, applies to all)<input name="dueDate" type="date" /></label>{sel.size === 0 ? <button type="button" disabled className="opacity-50">Select orders to bill</button> : <SubmitButton>Generate bills for {sel.size} order{sel.size > 1 ? "s" : ""}</SubmitButton>}</div> : <p className="mt-4 text-sm text-stone">Only Admin or Accounts can generate bills.</p>}</form>;
}
