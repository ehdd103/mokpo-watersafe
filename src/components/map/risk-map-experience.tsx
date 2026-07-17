"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Crosshair, Heart, List, Map as MapIcon, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { RiskBadge } from "@/components/common/risk-badge";
import { useAppStore } from "@/components/providers/app-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { RISK_META } from "@/config/risk";
import type { RiskLevel } from "@/types";
import { HEALTHCARE_FACILITIES } from "@/data/facilities";

const RiskMap = dynamic(() => import("./kakao-map").then((module) => module.KakaoMap), { ssr: false, loading: () => <div className="min-h-[520px] animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" /> });
const levels: RiskLevel[] = ["unknown","normal","interest","caution","warning"];

export function filterRiskRecords(records: ReturnType<typeof useAppStore>["records"], query: string, level: RiskLevel | "all") {
  return records.filter((record) => (level === "all" || record.riskLevel === level) && record.regionName.includes(query.trim()));
}

export function RiskMapExperience() {
  const { records, date, setDate, visits, favorites, toggleFavorite } = useAppStore();
  const [query,setQuery]=useState(""); const [selected,setSelected]=useState(records[0]?.regionCode); const [view,setView]=useState<"map"|"list">("map"); const [level,setLevel]=useState<RiskLevel|"all">("all");
  const [fromDate,setFromDate]=useState("2026-07-01"); const [disease,setDisease]=useState("all");
  const [userPosition,setUserPosition]=useState<{latitude:number;longitude:number}|undefined>();
  const [layers,setLayers]=useState({ water:true,disease:true,alerts:true,visits:true,facilities:false }); const [locationMessage,setLocationMessage]=useState("");
  const filtered=useMemo(()=>filterRiskRecords(records,query,level).filter((record)=>record.observedAt.slice(0,10)>=fromDate&&(disease==="all"||record.diseaseType===disease)),[records,level,query,fromDate,disease]);
  const current=records.find((record)=>record.regionCode===selected);
  function locate(){if(!navigator.geolocation){setLocationMessage("위치정보 미지원 · 행정동 검색을 이용하세요.");return;}navigator.geolocation.getCurrentPosition((value)=>{setUserPosition({latitude:value.coords.latitude,longitude:value.coords.longitude});setLocationMessage("현재 위치로 이동했습니다. 위치는 저장하지 않습니다.");},()=>setLocationMessage("위치 권한 거부 · 행정동 검색을 이용하세요."),{timeout:5000});}
  return <><PageHeader title="목포시 위험 지도" description="수질·감염병·경보·방문 기록을 독립된 레이어로 살펴보세요. 위험은 행정동 단위로만 표시합니다." actions={<div className="flex gap-2"><Button variant={view==="map"?"default":"outline"} onClick={()=>setView("map")}><MapIcon className="size-4"/>지도</Button><Button variant={view==="list"?"default":"outline"} onClick={()=>setView("list")}><List className="size-4"/>목록</Button></div>}/>
    <div className="mb-4 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-6 dark:border-slate-800 dark:bg-slate-900"><label className="relative"><span className="sr-only">행정동 검색</span><Search className="absolute left-3 top-3 size-4 text-slate-400"/><Input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="행정동 검색" className="pl-9"/></label><label><span className="sr-only">위험 단계 필터</span><Select value={level} onChange={(event)=>setLevel(event.target.value as RiskLevel|"all")}><option value="all">모든 위험 단계</option>{levels.map((item)=><option key={item} value={item}>{RISK_META[item].label}</option>)}</Select></label><label><span className="sr-only">질병 종류 필터</span><Select value={disease} onChange={(event)=>setDisease(event.target.value)}><option value="all">모든 질병 종류</option><option value="가상 급성 위장관 감염">가상 급성 위장관 감염</option></Select></label><label><span className="sr-only">조회 시작 날짜</span><Input type="date" value={fromDate} min="2026-07-01" max={date} onChange={(event)=>setFromDate(event.target.value)}/></label><label><span className="sr-only">조회 종료 및 기준 날짜</span><Input type="date" value={date} min={fromDate} max="2026-08-15" onChange={(event)=>setDate(event.target.value)}/></label><Button variant="outline" onClick={locate}><Crosshair className="size-4"/>현재 위치</Button></div>
    {locationMessage&&<p role="status" className="mb-3 rounded-lg bg-slate-100 px-3 py-2 text-sm dark:bg-slate-800">{locationMessage}</p>}
    <div className="mb-4 flex flex-wrap gap-2" aria-label="지도 레이어">{Object.entries({water:"가상 수질",disease:"가상 감염병",alerts:"가상 경보",visits:"내 방문",facilities:"실제 의료기관"}).map(([key,label])=><label key={key} className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 px-3 py-2 text-xs font-bold dark:border-slate-700"><input type="checkbox" checked={layers[key as keyof typeof layers]} onChange={(event)=>setLayers({...layers,[key]:event.target.checked})}/>{label}</label>)}</div>
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div>{view==="map"?<RiskMap records={filtered} selectedCode={selected} onSelect={setSelected} showWater={layers.water} showDisease={layers.disease} showAlerts={layers.alerts} visits={layers.visits?visits:[]} facilities={layers.facilities?HEALTHCARE_FACILITIES:[]} userPosition={userPosition} className="min-h-[620px]"/>:<div className="grid gap-3 md:grid-cols-2">{filtered.map((record)=><button key={record.id} onClick={()=>setSelected(record.regionCode)} className="rounded-2xl border border-slate-200 bg-white p-4 text-left hover:border-cyan-500 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between"><strong>{record.regionName}</strong><RiskBadge level={record.riskLevel} score={record.riskScore}/></div><p className="mt-3 text-sm text-slate-600 dark:text-slate-400">가상 확진 {record.confirmedCaseCount} · 수질 {record.waterQualityStatus==="abnormal"?"이상":"정상/정보없음"}</p></button>)}</div>}</div>
      <aside className="xl:sticky xl:top-20 xl:self-start">{current?<Card><CardContent className="pt-5"><div className="flex items-start justify-between"><div><p className="text-xs font-bold text-cyan-700">선택 행정동</p><h2 className="mt-1 text-2xl font-black">{current.regionName}</h2></div><button onClick={()=>toggleFavorite(current.regionCode)} aria-label={`${current.regionName} 즐겨찾기 ${favorites.includes(current.regionCode)?"해제":"추가"}`}><Heart className={`size-6 ${favorites.includes(current.regionCode)?"fill-rose-500 text-rose-500":""}`}/></button></div><RiskBadge level={current.riskLevel} score={current.riskScore} className="mt-3"/><dl className="mt-5 grid grid-cols-2 gap-3 text-sm"><div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><dt>가상 확진</dt><dd className="text-xl font-black">{current.confirmedCaseCount}</dd></div><div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><dt>가상 의심</dt><dd className="text-xl font-black">{current.suspectedCaseCount}</dd></div><div className="col-span-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><dt>가상 수질</dt><dd className="font-bold">{current.waterQualityStatus==="abnormal"?"이상":"정상 또는 정보 없음"} · {current.measuredValue??"-"}/{current.thresholdValue??"-"}</dd></div></dl><p className="mt-4 text-sm">{current.reasons[0]}</p><div className="mt-5 grid gap-2"><Link href={`/regions/${current.regionCode}`} className="rounded-xl bg-cyan-700 px-4 py-3 text-center font-bold text-white">지역 상세 보기</Link><Link href={`/visits?region=${current.regionCode}`} className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 font-bold dark:border-slate-700"><Plus className="size-4"/>방문 이력 추가</Link></div></CardContent></Card>:<Card><CardContent className="pt-5">조건에 맞는 행정동이 없습니다.</CardContent></Card>}
      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-xs dark:border-slate-800 dark:bg-slate-900"><p className="font-bold">위험 단계 범례</p><div className="mt-3 flex flex-wrap gap-2">{levels.map((item)=><RiskBadge key={item} level={item}/>)}</div><p className="mt-3 text-slate-500">색상뿐 아니라 기호·텍스트·패턴으로 구분합니다.</p></div></aside>
    </div>
  </>;
}
