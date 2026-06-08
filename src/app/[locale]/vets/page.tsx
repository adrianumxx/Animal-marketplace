import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { MapPin, Star, Video, UserCheck } from "lucide-react";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { PageHeader } from "@/components/ui/page-header";
import { getVerifiedVets } from "@/lib/public-data";

const MOCK_VETS = [
  { id: "v1", business_name: "Dr. Emma Vandenberghe", slug: "dr-emma-vandenberghe", location_city: "Brussels", location_country: "BE", rating: 4.9, review_count: 112, specializations: ["dogs", "cats", "exotic"], telemedicine: true, accepts_new_patients: true, languages: ["fr", "nl", "en"] },
  { id: "v2", business_name: "Animal Care Clinic", slug: "animal-care-clinic", location_city: "Antwerp", location_country: "BE", rating: 4.7, review_count: 78, specializations: ["dogs", "cats", "rabbits"], telemedicine: false, accepts_new_patients: true, languages: ["nl", "en"] },
  { id: "v3", business_name: "Dr. Pierre Lecomte", slug: "dr-pierre-lecomte", location_city: "Liège", location_country: "BE", rating: 4.8, review_count: 64, specializations: ["horses", "dogs"], telemedicine: true, accepts_new_patients: false, languages: ["fr", "en"] },
  { id: "v4", business_name: "Rotterdam Animal Hospital", slug: "rotterdam-animal-hospital", location_city: "Rotterdam", location_country: "NL", rating: 4.6, review_count: 94, specializations: ["dogs", "cats", "birds", "exotic"], telemedicine: true, accepts_new_patients: true, languages: ["nl", "en"] },
  { id: "v5", business_name: "Dr. Sophie Maes", slug: "dr-sophie-maes", location_city: "Ghent", location_country: "BE", rating: 4.9, review_count: 55, specializations: ["cats", "rabbits", "exotic"], telemedicine: false, accepts_new_patients: true, languages: ["nl", "fr", "en"] },
  { id: "v6", business_name: "Luxembourg Veterinary Center", slug: "luxembourg-vet-center", location_city: "Luxembourg City", location_country: "LU", rating: 4.5, review_count: 38, specializations: ["dogs", "cats"], telemedicine: true, accepts_new_patients: true, languages: ["fr", "de", "en"] },
];

interface VetsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function VetsPage({ params }: VetsPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "vet" });
  const supabaseVets = await getVerifiedVets();
  const vets = supabaseVets.length > 0 ? supabaseVets : MOCK_VETS;

  return (
    <div className="min-h-screen bg-[var(--t-bg)]">
      <PageHeader
        eyebrow="Trusted partners"
        title={t("directory.title")}
        subtitle={t("directory.subtitle")}
        crumbs={[{ label: "PawTrust", href: `/${locale}` }, { label: "Vets" }]}
      />

      <div className="max-w-[1760px] mx-auto px-6 sm:px-10 lg:px-20 py-8">
        <div className="grid md:grid-cols-2 gap-4">
          {vets.map((vet) => (
            <Link
              key={vet.id}
              href={`/${locale}/vets/${vet.slug}`}
              className="listing-card group flex gap-4 bg-[var(--t-surface)] rounded-2xl border border-white/[0.06] hover:border-white/[0.14] p-5 transition-all duration-200"
            >
              {/* Avatar */}
              {(vet as { avatar_url?: string }).avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={(vet as { avatar_url?: string }).avatar_url} alt={vet.business_name} className="w-14 h-14 rounded-xl object-cover border border-[rgba(0,166,153,0.20)] shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-[rgba(0,166,153,0.10)] border border-[rgba(0,166,153,0.20)] flex items-center justify-center text-[var(--color-accent-teal)] font-bold text-xl shrink-0 font-[family-name:var(--font-display)]">
                  {vet.business_name.charAt(0)}
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-[var(--t-text)] group-hover:text-[var(--color-accent-teal)] transition-colors text-sm">
                    {vet.business_name}
                  </h3>
                </div>

                <div className="flex items-center gap-2 mb-2.5">
                  <VerifiedBadge size="sm" label="" />
                  <div className="flex items-center gap-1">
                    <Star size={12} className="fill-[var(--color-accent)] text-[var(--color-accent)]" />
                    <span className="text-sm font-medium text-[var(--t-text)]">{vet.rating}</span>
                    <span className="text-xs text-[rgba(232,228,221,0.35)]">({vet.review_count})</span>
                  </div>
                </div>

                {/* Specializations */}
                <div className="flex flex-wrap gap-1 mb-2.5">
                  {vet.specializations.slice(0, 3).map((spec: string) => (
                    <span key={spec} className="badge badge-teal text-[9px] capitalize">
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center gap-3 text-xs text-[rgba(232,228,221,0.40)]">
                  <div className="flex items-center gap-1">
                    <MapPin size={11} />
                    {vet.location_city}
                  </div>
                  {vet.telemedicine && (
                    <div className="flex items-center gap-1 text-[var(--color-accent-indigo)]">
                      <Video size={11} />
                      {t("telemedicine")}
                    </div>
                  )}
                  <div className={`flex items-center gap-1 ${vet.accepts_new_patients ? "text-[var(--color-accent-teal)]" : "text-[rgba(232,228,221,0.30)]"}`}>
                    <UserCheck size={11} />
                    {vet.accepts_new_patients ? t("acceptingPatients") : t("notAccepting")}
                  </div>
                </div>

                {/* Languages */}
                <div className="flex gap-1 mt-2">
                  {vet.languages.map((lang: string) => (
                    <span key={lang} className="px-1.5 py-0.5 rounded text-[10px] bg-white/[0.04] text-[rgba(232,228,221,0.45)] border border-white/[0.06] uppercase font-bold font-[family-name:var(--font-mono)]">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
