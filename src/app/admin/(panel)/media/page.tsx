import FileInput from "@/components/admin/FileInput";
import SubmitButton from "@/components/admin/SubmitButton";
import { db } from "@/lib/db"; import { uploadMedia, deleteMedia } from "../actions";
export default async function M({ searchParams }: { searchParams: Promise<{ q?: string }> }) { const { q } = await searchParams; const I = "rounded-lg border border-line bg-white px-3 py-2 outline-none focus:border-ink";
  const ms = await db.media.findMany({ where: q ? { OR: [{ alt: { contains: q, mode: "insensitive" } }, { title: { contains: q, mode: "insensitive" } }] } : {}, orderBy: { createdAt: "desc" }, take: 80 });
  return <><h1 className="text-3xl font-bold">Media library</h1>
    <form action={uploadMedia} className="mt-6 flex flex-wrap gap-2 items-end"><FileInput name="file" accept="image/jpeg,image/png,image/webp,image/avif" required /><input name="alt" required minLength={3} placeholder="Alt text" className={I}/><input name="title" placeholder="Title" className={I}/><input name="caption" placeholder="Caption" className={I}/><SubmitButton className="rounded-full bg-yc px-4 py-2 font-semibold">Upload</SubmitButton></form>
    <form className="mt-4"><input name="q" defaultValue={q} placeholder="Search media" className={I}/></form>
    <ul className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">{ms.map(m => <li key={m.id} className="text-xs"><img src={m.url} alt={m.alt} loading="lazy" className="aspect-square w-full object-cover"/><p className="mt-1">{m.title || m.alt}</p><form action={deleteMedia.bind(null, m.id)}><SubmitButton className="underline">Delete</SubmitButton></form></li>)}</ul>{ms.length === 0 && <p className="mt-6 text-stone">No media yet.</p>}</>; }
