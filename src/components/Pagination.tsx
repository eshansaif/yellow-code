import Link from "next/link";
export default function Pagination({ total, per, page, path, params }: { total: number; per: number; page: number; path: string; params: Record<string, string | undefined> }) {
  const pages = Math.max(1, Math.ceil(total / per));
  const href = (p: number) => { const q = new URLSearchParams(); for (const [k, v] of Object.entries(params)) if (v && k !== "page") q.set(k, v); if (p > 1) q.set("page", String(p)); const s = q.toString(); return s ? `${path}?${s}` : path; };
  const from = total ? (page - 1) * per + 1 : 0, to = Math.min(total, page * per); const win: number[] = []; for (let i = Math.max(1, page - 2); i <= Math.min(pages, page + 2); i++) win.push(i);
  const b = "inline-flex min-w-9 items-center justify-center rounded-full border px-3 py-1.5 text-sm"; const off = "border-line bg-white hover:border-ink"; const on = "border-ink bg-ink text-paper";
  return <nav aria-label="Pagination" className="mt-8 flex flex-col items-center justify-between gap-3 sm:flex-row"><p className="text-sm text-stone">{total ? `Showing ${from}–${to} of ${total}` : "No results"}</p>
    {pages > 1 && <ul className="flex flex-wrap items-center justify-center gap-1.5">{page > 1 && <li><Link rel="prev" href={href(page - 1)} className={`${b} ${off}`}>Previous</Link></li>}
      {win[0] > 1 && <><li><Link href={href(1)} className={`${b} ${off}`}>1</Link></li>{win[0] > 2 && <li aria-hidden className="px-1 text-stone">…</li>}</>}
      {win.map(p => <li key={p}><Link href={href(p)} aria-current={p === page ? "page" : undefined} className={`${b} ${p === page ? on : off}`}>{p}</Link></li>)}
      {win[win.length - 1] < pages && <>{win[win.length - 1] < pages - 1 && <li aria-hidden className="px-1 text-stone">…</li>}<li><Link href={href(pages)} className={`${b} ${off}`}>{pages}</Link></li></>}
      {page < pages && <li><Link rel="next" href={href(page + 1)} className={`${b} ${off}`}>Next</Link></li>}</ul>}</nav>;
}
