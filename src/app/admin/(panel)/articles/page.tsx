import SubmitButton from "@/components/admin/SubmitButton";
import Link from "next/link"; import { db } from "@/lib/db"; import { createArticle } from "../actions";
export default async function A() { const rows = await db.article.findMany({ orderBy:{id:"desc"} });
  return <><h1 className="text-3xl font-bold">Resources</h1><form action={createArticle} className="mt-6 flex gap-2"><input name="title" required placeholder="Article title" className="flex-1 rounded-lg border border-line bg-white px-3 py-2 outline-none focus:border-ink"/><SubmitButton className="rounded-full bg-ink text-paper px-4">Create draft</SubmitButton></form>
    <ul className="mt-6 space-y-2 text-sm">{rows.map(r=><li key={r.id}><Link className="underline" href={`/admin/articles/${r.id}`}>{r.title}</Link> <span className="text-stone">{r.status}</span></li>)}</ul></>; }
