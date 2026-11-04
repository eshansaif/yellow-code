import Link from "next/link"; import { db } from "@/lib/db"; import FilterBar from "@/components/FilterBar"; import Pagination from "@/components/Pagination"; import Badge from "@/components/admin/Badge"; import SubmitButton from "@/components/admin/SubmitButton"; import { pg, ci, type SP } from "@/lib/list";
import { ToastForm } from "@/components/admin/ToastForm"; import { createService } from "../actions";
export default async function L({ searchParams }: { searchParams: Promise<SP> }) { const sp = await searchParams; const { page, skip, take } = pg(sp, 15);
  const where = { ...(sp.status ? { status: sp.status as never } : {}), ...(sp.q ? { name: ci(sp.q) } : {}) };
  const [total, rows] = await Promise.all([db.service.count({ where }), db.service.findMany({ where, orderBy: { id: "desc" }, skip, take })]);
  return <><h1>Services</h1><ToastForm action={createService} okMsg="Service draft created." className="mt-6 flex flex-wrap gap-2"><input name="name" required placeholder="Service name" /><SubmitButton>Create draft</SubmitButton></ToastForm>
    <div className="mt-6"><FilterBar placeholder="Search" fields={[{ name: "status", label: "Status", options: [{value:"DRAFT",label:"DRAFT"},{value:"PUBLISHED",label:"PUBLISHED"},{value:"ARCHIVED",label:"ARCHIVED"}] }]} /></div>
    <div className="adm-scroll mt-4"><table><thead><tr><th>Title</th><th>Status</th></tr></thead><tbody>{rows.map(r => <tr key={r.id}><td><Link className="underline" href={`/admin/services/${r.id}`}>{r.name}</Link></td><td><Badge s={r.status} /></td></tr>)}</tbody></table></div>
    {rows.length === 0 && <p className="mt-4 text-stone">Nothing found.</p>}<Pagination total={total} per={take} page={page} path="/admin/services" params={sp} /></>; }
