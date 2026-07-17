import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

export const MOCK_NOTICE = "본 서비스에 표시되는 수질 오염 및 감염병 정보는 해커톤 시연을 위해 생성된 가상 데이터이며, 실제 목포시의 수질 상태나 감염병 발생 현황과 무관합니다.";
export function MockNotice({ compact = false, className }: { compact?: boolean; className?: string }) {
  return <div role="note" className={cn("flex items-start gap-2 border border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100", compact ? "rounded-lg px-3 py-2 text-xs" : "rounded-2xl p-4 text-sm", className)}><FlaskConical className="mt-0.5 size-4 shrink-0" aria-hidden /><span><strong>가상 데이터</strong>{compact ? " · 실제 현황과 무관" : ` · ${MOCK_NOTICE}`}</span></div>;
}
