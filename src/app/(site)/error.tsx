"use client";
export default function E({ reset }: { reset: () => void }) {
  return <main className="max-w-xl mx-auto px-6 py-24"><h1 className="text-4xl font-semibold">Something went wrong</h1>
    <p className="mt-4 text-stone">This page could not load. Please try again — if it keeps happening, contact us and tell us what you clicked.</p>
    <button onClick={reset} className="mt-8 rounded-full bg-ink px-6 py-3 text-paper">Try again</button></main>;
}
