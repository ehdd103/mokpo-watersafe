export type RiskLevel = "unknown" | "normal" | "interest" | "caution" | "warning";
export type Confidence = "low" | "medium" | "high";

export type Region = {
  code: string;
  slug: string;
  name: string;
  latitude: number;
  longitude: number;
};

export type MockRiskRecord = {
  id: string;
  regionCode: string;
  regionName: string;
  latitude: number;
  longitude: number;
  riskLevel: RiskLevel;
  riskScore: number;
  diseaseType: string;
  confirmedCaseCount: number;
  suspectedCaseCount: number;
  waterQualityStatus: "normal" | "abnormal" | "unknown";
  pollutantType: string;
  measuredValue: number | null;
  thresholdValue: number | null;
  observedAt: string;
  publishedAt: string;
  expiresAt: string | null;
  reasons: string[];
  confidence: Confidence;
  missingData: boolean;
  isMock: true;
  scenarioId: string;
};

export type RiskCalculationResult = {
  level: RiskLevel;
  score: number;
  reasons: string[];
  calculatedAt: string;
  confidence: Confidence;
  missingData: boolean;
};

export type Visit = {
  id: string;
  regionCode: string;
  regionName: string;
  note: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  sequence?: number;
  consent: boolean;
  createdAt: string;
  isMock?: boolean;
};

export type HealthAlert = {
  id: string;
  regionCode: string;
  regionName: string;
  level: RiskLevel;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string | null;
  publishedAt: string;
  active: boolean;
  isMock: true;
};

export type VisitMatch = {
  id: string;
  visit: Visit;
  record: MockRiskRecord;
  overlaps: boolean;
  announcedAfterVisit: boolean;
  severity: RiskLevel;
  messages: string[];
};

export type HealthcareFacility = {
  id: string;
  name: string;
  type: "hospital" | "clinic" | "emergency" | "health-center";
  regionCode: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  departments: string[];
  hours: string;
  emergency: boolean;
  distanceKm: number;
  isMock: boolean;
};

export type NotificationItem = {
  id: string;
  type: "risk-rise" | "visit-alert" | "case-surge" | "water" | "data-update" | "resolved" | "missing" | "stale";
  title: string;
  regionName: string;
  level: RiskLevel;
  createdAt: string;
  description: string;
  href: string;
  read: boolean;
  isMock: true;
};

export type Scenario = {
  id: string;
  name: string;
  description: string;
  initialRegionCode: string;
  seed: string;
  flags?: { noFacilities?: boolean; providerError?: boolean; offline?: boolean; locationDenied?: boolean };
};

export type SimulationSettings = {
  seed: string;
  startDate: string;
  endDate: string;
  initialRegionCode: string;
  initialCases: number;
  dailyGrowthRate: number;
  spreadSpeed: number;
  maxCases: number;
  resolveSpeed: number;
  waterAnomalyProbability: number;
  missingProbability: number;
  staleProbability: number;
};
