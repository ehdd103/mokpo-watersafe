import type { RiskLevel } from "@/types";
import { RISK_META } from "@/config/risk";
import { cn } from "@/lib/utils";
export function RiskBadge({ level, score, className }: { level: RiskLevel; score?: number; className?: string }) { const meta = RISK_META[level]; return <span className={cn("risk-badge", meta.className, className)} aria-label={`위험 단계 ${meta.label}${score === undefined ? "" : `, ${score}점`}`}><span aria-hidden>{meta.icon}</span> {meta.label}{score === undefined ? "" : ` · ${score}점`}</span>; }
