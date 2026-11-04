export const Sk = ({ className = "" }: { className?: string }) => <div className={`animate-pulse rounded-lg bg-[#e9e3d6] ${className}`} />;
export function PageSkeleton() {
  return <div aria-busy="true" aria-label="Loading"><Sk className="h-8 w-56" /><Sk className="mt-3 h-4 w-80" />
    <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">{[0, 1, 2, 3].map(i => <div key={i} className="rounded-2xl border border-[#e7e0d2] bg-white p-5"><Sk className="h-3 w-20" /><Sk className="mt-3 h-8 w-14" /></div>)}</div>
    <div className="mt-8 overflow-hidden rounded-2xl border border-[#e7e0d2] bg-white">{[0, 1, 2, 3, 4, 5].map(i => <div key={i} className="flex items-center gap-4 border-t border-[#efe9dc] px-4 py-4 first:border-0"><Sk className="h-4 w-1/4" /><Sk className="h-4 w-1/3" /><Sk className="ml-auto h-6 w-20 rounded-full" /></div>)}</div></div>;
}
export function FormSkeleton() {
  return <div aria-busy="true" aria-label="Loading"><Sk className="h-8 w-64" /><div className="mt-8 max-w-2xl space-y-5 rounded-2xl border border-[#e7e0d2] bg-white p-6">{[0, 1, 2, 3, 4].map(i => <div key={i}><Sk className="h-3 w-24" /><Sk className="mt-2 h-10 w-full" /></div>)}<Sk className="h-10 w-32 rounded-full" /></div></div>;
}
