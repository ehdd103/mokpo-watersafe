import type { Metadata } from "next";
import { Database, FlaskConical, GitBranch, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export const metadata:Metadata={title:"데이터 설명"};
export default function DataPage(){return <><PageHeader title="가상 데이터 설명" description="이 프로젝트는 실제 공공데이터 API를 호출하지 않으며, 모든 수질·사례·경보 수치를 seed 기반 규칙으로 생성합니다."/><div className="grid gap-4 md:grid-cols-2">{[
  [FlaskConical,"가상 데이터 원칙","모든 위험 레코드의 isMock은 true입니다. 개인 단위 사례를 만들지 않고 행정동별 집계만 제공합니다."],
  [GitBranch,"재현 가능한 시뮬레이션","seed, 기준 날짜, 최초 발생 동, 성장률과 인접 관계를 사용합니다. 같은 입력은 같은 결과를 생성합니다."],
  [Database,"공급자 교체 구조","UI는 WaterQualityProvider, DiseaseCaseProvider, HealthAlertProvider, HealthcareFacilityProvider의 구현을 직접 알지 않습니다. 현재는 Mock 구현만 활성화됩니다."],
  [ShieldCheck,"표시 제한","행정동 중심 좌표 기반 원은 실제 행정 경계가 아닙니다. 학교·상점·주택 등 특정 장소를 감염 장소로 표시하지 않습니다."],
].map(([Icon,title,text])=><Card key={String(title)}><CardHeader><span className="grid size-11 place-items-center rounded-xl bg-cyan-100 text-cyan-800 dark:bg-cyan-950"><Icon className="size-6"/></span><CardTitle>{String(title)}</CardTitle></CardHeader><CardContent><p className="text-sm text-slate-600 dark:text-slate-400">{String(text)}</p></CardContent></Card>)}</div><Card className="mt-4"><CardHeader><CardTitle>가상 위험 점수</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><p>최근 가상 확진 집계, 증가율, 가상 의심 사례, 가상 수질 기준 초과, 인접 동 단계, 최신성, 누락, 활성 경보를 가중 합산하고 0~100으로 제한합니다.</p><div className="grid gap-2 sm:grid-cols-4"><p className="risk-normal rounded-xl p-3 font-bold">0~19 정상</p><p className="risk-interest rounded-xl p-3 font-bold">20~39 관심</p><p className="risk-caution rounded-xl p-3 font-bold">40~69 주의</p><p className="risk-warning rounded-xl p-3 font-bold">70~100 경계</p></div><p>필수 데이터가 누락되면 정보 없음 또는 낮은 신뢰도로 표시합니다. 수질 이상만으로 감염병 확산을 단정하지 않습니다.</p></CardContent></Card></>}
