"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, Clock, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { api, type Listing, type FavoriteEntry } from "@/lib/api-client";

interface CardData {
  id: string;
  name: string;
  price: number;
  city: string;
  country: string;
  img?: string;
}

export function PersonalizedSections({ locale }: { locale: string }) {
  const t = useTranslations("home");
  const [rec, setRec] = useState<CardData[]>([]);
  const [recent, setRecent] = useState<CardData[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await api.auth.me(); // throws if not authenticated → personalized rows stay hidden
        const [r, rv] = await Promise.all([api.memory.recommended(), api.memory.recentlyViewed()]);
        setRec(r.listings.map(fromListing(locale)));
        setRecent(rv.recently_viewed.map(fromFavorite(locale)).filter((c): c is CardData => !!c));
      } catch {
        /* anonymous — render nothing */
      } finally {
        setReady(true);
      }
    })();
  }, [locale]);

  if (!ready || (rec.length === 0 && recent.length === 0)) return null;

  return (
    <section className="py-10 border-b border-white/[0.06]">
      <div className="max-w-[1760px] mx-auto px-6 sm:px-10 lg:px-20 space-y-12">
        {rec.length > 0 && <Row locale={locale} icon={<Sparkles size={15} className="text-[var(--color-accent)]" />} title={t("forYou")} items={rec} />}
        {recent.length > 0 && <Row locale={locale} icon={<Clock size={15} className="text-[var(--color-accent)]" />} title={t("recentlyViewedTitle")} items={recent} />}
      </div>
    </section>
  );
}

function Row({ locale, icon, title, items }: { locale: string; icon: React.ReactNode; title: string; items: CardData[] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="flex items-center gap-2 text-xl font-black text-[var(--t-text)] tracking-[-0.02em]">{icon}{title}</h2>
        <Link href={`/${locale}/search`} className="text-sm font-semibold text-[var(--t-text-muted)] hover:text-[var(--color-accent)] flex items-center gap-1.5 transition-colors">
          <ArrowRight size={14} />
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2 -mx-1 px-1">
        {items.map((c) => (
          <Link key={c.id} href={`/${locale}/listings/${c.id}`} className="listing-card group block bg-[var(--t-surface)] border border-white/[0.06] rounded-2xl overflow-hidden w-[220px] shrink-0">
            <div className="relative aspect-[4/3] overflow-hidden bg-[var(--t-elevated)]">
              {c.img && <Image src={c.img} alt={c.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="220px" />}
            </div>
            <div className="p-3.5">
              <p className="font-bold text-[var(--t-text)] text-sm line-clamp-1">{c.name}</p>
              <p className="text-xs text-[var(--t-text-muted)] mt-0.5">{c.city}, {c.country}</p>
              {c.price > 0 && <p className="mt-1.5 font-black text-[var(--t-text)] text-sm font-[family-name:var(--font-mono)]">€{(c.price / 100).toLocaleString()}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

const pick = (obj: Record<string, string> | undefined, locale: string, fb: string) => (obj && (obj[locale] || obj.en)) || fb;

const fromListing = (locale: string) => (l: Listing): CardData => ({
  id: l.id,
  name: pick(l.breed?.name, locale, pick(l.title, locale, "Animal")),
  price: l.price,
  city: l.location_city ?? "",
  country: l.location_country ?? "",
  img: l.images?.[0]?.url,
});

const fromFavorite = (locale: string) => (f: FavoriteEntry): CardData | null => {
  const l = f.listing_id;
  if (!l) return null;
  return {
    id: l._id,
    name: pick(l.breed_id?.name, locale, "Animal"),
    price: l.price ?? 0,
    city: l.location_city ?? "",
    country: l.location_country ?? "",
    img: l.images?.[0]?.url,
  };
};
