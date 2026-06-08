import { LegalPage } from "@/components/legal/legal-page";

export const metadata = { title: "Cookie Policy · PawTrust" };

export default async function CookiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <LegalPage
      locale={locale}
      title="Cookie Policy"
      updated="Last updated: June 2026"
      intro="This policy explains how PawTrust uses cookies and similar technologies, and how you can control them."
      sections={[
        { heading: "1. What cookies are", body: ["Cookies are small text files stored on your device that help the site function and remember your preferences."] },
        { heading: "2. Cookies we use", body: ["Essential: authentication, security and session management — required for the site to work.", "Preferences: language and theme (dark/light) selection.", "Analytics: aggregated, anonymised usage statistics to improve the product."] },
        { heading: "3. Managing cookies", body: ["You can accept or reject non-essential cookies via the consent banner, and change your choice at any time. You can also block cookies in your browser settings, though some features may stop working."] },
        { heading: "4. Contact", body: ["Questions about cookies? Email privacy@pawtrust.eu."] },
      ]}
    />
  );
}
