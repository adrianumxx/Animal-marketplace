"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Check, ShieldCheck, Lock, Zap, ArrowRight, Upload, Star, TrendingUp, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";
import { api, type AppUser } from "@/lib/api-client";
import { sellerPlan, tierLabel } from "@/lib/plans";

const BENEFITS = [
  { icon: ShieldCheck, title: "Verified trust layer", desc: "Manual verification + health docs build buyer confidence — and convert." },
  { icon: TrendingUp, title: "Real buyer demand", desc: "Reach serious, verified buyers across Belgium, Luxembourg and the Netherlands." },
  { icon: Upload, title: "Publish in minutes", desc: "A guided wizard: photos, health info, price — submitted for quick review." },
  { icon: Star, title: "Build your reputation", desc: "Verified reviews and a public breeder profile that grows your business." },
];

const TRUST = [
  { icon: Lock, label: "SSL encrypted" },
  { icon: ShieldCheck, label: "GDPR compliant" },
  { icon: Zap, label: "24h review" },
  { icon: Check, label: "EU Welfare" },
];

export default function BecomeASellerPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [stats, setStats] = useState<{ listings: number; breeders: number; vets: number } | null>(null);

  useEffect(() => {
    api.auth.me().then(setUser).catch(() => setUser(null)).finally(() => setReady(true));
    api.stats.get().then(setStats).catch(() => {});
  }, []);

  const isSeller = (user?.capabilities ?? []).includes("seller");

  const startSelling = async () => {
    if (!user) { router.push(`/${locale}/register`); return; }
    if (isSeller) { router.push(`/${locale}/dashboard`); return; }
    setBusy(true);
    try {
      await api.account.become({ capability: "seller", breeder: true });
      const cur = JSON.parse(localStorage.getItem("pt_user") || "{}");
      localStorage.setItem("pt_user", JSON.stringify({ ...cur, capabilities: [...(cur.capabilities ?? []), "seller"] }));
      toast.success("You're now a seller — let's create your first listing.");
      router.push(`/${locale}/dashboard`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const ctaLabel = !ready ? "…" : !user ? "Create free seller account" : isSeller ? "Go to your dashboard" : "Start selling — free";

  const tiers = [0, 1, 2].map((t) => ({ tier: t, label: tierLabel("seller", t), plan: sellerPlan(t) }));

  return (
    <div className="min-h-screen bg-[var(--t-bg)]">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-16 pt-28 pb-16">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 xl:gap-20 items-start">

          {/* Left — marketing */}
          <div className="lg:sticky lg:top-28">
            <div className="badge badge-accent mb-5">For breeders & sellers</div>
            <h1 className="text-4xl xl:text-5xl font-black text-[var(--t-text)] leading-[1.05] tracking-[-0.03em] mb-5">
              Sell animals with trust, review and real demand.
            </h1>
            <p className="text-[var(--t-text-secondary)] text-lg leading-relaxed max-w-md mb-8 font-[family-name:var(--font-body)]">
              Create a verified seller profile, list in minutes, and reach serious buyers across Benelux. Free to start.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-8 max-w-md">
              {[[String(stats?.breeders ?? "—"), "Verified breeders"], [String(stats?.listings ?? "—"), "Active listings"], [String(stats?.vets ?? "—"), "Partner vets"], ["24h", "Review time"]].map(([n, l]) => (
                <div key={l} className="rounded-2xl border border-[var(--t-border)] bg-[var(--t-surface)] p-4">
                  <div className="text-2xl font-black text-[var(--t-text)] tracking-[-0.03em]">{n}</div>
                  <div className="text-xs text-[var(--t-text-muted)] mt-0.5 font-[family-name:var(--font-mono)] uppercase tracking-[0.04em]">{l}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {TRUST.map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-1.5 text-xs text-[var(--t-text-muted)]"><Icon size={13} className="text-[var(--color-accent-teal)]" /> {label}</span>
              ))}
            </div>
          </div>

          {/* Right — benefits + plans + CTA */}
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              {BENEFITS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-2xl border border-[var(--t-border)] bg-[var(--t-surface)] p-5">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(255,56,92,0.10)] border border-[rgba(255,56,92,0.15)] flex items-center justify-center text-[var(--color-accent)] mb-3"><Icon size={18} /></div>
                  <p className="font-bold text-[var(--t-text)] text-sm mb-1">{title}</p>
                  <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed font-[family-name:var(--font-body)]">{desc}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-[var(--t-border)] bg-[var(--t-surface)] p-6">
              <h2 className="font-bold text-[var(--t-text)] mb-4">Plans</h2>
              <div className="space-y-2.5">
                {tiers.map(({ tier, label, plan }) => (
                  <div key={tier} className="flex items-center justify-between rounded-xl border border-[var(--t-border)] px-4 py-3">
                    <div>
                      <span className="font-bold text-[var(--t-text)] text-sm">Breeder {label}</span>
                      <span className="text-xs text-[var(--t-text-muted)] ml-2">{plan.sd_fee}% Safe Deal · {plan.boosts} boost{plan.boosts !== 1 ? "s" : ""}/mo</span>
                    </div>
                    <span className="font-black text-[var(--t-text)] font-[family-name:var(--font-mono)]">{plan.monthly === 0 ? "Free" : `€${plan.monthly}/mo`}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[var(--t-text-muted)] mt-3">Start free. Upgrade to Pro/Elite anytime from your dashboard.</p>
            </div>

            <button onClick={startSelling} disabled={busy || !ready}
              className="btn-primary w-full py-4 text-base disabled:opacity-60 inline-flex items-center justify-center gap-2">
              {isSeller && ready ? <LayoutDashboard size={17} /> : null}
              {busy ? "Setting up…" : ctaLabel}
              {!isSeller && ready ? <ArrowRight size={17} /> : null}
            </button>
            <p className="text-center text-xs text-[var(--t-text-muted)]">No credit card required to start.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
