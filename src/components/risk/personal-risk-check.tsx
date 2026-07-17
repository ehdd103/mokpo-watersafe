"use client";

import Link from "next/link";
import { isWithinInterval, parseISO } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Hospital, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { PageHeader } from "@/components/common/page-header";
import { RiskBadge } from "@/components/common/risk-badge";
import { useAppStore } from "@/components/providers/app-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { REGIONS } from "@/config/regions";
import type { MockRiskRecord } from "@/types";

const schema = z.object({
  regionCode: z.string().min(1), visitDate: z.string().min(1), symptoms: z.enum(["yes", "no"]),
  symptomStart: z.string().optional(), fever: z.boolean(), diarrhea: z.boolean(), pain: z.boolean(),
  vomiting: z.boolean(), highRisk: z.boolean(), save: z.boolean(),
});
type Values = z.infer<typeof schema>;
const symptomFields = [["fever", "발열"], ["diarrhea", "설사"], ["pain", "복통"], ["vomiting", "구토"]] as const;

export function PersonalRiskCheck() {
  const { records } = useAppStore();
  const [result, setResult] = useState<{ record: MockRiskRecord; values: Values } | null>(null);
  const { register, handleSubmit, control } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { regionCode: "", visitDate: "2026-07-15", symptoms: "no", fever: false, diarrhea: false, pain: false, vomiting: false, highRisk: false, save: false },
  });
  const hasSymptoms = useWatch({ control, name: "symptoms" }) === "yes";
  const alertMatches = result ? result.record.riskLevel !== "normal" && result.record.riskLevel !== "unknown" && isWithinInterval(parseISO(result.values.visitDate), { start: parseISO(result.record.observedAt), end: parseISO(result.record.expiresAt ?? result.record.publishedAt) }) : false;

  return <>
    <PageHeader title="개인 위험 확인" description="최소한의 체크리스트로 일반적인 행동요령을 확인합니다. 질환명이나 상세 건강정보는 수집하지 않습니다." />
    <div className="grid gap-5 lg:grid-cols-2">
      <Card><CardHeader><CardTitle>방문과 증상 체크</CardTitle></CardHeader><CardContent>
        <form onSubmit={handleSubmit((values) => { const record = records.find((item) => item.regionCode === values.regionCode); if (record) { setResult({ record, values }); if(values.save){try{localStorage.setItem("watersafe:risk-check",JSON.stringify({regionCode:values.regionCode,visitDate:values.visitDate,checkedAt:new Date().toISOString()}));}catch{}} } })} className="space-y-4">
          <label className="block text-sm font-bold">방문 행정동<Select {...register("regionCode")} className="mt-1"><option value="">선택</option>{REGIONS.map((region) => <option key={region.code} value={region.code}>{region.name}</option>)}</Select></label>
          <label className="block text-sm font-bold">방문 날짜<Input type="date" {...register("visitDate")} className="mt-1" /></label>
          <label className="block text-sm font-bold">증상 발생 여부<Select {...register("symptoms")} className="mt-1"><option value="no">없음</option><option value="yes">있음</option></Select></label>
          {hasSymptoms && <>
            <label className="block text-sm font-bold">증상 시작 날짜<Input type="date" {...register("symptomStart")} className="mt-1" /></label>
            <fieldset><legend className="text-sm font-bold">해당하는 증상 (선택)</legend><div className="mt-2 grid grid-cols-2 gap-2">{symptomFields.map(([name, label]) => <label key={name} className="rounded-xl border border-slate-300 p-3 text-sm dark:border-slate-700"><input type="checkbox" {...register(name)} className="mr-2" />{label}</label>)}</div></fieldset>
          </>}
          <label className="flex gap-2 text-sm"><input type="checkbox" {...register("highRisk")} /><span>고위험군에 해당함 (세부 질환명은 입력하지 않음)</span></label>
          <label className="flex gap-2 text-sm"><input type="checkbox" {...register("save")} /><span>결과를 이 브라우저에 저장 (선택)</span></label>
          <Button type="submit" className="w-full">행동요령 확인</Button>
        </form>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>시연용 안내 결과</CardTitle></CardHeader><CardContent>
        {result ? <div>
          <div className="flex items-center justify-between"><strong className="text-xl">{result.record.regionName}</strong><RiskBadge level={result.record.riskLevel} /></div>
          <p className="mt-4 text-sm">방문 날짜와 선택 기준일의 가상 경보를 비교했습니다. 현재 표시 단계는 <strong>{result.record.riskLevel}</strong>이며, 방문 날짜와 활성 기간은 <strong>{alertMatches?"겹칩니다":"겹치지 않습니다"}</strong>.</p>
          <div className="mt-4 rounded-xl bg-cyan-50 p-4 text-sm dark:bg-cyan-950"><p className="font-bold">일반적인 예방 행동</p><ul className="mt-2 space-y-1"><li>· 안전한 물과 충분히 익힌 음식을 선택하세요.</li><li>· 손 씻기와 조리도구 분리를 실천하세요.</li><li>· 증상이 지속되거나 심해지면 의료기관에 문의하세요.</li></ul></div>
          {(result.values.symptoms==="yes"||result.values.highRisk) && <div className="mt-4 rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm dark:bg-rose-950"><p className="flex items-center gap-2 font-bold"><AlertTriangle className="size-5" />응급상황 안내</p><p className="mt-2">의식 저하, 호흡곤란, 심한 탈수 등 응급상황이 의심되면 119 또는 가까운 응급실을 이용하세요. 고위험군이거나 증상이 지속되면 의료기관에 문의하세요.</p></div>}
          <div className="mt-4 grid gap-2"><Link href="/facilities" className="flex items-center justify-center gap-2 rounded-xl bg-cyan-700 px-4 py-3 font-bold text-white"><Hospital className="size-4" />의료기관 검색</Link><Link href="/safety" className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 font-bold dark:border-slate-700"><ShieldCheck className="size-4" />안전수칙</Link></div>
        </div> : <div className="grid min-h-72 place-items-center text-center text-sm text-slate-500"><p>체크리스트를 작성하면<br />가상 경보와 일반 행동요령이 표시됩니다.</p></div>}
      </CardContent></Card>
    </div>
    <p className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm font-bold text-amber-950 dark:bg-amber-950 dark:text-amber-100">이 결과는 가상 데이터를 기반으로 한 해커톤 시연용 안내이며, 의료적 진단이나 전문적인 의료 판단을 대신하지 않습니다.</p>
  </>;
}
