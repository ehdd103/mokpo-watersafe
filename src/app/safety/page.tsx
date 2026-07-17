import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SAFETY_GUIDES } from "@/data/safety-guides";
export const metadata:Metadata={title:"안전수칙"};
export default function SafetyPage(){return <><PageHeader title="일반 안전수칙" description="공공보건의 일반적인 예방 원칙을 바탕으로 한 안내이며 의료적 진단이나 치료 지침이 아닙니다."/><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{SAFETY_GUIDES.map(({id,title,description,action,caution,icon:Icon,updatedAt})=><Card key={id}><CardHeader><span className="mb-3 grid size-11 place-items-center rounded-xl bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200"><Icon className="size-6"/></span><CardTitle>{title}</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><p>{description}</p><div className="rounded-xl bg-cyan-50 p-3 dark:bg-cyan-950"><strong>행동 방법</strong><p className="mt-1">{action}</p></div><div><strong>주의</strong><p className="mt-1 text-slate-600 dark:text-slate-400">{caution}</p></div><p className="pt-2 text-xs text-slate-500">마지막 콘텐츠 갱신일 {updatedAt}</p></CardContent></Card>)}</div></>}
