import FileInput from "@/components/admin/FileInput";
import SubmitButton from "@/components/admin/SubmitButton";
import SearchSelect from "@/components/SearchSelect";
import { notFound } from "next/navigation"; import { db } from "@/lib/db"; import { updateProduct, addProductImage, removeProductImage, attachMedia } from "../../actions";
const I = "mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 outline-none focus:border-ink"; 
export default async function Edit({ params }:{params:Promise<{id:string}>}) { const { id } = await params;
  const lib = await db.media.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  const [p, cats] = await Promise.all([db.product.findUnique({ where:{id}, include:{specs:{orderBy:{sortOrder:"asc"}},applications:true,options:{orderBy:{sortOrder:"asc"}},faqs:{orderBy:{sortOrder:"asc"}},images:{include:{media:true},orderBy:{sortOrder:"asc"}}} }), db.category.findMany({orderBy:{name:"asc"}})]);
  if (!p) notFound();
  return <div className="max-w-3xl"><h1 className="text-3xl font-bold">{p.name}</h1>
    <section className="mt-8"><h2 className="text-xl font-bold">Images</h2>
      <ul className="mt-3 grid grid-cols-4 gap-3">{p.images.map(i=><li key={i.id} className="text-xs"><img src={i.media.url} alt={i.media.alt} className="aspect-square w-full object-cover"/>{i.type}<form action={removeProductImage.bind(null,id,i.id)}><SubmitButton className="underline">Remove</SubmitButton></form></li>)}</ul>
      <form action={addProductImage.bind(null,id)} className="mt-4 flex flex-wrap gap-2 items-end"><FileInput name="file" accept="image/jpeg,image/png,image/webp,image/avif" required /><input name="alt" required minLength={3} placeholder="Alt text (describe the image)" className="rounded-lg border border-line bg-white px-3 py-2 outline-none focus:border-ink"/><input name="caption" placeholder="Caption" className="rounded-lg border border-line bg-white px-3 py-2 outline-none focus:border-ink"/><SearchSelect name="type" defaultValue="GALLERY" options={[{value:"GALLERY",label:"Gallery"},{value:"COVER",label:"Cover"}]}/><SubmitButton className="rounded-full bg-yc px-4 py-2 font-semibold">Upload</SubmitButton></form><form action={attachMedia.bind(null,id)} className="mt-4 flex gap-2"><SearchSelect name="mediaId" required placeholder="Reuse from media library…" options={lib.map(m=>({value:m.id,label:m.title||m.alt}))}/><SubmitButton className="rounded-full border border-ink px-4">Attach</SubmitButton></form></section>
    <form action={updateProduct.bind(null,id)} className="mt-10 space-y-5">
      <label className="block text-sm">Name<input name="name" defaultValue={p.name} required className={I}/></label>
      <label className="block text-sm">Category<SearchSelect name="categoryId" required defaultValue={p.categoryId} options={cats.map(c=>({value:c.id,label:c.name}))}/></label>
      <label className="block text-sm">Positioning statement<input name="tagline" defaultValue={p.tagline??""} className={I}/></label>
      <label className="block text-sm">Short description<textarea name="shortDescription" defaultValue={p.shortDescription??""} rows={2} className={I}/></label>
      <label className="block text-sm">Overview (formatting: ## Heading, - list item, **bold**, [text](https://link); blank line = new paragraph)<textarea name="longDescription" defaultValue={p.longDescription??""} rows={8} className={I}/></label>
      <label className="block text-sm">Specifications, one per line as “Label: value” (only filled rows are shown publicly)<textarea name="specs" defaultValue={p.specs.map(s=>`${s.label}: ${s.value}`).join("\n")} rows={5} className={I}/></label>
      <label className="block text-sm">Applications, one per line<textarea name="applications" defaultValue={p.applications.map(a=>a.name).join("\n")} rows={3} className={I}/></label>
      <label className="block text-sm">Customization options, one per line as “Name: value, value”<textarea name="options" defaultValue={p.options.map(o=>`${o.name}: ${o.values.join(", ")}`).join("\n")} rows={4} className={I}/></label>
      <label className="block text-sm">FAQ, one per line as “Question | Answer”<textarea name="faqs" defaultValue={p.faqs.map(f=>`${f.question} | ${f.answer}`).join("\n")} rows={4} className={I}/></label>
      <label className="block text-sm">SEO title<input name="seoTitle" defaultValue={p.seoTitle??""} maxLength={70} className={I}/></label>
      <label className="block text-sm">SEO description<textarea name="seoDescription" defaultValue={p.seoDescription??""} maxLength={170} rows={2} className={I}/></label>
      <label className="block text-sm">Sort order<input type="number" name="sortOrder" defaultValue={p.sortOrder} className={I}/></label>
      <label className="flex gap-2 text-sm"><input type="checkbox" name="featured" defaultChecked={p.featured}/> Featured product</label>
      <SubmitButton className="rounded-full bg-ink text-paper px-6 py-2.5">Save changes</SubmitButton></form></div>; }
