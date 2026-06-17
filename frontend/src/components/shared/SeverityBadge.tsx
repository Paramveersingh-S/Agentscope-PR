import { Badge } from "@/components/ui/badge";
import { SEVERITY_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface SeverityBadgeProps {
  severity: keyof typeof SEVERITY_COLORS;
  className?: string;
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  return (
    <Badge 
      variant="outline" 
      className={cn("uppercase text-[10px] font-bold px-2 py-0.5", SEVERITY_COLORS[severity], className)}
    >
      {severity}
    </Badge>
  );
}
