"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: number;
  showValue?: boolean;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  className?: string;
}

export function StarRating({
  rating,
  max = 5,
  size = 14,
  showValue = false,
  interactive = false,
  onRate,
  className,
}: StarRatingProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < Math.floor(rating);
          const partial = !filled && i < rating;

          return (
            <button
              key={i}
              type={interactive ? "button" : undefined}
              onClick={interactive && onRate ? () => onRate(i + 1) : undefined}
              className={cn(
                "relative",
                interactive && "cursor-pointer hover:scale-110 transition-transform"
              )}
              disabled={!interactive}
            >
              <Star
                size={size}
                className={cn(
                  "transition-colors",
                  filled
                    ? "fill-amber-400 text-amber-400"
                    : partial
                    ? "fill-amber-200 text-amber-400"
                    : "fill-gray-100 text-gray-300"
                )}
              />
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-gray-700">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
