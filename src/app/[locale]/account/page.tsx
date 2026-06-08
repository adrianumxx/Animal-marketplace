"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  Heart, MessageCircle, Trash2, MapPin, Clock, Bookmark, SlidersHorizontal, Search, Store, Building2,
  Stethoscope, ArrowUpCircle, BadgeCheck, LayoutDashboard, FileText, CheckCircle2, Gift,
  Megaphone, Users, BarChart3, Inbox, Target, Zap, Star, Sparkles, CreditCard, PawPrint, Headphones,
  ClipboardList, Award, Circle, X, type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { api, type AppUser, type FavoriteEntry, type InquiryEntry, type SavedSearchEntry, type Preferences } from "@/lib/api-client";
import { type EffectiveRole } from "@/lib/roles";
import { ImageUploader } from "@/components/ui/image-uploader";

type Tab = "favorites" | "recent" | "searches" | "preferences" | "inquiries";

const SPECIES = ["dogs", "cats", "rabbits", "birds", "horses", "exotic"];

// Role dashboard sections (from the USER-ROLES spec) — scaffolding cards per capability/tier.
const SELLER_SECTIONS: Record<string, string[]> = {
  private_seller: ["Active listings", "Drafts", "Pending verification", "Sold", "Messages", "Safe Deals", "Document status", "Performance", "Buyer requests"],
  breeder_free: ["Breeder profile", "Listings", "Messages", "Safe Deals", "Basic analytics", "Reviews"],
  breeder_pro: ["Breeder profile", "Listings", "Lead dashboard", "Analytics", "Boosts", "Messages", "Safe Deals", "Reviews", "AI suggestions", "Billing"],
  breeder_elite: ["Premium profile", "Listings", "Advanced analytics", "Lead quality", "Boost performance", "Buyer notes", "Upcoming litters", "Reviews", "Revenue / fee saved", "Priority support", "Billing"],
};
const SHELTER_SECTIONS = ["Shelter profile", "Animals for adoption", "Adopted animals", "Adoption requests", "Messages", "Donations", "Campaigns", "Wishlist", "Supporters", "Page statistics"];
const VET_SECTIONS = ["Vet profile", "Services", "Specializations", "Messages", "Profile views"];

function sectionIcon(label: string): LucideIcon {
  const l = label.toLowerCase();
  if (l.includes("adopt")) return Heart;
  if (l.includes("draft") || l.includes("document")) return FileText;
  if (l.includes("pending")) return Clock;
  if (l.includes("sold")) return CheckCircle2;
  if (l.includes("message")) return MessageCircle;
  if (l.includes("donation")) return Gift;
  if (l.includes("campaign")) return Megaphone;
  if (l.includes("wishlist")) return Bookmark;
  if (l.includes("supporter")) return Users;
  if (l.includes("statistic") || l.includes("analytic") || l.includes("performance") || l.includes("view")) return BarChart3;
  if (l.includes("request")) return Inbox;
  if (l.includes("lead")) return Target;
  if (l.includes("boost")) return Zap;
  if (l.includes("review")) return Star;
  if (l.includes("ai ")) return Sparkles;
  if (l.includes("billing") || l.includes("revenue") || l.includes("fee")) return CreditCard;
  if (l.includes("litter")) return PawPrint;
  if (l.includes("priority")) return Headphones;
  if (l.includes("service")) return ClipboardList;
  if (l.includes("special")) return Award;
  if (l.includes("shelter profile")) return Building2;
  if (l.includes("vet profile")) return Stethoscope;
  if (l.includes("profile")) return Store;
  if (l.includes("listing")) return LayoutDashboard;
  return LayoutDashboard;
}

