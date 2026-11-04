"use client";
// Client-side CSV export for report tables. Values are quoted when needed and
// a BOM is added so Excel opens the file with the right encoding.
export default function CsvButton({ name, headers, rows, className }: { name: string; headers: string[]; rows: (string | number)[][]; className?: string }) {
  const download = () => {
    const esc = (v: string | number) => { const s = String(v ?? ""); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    const body = [headers, ...rows].map(r => r.map(esc).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + body], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = `${name}.csv`; a.click(); URL.revokeObjectURL(url);
  };
  return <button type="button" onClick={download} className={className ?? "adm-plain rounded-full border border-line bg-white px-4 py-2 text-sm font-medium hover:border-ink"}>Export CSV</button>;
}
