import Link from "next/link";
export default function NotFound() { return <main className="max-w-xl mx-auto px-6 py-24"><h1 className="text-5xl font-semibold">Page not found</h1><p className="mt-4 text-stone">The page you are looking for does not exist or has moved.</p><Link href="/" className="mt-8 inline-block rounded-full bg-ink px-6 py-3 text-paper">Back to home</Link></main>; }
