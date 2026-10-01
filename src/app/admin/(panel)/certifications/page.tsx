import FileInput from "@/components/admin/FileInput";
import Badge from "@/components/admin/Badge";
import SubmitButton from "@/components/admin/SubmitButton";
import { db } from "@/lib/db"; import { createCert, toggleCert } from "../actions";
export default async function C() { const cs = await db.certification.findMany(); const I = "rounded-lg border border-line bg-white px-3 py-2 outline-none focus:border-ink";
  return <><h1 className="text-3xl font-bold">Certifications</h1><p className="mt-2 text-sm text-stone">Add only certifications Yellow Code actually holds. They appear on the About page once published.</p>
    <form action={createCert} className="mt-6 flex flex-wrap gap-2 items-end"><input name="name" required placeholder="Certification name" className={I}/><input name="issuer" placeholder="Issuer" className={I}/><FileInput name="file" accept="image/png,image/jpeg,image/webp" /><SubmitButton className="rounded-full bg-ink text-paper px-4 py-2">Add (hidden)</SubmitButton></form>
    <table className="mt-6 w-full text-sm"><tbody>{cs.map(c => <tr key={c.id} className="border-t border-line"><td className="py-2">{c.name}</td><td>{c.issuer}</td><td><Badge s={c.published?"PUBLISHED":"HIDDEN"}/></td><td><form action={toggleCert.bind(null, c.id, !c.published)}><SubmitButton className="underline">{c.published ? "Hide" : "Publish"}</SubmitButton></form></td></tr>)}</tbody></table></>; }
