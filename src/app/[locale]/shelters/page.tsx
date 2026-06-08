import Link from "next/link";
import { MapPin, Star, Heart } from "lucide-react";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { PageHeader } from "@/components/ui/page-header";
import { getVerifiedShelters } from "@/lib/public-data";

const MOCK_SHELTERS = [
  { id: "h1", organization_name: "Happy Paws Rescue", slug: "happy-paws", location_city: "Bruges", location_country: "BE", rating: 4.9, review_count: 30 },
  { id: "h2", organization_name: "Refuge du Dr. Luc", slug: "refuge-luc", location_city: "Namur", location_country: "BE", rating: 4.8, review_count: 22 },
];

export default async function SheltersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const real = await getVerifiedShelters();
  const shelters = real.length > 0 ? real : MOCK_SHELTERS;

  return (
    <div className="min-h-screen bg-[var(--t-bg)]">
      <PageHeader
        eyebrow="Verified rescues"
        title="Shelters & Rescues"
        subtitle={`${shelters.length} verified shelters rehoming animals across Benelux`}
        crumbs={[{ label: "PawTrust", href: `/${locale}` }, { label: "Shelters" }]}
      />

      <div className="max-w-[1760px] mx-auto px-6 sm:px-10 lg:px-20 py-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {shelters.map((s) => (
            <Link key={s.id} href={`/${locale}/shelters/${s.slug}`} className="listing-card group bg-[var(--t-surface)] rounded-2xl border border-white/[0.06] p-6">
              <div className="flex items-start gap-3 mb-4">
                {(s as { cover_url?: string }).cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={(s as { cover_url?: string }).cover_url} alt={s.organization_name} className="w-14 h-14 rounded-xl object-cover border border-[rgba(0,166,153,0.20)] shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-[rgba(0,166,153,0.12)] border border-[rgba(0,166,153,0.20)] flex items-center justify-center text-[var(--color-accent-teal)] shrink-0">
                    <Heart size={22} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[var(--t-text)] group-hover:text-[var(--color-accent)] transition-colors leading-snug">{s.organization_name}</div>
                  <VerifiedBadge size="sm" className="mt-1" />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--t-text-muted)] pt-3 border-t border-white/[0.06]">
                <div className="flex items-center gap-1"><MapPin size={11} className="text-[var(--color-accent)]" /> {s.location_city}, {s.location_country}</div>
                <div className="flex items-center gap-1"><Star size={11} className="fill-[var(--color-accent)] text-[var(--color-accent)]" /> {s.rating} ({s.review_count})</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
