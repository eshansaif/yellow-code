"use client";
import Link from "next/link";
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const raw = (error.message ?? "").trim();
  // In production Next.js may mask the message; then we show the friendly fallback.
  const masked = !raw || /^an (error|unexpected)/i.test(raw) || raw.includes("omitted in production");
  return <div className="mx-auto max-w-xl rounded-2xl border border-line bg-white p-8">
    <h1 className="text-2xl font-semibold">That didn't work</h1>
    {!masked && <p role="alert" className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">{raw}</p>}
    <p className="mt-3 text-sm text-stone">{masked
      ? "Something went wrong while completing this action. Check the form values and your storage configuration (Cloudinary keys or BLOB_READ_WRITE_TOKEN), then try again."
      : "Fix the issue shown above and try again. If it keeps failing, check the server logs."}</p>
    {error.digest && <p className="mt-2 text-xs text-stone">Reference: {error.digest}</p>}
    <div className="mt-6 flex gap-3"><button onClick={reset} className="rounded-full bg-ink px-5 py-2 text-sm text-paper">Try again</button><Link href="/admin" className="rounded-full border border-line px-5 py-2 text-sm">Dashboard</Link></div></div>;
}
