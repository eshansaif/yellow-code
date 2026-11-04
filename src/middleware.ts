import NextAuth from "next-auth"; import authConfig from "./auth.config";
const { auth } = NextAuth(authConfig);
export default auth((req) => { const p = req.nextUrl.pathname;
  if (p.startsWith("/admin") && p !== "/admin/login" && !req.auth) return Response.redirect(new URL("/admin/login", req.nextUrl)); });
export const config = { matcher: ["/admin/:path*"] };
