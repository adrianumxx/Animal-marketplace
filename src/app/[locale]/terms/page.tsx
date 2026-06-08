import { LegalPage } from "@/components/legal/legal-page";

export const metadata = { title: "Terms of Service · PawTrust" };

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <LegalPage
      locale={locale}
      title="Terms of Service"
      updated="Last updated: June 2026"
      intro="These terms govern your use of the PawTrust marketplace. By creating an account or using the platform you agree to them."
      sections={[
        { heading: "1. The service", body: ["PawTrust connects buyers with manually verified, licensed breeders across Belgium, Luxembourg and the Netherlands. We are a marketplace and are not a party to the sale between buyer and breeder."] },
        { heading: "2. Eligibility & accounts", body: ["You must be 18 or older. You are responsible for the accuracy of your account information and for activity under your account."] },
        { heading: "3. Seller obligations", body: ["Sellers must hold valid breeder approval numbers, provide accurate health documentation, and comply with all applicable EU and national animal-welfare law.", "Listings that misrepresent an animal or its provenance will be removed and the account suspended."] },
        { heading: "4. Prohibited conduct", body: ["No fraud, no sale of protected or trafficked species, no off-platform circumvention of verification, and no harassment of other users."] },
        { heading: "5. Liability", body: ["PawTrust provides verification in good faith but does not guarantee any transaction outcome. Liability is limited to the extent permitted by Belgian law."] },
        { heading: "6. Changes", body: ["We may update these terms; material changes will be notified in advance."] },
      ]}
    />
  );
}
