"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { LayoutDashboard, Heart, Inbox, User, Gift, Eye, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ImageUploader } from "@/components/ui/image-uploader";
import { api, type AppUser, type ShelterDashboard } from "@/lib/api-client";

type Tab = "overview" | "animals" | "requests" | "profile";
const TABS = [
  { id: "overview" as Tab, label: "Overview", icon: LayoutDashboard },
  { id: "animals" as Tab, label: "Animals", icon: Heart },
  { id: "requests" as Tab, label: "Adoption requests", icon: Inbox },
  { id: "profile" as Tab, label: "Profile", icon: User },
];

export default function ShelterDashboard() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const [tab, setTab] = useState<Tab>("overview");
  const [data, setData] = useState<ShelterDashboard | null>(null);
  const [form, setForm] = useState({ organization_name: "", bio_en: "", location_city: "", phone: "", website_url: "", cover_url: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("pt_user");
    if (!stored) { router.push(`/${locale}/login`); return; }
    const u = JSON.parse(stored) as AppUser;
    if (!(u.capabilities ?? []).includes("shelter") && u.role !== "admin") { router.push(`/${locale}/account`); return; }
    api.shelterDash.me().then((d) => {
      setData(d);
      setForm({
        organization_name: d.profile.organization_name ?? "",
        bio_en: d.profile.bio?.en ?? "",
        location_city: d.profile.location_city ?? "",
        phone: d.profile.phone ?? "",
        website_url: d.profile.website_url ?? "",
        cover_url: (d.profile.cover_url as string) ?? "",
      });
    }).catch(() => router.push(`/${locale}/account`));
  }, [locale, router]);

  const save = async () => {
    setSaving(true);
    try { await api.shelterDash.update(form); toast.success("Profile saved"); } catch (e) { toast.error((e as Error).message); } finally { setSaving(false); }
  };

  if (!data) return <div className="bg-[var(--t-bg)] min-h-screen flex items-center justify-center"><div className="skeleton w-40 h-6" /></div>;

  return (
    <div className="min-h-screen bg-[var(--t-bg)]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-8 pt-24">
        <h1 className="text-2xl font-black text-[var(--t-text)] tracking-[-0.02em] mb-1">{data.profile.organization_name}</h1>
        <p className="text-sm text-[var(--t-text-muted)] mb-8">Shelter dashboard</p>

        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-56 shrink-0">
            <nav className="bg-[var(--t-surface)] rounded-2xl border border-[var(--t-border)] p-2">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setTab(id)} className={cn("w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all",
                  tab === id ? "bg-[rgba(255,56,92,0.10)] text-[var(--color-accent)]" : "text-[var(--t-text-muted)] hover:text-[var(--t-text)] hover:bg-white/[0.04]")}>
                  <Icon size={16} /> {label}
                  {id === "requests" && data.stats.requests > 0 && <span className="ml-auto text-xs bg-[var(--color-accent)] text-white rounded-full px-1.5">{data.stats.requests}</span>}
                </button>
              ))}
            </nav>
          </aside>

          <div className="flex-1 min-w-0">
            {tab === "overview" && (
              <div className="grid sm:grid-cols-4 gap-4">
                {([["Animals", data.stats.listings, Heart], ["Active", data.stats.active, Eye], ["Adopted", data.stats.adopted, Gift], ["Requests", data.stats.requests, Inbox]] as const).map(([label, val, Icon]) => (
                  <div key={label} className="bg-[var(--t-surface)] rounded-2xl border border-[var(--t-border)] p-5">
                    <Icon size={18} className="text-[var(--color-accent)] mb-3" />
                    <div className="text-3xl font-black text-[var(--t-text)] tracking-[-0.03em]">{val}</div>
                    <div className="text-xs text-[var(--t-text-muted)] mt-1 uppercase tracking-[0.04em] font-[family-name:var(--font-mono)]">{label}</div>
                  </div>
                ))}
              </div>
            )}

            {tab === "animals" && (
              data.listings.length === 0 ? <Empty label="No animals listed for adoption yet." />
              : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.listings.map((l) => (
                    <Link key={l.id} href={`/${locale}/listings/${l.id}`} className="listing-card block bg-[var(--t-surface)] border border-[var(--t-border)] rounded-2xl overflow-hidden">
                      <div className="aspect-[4/3] bg-[var(--t-elevated)]" style={l.image ? { backgroundImage: `url(${l.image})`, backgroundSize: "cover", backgroundPosition: "center" } : {}} />
                      <div className="p-4">
                        <p className="font-bold text-[var(--t-text)] text-sm line-clamp-1">{l.title}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-[var(--t-text-muted)] font-[family-name:var(--font-mono)]"><span className="flex items-center gap-1"><Eye size={11} />{l.view_count}</span><span className="flex items-center gap-1"><Inbox size={11} />{l.inquiry_count}</span></div>
                      </div>
                    </Link>
                  ))}
                </div>
            )}

            {tab === "requests" && (
              data.requests.length === 0 ? <Empty label="No adoption requests yet." />
              : <div className="space-y-3">
                  {data.requests.map((r) => (
                    <div key={r.id} className="bg-[var(--t-surface)] border border-[var(--t-border)] rounded-2xl p-5">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <p className="font-bold text-[var(--t-text)] text-sm">{r.buyer_name} · <span className="text-[var(--t-text-muted)] font-normal">{r.listing_title}</span></p>
                        <span className="text-[10px] text-[var(--t-text-muted)] font-[family-name:var(--font-mono)] flex items-center gap-1"><Clock size={10} />{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{r.message}</p>
                      <Link href={`/${locale}/messages`} className="inline-block mt-3 text-sm font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]">Reply in inbox →</Link>
                    </div>
                  ))}
                </div>
            )}

            {tab === "profile" && (
              <div className="bg-[var(--t-surface)] rounded-2xl border border-[var(--t-border)] p-8 max-w-xl space-y-5">
                <ImageUploader variant="cover" label="Cover photo" value={form.cover_url} onChange={(url) => setForm((f) => ({ ...f, cover_url: url }))} />
                <Field label="Organization name"><input className="input-dark" value={form.organization_name} onChange={(e) => setForm((f) => ({ ...f, organization_name: e.target.value }))} /></Field>
                <Field label="Bio"><textarea rows={4} className="input-dark !h-auto py-3 resize-none" value={form.bio_en} onChange={(e) => setForm((f) => ({ ...f, bio_en: e.target.value }))} /></Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="City"><input className="input-dark" value={form.location_city} onChange={(e) => setForm((f) => ({ ...f, location_city: e.target.value }))} /></Field>
                  <Field label="Phone"><input className="input-dark" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></Field>
                </div>
                <Field label="Website"><input className="input-dark" value={form.website_url} onChange={(e) => setForm((f) => ({ ...f, website_url: e.target.value }))} /></Field>
                <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-50">{saving ? "Saving…" : "Save changes"}</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><label className="text-xs font-semibold text-[var(--t-text-muted)] uppercase tracking-[0.06em] font-[family-name:var(--font-mono)]">{label}</label>{children}</div>;
}
function Empty({ label }: { label: string }) {
  return <div className="bg-[var(--t-surface)] border border-dashed border-[var(--t-border)] rounded-2xl p-12 text-center text-[var(--t-text-secondary)]">{label}</div>;
}
