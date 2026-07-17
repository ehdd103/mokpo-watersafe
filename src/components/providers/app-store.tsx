"use client";
/* eslint-disable react-hooks/set-state-in-effect -- localStorage hydration intentionally occurs after mount to keep SSR deterministic. */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { SCENARIOS } from "@/config/scenarios";
import { createDemoMovementRoute } from "@/data/demo-movement-route";
import { matchVisits } from "@/features/visits/match-visits";
import { notifyBrowserOfVisitMatches } from "@/services/browser-notifications";
import { getRiskRecords } from "@/services/risk-service";
import { clearAuthenticatedVisits, deleteAuthenticatedVisit, loadAuthenticatedVisits, syncConsentedVisit } from "@/services/visit-storage";
import type { NotificationItem, Visit } from "@/types";
import type { SimulationSettings } from "@/types";
import { DEFAULT_SETTINGS } from "@/features/simulation/generate";

type Preferences = Record<NotificationItem["type"], boolean>;
const defaultPreferences: Preferences = { "risk-rise": true, "visit-alert": true, "case-surge": true, water: true, "data-update": true, resolved: true, missing: true, stale: true };

type Store = {
  scenarioId: string; setScenarioId: (value: string) => void;
  date: string; setDate: (value: string) => void;
  seed: string; setSeed: (value: string) => void;
  simulationSettings: Partial<SimulationSettings>; updateSimulationSettings: (value: Partial<SimulationSettings>) => void;
  visits: Visit[]; saveVisit: (visit: Visit) => void; loadDemoRoute: () => void; deleteVisit: (id: string) => void; clearVisits: () => void;
  favorites: string[]; toggleFavorite: (code: string) => void;
  records: ReturnType<typeof getRiskRecords>;
  matches: ReturnType<typeof matchVisits>;
  notifications: NotificationItem[]; markRead: (id: string) => void;
  preferences: Preferences; setPreference: (key: NotificationItem["type"], value: boolean) => void;
  retentionDays: number; setRetentionDays: (value: number) => void;
  storageAvailable: boolean;
  hydrated: boolean;
};

const AppStoreContext = createContext<Store | null>(null);
const KEYS = { scenario: "watersafe:scenario", date: "watersafe:date", seed: "watersafe:seed", visits: "watersafe:visits", favorites: "watersafe:favorites", preferences: "watersafe:preferences", retention: "watersafe:retention" };

