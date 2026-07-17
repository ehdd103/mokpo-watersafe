import { addDays, differenceInCalendarDays, formatISO, parseISO, subHours } from "date-fns";
import { REGION_ADJACENCY, REGIONS } from "@/config/regions";
import { calculateRisk } from "@/features/risk/calculate-risk";
import { seededRandom } from "./random";
import type { MockRiskRecord, Scenario, SimulationSettings } from "@/types";

export const DEFAULT_SETTINGS: SimulationSettings = {
  seed: "mokpo-watersafe-2026",
  startDate: "2026-07-01",
  endDate: "2026-08-15",
  initialRegionCode: "46110756",
  initialCases: 3,
  dailyGrowthRate: 0.22,
  spreadSpeed: 3,
  maxCases: 80,
  resolveSpeed: 0.12,
  waterAnomalyProbability: 0.12,
  missingProbability: 0.05,
  staleProbability: 0.07,
};

function graphDistance(from: string, to: string): number {
  if (from === to) return 0;
  const visited = new Set([from]);
  let frontier = [from];
  for (let distance = 1; distance < 10; distance += 1) {
    frontier = frontier.flatMap((code) => REGION_ADJACENCY[code] ?? []).filter((code) => !visited.has(code));
    if (frontier.includes(to)) return distance;
    frontier.forEach((code) => visited.add(code));
  }
  return 9;
}

export function generateRecords(scenario: Scenario, date: string, overrides: Partial<SimulationSettings> = {}): MockRiskRecord[] {
  const settings = { ...DEFAULT_SETTINGS, ...overrides, seed: overrides.seed ?? scenario.seed, initialRegionCode: overrides.initialRegionCode ?? scenario.initialRegionCode };
  const day = Math.max(0, differenceInCalendarDays(parseISO(date), parseISO(settings.startDate)));
  const random = seededRandom(`${settings.seed}:${scenario.id}:${date}`);

  return REGIONS.map((region, index) => {
    const distance = graphDistance(settings.initialRegionCode, region.code);
    const arrivalDay = distance * settings.spreadSpeed;
    const activeDays = Math.max(0, day - arrivalDay);
    const allowsSpread = ["gradual-spread", "alert-rising", "alert-falling", "visit-new-alert"].includes(scenario.id);
    const focal = region.code === settings.initialRegionCode;
    const multi = scenario.id === "multi-outbreak" && index % 4 === 0;
    let cases = 0;
    if (scenario.id !== "all-normal" && scenario.id !== "water-anomaly" && scenario.id !== "no-facilities") {
      if (focal || multi || (allowsSpread && day >= arrivalDay)) {
        const growth = settings.initialCases * Math.pow(1 + settings.dailyGrowthRate, Math.min(activeDays, 12));
        const decay = activeDays > 12 ? Math.pow(1 - settings.resolveSpeed, activeDays - 12) : 1;
        cases = Math.min(settings.maxCases, Math.round(growth * decay + random() * 3));
      }
    }
    if (scenario.id === "alert-resolved") cases = 0;
    if (scenario.id === "alert-falling") cases = Math.round(cases * Math.max(0.15, 1 - day / 35));

    const missing = scenario.id === "all-normal" ? false : scenario.id === "missing-data" ? index % 3 === 0 : random() < settings.missingProbability;
    const stale = scenario.id === "all-normal" ? false : scenario.id === "stale-data" ? index % 2 === 0 : random() < settings.staleProbability;
    const waterAbnormal = scenario.id === "alert-resolved" ? false : (scenario.id === "water-anomaly" && focal) || (scenario.id !== "all-normal" && random() < settings.waterAnomalyProbability && (focal || multi));
    const thresholdValue = 1;
    const measuredValue = missing ? null : waterAbnormal ? Number((1.15 + random() * 0.9).toFixed(2)) : Number((0.2 + random() * 0.55).toFixed(2));
    const observedAt = formatISO(stale ? subHours(parseISO(`${date}T09:00:00+09:00`), 72) : parseISO(`${date}T09:00:00+09:00`));
    const result = calculateRisk({
      confirmedCases: missing ? null : cases,
      caseGrowthRate: cases > 2 ? settings.dailyGrowthRate : 0,
      suspectedCases: missing ? null : Math.round(cases * 0.45),
      measuredValue,
      thresholdValue,
      adjacentRiskLevels: distance === 1 && cases > 0 ? ["caution"] : [],
      observedAt: missing ? null : observedAt,
      calculatedAt: formatISO(parseISO(`${date}T12:00:00+09:00`)),
      activeAlert: cases >= 4 || waterAbnormal,
    });

    return {
      id: `${scenario.id}-${date}-${region.code}`,
      regionCode: region.code,
      regionName: region.name,
      latitude: region.latitude,
      longitude: region.longitude,
      riskLevel: result.level,
      riskScore: result.score,
      diseaseType: "가상 급성 위장관 감염",
      confirmedCaseCount: missing ? 0 : cases,
      suspectedCaseCount: missing ? 0 : Math.round(cases * 0.45),
      waterQualityStatus: missing ? "unknown" : waterAbnormal ? "abnormal" : "normal",
      pollutantType: waterAbnormal ? "가상 미생물 지표 A" : "가상 종합 지표",
      measuredValue,
      thresholdValue: missing ? null : thresholdValue,
      observedAt,
      publishedAt: formatISO(parseISO(`${date}T12:00:00+09:00`)),
      expiresAt: cases > 0 || waterAbnormal ? formatISO(addDays(parseISO(date), 3)) : null,
      reasons: result.reasons,
      confidence: result.confidence,
      missingData: result.missingData,
      isMock: true,
      scenarioId: scenario.id,
    };
  });
}
