import Link from "next/link";
export default function Pages() { return <><h1 className="text-3xl font-bold">Pages</h1><ul className="mt-6 space-y-2">{["about","capabilities","sustainability"].map(k=><li key={k}><Link className="underline capitalize" href={`/admin/pages/${k}`}>{k}</Link></li>)}</ul></>; }
