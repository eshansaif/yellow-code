import Script from "next/script";
export function track(event: string, params: Record<string, unknown> = {}) { if (typeof window !== "undefined") (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.("event", event, params); }
export default function Analytics() { const id = process.env.NEXT_PUBLIC_GA_ID; if (!id) return null;
  return <><Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive"/><Script id="ga" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${id}');`}</Script></>; }
