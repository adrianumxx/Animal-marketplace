"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Menu, X, User } from "lucide-react";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";
import { NotificationBell } from "./notification-bell";
import { SearchBar } from "@/components/ui/search-bar";
import { cn } from "@/lib/utils";

interface NavbarProps {
  locale: string;
  t: {
    browse: string;
    breeders: string;
    shelters: string;
    vets: string;
    pricing: string;
    login: string;
    register: string;
    dashboard: string;
    logout: string;
  };
  user?: { role: string; full_name?: string | null; capabilities?: string[]; effective_role?: string; avatar_url?: string | null } | null;
  onLogout?: () => void;
}

export function Navbar({ locale, t, user, onLogout }: NavbarProps) {
  const tr = useTranslations("roles");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 nav-header",
        scrolled
          ? "nav-scrolled backdrop-blur-[20px] border-b border-white/[0.06] shadow-[0_2px_20px_rgba(0,0,0,0.4)]"
          : "nav-top backdrop-blur-[12px]"
      )}
    >
      <nav className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-20">
        <div className="flex items-center justify-between h-[64px] gap-4">

          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="shrink-0 flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-xl bg-[var(--color-accent)] flex items-center justify-center shadow-[0_0_12px_rgba(255,56,92,0.4)]">
              <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                <path d="M10 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm12 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-6 2c-3.3 0-6 2.7-6 6 0 1.7 1.3 3 3 3h6c1.7 0 3-1.3 3-3 0-3.3-2.7-6-6-6z" fill="white"/>
              </svg>
            </div>
            <span className="nav-logo-text font-bold text-lg tracking-[-0.02em] font-[family-name:var(--font-display)]">
              paw<span className="text-[var(--color-accent)]">trust</span>
            </span>
          </Link>

          {/* Center — pill search (xl only) */}
          <SearchBar locale={locale} variant="navbar" />

          {/* Primary nav — md+ : real navigation on every desktop/tablet width */}
          <nav className="hidden md:flex items-center gap-1 lg:ml-auto">
            {[
              { href: `/${locale}/search`, label: t.browse },
              { href: `/${locale}/breeders`, label: t.breeders },
              { href: `/${locale}/shelters`, label: t.shelters },
              { href: `/${locale}/vets`, label: t.vets },
              { href: `/${locale}/pricing`, label: t.pricing },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-semibold text-[rgba(232,228,221,0.70)] rounded-full hover:bg-white/[0.06] hover:text-[var(--t-text)] transition-colors whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href={`/${locale}/become-a-seller`}
              className="inline-flex items-center justify-center rounded-full border border-[rgba(255,56,92,0.35)] bg-[rgba(255,56,92,0.12)] px-4 py-2 text-sm font-bold text-[var(--t-text)] shadow-[0_0_14px_rgba(255,56,92,0.16)] transition hover:bg-[var(--color-accent)] hover:text-white whitespace-nowrap"
            >
              List your pet
            </Link>

            <ThemeToggle />
            <LanguageSwitcher currentLocale={locale} />

            {user ? (
              <div className="flex items-center gap-2 ml-1">
                <NotificationBell locale={locale} />
                {user.role === "admin" && (
                  <Link href={`/${locale}/admin`} className="px-3 py-2 text-sm font-semibold text-[var(--color-accent)] rounded-full hover:bg-white/[0.08] transition-colors whitespace-nowrap">
                    Admin
                  </Link>
                )}
                {(user.capabilities ?? []).includes("seller") && (
                  <Link href={`/${locale}/dashboard`} className="px-4 py-2 text-sm font-semibold text-[var(--t-text)] rounded-full hover:bg-white/[0.08] transition-colors whitespace-nowrap">
                    {t.dashboard}
                  </Link>
                )}
                <Link href={`/${locale}/account`} className="flex items-center gap-2 border border-white/[0.10] rounded-full pl-1.5 pr-3 py-1 hover:bg-white/[0.06] transition-colors" title="Account">
                  {user.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white text-xs font-bold">
                      {user.full_name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-[var(--t-text)]">
                    {user.effective_role ? tr(user.effective_role) : "Account"}
                  </span>
                </Link>
                <button
                  onClick={onLogout}
                  className="border border-white/[0.10] rounded-full px-3 py-1.5 hover:bg-white/[0.06] transition-colors cursor-pointer"
                >
                  <span className="text-xs text-[rgba(232,228,221,0.60)]">{t.logout}</span>
                </button>
              </div>
            ) : (
              <Link
                href={`/${locale}/login`}
                className="flex items-center gap-2 border border-white/[0.10] rounded-full px-3 py-1.5 hover:bg-white/[0.06] transition-colors ml-1"
              >
                <Menu size={16} className="text-[var(--t-text)]" />
                <div className="w-7 h-7 rounded-full bg-white/[0.12] flex items-center justify-center">
                  <User size={14} className="text-[var(--t-text)]" />
                </div>
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/[0.08] transition-colors text-[var(--t-text)]"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/[0.06] py-4 space-y-1 bg-[rgba(10,10,15,.95)] backdrop-blur-xl">
            {[
              { href: `/${locale}/search`, label: t.browse },
              { href: `/${locale}/breeders`, label: t.breeders },
              { href: `/${locale}/shelters`, label: t.shelters },
              { href: `/${locale}/vets`, label: t.vets },
              { href: `/${locale}/pricing`, label: t.pricing },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-[var(--t-text)] hover:bg-white/[0.06] rounded-xl"
              >
                {link.label}
              </Link>
            ))}
            {/* Logged-in shortcuts */}
            {user && (
              <div className="pt-3 mt-1 border-t border-white/[0.06] space-y-1">
                {user.role === "admin" && (
                  <Link href={`/${locale}/admin`} onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm font-semibold text-[var(--color-accent)] hover:bg-white/[0.06] rounded-xl">Admin</Link>
                )}
                {(user.capabilities ?? []).includes("seller") && (
                  <Link href={`/${locale}/dashboard`} onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm font-semibold text-[var(--t-text)] hover:bg-white/[0.06] rounded-xl">{t.dashboard}</Link>
                )}
                <Link href={`/${locale}/account`} onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm font-semibold text-[var(--t-text)] hover:bg-white/[0.06] rounded-xl">Account</Link>
                <button onClick={() => { setMobileOpen(false); onLogout?.(); }} className="block w-full text-left px-4 py-3 text-sm font-semibold text-[var(--t-text-secondary)] hover:bg-white/[0.06] rounded-xl">{t.logout}</button>
              </div>
            )}
            <div className="pt-3 border-t border-white/[0.06] px-4 space-y-2">
              <LanguageSwitcher currentLocale={locale} />
              {!user && (
                <>
                  <Link
                    href={`/${locale}/login`}
                    onClick={() => setMobileOpen(false)}
                    className="block py-3 text-sm font-semibold text-[var(--t-text)] hover:bg-white/[0.06] rounded-xl px-2"
                  >
                    {t.login}
                  </Link>
                  <Link
                    href={`/${locale}/become-a-seller`}
                    onClick={() => setMobileOpen(false)}
                    className="block text-center bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-xl px-4 py-3 text-sm font-semibold shadow-[0_4px_12px_rgba(255,56,92,0.30)] transition-colors"
                  >
                    List your pet
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
