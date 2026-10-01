import FileInput from "@/components/admin/FileInput";
import Badge from "@/components/admin/Badge";
import SubmitButton from "@/components/admin/SubmitButton";
import { db } from "@/lib/db"; import { saveClient, toggleClient } from "../actions";
export default async function C() { const cs = await db.client.findMany({ orderBy:{sortOrder:"asc"} }); const I="rounded-lg border border-line bg-white px-3 py-2 outline-none focus:border-ink";
  return <><h1 className="text-3xl font-bold">Clients</h1><p className="mt-2 text-sm text-stone">Only add clients that have agreed to be shown.</p>
    <form action={saveClient} className="mt-6 flex flex-wrap gap-2 items-end"><input name="name" required placeholder="Client name" className={I}/><input name="website" type="url" placeholder="Website" className={I}/><input name="industry" placeholder="Industry" className={I}/><FileInput name="logo" accept="image/png,image/jpeg,image/webp,image/svg+xml" /><SubmitButton className="rounded-full bg-ink text-paper px-4 py-2">Add (hidden)</SubmitButton></form>
    <table className="mt-6 w-full text-sm"><tbody>{cs.map(c=><tr key={c.id} className="border-t border-line"><td className="py-2">{c.name}</td><td>{c.industry}</td><td><Badge s={c.published?"PUBLISHED":"HIDDEN"}/></td><td><form action={toggleClient.bind(null,c.id,!c.published)}><SubmitButton className="underline">{c.published?"Hide":"Publish"}</SubmitButton></form></td></tr>)}</tbody></table></>; }
