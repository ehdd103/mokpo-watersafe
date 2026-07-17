"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <div role="alert" className="rounded-2xl border border-rose-300 bg-rose-50 p-8 text-center dark:bg-rose-950"><h1 className="text-2xl font-black">화면을 불러오지 못했습니다</h1><p className="mt-2 text-sm">가상 데이터 또는 네트워크를 확인한 뒤 다시 시도해 주세요. 사이트의 다른 메뉴는 계속 이용할 수 있습니다.</p><Button className="mt-5" onClick={reset}>다시 시도</Button></div>; }
