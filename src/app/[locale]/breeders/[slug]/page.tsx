import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin, Globe, Phone, Star, Clock,
  MessageCircle, Award, ShieldCheck, TrendingUp, Eye,
} from "lucide-react";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { StarRating } from "@/components/ui/star-rating";
import { getSellerBySlug } from "@/lib/public-data";

const MOCK_SELLER = {
  id: "s1",
  business_name: "Goldenfarm Kennel",
  slug: "goldenfarm-kennel",
  bio: {
    en: "We are a family-run Golden Retriever kennel based in Brussels, Belgium. With over 12 years of experience, we are dedicated to breeding healthy, well-tempered Golden Retrievers with exceptional pedigrees. All our breeding dogs undergo comprehensive health testing including hip and elbow scoring, heart, and eye examinations in accordance with GRCC standards.\n\nOur puppies are raised in a home environment with children and other dogs, ensuring excellent socialization from the very first day. We are members of the Belgian Kennel Club (KMSH) and the Golden Retriever Club of Belgium.",
    fr: "Nous sommes un chenil familial Golden Retriever basé à Bruxelles, Belgique.",
    nl: "Wij zijn een familiematig Golden Retriever kennel gevestigd in Brussel, België.",
  },
  location_city: "Brussels",
  location_country: "BE",
  approval_number: "BE-2024-001",
  enci_number: "FCI-1234",
  verification_status: "verified" as const,
  verified_at: "2024-01-01",
  badge_level: "premium" as const,
  years_experience: 12,
  website_url: "https://goldenfarmkennel.be",
  phone: "+32 2 123 45 67",
  response_rate: 98,
  response_time_hours: 6,
  total_listings: 5,
  total_sales: 128,
  rating: 4.9,
  review_count: 47,
  avatar_url: null,
  cover_url: null,
  social_links: { instagram: "goldenfarmkennel", facebook: "goldenfarmkennel" },
  user_id: "u1",
};

