import { describe, expect, it } from "vitest";
import { SCENARIOS } from "@/config/scenarios";
import { generateRecords } from "@/features/simulation/generate";

describe("가상 시나리오 생성",()=>{
  const scenario=SCENARIOS.find((item)=>item.id==="gradual-spread")!;
  it("같은 seed와 날짜는 동일한 결과를 만든다",()=>{const a=generateRecords(scenario,"2026-07-16",{seed:"same"});const b=generateRecords(scenario,"2026-07-16",{seed:"same"});expect(a).toEqual(b);});
  it("모든 위험 데이터는 가상 집계 데이터다",()=>{const records=generateRecords(scenario,"2026-07-16");expect(records).toHaveLength(23);expect(records.every((item)=>item.isMock&&item.confirmedCaseCount>=0)).toBe(true);});
  it("누락 시나리오는 누락 레코드를 재현한다",()=>{const missing=SCENARIOS.find((item)=>item.id==="missing-data")!;expect(generateRecords(missing,"2026-07-16").some((item)=>item.missingData)).toBe(true);});
  it("전체 정상 시나리오는 모든 행정동을 정상으로 유지한다",()=>{const normal=SCENARIOS.find((item)=>item.id==="all-normal")!;expect(generateRecords(normal,"2026-07-16").every((item)=>item.riskLevel==="normal"&&!item.missingData&&item.waterQualityStatus==="normal")).toBe(true);});
});
