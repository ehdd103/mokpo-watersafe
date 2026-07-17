import { describe, expect, it } from "vitest";
import { matchVisits } from "@/features/visits/match-visits";
import { generateRecords } from "@/features/simulation/generate";
import { SCENARIOS } from "@/config/scenarios";

describe("방문 날짜와 경보 기간 비교",()=>{it("같은 행정동과 같은 날짜의 가상 경보를 겹침으로 표시한다",()=>{const records=generateRecords(SCENARIOS.find((item)=>item.id==="visit-new-alert")!,"2026-07-16");const visit={id:"v1",regionCode:"46110756",regionName:"상동",note:"",startDate:"2026-07-16",endDate:"2026-07-16",consent:true,createdAt:"2026-07-16T00:00:00+09:00"};const result=matchVisits([visit],records);expect(result).toHaveLength(1);expect(result[0].overlaps).toBe(true);});});
