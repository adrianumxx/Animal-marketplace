import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin, Eye, Share2, ChevronLeft, ExternalLink, Star,
  MessageCircle, Shield, Syringe, Award, Heart, Clock,
  CheckCircle2, XCircle, Fingerprint, FileText, Zap,
  Users, Smile, PawPrint, ArrowRight,
} from "lucide-react";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { InquiryForm } from "@/components/marketplace/inquiry-form";
import { notFound } from "next/navigation";
import { MOCK_LISTINGS } from "@/lib/mock-data";
import { getListingDetail, getSimilarListings } from "@/lib/public-data";
import { getAuthUser } from "@/lib/auth";

interface ListingDetailProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function ListingDetailPage({ params }: ListingDetailProps) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "listing" });

  const listing = await getListingDetail(id);
  if (!listing) notFound();
  const supabaseSimilar = await getSimilarListings(String(listing.species.slug), listing.id, 2);
  const fallbackSimilar = MOCK_LISTINGS.filter(
    (l) => l.species.slug === listing.species.slug && l.id !== listing.id
  ).slice(0, 2);
  const similar = supabaseSimilar.length > 0 ? supabaseSimilar : fallbackSimilar;

  const viewer = await getAuthUser();
  const isAdoption = (listing as { listing_type?: string }).listing_type === "adoption";

  const localeText = (obj: Record<string, string>) =>
    obj[locale as "en" | "fr" | "nl"] || obj.en;

  const title = localeText(listing.title);
  const description = localeText(listing.description);
  const speciesSlug = String(listing.species.slug ?? "");
  const breedEnergy = String(listing.breed.energy_level ?? "");
  const breedSize = String(listing.breed.size ?? "");
  const goodWithKids = Boolean(listing.breed.good_with_kids);
  const goodWithOtherPets = Boolean(listing.breed.good_with_other_pets);

  const healthChecks = [
    { icon: Fingerprint, label: t("microchipped"), ok: !!listing.microchip_number, detail: listing.microchip_number },
    { icon: Syringe,     label: t("vaccinated"),   ok: listing.vaccinated,         detail: null },
    { icon: Shield,      label: t("dewormed"),     ok: listing.dewormed,           detail: null },
    { icon: Heart,       label: t("vetChecked"),   ok: listing.vet_checked,        detail: null },
    { icon: Award,       label: t("pedigree"),     ok: listing.pedigree,           detail: listing.pedigree_organization },
  ];

  return (
    <div className="min-h-screen bg-[var(--t-bg)]">

      {/* ── Photo gallery ────────────────────────────────────────── */}
      <div className="relative pt-[64px]">
        <div className="absolute top-[80px] left-6 z-10">
          <Link
            href={`/${locale}/search`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass text-sm font-semibold text-[var(--t-text)] hover:bg-white/[0.10] transition-colors"
          >
            <ChevronLeft size={15} />
            Back
          </Link>
        </div>
        <div className="absolute top-[80px] right-6 z-10">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass text-sm font-semibold text-[var(--t-text)] hover:bg-white/[0.10] transition-colors">
            <Share2 size={14} />
            Share
          </button>
        </div>

        {/* Desktop 5-photo grid */}
        <div className="hidden md:grid grid-cols-4 grid-rows-2 h-[480px] gap-1.5 overflow-hidden max-w-[1760px] mx-auto px-6 sm:px-10 lg:px-20">
          <div className="col-span-2 row-span-2 relative bg-[var(--t-elevated)] rounded-l-2xl overflow-hidden">
            <Image src={listing.images[0].url} alt={title} fill className="object-cover" priority sizes="50vw" />
          </div>
          {listing.images.slice(1, 5).map((img, i) => (
            <div key={i} className={`relative bg-[var(--t-elevated)] overflow-hidden ${i === 1 ? "rounded-tr-2xl" : ""} ${i === 3 ? "rounded-br-2xl" : ""}`}>
              <Image src={img.url} alt={`${title} ${i + 2}`} fill className="object-cover" sizes="25vw" />
              {i === 3 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-black/40 transition-colors cursor-pointer">
                  <span className="px-4 py-2 rounded-xl glass font-semibold text-sm text-[var(--t-text)]">
                    View all {listing.images.length} photos
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile single photo */}
        <div className="md:hidden relative h-72 bg-[var(--t-elevated)]">
          <Image src={listing.images[0].url} alt={title} fill className="object-cover" priority sizes="100vw" />
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="max-w-[1760px] mx-auto px-6 sm:px-10 lg:px-20 py-10">
        <div className="grid lg:grid-cols-[1fr_380px] gap-10">

          {/* ── Left ─────────────────────────────────────────────── */}
          <div className="space-y-10 min-w-0">

            {/* Title block */}
            <div className="pb-8 border-b border-white/[0.06]">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="badge badge-neutral capitalize">{speciesSlug}</span>
                <span className="badge badge-neutral">{localeText(listing.breed.name)}</span>
                {listing.is_featured && <span className="badge badge-accent">✦ Featured</span>}
              </div>

              <h1 className="text-2xl lg:text-3xl font-bold text-[var(--t-text)] tracking-[-0.02em] mb-4">
                {title}
              </h1>

              <div className="flex flex-wrap items-center gap-5 text-sm text-[rgba(232,228,221,0.50)]">
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-[var(--color-accent)]" />
                  {listing.location_city}, {listing.location_country}
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye size={13} />
                  {listing.view_count} views
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageCircle size={13} />
                  {listing.inquiry_count} inquiries
                </span>
              </div>
            </div>

            {/* Quick facts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { emoji: "🐾", label: t("breed"),  value: localeText(listing.breed.name) },
                { emoji: "📅", label: t("age"),    value: `${listing.age_weeks} weeks` },
                { emoji: listing.gender === "male" ? "♂️" : "♀️", label: t("gender"), value: listing.gender === "male" ? "Male" : "Female" },
                { emoji: "🎨", label: "Color",     value: listing.color || "—" },
              ].map(({ emoji, label, value }) => (
                <div key={label} className="bg-[var(--t-surface)] border border-white/[0.06] rounded-2xl p-4 text-center">
                  <div className="text-2xl mb-1.5">{emoji}</div>
                  <div className="text-xs text-[rgba(232,228,221,0.40)] mb-0.5">{label}</div>
                  <div className="text-sm font-bold text-[var(--t-text)] capitalize">{value}</div>
                </div>
              ))}
            </div>

            {/* Health passport */}
            <div className="bg-[var(--t-surface)] border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="h-1 bg-[var(--color-accent-teal)]" />
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-bold text-[var(--t-text)]">{t("health")}</h2>
                  {listing.passport_number && (
                    <span className="text-xs text-[rgba(232,228,221,0.40)] font-[family-name:var(--font-mono)] bg-white/[0.04] px-2 py-1 rounded-lg border border-white/[0.06]">
                      {listing.passport_number}
                    </span>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                  {healthChecks.map(({ icon: Icon, label, ok, detail }) => (
                    <div
                      key={label}
                      className={`flex items-start gap-3 p-3 rounded-xl border ${
                        ok
                          ? "bg-[rgba(0,166,153,0.08)] border-[rgba(0,166,153,0.20)]"
                          : "bg-white/[0.02] border-white/[0.06]"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${ok ? "bg-[var(--color-accent-teal)]" : "bg-white/[0.08]"}`}>
                        <Icon size={14} className="text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className={`text-sm font-semibold ${ok ? "text-[var(--color-accent-teal)]" : "text-[rgba(232,228,221,0.40)]"}`}>
                          {label}
                        </div>
                        {detail && (
                          <div className="text-xs font-[family-name:var(--font-mono)] text-[rgba(232,228,221,0.35)] truncate">{detail}</div>
                        )}
                        <div className={`flex items-center gap-1 text-xs mt-0.5 ${ok ? "text-[var(--color-accent-teal)]" : "text-[rgba(232,228,221,0.35)]"}`}>
                          {ok ? <><CheckCircle2 size={10} /> Confirmed</> : <><XCircle size={10} /> Not available</>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/[0.06] pt-4">
                  <div className="text-xs font-bold text-[rgba(232,228,221,0.30)] uppercase tracking-[0.12em] font-[family-name:var(--font-mono)] mb-3">{t("documents")}</div>
                  <div className="flex flex-wrap gap-2">
                    {listing.documents.map((doc) => (
                      <button key={doc.name} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:border-white/[0.20] hover:bg-white/[0.06] transition-all text-sm font-medium text-[rgba(232,228,221,0.65)]">
                        <FileText size={13} className="text-[rgba(232,228,221,0.40)]" />
                        {doc.name}
                        <ExternalLink size={11} className="text-[rgba(232,228,221,0.30)]" />
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-[rgba(232,228,221,0.30)] mt-3">{t("documentsNote")}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="border-b border-white/[0.06] pb-10">
              <h2 className="text-base font-bold text-[var(--t-text)] mb-4">{t("description")}</h2>
              <div className="text-sm text-[rgba(232,228,221,0.55)] leading-relaxed whitespace-pre-line">{description}</div>
            </div>

            {/* Breed profile */}
            <div className="border-b border-white/[0.06] pb-10">
              <h2 className="text-base font-bold text-[var(--t-text)] mb-4">{localeText(listing.breed.name)} profile</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: Zap,      label: "Energy",         value: breedEnergy.replace("_", " ") || "—", ok: true },
                  { icon: PawPrint, label: "Size",           value: breedSize || "—",                    ok: true },
                  { icon: Smile,    label: "Good with kids", value: goodWithKids ? "Yes" : "No",         ok: goodWithKids },
                  { icon: Users,    label: "Multi-pet home", value: goodWithOtherPets ? "Yes" : "No",    ok: goodWithOtherPets },
                ].map(({ icon: Icon, label, value, ok }) => (
                  <div key={label} className={`rounded-2xl border p-4 ${ok ? "bg-[rgba(0,166,153,0.08)] border-[rgba(0,166,153,0.20)]" : "bg-white/[0.02] border-white/[0.06]"}`}>
                    <Icon size={16} className={`mb-2 ${ok ? "text-[var(--color-accent-teal)]" : "text-[rgba(232,228,221,0.30)]"}`} />
                    <div className="text-xs text-[rgba(232,228,221,0.40)] mb-1">{label}</div>
                    <div className="text-sm font-bold text-[var(--t-text)] capitalize">{value}</div>
                  </div>
                ))}
              </div>

              {listing.ready_date && (
                <div className="flex items-center gap-3 mt-4 p-4 rounded-xl bg-[rgba(252,100,45,0.08)] border border-[rgba(252,100,45,0.20)]">
                  <div className="w-9 h-9 rounded-xl bg-[var(--color-accent-warm)] flex items-center justify-center shrink-0">
                    <Clock size={16} className="text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-[rgba(232,228,221,0.40)] font-semibold">Available from</div>
                    <div className="text-sm font-bold text-[var(--t-text)]">
                      {new Date(listing.ready_date).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Similar listings */}
            {similar.length > 0 && (
              <div>
                <h2 className="text-base font-bold text-[var(--t-text)] mb-4">Similar listings</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {similar.map((s) => (
                    <Link
                      key={s.id}
                      href={`/${locale}/listings/${s.id}`}
                      className="listing-card group flex gap-4 bg-[var(--t-surface)] rounded-xl border border-white/[0.06] p-3"
                    >
                      <div className="relative w-24 h-20 rounded-xl overflow-hidden shrink-0 bg-[var(--t-elevated)]">
                        <Image src={s.images[0].url} alt={localeText(s.title)} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="96px" />
                      </div>
                      <div className="flex-1 min-w-0 py-0.5">
                        <div className="text-xs text-[rgba(232,228,221,0.35)] mb-1">{localeText(s.breed.name)}</div>
                        <div className="text-sm font-bold text-[var(--t-text)] line-clamp-1 mb-1.5">{localeText(s.title)}</div>
                        <div className="flex items-center justify-between">
                          <span className="text-base font-bold text-[var(--t-text)] font-[family-name:var(--font-mono)]">€{(s.price / 100).toLocaleString()}</span>
                          <span className="flex items-center gap-1 text-xs text-[rgba(232,228,221,0.35)]"><MapPin size={10} />{s.location_city}</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <ArrowRight size={16} className="text-[rgba(232,228,221,0.30)] group-hover:text-[var(--color-accent)] group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right sticky sidebar ──────────────────────────────── */}
          <div className="hidden lg:block">
            <div className="sticky top-24 space-y-4">

              {/* Price + CTA — driven by listing_type (shelter adoptions never show Buy Now) */}
              <div className="bg-[var(--t-surface)] rounded-2xl border border-white/[0.06] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                {isAdoption ? (
                  <div className="mb-5">
                    <span className="badge badge-teal mb-2">{t("forAdoption")}</span>
                    <div className="text-2xl font-bold text-[var(--t-text)] tracking-[-0.02em]">{t("giveHome")}</div>
                    <div className="flex items-center gap-1.5 text-xs text-[rgba(232,228,221,0.40)] mt-1">
                      <Shield size={11} className="text-[var(--color-accent-teal)]" /> {t("rescueVerified")}
                    </div>
                  </div>
                ) : (
                  <div className="mb-5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-[var(--t-text)] tracking-[-0.02em] font-[family-name:var(--font-mono)]">
                        €{(listing.price / 100).toLocaleString()}
                      </span>
                      {listing.price_negotiable && (
                        <span className="text-sm text-[rgba(232,228,221,0.40)]">negotiable</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[rgba(232,228,221,0.40)] mt-1">
                      <Shield size={11} className="text-[var(--color-accent-teal)]" /> Price verified by PawTrust
                    </div>
                  </div>
                )}

                {viewer ? (
                  <Link href="#inquiry" className="btn-primary flex items-center justify-center gap-2 w-full mb-3">
                    {isAdoption ? <Heart size={16} /> : <MessageCircle size={16} />}
                    {isAdoption ? t("applyToAdopt") : t("inquiryTitle")}
                  </Link>
                ) : (
                  <Link href={`/${locale}/login`} className="btn-primary flex items-center justify-center gap-2 w-full mb-3">
                    <MessageCircle size={16} />
                    {isAdoption ? t("signInToApply") : t("signInToContact")}
                  </Link>
                )}

                {isAdoption ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Link href={viewer ? "#inquiry" : `/${locale}/login`} className="flex items-center justify-center gap-2 border border-white/[0.10] hover:border-white/[0.20] text-[rgba(232,228,221,0.70)] hover:text-[var(--t-text)] font-semibold py-3 rounded-xl transition-all text-sm">
                      <Heart size={14} /> {t("donate")}
                    </Link>
                    <Link href={viewer ? "#inquiry" : `/${locale}/login`} className="flex items-center justify-center gap-2 border border-white/[0.10] hover:border-white/[0.20] text-[rgba(232,228,221,0.70)] hover:text-[var(--t-text)] font-semibold py-3 rounded-xl transition-all text-sm">
                      <Award size={14} /> {t("sponsor")}
                    </Link>
                  </div>
                ) : (
                  <Link
                    href={`/${locale}/breeders/${listing.seller.slug}`}
                    className="flex items-center justify-center gap-2 w-full border border-white/[0.10] hover:border-white/[0.20] text-[rgba(232,228,221,0.70)] hover:text-[var(--t-text)] font-semibold py-3 rounded-xl transition-all text-sm"
                  >
                    View breeder profile
                  </Link>
                )}
              </div>

              {/* Seller card */}
              <div className="bg-[var(--t-surface)] rounded-2xl border border-white/[0.06] p-6">
                <h3 className="text-xs font-bold text-[rgba(232,228,221,0.35)] uppercase tracking-[0.12em] font-[family-name:var(--font-mono)] mb-4">{t("sellerInfo")}</h3>

                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[rgba(255,56,92,0.12)] border border-[rgba(255,56,92,0.20)] flex items-center justify-center text-[var(--color-accent)] font-bold text-lg shrink-0">
                    {listing.seller.business_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[var(--t-text)] text-sm leading-snug">{listing.seller.business_name}</div>
                    <div className="mt-1"><VerifiedBadge size="sm" /></div>
                    <div className="flex items-center gap-0.5 mt-1.5">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} size={11} className={s <= Math.floor(listing.seller.rating) ? "fill-[var(--color-accent)] text-[var(--color-accent)]" : "text-white/10 fill-white/10"} />
                      ))}
                      <span className="text-xs font-bold text-[var(--t-text)] ml-1">{listing.seller.rating}</span>
                      <span className="text-xs text-[rgba(232,228,221,0.35)]">({listing.seller.review_count})</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    { label: "Response time", value: `~${listing.seller.response_time_hours}h` },
                    { label: "Response rate",  value: `${listing.seller.response_rate}%` },
                    { label: t("totalSales"),  value: `${listing.seller.total_sales}` },
                    { label: t("memberSince"), value: `${listing.seller.years_experience}y` },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-2.5 text-center">
                      <div className="font-bold text-[var(--t-text)] text-sm font-[family-name:var(--font-mono)]">{value}</div>
                      <div className="text-xs text-[rgba(232,228,221,0.35)] mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-sm text-[rgba(232,228,221,0.40)] pt-3 border-t border-white/[0.06]">
                  <MapPin size={13} className="text-[var(--color-accent)]" />
                  {listing.seller.location_city}, {listing.seller.location_country}
                </div>
              </div>

              {/* Inquiry form */}
              <div id="inquiry" className="bg-[var(--t-surface)] rounded-2xl border border-white/[0.06] p-6">
                <h3 className="text-xs font-bold text-[rgba(232,228,221,0.35)] uppercase tracking-[0.12em] font-[family-name:var(--font-mono)] mb-4">{t("inquirySubmit")}</h3>
                {viewer ? (
                  <InquiryForm
                    listingId={listing.id}
                    locale={locale}
                    labels={{
                      name: t("inquiryName"),
                      email: t("inquiryEmail"),
                      phone: t("inquiryPhone"),
                      message: t("inquiryMessage"),
                      placeholder: t("inquiryPlaceholder"),
                    }}
                  />
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-[var(--t-text-secondary)] mb-4 font-[family-name:var(--font-body)]">{isAdoption ? t("contactShelterPrompt") : t("contactBreederPrompt")}</p>
                    <Link href={`/${locale}/login`} className="btn-primary inline-flex">{t("signInToContinue")}</Link>
                  </div>
                )}
              </div>

              {/* Safety note */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-[rgba(0,166,153,0.08)] border border-[rgba(0,166,153,0.15)]">
                <Shield size={15} className="text-[var(--color-accent-teal)] mt-0.5 shrink-0" />
                <p className="text-xs text-[rgba(232,228,221,0.45)] leading-relaxed">
                  All breeders on PawTrust are manually verified. Never send money before visiting the animal in person.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile sticky bottom bar ─────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[rgba(10,10,15,0.95)] backdrop-blur-xl border-t border-white/[0.08] px-4 py-3 flex items-center gap-3 z-40">
        <div className="flex-1">
          <div className="text-xl font-bold text-[var(--t-text)] font-[family-name:var(--font-mono)]">€{(listing.price / 100).toLocaleString()}</div>
          <div className="text-xs text-[rgba(232,228,221,0.40)]">{listing.location_city}</div>
        </div>
        <Link
          href="#inquiry"
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <MessageCircle size={16} />
          {t("inquiryTitle")}
        </Link>
      </div>
    </div>
  );
}
