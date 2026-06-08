"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, Star, Heart, Bookmark, Check } from "lucide-react";
import { toast } from "sonner";
import { api, type Listing } from "@/lib/api-client";

const SPECIES_FILTERS = [
  { value: "",        label: "All",     emoji: "🐾" },
  { value: "dogs",    label: "Dogs",    emoji: "🐕" },
  { value: "cats",    label: "Cats",    emoji: "🐈" },
  { value: "rabbits", label: "Rabbits", emoji: "🐇" },
  { value: "birds",   label: "Birds",   emoji: "🦜" },
  { value: "horses",  label: "Horses",  emoji: "🐎" },
  { value: "exotic",  label: "Exotic",  emoji: "🦎" },
];


export default function SearchPage() {
  const params = useParams();
  const locale = params.locale as string;
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [species, setSpecies] = useState(searchParams.get("species") ?? "");
  const [minAge] = useState(searchParams.get("min_age") ?? "");
  const [maxAge] = useState(searchParams.get("max_age") ?? "");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [pedigree, setPedigree] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savedSearch, setSavedSearch] = useState(false);
  const [listingType, setListingType] = useState<"sale" | "adoption">(searchParams.get("type") === "adoption" ? "adoption" : "sale");

  const localeText = (obj: Record<string, string> | undefined) =>
    obj ? (obj[locale as "en" | "fr" | "nl"] ?? obj.en ?? "") : "";

  const saveCurrentSearch = async () => {
    const params: Record<string, string> = {};
    if (query) params.q = query;
    if (species) params.species = species;
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;
    if (verifiedOnly) params.verified = "true";
    if (pedigree) params.pedigree = "true";
    const speciesLabel = SPECIES_FILTERS.find((s) => s.value === species)?.label;
    const name = [query, speciesLabel].filter(Boolean).join(" · ") || "All listings";
    try {
      await api.savedSearches.create({ name, params, alert: true });
      setSavedSearch(true);
      toast.success("Search saved — we'll alert you on new matches.");
      setTimeout(() => setSavedSearch(false), 2500);
    } catch {
      window.location.href = `/${locale}/login`;
    }
  };

  const doSearch = useCallback(() => {
    setLoading(true);
    const p: Record<string, string | number | boolean> = { page_size: 24, type: listingType };
    if (query)       p.search = query;
    if (species)     p.species = species;
    if (minPrice)    p.min_price = parseInt(minPrice) * 100;
    if (maxPrice)    p.max_price = parseInt(maxPrice) * 100;
    if (minAge)      p.min_age = parseInt(minAge);
    if (maxAge)      p.max_age = parseInt(maxAge);
    if (verifiedOnly) p.verified = true;
    if (pedigree)    p.pedigree = true;

    api.listings.search(p)
      .then(r => {
        setListings(r.listings);
        setTotal(r.total);
      })
      .catch(() => {
        setListings([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [query, species, minPrice, maxPrice, minAge, maxAge, verifiedOnly, pedigree, listingType]);

  useEffect(() => {
    queueMicrotask(doSearch);
  }, [doSearch]);

  return (
    <div className="min-h-screen bg-[var(--t-bg)]">

      {/* ── Sticky search bar ────────────────────────────────────── */}
      <div className="border-b border-white/[0.06] sticky top-[64px] bg-[rgba(10,10,15,0.95)] backdrop-blur-xl z-40">
        <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-20 py-4">

          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="flex items-stretch flex-1 min-w-0 border border-white/[0.08] rounded-2xl bg-[var(--t-surface)] hover:border-[rgba(255,56,92,0.25)] transition-all duration-200 divide-x divide-white/[0.06] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
              <div className="flex items-center gap-2 px-4 sm:px-5 py-3 flex-1 min-w-0">
                <Search size={13} className="text-[var(--color-accent)] shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && doSearch()}
                  placeholder="Search breed, species..."
                  className="bg-transparent text-sm text-[var(--t-text)] placeholder-[rgba(232,228,221,0.35)] outline-none w-full"
                />
              </div>
              <div className="flex items-center gap-2 px-5 py-3 hidden sm:flex">
                <div>
                  <div className="text-[9px] font-bold text-[var(--color-accent)] uppercase tracking-[0.1em] font-[family-name:var(--font-mono)]">Location</div>
                  <div className="text-sm text-[rgba(232,228,221,0.60)]">Benelux</div>
                </div>
              </div>
              <button
                onClick={doSearch}
                className="flex items-center px-3 py-2"
              >
                <div className="bg-[var(--color-accent)] text-white rounded-xl w-10 h-10 flex items-center justify-center shadow-[0_0_12px_rgba(255,56,92,0.35)]">
                  <Search size={15} strokeWidth={2.5} />
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowMobileFilters((value) => !value)}
              className="flex items-center justify-center gap-2 border border-white/[0.08] bg-[var(--t-surface)] rounded-2xl px-5 py-3 text-sm font-semibold text-[rgba(232,228,221,0.70)] hover:text-[var(--t-text)] hover:border-white/[0.16] transition-all shrink-0 lg:hidden"
            >
              <SlidersHorizontal size={14} />
              Filters
            </button>
          </div>

          {/* Species pills */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto scrollbar-none pb-1">
            {SPECIES_FILTERS.map((s) => {
              const active = species === s.value;
              return (
                <button
                  key={s.value}
                  onClick={() => setSpecies(s.value)}
                  className={`relative flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold shrink-0 whitespace-nowrap transition-all duration-200 ${
                    active
                      ? "bg-[var(--color-accent)] text-white shadow-[0_0_14px_rgba(255,56,92,0.35),0_2px_8px_rgba(255,56,92,0.20)] scale-[0.97]"
                      : "border border-white/[0.08] bg-[rgba(255,255,255,0.03)] text-[rgba(232,228,221,0.50)] hover:border-white/[0.18] hover:text-[var(--t-text)] hover:bg-[rgba(255,255,255,0.05)]"
                  }`}
                >
                  <span className="text-[13px]">{s.emoji}</span>
                  {s.label}
                </button>
              );
            })}

            <div className="w-px h-4 bg-white/[0.06] shrink-0 mx-1.5" />

            <button
              onClick={() => setVerifiedOnly(v => !v)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold shrink-0 whitespace-nowrap transition-all duration-200 ${
                verifiedOnly
                  ? "bg-[var(--color-accent-teal)] text-white shadow-[0_0_14px_rgba(0,166,153,0.35)] scale-[0.97]"
                  : "border border-white/[0.08] bg-[rgba(255,255,255,0.03)] text-[rgba(232,228,221,0.50)] hover:border-white/[0.18] hover:text-[var(--t-text)] hover:bg-[rgba(255,255,255,0.05)]"
              }`}
            >
              ✓ Verified
            </button>
            <button
              onClick={() => setPedigree(v => !v)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold shrink-0 whitespace-nowrap transition-all duration-200 ${
                pedigree
                  ? "bg-[var(--color-accent-gold)] text-white shadow-[0_0_14px_rgba(184,150,12,0.30)] scale-[0.97]"
                  : "border border-white/[0.08] bg-[rgba(255,255,255,0.03)] text-[rgba(232,228,221,0.50)] hover:border-white/[0.18] hover:text-[var(--t-text)] hover:bg-[rgba(255,255,255,0.05)]"
              }`}
            >
              🏅 Pedigree
            </button>
          </div>

          {showMobileFilters && (
            <div className="mt-3 grid gap-3 rounded-2xl border border-white/[0.08] bg-[var(--t-surface)] p-4 lg:hidden">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[rgba(232,228,221,0.40)]">Price range</p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Min EUR"
                    className="input-dark h-10 rounded-xl px-3 text-sm"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Max EUR"
                    className="input-dark h-10 rounded-xl px-3 text-sm"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>
              <button onClick={doSearch} className="btn-primary w-full text-center text-sm">
                Apply filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────── */}
      <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-20 py-8 flex items-start gap-8">

        {/* Sidebar */}
        <aside className="hidden lg:flex sticky top-[180px] flex-col gap-6 w-72 shrink-0 self-start">
          <div className="bg-[var(--t-surface)] border border-white/[0.06] rounded-2xl p-5">
            <h3 className="text-xs font-bold text-[rgba(232,228,221,0.40)] uppercase tracking-[0.12em] font-[family-name:var(--font-mono)] mb-4">Filters</h3>

            <div className="mb-5 pb-5 border-b border-white/[0.06]">
              <p className="text-sm font-semibold text-[var(--t-text)] mb-3">Price range (EUR)</p>
              <div className="flex gap-2">
                <input type="text" placeholder="Min" className="input-dark flex-1 text-xs h-9 px-3 rounded-lg"
                  value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                <input type="text" placeholder="Max" className="input-dark flex-1 text-xs h-9 px-3 rounded-lg"
                  value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
              </div>
            </div>

            <div className="mb-5 pb-5 border-b border-white/[0.06]">
              <p className="text-sm font-semibold text-[var(--t-text)] mb-3">Species</p>
              <div className="space-y-2">
                {SPECIES_FILTERS.slice(1).map(s => (
                  <label key={s.value} className="flex items-center gap-2.5 cursor-pointer group" onClick={() => setSpecies(species === s.value ? "" : s.value)}>
                    <div className={`w-4 h-4 rounded border transition-colors shrink-0 ${species === s.value ? "bg-[var(--color-accent)] border-[var(--color-accent)]" : "border-white/[0.15] group-hover:border-[var(--color-accent)]"}`} />
                    <span className="text-sm text-[rgba(232,228,221,0.60)] group-hover:text-[var(--t-text)] transition-colors">{s.emoji} {s.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-5 pb-5 border-b border-white/[0.06]">
              <label className="flex items-center justify-between cursor-pointer" onClick={() => setVerifiedOnly(v => !v)}>
                <span className="text-sm font-semibold text-[var(--t-text)]">Verified only</span>
                <div className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-all ${verifiedOnly ? "bg-[var(--color-accent)] justify-end shadow-[0_0_8px_rgba(255,56,92,0.4)]" : "bg-white/[0.10] justify-start"}`}>
                  <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                </div>
              </label>
            </div>
          </div>

          <button onClick={doSearch} className="btn-primary w-full text-center text-sm">Apply filters</button>
        </aside>

        {/* Results grid */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="inline-flex rounded-full border border-[var(--t-border)] p-1 bg-[var(--t-surface)]">
                {(["sale", "adoption"] as const).map((tpe) => (
                  <button
                    key={tpe}
                    onClick={() => setListingType(tpe)}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${listingType === tpe ? "bg-[var(--color-accent)] text-white" : "text-[var(--t-text-secondary)] hover:text-[var(--t-text)]"}`}
                  >
                    {tpe === "sale" ? "Buy" : "Adopt"}
                  </button>
                ))}
              </div>
              <p className="text-sm text-[rgba(232,228,221,0.40)] font-medium font-[family-name:var(--font-mono)]">
                {loading ? "Searching…" : `${total} animal${total !== 1 ? "s" : ""}`}
              </p>
            </div>
            <button
              onClick={saveCurrentSearch}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--t-text-secondary)] hover:text-[var(--color-accent)] border border-[var(--t-border)] hover:border-[rgba(255,56,92,0.3)] rounded-full px-3.5 py-1.5 transition-colors shrink-0"
            >
              {savedSearch ? <><Check size={14} /> Saved</> : <><Bookmark size={14} /> Save this search</>}
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-[var(--t-surface)] border border-white/[0.06] rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-[var(--t-elevated)]" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-white/[0.06] rounded w-3/4" />
                    <div className="h-3 bg-white/[0.04] rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-2xl mb-4 text-[rgba(232,228,221,0.35)]">Search</div>
              <p className="text-[var(--t-text)] font-semibold mb-2">No listings found</p>
              <p className="text-[rgba(232,228,221,0.40)] text-sm">Try adjusting your filters or search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {listings.map((listing, idx) => (
                <Link
                  key={listing.id}
                  href={`/${locale}/listings/${listing.id}`}
                  className="listing-card group block bg-[var(--t-surface)] border border-white/[0.06] rounded-2xl overflow-hidden"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[var(--t-elevated)]">
                    {listing.images?.[0]?.url ? (
                      <Image
                        src={listing.images[0].url}
                        alt={localeText(listing.title)}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        loading={idx < 4 ? "eager" : "lazy"}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">🐾</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                      <Heart size={14} className="text-white" strokeWidth={2} />
                    </div>

                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {listing.seller?.verification_status === "verified" && (
                      <span className="badge badge-teal text-[9px]">Verified</span>
                      )}
                      {listing.is_featured && (
                        <span className="badge badge-accent text-[9px]">Featured</span>
                      )}
                      {listing.pedigree && !listing.is_featured && (
                        <span className="badge badge-neutral text-[9px]">Pedigree</span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3">
                      <span className="font-bold text-white text-sm font-[family-name:var(--font-mono)] drop-shadow-lg">
                        €{((listing.price ?? 0) / 100).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold text-[var(--t-text)] text-sm leading-snug flex-1 line-clamp-1">
                        {localeText(listing.breed?.name) || localeText(listing.title)}
                      </p>
                      {listing.seller?.rating > 0 && (
                        <div className="flex items-center gap-1 shrink-0">
                          <Star size={11} className="fill-[var(--color-accent)] text-[var(--color-accent)]" />
                          <span className="text-xs text-[rgba(232,228,221,0.70)] font-medium">{listing.seller.rating}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-[rgba(232,228,221,0.40)]">
                      {listing.location_city}, {listing.location_country}
                      {listing.age_weeks ? ` · ${listing.age_weeks}w` : ""}
                      {listing.gender ? ` · ${listing.gender === "male" ? "M" : "F"}` : ""}
                    </p>
                    {(listing.seller?.review_count ?? 0) > 0 && (
                      <p className="text-[10px] text-[rgba(232,228,221,0.30)] mt-0.5 font-[family-name:var(--font-mono)]">
                        {listing.seller.review_count} reviews
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
