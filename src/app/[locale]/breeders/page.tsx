import Link from "next/link";
import { MapPin, Star, Clock } from "lucide-react";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { PageHeader } from "@/components/ui/page-header";
import { getVerifiedSellers } from "@/lib/public-data";

const MOCK_SELLERS = [
  { id: "s1", business_name: "Goldenfarm Kennel",      slug: "goldenfarm-kennel",      location_city: "Brussels",        location_country: "BE", rating: 4.9, review_count: 47, total_sales: 128, years_experience: 12, badge_level: "premium", total_listings: 5, response_time_hours: 6,  specialties: ["Golden Retriever", "Labrador"] },
  { id: "s2", business_name: "BullFrench Excellence",  slug: "bullfrench-excellence",  location_city: "Antwerp",         location_country: "BE", rating: 4.7, review_count: 29, total_sales: 64,  years_experience: 8,  badge_level: "pro",     total_listings: 3, response_time_hours: 12, specialties: ["French Bulldog"] },
  { id: "s3", business_name: "Maine Dream Cattery",    slug: "maine-dream-cattery",    location_city: "Amsterdam",       location_country: "NL", rating: 4.8, review_count: 33, total_sales: 89,  years_experience: 15, badge_level: "premium", total_listings: 4, response_time_hours: 8,  specialties: ["Maine Coon", "Bengal"] },
  { id: "s4", business_name: "Equiline Stables",       slug: "equiline-stables",       location_city: "Ghent",           location_country: "BE", rating: 4.6, review_count: 18, total_sales: 42,  years_experience: 20, badge_level: "premium", total_listings: 2, response_time_hours: 24, specialties: ["KWPN", "Shetland Pony"] },
  { id: "s5", business_name: "Poodle Paradise",        slug: "poodle-paradise",        location_city: "Rotterdam",       location_country: "NL", rating: 4.9, review_count: 56, total_sales: 210, years_experience: 18, badge_level: "premium", total_listings: 6, response_time_hours: 4,  specialties: ["Poodle", "Doodles"] },
  { id: "s6", business_name: "Luxembourg Pets",        slug: "luxembourg-pets",        location_city: "Luxembourg City", location_country: "LU", rating: 4.5, review_count: 12, total_sales: 35,  years_experience: 5,  badge_level: "basic",   total_listings: 3, response_time_hours: 18, specialties: ["Various breeds"] },
];

interface BreedersPageProps {
  params: Promise<{ locale: string }>;
}

export default async function BreedersPage({ params }: BreedersPageProps) {
  const { locale } = await params;
  const supabaseSellers = await getVerifiedSellers();
  const sellers = supabaseSellers.length > 0 ? supabaseSellers : MOCK_SELLERS;

  return (
    <div className="min-h-screen bg-[var(--t-bg)]">

      <PageHeader
        eyebrow="All manually verified"
        title="Verified Breeders"
        subtitle={`${sellers.length} verified breeders across Belgium, Luxembourg, and the Netherlands`}
        crumbs={[{ label: "PawTrust", href: `/${locale}` }, { label: "Breeders" }]}
      />

      {/* ── Grid ─────────────────────────────────────────────────── */}
      <div className="max-w-[1760px] mx-auto px-6 sm:px-10 lg:px-20 py-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sellers.map((seller) => (
            <Link
              key={seller.id}
              href={`/${locale}/breeders/${seller.slug}`}
              className="listing-card group bg-[var(--t-surface)] rounded-2xl border border-white/[0.06] p-6"
            >
              <div className="flex items-start gap-3 mb-4">
                {/* Avatar */}
                {((seller as { cover_url?: string }).cover_url || (seller as { avatar_url?: string }).avatar_url) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={(seller as { cover_url?: string }).cover_url || (seller as { avatar_url?: string }).avatar_url} alt={seller.business_name} className="w-14 h-14 rounded-xl object-cover border border-[rgba(255,56,92,0.20)] shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-[rgba(255,56,92,0.12)] border border-[rgba(255,56,92,0.20)] flex items-center justify-center text-[var(--color-accent)] font-bold text-2xl shrink-0">
                    {seller.business_name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[var(--t-text)] group-hover:text-[var(--color-accent)] transition-colors leading-snug">
                    {seller.business_name}
                  </div>
                  <VerifiedBadge size="sm" className="mt-1" />
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 font-[family-name:var(--font-mono)] uppercase tracking-wider ${
                  seller.badge_level === "premium"
                    ? "bg-[rgba(184,150,12,0.15)] text-[var(--color-accent-gold)] border border-[rgba(184,150,12,0.25)]"
                    : seller.badge_level === "pro"
                      ? "bg-[rgba(0,166,153,0.12)] text-[var(--color-accent-teal)] border border-[rgba(0,166,153,0.20)]"
                      : "bg-white/[0.05] text-[rgba(232,228,221,0.40)] border border-white/[0.08]"
                }`}>
                  {seller.badge_level}
                </span>
              </div>

              {/* Specialties */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {seller.specialties.map((s: string) => (
                  <span key={s} className="px-2.5 py-0.5 rounded-full text-xs bg-white/[0.04] text-[rgba(232,228,221,0.50)] border border-white/[0.07]">
                    {s}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-center py-3 border-t border-b border-white/[0.06] mb-4">
                <div>
                  <div className="flex items-center justify-center gap-0.5">
                    <Star size={11} className="fill-[var(--color-accent)] text-[var(--color-accent)]" />
                    <span className="text-sm font-bold text-[var(--t-text)]">{seller.rating}</span>
                  </div>
                  <div className="text-xs text-[rgba(232,228,221,0.35)]">{seller.review_count} reviews</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-[var(--t-text)] font-[family-name:var(--font-mono)]">{seller.total_sales}</div>
                  <div className="text-xs text-[rgba(232,228,221,0.35)]">rehomed</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-[var(--t-text)] font-[family-name:var(--font-mono)]">{seller.years_experience}y</div>
                  <div className="text-xs text-[rgba(232,228,221,0.35)]">experience</div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-[rgba(232,228,221,0.35)]">
                <div className="flex items-center gap-1">
                  <MapPin size={11} className="text-[var(--color-accent)]" />
                  {seller.location_city}, {seller.location_country}
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={11} />
                  ~{seller.response_time_hours}h response
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
