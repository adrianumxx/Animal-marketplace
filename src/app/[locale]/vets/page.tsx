import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/page-header";
import { VetDirectory } from "@/components/vet/vet-directory";
import { getVerifiedVets } from "@/lib/public-data";

const MOCK_VETS = [
  { id: "v1", business_name: "Dr. Emma Vandenberghe", slug: "dr-emma-vandenberghe", location_city: "Brussels", location_country: "BE", rating: 4.9, review_count: 112, specializations: ["dogs", "cats", "exotic"], telemedicine: true, accepts_new_patients: true, languages: ["fr", "nl", "en"] },
  { id: "v2", business_name: "Animal Care Clinic", slug: "animal-care-clinic", location_city: "Antwerp", location_country: "BE", rating: 4.7, review_count: 78, specializations: ["dogs", "cats", "rabbits"], telemedicine: false, accepts_new_patients: true, languages: ["nl", "en"] },
  { id: "v3", business_name: "Dr. Pierre Lecomte", slug: "dr-pierre-lecomte", location_city: "Liège", location_country: "BE", rating: 4.8, review_count: 64, specializations: ["horses", "dogs"], telemedicine: true, accepts_new_patients: false, languages: ["fr", "en"] },
  { id: "v4", business_name: "Rotterdam Animal Hospital", slug: "rotterdam-animal-hospital", location_city: "Rotterdam", location_country: "NL", rating: 4.6, review_count: 94, specializations: ["dogs", "cats", "birds", "exotic"], telemedicine: true, accepts_new_patients: true, languages: ["nl", "en"] },
  { id: "v5", business_name: "Dr. Sophie Maes", slug: "dr-sophie-maes", location_city: "Ghent", location_country: "BE", rating: 4.9, review_count: 55, specializations: ["cats", "rabbits", "exotic"], telemedicine: false, accepts_new_patients: true, languages: ["nl", "fr", "en"] },
  { id: "v6", business_name: "Luxembourg Veterinary Center", slug: "luxembourg-vet-center", location_city: "Luxembourg City", location_country: "LU", rating: 4.5, review_count: 38, specializations: ["dogs", "cats"], telemedicine: true, accepts_new_patients: true, languages: ["fr", "de", "en"] },
];

interface VetsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function VetsPage({ params }: VetsPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "vet" });
  const supabaseVets = await getVerifiedVets();
  const vets = (supabaseVets.length > 0 ? supabaseVets : MOCK_VETS) as unknown as Parameters<typeof VetDirectory>[0]["vets"];

  return (
    <div className="min-h-screen bg-[var(--t-bg)]">
      <PageHeader
        eyebrow="Trusted partners"
        title={t("directory.title")}
        subtitle={t("directory.subtitle")}
        crumbs={[{ label: "PawTrust", href: `/${locale}` }, { label: "Vets" }]}
      />
      <VetDirectory vets={vets} locale={locale} />
    </div>
  );
}
