import { describe, expect, it } from "vitest";
import { matchVisits } from "@/features/visits/match-visits";
import { generateRecords } from "@/features/simulation/generate";
import { SCENARIOS } from "@/config/scenarios";

describe("방문 날짜와 확진자 발생 기간 비교",()=>{it("같은 행정동과 같은 날짜에 가상 확진자가 있으면 겹침으로 표시한다",()=>{const records=generateRecords(SCENARIOS.find((item)=>item.id==="visit-new-alert")!,"2026-07-16");const visit={id:"v1",regionCode:"46110756",regionName:"상동",note:"",startDate:"2026-07-16",endDate:"2026-07-16",consent:true,createdAt:"2026-07-16T00:00:00+09:00"};const result=matchVisits([visit],records);expect(result).toHaveLength(1);expect(result[0].overlaps).toBe(true);expect(result[0].messages.join(" ")).toContain("가상 확진자");});it("날짜가 겹치지 않으면 알림 대상을 만들지 않는다",()=>{const records=generateRecords(SCENARIOS.find((item)=>item.id==="visit-new-alert")!,"2026-07-16");const visit={id:"v2",regionCode:"46110756",regionName:"상동",note:"",startDate:"2026-06-01",endDate:"2026-06-01",consent:true,createdAt:"2026-06-01T00:00:00+09:00"};expect(matchVisits([visit],records)).toHaveLength(0);});});
