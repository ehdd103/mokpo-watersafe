import { beforeEach, describe, expect, it, vi } from "vitest";

const upsert=vi.fn().mockResolvedValue({error:null});
const from=vi.fn(()=>({upsert}));
vi.mock("@/lib/supabase/browser",()=>({createSupabaseBrowserClient:()=>({auth:{getUser:vi.fn().mockResolvedValue({data:{user:{id:"user-1"}},error:null})},from})}));
describe("로그인 사용자 동의 저장",()=>{beforeEach(()=>{upsert.mockClear();from.mockClear();});it("명시적으로 동의한 방문만 사용자 범위로 저장한다",async()=>{const {syncConsentedVisit}=await import("@/services/visit-storage");const base={id:"client-1",regionCode:"46110756",regionName:"상동",note:"",startDate:"2026-07-12",endDate:"2026-07-12",createdAt:"2026-07-12T00:00:00Z"};await syncConsentedVisit({...base,consent:false});expect(upsert).not.toHaveBeenCalled();await syncConsentedVisit({...base,consent:true});expect(from).toHaveBeenCalledWith("visit_histories");expect(upsert).toHaveBeenCalledWith(expect.objectContaining({user_id:"user-1",client_id:"client-1"}),{onConflict:"user_id,client_id"});});});
