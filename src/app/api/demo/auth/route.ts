import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const attempts=new Map<string,{count:number;reset:number}>();
const schema=z.object({code:z.string().min(4).max(100)});
function expectedToken(){return createHash("sha256").update(`${process.env.DEMO_ACCESS_CODE??"watersafe-demo"}:mokpo-watersafe`).digest("hex");}
export async function GET(request:NextRequest){return NextResponse.json({authenticated:request.cookies.get("watersafe-demo")?.value===expectedToken()});}
export async function POST(request:NextRequest){const origin=request.headers.get("origin");const requestHost=request.headers.get("x-forwarded-host")??request.headers.get("host");if(origin&&requestHost){try{if(new URL(origin).host!==requestHost)return NextResponse.json({error:"잘못된 요청 출처"},{status:403});}catch{return NextResponse.json({error:"잘못된 요청 출처"},{status:403});}}const key=request.headers.get("x-forwarded-for")?.split(",")[0]??"local";const now=Date.now();const state=attempts.get(key);if(state&&state.reset>now&&state.count>=8)return NextResponse.json({error:"요청이 너무 많습니다. 잠시 후 다시 시도하세요."},{status:429});const parsed=schema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"접근 코드를 확인하세요."},{status:400});if(parsed.data.code!==(process.env.DEMO_ACCESS_CODE??"watersafe-demo")){attempts.set(key,{count:(state?.reset??0)>now?(state?.count??0)+1:1,reset:now+60_000});return NextResponse.json({error:"접근 코드가 올바르지 않습니다."},{status:401});}attempts.delete(key);const response=NextResponse.json({ok:true});response.cookies.set("watersafe-demo",expectedToken(),{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:60*60*8});return response;}
export async function DELETE(){const response=NextResponse.json({ok:true});response.cookies.set("watersafe-demo","",{httpOnly:true,maxAge:0,path:"/"});return response;}
