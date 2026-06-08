import { LegalPage } from "@/components/legal/legal-page";

export const metadata = { title: "Privacy Policy · PawTrust" };

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <LegalPage
      locale={locale}
      title="Privacy Policy"
      updated="Last updated: June 2026"
      intro="PawTrust BV respects your privacy. This policy explains what personal data we collect, why we collect it, and the rights you have under the EU General Data Protection Regulation (GDPR)."
      sections={[
        { heading: "1. Data we collect", body: ["Account data: name, email, phone, and role (buyer or breeder).", "Listing data: animal details, photos, health documents and location provided by sellers.", "Usage data: pages viewed, searches and device information collected to operate and improve the service."] },
        { heading: "2. How we use your data", body: ["To create and secure your account, connect buyers with verified breeders, process inquiries, prevent fraud, and comply with EU animal-welfare obligations.", "We never sell your personal data to third parties."] },
        { heading: "3. Legal basis", body: ["We process data on the basis of contract performance, your consent, and our legitimate interest in operating a trusted marketplace."] },
        { heading: "4. Your rights", body: ["You may access, correct, export or delete your data, and object to or restrict processing, at any time. Contact privacy@pawtrust.eu to exercise these rights."] },
        { heading: "5. Retention", body: ["We keep account data for as long as your account is active and as required by Belgian and EU law thereafter."] },
        { heading: "6. Contact", body: ["Data controller: PawTrust BV, Belgium. Email: privacy@pawtrust.eu."] },
      ]}
    />
  );
}
