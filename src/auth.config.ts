import type { NextAuthConfig } from "next-auth";
// Edge-safe part (no Prisma/bcrypt) so middleware can run on Vercel Edge.
export default {
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 }, pages: { signIn: "/admin/login" }, providers: [],
  callbacks: {
    jwt: ({ token, user }) => { if (user) { token.role = (user as { role?: string }).role; token.uid = user.id; } return token; },
    session: ({ session, token }) => { const u = session.user as unknown as Record<string, unknown>; u.role = token.role; u.id = token.uid; return session; },
  },
} satisfies NextAuthConfig;
