"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";

interface FavoriteButtonProps {
  listingId: string;
  label?: string;
}

export function FavoriteButton({ listingId, label = "Save to favorites" }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(false);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !favorited;
    setFavorited(next);
    try {
      if (next) await api.favorites.add(listingId);
      else await api.favorites.remove(listingId);
      toast[next ? "success" : "message"](next ? "Saved to favorites" : "Removed from favorites");
    } catch {
      setFavorited(!next); // revert
      toast.error("Sign in to save favorites");
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={favorited}
      aria-label={label}
      data-listing={listingId}
      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-200 cursor-pointer"
    >
      <Heart
        size={14}
        strokeWidth={2}
        className={favorited ? "fill-[var(--color-accent)] text-[var(--color-accent)]" : "text-white"}
      />
    </button>
  );
}
