import type { HealthAlert, HealthcareFacility, MockRiskRecord } from "@/types";

export interface WaterQualityProvider { getRecords(date: string): Promise<MockRiskRecord[]>; }
export interface DiseaseCaseProvider { getCases(date: string): Promise<MockRiskRecord[]>; }
export interface HealthAlertProvider { getAlerts(date: string): Promise<HealthAlert[]>; }
export interface HealthcareFacilityProvider { getFacilities(): Promise<HealthcareFacility[]>; }
