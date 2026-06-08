"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Stethoscope, Eye, Video, UserCheck, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { ImageUploader } from "@/components/ui/image-uploader";
import { api, type AppUser, type VetProfileData } from "@/lib/api-client";

export default function VetDashboard() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const [profile, setProfile] = useState<VetProfileData | null>(null);
  const [form, setForm] = useState({ clinic_name: "", bio_en: "", location_city: "", phone: "", website_url: "", services: "", specializations: "", languages: "", telemedicine: false, accepts_new_patients: true, avatar_url: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("pt_user");
    if (!stored) { router.push(`/${locale}/login`); return; }
    const u = JSON.parse(stored) as AppUser;
    if (!(u.capabilities ?? []).includes("vet") && u.role !== "admin") { router.push(`/${locale}/account`); return; }
    api.vetDash.me().then(({ profile: p }) => {
      setProfile(p);
      setForm({
        clinic_name: p.clinic_name ?? "", bio_en: p.bio?.en ?? "", location_city: p.location_city ?? "",
        phone: p.phone ?? "", website_url: p.website_url ?? "",
        services: (p.services ?? []).join(", "), specializations: (p.specializations ?? []).join(", "),
        languages: (p.languages ?? []).join(", "), telemedicine: !!p.telemedicine, accepts_new_patients: p.accepts_new_patients !== false,
        avatar_url: p.avatar_url ?? "",
      });
    }).catch(() => router.push(`/${locale}/account`));
  }, [locale, router]);

  const save = async () => {
    setSaving(true);
    const toArr = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
    try {
      await api.vetDash.update({
        clinic_name: form.clinic_name, bio_en: form.bio_en, location_city: form.location_city, phone: form.phone, website_url: form.website_url,
        services: toArr(form.services), specializations: toArr(form.specializations), languages: toArr(form.languages),
        telemedicine: form.telemedicine, accepts_new_patients: form.accepts_new_patients, avatar_url: form.avatar_url,
      });
      toast.success("Clinic profile saved");
    } catch (e) { toast.error((e as Error).message); } finally { setSaving(false); }
  };

  if (!profile) return <div className="bg-[var(--t-bg)] min-h-screen flex items-center justify-center"><div className="skeleton w-40 h-6" /></div>;

  return (
    <div className="min-h-screen bg-[var(--t-bg)]">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-10 py-8 pt-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-[var(--t-text)] tracking-[-0.02em]">{profile.clinic_name || "My clinic"}</h1>
            <p className="text-sm text-[var(--t-text-muted)]">Vet dashboard</p>
          </div>
          <Link href={`/${locale}/vets`} className="btn-secondary inline-flex items-center gap-2 text-sm"><ExternalLink size={15} /> View directory</Link>
        </div>

        {/* Status */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {([["In directory", "Verified & listed", Eye, "var(--color-accent-teal)"], ["Telemedicine", form.telemedicine ? "Enabled" : "Off", Video, "var(--color-accent)"], ["New patients", form.accepts_new_patients ? "Accepting" : "Closed", UserCheck, "var(--color-accent-gold)"]] as const).map(([label, val, Icon, c]) => (
            <div key={label} className="bg-[var(--t-surface)] rounded-2xl border border-[var(--t-border)] p-5">
              <Icon size={18} style={{ color: c }} className="mb-3" />
              <div className="text-lg font-bold text-[var(--t-text)]">{val}</div>
              <div className="text-xs text-[var(--t-text-muted)] mt-0.5 uppercase tracking-[0.04em] font-[family-name:var(--font-mono)]">{label}</div>
            </div>
          ))}
        </div>

        {/* Profile form */}
        <div className="bg-[var(--t-surface)] rounded-2xl border border-[var(--t-border)] p-8 space-y-5">
          <h2 className="font-bold text-[var(--t-text)] flex items-center gap-2"><Stethoscope size={16} className="text-[var(--color-accent)]" /> Clinic profile</h2>
          <ImageUploader variant="avatar" label="Clinic photo" value={form.avatar_url} onChange={(url) => setForm((f) => ({ ...f, avatar_url: url }))} />
          <Field label="Clinic name"><input className="input-dark" value={form.clinic_name} onChange={(e) => setForm((f) => ({ ...f, clinic_name: e.target.value }))} /></Field>
          <Field label="Bio"><textarea rows={3} className="input-dark !h-auto py-3 resize-none" value={form.bio_en} onChange={(e) => setForm((f) => ({ ...f, bio_en: e.target.value }))} /></Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="City"><input className="input-dark" value={form.location_city} onChange={(e) => setForm((f) => ({ ...f, location_city: e.target.value }))} /></Field>
            <Field label="Phone"><input className="input-dark" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></Field>
          </div>
          <Field label="Website"><input className="input-dark" value={form.website_url} onChange={(e) => setForm((f) => ({ ...f, website_url: e.target.value }))} /></Field>
          <Field label="Services (comma separated)"><input className="input-dark" value={form.services} onChange={(e) => setForm((f) => ({ ...f, services: e.target.value }))} placeholder="Consultation, Vaccination, Surgery" /></Field>
          <Field label="Specializations (comma separated)"><input className="input-dark" value={form.specializations} onChange={(e) => setForm((f) => ({ ...f, specializations: e.target.value }))} placeholder="Surgery, Dermatology" /></Field>
          <Field label="Languages (comma separated)"><input className="input-dark" value={form.languages} onChange={(e) => setForm((f) => ({ ...f, languages: e.target.value }))} placeholder="fr, nl, en" /></Field>
          <div className="flex flex-wrap gap-4">
            {([["telemedicine", "Offer telemedicine"], ["accepts_new_patients", "Accepting new patients"]] as const).map(([k, label]) => (
              <label key={k} className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.checked }))} className="w-4 h-4 accent-[var(--color-accent)]" />
                <span className="text-sm text-[var(--t-text-secondary)]">{label}</span>
              </label>
            ))}
          </div>
          <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-50">{saving ? "Saving…" : "Save changes"}</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><label className="text-xs font-semibold text-[var(--t-text-muted)] uppercase tracking-[0.06em] font-[family-name:var(--font-mono)]">{label}</label>{children}</div>;
}
