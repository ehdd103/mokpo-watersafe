import { areIntervalsOverlapping, endOfDay, isAfter, parseISO, startOfDay } from "date-fns";
import type { MockRiskRecord, Visit, VisitMatch } from "@/types";

export function matchVisits(visits: Visit[], records: MockRiskRecord[]): VisitMatch[] {
  return visits.flatMap((visit) => {
    const record = records.find((item) => item.regionCode === visit.regionCode);
    if (!record || record.confirmedCaseCount < 1) return [];
    const alertEnd = record.expiresAt ?? record.publishedAt;
    const overlaps = areIntervalsOverlapping(
      { start: startOfDay(parseISO(visit.startDate)), end: endOfDay(parseISO(visit.endDate)) },
      { start: parseISO(record.observedAt), end: parseISO(alertEnd) },
    );
    if (!overlaps) return [];
    const announcedAfterVisit = isAfter(parseISO(record.publishedAt), endOfDay(parseISO(visit.endDate)));
    const messages: string[] = [];
    messages.push(`${visit.regionName} 방문 동선과 가상 확진자 발생 기간이 겹칩니다.`);
    messages.push(`해당 지역의 가상 확진 집계는 ${record.confirmedCaseCount}명입니다.`);
    if (announcedAfterVisit) messages.push("방문 이력 등록 이후 새로운 가상 감염병 정보가 발표되었습니다.");
    if (record.missingData) messages.push("데이터가 누락되어 정확한 비교가 어렵습니다.");
    return [{ id: `${visit.id}-${record.id}`, visit, record, overlaps, announcedAfterVisit, severity: record.riskLevel, messages }];
  });
}
