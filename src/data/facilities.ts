import { MOKPO_CENTER, REGION_BY_CODE } from "@/config/regions";
import type { HealthcareFacility } from "@/types";

type FacilityCategory = "general" | "internal" | "pediatric" | "orthopedic" | "surgery" | "ent" | "respiratory" | "nursing" | "dental" | "oriental";
type FacilitySeed = {
  id: string;
  name: string;
  address: string;
  phone: string;
  regionCode: string;
  category: FacilityCategory;
  emergency?: boolean;
  emergencyCenter?: boolean;
};

// 기관명·주소·대표전화: 목포시 병원현황(2025-08-22) 공공데이터 42개 전체.
const FACILITY_SEEDS: FacilitySeed[] = [
  { id: "mokpo-christian-hospital", name: "목포기독병원", address: "전라남도 목포시 백년대로 303 (상동)", phone: "061-280-7500", regionCode: "46110756", category: "general", emergency: true },
  { id: "mokpo-city-medical-center", name: "목포시의료원", address: "전라남도 목포시 이로로 18 (용해동)", phone: "061-260-6500", regionCode: "46110745", category: "general", emergency: true },
  { id: "mokpo-hankook-hospital", name: "목포한국병원", address: "전라남도 목포시 영산로 483 (상동)", phone: "061-270-5500", regionCode: "46110756", category: "general", emergency: true, emergencyCenter: true },
  { id: "mokpo-jungang-hospital", name: "목포중앙병원", address: "전라남도 목포시 영산로 627 (석현동)", phone: "061-280-3000", regionCode: "46110770", category: "general", emergency: true },
  { id: "sean-general-hospital", name: "세안종합병원", address: "전라남도 목포시 고하대로 795-2 (연산동)", phone: "061-260-6700", regionCode: "46110554", category: "general" },
  { id: "national-mokpo-hospital", name: "국립목포병원", address: "전라남도 목포시 신지마을1길 75 (석현동)", phone: "061-280-1114", regionCode: "46110770", category: "respiratory" },
  { id: "madi-orthopedic-hospital", name: "마디정형외과병원", address: "전라남도 목포시 백년대로 298, 4·5층 (상동)", phone: "061-287-0875", regionCode: "46110756", category: "orthopedic" },
  { id: "mokpo-nodong-hospital", name: "목포노동병원", address: "전라남도 목포시 수강로12번길 11-1 (행복동2가)", phone: "061-242-5621", regionCode: "46110650", category: "general" },
  { id: "mokpo-mirae-hospital", name: "목포미래병원", address: "전라남도 목포시 녹색로 41 (석현동)", phone: "061-800-1000", regionCode: "46110770", category: "orthopedic" },
  { id: "mokpo-miz-i-hospital", name: "목포미즈아이병원", address: "전라남도 목포시 백년대로 418 (옥암동)", phone: "061-260-8000", regionCode: "46110780", category: "pediatric" },
  { id: "mokpo-shinsegae-hospital", name: "목포신세계병원", address: "전라남도 목포시 백년대로 258 (상동)", phone: "061-274-9000", regionCode: "46110756", category: "orthopedic" },
  { id: "mokpo-childrens-hospital", name: "목포아동병원", address: "전라남도 목포시 옥암로 149 (상동)", phone: "061-801-8000", regionCode: "46110756", category: "pediatric" },
  { id: "mokpo-yehyang-hospital", name: "목포예향병원", address: "전라남도 목포시 삼학로223번길 38 (산정동)", phone: "061-245-0575", regionCode: "46110545", category: "general" },
  { id: "mokpo-jangmun-surgery-hospital", name: "목포장문외과병원", address: "전라남도 목포시 백년대로 322 (상동)", phone: "061-284-0975", regionCode: "46110756", category: "surgery" },
  { id: "mokpo-cheongdam-hospital", name: "목포청담병원", address: "전라남도 목포시 청호로 109 (산정동)", phone: "061-272-3333", regionCode: "46110545", category: "general" },
  { id: "mokpo-hansarang-hospital", name: "목포한사랑병원", address: "전라남도 목포시 백년대로 335 (상동)", phone: "061-280-5500", regionCode: "46110756", category: "general" },
  { id: "mokpo-hyundai-hospital", name: "목포현대병원", address: "전라남도 목포시 용당로 322-1 (용해동)", phone: "061-272-7588", regionCode: "46110745", category: "general" },
  { id: "solton-hospital", name: "솔튼병원", address: "전라남도 목포시 고하대로 724 (산정동)", phone: "061-272-7575", regionCode: "46110545", category: "general" },
  { id: "sinan-hospital", name: "신안병원", address: "전라남도 목포시 산정로 12 (동명동)", phone: "061-242-0505", regionCode: "46110640", category: "general" },
  { id: "jeil-internal-hospital", name: "제일내과병원", address: "전라남도 목포시 섶나루길 126, 2·6·8층 (상동)", phone: "061-287-8000", regionCode: "46110756", category: "internal" },
  { id: "joyeon-ent-hospital", name: "조연이비인후과병원", address: "전라남도 목포시 백년대로 298 (상동)", phone: "061-287-6610", regionCode: "46110756", category: "ent" },
  { id: "mokpo-better-nursing-hospital", name: "목포더좋은요양병원", address: "전라남도 목포시 용당로 334 (용해동)", phone: "061-246-7000", regionCode: "46110745", category: "nursing" },
  { id: "mokpo-rehabilitation-nursing-hospital", name: "목포재활요양병원", address: "전라남도 목포시 영산로 627 (석현동)", phone: "061-280-6800", regionCode: "46110770", category: "nursing" },
  { id: "bubu-nursing-hospital", name: "부부요양병원", address: "전라남도 목포시 영산로 620-1 (석현동)", phone: "061-989-9000", regionCode: "46110770", category: "nursing" },
  { id: "beautiful-nursing-hospital", name: "아름다운요양병원", address: "전라남도 목포시 백년대로 267 (상동)", phone: "061-282-8100", regionCode: "46110756", category: "nursing" },
  { id: "okam-hill-nursing-hospital", name: "옥암힐요양병원", address: "전라남도 목포시 남악1로52번길 11-4 (옥암동)", phone: "061-281-7554", regionCode: "46110780", category: "nursing" },
  { id: "mokpo-seongsim-nursing-hospital", name: "목포성심요양병원", address: "전라남도 목포시 영산로844번길 13 (대양동)", phone: "061-283-5400", regionCode: "46110770", category: "nursing" },
  { id: "mokpo-nursing-hospital", name: "목포요양병원", address: "전라남도 목포시 해안로 243-3 (행복동1가)", phone: "061-276-3355", regionCode: "46110650", category: "nursing" },
  { id: "mokpo-siloam-nursing-hospital", name: "목포실로암요양병원", address: "전라남도 목포시 영산로 143 (호남동)", phone: "061-245-7777", regionCode: "46110595", category: "nursing" },
  { id: "jeongdaun-nursing-hospital", name: "정다운요양병원", address: "전라남도 목포시 영산로 710-11, 7동 (석현동)", phone: "061-288-9988", regionCode: "46110770", category: "nursing" },
  { id: "hyoseong-nursing-hospital", name: "효성요양병원", address: "전라남도 목포시 양을로 456 (상동)", phone: "061-800-5500", regionCode: "46110756", category: "nursing" },
  { id: "mir-dental-hospital", name: "미르치과병원", address: "전라남도 목포시 백년대로 319 (상동)", phone: "061-280-8800", regionCode: "46110756", category: "dental" },
  { id: "yedam-dental-hospital", name: "예닮치과병원", address: "전라남도 목포시 비파로 91 (상동)", phone: "061-284-7528", regionCode: "46110756", category: "dental" },
  { id: "365-maeil-oriental-hospital", name: "365매일한방병원", address: "전라남도 목포시 하당로 253 (상동)", phone: "061-282-7365", regionCode: "46110756", category: "oriental" },
  { id: "dongmyeong-oriental-hospital", name: "동명한방병원", address: "전라남도 목포시 백년대로 292 (상동)", phone: "061-245-3377", regionCode: "46110756", category: "oriental" },
  { id: "dongsin-mokpo-oriental-hospital", name: "동신대학교부속 목포한방병원", address: "전라남도 목포시 백년대로 313 (상동)", phone: "061-280-7700", regionCode: "46110756", category: "oriental" },
  { id: "mokpo-wonkwang-oriental-hospital", name: "목포원광한방병원", address: "전라남도 목포시 하당로153번길 14 (상동)", phone: "061-283-8004", regionCode: "46110756", category: "oriental" },
  { id: "mokpo-cheongyeon-oriental-hospital", name: "목포청연한방병원", address: "전라남도 목포시 청호로 6-1 (호남동)", phone: "061-982-3000", regionCode: "46110595", category: "oriental" },
  { id: "seoul-oriental-hospital", name: "서울한방병원", address: "전라남도 목포시 삼향천로 106 (옥암동)", phone: "061-287-8566", regionCode: "46110780", category: "oriental" },
  { id: "yaksu-oriental-hospital", name: "약수한방병원", address: "전라남도 목포시 옥암로 190, 2~5층 (석현동)", phone: "061-287-7585", regionCode: "46110770", category: "oriental" },
  { id: "pyeonan-oriental-hospital", name: "편안한방병원", address: "전라남도 목포시 옥암로 77-1 (상동)", phone: "061-287-8573", regionCode: "46110756", category: "oriental" },
  { id: "hanguk-oriental-hospital", name: "한국한방병원", address: "전라남도 목포시 옥암로 121, 1동 (상동)", phone: "061-261-0075", regionCode: "46110756", category: "oriental" },
];

