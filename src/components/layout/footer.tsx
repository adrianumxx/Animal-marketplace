import Link from "next/link";
import { LanguageSwitcher } from "./language-switcher";

interface FooterProps {
  locale: string;
  t: {
    tagline: string;
    marketplace: string;
    browse: string;
    breeders: string;
    shelters: string;
    vets: string;
    pricing: string;
    sellers: string;
    becomeSeller: string;
    dashboard: string;
    howItWorks: string;
    legal: string;
    privacy: string;
    terms: string;
    gdpr: string;
    cookies: string;
    rights: string;
    gdprNote: string;
    euWelfare: string;
  };
}

export function Footer({ locale, t }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[var(--t-bg)] border-t border-white/[0.06]">
      <div className="max-w-[1760px] mx-auto px-6 sm:px-10 lg:px-20">

        {/* Top section: logo + tagline */}
        <div className="pt-16 pb-10 border-b border-white/[0.06] flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[var(--color-accent)] flex items-center justify-center shadow-[0_0_12px_rgba(255,56,92,0.35)]">
                <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                  <path d="M10 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm12 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-6 2c-3.3 0-6 2.7-6 6 0 1.7 1.3 3 3 3h6c1.7 0 3-1.3 3-3 0-3.3-2.7-6-6-6z" fill="white"/>
                </svg>
              </div>
              <span className="text-white font-bold text-lg tracking-[-0.02em] font-[family-name:var(--font-display)]">
                paw<span className="text-[var(--color-accent)]">trust</span>
              </span>
            </div>
            <p className="text-sm text-[rgba(232,228,221,0.50)] leading-relaxed">
              {t.tagline}
            </p>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-3">
            {[
              { icon: "✓", label: "Manually verified breeders" },
              { icon: "🇪🇺", label: "EU Animal Welfare compliant" },
              { icon: "🔒", label: "GDPR protected" },
            ].map(({ icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] text-xs font-medium text-[rgba(232,228,221,0.60)]"
              >
                <span>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main link grid */}
        <div className="py-10 grid grid-cols-2 md:grid-cols-4 gap-8">

          {/* Marketplace */}
          <div>
            <h4 className="text-xs font-semibold text-[rgba(232,228,221,0.40)] uppercase tracking-[0.12em] mb-4 font-[family-name:var(--font-mono)]">
              {t.marketplace}
            </h4>
            <ul className="space-y-3">
              {[
                { href: `/${locale}/search`, label: t.browse },
                { href: `/${locale}/breeders`, label: t.breeders },
                { href: `/${locale}/shelters`, label: t.shelters },
                { href: `/${locale}/vets`, label: t.vets },
                { href: `/${locale}/pricing`, label: t.pricing },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-[rgba(232,228,221,0.55)] hover:text-[var(--t-text)] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Sellers */}
          <div>
            <h4 className="text-xs font-semibold text-[rgba(232,228,221,0.40)] uppercase tracking-[0.12em] mb-4 font-[family-name:var(--font-mono)]">
              {t.sellers}
            </h4>
            <ul className="space-y-3">
              {[
                { href: `/${locale}/become-a-seller`, label: t.becomeSeller },
                { href: `/${locale}/dashboard`, label: t.dashboard },
                { href: `/${locale}/how-it-works`, label: t.howItWorks },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-[rgba(232,228,221,0.55)] hover:text-[var(--t-text)] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold text-[rgba(232,228,221,0.40)] uppercase tracking-[0.12em] mb-4 font-[family-name:var(--font-mono)]">
              {t.legal}
            </h4>
            <ul className="space-y-3">
              {[
                { href: `/${locale}/privacy`, label: t.privacy },
                { href: `/${locale}/terms`, label: t.terms },
                { href: `/${locale}/gdpr`, label: t.gdpr },
                { href: `/${locale}/cookies`, label: t.cookies },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-[rgba(232,228,221,0.55)] hover:text-[var(--t-text)] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Language */}
          <div>
            <h4 className="text-xs font-semibold text-[rgba(232,228,221,0.40)] uppercase tracking-[0.12em] mb-4 font-[family-name:var(--font-mono)]">
              Language
            </h4>
            <LanguageSwitcher currentLocale={locale} />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.06] py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-[rgba(232,228,221,0.35)]">
            <span>&copy; {year} PawTrust BV</span>
            <span className="text-white/20">&middot;</span>
            <span>Belgium</span>
            <span className="text-white/20">&middot;</span>
            <span>{t.rights}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-[rgba(232,228,221,0.35)]">
            <span>{t.gdprNote}</span>
            <span className="text-white/20">&middot;</span>
            <span>{t.euWelfare}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
