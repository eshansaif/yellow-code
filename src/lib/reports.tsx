import type { SP } from "@/lib/list";
// Shared helpers for the /admin/reports module.
export type Range = { from: Date | null; to: Date | null };
export function range(sp: SP): Range {
  const f = sp.from ? new Date(`${sp.from}T00:00:00`) : null;
  const t = sp.to ? new Date(`${sp.to}T23:59:59.999`) : null;
  return { from: f && !isNaN(+f) ? f : null, to: t && !isNaN(+t) ? t : null };
}
export const dateFilter = (field: string, r: Range) => ({
  ...(r.from ? { [field]: { gte: r.from } } : {}),
  ...(r.to ? { [field]: { lte: r.to } } : {}),
});
export const rangeLabel = (r: Range) => r.from || r.to
  ? `${r.from ? r.from.toLocaleDateString("en-GB") : "the beginning"} – ${r.to ? r.to.toLocaleDateString("en-GB") : "today"}`
  : "all time";
export const Stat = ({ t, v, s, tone }: { t: string; v: string | number; s?: string; tone: string }) => (
  <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_1px_2px_rgba(22,19,13,.04)]">
    <p className="flex items-center gap-2 text-sm text-[#6b6a66]"><span className="size-2 rounded-full" style={{ background: tone }} />{t}</p>
    <p className="mt-2 text-2xl font-semibold">{v}</p>{s && <p className="mt-1 text-xs text-[#8a857a]">{s}</p>}
  </div>);
export const ReportShell = ({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) => (
  <><h1>{title}</h1><p className="text-sm text-[#6b6a66]">{desc}</p>{children}</>);
