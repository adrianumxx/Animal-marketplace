import { getTranslations } from "next-intl/server";
import { MapPin, Globe, Phone, Video, UserCheck } from "lucide-react";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { StarRating } from "@/components/ui/star-rating";
import { getVetBySlug } from "@/lib/public-data";

const MOCK_VET = {
  id: "v1",
  business_name: "Dr. Emma Vandenberghe",
  slug: "dr-emma-vandenberghe",
  bio: {
    en: "Dr. Emma Vandenberghe is a highly experienced small animal veterinarian with over 14 years of practice in Brussels. She specializes in exotic animals, dogs, and cats, with particular expertise in avian medicine and reptile care.\n\nDr. Vandenberghe holds a degree from the Royal Veterinary College and has completed advanced training in exotic animal medicine. She is a member of the Belgian Veterinary Association and the European Association of Avian Veterinarians.",
    fr: "Dr. Emma Vandenberghe est une vétérinaire expérimentée en médecine des petits animaux.",
    nl: "Dr. Emma Vandenberghe is een ervaren dierenarts voor kleine dieren.",
  },
  location_city: "Brussels",
  location_country: "BE",
  license_number: "VET-BE-2890",
  specializations: ["dogs", "cats", "exotic", "birds"],
  verification_status: "verified" as const,
  accepts_new_patients: true,
  telemedicine: true,
  languages: ["fr", "nl", "en"],
  website_url: "https://dr-vandenberghe.be",
  phone: "+32 2 234 56 78",
  rating: 4.9,
  review_count: 112,
};

const MOCK_VET_REVIEWS = [
  { id: "r1", rating: 5, title: "Exceptional care for my exotic parrot", body: "Dr. Vandenberghe has been caring for my African Grey for 3 years. Her expertise in avian medicine is remarkable and her communication is always clear and compassionate.", reviewer: { full_name: "Thomas B." }, created_at: "2024-02-20" },
  { id: "r2", rating: 5, title: "Best vet in Brussels", body: "Incredibly knowledgeable, patient and thorough. She took the time to explain everything about my dog's condition and treatment plan. Highly recommend!", reviewer: { full_name: "Amélie P." }, created_at: "2024-01-15" },
];

