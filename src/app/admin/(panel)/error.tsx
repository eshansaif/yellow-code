"use client";
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="max-w-lg rounded-2xl border border-line bg-white p-8"><h1 className="text-2xl font-semibold">Something went wrong</h1>
    <p className="mt-3 text-sm text-stone">That action did not complete. Check the form values, the database connection, and image storage (Cloudinary keys or BLOB_READ_WRITE_TOKEN), then try again.</p>
    {error.digest && <p className="mt-2 text-xs text-stone">Reference: {error.digest}</p>}
    <div className="mt-6 flex gap-3"><button onClick={reset} className="rounded-full bg-ink px-5 py-2 text-sm text-paper">Try again</button><a href="/admin" className="rounded-full border border-line px-5 py-2 text-sm">Dashboard</a></div></div>;
}
