import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Search, MessageCircle, Home, FileCheck, Upload, Users, ArrowRight, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

type Step = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

function Column({ label, steps }: { label: string; steps: Step[] }) {
  return (
    <div>
      <div className="badge badge-accent mb-6">{label}</div>
      <div className="space-y-5">
        {steps.map(({ icon: Icon, title, desc }, i) => (
          <div key={title} className="flex gap-4 rounded-2xl border border-[var(--t-border)] bg-[var(--t-surface)] p-5">
            <div className="relative shrink-0">
              <div className="w-11 h-11 rounded-xl bg-[rgba(255,56,92,0.10)] border border-[rgba(255,56,92,0.15)] flex items-center justify-center text-[var(--color-accent)]">
                <Icon size={18} />
              </div>
              <span className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-[var(--color-accent)] text-white text-[10px] font-bold flex items-center justify-center font-[family-name:var(--font-mono)]">{i + 1}</span>
            </div>
            <div>
              <p className="font-bold text-[var(--t-text)] mb-1">{title}</p>
              <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed font-[family-name:var(--font-body)]">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function HowItWorksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });

  const buyerSteps: Step[] = [
    { icon: Search, title: t("howItWorks.buyerStep1Title"), desc: t("howItWorks.buyerStep1Desc") },
    { icon: MessageCircle, title: t("howItWorks.buyerStep2Title"), desc: t("howItWorks.buyerStep2Desc") },
    { icon: Home, title: t("howItWorks.buyerStep3Title"), desc: t("howItWorks.buyerStep3Desc") },
  ];
  const sellerSteps: Step[] = [
    { icon: FileCheck, title: t("howItWorks.sellerStep1Title"), desc: t("howItWorks.sellerStep1Desc") },
    { icon: Upload, title: t("howItWorks.sellerStep2Title"), desc: t("howItWorks.sellerStep2Desc") },
    { icon: Users, title: t("howItWorks.sellerStep3Title"), desc: t("howItWorks.sellerStep3Desc") },
  ];

  return (
    <div className="bg-[var(--t-bg)] min-h-screen">
      <PageHeader
        eyebrow="How it works"
        title={t("howItWorks.title")}
        subtitle={t("why.subtitle")}
        align="center"
        crumbs={[{ label: "PawTrust", href: `/${locale}` }, { label: "How it works" }]}
      />
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 py-12 lg:py-16">
        <div className="grid md:grid-cols-2 gap-10">
          <Column label={t("howItWorks.buyer")} steps={buyerSteps} />
          <Column label={t("howItWorks.seller")} steps={sellerSteps} />
        </div>

        <div className="mt-14 flex flex-wrap gap-3">
          <Link href={`/${locale}/search`} className="btn-primary inline-flex items-center gap-2">{t("featured.explore")} <ArrowRight size={15} /></Link>
          <Link href={`/${locale}/become-a-seller`} className="btn-secondary inline-flex items-center gap-2">{t("breeders.cta")}</Link>
        </div>
      </div>
    </div>
  );
}
