"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { MapPin, Star, Video, UserCheck, Search, SlidersHorizontal, CalendarCheck } from "lucide-react";
import { VerifiedBadge } from "@/components/ui/verified-badge";

interface Vet {
  id: string; business_name: string; slug: string;
  location_city: string; location_country: string;
  rating: number; review_count: number;
  specializations: string[]; telemedicine: boolean; accepts_new_patients: boolean; languages: string[];
  avatar_url?: string; booking_url?: string;
}

export function VetDirectory({ vets, locale }: { vets: Vet[]; locale: string }) {
  const t = useTranslations("vet");
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [spec, setSpec] = useState("");
  const [telemedicine, setTelemedicine] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [bookable, setBookable] = useState(false);

  const cities = useMemo(() => [...new Set(vets.map((v) => v.location_city).filter(Boolean))].sort(), [vets]);
  const specs = useMemo(() => [...new Set(vets.flatMap((v) => v.specializations ?? []))].sort(), [vets]);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    return vets.filter((v) => {
      if (city && v.location_city !== city) return false;
      if (spec && !(v.specializations ?? []).includes(spec)) return false;
      if (telemedicine && !v.telemedicine) return false;
      if (accepting && !v.accepts_new_patients) return false;
      if (bookable && !v.booking_url) return false;
      if (query) {
        const hay = `${v.business_name} ${v.location_city} ${v.location_country}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
  }, [vets, q, city, spec, telemedicine, accepting, bookable]);

  const reset = () => { setQ(""); setCity(""); setSpec(""); setTelemedicine(false); setAccepting(false); setBookable(false); };
  const active = q || city || spec || telemedicine || accepting || bookable;

  return (
    <div className="max-w-[1760px] mx-auto px-6 sm:px-10 lg:px-20 py-8">
      {/* Search bar */}
      <div className="relative max-w-2xl mb-4">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-accent)]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by city, region or clinic name…"
          className="input-dark w-full !pl-12 !h-14 text-base"
        />
      </div>

      {/* Zone chips */}
      <div className="flex flex-wrap gap-2 mb-3">
        <button onClick={() => setCity("")} className={chip(!city)}>All areas</button>
        {cities.map((c) => (
          <button key={c} onClick={() => setCity(city === c ? "" : c)} className={chip(city === c)}>
            <MapPin size={12} /> {c}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="flex items-center gap-1.5 text-xs text-[var(--t-text-muted)] font-[family-name:var(--font-mono)] uppercase tracking-[0.06em] mr-1"><SlidersHorizontal size={13} /> Filters</span>
        <select value={spec} onChange={(e) => setSpec(e.target.value)} className="input-dark !h-9 !py-0 text-sm w-auto">
          <option value="">All specializations</option>
          {specs.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={() => setTelemedicine(!telemedicine)} className={chip(telemedicine)}><Video size={12} /> Telemedicine</button>
        <button onClick={() => setAccepting(!accepting)} className={chip(accepting)}><UserCheck size={12} /> Accepting patients</button>
        <button onClick={() => setBookable(!bookable)} className={chip(bookable)}><CalendarCheck size={12} /> Bookable online</button>
        {active && <button onClick={reset} className="text-xs text-[var(--color-accent)] hover:underline ml-1">Clear all</button>}
      </div>

      <p className="text-sm text-[var(--t-text-muted)] mb-5 font-[family-name:var(--font-mono)]">{results.length} {results.length === 1 ? "vet" : "vets"} found</p>

      {results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.10] p-12 text-center text-[var(--t-text-secondary)]">
          No vets match your search. <button onClick={reset} className="text-[var(--color-accent)] hover:underline">Reset filters</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {results.map((vet) => (
            <Link key={vet.id} href={`/${locale}/vets/${vet.slug}`}
              className="listing-card group flex gap-4 bg-[var(--t-surface)] rounded-2xl border border-white/[0.06] hover:border-white/[0.14] p-5 transition-all duration-200">
              {vet.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={vet.avatar_url} alt={vet.business_name} className="w-14 h-14 rounded-xl object-cover border border-[rgba(0,166,153,0.20)] shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-[rgba(0,166,153,0.10)] border border-[rgba(0,166,153,0.20)] flex items-center justify-center text-[var(--color-accent-teal)] font-bold text-xl shrink-0 font-[family-name:var(--font-display)]">
                  {vet.business_name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[var(--t-text)] group-hover:text-[var(--color-accent-teal)] transition-colors text-sm mb-1">{vet.business_name}</h3>
                <div className="flex items-center gap-2 mb-2.5">
                  <VerifiedBadge size="sm" label="" />
                  <div className="flex items-center gap-1">
                    <Star size={12} className="fill-[var(--color-accent)] text-[var(--color-accent)]" />
                    <span className="text-sm font-medium text-[var(--t-text)]">{vet.rating}</span>
                    <span className="text-xs text-[rgba(232,228,221,0.35)]">({vet.review_count})</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-2.5">
                  {(vet.specializations ?? []).slice(0, 3).map((s) => <span key={s} className="badge badge-teal text-[9px] capitalize">{s}</span>)}
                </div>
                <div className="flex items-center gap-3 text-xs text-[rgba(232,228,221,0.40)] flex-wrap">
                  <span className="flex items-center gap-1"><MapPin size={11} /> {vet.location_city}</span>
                  {vet.booking_url && <span className="flex items-center gap-1 text-[var(--color-accent)] font-semibold"><CalendarCheck size={11} /> Book online</span>}
                  {vet.telemedicine && <span className="flex items-center gap-1 text-[var(--color-accent-indigo)]"><Video size={11} /> {t("telemedicine")}</span>}
                  <span className={`flex items-center gap-1 ${vet.accepts_new_patients ? "text-[var(--color-accent-teal)]" : "text-[rgba(232,228,221,0.30)]"}`}>
                    <UserCheck size={11} /> {vet.accepts_new_patients ? t("acceptingPatients") : t("notAccepting")}
                  </span>
                </div>
                <div className="flex gap-1 mt-2">
                  {(vet.languages ?? []).map((l) => (
                    <span key={l} className="px-1.5 py-0.5 rounded text-[10px] bg-white/[0.04] text-[rgba(232,228,221,0.45)] border border-white/[0.06] uppercase font-bold font-[family-name:var(--font-mono)]">{l}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function chip(activeState: boolean) {
  return `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
    activeState ? "border-[var(--color-accent)] bg-[rgba(255,56,92,0.10)] text-[var(--color-accent)]" : "border-white/[0.10] text-[var(--t-text-secondary)] hover:border-white/[0.20]"
  }`;
}
