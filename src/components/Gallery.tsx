"use client";
import { track } from "@/components/Analytics"; import { useCallback, useEffect, useRef, useState } from "react";
export type GImage = { id: string; url: string; alt: string; caption?: string | null };
export default function Gallery({ images, layout = "masonry" }: { images: GImage[]; layout?: "masonry" | "product" }) {
  const [open, setOpen] = useState<number | null>(null); const [main, setMain] = useState(0); const x0 = useRef(0); const closeBtn = useRef<HTMLButtonElement>(null);
  const go = useCallback((d: number) => setOpen(o => o === null ? o : (o + d + images.length) % images.length), [images.length]);
  useEffect(() => { if (open === null) return; closeBtn.current?.focus(); document.body.style.overflow = "hidden";
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); };
    window.addEventListener("keydown", k); return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; }; }, [open, go]);
  if (!images.length) return <div className="aspect-square rounded-2xl bg-line grid place-items-center text-stone">Product photography</div>;
  const Btn = ({ i, cls }: { i: number; cls: string }) => <button onClick={() => { setOpen(i); track("gallery_open"); }} className={`group block w-full overflow-hidden rounded-xl bg-line ${cls}`} aria-label={`Open image: ${images[i].alt}`}><img src={images[i].url} alt={images[i].alt} loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-105"/></button>;
  return <>
    {layout === "product" ? <div><div className="aspect-square overflow-hidden"><Btn i={main} cls="aspect-square"/></div>
      {images.length > 1 && <ul className="mt-2 flex gap-2 overflow-x-auto">{images.map((im, i) => <li key={im.id}><button onClick={() => setMain(i)} aria-label={`Show image ${i + 1}`} aria-current={i === main} className={`size-20 border-2 ${i === main ? "border-ink" : "border-transparent"}`}><img src={im.url} alt="" loading="lazy" className="size-full object-cover"/></button></li>)}</ul>}</div>
    : <ul className="columns-2 md:columns-3 lg:columns-4 gap-3 [&>li]:mb-3">{images.map((im, i) => <li key={im.id} className="break-inside-avoid"><Btn i={i} cls={i % 5 === 0 ? "aspect-[3/4]" : i % 3 === 0 ? "aspect-square" : "aspect-[4/3]"}/></li>)}</ul>}
    {open !== null && <div role="dialog" aria-modal="true" aria-label="Image viewer" className="fixed inset-0 z-50 bg-black/95 flex flex-col"
      onTouchStart={e => (x0.current = e.touches[0].clientX)} onTouchEnd={e => { const dx = e.changedTouches[0].clientX - x0.current; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); }}>
      <div className="flex justify-between p-4 text-paper text-sm"><span>{open + 1} / {images.length}</span><button ref={closeBtn} onClick={() => setOpen(null)} className="border border-paper px-3 py-1">Close</button></div>
      <div className="flex-1 min-h-0 flex items-center justify-between gap-2 px-2">
        <button onClick={() => go(-1)} aria-label="Previous image" className="text-paper text-3xl px-3 py-6">‹</button>
        <img src={images[open].url} alt={images[open].alt} className="max-h-full max-w-full object-contain"/>
        <button onClick={() => go(1)} aria-label="Next image" className="text-paper text-3xl px-3 py-6">›</button></div>
      <p className="p-4 text-center text-paper text-sm min-h-12">{images[open].caption}</p></div>}</>;
}
