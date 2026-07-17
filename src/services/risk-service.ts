import { SCENARIOS } from "@/config/scenarios";
import { generateRecords } from "@/features/simulation/generate";
import type { MockRiskRecord } from "@/types";
import type { SimulationSettings } from "@/types";

export function getRiskRecords(scenarioId: string, date: string, settings?: string | Partial<SimulationSettings>): MockRiskRecord[] {
  const scenario = SCENARIOS.find((item) => item.id === scenarioId) ?? SCENARIOS[3];
  return generateRecords(scenario, date, typeof settings === "string" ? { seed: settings } : settings);
}

export function summarizeRisk(records: MockRiskRecord[]) {
  const counts = { unknown: 0, normal: 0, interest: 0, caution: 0, warning: 0 };
  records.forEach((record) => { counts[record.riskLevel] += 1; });
  const highest = records.reduce((best, current) => current.riskScore > best.riskScore ? current : best, records[0]);
  return {
    counts, highest,
    confirmed: records.reduce((total, record) => total + record.confirmedCaseCount, 0),
    waterAnomalies: records.filter((record) => record.waterQualityStatus === "abnormal").length,
  };
}
