import SubmitButton from "@/components/admin/SubmitButton";
import SearchSelect from "@/components/SearchSelect";
import { notFound } from "next/navigation"; import { db } from "@/lib/db"; import { updateService } from "../../actions";
export default async function E({ params }:{params:Promise<{id:string}>}) { const { id } = await params; const s = await db.service.findUnique({ where:{id} }); if(!s) notFound(); const I="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 outline-none focus:border-ink";
  return <form action={updateService.bind(null,id)} className="max-w-2xl space-y-4"><h1 className="text-3xl font-bold">{s.name}</h1>
    <label className="block text-sm">Name<input name="name" defaultValue={s.name} required className={I}/></label><label className="block text-sm">Short description<textarea name="description" defaultValue={s.description??""} rows={2} className={I}/></label>
    <label className="block text-sm">Details (## Heading, - list, **bold**, [text](https://link))<textarea name="body" defaultValue={s.body??""} rows={10} className={I}/></label><label className="block text-sm">SEO title<input name="seoTitle" defaultValue={s.seoTitle??""} className={I}/></label><label className="block text-sm">SEO description<textarea name="seoDescription" defaultValue={s.seoDescription??""} rows={2} className={I}/></label>
    <label className="block text-sm">Status<SearchSelect name="status" defaultValue={s.status} options={["DRAFT","PUBLISHED","ARCHIVED"].map(x=>({value:x,label:x}))}/></label><label className="block text-sm">Sort order<input type="number" name="sortOrder" defaultValue={s.sortOrder} className={I}/></label>
    <SubmitButton className="rounded-full bg-ink text-paper px-6 py-2.5">Save</SubmitButton></form>; }
