import { redirect } from "next/navigation"; import { auth, signOut } from "@/auth"; import AdminSidebar from "@/components/admin/AdminSidebar";
export const metadata = { robots: { index: false } };
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const s = await auth(); if (!s) redirect("/admin/login");
  const u = s.user as { name?: string | null; role?: string };
  return <div className="adm min-h-screen bg-[#f4f1ea] lg:grid lg:grid-cols-[16rem_1fr]">
    <AdminSidebar name={u.name ?? "Admin"} role={u.role ?? ""} signOutSlot={<form action={async () => { "use server"; await signOut({ redirectTo: "/admin/login" }); }}><button className="adm-plain rounded-lg border border-white/20 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10">Sign out</button></form>} />
    <main className="min-w-0 p-5 lg:p-10"><div className="mx-auto max-w-6xl">{children}</div></main></div>;
}
