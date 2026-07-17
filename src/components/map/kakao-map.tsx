"use client";
import { useEffect, useRef, useState } from "react";
import { MapPin, RefreshCw } from "lucide-react";
import { MOKPO_CENTER } from "@/config/regions";
import { RISK_META } from "@/config/risk";
import type { MapAdapterProps } from "./map-adapter";
import { cn } from "@/lib/utils";

type KakaoMap = { setCenter(position: KakaoLatLng): void; getCenter(): KakaoLatLng };
type KakaoLatLng = { getLat(): number; getLng(): number };
type KakaoMarker = { setMap(map: KakaoMap | null): void };
type KakaoCircle = { setMap(map: KakaoMap | null): void };
type KakaoPlace = { x: string; y: string; place_name: string; address_name: string };
type KakaoPlaces = {
  keywordSearch(
    keyword: string,
    callback: (results: KakaoPlace[], status: string) => void,
    options?: { location?: KakaoLatLng; radius?: number; size?: number },
  ): void;
};
type KakaoNamespace = { maps: { load(callback: () => void): void; LatLng: new (lat: number, lng: number) => KakaoLatLng; Map: new (element: HTMLElement, options: object) => KakaoMap; Marker: new (options: object) => KakaoMarker; Circle: new (options: object) => KakaoCircle; MarkerClusterer: new (options: { map: KakaoMap; averageCenter: boolean; minLevel: number; markers: KakaoMarker[] }) => object; event: { addListener(target: object, event: string, callback: () => void): void }; services: { Places: new () => KakaoPlaces; Status: { OK: string } } } };
declare global { interface Window { kakao?: KakaoNamespace } }

const colors = { unknown: "#64748b", normal: "#0f766e", interest: "#ca8a04", caution: "#ea580c", warning: "#e11d48" };
const verifiedRegionPositions = new Map<string, { latitude: number; longitude: number }>();

