"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  LayoutDashboard, List, MessageCircle, User, CreditCard, Plus, Eye,
  Trash2, Pause, ArrowUpRight, Check, Play, TrendingUp, Mail, Clock,
  ChevronRight, Package, Shield, Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { sellerPlan, tierLabel } from "@/lib/plans";
import { ImageUploader } from "@/components/ui/image-uploader";
import { BuyerNoteBox } from "@/components/dashboard/buyer-note-box";
import { api, type DashboardData, type AppUser, type Listing } from "@/lib/api-client";

type Tab = "overview" | "listings" | "messages" | "profile" | "subscription";

const TABS = [
  { id: "overview" as Tab,      label: "Overview",      icon: LayoutDashboard },
  { id: "listings" as Tab,      label: "Listings",      icon: List },
  { id: "messages" as Tab,      label: "Messages",      icon: MessageCircle },
  { id: "profile" as Tab,       label: "Profile",       icon: User },
  { id: "subscription" as Tab,  label: "Subscription",  icon: CreditCard },
];

const statusColors: Record<string, string> = {
  active:         "bg-[rgba(0,166,153,0.10)] text-[var(--color-accent-teal)] border border-[rgba(0,166,153,0.20)]",
  draft:          "bg-white/[0.04] text-[rgba(232,228,221,0.50)] border border-white/[0.08]",
  pending_review: "bg-[rgba(184,150,12,0.10)] text-[var(--color-accent-gold)] border border-[rgba(184,150,12,0.20)]",
  sold:           "bg-[rgba(99,102,241,0.10)] text-[var(--color-accent-indigo)] border border-[rgba(99,102,241,0.20)]",
  expired:        "bg-[rgba(255,56,92,0.10)] text-[var(--color-accent)] border border-[rgba(255,56,92,0.20)]",
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   STEP WIZARD — Create new listing
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function StepWizard({ sellerId, onCreated }: { sellerId: string; onCreated: () => void }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [species, setSpecies] = useState<{ id: string; name_en: string }[]>([]);
  const [breeds, setBreeds] = useState<{ id: string; name_en: string }[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [docs, setDocs] = useState<string[]>([]);
  const [docUploading, setDocUploading] = useState(false);

  async function handleDocs(files: FileList | null) {
    if (!files?.length) return;
    setDocUploading(true);
    try {
      for (const file of Array.from(files).slice(0, 5)) {
        const base64: string = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(file); });
        await api.documents.upload({ name: file.name, type: "verification", file_base64: base64 });
        setDocs((p) => [...p, file.name]);
      }
      toast.success("Document uploaded for review");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setDocUploading(false);
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files).slice(0, 6)) {
        const { url } = await api.upload.image(file);
        setImages((p) => [...p, url]);
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  const [form, setForm] = useState({
    species_id: "", breed_id: "", gender: "male", age_weeks: "",
    price: "", title_en: "", description_en: "",
    vaccinated: false, dewormed: false, vet_checked: false, pedigree: false,
    microchip_number: "", ready_date: "", location_city: "", location_country: "BE",
  });

  useEffect(() => {
    fetch("/api/species").then(r => r.json()).then(d => setSpecies(d.species ?? []));
  }, []);

  useEffect(() => {
    if (!form.species_id) { setBreeds([]); return; }
    fetch(`/api/breeds?species_id=${form.species_id}`).then(r => r.json()).then(d => setBreeds(d.breeds ?? []));
  }, [form.species_id]);

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  async function submit() {
    setLoading(true);
    setError("");
    try {
      await api.listings.create({
        ...form,
        age_weeks: parseInt(form.age_weeks) || null,
        price: parseInt(form.price) * 100,
        images: images.map((url, i) => ({ url, is_primary: i === 0 })),
        seller_id: sellerId,
        status: "active",
      });
      onCreated();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const steps = [
    { id: 1, label: "Basic info", icon: Package },
    { id: 2, label: "Health & docs", icon: Shield },
    { id: 3, label: "Preview", icon: Eye },
  ];

  return (
    <div className="max-w-2xl">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center gap-0">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <div className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold border-2 shrink-0 transition-all duration-300",
                  step > s.id ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-white shadow-[0_0_12px_rgba(255,56,92,0.35)]" :
                  step === s.id ? "bg-[var(--t-bg)] border-[var(--color-accent)] text-[var(--color-accent)] shadow-[0_0_12px_rgba(255,56,92,0.20)]" :
                  "bg-[var(--t-surface)] border-white/[0.10] text-[rgba(232,228,221,0.30)]"
                )}>
                  {step > s.id ? <Check size={14} strokeWidth={2.5} /> : <Icon size={14} />}
                </div>
                {i < steps.length - 1 && (
                  <div className={cn("flex-1 h-0.5 transition-all duration-300", step > s.id ? "bg-[var(--color-accent)]" : "bg-white/[0.06]")} />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2.5">
          {steps.map(s => (
            <div key={s.id} className={cn(
              "text-[10px] font-bold uppercase tracking-[0.06em] font-[family-name:var(--font-mono)] transition-colors",
              step >= s.id ? "text-[rgba(232,228,221,0.65)]" : "text-[rgba(232,228,221,0.25)]"
            )}>
              {s.label}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-5 text-sm text-[var(--color-accent)] bg-[rgba(255,56,92,0.08)] border border-[rgba(255,56,92,0.20)] rounded-2xl px-5 py-3.5">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5">
          <h3 className="font-bold text-[var(--t-text)] tracking-[-0.01em] font-[family-name:var(--font-display)]">Basic information</h3>
          <DField label="Species" required>
            <select className="input-dark" value={form.species_id} onChange={e => set("species_id", e.target.value)}>
              <option value="">Select species</option>
              {species.map(s => <option key={s.id} value={s.id}>{s.name_en}</option>)}
            </select>
          </DField>
          <DField label="Breed">
            <select className="input-dark" value={form.breed_id} onChange={e => set("breed_id", e.target.value)}>
              <option value="">Select breed</option>
              {breeds.map(b => <option key={b.id} value={b.id}>{b.name_en}</option>)}
            </select>
          </DField>
          <div className="grid sm:grid-cols-2 gap-4">
            <DField label="Gender" required>
              <select className="input-dark" value={form.gender} onChange={e => set("gender", e.target.value)}>
                <option value="male">Male ♂</option>
                <option value="female">Female ♀</option>
              </select>
            </DField>
            <DField label="Age (weeks)" required>
              <input type="number" className="input-dark" placeholder="e.g. 10"
                value={form.age_weeks} onChange={e => set("age_weeks", e.target.value)} />
            </DField>
          </div>
          <DField label="Price (EUR)" required>
            <input type="number" className="input-dark" placeholder="e.g. 1450"
              value={form.price} onChange={e => set("price", e.target.value)} />
          </DField>
          <DField label="Title" required>
            <input type="text" className="input-dark" placeholder="e.g. Golden Retriever Puppy — KC Registered"
              value={form.title_en} onChange={e => set("title_en", e.target.value)} />
          </DField>
          <DField label="Description">
            <textarea rows={4} className="input-dark !h-auto py-3 resize-none" placeholder="Describe your animal..."
              value={form.description_en} onChange={e => set("description_en", e.target.value)} />
          </DField>
          <DField label="Photos">
            <div className="flex flex-wrap gap-2.5">
              {images.map((url, i) => (
                <div key={url} className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/[0.08]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  {i === 0 && <span className="absolute bottom-0 inset-x-0 bg-[var(--color-accent)] text-white text-[8px] font-bold text-center py-0.5">COVER</span>}
                  <button type="button" onClick={() => setImages(p => p.filter(u => u !== url))} className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 text-white text-[10px] flex items-center justify-center">×</button>
                </div>
              ))}
              <label className="w-20 h-20 rounded-xl border-2 border-dashed border-white/[0.12] hover:border-[rgba(255,56,92,0.4)] flex flex-col items-center justify-center cursor-pointer text-[rgba(232,228,221,0.40)] hover:text-[var(--color-accent)] transition-colors text-xs">
                {uploading ? "…" : "+ Add"}
                <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} disabled={uploading} />
              </label>
            </div>
          </DField>
          <div className="grid sm:grid-cols-2 gap-4">
            <DField label="City">
              <input type="text" className="input-dark" placeholder="Brussels"
                value={form.location_city} onChange={e => set("location_city", e.target.value)} />
            </DField>
            <DField label="Country">
              <select className="input-dark" value={form.location_country} onChange={e => set("location_country", e.target.value)}>
                <option value="BE">🇧🇪 Belgium</option>
                <option value="NL">🇳🇱 Netherlands</option>
                <option value="LU">🇱🇺 Luxembourg</option>
              </select>
            </DField>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <h3 className="font-bold text-[var(--t-text)] tracking-[-0.01em] font-[family-name:var(--font-display)]">Health & documentation</h3>
          <div className="space-y-3">
            {(["vaccinated", "dewormed", "vet_checked", "pedigree"] as const).map(k => (
              <label key={k} className="flex items-center gap-3.5 cursor-pointer group p-3 rounded-xl border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.02] transition-all duration-200">
                <div className={cn(
                  "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 shrink-0",
                  form[k] ? "bg-[var(--color-accent)] border-[var(--color-accent)] shadow-[0_0_8px_rgba(255,56,92,0.3)]" : "border-white/[0.15] group-hover:border-[rgba(255,56,92,0.40)]"
                )}>
                  {form[k] && <Check size={12} className="text-white" strokeWidth={3} />}
                </div>
                <span className="text-sm text-[rgba(232,228,221,0.70)] group-hover:text-[var(--t-text)] capitalize transition-colors">{k.replace("_", " ")}</span>
              </label>
            ))}
          </div>
          <DField label="Microchip number">
            <input type="text" className="input-dark font-[family-name:var(--font-mono)] tracking-wider" placeholder="528140001234567"
              value={form.microchip_number} onChange={e => set("microchip_number", e.target.value)} />
          </DField>
          <DField label="Available from">
            <input type="date" className="input-dark"
              value={form.ready_date} onChange={e => set("ready_date", e.target.value)} />
          </DField>
          <DField label="Verification documents (PDF / image)">
            <div className="space-y-2">
              {docs.map((name) => (
                <div key={name} className="flex items-center gap-2 text-sm text-[rgba(232,228,221,0.65)] bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2">
                  <Check size={13} className="text-[var(--color-accent-teal)]" /> {name}
                </div>
              ))}
              <label className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/[0.12] hover:border-[rgba(255,56,92,0.4)] py-3 cursor-pointer text-sm text-[rgba(232,228,221,0.50)] hover:text-[var(--color-accent)] transition-colors">
                {docUploading ? "Uploading…" : "+ Upload document (pedigree, health, license)"}
                <input type="file" accept="application/pdf,image/*" multiple className="hidden" disabled={docUploading} onChange={e => handleDocs(e.target.files)} />
              </label>
            </div>
          </DField>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <h3 className="font-bold text-[var(--t-text)] tracking-[-0.01em] font-[family-name:var(--font-display)]">Preview & publish</h3>
          <div className="bg-[rgba(0,166,153,0.06)] border border-[rgba(0,166,153,0.15)] rounded-2xl p-4 text-sm text-[var(--color-accent-teal)] flex items-start gap-2.5">
            <Sparkles size={16} className="shrink-0 mt-0.5" />
            <span>Your listing will be submitted for review before it goes live.</span>
          </div>
          <div className="bg-[var(--t-elevated)] border border-white/[0.06] rounded-2xl overflow-hidden divide-y divide-white/[0.06]">
            {[
              { label: "Title", value: form.title_en || "—" },
              { label: "Price", value: form.price ? `€${form.price}` : "—" },
              { label: "Age", value: form.age_weeks ? `${form.age_weeks} weeks` : "—" },
              { label: "Location", value: `${form.location_city || "—"}, ${form.location_country}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center px-5 py-3.5">
                <span className="text-xs text-[rgba(232,228,221,0.40)] uppercase tracking-[0.06em] font-[family-name:var(--font-mono)]">{label}</span>
                <span className="text-sm font-medium text-[var(--t-text)]">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-8 pt-6 border-t border-white/[0.06]">
        {step > 1 && (
          <button onClick={() => setStep(step - 1)}
            className="flex-1 py-3.5 border border-white/[0.10] rounded-2xl text-sm font-semibold text-[rgba(232,228,221,0.60)] hover:text-[var(--t-text)] hover:border-white/[0.20] hover:bg-white/[0.03] transition-all duration-200">
            Back
          </button>
        )}
        <button
          onClick={() => step < 3 ? setStep(step + 1) : submit()}
          disabled={loading || (step === 1 && (!form.species_id || !form.title_en || !form.price))}
          className="flex-1 py-3.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-40 text-white font-bold rounded-2xl text-sm transition-all duration-200 hover:shadow-[0_8px_24px_rgba(255,56,92,0.35)] hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
        >
          {step === 3 ? (loading ? "Submitting..." : "Submit for review") : "Continue"}
          <ChevronRight size={15} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

/* Dashboard Field wrapper */
function DField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-xs font-semibold text-[rgba(232,228,221,0.55)] uppercase tracking-[0.06em] font-[family-name:var(--font-mono)]">
        {label}
        {required && <span className="text-[var(--color-accent)]">*</span>}
      </label>
      {children}
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN DASHBOARD PAGE
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function DashboardPage() {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showNewListing, setShowNewListing] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [profileForm, setProfileForm] = useState({ business_name: "", bio_en: "", location_city: "", phone: "", approval_number: "", cover_url: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [sellerTier, setSellerTier] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("pt_user");
    if (!stored) { router.push(`/${locale}/login`); return; }
    const u = JSON.parse(stored) as AppUser;
    const isSeller = (u.capabilities ?? []).includes("seller") || u.role === "seller" || u.role === "admin";
    if (!isSeller) { router.push(`/${locale}`); return; }
    setUser(u);
    const sid = u.seller_id ?? null;
    setSellerId(sid);
    if (sid) {
      api.sellers.dashboard(sid).then(setData).catch(console.error);
      api.sellers.get(sid).then(d => {
        const s = d.seller as unknown as Record<string, string>;
        setSellerTier(Number(s.tier ?? 0));
        setProfileForm({
          business_name: s.business_name ?? "",
          bio_en: s.bio_en ?? "",
          location_city: s.location_city ?? "",
          phone: s.phone ?? "",
          approval_number: s.approval_number ?? "",
          cover_url: s.cover_url ?? "",
        });
      }).catch(console.error);
    }
  }, [locale, router]);

  useEffect(() => {
    if (activeTab !== "listings" || !sellerId) return;
    setLoadingListings(true);
    api.listings.search({ seller_id: sellerId, page_size: 50 })
      .then(r => setListings(r.listings))
      .catch(console.error)
      .finally(() => setLoadingListings(false));
  }, [activeTab, sellerId]);

  async function toggleStatus(listing: Listing) {
    const newStatus = listing.status === "active" ? "draft" : "pending_review";
    await api.listings.update(listing.id, { status: newStatus });
    setListings(ls => ls.map(l => l.id === listing.id ? { ...l, status: newStatus } : l));
  }

  async function deleteListing(id: string) {
    if (!confirm("Delete this listing?")) return;
    await api.listings.delete(id);
    setListings(ls => ls.filter(l => l.id !== id));
  }

  async function saveProfile() {
    if (!sellerId) return;
    setProfileSaving(true);
    try {
      await api.sellers.update(sellerId, profileForm);
      toast.success("Profile saved");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setProfileSaving(false);
    }
  }

  const stats = data?.stats;
  const messages = data?.recent_messages ?? [];
  const newMessages = 0;

  return (
    <div className="min-h-screen bg-[var(--t-bg)]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[var(--t-text)] tracking-[-0.02em] font-[family-name:var(--font-display)]">
              Seller Dashboard
            </h1>
            <p className="text-sm text-[rgba(232,228,221,0.40)] mt-1">
              {user?.full_name ? `Welcome back, ${user.full_name}` : "Manage your listings and messages"}
            </p>
          </div>
          <button
            onClick={() => { setActiveTab("listings"); setShowNewListing(true); }}
            className="flex items-center gap-2 px-5 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold rounded-2xl text-sm transition-all duration-200 hover:shadow-[0_8px_24px_rgba(255,56,92,0.35)] hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus size={16} strokeWidth={2.5} />
            New listing
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Sidebar ─────────────────────── */}
          <aside className="lg:w-56 shrink-0">
            <nav className="bg-[var(--t-surface)] rounded-2xl border border-white/[0.06] p-2 shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => { setActiveTab(id); setShowNewListing(false); }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    activeTab === id
                      ? "bg-[rgba(255,56,92,0.10)] text-[var(--color-accent)] shadow-[inset_0_0_0_1px_rgba(255,56,92,0.15)]"
                      : "text-[rgba(232,228,221,0.50)] hover:text-[var(--t-text)] hover:bg-white/[0.04]"
                  )}
                >
                  <Icon size={16} />
                  {label}
                  {id === "messages" && newMessages > 0 && (
                    <span className="ml-auto w-5 h-5 rounded-full bg-[var(--color-accent)] text-white text-xs flex items-center justify-center font-bold shadow-[0_0_8px_rgba(255,56,92,0.4)]">
                      {newMessages}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </aside>

          {/* ── Content ─────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* ═══════ OVERVIEW ═══════ */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { label: "Active listings", value: stats?.active_listings ?? "—", icon: List, accent: "var(--color-accent-teal)" },
                    { label: "Total views", value: stats?.total_views ?? "—", icon: Eye, accent: "var(--color-accent-indigo)" },
                    { label: "Total inquiries", value: stats?.total_inquiries ?? "—", icon: MessageCircle, accent: "var(--color-accent)" },
                  ].map(({ label, value, icon: Icon, accent }) => (
                    <div key={label} className="bg-[var(--t-surface)] rounded-2xl border border-white/[0.06] p-5 hover:border-white/[0.12] transition-all duration-200 group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: `${accent}15` }}>
                          <Icon size={18} style={{ color: accent }} />
                        </div>
                        <ArrowUpRight size={16} className="text-[rgba(232,228,221,0.15)] group-hover:text-[rgba(232,228,221,0.40)] transition-colors" />
                      </div>
                      <div className="text-3xl font-bold text-[var(--t-text)] tracking-[-0.03em] font-[family-name:var(--font-display)]">{value}</div>
                      <div className="text-xs text-[rgba(232,228,221,0.40)] mt-1 font-[family-name:var(--font-mono)] uppercase tracking-[0.04em]">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Recent messages */}
                <div className="bg-[var(--t-surface)] rounded-2xl border border-white/[0.06] overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                    <h2 className="font-bold text-[var(--t-text)] text-sm tracking-[-0.01em]">Recent messages</h2>
                    <button onClick={() => setActiveTab("messages")} className="text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] font-semibold transition-colors flex items-center gap-1">
                      View all <ChevronRight size={12} />
                    </button>
                  </div>
                  {messages.length === 0 ? (
                    <div className="text-center py-10">
                      <Mail size={28} className="mx-auto text-[rgba(232,228,221,0.15)] mb-3" />
                      <p className="text-sm text-[rgba(232,228,221,0.35)]">No messages yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/[0.04]">
                      {messages.slice(0, 3).map(m => (
                        <div key={m.id} className="flex items-start gap-3 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                          <div className="w-9 h-9 rounded-full bg-[rgba(255,56,92,0.08)] border border-[rgba(255,56,92,0.15)] flex items-center justify-center text-xs font-bold text-[var(--color-accent)] shrink-0">
                            {m.sender_name?.charAt(0) ?? "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-[var(--t-text)]">{m.sender_name ?? m.sender_email}</div>
                            <div className="text-[10px] text-[rgba(232,228,221,0.30)] font-[family-name:var(--font-mono)] uppercase tracking-[0.04em] mb-0.5">{m.listing_title ?? "General inquiry"}</div>
                            <div className="text-xs text-[rgba(232,228,221,0.45)] line-clamp-1">{m.body}</div>
                          </div>
                          <div className="text-[10px] text-[rgba(232,228,221,0.25)] shrink-0 font-[family-name:var(--font-mono)]">
                            <Clock size={10} className="inline mr-1" />
                            {new Date(m.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═══════ LISTINGS ═══════ */}
            {activeTab === "listings" && (
              <div className="space-y-5">
                {showNewListing ? (
                  <div className="bg-[var(--t-surface)] rounded-2xl border border-white/[0.06] p-8 shadow-[0_8px_40px_rgba(0,0,0,0.3)]">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-bold text-[var(--t-text)] tracking-[-0.02em] font-[family-name:var(--font-display)]">Create new listing</h2>
                      <button onClick={() => setShowNewListing(false)} className="text-sm text-[rgba(232,228,221,0.40)] hover:text-[var(--t-text)] transition-colors">Cancel</button>
                    </div>
                    {sellerId && (
                      <StepWizard
                        sellerId={sellerId}
                        onCreated={() => {
                          setShowNewListing(false);
                          setActiveTab("listings");
                          if (sellerId) {
                            setLoadingListings(true);
                            api.listings.search({ seller_id: sellerId, page_size: 50 })
                              .then(r => setListings(r.listings))
                              .finally(() => setLoadingListings(false));
                          }
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <h2 className="font-bold text-[var(--t-text)] tracking-[-0.01em]">
                        My listings
                        <span className="ml-2 text-xs text-[rgba(232,228,221,0.30)] font-[family-name:var(--font-mono)]">({listings.length})</span>
                      </h2>
                      <button onClick={() => setShowNewListing(true)}
                        className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors">
                        <Plus size={15} strokeWidth={2.5} /> New listing
                      </button>
                    </div>

                    {loadingListings ? (
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="bg-[var(--t-surface)] border border-white/[0.06] rounded-2xl p-5 h-20 skeleton" />
                        ))}
                      </div>
                    ) : listings.length === 0 ? (
                      <div className="bg-[var(--t-surface)] rounded-2xl border-2 border-dashed border-white/[0.08] p-12 text-center">
                        <div className="text-5xl mb-4">🐾</div>
                        <p className="text-[var(--t-text)] font-semibold mb-2">No listings yet</p>
                        <p className="text-sm text-[rgba(232,228,221,0.35)] mb-6">Create your first listing to start selling</p>
                        <button onClick={() => setShowNewListing(true)}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold rounded-2xl text-sm transition-all duration-200 hover:shadow-[0_8px_24px_rgba(255,56,92,0.35)]">
                          <Plus size={15} /> Create listing
                        </button>
                      </div>
                    ) : (
                      <div className="bg-[var(--t-surface)] rounded-2xl border border-white/[0.06] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-white/[0.06]">
                              <th className="text-left px-5 py-3.5 text-[10px] font-bold text-[rgba(232,228,221,0.35)] uppercase tracking-[0.08em] font-[family-name:var(--font-mono)]">Listing</th>
                              <th className="text-left px-5 py-3.5 text-[10px] font-bold text-[rgba(232,228,221,0.35)] uppercase tracking-[0.08em] font-[family-name:var(--font-mono)] hidden sm:table-cell">Status</th>
                              <th className="text-left px-5 py-3.5 text-[10px] font-bold text-[rgba(232,228,221,0.35)] uppercase tracking-[0.08em] font-[family-name:var(--font-mono)] hidden md:table-cell">Views</th>
                              <th className="text-right px-5 py-3.5 text-[10px] font-bold text-[rgba(232,228,221,0.35)] uppercase tracking-[0.08em] font-[family-name:var(--font-mono)]">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/[0.04]">
                            {listings.map(listing => (
                              <tr key={listing.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-5 py-4">
                                  <div className="font-semibold text-[var(--t-text)] line-clamp-1 group-hover:text-[var(--color-accent)] transition-colors">
                                    {listing.title?.en ?? (listing as unknown as Record<string, unknown>).title_en as string}
                                  </div>
                                  <div className="text-xs text-[rgba(232,228,221,0.35)] mt-0.5 font-[family-name:var(--font-mono)]">
                                    €{((listing.price ?? 0) / 100).toLocaleString()}
                                  </div>
                                </td>
                                <td className="px-5 py-4 hidden sm:table-cell">
                                  <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.04em]", statusColors[listing.status] ?? statusColors.draft)}>
                                    {listing.status.replace("_", " ")}
                                  </span>
                                </td>
                                <td className="px-5 py-4 text-[rgba(232,228,221,0.45)] hidden md:table-cell font-[family-name:var(--font-mono)] text-xs">
                                  {listing.view_count}
                                </td>
                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-1 justify-end">
                                    <Link href={`/${locale}/listings/${listing.id}`}
                                      className="p-2 rounded-xl hover:bg-white/[0.06] text-[rgba(232,228,221,0.30)] hover:text-[var(--t-text)] transition-all duration-200">
                                      <Eye size={14} />
                                    </Link>
                                    <button onClick={() => toggleStatus(listing)}
                                      className="p-2 rounded-xl hover:bg-white/[0.06] text-[rgba(232,228,221,0.30)] hover:text-[var(--color-accent-teal)] transition-all duration-200">
                                      {listing.status === "active" ? <Pause size={14} /> : <Play size={14} />}
                                    </button>
                                    <button onClick={() => deleteListing(listing.id)}
                                      className="p-2 rounded-xl hover:bg-[rgba(255,56,92,0.08)] text-[rgba(232,228,221,0.30)] hover:text-[var(--color-accent)] transition-all duration-200">
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ═══════ MESSAGES ═══════ */}
            {activeTab === "messages" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-[var(--t-text)] tracking-[-0.01em]">
                    Messages
                    <span className="ml-2 text-xs text-[rgba(232,228,221,0.30)] font-[family-name:var(--font-mono)]">({messages.length})</span>
                  </h2>
                  <Link href={`/${locale}/messages`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors">
                    <MessageCircle size={15} /> Open inbox
                  </Link>
                </div>
                {messages.length === 0 ? (
                  <div className="text-center py-16">
                    <Mail size={36} className="mx-auto text-[rgba(232,228,221,0.12)] mb-4" />
                    <p className="text-[var(--t-text)] font-semibold mb-1">No messages yet</p>
                    <p className="text-sm text-[rgba(232,228,221,0.35)]">When buyers contact you, their messages will appear here</p>
                  </div>
                ) : messages.map(m => (
                  <div key={m.id} className="bg-[var(--t-surface)] rounded-2xl border border-white/[0.06] overflow-hidden hover:border-white/[0.12] transition-all duration-200">
                    <div className="px-5 py-4 flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[rgba(255,56,92,0.08)] border border-[rgba(255,56,92,0.15)] flex items-center justify-center text-sm font-bold text-[var(--color-accent)] shrink-0">
                          {m.sender_name?.charAt(0) ?? "?"}
                        </div>
                        <div>
                          <div className="font-semibold text-[var(--t-text)] text-sm">{m.sender_name ?? "Buyer"}</div>
                          <div className="text-xs text-[rgba(232,228,221,0.35)]">{m.sender_email}</div>
                        </div>
                      </div>
                      <div className="text-[10px] text-[rgba(232,228,221,0.25)] shrink-0 font-[family-name:var(--font-mono)]">
                        {new Date(m.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="px-5 pb-4">
                      <div className="text-[10px] text-[rgba(232,228,221,0.30)] mb-2 uppercase tracking-[0.06em] font-[family-name:var(--font-mono)]">
                        Re: {m.listing_title ?? "General inquiry"}
                      </div>
                      <p className="text-sm text-[rgba(232,228,221,0.65)] bg-white/[0.03] border border-white/[0.04] rounded-xl p-4 leading-relaxed">{m.body}</p>
                      <div className="flex gap-2 mt-4">
                        <Link href={`/${locale}/messages`}
                          className="flex-1 text-center py-2.5 border border-white/[0.10] rounded-xl text-sm font-semibold text-[rgba(232,228,221,0.60)] hover:text-[var(--t-text)] hover:border-white/[0.20] hover:bg-white/[0.03] transition-all duration-200">
                          Reply in inbox
                        </Link>
                      </div>
                      {m.sender_email && <BuyerNoteBox buyerEmail={m.sender_email} />}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ═══════ PROFILE ═══════ */}
            {activeTab === "profile" && (
              <div className="bg-[var(--t-surface)] rounded-2xl border border-white/[0.06] p-8 shadow-[0_8px_40px_rgba(0,0,0,0.3)]">
                <h2 className="font-bold text-[var(--t-text)] tracking-[-0.01em] font-[family-name:var(--font-display)] text-lg mb-6">Edit profile</h2>
                <div className="space-y-5">
                  <ImageUploader variant="cover" label="Cover photo" value={profileForm.cover_url} onChange={(url) => setProfileForm(f => ({ ...f, cover_url: url }))} />
                  <DField label="Business name">
                    <input type="text" className="input-dark"
                      value={profileForm.business_name} onChange={e => setProfileForm(f => ({ ...f, business_name: e.target.value }))} />
                  </DField>
                  <DField label="Bio (English)">
                    <textarea rows={4} className="input-dark !h-auto py-3 resize-none"
                      value={profileForm.bio_en} onChange={e => setProfileForm(f => ({ ...f, bio_en: e.target.value }))} />
                  </DField>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <DField label="City">
                      <input type="text" className="input-dark"
                        value={profileForm.location_city} onChange={e => setProfileForm(f => ({ ...f, location_city: e.target.value }))} />
                    </DField>
                    <DField label="Phone">
                      <input type="tel" className="input-dark"
                        value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} />
                    </DField>
                  </div>
                  <DField label="Approval number">
                    <input type="text" className="input-dark font-[family-name:var(--font-mono)] tracking-wider"
                      value={profileForm.approval_number} onChange={e => setProfileForm(f => ({ ...f, approval_number: e.target.value }))} />
                  </DField>
                  <button onClick={saveProfile} disabled={profileSaving}
                    className="px-7 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-40 text-white font-bold rounded-2xl text-sm transition-all duration-200 hover:shadow-[0_8px_24px_rgba(255,56,92,0.35)] hover:-translate-y-0.5 active:translate-y-0">
                    {profileSaving ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </div>
            )}

            {/* ═══════ SUBSCRIPTION ═══════ */}
            {activeTab === "subscription" && (
              <div className="space-y-5">
                <div className="bg-[var(--t-surface)] rounded-2xl border border-white/[0.06] overflow-hidden">
                  <div className="px-6 py-5 border-b border-white/[0.06]">
                    <h2 className="font-bold text-[var(--t-text)] tracking-[-0.01em] font-[family-name:var(--font-display)]">Current plan</h2>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between p-5 bg-[rgba(184,150,12,0.06)] border border-[rgba(184,150,12,0.15)] rounded-2xl mb-5">
                      <div>
                        <div className="font-bold text-[var(--color-accent-gold)] text-lg font-[family-name:var(--font-display)] tracking-[-0.02em]">Breeder {tierLabel("seller", sellerTier)}</div>
                        <div className="text-sm text-[rgba(232,228,221,0.45)]">
                          {sellerPlan(sellerTier).monthly === 0 ? "Free" : `€${sellerPlan(sellerTier).monthly}/mo`} · {sellerPlan(sellerTier).sd_fee}% Safe Deal fee · {sellerPlan(sellerTier).boosts} boost{sellerPlan(sellerTier).boosts !== 1 ? "s" : ""}/mo
                        </div>
                      </div>
                      <span className="badge badge-gold">Active</span>
                    </div>
                    {sellerTier < 2 && (
                      <Link href={`/${locale}/account`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-bold rounded-2xl text-sm transition-all duration-200 hover:shadow-[0_8px_24px_rgba(255,56,92,0.35)] hover:-translate-y-0.5">
                        <TrendingUp size={15} /> Upgrade to Breeder {tierLabel("seller", sellerTier + 1)}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
