import { forwardRef } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient?: boolean;
  trend?: string;
}

export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(function StatCard({ title, value, icon: Icon, gradient, trend }, ref) {
  return (
    <div ref={ref} className={cn(
      "rounded-2xl p-3.5 md:p-5 transition-all duration-300 hover:-translate-y-0.5",
      gradient
        ? "gradient-primary text-primary-foreground shadow-soft hover:shadow-elevated"
        : "bg-card shadow-card hover:shadow-card-hover"
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-0.5 md:space-y-1">
          <p className={cn(
            "text-[11px] md:text-[13px] font-medium tracking-wide",
            gradient ? "text-primary-foreground/75" : "text-muted-foreground"
          )}>{title}</p>
          <p className="text-2xl md:text-3xl font-heading font-bold tracking-tight">{value}</p>
          {trend && (
            <p className={cn(
              "text-[10px] md:text-[11px] font-medium",
              gradient ? "text-primary-foreground/60" : "text-muted-foreground"
            )}>{trend}</p>
          )}
        </div>
        <div className={cn(
          "p-2 md:p-3 rounded-xl",
          gradient ? "bg-primary-foreground/15" : "gradient-subtle"
        )}>
          <Icon className={cn("h-4 w-4 md:h-5 md:w-5", gradient ? "text-primary-foreground" : "text-primary")} />
        </div>
      </div>
    </div>
  );
});
