import type { Region } from "@/types";

// Coordinates are approximate administrative-dong centers for map demonstration.
// They are not survey-grade boundaries and the generated circular areas are not official boundaries.
export const MOKPO_CENTER = { latitude: 34.8118, longitude: 126.3922 };

export const REGIONS: Region[] = [
  ["46110510", "yongdang-1", "용당1동", 34.8067, 126.3988],
  ["46110520", "yongdang-2", "용당2동", 34.7998, 126.4018],
  ["46110535", "yeon", "연동", 34.8056, 126.3902],
  ["46110545", "sanjeong", "산정동", 34.8165, 126.3865],
  ["46110554", "yeonsan", "연산동", 34.8262, 126.3837],
  ["46110558", "wonsan", "원산동", 34.8212, 126.3752],
  ["46110565", "daeseong", "대성동", 34.8047, 126.3821],
  ["46110595", "mogwon", "목원동", 34.7917, 126.3847],
  ["46110640", "dongmyeong", "동명동", 34.7877, 126.3926],
  ["46110645", "samhak", "삼학동", 34.7886, 126.4028],
  ["46110650", "manho", "만호동", 34.7836, 126.3841],
  ["46110660", "yudal", "유달동", 34.7885, 126.3732],
  ["46110695", "jukgyo", "죽교동", 34.8016, 126.3711],
  ["46110705", "bukhang", "북항동", 34.8127, 126.3644],
  ["46110745", "yonghae", "용해동", 34.8181, 126.4054],
  ["46110750", "iro", "이로동", 34.8088, 126.4177],
  ["46110756", "sang", "상동", 34.8113, 126.4244],
  ["46110757", "hadang", "하당동", 34.8036, 126.4212],
  ["46110758", "sinheung", "신흥동", 34.7986, 126.4295],
  ["46110770", "samhyang", "삼향동", 34.823, 126.4305],
  ["46110780", "ogam", "옥암동", 34.8064, 126.444],
  ["46110790", "buheung", "부흥동", 34.7984, 126.442],
  ["46110800", "buju", "부주동", 34.8141, 126.4522],
].map(([code, slug, name, latitude, longitude]) => ({
  code: String(code), slug: String(slug), name: String(name), latitude: Number(latitude), longitude: Number(longitude),
}));

export const REGION_BY_CODE = new Map(REGIONS.map((region) => [region.code, region]));
export const REGION_BY_SLUG = new Map(REGIONS.map((region) => [region.slug, region]));

export const REGION_ADJACENCY: Record<string, string[]> = Object.fromEntries(
  REGIONS.map((region, index) => [region.code, [REGIONS[(index + REGIONS.length - 1) % REGIONS.length].code, REGIONS[(index + 1) % REGIONS.length].code, ...(index + 4 < REGIONS.length ? [REGIONS[index + 4].code] : [])]])
);
