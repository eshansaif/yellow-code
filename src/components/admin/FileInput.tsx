"use client";
import { useEffect, useState } from "react";
export default function FileInput({ name, accept, required = false, label = "Choose a file" }: { name: string; accept?: string; required?: boolean; label?: string }) {
  const [file, setFile] = useState<File | null>(null); const [url, setUrl] = useState<string | null>(null);
  useEffect(() => { if (file && file.type.startsWith("image/")) { const u = URL.createObjectURL(file); setUrl(u); return () => URL.revokeObjectURL(u); } setUrl(null); }, [file]);
  return <label className="flex min-w-60 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#cfc7b4] bg-white px-3 py-2 text-sm hover:border-[#16130d] focus-within:ring-2 focus-within:ring-[#16130d]/20">
    <input type="file" name={name} accept={accept} required={required} className="sr-only" onChange={e => setFile(e.target.files?.[0] ?? null)} />
    {url ? <img src={url} alt="" className="size-10 rounded-md object-cover" /> : <span aria-hidden className="grid size-10 place-items-center rounded-md bg-[#f7f4ed] text-lg">↑</span>}
    <span className="min-w-0"><span className="block truncate font-medium">{file ? file.name : label}</span><span className="block text-xs text-[#7b7466]">{file ? `${Math.max(1, Math.round(file.size / 1024))} KB` : "Click to browse, max 4 MB"}</span></span></label>;
}
