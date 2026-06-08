import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--t-text-muted)] flex-wrap font-[family-name:var(--font-body)]">
      {items.map((c, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight size={12} className="opacity-50" />}
          {c.href && i < items.length - 1 ? (
            <Link href={c.href} className="hover:text-[var(--color-accent)] transition-colors">{c.label}</Link>
          ) : (
            <span className="text-[var(--t-text-secondary)] truncate max-w-[200px]">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