const VERIFIED_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  "mokpo-christian-hospital": { latitude: 34.80435, longitude: 126.42057 },
  "mokpo-city-medical-center": { latitude: 34.803913, longitude: 126.404882 },
  "mokpo-hankook-hospital": { latitude: 34.8094, longitude: 126.41636 },
  "mokpo-jungang-hospital": { latitude: 34.82088, longitude: 126.42093 },
  "sean-general-hospital": { latitude: 34.81693, longitude: 126.38033 },
};

const DEPARTMENTS: Record<FacilityCategory, string[]> = {
  general: ["내과"], internal: ["내과"], pediatric: ["소아청소년과"], orthopedic: ["정형외과"], surgery: ["외과"], ent: ["이비인후과"], respiratory: ["호흡기 진료"], nursing: ["요양·재활"], dental: ["치과"], oriental: ["한방진료"],
};

function distanceFromCenter(latitude: number, longitude: number) {
  const toRad = (value: number) => value * Math.PI / 180;
  const dLat = toRad(latitude - MOKPO_CENTER.latitude); const dLng = toRad(longitude - MOKPO_CENTER.longitude);
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(MOKPO_CENTER.latitude)) * Math.cos(toRad(latitude)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

export const HEALTHCARE_FACILITIES: HealthcareFacility[] = FACILITY_SEEDS.map((seed) => {
  const region = REGION_BY_CODE.get(seed.regionCode);
  const coordinates = VERIFIED_COORDINATES[seed.id] ?? { latitude: region?.latitude ?? MOKPO_CENTER.latitude, longitude: region?.longitude ?? MOKPO_CENTER.longitude };
  return {
    id: seed.id,
    name: seed.name,
    type: seed.emergencyCenter ? "emergency" : "hospital",
    regionCode: seed.regionCode,
    address: seed.address,
    phone: seed.phone,
    ...coordinates,
    departments: seed.emergency ? [...DEPARTMENTS[seed.category], "응급의학과"] : DEPARTMENTS[seed.category],
    hours: seed.emergencyCenter ? "권역응급의료센터 운영·수용 가능 여부는 119 확인" : "진료시간·당일 진료 여부는 전화 확인",
    emergency: Boolean(seed.emergency),
    distanceKm: distanceFromCenter(coordinates.latitude, coordinates.longitude),
    isMock: false,
  };
});