const MOCK_LISTINGS = [
  { id: "1", title: { en: "Golden Retriever — Male, KC Registered", fr: "", nl: "" }, price: 145000, location_city: "Brussels", images: [{ url: "https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=400&h=300&fit=crop", is_primary: true }], view_count: 234, inquiry_count: 12, status: "active", age_weeks: 10, gender: "male", price_negotiable: false },
  { id: "4", title: { en: "Golden Retriever — Female, Pedigree", fr: "", nl: "" }, price: 155000, location_city: "Brussels", images: [{ url: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop", is_primary: true }], view_count: 189, inquiry_count: 8, status: "active", age_weeks: 9, gender: "female", price_negotiable: false },
];

const MOCK_REVIEWS = [
  { id: "r1", rating: 5, title: "Exceptional breeder, highly recommended!", body: "We purchased our Golden Retriever from Goldenfarm Kennel 3 years ago and it has been the best decision. The puppy was well-socialized, healthy, and exactly as described. The breeder was incredibly helpful throughout the process.", reviewer: { full_name: "Marie D.", avatar_url: null }, created_at: "2024-02-15" },
  { id: "r2", rating: 5, title: "Professional and trustworthy", body: "The whole experience was smooth and transparent. Documents were all in order, and the puppy's health tests were impeccable. Would definitely recommend to anyone looking for a Golden Retriever.", reviewer: { full_name: "Jan V.", avatar_url: null }, created_at: "2024-01-20" },
  { id: "r3", rating: 4, title: "Great experience overall", body: "Very professional breeder with beautiful dogs. Response time was quick and all questions were answered thoroughly. The puppy is now 1 year old and perfectly healthy.", reviewer: { full_name: "Sophie L.", avatar_url: null }, created_at: "2023-12-10" },
];

interface SellerProfileProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function SellerProfilePage({ params }: SellerProfileProps) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "seller" });

  const data = await getSellerBySlug(slug);
  const seller = (data?.seller as unknown as typeof MOCK_SELLER) ?? MOCK_SELLER;
  const listings = (data?.listings?.length ? (data.listings as unknown as typeof MOCK_LISTINGS) : MOCK_LISTINGS);
  const reviews = (data?.reviews ?? []) as typeof MOCK_REVIEWS;
  const bio = seller.bio?.[locale as "en" | "fr" | "nl"] || seller.bio?.en || "";

  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    return { stars, count, pct: reviews.length ? (count / reviews.length) * 100 : 0 };
  });

  return (
    <div className="min-h-screen bg-[var(--t-bg)]">
      {/* Hero cover */}
      <div className="relative h-48 sm:h-64 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--t-bg)] via-[var(--t-surface)] to-[var(--t-elevated)]" />
        {seller.cover_url && (
          <Image src={seller.cover_url} alt="" fill className="object-cover opacity-40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--t-bg)] via-transparent to-transparent" />
        <div className="absolute top-[-10%] right-[10%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(255,56,92,0.12)_0%,transparent_70%)] pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile header */}
        <div className="relative -mt-16 mb-8">
          <div className="bg-[var(--t-surface)] rounded-2xl border border-white/[0.06] p-6 shadow-[0_8px_40px_rgba(0,0,0,0.3)]">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              {/* Avatar */}
              {(seller.avatar_url || seller.cover_url) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={seller.avatar_url || seller.cover_url || ""} alt={seller.business_name} className="w-24 h-24 rounded-2xl object-cover border-2 border-[rgba(255,56,92,0.20)] shadow-[0_0_20px_rgba(255,56,92,0.15)] shrink-0" />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-[rgba(255,56,92,0.08)] border-2 border-[rgba(255,56,92,0.20)] flex items-center justify-center text-[var(--color-accent)] font-bold text-3xl shadow-[0_0_20px_rgba(255,56,92,0.15)] shrink-0 font-[family-name:var(--font-display)]">
                  {seller.business_name.charAt(0)}
                </div>
              )}

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-bold text-[var(--t-text)] tracking-[-0.02em] font-[family-name:var(--font-display)]">{seller.business_name}</h1>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <VerifiedBadge size="md" />
                      <span className={`badge text-[10px] ${
                        seller.badge_level === "premium" ? "badge-gold" :
                        seller.badge_level === "pro" ? "badge-accent" :
                        "badge-neutral"
                      }`}>
                        {seller.badge_level.charAt(0).toUpperCase() + seller.badge_level.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={`tel:${seller.phone}`}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.10] text-sm font-medium text-[rgba(232,228,221,0.60)] hover:text-[var(--t-text)] hover:border-white/[0.20] hover:bg-white/[0.03] transition-all duration-200"
                    >
                      <Phone size={15} />
                      Call
                    </a>
                    <a href="#listings" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-sm font-bold transition-all duration-200 hover:shadow-[0_8px_24px_rgba(255,56,92,0.35)]">
                      <MessageCircle size={15} />
                      {t("contact")}
                    </a>
                  </div>
                </div>

                {/* Verification info */}
                <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/[0.06] text-sm text-[rgba(232,228,221,0.45)]">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-[var(--color-accent-teal)]" />
                    <span>{t("verifiedBy")}</span>
                    <span className="font-[family-name:var(--font-mono)] text-xs text-[rgba(232,228,221,0.60)]">{seller.approval_number}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} />
                    {seller.location_city}, {seller.location_country}
                  </div>
                  {seller.website_url && (
                    <a href={seller.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[var(--color-accent)] transition-colors">
                      <Globe size={14} />
                      Website
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6 pt-5 border-t border-white/[0.06]">
              {[
                { icon: Star, value: seller.rating.toFixed(1), label: "Rating", accent: "var(--color-accent)" },
                { icon: MessageCircle, value: `${seller.review_count}`, label: "Reviews", accent: "var(--color-accent-indigo)" },
                { icon: TrendingUp, value: `${seller.total_sales}`, label: t("totalSales"), accent: "var(--color-accent-teal)" },
                { icon: Clock, value: `~${seller.response_time_hours}h`, label: t("responseTime"), accent: "var(--color-accent-gold)" },
                { icon: Award, value: `${seller.years_experience}y`, label: t("yearsActive"), accent: "var(--color-accent-warm)" },
              ].map(({ icon: Icon, value, label, accent }) => (
                <div key={label} className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-0.5">
                    <Icon size={14} style={{ color: accent }} />
                    <span className="text-lg font-bold text-[var(--t-text)] font-[family-name:var(--font-display)] tracking-[-0.02em]">{value}</span>
                  </div>
                  <div className="text-[10px] text-[rgba(232,228,221,0.35)] uppercase tracking-[0.06em] font-[family-name:var(--font-mono)]">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 pb-12">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            {/* About */}
            <div className="bg-[var(--t-surface)] rounded-2xl border border-white/[0.06] p-6">
              <h2 className="text-lg font-bold text-[var(--t-text)] mb-3 font-[family-name:var(--font-display)]">{t("about")}</h2>
              <p className="text-sm text-[rgba(232,228,221,0.55)] leading-relaxed whitespace-pre-line">{bio}</p>
            </div>

            {/* Active listings */}
            <div id="listings" className="bg-[var(--t-surface)] rounded-2xl border border-white/[0.06] p-6 scroll-mt-24">
              <h2 className="text-lg font-bold text-[var(--t-text)] mb-4 font-[family-name:var(--font-display)]">
                {t("activeListings")} ({listings.length})
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {listings.map((listing) => (
                  <Link
                    key={listing.id}
                    href={`/${locale}/listings/${listing.id}`}
                    className="listing-card group border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/[0.14] transition-all"
                  >
                    <div className="relative h-36 bg-[var(--t-elevated)] overflow-hidden">
                      <Image
                        src={listing.images[0].url}
                        alt={listing.title.en}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 1024px) 50vw, 300px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                    <div className="p-3.5">
                      <div className="font-semibold text-[var(--t-text)] text-sm mb-1 line-clamp-2 group-hover:text-[var(--color-accent)] transition-colors">
                        {listing.title.en}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[var(--t-text)] font-[family-name:var(--font-mono)]">
                          €{(listing.price / 100).toLocaleString()}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-[rgba(232,228,221,0.35)] font-[family-name:var(--font-mono)]">
                          <span className="flex items-center gap-1"><Eye size={11} />{listing.view_count}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-[var(--t-surface)] rounded-2xl border border-white/[0.06] p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[var(--t-text)] font-[family-name:var(--font-display)]">
                  {t("reviewsTitle")} ({seller.review_count})
                </h2>
                <div className="flex items-center gap-2">
                  <StarRating rating={seller.rating} size={16} />
                  <span className="font-bold text-[var(--t-text)]">{seller.rating}</span>
                </div>
              </div>

              {/* Rating distribution */}
              <div className="space-y-2 mb-6">
                {ratingDistribution.map(({ stars, count, pct }) => (
                  <div key={stars} className="flex items-center gap-3 text-sm">
                    <span className="text-[rgba(232,228,221,0.45)] w-4 font-[family-name:var(--font-mono)] text-xs">{stars}</span>
                    <Star size={13} className="text-[var(--color-accent)] fill-[var(--color-accent)]" />
                    <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--color-accent)] rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[rgba(232,228,221,0.30)] w-4 text-right font-[family-name:var(--font-mono)] text-xs">{count}</span>
                  </div>
                ))}
              </div>

              {/* Review cards */}
              <div className="space-y-4">
                {reviews.length === 0 && (
                  <p className="text-sm text-[var(--t-text-muted)]">No reviews yet — reviews appear after a verified transaction.</p>
                )}
                {reviews.map((review) => (
                  <div key={review.id} className="border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.12] transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[rgba(255,56,92,0.08)] border border-[rgba(255,56,92,0.15)] flex items-center justify-center text-xs font-bold text-[var(--color-accent)]">
                          {review.reviewer.full_name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[var(--t-text)]">{review.reviewer.full_name}</div>
                          <div className="text-[10px] text-[rgba(232,228,221,0.30)] font-[family-name:var(--font-mono)]">
                            {new Date(review.created_at).toLocaleDateString(locale)}
                          </div>
                        </div>
                      </div>
                      <StarRating rating={review.rating} size={13} />
                    </div>
                    {review.title && (
                      <div className="text-sm font-semibold text-[var(--t-text)] mb-1">{review.title}</div>
                    )}
                    <p className="text-sm text-[rgba(232,228,221,0.50)] leading-relaxed">{review.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Certifications */}
            <div className="bg-[var(--t-surface)] rounded-2xl border border-white/[0.06] p-5">
              <h3 className="font-bold text-[var(--t-text)] mb-4 font-[family-name:var(--font-display)]">{t("certifications")}</h3>
              <div className="space-y-3">
                {[
                  { label: "Belgian Kennel Club (KMSH)", icon: "🏅" },
                  { label: "Golden Retriever Club Belgium", icon: "🐕" },
                  { label: "FCI Member", icon: "🌍" },
                  { label: "Regional Approved Breeder", icon: "✅" },
                ].map(({ label, icon }) => (
                  <div key={label} className="flex items-center gap-2.5 text-sm text-[rgba(232,228,221,0.60)]">
                    <span className="text-base">{icon}</span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact card */}
            <div className="bg-[rgba(255,56,92,0.06)] border border-[rgba(255,56,92,0.15)] rounded-2xl p-5">
              <h3 className="font-bold text-[var(--t-text)] mb-1 font-[family-name:var(--font-display)]">{t("contact")}</h3>
              <p className="text-xs text-[rgba(232,228,221,0.40)] mb-4">
                Typically responds within {seller.response_time_hours} hours
              </p>
              <a href="#listings" className="block text-center w-full py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold rounded-xl transition-all duration-200 text-sm hover:shadow-[0_8px_24px_rgba(255,56,92,0.35)]">
                Send message
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
