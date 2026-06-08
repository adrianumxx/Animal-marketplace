import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentBadgeProps {
  label: string;
  checked: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function DocumentBadge({
  label,
  checked,
  size = "md",
  className,
}: DocumentBadgeProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        size === "sm" ? "text-sm" : "text-base",
        className
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-full shrink-0",
          size === "sm" ? "w-4 h-4" : "w-5 h-5",
          checked
            ? "bg-green-100 text-green-600"
            : "bg-gray-100 text-gray-400"
        )}
      >
        {checked ? (
          <Check size={size === "sm" ? 10 : 12} strokeWidth={3} />
        ) : (
          <X size={size === "sm" ? 10 : 12} strokeWidth={3} />
        )}
      </span>
      <span className={checked ? "text-gray-700" : "text-gray-400"}>
        {label}
      </span>
    </div>
  );
}
