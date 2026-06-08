import { getTranslations } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import { Star, Shield, Award, Lock, ArrowRight, CheckCircle, Dog, Cat, Rabbit, Bird, Fish, PawPrint } from "lucide-react";
import { SearchBar } from "@/components/ui/search-bar";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { PersonalizedSections } from "@/components/home/personalized-sections";
import { getFeaturedListings, getPlatformStats } from "@/lib/public-data";

/* ─── Mock Data ──────────────────────────────────────────────────────────── */

const MOCK_LISTINGS = [
  {
    id: "1",
    price: 145000,
    location_city: "Brussels",
    location_country: "BE",
    age_weeks: 10,
    gender: "male",
    breed: { name: { en: "Golden Retriever", fr: "Golden Retriever", nl: "Golden Retriever" } },
    images: [{ url: "https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=700&h=700&fit=crop" }],
    seller: { verification_status: "verified" as const, rating: 4.97, review_count: 47 },
    is_featured: true,
  },
  {
    id: "2",
    price: 285000,
    location_city: "Antwerp",
    location_country: "BE",
    age_weeks: 12,
    gender: "female",
    breed: { name: { en: "French Bulldog", fr: "Bouledogue", nl: "Franse Bulldog" } },
    images: [{ url: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=700&h=700&fit=crop" }],
    seller: { verification_status: "verified" as const, rating: 4.87, review_count: 29 },
    is_featured: false,
  },
  {
    id: "3",
    price: 95000,
    location_city: "Amsterdam",
    location_country: "NL",
    age_weeks: 14,
    gender: "male",
    breed: { name: { en: "Maine Coon", fr: "Maine Coon", nl: "Maine Coon" } },
    images: [{ url: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=700&h=700&fit=crop" }],
    seller: { verification_status: "verified" as const, rating: 4.92, review_count: 33 },
    is_featured: true,
  },
  {
    id: "4",
    price: 125000,
    location_city: "Liège",
    location_country: "BE",
    age_weeks: 9,
    gender: "female",
    breed: { name: { en: "Labrador Retriever", fr: "Labrador", nl: "Labrador" } },
    images: [{ url: "https://images.unsplash.com/photo-1591946614720-90a587da4a36?w=700&h=700&fit=crop" }],
    seller: { verification_status: "verified" as const, rating: 5.0, review_count: 18 },
    is_featured: false,
  },
  {
    id: "5",
    price: 165000,
    location_city: "Ghent",
    location_country: "BE",
    age_weeks: 11,
    gender: "male",
    breed: { name: { en: "Siberian Husky", fr: "Husky Sibérien", nl: "Siberische Husky" } },
    images: [{ url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=700&h=700&fit=crop" }],
    seller: { verification_status: "verified" as const, rating: 4.94, review_count: 52 },
    is_featured: true,
  },
  {
    id: "6",
    price: 850000,
    location_city: "Ghent",
    location_country: "BE",
    age_weeks: 26,
    gender: "male",
    breed: { name: { en: "KWPN", fr: "KWPN", nl: "KWPN" } },
    images: [{ url: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=700&h=700&fit=crop" }],
    seller: { verification_status: "verified" as const, rating: 4.78, review_count: 12 },
    is_featured: false,
  },
  {
    id: "7",
    price: 195000,
    location_city: "Bruges",
    location_country: "BE",
    age_weeks: 10,
    gender: "female",
    breed: { name: { en: "Pembroke Welsh Corgi", fr: "Corgi", nl: "Welsh Corgi" } },
    images: [{ url: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=700&h=700&fit=crop" }],
    seller: { verification_status: "verified" as const, rating: 4.88, review_count: 24 },
    is_featured: false,
  },
  {
    id: "8",
    price: 180000,
    location_city: "Rotterdam",
    location_country: "NL",
    age_weeks: 13,
    gender: "male",
    breed: { name: { en: "Bengal", fr: "Bengale", nl: "Bengaal" } },
    images: [{ url: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=700&h=700&fit=crop" }],
    seller: { verification_status: "verified" as const, rating: 4.91, review_count: 38 },
    is_featured: false,
  },
];

const SPECIES_TABS = [
  { slug: "dogs",    icon: Dog,      labelKey: "dogs" },
  { slug: "cats",    icon: Cat,      labelKey: "cats" },
  { slug: "rabbits", icon: Rabbit,   labelKey: "rabbits" },
  { slug: "birds",   icon: Bird,     labelKey: "birds" },
  { slug: "horses",  icon: PawPrint, labelKey: "horses" },
  { slug: "exotic",  icon: Fish,     labelKey: "exotic" },
] as const;

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  const supabaseListings = await getFeaturedListings(8);
  const stats = await getPlatformStats();
  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k+` : `${n}`;
  const listings = supabaseListings.length > 0 ? supabaseListings : MOCK_LISTINGS;

  const localeText = (obj: Record<string, string>) =>
    obj[locale as "en" | "fr" | "nl"] || obj.en;

  return (
    <div className="flex flex-col bg-[var(--t-bg)]">

      {/* ================================================================
          HERO — Editorial split: asymmetric headline + photo collage
      ================================================================ */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-[64px]">

        {/* Background atmosphere */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="blob-1 absolute top-[-25%] left-[-15%] w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(255,56,92,0.16)_0%,transparent_65%)]" />
          <div className="blob-2 absolute bottom-[-20%] right-[-5%] w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(0,166,153,0.12)_0%,transparent_65%)]" />
          <div className="blob-3 absolute top-[40%] left-[40%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(252,100,45,0.06)_0%,transparent_70%)]" />
          {/* Subtle grid */}
          <div className="absolute inset-0 opacity-[0.025]" style={{backgroundImage: "linear-gradient(rgba(232,228,221,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(232,228,221,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px"}} />
        </div>

        <div className="relative z-10 max-w-[1760px] mx-auto px-5 sm:px-10 lg:px-20 w-full py-16 lg:py-0">
          <div className="grid lg:grid-cols-[1fr_480px] xl:grid-cols-[1fr_540px] gap-12 xl:gap-20 items-center min-h-[calc(100vh-64px)]">

            {/* ── Left: Editorial content ── */}
            <div className="flex flex-col justify-center min-w-0">

              <div className="hero-line-1 mb-6">
                <span className="badge badge-accent">{t("hero.badge")}</span>
              </div>

              <h1 className="hero-line-2 mb-6">
                <span className="block text-[44px] sm:text-[68px] lg:text-[80px] xl:text-[96px] font-black text-[var(--t-text)] leading-[0.9] tracking-[-0.035em]">
                  {t("hero.line1")}
                </span>
                <span className="block text-[44px] sm:text-[68px] lg:text-[80px] xl:text-[96px] font-black italic text-[var(--color-accent)] leading-[0.9] tracking-[-0.035em]">
                  {t("hero.line2")}
                </span>
                <span className="block text-[44px] sm:text-[68px] lg:text-[80px] xl:text-[96px] font-black text-[var(--t-text)] leading-[0.9] tracking-[-0.035em]">
                  {t("hero.line3")}
                </span>
              </h1>

              <p className="hero-line-3 text-lg sm:text-xl text-[rgba(232,228,221,0.50)] mb-10 max-w-lg leading-relaxed font-[family-name:var(--font-body)]">
                {t("hero.subtext")}
              </p>

              {/* Search bar */}
              <div className="hero-line-4">
                <SearchBar locale={locale} variant="hero" />
              </div>

              {/* Trust micro-signals */}
              <div className="hero-line-5 flex flex-wrap items-center gap-5 mt-7">
                {[
                  t("trust.listings"),
                  t("trust.breeders"),
                  t("trust.gdpr"),
                ].map((label) => (
                  <div key={label} className="flex items-center gap-1.5 text-xs text-[rgba(232,228,221,0.40)] font-[family-name:var(--font-body)]">
                    <CheckCircle size={12} className="text-[var(--color-accent-teal)] shrink-0" />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: Photo collage ── */}
            <div className="hero-photos hidden lg:block relative h-[580px]">

              {/* Floating stats pill — top left */}
              <div className="absolute top-6 left-0 z-20 glass rounded-2xl px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                <div className="text-2xl font-black text-[var(--t-text)] tracking-[-0.03em] leading-none">{fmt(stats.listings)}</div>
                <div className="text-[11px] text-[rgba(232,228,221,0.45)] mt-0.5 font-[family-name:var(--font-body)]">{t("cta.activeListings")}</div>
              </div>

              {/* Photo 1 — main, top right */}
              <div className="photo-float-a absolute top-0 right-0 w-[295px] h-[370px] rounded-3xl overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.55)] border border-white/[0.08]">
                <Image
                  src="https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=600&h=750&fit=crop"
                  alt="Golden Retriever"
                  fill
                  className="object-cover"
                  priority
                  sizes="295px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                {/* Inline verified card */}
                <div className="absolute bottom-4 left-3 right-3 glass rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[var(--color-accent)] flex items-center justify-center text-white font-bold text-xs shrink-0">G</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-bold text-[var(--t-text)] truncate">Goldenfarm Kennel</div>
                      <div className="text-[10px] text-[rgba(232,228,221,0.50)] font-[family-name:var(--font-body)]">Brussels · Verified</div>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Star size={10} className="fill-[var(--color-accent)] text-[var(--color-accent)]" />
                      <span className="text-[11px] font-bold text-[var(--t-text)]">4.97</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo 2 — bottom left */}
              <div className="photo-float-b absolute bottom-0 left-[10px] w-[255px] h-[330px] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.50)] border border-white/[0.08]">
                <Image
                  src="https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500&h=660&fit=crop"
                  alt="Maine Coon"
                  fill
                  className="object-cover"
                  sizes="255px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="badge badge-teal text-[9px]">✓ Health certified</span>
                </div>
              </div>

              {/* Photo 3 — middle, overlapping */}
              <div className="photo-float-c absolute top-[175px] left-[145px] w-[200px] h-[250px] rounded-3xl overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.55)] border border-white/[0.10] z-10">
                <Image
                  src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=500&fit=crop"
                  alt="French Bulldog"
                  fill
                  className="object-cover"
                  sizes="200px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="text-xs font-bold text-white font-[family-name:var(--font-mono)]">€2,850</div>
                  <div className="text-[10px] text-white/60 font-[family-name:var(--font-body)]">French Bulldog · Antwerp</div>
                </div>
              </div>

              {/* Floating badge — bottom right */}
              <div className="absolute bottom-[280px] right-[-8px] z-20 glass rounded-xl px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-accent-teal)] animate-pulse" />
                  <span className="text-[11px] font-semibold text-[var(--t-text)] font-[family-name:var(--font-body)]">{t("cta.listToday")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30 pointer-events-none">
          <div className="w-[1px] h-10 bg-gradient-to-b from-transparent to-[var(--t-text)]" />
        </div>
      </section>

      {/* ================================================================
          CATEGORY TABS — Airbnb-style icon bar
      ================================================================ */}
      <div className="border-b border-white/[0.06] sticky top-[64px] bg-[rgba(10,10,15,0.92)] backdrop-blur-2xl z-40">
        <div className="max-w-[1760px] mx-auto px-6 sm:px-10 lg:px-20">
          <div className="flex gap-2 overflow-x-auto scrollbar-none py-3">
            {SPECIES_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.slug}
                  href={`/${locale}/species/${tab.slug}`}
                  className="category-tab category-tab-inactive group relative flex flex-col items-center gap-2 px-6 py-3.5 rounded-xl shrink-0 transition-all duration-300"
                >
                  <Icon size={24} strokeWidth={1.5} className="transition-all duration-300 group-hover:scale-110" />
                  <span className="text-[11px] font-semibold whitespace-nowrap tracking-[0.02em] font-[family-name:var(--font-body)]">{t(`categories.${tab.labelKey}`)}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================================================================
          PERSONALIZED — For you + Recently viewed (logged-in only)
      ================================================================ */}
      <PersonalizedSections locale={locale} />

      {/* ================================================================
          LISTINGS GRID
      ================================================================ */}
      <section className="py-16">
        <div className="max-w-[1760px] mx-auto px-6 sm:px-10 lg:px-20">

          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold text-[var(--color-accent)] uppercase tracking-[0.12em] font-[family-name:var(--font-mono)] mb-1">{t("featured.eyebrow")}</p>
              <h2 className="text-3xl font-black text-[var(--t-text)] tracking-[-0.025em]">{t("featured.title")}</h2>
            </div>
            <Link
              href={`/${locale}/search`}
              className="text-sm font-semibold text-[rgba(232,228,221,0.50)] hover:text-[var(--color-accent)] flex items-center gap-1.5 transition-colors font-[family-name:var(--font-body)]"
            >
              {t("featured.viewAll")} <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {listings.map((listing, idx) => (
              <Link
                key={listing.id}
                href={`/${locale}/listings/${listing.id}`}
                className="listing-card group block bg-[var(--t-surface)] border border-white/[0.06] rounded-2xl overflow-hidden"
              >
                {/* Photo */}
                <div className="relative aspect-[4/3] overflow-hidden bg-[var(--t-elevated)]">
                  <Image
                    src={listing.images[0].url}
                    alt={localeText(listing.breed.name)}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-108"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1400px) 33vw, 25vw"
                    loading={idx < 4 ? "eager" : "lazy"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                  {/* Favorite */}
                  <FavoriteButton listingId={listing.id} label={`${t("featured.viewAll")} — ${localeText(listing.breed.name)}`} />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {listing.seller.verification_status === "verified" && (
                      <span className="badge badge-teal text-[9px]">✓ Verified</span>
                    )}
                    {listing.is_featured && (
                      <span className="badge badge-accent text-[9px]">✦ Featured</span>
                    )}
                  </div>

                  {/* Price — bottom left */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <span className="font-black text-white text-base font-[family-name:var(--font-mono)] drop-shadow-lg">
                      €{(listing.price / 100).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-white/60 font-[family-name:var(--font-body)]">
                      {listing.age_weeks}w · {listing.gender === "male" ? "♂" : "♀"}
                    </span>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-[var(--t-text)] text-sm leading-snug flex-1 line-clamp-1">
                      {localeText(listing.breed.name)}
                    </p>
                    <div className="flex items-center gap-1 shrink-0">
                      <Star size={11} className="fill-[var(--color-accent)] text-[var(--color-accent)]" />
                      <span className="text-xs text-[rgba(232,228,221,0.65)] font-semibold font-[family-name:var(--font-mono)]">{listing.seller.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-[rgba(232,228,221,0.38)] mt-1 font-[family-name:var(--font-body)]">
                    {listing.location_city}, {listing.location_country}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Link
              href={`/${locale}/search`}
              className="btn-primary inline-flex items-center gap-2 font-[family-name:var(--font-body)]"
            >
              {t("featured.explore")}
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================
          TESTIMONIAL STRIP
      ================================================================ */}
      <section className="border-t border-white/[0.06] py-14 bg-[var(--t-bg)]">
        <div className="max-w-[1760px] mx-auto px-6 sm:px-10 lg:px-20">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: t("testimonials.q1"), name: "Sophie M.", loc: "Brussels", rating: 5 },
              { quote: t("testimonials.q2"), name: "Thomas V.", loc: "Antwerp", rating: 5 },
              { quote: t("testimonials.q3"), name: "Anne-Marie D.", loc: "Amsterdam", rating: 5 },
            ].map((item) => (
              <div key={item.name} className="bg-[var(--t-surface)] rounded-2xl border border-white/[0.06] p-6 hover:border-white/[0.12] transition-all duration-300">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} size={12} className="fill-[var(--color-accent)] text-[var(--color-accent)]" />
                  ))}
                </div>
                <p className="text-sm text-[rgba(232,228,221,0.60)] leading-relaxed mb-4 font-[family-name:var(--font-body)] italic">&ldquo;{item.quote}&rdquo;</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[rgba(255,56,92,0.10)] border border-[rgba(255,56,92,0.15)] flex items-center justify-center text-xs font-bold text-[var(--color-accent)] font-[family-name:var(--font-display)]">{item.name.charAt(0)}</div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--t-text)]">{item.name}</p>
                    <p className="text-[10px] text-[rgba(232,228,221,0.35)] font-[family-name:var(--font-mono)]">{item.loc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          WHY PAWTRUST — dark cinematic
      ================================================================ */}
      <section className="border-t border-white/[0.06] py-20 lg:py-28">
        <div className="max-w-[1760px] mx-auto px-6 sm:px-10 lg:px-20">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="badge badge-teal mb-6">Why PawTrust</div>
              <h2 className="text-4xl lg:text-5xl font-black text-[var(--t-text)] tracking-[-0.03em] mb-5 leading-[1.0]">
                {t("why.title")}
              </h2>
              <p className="text-[rgba(232,228,221,0.50)] text-lg mb-10 leading-relaxed font-[family-name:var(--font-body)]">
                {t("why.subtitle")}
              </p>
              <div className="space-y-5">
                {[
                  { icon: Shield, title: t("why.verified.title"), desc: t("why.verified.desc") },
                  { icon: Award,  title: t("why.documented.title"), desc: t("why.documented.desc") },
                  { icon: Lock,   title: t("why.safe.title"), desc: t("why.safe.desc") },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[rgba(255,56,92,0.10)] border border-[rgba(255,56,92,0.15)] flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-[var(--color-accent)]" />
                    </div>
                    <div>
                      <p className="font-bold text-[var(--t-text)] mb-1 text-sm">{title}</p>
                      <p className="text-[rgba(232,228,221,0.45)] text-sm leading-relaxed font-[family-name:var(--font-body)]">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative h-[420px] lg:h-[520px] rounded-3xl overflow-hidden border border-white/[0.06]">
              <Image
                src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=900&fit=crop"
                alt="Verified breeder"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,15,.7)] via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 glass rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white font-black text-sm shrink-0">M</div>
                  <div>
                    <p className="text-sm font-bold text-[var(--t-text)]">Marc D. · Brussels</p>
                    <p className="text-xs text-[rgba(232,228,221,0.45)] font-[family-name:var(--font-body)]">Verified breeder since 2019 · 47 reviews</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    <Star size={12} className="fill-[var(--color-accent)] text-[var(--color-accent)]" />
                    <span className="text-sm font-black text-[var(--t-text)]">4.97</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          STATS — cinematic counters
      ================================================================ */}
      <section className="border-t border-white/[0.06] py-20">
        <div className="max-w-[1760px] mx-auto px-6 sm:px-10 lg:px-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { number: fmt(stats.listings), label: t("stats.animals"), color: "var(--color-accent)" },
              { number: fmt(stats.breeders), label: t("stats.breeders"), color: "var(--color-accent-teal)" },
              { number: "3",      label: t("stats.countries"), color: "var(--color-accent-warm)" },
              { number: fmt(stats.vets), label: "Verified vets", color: "var(--color-accent-indigo)" },
            ].map(({ number, label, color }) => (
              <div key={label} className="relative group bg-[var(--t-surface)] rounded-2xl border border-white/[0.06] p-6 lg:p-8 text-center overflow-hidden hover:border-white/[0.12] transition-all duration-300">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full opacity-[0.06]" style={{ background: `radial-gradient(circle, ${color}, transparent 70%)` }} />
                <p className="text-4xl lg:text-5xl font-black text-[var(--t-text)] tracking-[-0.04em] font-[family-name:var(--font-display)] relative">
                  {number}
                </p>
                <div className="w-8 h-[2px] rounded-full mx-auto mt-3 mb-2" style={{ background: color, opacity: 0.5 }} />
                <p className="text-sm text-[rgba(232,228,221,0.45)] font-[family-name:var(--font-body)]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          CTA BANNER
      ================================================================ */}
      <section className="border-t border-white/[0.06] py-20 lg:py-28">
        <div className="max-w-[1760px] mx-auto px-6 sm:px-10 lg:px-20">
          <div className="relative rounded-3xl overflow-hidden bg-[var(--t-surface)] border border-white/[0.06]">
            <div className="absolute inset-0">
              <Image
                src="https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=1400&h=500&fit=crop"
                alt="List your pet"
                fill
                className="object-cover opacity-20"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--t-bg)] via-[rgba(10,10,15,.85)] to-transparent" />
            </div>
            <div className="absolute top-[-30%] right-[15%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(255,56,92,0.15)_0%,transparent_70%)] pointer-events-none" />

            <div className="relative z-10 px-10 py-16 lg:px-16 lg:py-20 max-w-xl">
              <div className="badge badge-accent mb-5">For Breeders</div>
              <h2 className="text-4xl lg:text-5xl font-black text-[var(--t-text)] tracking-[-0.03em] mb-4 leading-[1.0]">
                {t("breeders.title")}
              </h2>
              <p className="text-[rgba(232,228,221,0.50)] text-lg mb-8 leading-relaxed font-[family-name:var(--font-body)]">
                {t("breeders.subtitle")}
              </p>
              <Link
                href={`/${locale}/become-a-seller`}
                className="btn-primary inline-flex items-center gap-2 font-[family-name:var(--font-body)]"
              >
                {t("breeders.cta")}
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