export function KakaoMap({ records, selectedCode, onSelect, showWater = true, showDisease = true, showAlerts = true, visits = [], facilities = [], userPosition, className }: MapAdapterProps) {
  const container = useRef<HTMLDivElement>(null); const [status, setStatus] = useState<"loading"|"ready"|"fallback"|"error">("loading");
  const key = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
  useEffect(() => {
    if (!key || !container.current) { setStatus("fallback"); return; }
    let active = true;
    const initialize = () => window.kakao?.maps.load(async () => {
      if (!active || !container.current || !window.kakao) return;
      const maps = window.kakao.maps; const center = new maps.LatLng(MOKPO_CENTER.latitude, MOKPO_CENTER.longitude);
      const map = new maps.Map(container.current, { center, level: 6, minLevel: 4, maxLevel: 8 });
      const markers: KakaoMarker[] = [];
      const places = new maps.services.Places();
      const resolvedRecords = await Promise.all(records.map(async (record) => {
        const cached = verifiedRegionPositions.get(record.regionCode);
        if (cached) return { record, position: new maps.LatLng(cached.latitude, cached.longitude) };

        const verified = await new Promise<{ latitude: number; longitude: number } | null>((resolve) => {
          places.keywordSearch(
            `목포시 ${record.regionName} 행정복지센터`,
            (results, searchStatus) => {
              if (searchStatus !== maps.services.Status.OK) { resolve(null); return; }
              const match = results.find((place) => place.address_name.includes("목포시") && place.place_name.includes("행정복지센터")) ?? results.find((place) => place.address_name.includes("목포시"));
              const latitude = Number(match?.y); const longitude = Number(match?.x);
              resolve(Number.isFinite(latitude) && Number.isFinite(longitude) ? { latitude, longitude } : null);
            },
            { location: center, radius: 20_000, size: 5 },
          );
        });
        if (verified) verifiedRegionPositions.set(record.regionCode, verified);
        const coordinates = verified ?? { latitude: record.latitude, longitude: record.longitude };
        return { record, position: new maps.LatLng(coordinates.latitude, coordinates.longitude) };
      }));
      if (!active) return;
      const positionByRegion = new Map(resolvedRecords.map(({ record, position }) => [record.regionCode, position]));
      resolvedRecords.forEach(({ record, position }) => {
        if (showDisease) { const circle = new maps.Circle({ center: position, radius: selectedCode === record.regionCode ? 500 : 350, strokeWeight: selectedCode === record.regionCode ? 5 : 2, strokeColor: colors[record.riskLevel], strokeOpacity: 1, fillColor: colors[record.riskLevel], fillOpacity: .24 }); circle.setMap(map); }
        if (showWater) { const waterPosition = new maps.LatLng(position.getLat() + .0012, position.getLng() - .0012); const waterColor = record.waterQualityStatus === "abnormal" ? "#c2410c" : record.waterQualityStatus === "unknown" ? "#64748b" : "#0284c7"; const waterCircle = new maps.Circle({ center: waterPosition, radius: 135, strokeWeight: 3, strokeColor: waterColor, strokeOpacity: 1, fillColor: waterColor, fillOpacity: .42 }); waterCircle.setMap(map); }
        if (showDisease || (showAlerts && ["caution", "warning"].includes(record.riskLevel))) { const marker = new maps.Marker({ position, title: `${record.regionName} ${RISK_META[record.riskLevel].label}` }); markers.push(marker); maps.event.addListener(marker, "click", () => onSelect?.(record.regionCode)); }
      });
      visits.forEach((visit) => { const position = positionByRegion.get(visit.regionCode); if (position) markers.push(new maps.Marker({ position: new maps.LatLng(position.getLat() - .0015, position.getLng()), title: `${visit.regionName} 사용자 방문 기록` })); });
      facilities.forEach((facility) => markers.push(new maps.Marker({ position: new maps.LatLng(facility.latitude, facility.longitude), title: facility.name })));
      if(userPosition&&userPosition.latitude>=34.75&&userPosition.latitude<=34.86&&userPosition.longitude>=126.33&&userPosition.longitude<=126.49){const current=new maps.LatLng(userPosition.latitude,userPosition.longitude);markers.push(new maps.Marker({position:current,title:"현재 위치 (저장하지 않음)"}));map.setCenter(current);}
      if (markers.length) new maps.MarkerClusterer({ map, averageCenter: true, minLevel: 6, markers });
      maps.event.addListener(map, "dragend", () => { const next = map.getCenter(); if (next.getLat() < 34.75 || next.getLat() > 34.86 || next.getLng() < 126.33 || next.getLng() > 126.49) map.setCenter(center); });
      setStatus("ready");
    });
    const existing = document.querySelector<HTMLScriptElement>('script[data-watersafe-kakao="true"]');
    if (existing) initialize(); else { const script = document.createElement("script"); script.dataset.watersafeKakao = "true"; script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(key)}&autoload=false&libraries=clusterer,services`; script.async = true; script.onload = initialize; script.onerror = () => setStatus("error"); document.head.appendChild(script); }
    return () => { active = false; };
  }, [key, records, selectedCode, onSelect, showWater, showDisease, showAlerts, visits, facilities, userPosition]);

  if (status === "fallback" || status === "error") return <SchematicMap records={records} selectedCode={selectedCode} onSelect={onSelect} showWater={showWater} showDisease={showDisease} showAlerts={showAlerts} visits={visits} facilities={facilities} userPosition={userPosition} className={className} error={status === "error"} />;
  return <div className={cn("relative min-h-[430px] overflow-hidden rounded-2xl border border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-900", className)}><div ref={container} className="absolute inset-0" aria-label="목포시 Kakao 지도" />{status === "loading" && <div className="absolute inset-0 grid place-items-center"><RefreshCw className="size-7 animate-spin" aria-label="Kakao Maps 불러오는 중" /></div>}<div className="absolute bottom-3 left-3 rounded-lg bg-white/95 px-3 py-2 text-xs font-bold shadow dark:bg-slate-950/95">{records.length ? "마커는 행정복지센터 검색 결과를 대표 지점으로 사용하며, 원은 실제 행정동 경계가 아닙니다." : "의료기관은 실제 주소의 대표 좌표에 표시됩니다. 방문 전 운영 여부를 확인하세요."}</div></div>;
}

function SchematicMap({ records, selectedCode, onSelect, showWater = true, showDisease = true, showAlerts = true, visits = [], facilities = [], userPosition, className, error }: MapAdapterProps & { error?: boolean }) {
  if (!records.length && facilities.length) {
    const minLat = Math.min(...facilities.map((item) => item.latitude)); const maxLat = Math.max(...facilities.map((item) => item.latitude));
    const minLng = Math.min(...facilities.map((item) => item.longitude)); const maxLng = Math.max(...facilities.map((item) => item.longitude));
    const latSpan = Math.max(maxLat - minLat, 0.01); const lngSpan = Math.max(maxLng - minLng, 0.01);
    return <div className={cn("relative min-h-[560px] overflow-hidden rounded-2xl border border-cyan-200 bg-[radial-gradient(circle_at_center,_#cffafe,_#e0f2fe_45%,_#f8fafc)] dark:border-cyan-900 dark:bg-slate-900", className)} aria-label="목포시 실제 의료기관 위치 대체 지도">
      <div className="absolute left-3 top-3 z-10 max-w-xs rounded-xl bg-white/95 p-3 text-xs shadow dark:bg-slate-950/95"><p className="font-bold">{error ? "Kakao Maps 로딩 실패" : "Kakao Maps 키 미설정"}</p><p className="mt-1">실제 의료기관 좌표를 간이 지도에 표시합니다.</p></div>
      {facilities.map((facility) => { const left = 8 + ((facility.longitude - minLng) / lngSpan) * 84; const top = 90 - ((facility.latitude - minLat) / latSpan) * 76; return <span key={facility.id} style={{ left: `${left}%`, top: `${top}%` }} className="absolute z-20 -translate-x-1/2 -translate-y-1/2" title={facility.name}><MapPin className="size-9 fill-emerald-700 text-white" /><span className="absolute left-1/2 top-full -translate-x-1/2 whitespace-nowrap rounded bg-white p-1 text-xs font-bold text-slate-900 shadow">{facility.name}</span></span>; })}
    </div>;
  }
  if (!records.length) return <div className={cn("grid min-h-[430px] place-items-center rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700",className)}><p><strong>표시할 행정동이 없습니다.</strong><br/><span className="text-sm text-slate-500">검색어나 위험 단계 필터를 바꿔 주세요.</span></p></div>;
  const minLat = Math.min(...records.map((r) => r.latitude)), maxLat = Math.max(...records.map((r) => r.latitude)); const minLng = Math.min(...records.map((r) => r.longitude)), maxLng = Math.max(...records.map((r) => r.longitude));
  return <div className={cn("relative min-h-[430px] overflow-hidden rounded-2xl border border-cyan-200 bg-[radial-gradient(circle_at_center,_#cffafe,_#e0f2fe_45%,_#f8fafc)] dark:border-cyan-900 dark:bg-[radial-gradient(circle_at_center,_#164e63,_#0f172a_50%,_#020617)]", className)} aria-label="목포시 행정동 중심 기반 대체 지도">
    <div className="absolute left-3 top-3 z-10 max-w-xs rounded-xl bg-white/95 p-3 text-xs shadow dark:bg-slate-950/95"><p className="font-bold">{error ? "Kakao Maps 로딩 실패" : "Kakao Maps 키 미설정"}</p><p className="mt-1">행정동 중심 좌표 기반 대체 지도를 표시합니다. 영역은 실제 경계가 아닙니다.</p></div>
    {records.map((record) => { const left = 8 + ((record.longitude-minLng)/(maxLng-minLng))*84; const top = 90 - ((record.latitude-minLat)/(maxLat-minLat))*76; const fill=showDisease?colors[record.riskLevel]:record.waterQualityStatus==="abnormal"?"#c2410c":"#0284c7"; return <button key={record.id} onClick={() => onSelect?.(record.regionCode)} style={{ left:`${left}%`, top:`${top}%`, backgroundColor: fill }} className={cn("map-dot absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white p-2 text-xs font-black text-white hover:z-20 hover:scale-110 focus:z-20", selectedCode===record.regionCode ? "ring-4 ring-cyan-400" : "")} aria-label={`${record.regionName}, ${showDisease?RISK_META[record.riskLevel].label:"수질 "+record.waterQualityStatus}, ${record.riskScore}점`} title={`${record.regionName} · ${RISK_META[record.riskLevel].label}`}><MapPin className="size-4"/>{showWater&&<span className="absolute -right-2 -top-2 grid size-4 place-items-center rounded-full bg-sky-600 text-[9px]" aria-label="수질 레이어">W</span>}{showAlerts&&["caution","warning"].includes(record.riskLevel)&&<span className="absolute -left-2 -top-2 grid size-4 place-items-center rounded-full bg-rose-700 text-[9px]" aria-label="경보 레이어">A</span>}<span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-white/90 px-1 text-[10px] text-slate-900">{record.regionName}</span></button>; })}
    {visits.map((visit)=>{const region=records.find((item)=>item.regionCode===visit.regionCode);if(!region)return null;const left=8+((region.longitude-minLng)/(maxLng-minLng))*84;const top=90-((region.latitude-minLat)/(maxLat-minLat))*76;return <span key={visit.id} style={{left:`${left+2}%`,top:`${top+3}%`}} className="absolute z-20 grid size-5 place-items-center rounded-full bg-violet-700 text-[9px] font-black text-white" title={`${visit.regionName} 방문 기록`}>V</span>})}
    {facilities.map((facility,index)=><span key={facility.id} style={{left:`${12+(index*17)%75}%`,top:`${18+(index*19)%70}%`}} className="absolute z-20 grid size-5 place-items-center rounded-full bg-emerald-700 text-[9px] font-black text-white" title={facility.name}>H</span>)}
    {userPosition&&<span className="absolute left-1/2 top-1/2 z-30 grid size-6 place-items-center rounded-full border-2 border-white bg-violet-700 text-[9px] font-black text-white" title="현재 위치 (대체 지도에서는 중앙 표시)">ME</span>}
  </div>;
}
