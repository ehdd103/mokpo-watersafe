import { Suspense } from "react";
import type { Metadata } from "next";
import { VisitManager } from "@/components/visits/visit-manager";
export const metadata:Metadata={title:"방문 이력"};
export default function VisitsPage(){return <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-slate-200"/>}><VisitManager/></Suspense>}
