"use server";
import { z } from "zod"; import { db } from "@/lib/db"; import { sendMail, esc } from "@/lib/mail";
const s = z.object({ name: z.string().min(2).max(120), email: z.string().email(), phone: z.string().max(40).optional(), message: z.string().min(10).max(5000), website: z.string().max(0).optional() });
export async function sendContact(_: unknown, fd: FormData) {
  const p = s.safeParse(Object.fromEntries(fd)); if (!p.success) return { ok: false as const, error: "Please check your name, email and a message of at least 10 characters." };
  const { website, ...d } = p.data; await db.contactMessage.create({ data: d });
  if (process.env.SALES_EMAIL) await sendMail(process.env.SALES_EMAIL, "New contact message", `<p>${esc(d.name)} (${esc(d.email)})</p><p>${esc(d.message)}</p>`);
  return { ok: true as const };
}
