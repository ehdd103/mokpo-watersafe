import type { Visit } from "@/types";

const STOPS = [
  { regionCode: "46110554", regionName: "연산동", startTime: "07:40", endTime: "08:20", note: "가상 출발 · 연산동 주거지 인근" },
  { regionCode: "46110745", regionName: "용해동", startTime: "08:35", endTime: "09:10", note: "가상 경유 · 용해동 생활권" },
  { regionCode: "46110756", regionName: "상동", startTime: "09:30", endTime: "11:20", note: "가상 방문 · 목포종합버스터미널 인근" },
  { regionCode: "46110757", regionName: "하당동", startTime: "12:00", endTime: "13:20", note: "가상 방문 · 하당 상업지구" },
  { regionCode: "46110780", regionName: "옥암동", startTime: "14:00", endTime: "15:30", note: "가상 방문 · 옥암동 생활권" },
  { regionCode: "46110800", regionName: "부주동", startTime: "16:00", endTime: "17:20", note: "가상 도착 · 부주동 주거지 인근" },
] as const;

export function createDemoMovementRoute(date: string): Visit[] {
  return STOPS.map((stop, index) => ({
    id: `demo-route-${date}-${index + 1}`,
    ...stop,
    startDate: date,
    endDate: date,
    sequence: index + 1,
    consent: false,
    createdAt: `${date}T${stop.startTime}:00+09:00`,
    isMock: true,
  }));
}
