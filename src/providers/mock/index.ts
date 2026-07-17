import { SCENARIOS } from "@/config/scenarios";
import { MOCK_FACILITIES } from "@/data/facilities";
import { generateRecords } from "@/features/simulation/generate";
import type { DiseaseCaseProvider, HealthAlertProvider, HealthcareFacilityProvider, WaterQualityProvider } from "@/providers/contracts";
import type { Scenario } from "@/types";

class MockDataSource {
  constructor(protected scenario: Scenario) {}
  records(date: string) {
    if (this.scenario.flags?.providerError) throw new Error("가상 데이터 공급자 오류 시나리오");
    return generateRecords(this.scenario, date);
  }
}

export class MockWaterQualityProvider extends MockDataSource implements WaterQualityProvider {
  async getRecords(date: string) { return this.records(date); }
}
export class MockDiseaseCaseProvider extends MockDataSource implements DiseaseCaseProvider {
  async getCases(date: string) { return this.records(date); }
}
export class MockHealthAlertProvider extends MockDataSource implements HealthAlertProvider {
  async getAlerts(date: string) {
    return this.records(date).filter((record) => record.riskLevel === "caution" || record.riskLevel === "warning").map((record) => ({
      id: `alert-${record.id}`, regionCode: record.regionCode, regionName: record.regionName, level: record.riskLevel,
      title: `${record.regionName} 가상 ${record.riskLevel === "warning" ? "경계" : "주의"} 경보`,
      description: record.reasons[0], startsAt: record.observedAt, endsAt: record.expiresAt,
      publishedAt: record.publishedAt, active: true, isMock: true as const,
    }));
  }
}
export class MockHealthcareFacilityProvider implements HealthcareFacilityProvider {
  constructor(private scenario: Scenario) {}
  async getFacilities() { return this.scenario.flags?.noFacilities ? [] : MOCK_FACILITIES; }
}

export function createMockProviders(scenarioId: string) {
  const scenario = SCENARIOS.find((item) => item.id === scenarioId) ?? SCENARIOS[3];
  return {
    water: new MockWaterQualityProvider(scenario), disease: new MockDiseaseCaseProvider(scenario),
    alerts: new MockHealthAlertProvider(scenario), facilities: new MockHealthcareFacilityProvider(scenario),
  };
}
