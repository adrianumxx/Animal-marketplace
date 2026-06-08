"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇧🇪" },
  { code: "nl", label: "Nederlands", flag: "🇳🇱" },
];

interface LanguageSwitcherProps {
  currentLocale: string;
  className?: string;
}

export function LanguageSwitcher({ currentLocale, className }: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const current = LANGUAGES.find((l) => l.code === currentLocale) || LANGUAGES[0];

  const switchLocale = (code: string) => {
    setOpen(false);
    const segments = pathname.split("/");
    segments[1] = code;
    router.push(segments.join("/"));
  };

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-[var(--t-text-secondary)] hover:text-[var(--t-text)] hover:bg-white/[0.06] transition-colors"
      >
        <span>{current.flag}</span>
        <span className="font-semibold">{current.label}</span>
        <ChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="glass absolute right-0 mt-2 w-44 rounded-2xl border border-[var(--t-border)] shadow-[var(--shadow-lg)] z-50 overflow-hidden p-1.5">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => switchLocale(lang.code)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left transition-colors",
                  lang.code === currentLocale
                    ? "bg-[rgba(255,56,92,0.10)] text-[var(--color-accent)] font-semibold"
                    : "text-[var(--t-text-secondary)] hover:text-[var(--t-text)] hover:bg-white/[0.06]"
                )}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
