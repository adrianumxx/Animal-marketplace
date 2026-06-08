import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Toaster } from "sonner";
import { routing } from "@/i18n/routing";
import { AuthNavbar } from "@/components/layout/auth-navbar";
import { Footer } from "@/components/layout/footer";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "fr" | "nl")) {
    notFound();
  }

  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: "common" });

  return (
    <NextIntlClientProvider messages={messages}>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "var(--t-surface)",
            border: "1px solid var(--t-border)",
            color: "var(--t-text)",
          },
        }}
      />
      <AuthNavbar
        locale={locale}
        t={{
          browse: t("nav.browse"),
          breeders: t("nav.breeders"),
          shelters: t("nav.shelters"),
          vets: t("nav.vets"),
          pricing: t("nav.pricing"),
          login: t("nav.login"),
          register: t("nav.register"),
          dashboard: t("nav.dashboard"),
          logout: t("nav.logout"),
        }}
      />
      <main className="pt-16 min-h-screen">{children}</main>
      <Footer
        locale={locale}
        t={{
          tagline: t("footer.tagline"),
          marketplace: t("footer.marketplace"),
          browse: t("footer.browse"),
          breeders: t("footer.breeders"),
          shelters: t("footer.shelters"),
          vets: t("footer.vets"),
          pricing: t("footer.pricing"),
          sellers: t("footer.sellers"),
          becomeSeller: t("footer.becomeSeller"),
          dashboard: t("footer.dashboard"),
          howItWorks: t("footer.howItWorks"),
          legal: t("footer.legal"),
          privacy: t("footer.privacy"),
          terms: t("footer.terms"),
          gdpr: t("footer.gdpr"),
          cookies: t("footer.cookies"),
          rights: t("footer.rights"),
          gdprNote: t("footer.gdprNote"),
          euWelfare: t("footer.euWelfare"),
        }}
      />
    </NextIntlClientProvider>
  );
}
