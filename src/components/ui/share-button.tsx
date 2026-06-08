"use client";

import { Share2, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ShareButton({ title }: { title?: string }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: title || "PawTrust", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* user cancelled share — ignore */
    }
  };

  return (
    <button onClick={share} className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass text-sm font-semibold text-[var(--t-text)] hover:bg-white/[0.10] transition-colors">
      {copied ? <Check size={14} /> : <Share2 size={14} />}
      {copied ? "Copied" : "Share"}
    </button>
  );
}
