import "./globals.css"; import Analytics from "@/components/Analytics"; import type { Metadata } from "next"; import { Inter, Plus_Jakarta_Sans } from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.yellowcodebd.com"),
  title: { default: "Yellow Code Trims | Garment Trims Manufacturer, Bangladesh", template: "%s | Yellow Code Trims" },
  description: "Custom labels, hang tags, patches and trims for apparel brands, made in Bangladesh.", icons: { icon: "/logo.png" },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={`${inter.variable} ${jakarta.variable}`}><body className="font-display antialiased">{children}<Analytics/></body></html>;
}
