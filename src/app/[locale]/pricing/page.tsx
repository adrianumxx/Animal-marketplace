import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Check, Shield } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { sellerPlan, tierLabel } from "@/lib/plans";

interface PricingPageProps {
  params: Promise<{ locale: string }>;
}

export default async function PricingPage({ params }: PricingPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricing" });

  const tierMeta: { desc: string; features: string[] }[] = [
    { desc: "For occasional sellers getting started", features: ["Verified breeder profile", "Buyer messaging & inquiries", "Reviews & ratings"] },
    { desc: "For breeders growing their business", features: ["Everything in Free", "Monthly featured boost", "Lead dashboard", "Priority listing review"] },
    { desc: "For full-scale professional kennels", features: ["Everything in Pro", "Advanced analytics", "Premium profile placement", "Priority support"] },
  ];
  const plans = [0, 1, 2].map((tier) => {
    const p = sellerPlan(tier);
    return {
      name: `Breeder ${tierLabel("seller", tier)}`,
      price: String(p.monthly),
      desc: tierMeta[tier].desc,
      features: [`${p.sd_fee}% Safe Deal fee`, `${p.boosts} boost${p.boosts !== 1 ? "s" : ""}/month`, ...tierMeta[tier].features],
      cta: tier === 0 ? "Start free" : `Choose ${tierLabel("seller", tier)}`,
      href: `/${locale}/become-a-seller`,
      highlighted: tier === 1,
      badge: tier === 1 ? t("mostPopular") : undefined,
    };
  });

  const faqs = [
    { q: "Can I change plans at any time?", a: "Yes, you can upgrade or downgrade at any time from your dashboard. Changes take effect on your next billing date." },
    { q: "Is there a free trial?", a: "Better — the Free plan is permanent. Start selling at no cost and upgrade to Pro or Elite as your breeding business grows." },
    { q: "What payment methods do you accept?", a: "We accept all major credit cards, iDEAL, Bancontact, and SEPA bank transfers through our secure Stripe payment system." },
    { q: "Can I cancel at any time?", a: "Yes, you can cancel at any time from your dashboard. Your access continues until the end of your billing period." },
    { q: "How long does verification take?", a: "Our team reviews all applications within 24 hours. You'll receive an email once your account is verified." },
  ];

  return (
    <div className="min-h-screen bg-[var(--t-bg)]">

      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(255,56,92,0.12)_0%,transparent_70%)]" />
        <div className="absolute top-[30%] right-[-5%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(0,166,153,0.08)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10">
        <PageHeader eyebrow="Simple, transparent pricing" title={t("title")} subtitle={t("subtitle")} align="center" />
      </div>

      {/* ── Plans grid ───────────────────────────────────────────── */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-10 pb-20">
        <div className="grid md:grid-cols-3 gap-5 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-7 flex flex-col ${
                plan.highlighted
                  ? "bg-[var(--color-accent)] shadow-[0_8px_40px_rgba(255,56,92,0.30)] ring-1 ring-[var(--color-accent)]"
                  : "bg-[var(--t-surface)] border border-white/[0.06]"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[var(--t-text)] text-[var(--t-bg)] whitespace-nowrap shadow-sm">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h2 className={`text-lg font-bold mb-2 ${plan.highlighted ? "text-white" : "text-[var(--t-text)]"}`}>
                  {plan.name}
                </h2>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className={`text-4xl font-bold tracking-[-0.03em] font-[family-name:var(--font-mono)] ${plan.highlighted ? "text-white" : "text-[var(--t-text)]"}`}>
                    €{plan.price}
                  </span>
                  <span className={`text-sm ${plan.highlighted ? "text-white/70" : "text-[rgba(232,228,221,0.40)]"}`}>
                    {t("perMonth")}
                  </span>
                </div>
                <p className={`text-sm leading-relaxed ${plan.highlighted ? "text-white/80" : "text-[rgba(232,228,221,0.50)]"}`}>
                  {plan.desc}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <Check
                      size={15}
                      className={`shrink-0 mt-0.5 ${plan.highlighted ? "text-white" : "text-[var(--color-accent-teal)]"}`}
                    />
                    <span className={plan.highlighted ? "text-white/90" : "text-[rgba(232,228,221,0.60)]"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`w-full text-center py-3.5 rounded-xl font-semibold text-sm transition-all ${
                  plan.highlighted
                    ? "bg-white text-[var(--color-accent)] hover:bg-white/90 shadow-sm"
                    : "border border-white/[0.12] text-[var(--t-text)] hover:bg-white/[0.06] hover:border-white/[0.20]"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Trust note */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-10">
          {[
            "100% verified seller badge included",
            "Cancel anytime",
            "Prices exclude VAT",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-[rgba(232,228,221,0.40)]">
              <Shield size={13} className="text-[var(--color-accent-teal)]" />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <div className="relative z-10 border-t border-white/[0.06] py-16">
        <div className="max-w-2xl mx-auto px-6 sm:px-10">
          <h2 className="text-2xl font-bold text-[var(--t-text)] text-center mb-10 tracking-[-0.02em]">
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {faqs.map(({ q, a }) => (
              <div key={q} className="bg-[var(--t-surface)] rounded-2xl border border-white/[0.06] p-5">
                <h3 className="font-semibold text-[var(--t-text)] mb-2">{q}</h3>
                <p className="text-sm text-[rgba(232,228,221,0.45)] leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
