"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, BookOpenCheck, Clock3, Hospital, House, Map, Moon, ShieldCheck, Sun, UserRound } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/components/providers/app-store";
import { MockNotice, MOCK_NOTICE } from "@/components/common/mock-notice";
import { SCENARIOS } from "@/config/scenarios";

const navigation = [
  { href: "/", label: "홈", icon: House }, { href: "/map", label: "위험 지도", icon: Map },
  { href: "/visits", label: "방문 이력", icon: Clock3 }, { href: "/facilities", label: "병원 찾기", icon: Hospital },
  { href: "/safety", label: "안전수칙", icon: BookOpenCheck }, { href: "/notifications", label: "알림", icon: Bell },
];

function NavLink({ href, label, icon: Icon, mobile = false }: (typeof navigation)[number] & { mobile?: boolean }) {
  const pathname = usePathname(); const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return <Link href={href} aria-current={active ? "page" : undefined} className={cn("flex items-center rounded-xl font-semibold transition-colors", mobile ? "flex-col gap-1 px-2 py-2 text-[11px]" : "gap-3 px-3 py-2.5 text-sm", active ? "bg-cyan-700 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800")}><Icon className="size-5" aria-hidden />{label}</Link>;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme(); const { notifications, scenarioId } = useAppStore(); const scenario=SCENARIOS.find((item)=>item.id===scenarioId);
  return <div className="min-h-screen pb-20 lg:pb-0">
    <header className="no-print sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-3 px-4">
        <Link href="/" className="flex items-center gap-2 font-black tracking-tight"><span className="grid size-9 place-items-center rounded-xl bg-cyan-700 text-white"><ShieldCheck className="size-5" /></span><span>목포 워터세이프</span></Link>
        <span className="hidden rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-900 sm:inline">가상 데이터</span>
        <div className="ml-auto flex items-center gap-1">
          <Link href="/notifications" className="relative rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label={`읽지 않은 알림 ${notifications.filter((item) => !item.read).length}개`}><Bell className="size-5" />{notifications.some((item) => !item.read) && <span className="absolute right-1 top-1 size-2 rounded-full bg-rose-600" />}</Link>
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="밝은 모드와 어두운 모드 전환"><Sun className="size-5 dark:hidden" /><Moon className="hidden size-5 dark:block" /></Button>
          <Link href="/login" className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="로그인"><UserRound className="size-5" /></Link>
        </div>
      </div>
    </header>
    <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[230px_minmax(0,1fr)]">
      <aside className="no-print sticky top-16 hidden h-[calc(100vh-4rem)] border-r border-slate-200 p-4 lg:block dark:border-slate-800"><nav aria-label="주요 메뉴" className="space-y-1">{navigation.map((item) => <NavLink key={item.href} {...item} />)}</nav><div className="mt-5 border-t border-slate-200 pt-4 text-xs dark:border-slate-800"><Link href="/risk-check" className="block rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">개인 위험 확인</Link><Link href="/data" className="block rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">데이터 설명</Link></div></aside>
      <main id="main-content" className="min-w-0 p-4 sm:p-6 lg:p-8"><MockNotice className="mb-6" />{scenario?.flags&&(scenario.flags.offline||scenario.flags.providerError||scenario.flags.locationDenied)&&<div role="status" className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm font-bold text-amber-950 dark:bg-amber-950 dark:text-amber-100">{scenario.flags.offline&&"네트워크 연결 끊김 시나리오 · 캐시된 가상 데이터를 표시합니다."}{scenario.flags.providerError&&"가상 데이터 공급자 오류 시나리오 · 마지막 정상 가상 데이터로 대체 표시합니다."}{scenario.flags.locationDenied&&"위치 권한 거부 시나리오 · 행정동 검색을 이용해 주세요."}</div>}{children}</main>
    </div>
    <nav aria-label="모바일 주요 메뉴" className="no-print fixed inset-x-0 bottom-0 z-50 grid grid-cols-6 border-t border-slate-200 bg-white px-1 pb-[env(safe-area-inset-bottom)] lg:hidden dark:border-slate-800 dark:bg-slate-950">{navigation.map((item) => <NavLink key={item.href} {...item} mobile />)}</nav>
    <footer className="border-t border-slate-200 bg-white px-4 py-8 text-sm text-slate-600 lg:ml-[230px] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"><div className="mx-auto max-w-5xl"><p className="font-bold text-slate-900 dark:text-slate-100">Mokpo WaterSafe · 해커톤 시연 서비스</p><p className="mt-2">{MOCK_NOTICE}</p><div className="mt-3 flex gap-4"><Link href="/privacy" className="underline">개인정보 처리 안내</Link><Link href="/data" className="underline">데이터 설명</Link></div></div></footer>
  </div>;
}