function read<T>(key: string, fallback: T): T {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback; } catch { return fallback; }
}

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [scenarioId, setScenarioIdState] = useState("gradual-spread");
  const [date, setDateState] = useState("2026-07-16");
  const [seed, setSeedState] = useState("mokpo-watersafe-2026");
  const [visits, setVisits] = useState<Visit[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [retentionDays, setRetentionDaysState] = useState(90);
  const [simulationSettings, setSimulationSettings] = useState<Partial<SimulationSettings>>({ initialRegionCode: DEFAULT_SETTINGS.initialRegionCode, dailyGrowthRate: DEFAULT_SETTINGS.dailyGrowthRate, spreadSpeed: DEFAULT_SETTINGS.spreadSpeed, waterAnomalyProbability: DEFAULT_SETTINGS.waterAnomalyProbability, missingProbability: DEFAULT_SETTINGS.missingProbability, staleProbability: DEFAULT_SETTINGS.staleProbability });
  const [readIds, setReadIds] = useState<string[]>([]);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("watersafe:probe", "1"); localStorage.removeItem("watersafe:probe");
      setScenarioIdState(read(KEYS.scenario, "gradual-spread")); setDateState(read(KEYS.date, "2026-07-16"));
      setSeedState(read(KEYS.seed, "mokpo-watersafe-2026")); const retention=read(KEYS.retention,90); const retainedVisits=read<Visit[]>(KEYS.visits,[]).filter((visit)=>differenceInCalendarDays(new Date(),parseISO(visit.endDate))<=retention); setVisits(retainedVisits); localStorage.setItem(KEYS.visits,JSON.stringify(retainedVisits));
      setFavorites(read(KEYS.favorites, [])); setPreferences(read(KEYS.preferences, defaultPreferences));
      setRetentionDaysState(retention); setReadIds(read("watersafe:read", []));
    } catch { setStorageAvailable(false); }
    setHydrated(true);
    void loadAuthenticatedVisits().then((remote) => { if (!remote.length) return; setVisits((current) => { const merged=[...remote,...current.filter((local)=>!remote.some((item)=>item.id===local.id))].sort((a,b)=>b.startDate.localeCompare(a.startDate)); try{localStorage.setItem(KEYS.visits,JSON.stringify(merged));}catch{} return merged; }); }).catch(() => undefined);
  }, []);

  const persist = useCallback(<T,>(key: string, value: T) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { setStorageAvailable(false); } }, []);
  const setScenarioId = (value: string) => { setScenarioIdState(value); persist(KEYS.scenario, value); };
  const setDate = (value: string) => { setDateState(value); persist(KEYS.date, value); };
  const setSeed = (value: string) => { setSeedState(value); persist(KEYS.seed, value); };
  const saveVisit = (visit: Visit) => { setVisits((current) => { const next = [...current.filter((item) => item.id !== visit.id), visit].sort((a, b) => b.startDate.localeCompare(a.startDate)); persist(KEYS.visits, next); return next; }); void syncConsentedVisit(visit).catch(() => undefined); };
  const loadDemoRoute = () => { const route = createDemoMovementRoute(date); setVisits((current) => { const next = [...route, ...current.filter((item) => !item.id.startsWith("demo-route-"))]; persist(KEYS.visits, next); return next; }); };
  const deleteVisit = (id: string) => { setVisits((current) => { const next = current.filter((item) => item.id !== id); persist(KEYS.visits, next); return next; }); void deleteAuthenticatedVisit(id).catch(() => undefined); };
  const clearVisits = () => { setVisits([]); persist(KEYS.visits, []); void clearAuthenticatedVisits().catch(() => undefined); };
  const toggleFavorite = (code: string) => setFavorites((current) => { const next = current.includes(code) ? current.filter((item) => item !== code) : [...current, code]; persist(KEYS.favorites, next); return next; });
  const setPreference = (key: NotificationItem["type"], value: boolean) => setPreferences((current) => { const next = { ...current, [key]: value }; persist(KEYS.preferences, next); return next; });
  const setRetentionDays = (value: number) => { setRetentionDaysState(value); persist(KEYS.retention, value); };

  const updateSimulationSettings = (value: Partial<SimulationSettings>) => setSimulationSettings((current) => ({ ...current, ...value }));
  const records = useMemo(() => getRiskRecords(scenarioId, date, { ...simulationSettings, seed }), [scenarioId, date, seed, simulationSettings]);
  const matches = useMemo(() => matchVisits(visits, records), [visits, records]);
  const notifications = useMemo<NotificationItem[]>(() => {
    const items: NotificationItem[] = [];
    matches.forEach((match) => {
      const id = `visit-match-${match.id}`;
      const time = match.visit.startTime && match.visit.endTime ? ` ${match.visit.startTime}~${match.visit.endTime}` : "";
      items.push({ id, type: "visit-alert", title: `${match.visit.regionName} 가상 동선·확진자 겹침`, regionName: match.visit.regionName, level: match.severity, createdAt: match.record.publishedAt, description: `${match.visit.startDate}${time} 방문 동선이 가상 확진자 발생 기간과 겹칩니다. 가상 확진 집계 ${match.record.confirmedCaseCount}명.`, href: "/visits", read: readIds.includes(id), isMock: true });
    });
    records.forEach((record) => {
      const relevant = favorites.includes(record.regionCode);
      if (relevant && (record.riskLevel === "caution" || record.riskLevel === "warning")) items.push({ id: `risk-${record.id}`, type: "risk-rise", title: `${record.regionName} 가상 위험도 상승`, regionName: record.regionName, level: record.riskLevel, createdAt: record.publishedAt, description: record.reasons[0], href: `/regions/${record.regionCode}`, read: readIds.includes(`risk-${record.id}`), isMock: true });
      if (relevant && record.waterQualityStatus === "abnormal") items.push({ id: `water-${record.id}`, type: "water", title: `${record.regionName} 가상 수질 기준 초과`, regionName: record.regionName, level: record.riskLevel, createdAt: record.publishedAt, description: "시연용 가상 측정값이 가상 기준치를 초과했습니다.", href: `/regions/${record.regionCode}`, read: readIds.includes(`water-${record.id}`), isMock: true });
      if (record.missingData && favorites.includes(record.regionCode)) items.push({ id: `missing-${record.id}`, type: "missing", title: `${record.regionName} 데이터 누락`, regionName: record.regionName, level: "unknown", createdAt: record.publishedAt, description: "일부 가상 데이터가 누락되어 신뢰도가 낮습니다.", href: `/regions/${record.regionCode}`, read: readIds.includes(`missing-${record.id}`), isMock: true });
      if (relevant && record.confirmedCaseCount >= 10) items.push({ id: `surge-${record.id}`, type: "case-surge", title: `${record.regionName} 가상 확진 집계 급증`, regionName: record.regionName, level: record.riskLevel, createdAt: record.publishedAt, description: "설정한 시연 기준보다 가상 집계가 빠르게 증가했습니다.", href: `/regions/${record.regionCode}`, read: readIds.includes(`surge-${record.id}`), isMock: true });
      if (relevant && record.confidence === "low" && !record.missingData) items.push({ id: `stale-${record.id}`, type: "stale", title: `${record.regionName} 데이터가 오래됨`, regionName: record.regionName, level: record.riskLevel, createdAt: record.publishedAt, description: "가상 관측 시각이 오래되어 신뢰도를 낮게 표시합니다.", href: `/regions/${record.regionCode}`, read: readIds.includes(`stale-${record.id}`), isMock: true });
      if (relevant && scenarioId === "alert-resolved") items.push({ id: `resolved-${record.id}`, type: "resolved", title: `${record.regionName} 가상 경보 해제`, regionName: record.regionName, level: "normal", createdAt: record.publishedAt, description: "시연 시나리오에서 이전 가상 경보가 해제되었습니다.", href: `/regions/${record.regionCode}`, read: readIds.includes(`resolved-${record.id}`), isMock: true });
      if (favorites.includes(record.regionCode)) items.push({ id: `update-${record.id}`, type: "data-update", title: `${record.regionName} 가상 데이터 갱신`, regionName: record.regionName, level: record.riskLevel, createdAt: record.publishedAt, description: `${date} 기준 시뮬레이션 데이터로 갱신했습니다.`, href: `/regions/${record.regionCode}`, read: readIds.includes(`update-${record.id}`), isMock: true });
    });
    return items.filter((item) => preferences[item.type]).slice(0, 20);
  }, [records, favorites, matches, readIds, preferences, scenarioId, date]);
  useEffect(() => { if (hydrated) void notifyBrowserOfVisitMatches(notifications); }, [hydrated, notifications]);
  const markRead = (id: string) => setReadIds((current) => { const next = [...new Set([...current, id])]; persist("watersafe:read", next); return next; });

  const value = { scenarioId, setScenarioId, date, setDate, seed, setSeed, simulationSettings, updateSimulationSettings, visits, saveVisit, loadDemoRoute, deleteVisit, clearVisits, favorites, toggleFavorite, records, matches, notifications, markRead, preferences, setPreference, retentionDays, setRetentionDays, storageAvailable, hydrated };
  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const value = useContext(AppStoreContext);
  if (!value) throw new Error("useAppStore must be used inside AppStoreProvider");
  return value;
}

export const defaultScenario = SCENARIOS.find((item) => item.id === "gradual-spread")!;
