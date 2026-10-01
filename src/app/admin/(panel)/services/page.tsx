import SubmitButton from "@/components/admin/SubmitButton";
import Link from "next/link"; import { db } from "@/lib/db"; import { createService } from "../actions";
export default async function S() { const rows = await db.service.findMany({ orderBy:{sortOrder:"asc"} });
  return <><h1 className="text-3xl font-bold">Services</h1><form action={createService} className="mt-6 flex gap-2"><input name="name" required placeholder="Service name" className="rounded-lg border border-line bg-white px-3 py-2 outline-none focus:border-ink"/><SubmitButton className="rounded-full bg-ink text-paper px-4">Create draft</SubmitButton></form>
    <ul className="mt-6 space-y-2 text-sm">{rows.map(r=><li key={r.id}><Link className="underline" href={`/admin/services/${r.id}`}>{r.name}</Link> <span className="text-stone">{r.status}</span></li>)}</ul></>; }
