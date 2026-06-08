import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin, Star } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { getSpeciesPage } from "@/lib/public-data";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getSpeciesPage(slug);
  const name = data?.species.name.en ?? slug;
  return {
    title: `${name} for sale in Belgium, Netherlands & Luxembourg`,
    description: `Browse verified ${name.toLowerCase()} from manually verified breeders across Benelux. Health-certified, documented, scam-free on PawTrust.`,
  };
}

export default async function SpeciesPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const data = await getSpeciesPage(slug);
  if (!data) notFound();
  const { species, breeds, listings } = data;
  const tx = (o: Record<string, string>) => o[locale] || o.en;

  return (
    <div className="min-h-screen bg-[var(--t-bg)]">
      <PageHeader
        eyebrow="Verified breeders"
        title={`${tx(species.name)} for sale in Benelux`}
        subtitle={`Verified ${tx(species.name).toLowerCase()} from licensed, manually verified breeders across Belgium, Luxembourg and the Netherlands.`}
        crumbs={[{ label: "PawTrust", href: `/${locale}` }, { label: "Browse", href: `/${locale}/search` }, { label: tx(species.name) }]}
      />

      <div className="max-w-[1760px] mx-auto px-6 sm:px-10 lg:px-20 py-10">
        {breeds.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {breeds.map((b) => (
              <Link key={b.slug} href={`/${locale}/breeds/${b.slug}`} className="px-3.5 py-1.5 rounded-full text-sm font-semibold border border-[var(--t-border)] text-[var(--t-text-secondary)] hover:border-[rgba(255,56,92,0.35)] hover:text-[var(--color-accent)] transition-colors">
                {tx(b.name)}
              </Link>
            ))}
          </div>
        )}
        <p className="text-sm text-[var(--t-text-muted)] mb-6 font-[family-name:var(--font-mono)]">{listings.length} available</p>
        {listings.length === 0 ? (
          <p className="text-[var(--t-text-secondary)]">No {tx(species.name).toLowerCase()} listed right now. <Link href={`/${locale}/search`} className="text-[var(--color-accent)]">Browse all animals</Link>.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {listings.map((l) => (
              <Link key={l.id} href={`/${locale}/listings/${l.id}`} className="listing-card group block bg-[var(--t-surface)] border border-white/[0.06] rounded-2xl overflow-hidden">
                <div className="relative aspect-[4/3] overflow-hidden bg-[var(--t-elevated)]">
                  <Image src={l.images[0].url} alt={tx(l.breed.name)} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width:640px) 100vw, 25vw" />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-[var(--t-text)] text-sm line-clamp-1">{tx(l.breed.name)}</p>
                    <span className="flex items-center gap-1 text-xs shrink-0"><Star size={11} className="fill-[var(--color-accent)] text-[var(--color-accent)]" /> {l.seller.rating}</span>
                  </div>
                  <p className="text-xs text-[var(--t-text-muted)] mt-1 flex items-center gap-1"><MapPin size={11} /> {l.location_city}, {l.location_country}</p>
                  <p className="mt-2 font-black text-[var(--t-text)] font-[family-name:var(--font-mono)]">€{(l.price / 100).toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
