import SubmitButton from "@/components/admin/SubmitButton";
import { db } from "@/lib/db"; import { toggleMessage } from "../actions";
export default async function M() { const ms = await db.contactMessage.findMany({ orderBy:{createdAt:"desc"}, take:100 });
  return <><h1 className="text-3xl font-bold">Contact messages</h1>{ms.length===0&&<p className="mt-6 text-stone">No messages yet.</p>}<ul className="mt-6 space-y-4">{ms.map(m=><li key={m.id} className="border border-line p-4 text-sm"><b>{m.name}</b> · {m.email}{m.phone&&` · ${m.phone}`} <span className="text-stone">{m.createdAt.toLocaleString()}</span><p className="mt-2 whitespace-pre-line">{m.message}</p>
    <form action={toggleMessage.bind(null,m.id,!m.handled)}><SubmitButton className="mt-2 underline">{m.handled?"Mark unhandled":"Mark handled"}</SubmitButton></form></li>)}</ul></>; }