export default function AccountPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) || "en";
  const tt = useTranslations("account");
  const tr = useTranslations("roles");

  const [user, setUser] = useState<AppUser | null>(null);
  const [tab, setTab] = useState<Tab>("favorites");
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);
  const [recent, setRecent] = useState<FavoriteEntry[]>([]);
  const [inquiries, setInquiries] = useState<InquiryEntry[]>([]);
  const [searches, setSearches] = useState<SavedSearchEntry[]>([]);
  const [prefs, setPrefs] = useState<Preferences>({ species: [], breeds: [], budget_max: null, locations: [] });
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [loading, setLoading] = useState(true);
  const [onbDismissed, setOnbDismissed] = useState(true);

  useEffect(() => { setOnbDismissed(localStorage.getItem("pt_onb_dismissed") === "1"); }, []);
  const dismissOnb = () => { localStorage.setItem("pt_onb_dismissed", "1"); setOnbDismissed(true); };

  const caps = user?.capabilities ?? [];
  const effRole = (user?.effective_role as EffectiveRole) || "registered_user";
  const sellerTier = user?.seller_tier ?? 0;

  const become = async (capability: "seller" | "shelter" | "vet", breeder = false) => {
    try {
      const r = await api.account.become({ capability, breeder });
      setUser((u) => (u ? { ...u, capabilities: r.user.capabilities } : u));
      toast.success(`You are now set up as ${capability === "seller" ? (breeder ? "a breeder" : "a seller") : capability}.`);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };
  const upgrade = async (tier: number) => {
    try { const r = await api.account.upgrade(tier); toast(r.message); } catch (e) { toast.error((e as Error).message); }
  };
  const changeAvatar = async (url: string) => {
    setUser((u) => (u ? { ...u, avatar_url: url } : u));
    try {
      await api.auth.updateProfile({ avatar_url: url });
      const cur = JSON.parse(localStorage.getItem("pt_user") || "{}");
      localStorage.setItem("pt_user", JSON.stringify({ ...cur, avatar_url: url }));
      toast.success("Photo updated");
    } catch (e) { toast.error((e as Error).message); }
  };

  useEffect(() => {
    (async () => {
      try {
        const me = await api.auth.me();
        setUser(me);
        const [f, i, rv, ss, pr] = await Promise.all([
          api.favorites.list(),
          api.inquiries.mine(),
          api.memory.recentlyViewed(),
          api.savedSearches.list(),
          api.memory.getPreferences(),
        ]);
        setFavorites(f.favorites);
        setInquiries(i.inquiries);
        setRecent(rv.recently_viewed);
        setSearches(ss.saved_searches);
        setPrefs(pr.preferences);
      } catch {
        router.push(`/${locale}/login`);
        return;
      } finally {
        setLoading(false);
      }
    })();
  }, [locale, router]);

  const removeFavorite = async (id: string) => {
    setFavorites((p) => p.filter((f) => f.listing_id?._id !== id));
    try { await api.favorites.remove(id); } catch { /* */ }
  };
  const removeSearch = async (id: string) => {
    setSearches((p) => p.filter((s) => s.id !== id));
    try { await api.savedSearches.remove(id); } catch { /* */ }
  };
  const clearRecent = async () => { setRecent([]); try { await api.memory.clearRecent(); } catch { /* */ } };
  const toggleSpecies = (s: string) =>
    setPrefs((p) => ({ ...p, species: p.species.includes(s) ? p.species.filter((x) => x !== s) : [...p.species, s] }));
  const savePrefs = async () => {
    setSavingPrefs(true);
    try { const r = await api.memory.setPreferences(prefs); setPrefs(r.preferences); } finally { setSavingPrefs(false); }
  };

  const text = (obj?: Record<string, string> | null, fb = "") => (obj && (obj[locale] || obj.en)) || fb;

  if (loading) {
    return <div className="bg-[var(--t-bg)] min-h-screen flex items-center justify-center"><div className="skeleton w-40 h-6" /></div>;
  }

  const TABS: [Tab, string, React.ReactNode, number][] = [
    ["favorites", tt("tabFavorites"), <Heart key="h" size={15} />, favorites.length],
    ["recent", tt("tabRecent"), <Clock key="c" size={15} />, recent.length],
    ["searches", tt("tabSearches"), <Bookmark key="b" size={15} />, searches.length],
    ["preferences", tt("tabPreferences"), <SlidersHorizontal key="s" size={15} />, prefs.species.length],
    ["inquiries", tt("tabInquiries"), <MessageCircle key="m" size={15} />, inquiries.length],
  ];

  return (
    <div className="bg-[var(--t-bg)] min-h-screen">
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 py-12 lg:py-16">

        <div className="flex items-center gap-4 mb-10">
          <div className="shrink-0">
            <ImageUploader variant="avatar" value={user?.avatar_url} onChange={changeAvatar} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-[var(--t-text)] tracking-[-0.02em]">{user?.full_name || "My account"}</h1>
              <span className="badge badge-accent">{tr(effRole)}</span>
            </div>
            <p className="text-sm text-[var(--t-text-secondary)] font-[family-name:var(--font-body)]">{user?.email}</p>
          </div>
        </div>

        {/* ── Onboarding checklist (new members) ── */}
        {effRole === "registered_user" && !onbDismissed && (
          <div className="mb-10 rounded-2xl border border-[rgba(255,56,92,0.25)] bg-[rgba(255,56,92,0.05)] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[var(--t-text)] flex items-center gap-2"><Sparkles size={16} className="text-[var(--color-accent)]" /> {tt("onbTitle")}</h2>
              <button onClick={dismissOnb} aria-label={tt("onbDismiss")} className="text-[var(--t-text-muted)] hover:text-[var(--t-text)] transition-colors"><X size={16} /></button>
            </div>
            <div className="space-y-2">
              {[
                { label: tt("onbPrefs"), done: prefs.species.length > 0, onClick: () => setTab("preferences") },
                { label: tt("onbSave"), done: favorites.length > 0, href: `/${locale}/search` },
                { label: tt("onbGrow"), done: caps.length > 0 },
              ].map((step) => {
                const Inner = (
                  <>
                    {step.done ? <CheckCircle2 size={18} className="text-[var(--color-accent-teal)] shrink-0" /> : <Circle size={18} className="text-[var(--t-text-muted)] shrink-0" />}
                    <span className={`text-sm font-semibold ${step.done ? "text-[var(--t-text-muted)] line-through" : "text-[var(--t-text)]"}`}>{step.label}</span>
                  </>
                );
                const cls = "flex items-center gap-2.5 w-full text-left rounded-xl px-3 py-2.5 hover:bg-white/[0.04] transition-colors";
                return step.href
                  ? <Link key={step.label} href={step.href} className={cls}>{Inner}</Link>
                  : <button key={step.label} onClick={step.onClick} className={cls}>{Inner}</button>;
              })}
            </div>
          </div>
        )}

        {/* ── Role hub: dashboards, become flows, upgrade ── */}
        <div className="mb-10 rounded-2xl border border-[var(--t-border)] bg-[var(--t-surface)] p-5">
          <h2 className="text-sm font-bold text-[var(--t-text)] mb-4 flex items-center gap-2"><BadgeCheck size={16} className="text-[var(--color-accent)]" /> {tt("rolesTitle")}</h2>

          <div className="flex flex-wrap gap-2 mb-4">
            <Link href={`/${locale}/messages`} className="btn-secondary inline-flex items-center gap-2 text-sm"><MessageCircle size={15} /> Messages</Link>
            {user?.role === "admin" && (
              <Link href={`/${locale}/admin`} className="btn-secondary inline-flex items-center gap-2 text-sm"><LayoutDashboard size={15} /> {tt("adminPanel")}</Link>
            )}
            {caps.includes("seller") && (
              <Link href={`/${locale}/dashboard`} className="btn-secondary inline-flex items-center gap-2 text-sm"><LayoutDashboard size={15} /> {tt("sellerDashboard")}</Link>
            )}
            {caps.includes("shelter") && (
              <Link href={`/${locale}/dashboard/shelter`} className="btn-secondary inline-flex items-center gap-2 text-sm"><Building2 size={15} /> Shelter dashboard</Link>
            )}
            {caps.includes("vet") && (
              <Link href={`/${locale}/dashboard/vet`} className="btn-secondary inline-flex items-center gap-2 text-sm"><Stethoscope size={15} /> Vet dashboard</Link>
            )}
          </div>

          {/* Become flows for missing capabilities (respects seller⊕vet) */}
          <div className="flex flex-wrap gap-2">
            {!caps.includes("seller") && !caps.includes("vet") && (
              <>
                <button onClick={() => become("seller", false)} className="btn-secondary inline-flex items-center gap-2 text-sm"><Store size={15} /> {tt("becomeSeller")}</button>
                <button onClick={() => become("seller", true)} className="btn-secondary inline-flex items-center gap-2 text-sm"><Store size={15} /> {tt("becomeBreeder")}</button>
              </>
            )}
            {!caps.includes("shelter") && (
              <button onClick={() => become("shelter")} className="btn-secondary inline-flex items-center gap-2 text-sm"><Building2 size={15} /> {tt("registerShelter")}</button>
            )}
            {!caps.includes("vet") && !caps.includes("seller") && (
              <button onClick={() => become("vet")} className="btn-secondary inline-flex items-center gap-2 text-sm"><Stethoscope size={15} /> {tt("createVet")}</button>
            )}
            {/* Upgrade CTAs for sellers (placeholder until billing) */}
            {caps.includes("seller") && sellerTier < 1 && (
              <button onClick={() => upgrade(1)} className="btn-primary inline-flex items-center gap-2 text-sm"><ArrowUpCircle size={15} /> {tt("upgradePro")}</button>
            )}
            {caps.includes("seller") && sellerTier === 1 && (
              <button onClick={() => upgrade(2)} className="btn-primary inline-flex items-center gap-2 text-sm"><ArrowUpCircle size={15} /> {tt("upgradeElite")}</button>
            )}
            {caps.includes("seller") && sellerTier >= 2 && (
              <span className="badge badge-gold">{tt("topTier")}</span>
            )}
          </div>

        </div>

        {/* ── Role dashboard sections (per capability) ── */}
        {(() => {
          const groups: { title: string; items: string[] }[] = [];
          if (caps.includes("seller")) groups.push({ title: tr(effRole), items: SELLER_SECTIONS[effRole] ?? SELLER_SECTIONS.private_seller });
          if (caps.includes("shelter")) groups.push({ title: tr("shelter"), items: SHELTER_SECTIONS });
          if (caps.includes("vet")) groups.push({ title: tr("veterinarian"), items: VET_SECTIONS });
          if (groups.length === 0) return null;
          return (
            <div className="mb-12 space-y-8">
              {groups.map((g) => (
                <div key={g.title}>
                  <div className="flex items-center gap-2.5 mb-4">
                    <span className="h-px flex-1 bg-[var(--t-divider)]" />
                    <h3 className="text-[11px] font-bold text-[var(--t-text-muted)] uppercase tracking-[0.14em] font-[family-name:var(--font-mono)] shrink-0">{g.title}</h3>
                    <span className="text-[11px] text-[var(--t-text-muted)] font-[family-name:var(--font-mono)]">{g.items.length}</span>
                    <span className="h-px flex-1 bg-[var(--t-divider)]" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {g.items.map((s) => {
                      const Icon = sectionIcon(s);
                      return (
                        <div
                          key={s}
                          className="relative flex items-center gap-3 rounded-2xl border border-[var(--t-border)] bg-[var(--t-surface)] p-4"
                        >
                          <div className="w-9 h-9 rounded-xl bg-[rgba(255,56,92,0.10)] border border-[rgba(255,56,92,0.15)] flex items-center justify-center text-[var(--color-accent)] shrink-0">
                            <Icon size={16} />
                          </div>
                          <span className="text-sm font-semibold text-[var(--t-text)] leading-tight flex-1 min-w-0">{s}</span>
                          <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--t-text-muted)] font-[family-name:var(--font-mono)] shrink-0 rounded-full border border-[var(--t-border)] px-2 py-0.5">{tt("soon")}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}

        <div className="flex gap-1 mb-8 border-b border-[var(--t-border)] overflow-x-auto scrollbar-none">
          {TABS.map(([id, label, icon, count]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 -mb-px whitespace-nowrap transition-colors ${
                tab === id ? "border-[var(--color-accent)] text-[var(--t-text)]" : "border-transparent text-[var(--t-text-muted)] hover:text-[var(--t-text)]"
              }`}
            >
              {icon}{label}<span className="text-xs text-[var(--t-text-muted)]">({count})</span>
            </button>
          ))}
        </div>

        {/* Favorites + Recently viewed share the card grid */}
        {(tab === "favorites" || tab === "recent") && (() => {
          const items = tab === "favorites" ? favorites : recent;
          if (items.length === 0) {
            return <Empty icon={tab === "favorites" ? <Heart size={28} /> : <Clock size={28} />} title={tab === "favorites" ? tt("noFavorites") : tt("nothingViewed")} cta={{ href: `/${locale}/search`, label: tt("browseListings") }} />;
          }
          return (
            <>
              {tab === "recent" && (
                <div className="flex justify-end mb-4">
                  <button onClick={clearRecent} className="text-xs font-semibold text-[var(--t-text-muted)] hover:text-[var(--color-accent)] flex items-center gap-1.5 transition-colors"><Trash2 size={13} /> {tt("clearHistory")}</button>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {items.map((f) => {
                  const l = f.listing_id;
                  if (!l) return null;
                  const img = l.images?.[0]?.url;
                  return (
                    <div key={f._id} className="listing-card group block bg-[var(--t-surface)] border border-[var(--t-border)] rounded-2xl overflow-hidden">
                      <Link href={`/${locale}/listings/${l._id}`} className="block">
                        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--t-elevated)]">
                          {img && <Image src={img} alt={text(l.breed_id?.name, "Listing")} fill className="object-cover" sizes="25vw" />}
                        </div>
                      </Link>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-bold text-[var(--t-text)] text-sm line-clamp-1">{text(l.breed_id?.name, "Listing")}</p>
                          {tab === "favorites" && (
                            <button onClick={() => removeFavorite(l._id)} aria-label="Remove favorite" className="text-[var(--t-text-muted)] hover:text-[var(--color-accent)] transition-colors cursor-pointer shrink-0"><Trash2 size={15} /></button>
                          )}
                        </div>
                        <p className="text-xs text-[var(--t-text-muted)] mt-1 font-[family-name:var(--font-body)] flex items-center gap-1"><MapPin size={11} /> {l.location_city}, {l.location_country}</p>
                        <p className="mt-2 font-black text-[var(--t-text)] font-[family-name:var(--font-mono)]">€{((l.price ?? 0) / 100).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          );
        })()}

        {/* Saved searches */}
        {tab === "searches" && (
          searches.length === 0 ? (
            <Empty icon={<Bookmark size={28} />} title={tt("noSearches")} cta={{ href: `/${locale}/search`, label: tt("runSearch") }} />
          ) : (
            <div className="space-y-3">
              {searches.map((s) => {
                const qs = new URLSearchParams(s.params).toString();
                return (
                  <div key={s.id} className="flex items-center justify-between gap-3 bg-[var(--t-surface)] border border-[var(--t-border)] rounded-2xl p-4">
                    <Link href={`/${locale}/search${qs ? "?" + qs : ""}`} className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[var(--t-elevated)] flex items-center justify-center text-[var(--color-accent)] shrink-0"><Search size={16} /></div>
                      <div className="min-w-0">
                        <p className="font-bold text-[var(--t-text)] text-sm truncate">{s.name}</p>
                        <p className="text-xs text-[var(--t-text-muted)] truncate">{Object.entries(s.params).map(([k, v]) => `${k}: ${v}`).join(" · ") || "All listings"}{s.alert ? " · 🔔 alerts on" : ""}</p>
                      </div>
                    </Link>
                    <button onClick={() => removeSearch(s.id)} aria-label="Delete saved search" className="text-[var(--t-text-muted)] hover:text-[var(--color-accent)] transition-colors shrink-0"><Trash2 size={16} /></button>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* Preferences */}
        {tab === "preferences" && (
          <div className="max-w-lg space-y-8">
            <div>
              <h3 className="text-sm font-bold text-[var(--t-text)] mb-3">{tt("speciesTitle")}</h3>
              <div className="flex flex-wrap gap-2">
                {SPECIES.map((s) => (
                  <button key={s} onClick={() => toggleSpecies(s)} className={`px-4 py-2 rounded-full text-sm font-semibold capitalize border transition-colors ${prefs.species.includes(s) ? "bg-[rgba(255,56,92,0.10)] border-[rgba(255,56,92,0.30)] text-[var(--color-accent)]" : "border-[var(--t-border)] text-[var(--t-text-secondary)] hover:border-[var(--t-border-hover)]"}`}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--t-text)] mb-3">{tt("budgetTitle")}</h3>
              <input
                type="number" min={0} placeholder="e.g. 2000"
                value={prefs.budget_max != null ? Math.round(prefs.budget_max / 100) : ""}
                onChange={(e) => setPrefs((p) => ({ ...p, budget_max: e.target.value ? Number(e.target.value) * 100 : null }))}
                className="input-dark max-w-[200px]"
              />
            </div>
            <button onClick={savePrefs} disabled={savingPrefs} className="btn-primary disabled:opacity-60">{savingPrefs ? tt("saving") : tt("save")}</button>
            <p className="text-xs text-[var(--t-text-muted)]">{tt("prefsHint")}</p>
          </div>
        )}

        {/* Inquiries */}
        {tab === "inquiries" && (
          inquiries.length === 0 ? (
            <Empty icon={<MessageCircle size={28} />} title={tt("noInquiries")} cta={{ href: `/${locale}/search`, label: tt("findBreeder") }} />
          ) : (
            <div className="space-y-3">
              {inquiries.map((q) => {
                const l = q.listing_id;
                return (
                  <div key={q._id} className="bg-[var(--t-surface)] border border-[var(--t-border)] rounded-2xl p-5">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <Link href={l ? `/${locale}/listings/${l._id}` : "#"} className="font-bold text-[var(--t-text)] text-sm hover:text-[var(--color-accent)] transition-colors">
                        {text(l?.breed_id?.name, "Listing")} · {l?.seller_id?.business_name ?? "Breeder"}
                      </Link>
                      <span className="badge badge-neutral">{q.status}</span>
                    </div>
                    <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed font-[family-name:var(--font-body)]">{q.message}</p>
                    <p className="text-[11px] text-[var(--t-text-muted)] mt-2 font-[family-name:var(--font-mono)]">{new Date(q.created_at).toLocaleDateString()}</p>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function Empty({ icon, title, cta }: { icon: React.ReactNode; title: string; cta: { href: string; label: string } }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <div className="w-16 h-16 rounded-2xl bg-[var(--t-elevated)] flex items-center justify-center text-[var(--t-text-muted)] mb-4">{icon}</div>
      <p className="text-[var(--t-text-secondary)] mb-5 font-[family-name:var(--font-body)]">{title}</p>
      <Link href={cta.href} className="btn-primary">{cta.label}</Link>
    </div>
  );
}
