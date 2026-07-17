import { differenceInHours, parseISO } from "date-fns";
import { RISK_THRESHOLDS, STALE_AFTER_HOURS } from "@/config/risk";
import type { Confidence, RiskCalculationResult, RiskLevel } from "@/types";

export type RiskInput = {
  confirmedCases: number | null;
  caseGrowthRate: number | null;
  suspectedCases: number | null;
  measuredValue: number | null;
  thresholdValue: number | null;
  adjacentRiskLevels: readonly RiskLevel[];
  observedAt: string | null;
  calculatedAt: string;
  activeAlert: boolean;
};

export function scoreToLevel(score: number): Exclude<RiskLevel, "unknown"> {
  if (score <= RISK_THRESHOLDS.normal.max) return "normal";
  if (score <= RISK_THRESHOLDS.interest.max) return "interest";
  if (score <= RISK_THRESHOLDS.caution.max) return "caution";
  return "warning";
}

export function calculateRisk(input: RiskInput): RiskCalculationResult {
  const missingData = input.confirmedCases === null || input.observedAt === null;
  let score = 0;
  const reasons: string[] = [];

  if (input.confirmedCases !== null) {
    score += Math.min(25, input.confirmedCases * 1.5);
    if (input.confirmedCases > 0) reasons.push("최근 집계 기간에 가상 확진 사례가 있습니다.");
  }
  if ((input.caseGrowthRate ?? 0) > 0.2) { score += 15; reasons.push("최근 3일간 가상 확진 건수가 증가했습니다."); }
  if ((input.suspectedCases ?? 0) > 0) { score += Math.min(10, (input.suspectedCases ?? 0) * 0.7); reasons.push("가상 의심 사례 집계가 있습니다."); }
  if (input.measuredValue !== null && input.thresholdValue !== null && input.measuredValue > input.thresholdValue) {
    score += 25; reasons.push("가상 수질 측정값이 설정된 시연 기준치를 초과했습니다.");
  }
  if (input.adjacentRiskLevels.some((level) => level === "warning" || level === "caution")) {
    score += 8; reasons.push("인접 행정동에서 가상 주의 이상 상태가 표시됩니다.");
  }
  if (input.activeAlert) { score += 12; reasons.push("활성 가상 보건 경보가 있습니다."); }

  let stale = false;
  if (input.observedAt) {
    stale = differenceInHours(parseISO(input.calculatedAt), parseISO(input.observedAt)) > STALE_AFTER_HOURS;
    if (stale) { score += 4; reasons.push("데이터가 오래되어 신뢰도가 낮습니다."); }
  }
  if (missingData) reasons.push("일부 필수 데이터가 누락되어 정확한 비교가 어렵습니다.");

  score = Math.max(0, Math.min(100, Math.round(score)));
  const confidence: Confidence = missingData || stale ? "low" : input.suspectedCases === null ? "medium" : "high";
  return {
    level: missingData && score < 20 ? "unknown" : scoreToLevel(score),
    score,
    reasons: reasons.length ? reasons : ["현재 생성된 가상 지표가 시연 정상 범위입니다."],
    calculatedAt: input.calculatedAt,
    confidence,
    missingData,
  };
}
