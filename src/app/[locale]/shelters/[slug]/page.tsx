import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin, Star, Heart, Gift, Shield } from "lucide-react";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { getShelterBySlug } from "@/lib/public-data";

export default async function ShelterDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const data = await getShelterBySlug(slug);
  if (!data) notFound();
  const shelter = data.shelter as Record<string, unknown>;
  const listings = data.listings;

  const text = (obj: unknown, fb = "") => {
    const o = obj as Record<string, string> | undefined;
    return (o && (o[locale] || o.en)) || fb;
  };

  return (
    <div className="min-h-screen bg-[var(--t-bg)]">
      {shelter.cover_url ? (
        <div className="relative h-48 sm:h-64 w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={shelter.cover_url as string} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--t-bg)] via-[var(--t-bg)]/40 to-transparent" />
        </div>
      ) : null}
      {/* Header */}
      <div className={`border-b border-white/[0.06] pb-10 ${shelter.cover_url ? "pt-6" : "pt-28"}`}>
        <div className="max-w-[1760px] mx-auto px-6 sm:px-10 lg:px-20 mb-5">
          <Breadcrumb items={[{ label: "PawTrust", href: `/${locale}` }, { label: "Shelters", href: `/${locale}/shelters` }, { label: shelter.organization_name as string }]} />
        </div>
        <div className="max-w-[1760px] mx-auto px-6 sm:px-10 lg:px-20 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-[rgba(0,166,153,0.12)] border border-[rgba(0,166,153,0.20)] flex items-center justify-center text-[var(--color-accent-teal)] shrink-0">
            <Heart size={34} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-3xl font-black text-[var(--t-text)] tracking-[-0.02em]">{shelter.organization_name as string}</h1>
              <VerifiedBadge size="sm" />
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-[var(--t-text-secondary)]">
              <span className="flex items-center gap-1"><MapPin size={13} className="text-[var(--color-accent)]" /> {String(shelter.location_city ?? "")}, {String(shelter.location_country ?? "")}</span>
              <span className="flex items-center gap-1"><Star size={13} className="fill-[var(--color-accent)] text-[var(--color-accent)]" /> {Number(shelter.rating ?? 0)} ({Number(shelter.review_count ?? 0)})</span>
            </div>
          </div>
          <Link href="#adopt" className="btn-primary inline-flex items-center gap-2 shrink-0"><Gift size={16} /> Donate</Link>
        </div>
      </div>

      {/* Adoption listings */}
      <div id="adopt" className="max-w-[1760px] mx-auto px-6 sm:px-10 lg:px-20 py-10">
        <div className="flex items-center gap-2 mb-6">
          <Shield size={14} className="text-[var(--color-accent-teal)]" />
          <h2 className="text-xl font-bold text-[var(--t-text)]">Animals for adoption ({listings.length})</h2>
        </div>

        {listings.length === 0 ? (
          <p className="text-[var(--t-text-secondary)]">No animals listed for adoption right now. Check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {listings.map((l) => (
              <Link key={l.id} href={`/${locale}/listings/${l.id}`} className="listing-card group block bg-[var(--t-surface)] border border-white/[0.06] rounded-2xl overflow-hidden">
                <div className="relative aspect-[4/3] overflow-hidden bg-[var(--t-elevated)]">
                  <Image src={l.images[0].url} alt={text(l.breed.name, "Animal")} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width:640px) 100vw, 25vw" />
                  <span className="badge badge-teal absolute top-3 left-3">For adoption</span>
                </div>
                <div className="p-4">
                  <p className="font-bold text-[var(--t-text)] text-sm line-clamp-1">{text(l.breed.name, "Animal")}</p>
                  <p className="text-xs text-[var(--t-text-muted)] mt-1 flex items-center gap-1"><MapPin size={11} /> {l.location_city}, {l.location_country}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
