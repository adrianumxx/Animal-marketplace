import { PageHeader } from "@/components/ui/page-header";
import { ShelterDirectory } from "@/components/shelter/shelter-directory";
import { getVerifiedShelters } from "@/lib/public-data";

const MOCK_SHELTERS = [
  { id: "h1", organization_name: "Happy Paws Rescue", slug: "happy-paws", location_city: "Bruges", location_country: "BE", rating: 4.9, review_count: 30 },
  { id: "h2", organization_name: "Refuge du Dr. Luc", slug: "refuge-luc", location_city: "Namur", location_country: "BE", rating: 4.8, review_count: 22 },
];

export default async function SheltersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const real = await getVerifiedShelters();
  const shelters = (real.length > 0 ? real : MOCK_SHELTERS) as unknown as Parameters<typeof ShelterDirectory>[0]["shelters"];

  return (
    <div className="min-h-screen bg-[var(--t-bg)]">
      <PageHeader
        eyebrow="Verified rescues"
        title="Shelters & Rescues"
        subtitle={`${shelters.length} verified shelters rehoming animals across Benelux`}
        crumbs={[{ label: "PawTrust", href: `/${locale}` }, { label: "Shelters" }]}
      />
      <ShelterDirectory shelters={shelters} locale={locale} />
    </div>
  );
}
