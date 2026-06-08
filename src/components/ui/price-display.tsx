import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";

interface PriceDisplayProps {
  price: number;
  negotiable?: boolean;
  locale?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  negotiableLabel?: string;
}

export function PriceDisplay({
  price,
  negotiable = false,
  locale = "en",
  size = "md",
  className,
  negotiableLabel = "Negotiable",
}: PriceDisplayProps) {
  const sizeClasses = {
    sm: "text-base font-semibold",
    md: "text-xl font-bold",
    lg: "text-3xl font-bold",
  };

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      <span className={cn("text-gray-900", sizeClasses[size])}>
        {formatPrice(price, locale)}
      </span>
      {negotiable && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          {negotiableLabel}
        </span>
      )}
    </div>
  );
}
