import CmsPage, { cmsMeta } from "@/components/CmsPage"; export const revalidate = 300;
export const generateMetadata = () => cmsMeta("sustainability");
export default function P() { return <CmsPage k="sustainability"/>; }
