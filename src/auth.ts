import NextAuth from "next-auth"; import Credentials from "next-auth/providers/credentials"; import bcrypt from "bcryptjs"; import { z } from "zod"; import { db } from "@/lib/db"; import authConfig from "./auth.config";
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [Credentials({ async authorize(c) {
    const p = z.object({ email: z.string().email(), password: z.string().min(8) }).safeParse(c); if (!p.success) return null;
    const u = await db.adminUser.findUnique({ where: { email: p.data.email.toLowerCase() } });
    if (!u || !(await bcrypt.compare(p.data.password, u.passwordHash))) return null;
    return { id: u.id, email: u.email, name: u.name, role: u.role } as never; } })],
});
export async function requireAdmin(roles: string[] = ["ADMIN","EDITOR","SALES"]) {
  const s = await auth(); const r = (s?.user as { role?: string } | undefined)?.role;
  if (!s || !r || !roles.includes(r)) throw new Error("Unauthorized"); return s;
}
