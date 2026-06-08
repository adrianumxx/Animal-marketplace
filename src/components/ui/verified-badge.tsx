"use client";

import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  size?: "xs" | "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

export function VerifiedBadge({
  size = "md",
  label = "Verified",
  className,
}: VerifiedBadgeProps) {
  const sizes = {
    xs: { icon: 10, text: "text-[10px]", pad: "px-1.5 py-0.5", gap: "gap-0.5" },
    sm: { icon: 12, text: "text-[11px]", pad: "px-1.5 py-0.5", gap: "gap-1" },
    md: { icon: 14, text: "text-xs",     pad: "px-2 py-0.5",   gap: "gap-1" },
    lg: { icon: 16, text: "text-sm",     pad: "px-2.5 py-1",   gap: "gap-1.5" },
  };

  const s = sizes[size];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        "bg-forest-600 text-white",
        s.pad,
        s.gap,
        s.text,
        className
      )}
    >
      <ShieldCheck size={s.icon} className="shrink-0" />
      {label && <span>{label}</span>}
    </span>
  );
}
