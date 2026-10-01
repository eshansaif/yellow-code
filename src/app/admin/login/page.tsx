import { signIn } from "@/auth"; import { redirect } from "next/navigation"; import { AuthError } from "next-auth";
export const metadata = { title: "Admin sign in", robots: { index: false } };
export default async function Login({ searchParams }:{searchParams:Promise<{error?:string}>}) { const { error } = await searchParams;
  async function go(fd: FormData) { "use server";
    try { await signIn("credentials", { email: fd.get("email"), password: fd.get("password"), redirectTo: "/admin" }); }
    catch (e) { if (e instanceof AuthError) redirect("/admin/login?error=1"); throw e; } }
  return <main className="min-h-screen grid place-items-center"><form action={go} className="w-80 space-y-4">
    <img src="/logo.png" alt="Yellow Code Trims" className="h-10 mb-6"/><h1 className="text-2xl font-bold">Admin sign in</h1>
    {error && <p role="alert" className="text-red-700 text-sm">Email or password is incorrect.</p>}
    <label className="block text-sm">Email<input name="email" type="email" required className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 outline-none focus:border-ink"/></label>
    <label className="block text-sm">Password<input name="password" type="password" required className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 outline-none focus:border-ink"/></label>
    <button className="w-full bg-ink text-paper py-2.5">Sign in</button></form></main>; }
