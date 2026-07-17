import * as React from "react";
import { cn } from "@/lib/utils";
export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className, ...props }, ref) => <select ref={ref} className={cn("h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-cyan-600 dark:border-slate-700 dark:bg-slate-950", className)} {...props} />);
Select.displayName = "Select";
