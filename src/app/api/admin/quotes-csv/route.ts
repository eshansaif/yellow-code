import { db, quoteRef } from "@/lib/db"; import { requireAdmin } from "@/auth";
const esc = (v: unknown) => { let s = String(v ?? ""); if (/^[=+\-@]/.test(s)) s = "'" + s; return `"${s.replace(/"/g,'""')}"`; }; // blocks CSV formula injection
export async function GET() { try { await requireAdmin(["ADMIN","SALES"]); } catch { return new Response("Unauthorized", { status: 401 }); }
  const rows = await db.quoteRequest.findMany({ orderBy: { createdAt: "desc" }, include: { items: true } });
  const csv = ["Reference,Status,Name,Company,Email,Phone,Country,Product,Quantity,Received", ...rows.map(r=>[quoteRef(r.seq,r.createdAt),r.status,r.name,r.company,r.email,r.phone,r.country,r.items[0]?.productName,r.quantity,r.createdAt.toISOString()].map(esc).join(","))].join("\n");
  return new Response(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=quotes.csv" } }); }
