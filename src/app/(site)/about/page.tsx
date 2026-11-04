import CmsPage, { cmsMeta } from "@/components/CmsPage"; export const revalidate = 300;
export const generateMetadata = () => cmsMeta("about");
export default function P() { return <CmsPage k="about"/>; }
