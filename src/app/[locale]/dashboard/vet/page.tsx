"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Stethoscope, Eye, Video, UserCheck, ExternalLink, CalendarCheck, Clock } from "lucide-react";
import { toast } from "sonner";
import { ImageUploader } from "@/components/ui/image-uploader";
import { api, type AppUser, type VetProfileData } from "@/lib/api-client";

const DAYS: { wd: number; label: string }[] = [
  { wd: 1, label: "Monday" }, { wd: 2, label: "Tuesday" }, { wd: 3, label: "Wednesday" },
  { wd: 4, label: "Thursday" }, { wd: 5, label: "Friday" }, { wd: 6, label: "Saturday" }, { wd: 0, label: "Sunday" },
];
type DayHours = { enabled: boolean; open: string; close: string };

export default function VetDashboard() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const [profile, setProfile] = useState<VetProfileData | null>(null);
  const [form, setForm] = useState({ clinic_name: "", bio_en: "", location_city: "", phone: "", website_url: "", booking_url: "", services: "", specializations: "", languages: "", telemedicine: false, accepts_new_patients: true, avatar_url: "" });
  const [hours, setHours] = useState<Record<number, DayHours>>(() => Object.fromEntries(DAYS.map((d) => [d.wd, { enabled: false, open: "09:00", close: "18:00" }])));
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
        phone: p.phone ?? "", website_url: p.website_url ?? "", booking_url: p.booking_url ?? "",
        services: (p.services ?? []).join(", "), specializations: (p.specializations ?? []).join(", "),
        languages: (p.languages ?? []).join(", "), telemedicine: !!p.telemedicine, accepts_new_patients: p.accepts_new_patients !== false,
        avatar_url: p.avatar_url ?? "",
      });
      if (p.opening_hours?.length) {
        setHours((prev) => {
          const next = { ...prev };
          for (const h of p.opening_hours!) next[h.weekday] = { enabled: true, open: h.open, close: h.close };
          return next;
        });
      }
    }).catch(() => router.push(`/${locale}/account`));
  }, [locale, router]);

  const save = async () => {
    setSaving(true);
    const toArr = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
    try {
      await api.vetDash.update({
        clinic_name: form.clinic_name, bio_en: form.bio_en, location_city: form.location_city, phone: form.phone, website_url: form.website_url, booking_url: form.booking_url,
        services: toArr(form.services), specializations: toArr(form.specializations), languages: toArr(form.languages),
        telemedicine: form.telemedicine, accepts_new_patients: form.accepts_new_patients, avatar_url: form.avatar_url,
        opening_hours: DAYS.filter((d) => hours[d.wd].enabled).map((d) => ({ weekday: d.wd, open: hours[d.wd].open, close: hours[d.wd].close })),
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
          {([["In directory", "Verified & listed", Eye, "var(--color-accent-teal)"], ["Online booking", form.booking_url ? "Linked" : "Not set", CalendarCheck, "var(--color-accent)"], ["New patients", form.accepts_new_patients ? "Accepting" : "Closed", UserCheck, "var(--color-accent-gold)"]] as const).map(([label, val, Icon, c]) => (
            <div key={label} className="bg-[var(--t-surface)] rounded-2xl border border-[var(--t-border)] p-5">
              <Icon size={18} style={{ color: c }} className="mb-3" />
              <div className="text-lg font-bold text-[var(--t-text)]">{val}</div>
              <div className="text-xs text-[var(--t-text-muted)] mt-0.5 uppercase tracking-[0.04em] font-[family-name:var(--font-mono)]">{label}</div>
            </div>
          ))}
        </div>

        {/* Booking link */}
        <div className="bg-[var(--t-surface)] rounded-2xl border border-[var(--t-border)] p-8 space-y-3 mb-6">
          <h2 className="font-bold text-[var(--t-text)] flex items-center gap-2"><Video size={16} className="text-[var(--color-accent)]" /> Online booking & video consults</h2>
          <p className="text-sm text-[var(--t-text-muted)]">Paste the booking page you already use — Calendly, Doctolib, Outlook Bookings, Google, Zoom or your own page. A &quot;Book a meeting&quot; button will appear on your public profile.</p>
          <Field label="Booking link (URL)">
            <input className="input-dark" placeholder="https://calendly.com/your-clinic" value={form.booking_url} onChange={(e) => setForm((f) => ({ ...f, booking_url: e.target.value }))} />
          </Field>
          <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-50">{saving ? "Saving…" : "Save booking link"}</button>
        </div>

        {/* Opening hours */}
        <div className="bg-[var(--t-surface)] rounded-2xl border border-[var(--t-border)] p-8 space-y-3 mb-6">
          <h2 className="font-bold text-[var(--t-text)] flex items-center gap-2"><Clock size={16} className="text-[var(--color-accent)]" /> Opening hours</h2>
          <p className="text-sm text-[var(--t-text-muted)]">Shown on your public profile so clients know when you&apos;re open.</p>
          <div className="space-y-2 pt-1">
            {DAYS.map((d) => {
              const h = hours[d.wd];
              return (
                <div key={d.wd} className="flex items-center gap-3">
                  <label className="flex items-center gap-2 w-32 shrink-0 cursor-pointer">
                    <input type="checkbox" checked={h.enabled} onChange={(e) => setHours((p) => ({ ...p, [d.wd]: { ...p[d.wd], enabled: e.target.checked } }))} className="w-4 h-4 accent-[var(--color-accent)]" />
                    <span className="text-sm text-[var(--t-text-secondary)]">{d.label}</span>
                  </label>
                  {h.enabled ? (
                    <div className="flex items-center gap-2">
                      <input type="time" className="input-dark !h-9 !py-0 text-sm w-28" value={h.open} onChange={(e) => setHours((p) => ({ ...p, [d.wd]: { ...p[d.wd], open: e.target.value } }))} />
                      <span className="text-[var(--t-text-muted)]">–</span>
                      <input type="time" className="input-dark !h-9 !py-0 text-sm w-28" value={h.close} onChange={(e) => setHours((p) => ({ ...p, [d.wd]: { ...p[d.wd], close: e.target.value } }))} />
                    </div>
                  ) : <span className="text-sm text-[var(--t-text-muted)]">Closed</span>}
                </div>
              );
            })}
          </div>
          <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-50 mt-2">{saving ? "Saving…" : "Save hours"}</button>
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
