"use server";
import bcrypt from "bcryptjs"; import { HOME_SECTIONS } from "@/lib/home"; import { revalidatePath } from "next/cache"; import { z } from "zod"; import { db } from "@/lib/db"; import { requireAdmin } from "@/auth";
const slugify = (s: string) => s.toLowerCase().replace(/&/g,"and").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
const QS = ["NEW","REVIEWING","CONTACTED","QUOTED","SAMPLE_REQUESTED","SAMPLE_SENT","APPROVED","PRODUCTION","COMPLETED","CANCELLED"] as const;
export async function setQuoteStatus(id: string, fd: FormData) { await requireAdmin(["ADMIN","SALES"]);
  const status = z.enum(QS).parse(fd.get("status")); await db.quoteRequest.update({ where: { id }, data: { status } }); revalidatePath(`/admin/quotes/${id}`); }
export async function addQuoteNote(id: string, fd: FormData) { const s = await requireAdmin(["ADMIN","SALES"]);
  const body = z.string().min(1).max(5000).parse(fd.get("body")); await db.quoteNote.create({ data: { quoteId: id, body, authorId: (s.user as {id:string}).id } }); revalidatePath(`/admin/quotes/${id}`); }
export async function saveCategory(fd: FormData) { await requireAdmin(["ADMIN","EDITOR"]);
  const d = z.object({ name: z.string().min(2).max(100), description: z.string().max(500).optional() }).parse(Object.fromEntries(fd));
  await db.category.create({ data: { ...d, slug: slugify(d.name), status: "DRAFT" } }); revalidatePath("/admin/categories"); }
export async function saveProduct(fd: FormData) { await requireAdmin(["ADMIN","EDITOR"]);
  const d = z.object({ name: z.string().min(2).max(120), categoryId: z.string().min(1), shortDescription: z.string().max(500).optional() }).parse(Object.fromEntries(fd));
  await db.product.create({ data: { ...d, slug: slugify(d.name), status: "DRAFT" } }); revalidatePath("/admin/products"); }
export async function setStatus(kind: "product" | "category", id: string, status: "DRAFT"|"PUBLISHED"|"ARCHIVED") { await requireAdmin(["ADMIN","EDITOR"]);
  if (kind === "product") await db.product.update({ where: { id }, data: { status } }); else await db.category.update({ where: { id }, data: { status } });
  revalidatePath("/", "layout"); }

// ---- Product editor ----
const lines = (v: FormDataEntryValue | null) => String(v ?? "").split("\n").map(l => l.trim()).filter(Boolean);
export async function updateProduct(id: string, fd: FormData) { await requireAdmin(["ADMIN","EDITOR"]);
  const g = z.object({ name: z.string().min(2).max(120), categoryId: z.string().min(1), tagline: z.string().max(200).optional(), shortDescription: z.string().max(500).optional(),
    longDescription: z.string().max(20000).optional(), seoTitle: z.string().max(70).optional(), seoDescription: z.string().max(170).optional(), sortOrder: z.coerce.number().int().default(0) }).parse(Object.fromEntries(fd));
  const specs = lines(fd.get("specs")).map((l, i) => { const [label, ...v] = l.split(":"); return { label: label.trim(), value: v.join(":").trim(), sortOrder: i }; }).filter(s => s.label && s.value);
  const apps = lines(fd.get("applications")).map(name => ({ name }));
  const opts = lines(fd.get("options")).map((l, i) => { const [name, v = ""] = l.split(":"); return { name: name.trim(), values: v.split(",").map(x => x.trim()).filter(Boolean), sortOrder: i }; }).filter(o => o.name);
  const faqs = lines(fd.get("faqs")).map((l, i) => { const [question, ...a] = l.split("|"); return { question: question.trim(), answer: a.join("|").trim(), sortOrder: i }; }).filter(f => f.question && f.answer);
  await db.$transaction([
    db.productSpec.deleteMany({ where: { productId: id } }), db.productApplication.deleteMany({ where: { productId: id } }), db.productOption.deleteMany({ where: { productId: id } }), db.productFaq.deleteMany({ where: { productId: id } }),
    db.product.update({ where: { id }, data: { ...g, featured: fd.get("featured") === "on", specs: { create: specs }, applications: { create: apps }, options: { create: opts }, faqs: { create: faqs } } }),
  ]);
  revalidatePath("/", "layout"); }
const IMG = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export async function addProductImage(id: string, fd: FormData) { await requireAdmin(["ADMIN","EDITOR"]);
  const f = fd.get("file"); if (!(f instanceof File) || !IMG.includes(f.type) || f.size > 4 * 1024 * 1024) throw new Error("Use a JPG, PNG, WebP or AVIF under 4 MB.");
  const alt = z.string().min(3, "Alt text is required").max(200).parse(fd.get("alt"));
  const { uploadFile } = await import("@/lib/storage"); const u = await uploadFile(f, "yellowcode/products");
  const m = await db.media.create({ data: { url: u.secure_url, publicId: u.public_id, alt, caption: String(fd.get("caption") ?? "") || null, width: u.width, height: u.height, folder: "products" } });
  const n = await db.productImage.count({ where: { productId: id } });
  await db.productImage.create({ data: { productId: id, mediaId: m.id, type: String(fd.get("type")) === "COVER" ? "COVER" : "GALLERY", sortOrder: n } });
  revalidatePath(`/admin/products/${id}`); revalidatePath("/", "layout"); }
