import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin, Star, Heart, Gift, Shield, Phone, Globe, PawPrint, CheckCircle2 } from "lucide-react";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { DonatePanel } from "@/components/shelter/donate-panel";
import { MessageButton } from "@/components/ui/message-button";
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

  const bio = text(shelter.bio);
  const phone = String(shelter.phone ?? "");
  const website = String(shelter.website_url ?? "");
  const donationEnabled = shelter.donation_enabled !== false;
  const adopted = listings.filter((l) => l.status === "sold").length;

  return (
    <div className="min-h-screen bg-[var(--t-bg)]">
      {shelter.cover_url ? (
        <div className="relative h-48 sm:h-72 w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={shelter.cover_url as string} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--t-bg)] via-[var(--t-bg)]/40 to-transparent" />
        </div>
      ) : null}

      {/* Header */}
      <div className={`border-b border-white/[0.06] pb-8 ${shelter.cover_url ? "pt-6" : "pt-28"}`}>
        <div className="max-w-[1280px] mx-auto px-6 sm:px-10 mb-5">
          <Breadcrumb items={[{ label: "PawTrust", href: `/${locale}` }, { label: "Shelters", href: `/${locale}/shelters` }, { label: shelter.organization_name as string }]} />
        </div>
        <div className="max-w-[1280px] mx-auto px-6 sm:px-10 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-[rgba(0,166,153,0.12)] border border-[rgba(0,166,153,0.20)] flex items-center justify-center text-[var(--color-accent-teal)] shrink-0 overflow-hidden">
            {shelter.cover_url ? <Image src={shelter.cover_url as string} alt="" width={80} height={80} className="w-full h-full object-cover" /> : <Heart size={34} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-3xl font-black text-[var(--t-text)] tracking-[-0.02em]">{shelter.organization_name as string}</h1>
              <VerifiedBadge size="sm" />
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-[var(--t-text-secondary)]">
              <span className="flex items-center gap-1"><MapPin size={13} className="text-[var(--color-accent)]" /> {String(shelter.location_city ?? "")}, {String(shelter.location_country ?? "")}</span>
              <span className="flex items-center gap-1"><Star size={13} className="fill-[var(--color-accent)] text-[var(--color-accent)]" /> {Number(shelter.rating ?? 0)} ({Number(shelter.review_count ?? 0)})</span>
              <span className="flex items-center gap-1"><PawPrint size={13} className="text-[var(--color-accent-teal)]" /> {listings.length} available</span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link href="#adopt" className="btn-secondary inline-flex items-center gap-2"><PawPrint size={15} /> Adopt</Link>
            {donationEnabled && <Link href="#donate" className="btn-primary inline-flex items-center gap-2"><Gift size={15} /> Donate</Link>}
          </div>
        </div>
      </div>

      {/* Body — two columns */}
      <div className="max-w-[1280px] mx-auto px-6 sm:px-10 py-10 grid lg:grid-cols-[1fr_360px] gap-10 items-start">

        {/* Left */}
        <div className="space-y-10 min-w-0">
          {/* About */}
          <section>
            <h2 className="text-lg font-bold text-[var(--t-text)] mb-3">About {shelter.organization_name as string}</h2>
            <p className="text-[var(--t-text-secondary)] leading-relaxed whitespace-pre-line">
              {bio || `${shelter.organization_name} is a verified rescue rehoming animals across Benelux. Every animal is health-checked and ready for a loving home.`}
            </p>
            <div className="flex flex-wrap gap-2 mt-5">
              {["Manually verified by PawTrust", "Health-checked animals", "Adoption support"].map((b) => (
                <span key={b} className="flex items-center gap-1.5 text-xs font-medium text-[var(--t-text-secondary)] bg-white/[0.03] border border-white/[0.06] rounded-full px-3 py-1.5">
                  <CheckCircle2 size={12} className="text-[var(--color-accent-teal)]" /> {b}
                </span>
              ))}
            </div>
          </section>

          {/* Animals */}
          <section id="adopt" className="scroll-mt-24">
            <div className="flex items-center gap-2 mb-6">
              <Shield size={15} className="text-[var(--color-accent-teal)]" />
              <h2 className="text-lg font-bold text-[var(--t-text)]">Animals for adoption ({listings.length})</h2>
            </div>
            {listings.length === 0 ? (
              <p className="text-[var(--t-text-secondary)]">No animals listed for adoption right now. Check back soon.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
          </section>
        </div>

        {/* Right sidebar */}
        <aside className="space-y-5 lg:sticky lg:top-24">
          {donationEnabled && <div id="donate" className="scroll-mt-24"><DonatePanel shelterId={String(shelter.id)} shelterName={String(shelter.organization_name)} /></div>}

          {/* Impact */}
          <div className="rounded-2xl border border-white/[0.08] bg-[var(--t-surface)] p-5">
            <h3 className="font-bold text-[var(--t-text)] mb-4">Impact</h3>
            <div className="grid grid-cols-2 gap-3">
              {[["Available now", listings.length], ["Rehomed", adopted], ["Rating", Number(shelter.rating ?? 0)], ["Reviews", Number(shelter.review_count ?? 0)]].map(([label, val]) => (
                <div key={String(label)} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <div className="text-xl font-black text-[var(--t-text)] tracking-[-0.02em]">{val}</div>
                  <div className="text-[11px] text-[var(--t-text-muted)] uppercase tracking-[0.04em] font-[family-name:var(--font-mono)] mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="rounded-2xl border border-white/[0.08] bg-[var(--t-surface)] p-5">
            <h3 className="font-bold text-[var(--t-text)] mb-3">Contact</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2.5 text-[var(--t-text-secondary)]"><MapPin size={15} className="text-[var(--color-accent)] shrink-0" /> {String(shelter.location_city ?? "")}, {String(shelter.location_country ?? "")}</div>
            <MessageButton target={{ shelter_id: String(shelter.id) }} recipientName={String(shelter.organization_name)} label="Message shelter" className="flex items-center justify-center gap-2 w-full mt-1 py-2.5 rounded-xl border border-white/[0.12] text-sm font-semibold text-[var(--t-text)] hover:bg-white/[0.04] transition-colors" />
              {phone && <a href={`tel:${phone}`} className="flex items-center gap-2.5 text-[var(--t-text-secondary)] hover:text-[var(--t-text)] transition-colors"><Phone size={15} className="text-[var(--color-accent)] shrink-0" /> {phone}</a>}
              {website && <a href={website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-[var(--t-text-secondary)] hover:text-[var(--color-accent)] transition-colors"><Globe size={15} className="text-[var(--color-accent)] shrink-0" /> Website</a>}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