interface VetProfileProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function VetProfilePage({ params }: VetProfileProps) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "vet" });

  const real = await getVetBySlug(slug);
  const vet = (real?.vet as unknown as typeof MOCK_VET) ?? MOCK_VET;
  const reviews = (real?.reviews ?? []) as typeof MOCK_VET_REVIEWS;
  const bio = vet.bio?.[locale as "en" | "fr" | "nl"] || vet.bio?.en || "";

  return (
    <div className="min-h-screen bg-[var(--t-bg)]">
      {/* Header */}
      <div className="border-b border-white/[0.06] pt-24 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            {(vet as { avatar_url?: string }).avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={(vet as { avatar_url?: string }).avatar_url} alt={vet.business_name} className="w-20 h-20 rounded-2xl object-cover border border-[rgba(0,166,153,0.20)] shrink-0" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-[rgba(0,166,153,0.10)] border border-[rgba(0,166,153,0.20)] flex items-center justify-center text-[var(--color-accent-teal)] font-bold text-3xl shrink-0 font-[family-name:var(--font-display)]">
                {vet.business_name.charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[var(--t-text)] mb-1 tracking-[-0.02em] font-[family-name:var(--font-display)]">{vet.business_name}</h1>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <VerifiedBadge size="md" />
                <div className="flex items-center gap-1">
                  <StarRating rating={vet.rating} size={14} />
                  <span className="font-semibold text-[var(--t-text)]">{vet.rating}</span>
                  <span className="text-[rgba(232,228,221,0.35)] text-sm">({vet.review_count} reviews)</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-[rgba(232,228,221,0.45)]">
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  {vet.location_city}, {vet.location_country}
                </div>
                <div className="font-[family-name:var(--font-mono)] text-xs">{t("license")}: {vet.license_number}</div>
                {vet.website_url && (
                  <a href={vet.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-[var(--color-accent-teal)] transition-colors">
                    <Globe size={14} />
                    Website
                  </a>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {vet.telemedicine && (
                  <span className="badge badge-teal text-[10px]">
                    <Video size={11} />
                    {t("telemedicine")}
                  </span>
                )}
                <span className={`badge text-[10px] ${
                  vet.accepts_new_patients ? "badge-teal" : "badge-neutral"
                }`}>
                  <UserCheck size={11} />
                  {vet.accepts_new_patients ? t("acceptingPatients") : t("notAccepting")}
                </span>
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              <a
                href={`tel:${vet.phone}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.10] text-sm font-medium text-[rgba(232,228,221,0.60)] hover:text-[var(--t-text)] hover:border-white/[0.20] hover:bg-white/[0.03] transition-all duration-200"
              >
                <Phone size={15} />
                Call
              </a>
              <button className="px-4 py-2.5 rounded-xl bg-[var(--color-accent-teal)] hover:bg-[var(--color-accent-teal)] text-white text-sm font-bold transition-all duration-200 hover:shadow-[0_8px_24px_rgba(0,166,153,0.30)]">
                {t("contact")}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">
        {/* Specializations */}
        <div className="bg-[var(--t-surface)] rounded-2xl border border-white/[0.06] p-6">
          <h2 className="font-bold text-[var(--t-text)] mb-3 font-[family-name:var(--font-display)]">{t("specializations")}</h2>
          <div className="flex flex-wrap gap-2">
            {vet.specializations.map((spec) => (
              <span key={spec} className="badge badge-teal capitalize">{spec}</span>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div className="bg-[var(--t-surface)] rounded-2xl border border-white/[0.06] p-6">
          <h2 className="font-bold text-[var(--t-text)] mb-3 font-[family-name:var(--font-display)]">{t("languages")}</h2>
          <div className="flex gap-2">
            {vet.languages.map((lang) => (
              <span key={lang} className="px-3 py-1.5 rounded-full text-sm bg-white/[0.04] text-[rgba(232,228,221,0.60)] border border-white/[0.08] uppercase font-bold font-[family-name:var(--font-mono)] text-xs">
                {lang}
              </span>
            ))}
          </div>
        </div>

        {/* About */}
        <div className="bg-[var(--t-surface)] rounded-2xl border border-white/[0.06] p-6">
          <h2 className="font-bold text-[var(--t-text)] mb-3 font-[family-name:var(--font-display)]">{t("about")}</h2>
          <p className="text-sm text-[rgba(232,228,221,0.55)] leading-relaxed whitespace-pre-line">{bio}</p>
        </div>

        {/* Reviews */}
        <div className="bg-[var(--t-surface)] rounded-2xl border border-white/[0.06] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-[var(--t-text)] font-[family-name:var(--font-display)]">{t("reviews")} ({vet.review_count})</h2>
            <div className="flex items-center gap-1.5">
              <StarRating rating={vet.rating} size={15} />
              <span className="font-bold text-[var(--t-text)]">{vet.rating}</span>
            </div>
          </div>
          <div className="space-y-4">
            {reviews.length === 0 && (
              <p className="text-sm text-[var(--t-text-muted)]">No reviews yet.</p>
            )}
            {reviews.map((review) => (
              <div key={review.id} className="border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.12] transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[rgba(0,166,153,0.10)] border border-[rgba(0,166,153,0.15)] flex items-center justify-center text-xs font-bold text-[var(--color-accent-teal)]">
                      {review.reviewer.full_name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[var(--t-text)]">{review.reviewer.full_name}</div>
                      <div className="text-[10px] text-[rgba(232,228,221,0.30)] font-[family-name:var(--font-mono)]">{new Date(review.created_at).toLocaleDateString(locale)}</div>
                    </div>
                  </div>
                  <StarRating rating={review.rating} size={13} />
                </div>
                {review.title && <div className="text-sm font-semibold text-[var(--t-text)] mb-1">{review.title}</div>}
                <p className="text-sm text-[rgba(232,228,221,0.50)] leading-relaxed">{review.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
