"use client";
import { useActionState } from "react"; import { sendContact } from "@/app/(site)/contact/actions";
export default function ContactForm() { const [s, a, pending] = useActionState(sendContact, null); const i = "mt-1 w-full rounded-lg rounded-lg border border-line bg-white px-3 py-2 outline-none focus:border-ink.5 outline-none focus:border-ink";
  if (s?.ok) return <p role="status" className="text-xl font-bold">Thank you. Your message has been received.</p>;
  return <form action={a} className="space-y-4 max-w-lg"><input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden/>
    <label className="block text-sm">Name *<input name="name" required className={i}/></label><label className="block text-sm">Email *<input name="email" type="email" required className={i}/></label>
    <label className="block text-sm">Phone<input name="phone" className={i}/></label><label className="block text-sm">Message *<textarea name="message" rows={5} required className={i}/></label>
    {s && !s.ok && <p role="alert" className="text-red-700 text-sm">{s.error}</p>}<button disabled={pending} className="rounded-full bg-ink text-paper px-6 py-3">{pending?"Sending…":"Send message"}</button></form>; }