export async function removeProductImage(id: string, imageId: string) { await requireAdmin(["ADMIN","EDITOR"]);
  await db.productImage.delete({ where: { id: imageId } }); revalidatePath(`/admin/products/${id}`); revalidatePath("/", "layout"); }

// ---- Pages, settings, messages, clients ----
export async function savePage(key: string, fd: FormData) { await requireAdmin(["ADMIN","EDITOR"]);
  const d = z.object({ title: z.string().min(2).max(120), intro: z.string().max(1000).optional(), sections: z.string().max(30000) }).parse(Object.fromEntries(fd));
  const sections = d.sections.split(/\n---\n/).map(b => { const [h, ...r] = b.trim().split("\n"); return { heading: h.trim(), body: r.join("\n").trim() }; }).filter(s => s.heading);
  await db.pageContent.upsert({ where: { key }, update: { data: { title: d.title, intro: d.intro, sections } }, create: { key, data: { title: d.title, intro: d.intro, sections } } });
  revalidatePath(`/${key}`); revalidatePath("/admin/pages"); }
export async function saveContact(fd: FormData) { await requireAdmin(["ADMIN","EDITOR"]);
  const v = z.object({ office: z.string().max(500), factory: z.string().max(500), phone: z.string().max(100), email: z.string().max(200), hours: z.string().max(300) }).parse(Object.fromEntries(fd));
  await db.siteSetting.upsert({ where: { key: "contact" }, update: { value: v }, create: { key: "contact", value: v } }); revalidatePath("/contact"); }
export async function toggleMessage(id: string, handled: boolean) { await requireAdmin(["ADMIN","SALES"]); await db.contactMessage.update({ where: { id }, data: { handled } }); revalidatePath("/admin/messages"); }
export async function saveClient(fd: FormData) { await requireAdmin(["ADMIN","EDITOR"]);
  const d = z.object({ name: z.string().min(1).max(120), website: z.string().url().optional().or(z.literal("")), industry: z.string().max(80).optional() }).parse(Object.fromEntries(fd));
  let logoUrl: string | undefined; const f = fd.get("logo");
  if (f instanceof File && f.size > 0) { if (!["image/png","image/jpeg","image/webp","image/svg+xml"].includes(f.type) || f.size > 3e6) throw new Error("Logo must be PNG, JPG, WebP or SVG under 3 MB.");
    const { uploadFile } = await import("@/lib/storage"); logoUrl = (await uploadFile(f, "yellowcode/clients")).secure_url; }
  await db.client.create({ data: { ...d, website: d.website || null, logoUrl } }); revalidatePath("/admin/clients"); }
export async function toggleClient(id: string, published: boolean) { await requireAdmin(["ADMIN","EDITOR"]); await db.client.update({ where: { id }, data: { published } }); revalidatePath("/", "layout"); revalidatePath("/admin/clients"); }

// ---- Services, articles, users ----
export async function createService(fd: FormData) { await requireAdmin(["ADMIN","EDITOR"]); const name = z.string().min(2).max(100).parse(fd.get("name"));
  await db.service.create({ data: { name, slug: slugify(name) } }); revalidatePath("/admin/services"); }
export async function updateService(id: string, fd: FormData) { await requireAdmin(["ADMIN","EDITOR"]);
  const d = z.object({ name: z.string().min(2).max(100), description: z.string().max(500).optional(), body: z.string().max(20000).optional(), seoTitle: z.string().max(70).optional(), seoDescription: z.string().max(170).optional(), status: z.enum(["DRAFT","PUBLISHED","ARCHIVED"]), sortOrder: z.coerce.number().int().default(0) }).parse(Object.fromEntries(fd));
  await db.service.update({ where: { id }, data: d }); revalidatePath("/", "layout"); }
export async function createArticle(fd: FormData) { await requireAdmin(["ADMIN","EDITOR"]); const title = z.string().min(2).max(160).parse(fd.get("title"));
  await db.article.create({ data: { title, slug: slugify(title) + "-" + Date.now().toString(36).slice(-4), content: "" } }); revalidatePath("/admin/articles"); }
export async function updateArticle(id: string, fd: FormData) { await requireAdmin(["ADMIN","EDITOR"]);
  const d = z.object({ title: z.string().min(2).max(160), excerpt: z.string().max(400).optional(), content: z.string().max(60000), author: z.string().max(100).optional(), seoTitle: z.string().max(70).optional(), seoDescription: z.string().max(170).optional(), status: z.enum(["DRAFT","PUBLISHED","ARCHIVED"]) }).parse(Object.fromEntries(fd));
  const cur = await db.article.findUniqueOrThrow({ where: { id } });
  await db.article.update({ where: { id }, data: { ...d, publishedAt: d.status === "PUBLISHED" ? (cur.publishedAt ?? new Date()) : cur.publishedAt } }); revalidatePath("/", "layout"); }
