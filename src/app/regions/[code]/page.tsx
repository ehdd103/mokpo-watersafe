import type { Metadata } from "next";
import { REGIONS } from "@/config/regions";
import { RegionDetail } from "@/components/risk/region-detail";
export function generateStaticParams(){return REGIONS.map((region)=>({code:region.code}));}
export async function generateMetadata({params}:{params:Promise<{code:string}>}):Promise<Metadata>{const {code}=await params;const region=REGIONS.find((item)=>item.code===code);return{title:region?`${region.name} 상세`:"행정동 정보 없음"};}
export default async function RegionPage({params}:{params:Promise<{code:string}>}){const {code}=await params;return <RegionDetail code={code}/>;}
