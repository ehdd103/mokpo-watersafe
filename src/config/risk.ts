export const RISK_THRESHOLDS = {
  normal: { min: 0, max: 19 },
  interest: { min: 20, max: 39 },
  caution: { min: 40, max: 69 },
  warning: { min: 70, max: 100 },
} as const;

export const RISK_META = {
  unknown: { label: "정보 없음", icon: "?", className: "risk-unknown", pattern: "점선" },
  normal: { label: "정상", icon: "✓", className: "risk-normal", pattern: "실선" },
  interest: { label: "관심", icon: "i", className: "risk-interest", pattern: "사선" },
  caution: { label: "주의", icon: "!", className: "risk-caution", pattern: "격자" },
  warning: { label: "경계", icon: "!!", className: "risk-warning", pattern: "이중선" },
} as const;

export const STALE_AFTER_HOURS = 48;
