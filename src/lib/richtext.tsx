import React from "react";
// Markdown-lite renderer: ## / ### headings, - lists, **bold**, [text](https://link). Outputs React elements (no raw HTML), so it is XSS-safe.
function inline(t: string): React.ReactNode[] { const out: React.ReactNode[] = []; const re = /\*\*(.+?)\*\*|\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g; let last = 0, i = 0, m: RegExpExecArray | null;
  while ((m = re.exec(t))) { if (m.index > last) out.push(t.slice(last, m.index)); out.push(m[1] ? <strong key={i++}>{m[1]}</strong> : <a key={i++} href={m[3]} rel="noopener noreferrer" className="underline">{m[2]}</a>); last = re.lastIndex; }
  if (last < t.length) out.push(t.slice(last)); return out; }
export default function RichText({ text }: { text: string }) {
  return <div className="space-y-4 max-w-prose">{text.split(/\n{2,}/).map((b, i) => { const l = b.trim().split("\n");
    if (b.startsWith("## ")) return <h2 key={i} className="text-2xl font-bold text-ink">{inline(b.slice(3))}</h2>;
    if (b.startsWith("### ")) return <h3 key={i} className="text-xl font-bold text-ink">{inline(b.slice(4))}</h3>;
    if (l.every(x => x.startsWith("- "))) return <ul key={i} className="list-disc pl-5 space-y-1">{l.map((x, j) => <li key={j}>{inline(x.slice(2))}</li>)}</ul>;
    return <p key={i}>{inline(b)}</p>; })}</div>; }
