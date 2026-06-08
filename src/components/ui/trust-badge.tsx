import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustBadgeProps {
  icon: LucideIcon;
  label: string;
  className?: string;
}

export function TrustBadge({ icon: Icon, label, className }: TrustBadgeProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm font-medium text-gray-700",
        className
      )}
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-50">
        <Icon size={16} className="text-green-600" />
      </div>
      <span>{label}</span>
    </div>
  );
}
