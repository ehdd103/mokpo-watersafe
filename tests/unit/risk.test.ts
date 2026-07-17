import { describe, expect, it } from "vitest";
import { calculateRisk } from "@/features/risk/calculate-risk";

const base={confirmedCases:0,caseGrowthRate:0,suspectedCases:0,measuredValue:.3,thresholdValue:1,adjacentRiskLevels:[] as const,observedAt:"2026-07-16T09:00:00+09:00",calculatedAt:"2026-07-16T12:00:00+09:00",activeAlert:false};
describe("위험도 계산",()=>{
  it("점수를 0~100 범위로 제한하고 높은 복합 위험을 경계로 분류한다",()=>{const value=calculateRisk({...base,confirmedCases:100,caseGrowthRate:.5,suspectedCases:30,measuredValue:2,adjacentRiskLevels:["warning"],activeAlert:true});expect(value.score).toBeGreaterThanOrEqual(0);expect(value.score).toBeLessThanOrEqual(100);expect(value.level).toBe("warning");});
  it("필수 데이터 누락을 정보 없음과 낮은 신뢰도로 처리한다",()=>{const value=calculateRisk({...base,confirmedCases:null,observedAt:null});expect(value.level).toBe("unknown");expect(value.missingData).toBe(true);expect(value.confidence).toBe("low");});
  it("48시간을 넘긴 데이터를 오래된 데이터로 판정한다",()=>{const value=calculateRisk({...base,observedAt:"2026-07-12T09:00:00+09:00"});expect(value.confidence).toBe("low");expect(value.reasons.join(" ")).toContain("오래되어");});
});
