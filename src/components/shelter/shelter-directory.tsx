"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, Star, Heart, Search } from "lucide-react";
import { VerifiedBadge } from "@/components/ui/verified-badge";

interface Shelter {
  id: string; organization_name: string; slug: string;
  location_city: string; location_country: string;
  rating: number; review_count: number; cover_url?: string;
}

export function ShelterDirectory({ shelters, locale }: { shelters: Shelter[]; locale: string }) {
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");

  const cities = useMemo(() => [...new Set(shelters.map((s) => s.location_city).filter(Boolean))].sort(), [shelters]);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    return shelters.filter((s) => {
      if (city && s.location_city !== city) return false;
      if (query) {
        const hay = `${s.organization_name} ${s.location_city} ${s.location_country}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
  }, [shelters, q, city]);

  const reset = () => { setQ(""); setCity(""); };

  return (
    <div className="max-w-[1760px] mx-auto px-6 sm:px-10 lg:px-20 py-10">
      <div className="relative max-w-2xl mb-4">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-accent)]" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by city, region or shelter name…" className="input-dark w-full !pl-12 !h-14 text-base" />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setCity("")} className={chip(!city)}>All areas</button>
        {cities.map((c) => (
          <button key={c} onClick={() => setCity(city === c ? "" : c)} className={chip(city === c)}><MapPin size={12} /> {c}</button>
        ))}
      </div>

      <p className="text-sm text-[var(--t-text-muted)] mb-5 font-[family-name:var(--font-mono)]">{results.length} {results.length === 1 ? "shelter" : "shelters"} found</p>

      {results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.10] p-12 text-center text-[var(--t-text-secondary)]">
          No shelters match your search. <button onClick={reset} className="text-[var(--color-accent)] hover:underline">Reset</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {results.map((s) => (
            <Link key={s.id} href={`/${locale}/shelters/${s.slug}`} className="listing-card group bg-[var(--t-surface)] rounded-2xl border border-white/[0.06] p-6">
              <div className="flex items-start gap-3 mb-4">
                {s.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.cover_url} alt={s.organization_name} className="w-14 h-14 rounded-xl object-cover border border-[rgba(0,166,153,0.20)] shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-[rgba(0,166,153,0.12)] border border-[rgba(0,166,153,0.20)] flex items-center justify-center text-[var(--color-accent-teal)] shrink-0"><Heart size={22} /></div>
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
      )}
    </div>
  );
}

function chip(activeState: boolean) {
  return `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
    activeState ? "border-[var(--color-accent)] bg-[rgba(255,56,92,0.10)] text-[var(--color-accent)]" : "border-white/[0.10] text-[var(--t-text-secondary)] hover:border-white/[0.20]"
  }`;
}
