import Badge from "@/components/admin/Badge";
import SubmitButton from "@/components/admin/SubmitButton";
import { db } from "@/lib/db"; import { saveCategory, setStatus } from "../actions";
export default async function C() { const cs = await db.category.findMany({ orderBy:{sortOrder:"asc"} });
  return <><h1 className="text-3xl font-bold">Categories</h1>
    <form action={saveCategory} className="mt-6 flex gap-2"><input name="name" required placeholder="Category name" className="rounded-lg border border-line bg-white px-3 py-2 outline-none focus:border-ink"/><input name="description" placeholder="Description" className="flex-1 rounded-lg border border-line bg-white px-3 py-2 outline-none focus:border-ink"/><SubmitButton className="rounded-full bg-ink text-paper px-4">Create draft</SubmitButton></form>
    <table className="mt-6 w-full text-sm"><tbody>{cs.map(c=><tr key={c.id} className="border-t border-line"><td className="py-2">{c.name}</td><td><Badge s={c.status}/></td><td><form action={setStatus.bind(null,"category",c.id,c.status==="PUBLISHED"?"DRAFT":"PUBLISHED")}><SubmitButton className="underline">{c.status==="PUBLISHED"?"Unpublish":"Publish"}</SubmitButton></form></td></tr>)}</tbody></table></>; }
