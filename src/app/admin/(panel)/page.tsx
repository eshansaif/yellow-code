import { db } from "@/lib/db";
export default async function Dash() {
  const [q, nq, pq, cm, p, c, s] = await Promise.all([db.quoteRequest.count(), db.quoteRequest.count({where:{status:"NEW"}}), db.quoteRequest.count({where:{status:{in:["REVIEWING","CONTACTED","QUOTED"]}}}), db.contactMessage.count({where:{handled:false}}), db.product.count(), db.category.count(), db.service.count()]);
  const stats = [["Quote requests",q],["New",nq],["In progress",pq],["Unhandled messages",cm],["Products",p],["Categories",c],["Services",s]];
  return <><h1 className="text-3xl font-bold">Dashboard</h1><dl className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">{stats.map(([l,n])=><div key={l as string} className="rounded-2xl border border-line bg-white p-5"><dt className="text-sm text-stone">{l}</dt><dd className="text-3xl font-bold">{n}</dd></div>)}</dl></>; }
