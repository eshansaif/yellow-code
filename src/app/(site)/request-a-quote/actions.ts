"use server";
import { headers } from "next/headers";
import { db, quoteRef } from "@/lib/db";
import { uploadFile } from "@/lib/storage";
import { sendMail, esc } from "@/lib/mail";
import { quoteSchema, ALLOWED_MIME, MAX_FILE } from "@/lib/validators";

const hits = new Map<string, number[]>(); // swap for Upstash/Redis in production
function limited(ip: string) {
  const now = Date.now(), recent = (hits.get(ip) ?? []).filter(t => now - t < 600_000);
  recent.push(now); hits.set(ip, recent); return recent.length > 5;
}

export async function submitQuote(_: unknown, fd: FormData) {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (limited(ip)) return { ok: false as const, error: "Too many requests. Please try again in a few minutes." };
  const parsed = quoteSchema.safeParse(((raw) => ({ ...raw, details: Object.fromEntries(Object.entries(raw).filter(([k, v]) => k.startsWith("details.") && v).map(([k, v]) => [k.slice(8), String(v)])) }))(Object.fromEntries(fd)));
  if (!parsed.success) return { ok: false as const, errors: parsed.error.flatten().fieldErrors };
  const { productId, consent, website, ...data } = parsed.data;

  const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  for (const f of files) if (!ALLOWED_MIME.includes(f.type) || f.size > MAX_FILE)
    return { ok: false as const, error: `${f.name}: unsupported type or larger than 4 MB.` };

  const product = productId ? await db.product.findUnique({ where: { id: productId } }) : null;
  const q = await db.quoteRequest.create({ data: {
    ...data, items: product ? { create: { productId: product.id, productName: product.name } } : undefined,
  }});
  const ref = quoteRef(q.seq, q.createdAt);
  try {
    for (const f of files) { const u = await uploadFile(f, `yellowcode/quotes/${ref}`, "raw");
      await db.quoteAttachment.create({ data: { quoteId: q.id, url: u.secure_url, fileName: f.name, mime: f.type, size: f.size } }); }
  } catch { /* quote is saved; attachments can be re-requested */ }
  const summary = `<p>Reference: <b>${ref}</b></p><p>${esc(data.name)}, ${esc(data.company)} (${esc(data.country)})<br>Product: ${esc(product?.name ?? "General request")}<br>Quantity: ${esc(data.quantity ?? "-")}</p>`;
  await Promise.all([
    sendMail(data.email, `We received your request ${ref}`, `<h2>Thank you. Your project has been received.</h2>${summary}<p>Yellow Code Trims</p>`),
    process.env.SALES_EMAIL ? sendMail(process.env.SALES_EMAIL, `New quote ${ref}`, summary + `<p>${esc(data.message)}</p>`) : null,
  ]);
  return { ok: true as const, reference: ref };
}
