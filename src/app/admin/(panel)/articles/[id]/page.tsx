import SubmitButton from "@/components/admin/SubmitButton";
import SearchSelect from "@/components/SearchSelect";
import { notFound } from "next/navigation"; import { db } from "@/lib/db"; import { updateArticle } from "../../actions";
export default async function E({ params }:{params:Promise<{id:string}>}) { const { id } = await params; const a = await db.article.findUnique({ where:{id} }); if(!a) notFound(); const I="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 outline-none focus:border-ink";
  return <form action={updateArticle.bind(null,id)} className="max-w-2xl space-y-4"><h1 className="text-3xl font-bold">{a.title}</h1>
    <label className="block text-sm">Title<input name="title" defaultValue={a.title} required className={I}/></label><label className="block text-sm">Excerpt<textarea name="excerpt" defaultValue={a.excerpt??""} rows={2} className={I}/></label>
    <label className="block text-sm">Content (formatting: ## Heading, - list item, **bold**, [text](https://link); blank line = new paragraph)<textarea name="content" defaultValue={a.content} rows={14} className={I}/></label><label className="block text-sm">Author<input name="author" defaultValue={a.author??""} className={I}/></label>
    <label className="block text-sm">SEO title<input name="seoTitle" defaultValue={a.seoTitle??""} className={I}/></label><label className="block text-sm">SEO description<textarea name="seoDescription" defaultValue={a.seoDescription??""} rows={2} className={I}/></label>
    <label className="block text-sm">Status<SearchSelect name="status" defaultValue={a.status} options={["DRAFT","PUBLISHED","ARCHIVED"].map(x=>({value:x,label:x}))}/></label><SubmitButton className="rounded-full bg-ink text-paper px-6 py-2.5">Save</SubmitButton></form>; }
