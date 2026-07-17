import type { HealthcareFacility, MockRiskRecord, Visit } from "@/types";
export type MapAdapterProps = { records: MockRiskRecord[]; selectedCode?: string; onSelect?: (code: string) => void; showWater?: boolean; showDisease?: boolean; showAlerts?: boolean; visits?: Visit[]; facilities?: HealthcareFacility[]; userPosition?: { latitude: number; longitude: number }; className?: string };
export interface MapAdapter { name: string; Component: React.ComponentType<MapAdapterProps>; }
