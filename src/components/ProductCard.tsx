import Link from "next/link"; import TrimArt, { kindOf } from "@/components/TrimArt";
export default function ProductCard({ href, name, desc, category, img }: { href: string; name: string; desc?: string | null; category: string; img?: { url: string; alt: string } | null }) {
  return <Link href={href} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl">
    <div className="grid aspect-[4/3] place-items-center overflow-hidden bg-[#f3ecd9]">{img ? <img src={img.url} alt={img.alt} loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" /> : <TrimArt kind={kindOf(category + " " + name)} className="w-1/2 max-w-[200px] transition duration-500 group-hover:scale-105" />}</div>
    <div className="flex flex-1 flex-col p-5"><p className="text-xs font-medium uppercase tracking-wider text-[#8a6d00]">{category}</p><h3 className="mt-1 text-lg font-semibold">{name}</h3>{desc && <p className="mt-1 line-clamp-2 text-sm text-stone">{desc}</p>}</div></Link>;
}