export async function createUser(fd: FormData) { await requireAdmin(["ADMIN"]);
  const d = z.object({ name: z.string().min(2).max(100), email: z.string().email(), password: z.string().min(10).max(100), role: z.enum(["ADMIN","EDITOR","SALES"]) }).parse(Object.fromEntries(fd));
  await db.adminUser.create({ data: { name: d.name, email: d.email.toLowerCase(), role: d.role, passwordHash: await bcrypt.hash(d.password, 12) } }); revalidatePath("/admin/users"); }
export async function deleteUser(id: string) { const s = await requireAdmin(["ADMIN"]); if ((s.user as { id: string }).id === id) throw new Error("You can't delete yourself.");
  await db.adminUser.delete({ where: { id } }); revalidatePath("/admin/users"); }

// ---- Homepage, navigation, certifications, media ----
export async function saveHomepage(fd: FormData) { await requireAdmin(["ADMIN","EDITOR"]);
  const sections = HOME_SECTIONS.map(id => ({ id, enabled: fd.get(`on_${id}`) === "on", order: Number(fd.get(`order_${id}`) ?? 0) })).sort((a, b) => a.order - b.order).map(({ id, enabled }) => ({ id, enabled }));
  const hero = z.object({ headline: z.string().max(120), sub: z.string().max(300), cta1Label: z.string().max(40), cta1Url: z.string().max(200), cta2Label: z.string().max(40), cta2Url: z.string().max(200), closing: z.string().max(160) }).parse(Object.fromEntries(fd));
  const data = { sections, hero }; await db.pageContent.upsert({ where: { key: "home" }, update: { data }, create: { key: "home", data } }); revalidatePath("/"); }
const safeUrl = z.string().refine(u => u.startsWith("/") || u.startsWith("https://"), "Links must start with / or https://");
export async function saveSite(fd: FormData) { await requireAdmin(["ADMIN","EDITOR"]);
  const links = String(fd.get("links") ?? "").split("\n").map(l => l.trim()).filter(Boolean).map(l => { const [label, href] = l.split("|").map(x => x.trim()); return { label: z.string().min(1).max(40).parse(label), href: safeUrl.parse(href) }; });
  const v = { footerText: z.string().max(300).parse(fd.get("footerText") ?? ""), links }; await db.siteSetting.upsert({ where: { key: "site" }, update: { value: v }, create: { key: "site", value: v } }); revalidatePath("/", "layout"); }
export async function createCert(fd: FormData) { await requireAdmin(["ADMIN","EDITOR"]);
  const d = z.object({ name: z.string().min(2).max(120), issuer: z.string().max(120).optional() }).parse(Object.fromEntries(fd));
  let fileUrl: string | undefined; const f = fd.get("file");
  if (f instanceof File && f.size > 0) { if (!["image/png","image/jpeg","image/webp"].includes(f.type) || f.size > 4e6) throw new Error("Certificate image must be PNG, JPG or WebP under 4 MB.");
    const { uploadFile } = await import("@/lib/storage"); fileUrl = (await uploadFile(f, "yellowcode/certifications")).secure_url; }
  await db.certification.create({ data: { ...d, fileUrl } }); revalidatePath("/admin/certifications"); }
export async function toggleCert(id: string, published: boolean) { await requireAdmin(["ADMIN","EDITOR"]); await db.certification.update({ where: { id }, data: { published } }); revalidatePath("/", "layout"); revalidatePath("/admin/certifications"); }
export async function uploadMedia(fd: FormData) { await requireAdmin(["ADMIN","EDITOR"]);
  const f = fd.get("file"); if (!(f instanceof File) || !["image/jpeg","image/png","image/webp","image/avif"].includes(f.type) || f.size > 4e6) throw new Error("Use a JPG, PNG, WebP or AVIF under 4 MB.");
  const alt = z.string().min(3).max(200).parse(fd.get("alt")); const { uploadFile } = await import("@/lib/storage"); const u = await uploadFile(f, "yellowcode/library");
  await db.media.create({ data: { url: u.secure_url, publicId: u.public_id, alt, title: String(fd.get("title") ?? "") || null, caption: String(fd.get("caption") ?? "") || null, folder: "library", width: u.width, height: u.height } }); revalidatePath("/admin/media"); }
export async function deleteMedia(id: string) { await requireAdmin(["ADMIN","EDITOR"]);
  const m = await db.media.findUniqueOrThrow({ where: { id }, include: { images: true } }); if (m.images.length) throw new Error("This image is used by a product. Remove it there first.");
  const { deleteFile } = await import("@/lib/storage"); await deleteFile(m.publicId); await db.media.delete({ where: { id } }); revalidatePath("/admin/media"); }
export async function attachMedia(productId: string, fd: FormData) { await requireAdmin(["ADMIN","EDITOR"]);
  const mediaId = z.string().min(1).parse(fd.get("mediaId")); const n = await db.productImage.count({ where: { productId } });
  await db.productImage.create({ data: { productId, mediaId, sortOrder: n } }); revalidatePath(`/admin/products/${productId}`); revalidatePath("/", "layout"); }
