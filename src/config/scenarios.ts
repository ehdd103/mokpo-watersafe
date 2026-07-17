import type { Scenario } from "@/types";

const base = { initialRegionCode: "46110756", seed: "mokpo-watersafe-2026" };
export const SCENARIOS: Scenario[] = [
  { ...base, id: "all-normal", name: "목포시 전체 정상", description: "모든 행정동이 가상 정상 단계입니다." },
  { ...base, id: "water-anomaly", name: "특정 행정동 수질 이상", description: "상동에 가상 수질 이상이 발생합니다." },
  { ...base, id: "disease-outbreak", name: "특정 행정동 가상 감염병 발생", description: "상동에서 집계형 가상 사례가 발생합니다." },
  { ...base, id: "gradual-spread", name: "인접 행정동 점진 확산", description: "상동에서 인접 동으로 규칙 기반 확산합니다." },
  { ...base, id: "multi-outbreak", name: "다수 지역 동시 발생", description: "여러 행정동에 가상 위험이 표시됩니다." },
  { ...base, id: "alert-rising", name: "경보 단계 상승", description: "경보가 점차 상향됩니다." },
  { ...base, id: "alert-falling", name: "경보 단계 하락", description: "정점 이후 경보가 하향됩니다." },
  { ...base, id: "alert-resolved", name: "경보 해제", description: "이전 경보가 해제된 상태입니다." },
  { ...base, id: "missing-data", name: "데이터 누락", description: "일부 공급 데이터가 누락됩니다." },
  { ...base, id: "stale-data", name: "오래된 데이터", description: "일부 데이터 최신성이 낮습니다." },
  { ...base, id: "no-facilities", name: "의료기관 검색 결과 없음", description: "빈 검색 결과를 시연합니다.", flags: { noFacilities: true } },
  { ...base, id: "location-denied", name: "위치 권한 거부", description: "행정동 검색 대체 흐름을 시연합니다.", flags: { locationDenied: true } },
  { ...base, id: "visit-new-alert", name: "방문 지역 새 경보", description: "상동 방문 이후 새 가상 경보가 발생합니다." },
  { ...base, id: "provider-error", name: "외부 데이터 공급자 오류", description: "공급자 오류 대체 UI를 시연합니다.", flags: { providerError: true } },
  { ...base, id: "offline", name: "네트워크 연결 끊김", description: "오프라인 캐시 안내를 시연합니다.", flags: { offline: true } },
];
