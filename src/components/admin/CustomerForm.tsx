"use client";
import { useActionState } from "react"; import Link from "next/link"; import SubmitButton from "@/components/admin/SubmitButton";
type C = { company: string; name: string; email: string; phone: string; country: string; address: string; taxId: string };
const F = ({ n, l, v, t = "text", r }: { n: string; l: string; v: string; t?: string; r?: boolean }) => <label className="block text-sm">{l}{r && <span className="text-red-600"> *</span>}<input name={n} type={t} defaultValue={v} required={r} className="mt-1" /></label>;
export default function CustomerForm({ c, action }: { c: C; action: (p: { error?: string } | null, fd: FormData) => Promise<{ error?: string } | null> }) {
  const [state, formAction] = useActionState(action, null);
  return <form action={formAction} className="max-w-3xl rounded-2xl border border-[#e7e0d2] bg-white p-6">{state?.error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{state.error}</p>}
    <div className="grid gap-4 sm:grid-cols-2"><F n="company" l="Company" v={c.company} r /><F n="name" l="Contact person" v={c.name} r /><F n="email" l="Email" v={c.email} t="email" r /><F n="phone" l="Phone" v={c.phone} /><F n="country" l="Country" v={c.country} /><F n="taxId" l="BIN / VAT / Tax ID" v={c.taxId} />
      <label className="block text-sm sm:col-span-2">Address<textarea name="address" rows={3} defaultValue={c.address} className="mt-1" /></label></div>
    <div className="mt-6 flex items-center gap-4"><SubmitButton>Save customer</SubmitButton><Link href="/admin/customers" className="text-sm underline">Cancel</Link></div></form>;
}
