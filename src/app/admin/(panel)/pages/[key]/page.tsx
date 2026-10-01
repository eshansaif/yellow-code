import SubmitButton from "@/components/admin/SubmitButton";
import { notFound } from "next/navigation"; import { db } from "@/lib/db"; import { savePage } from "../../actions";
export default async function E({ params }:{params:Promise<{key:string}>}) { const { key } = await params; if(!["about","capabilities","sustainability"].includes(key)) notFound();
  const r = await db.pageContent.findUnique({ where:{key} }); const d = (r?.data ?? {title:key,sections:[]}) as {title:string;intro?:string;sections:{heading:string;body:string}[]}; const I="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 outline-none focus:border-ink";
  return <form action={savePage.bind(null,key)} className="max-w-2xl space-y-4"><h1 className="text-3xl font-bold capitalize">{key} page</h1>
    <label className="block text-sm">Title<input name="title" defaultValue={d.title} required className={I}/></label><label className="block text-sm">Introduction<textarea name="intro" defaultValue={d.intro} rows={3} className={I}/></label>
    <label className="block text-sm">Sections. First line is the heading, the rest is the text. Separate sections with a line containing only ---<textarea name="sections" rows={16} defaultValue={d.sections.map(s=>`${s.heading}\n${s.body}`).join("\n---\n")} className={I}/></label>
    <SubmitButton className="rounded-full bg-ink text-paper px-6 py-2.5">Save page</SubmitButton></form>; }
