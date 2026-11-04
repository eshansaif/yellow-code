import { redirect } from "next/navigation"; import { auth } from "@/auth";
export default async function RoleGate({ roles, children }: { roles: string[]; children: React.ReactNode }) {
  const s = await auth(); const r = (s?.user as { role?: string } | undefined)?.role; if (!r || !roles.includes(r)) redirect("/admin"); return <>{children}</>;
}
