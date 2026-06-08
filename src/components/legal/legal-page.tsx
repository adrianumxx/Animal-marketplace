import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export interface LegalSection {
  heading: string;
  body: string[];
}

interface LegalPageProps {
  locale: string;
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
}

export function LegalPage({ locale, title, intro, updated, sections }: LegalPageProps) {
  return (
    <div className="bg-[var(--t-bg)] min-h-screen">
      <div className="max-w-[820px] mx-auto px-5 sm:px-8 py-16 lg:py-24">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[rgba(232,228,221,0.50)] hover:text-[var(--color-accent)] transition-colors mb-10"
        >
          <ArrowLeft size={15} /> PawTrust
        </Link>

        <h1 className="text-4xl lg:text-5xl font-black text-[var(--t-text)] tracking-[-0.03em] mb-4">{title}</h1>
        <p className="text-[11px] font-semibold text-[var(--color-accent)] uppercase tracking-[0.12em] font-[family-name:var(--font-mono)] mb-8">{updated}</p>
        <p className="text-lg text-[rgba(232,228,221,0.60)] leading-relaxed mb-12 font-[family-name:var(--font-body)]">{intro}</p>

        <div className="space-y-10">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-xl font-bold text-[var(--t-text)] tracking-[-0.02em] mb-3">{s.heading}</h2>
              <div className="space-y-3">
                {s.body.map((p, i) => (
                  <p key={i} className="text-sm text-[rgba(232,228,221,0.60)] leading-relaxed font-[family-name:var(--font-body)]">{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-16 pt-8 border-t border-white/[0.06] text-xs text-[rgba(232,228,221,0.35)] font-[family-name:var(--font-body)]">
          PawTrust BV · Belgium · This document is a template and should be reviewed by qualified legal counsel before launch.
        </p>
      </div>
    </div>
  );
}
