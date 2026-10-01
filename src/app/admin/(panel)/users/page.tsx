import SubmitButton from "@/components/admin/SubmitButton";
import SearchSelect from "@/components/SearchSelect";
import { db } from "@/lib/db"; import { requireAdmin } from "@/auth"; import { createUser, deleteUser } from "../actions";
export default async function U() { await requireAdmin(["ADMIN"]); const us = await db.adminUser.findMany({ orderBy:{createdAt:"asc"} }); const I="rounded-lg border border-line bg-white px-3 py-2 outline-none focus:border-ink";
  return <><h1 className="text-3xl font-bold">Admin users</h1><form action={createUser} className="mt-6 flex flex-wrap gap-2"><input name="name" required placeholder="Name" className={I}/><input name="email" type="email" required placeholder="Email" className={I}/><input name="password" type="password" required minLength={10} placeholder="Password (10+ chars)" className={I}/>
    <SearchSelect name="role" defaultValue="EDITOR" options={["EDITOR","SALES","ADMIN"].map(x=>({value:x,label:x}))}/><SubmitButton className="rounded-full bg-ink text-paper px-4">Add user</SubmitButton></form>
    <table className="mt-6 w-full text-sm"><tbody>{us.map(u=><tr key={u.id} className="border-t border-line"><td className="py-2">{u.name}</td><td>{u.email}</td><td>{u.role}</td><td><form action={deleteUser.bind(null,u.id)}><SubmitButton className="underline">Delete</SubmitButton></form></td></tr>)}</tbody></table></>; }
