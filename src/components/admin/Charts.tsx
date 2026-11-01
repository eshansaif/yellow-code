import Link from "next/link";
export const compact = (n: number) => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
export const niceMax = (m: number) => { if (m <= 0) return 1; const e = Math.pow(10, Math.floor(Math.log10(m))), f = m / e; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * e; };
export function BarChart({ labels, series }: { labels: string[]; series: { name: string; color: string; values: number[] }[] }) {
  const W = 640, H = 270, L = 54, R = 12, T = 16, B = 34; const max = niceMax(Math.max(0, ...series.flatMap(s => s.values))); const gw = (W - L - R) / labels.length; const bw = Math.min(30, (gw - 16) / series.length); const y = (v: number) => T + (H - T - B) * (1 - v / max);
  return <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Bar chart of ${series.map(s => s.name).join(" and ")} by month`}>
    {[0, 1, 2, 3, 4].map(i => { const v = (max * i) / 4; return <g key={i}><line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="#ece7da" /><text x={L - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill="#8a857a">{compact(v)}</text></g>; })}
    {labels.map((lb, i) => { const gx = L + gw * i + gw / 2; return <g key={lb + i}>{series.map((s, j) => { const x = gx - (series.length * (bw + 3)) / 2 + j * (bw + 3); return <rect key={s.name} x={x} y={y(s.values[i])} width={bw} height={Math.max(0, (H - T - B) * (s.values[i] / max))} rx="4" fill={s.color}><title>{`${s.name}, ${lb}: ${compact(s.values[i])}`}</title></rect>; })}<text x={gx} y={H - 12} textAnchor="middle" fontSize="11" fill="#8a857a">{lb}</text></g>; })}</svg>;
}
export function Donut({ slices, center }: { slices: { label: string; value: number; color: string; href?: string }[]; center: string }) {
  const total = slices.reduce((a, s) => a + s.value, 0), r = 54, C = 2 * Math.PI * r; let off = 0;
  return <div className="flex flex-wrap items-center gap-6"><svg viewBox="0 0 140 140" className="size-36 shrink-0" role="img" aria-label={`${center}: ${slices.map(s => `${s.label} ${s.value}`).join(", ")}`}><circle cx="70" cy="70" r={r} fill="none" stroke="#efe9dc" strokeWidth="18" />
    {total > 0 && slices.filter(s => s.value > 0).map(s => { const len = (C * s.value) / total; const el = <circle key={s.label} cx="70" cy="70" r={r} fill="none" stroke={s.color} strokeWidth="18" strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-off} transform="rotate(-90 70 70)"><title>{`${s.label}: ${s.value}`}</title></circle>; off += len; return el; })}
    <text x="70" y="68" textAnchor="middle" fontSize="22" fontWeight="600" fill="#16130d">{total}</text><text x="70" y="86" textAnchor="middle" fontSize="10" fill="#8a857a">{center}</text></svg>
    <ul className="space-y-1.5 text-sm">{slices.map(s => { const inner = <><span className="size-2.5 rounded-full" style={{ background: s.color }} />{s.label}<b className="ml-1">{s.value}</b></>; return <li key={s.label}>{s.href ? <Link href={s.href} className="flex items-center gap-2 hover:underline">{inner}</Link> : <span className="flex items-center gap-2">{inner}</span>}</li>; })}</ul></div>;
}
export function HBars({ rows }: { rows: { label: string; value: number; color: string; href: string }[] }) {
  const max = Math.max(1, ...rows.map(r => r.value));
  return <ul className="space-y-3">{rows.map(r => <li key={r.label}><Link href={r.href} className="group block"><div className="flex justify-between text-sm"><span>{r.label}</span><span className="font-medium">{r.value}</span></div><div className="mt-1 h-2.5 rounded-full bg-[#efe9dc]"><div className="h-full rounded-full transition group-hover:opacity-80" style={{ width: `${(r.value / max) * 100}%`, background: r.color }} /></div></Link></li>)}</ul>;
}
