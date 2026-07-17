import { areIntervalsOverlapping, endOfDay, isAfter, parseISO, startOfDay } from "date-fns";
import type { MockRiskRecord, Visit, VisitMatch } from "@/types";

export function matchVisits(visits: Visit[], records: MockRiskRecord[]): VisitMatch[] {
  return visits.flatMap((visit) => {
    const record = records.find((item) => item.regionCode === visit.regionCode);
    if (!record) return [];
    const alertEnd = record.expiresAt ?? record.publishedAt;
    const overlaps = areIntervalsOverlapping(
      { start: startOfDay(parseISO(visit.startDate)), end: endOfDay(parseISO(visit.endDate)) },
      { start: parseISO(record.observedAt), end: parseISO(alertEnd) },
    );
    const announcedAfterVisit = isAfter(parseISO(record.publishedAt), endOfDay(parseISO(visit.endDate)));
    const messages: string[] = [];
    if (announcedAfterVisit && record.riskLevel !== "normal") messages.push(`${visit.regionName} 방문 이후 새로운 가상 ${record.riskLevel === "warning" ? "경계" : "주의"} 경보가 생성되었습니다.`);
    if (overlaps) messages.push("방문 날짜와 가상 경보 기간이 일부 겹칩니다.");
    if (record.riskLevel === "normal") messages.push("방문 날짜 기준 해당 지역은 가상 정상 단계입니다.");
    if (record.missingData) messages.push("데이터가 누락되어 정확한 비교가 어렵습니다.");
    return [{ id: `${visit.id}-${record.id}`, visit, record, overlaps, announcedAfterVisit, severity: record.riskLevel, messages }];
  });
}
