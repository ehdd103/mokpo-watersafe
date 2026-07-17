import { describe, expect, it } from "vitest";
import { filterRiskRecords } from "@/components/map/risk-map-experience";
import { generateRecords } from "@/features/simulation/generate";
import { SCENARIOS } from "@/config/scenarios";
describe("지도 필터",()=>{it("행정동 검색과 위험 단계를 함께 적용한다",()=>{const records=generateRecords(SCENARIOS[3],"2026-07-16");const target=records.find((item)=>item.regionName==="상동")!;expect(filterRiskRecords(records,"상",target.riskLevel).map((item)=>item.regionName)).toContain("상동");});});
