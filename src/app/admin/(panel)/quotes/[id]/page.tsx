import SubmitButton from "@/components/admin/SubmitButton";
import SearchSelect from "@/components/SearchSelect";
import { Fragment } from "react"; import { notFound } from "next/navigation"; import { db, quoteRef } from "@/lib/db"; import { setQuoteStatus, addQuoteNote } from "../../actions";
const QS = ["NEW","REVIEWING","CONTACTED","QUOTED","SAMPLE_REQUESTED","SAMPLE_SENT","APPROVED","PRODUCTION","COMPLETED","CANCELLED"];
export default async function Q({ params }:{params:Promise<{id:string}>}) { const { id } = await params;
  const r = await db.quoteRequest.findUnique({ where:{id}, include:{ items:true, attachments:true, notes:{include:{author:true},orderBy:{createdAt:"desc"}} } }); if(!r) notFound();
  const rows: [string, unknown][] = [["Name",r.name],["Company",r.company],["Email",r.email],["Phone",r.phone],["Country",r.country],["Product",r.items.map(i=>i.productName).join(", ")||"General request"],["Quantity",r.quantity&&`${r.quantity} ${r.unit??""}`],["Deadline",r.deadline?.toLocaleDateString()],["Requirements",r.details&&JSON.stringify(r.details)],["Message",r.message]];
  return <><h1 className="text-3xl font-bold">{quoteRef(r.seq,r.createdAt)}</h1>
    <form action={setQuoteStatus.bind(null,id)} className="mt-4 flex gap-2"><SearchSelect name="status" defaultValue={r.status} options={QS.map(x=>({value:x,label:x}))}/><SubmitButton className="rounded-full bg-ink text-paper px-4">Update status</SubmitButton></form>
    <dl className="mt-6 grid grid-cols-[10rem_1fr] gap-y-2 text-sm">{rows.filter(([,v])=>v).map(([k,v])=><Fragment key={k}><dt className="text-stone">{k}</dt><dd>{String(v)}</dd></Fragment>)}</dl>
    {r.attachments.length>0&&<ul className="mt-4">{r.attachments.map(a=><li key={a.id}><a className="underline" href={a.url}>{a.fileName}</a></li>)}</ul>}
    <h2 className="mt-10 text-xl font-bold">Internal notes</h2><form action={addQuoteNote.bind(null,id)} className="mt-2 flex gap-2"><input name="body" required className="flex-1 rounded-lg border border-line bg-white px-3 py-2 outline-none focus:border-ink"/><SubmitButton className="rounded-full bg-yc px-4 font-semibold">Add note</SubmitButton></form>
    <ul className="mt-4 space-y-2 text-sm">{r.notes.map(n=><li key={n.id}><b>{n.author.name}</b> <span className="text-stone">{n.createdAt.toLocaleString()}</span><br/>{n.body}</li>)}</ul></>; }
