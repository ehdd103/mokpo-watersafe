"use client";

import dynamic from "next/dynamic";
import { List, Map, Navigation, Phone } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { HEALTHCARE_FACILITIES } from "@/data/facilities";

const FacilityMap = dynamic(() => import("@/components/map/kakao-map").then((module) => module.KakaoMap), {
  ssr: false,
  loading: () => <div className="min-h-[560px] animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />,
});

const labels = { hospital: "병원", clinic: "의원", emergency: "응급의료센터", "health-center": "보건소" };

export function FacilityFinder() {
  const [type, setType] = useState("all");
  const [department, setDepartment] = useState("all");
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [view, setView] = useState<"list" | "map">("list");
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [position, setPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const facilities = useMemo(
    () => HEALTHCARE_FACILITIES
      .map((item) => position ? { ...item, distanceKm: haversine(position.latitude, position.longitude, item.latitude, item.longitude) } : item)
      .filter((item) => (type === "all" || item.type === type)
        && (department === "all" || item.departments.includes(department))
        && (!emergencyOnly || item.emergency)
        && (item.name.includes(query) || item.address.includes(query)))
      .sort((a, b) => a.distanceKm - b.distanceKm),
    [type, department, query, emergencyOnly, position],
  );

  function locate() {
    if (!navigator.geolocation) { setLocation("위치정보 미지원 · 병원명이나 행정동을 검색하세요."); return; }
    navigator.geolocation.getCurrentPosition(
      (value) => {
        setPosition({ latitude: value.coords.latitude, longitude: value.coords.longitude });
        setLocation("현재 위치 기준 직선거리를 계산했습니다. 위치는 저장하지 않습니다.");
      },
      () => setLocation("위치 권한이 거부되었습니다. 병원명이나 행정동을 검색하세요."),
      { timeout: 5000 },
    );
  }

  return <>
    <PageHeader
      title="주변 의료기관 찾기"
      description="목포시 공공데이터에 등록된 실제 병원 중 감염병·응급 대응에 필요한 주요 기관을 안내합니다."
      actions={<div className="flex gap-2"><Button variant={view === "list" ? "default" : "outline"} onClick={() => setView("list")}><List className="size-4" />목록</Button><Button variant={view === "map" ? "default" : "outline"} onClick={() => setView("map")}><Map className="size-4" />지도</Button></div>}
    />
    <div className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm dark:bg-amber-950">
      <strong>확인 안내:</strong> 기관명·주소·대표전화는 <a className="font-bold underline" href="https://www.data.go.kr/data/3074323/fileData.do" target="_blank" rel="noreferrer">목포시 병원현황(2025-08-22)</a> 기준입니다. 진료시간, 진료과목, 응급실 수용 가능 여부는 방문 전에 해당 기관 또는 119에 확인하세요.
    </div>
    <div className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5 dark:border-slate-800 dark:bg-slate-900">
      <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="기관명 또는 행정동" />
      <Select value={type} onChange={(event) => setType(event.target.value)}><option value="all">모든 기관 유형</option>{Object.entries(labels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</Select>
      <Select value={department} onChange={(event) => setDepartment(event.target.value)}><option value="all">모든 주요 진료과목</option><option>내과</option><option>소아청소년과</option><option>응급의학과</option><option>가정의학과</option></Select>
      <label className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 text-sm dark:border-slate-700"><input type="checkbox" checked={emergencyOnly} onChange={(event) => setEmergencyOnly(event.target.checked)} />응급실 운영 기관</label>
      <Button variant="outline" onClick={locate}><Navigation className="size-4" />현재 위치</Button>
    </div>
    {location && <p role="status" className="mb-4 text-sm">{location}</p>}
    {facilities.length === 0 ? <EmptyState title="검색 결과가 없습니다" description="필터를 바꾸거나 다른 병원명·행정동을 검색해 보세요." /> : view === "map" ?
      <FacilityMap records={[]} facilities={facilities} showWater={false} showDisease={false} showAlerts={false} className="min-h-[560px]" /> :
      <div className="grid gap-4 md:grid-cols-2">{facilities.map((item) => <Card key={item.id}><CardContent className="pt-5">
        <div className="flex justify-between gap-3"><div><span className="text-xs font-bold text-cyan-700">{labels[item.type]}</span><h2 className="text-xl font-black">{item.name}</h2></div><strong className="whitespace-nowrap">{item.distanceKm.toFixed(1)}km</strong></div>
        <dl className="mt-4 space-y-2 text-sm"><div><dt className="inline text-slate-500">주소 </dt><dd className="inline">{item.address}</dd></div><div><dt className="inline text-slate-500">주요 과목 </dt><dd className="inline">{item.departments.join(", ")}</dd></div><div><dt className="inline text-slate-500">운영 </dt><dd className="inline">{item.hours}</dd></div><div><dt className="inline text-slate-500">응급실 </dt><dd className="inline">{item.emergency ? "운영 기관(수용 여부 확인 필요)" : "정보 없음"}</dd></div></dl>
        <div className="mt-4 flex flex-wrap gap-2"><a href={`tel:${item.phone}`} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold dark:border-slate-700"><Phone className="size-4" />{item.phone}</a><a href={`https://map.kakao.com/link/to/${encodeURIComponent(item.name)},${item.latitude},${item.longitude}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold dark:border-slate-700"><Navigation className="size-4" />길찾기</a><button onClick={() => setView("map")} className="inline-flex items-center gap-1 px-3 py-2 text-sm font-bold text-cyan-700"><Map className="size-4" />지도</button></div>
      </CardContent></Card>)}</div>}
  </>;
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (value: number) => value * Math.PI / 180;
  const dLat = toRad(lat2 - lat1); const dLng = toRad(lng2 - lng1);
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}
