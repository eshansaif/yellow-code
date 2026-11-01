import RoleGate from "@/components/admin/RoleGate";
export default function Layout({ children }: { children: React.ReactNode }) { return <RoleGate roles={["ADMIN", "ACCOUNTS"]}>{children}</RoleGate>; }
