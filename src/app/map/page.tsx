import type { Metadata } from "next";
import { RiskMapExperience } from "@/components/map/risk-map-experience";
export const metadata: Metadata = { title: "목포시 위험 지도" };
export default function MapPage(){return <RiskMapExperience/>;}
