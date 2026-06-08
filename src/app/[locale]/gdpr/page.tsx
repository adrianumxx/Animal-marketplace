import { LegalPage } from "@/components/legal/legal-page";

export const metadata = { title: "GDPR · PawTrust" };

export default async function GdprPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <LegalPage
      locale={locale}
      title="GDPR Compliance"
      updated="Last updated: June 2026"
      intro="PawTrust is built to comply with the EU General Data Protection Regulation. This page summarises how we protect your data and how to exercise your rights."
      sections={[
        { heading: "1. Your GDPR rights", body: ["Right of access, rectification, erasure, restriction, data portability, and the right to object. You can exercise any of these from your account settings or by emailing dpo@pawtrust.eu."] },
        { heading: "2. Data protection measures", body: ["Encryption in transit and at rest, least-privilege access controls, and regular security review of our infrastructure and processors."] },
        { heading: "3. Sub-processors", body: ["We use vetted EU-based hosting and infrastructure providers. A current list of sub-processors is available on request."] },
        { heading: "4. Data transfers", body: ["Personal data is stored within the EU. Any transfer outside the EEA is covered by Standard Contractual Clauses."] },
        { heading: "5. Breach notification", body: ["In the event of a data breach affecting your rights, we will notify the relevant supervisory authority and affected users within 72 hours."] },
        { heading: "6. Data Protection Officer", body: ["Contact our DPO at dpo@pawtrust.eu for any data-protection question or complaint."] },
      ]}
    />
  );
}
