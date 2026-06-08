import { connectDB, hasMongoConfig } from "@/lib/mongodb";
import { Listing, SellerProfile, ShelterProfile, VetProfile, Species, Breed, Review } from "@/lib/models";

async function reviewsFor(filter: Record<string, unknown>) {
  const rows = await Review.find(filter).sort({ created_at: -1 }).limit(50)
    .populate({ path: "reviewer_id", select: "full_name" }).lean();
  return rows.map((r) => ({
    id: String((r as Record<string, unknown>)._id),
    rating: Number(r.rating ?? 0),
    title: (r.title as string) ?? "",
    body: (r.body as string) ?? "",
    reviewer: { full_name: ((r.reviewer_id as { full_name?: string })?.full_name) ?? "Buyer" },
    created_at: r.created_at as string,
  }));
}

type JsonRecord = Record<string, unknown>;
type LocalizedText = Record<string, string>;

function localized(value: unknown, fallback: string): LocalizedText {
  if (value && typeof value === "object") {
    const v = value as LocalizedText;
    if (v.en || v.fr || v.nl) return { en: v.en || fallback, fr: v.fr || fallback, nl: v.nl || fallback };
  }
  return { en: fallback, fr: fallback, nl: fallback };
}

function images(value: unknown) {
  return Array.isArray(value) && value.length > 0
    ? value
    : [{ url: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=900&h=700&fit=crop", is_primary: true }];
}

function formatListing(row: JsonRecord) {
  const species = (row.species_id as JsonRecord) ?? {};
  const breed = (row.breed_id as JsonRecord) ?? {};
  const shelter = (row.shelter_id as JsonRecord) ?? {};
  // Adoption listings are owned by a shelter; map it into the seller display shape.
  const seller = (row.seller_id as JsonRecord) ?? (shelter._id
    ? { _id: shelter._id, business_name: shelter.organization_name, slug: shelter.slug, verification_status: shelter.verification_status, rating: shelter.rating, review_count: shelter.review_count, location_city: shelter.location_city, location_country: shelter.location_country, badge_level: "basic" }
    : {});
  const speciesSlug = String(species.slug ?? "");
  const breedName = localized(breed.name, "Unknown breed");

  return {
    id: String(row._id ?? ""),
    title: localized(row.title, breedName.en),
    description: localized(row.description, ""),
    price: Number(row.price ?? 0),
    price_negotiable: Boolean(row.price_negotiable),
    gender: row.gender === "female" ? "female" : "male",
    age_weeks: Number(row.age_weeks ?? 0),
    color: String(row.color ?? ""),
    microchip_number: (row.microchip_number as string | null) ?? null,
    passport_number: (row.passport_number as string | null) ?? null,
    vaccinated: Boolean(row.vaccinated),
    dewormed: Boolean(row.dewormed),
    vet_checked: Boolean(row.vet_checked),
    pedigree: Boolean(row.pedigree),
    pedigree_organization: (row.pedigree_organization as string | null) ?? null,
    ready_date: (row.ready_date as string | null) ?? null,
    location_city: String(row.location_city ?? ""),
    location_country: String(row.location_country ?? ""),
    status: String(row.status ?? "active"),
    is_featured: Boolean(row.is_featured),
    listing_type: row.listing_type === "adoption" ? "adoption" : "sale",
    owner_capability: row.owner_capability === "shelter" ? "shelter" : "seller",
    view_count: Number(row.view_count ?? 0),
    inquiry_count: Number(row.inquiry_count ?? 0),
    images: images(row.images),
    documents: Array.isArray(row.documents) ? row.documents : [],
    species: { id: String(species._id ?? ""), slug: speciesSlug, name: localized(species.name, speciesSlug) },
    breed: {
      id: String(breed._id ?? ""),
      slug: String(breed.slug ?? ""),
      name: breedName,
      size: breed.size ?? null,
      energy_level: breed.energy_level ?? null,
      good_with_kids: Boolean(breed.good_with_kids),
      good_with_other_pets: Boolean(breed.good_with_other_pets),
      hypoallergenic: Boolean(breed.hypoallergenic),
    },
    seller: {
      id: String(seller._id ?? row.seller_id ?? ""),
      business_name: String(seller.business_name ?? "Verified breeder"),
      slug: String(seller.slug ?? ""),
      verification_status: String(seller.verification_status ?? "pending"),
      rating: Number(seller.rating ?? 0),
      review_count: Number(seller.review_count ?? 0),
      total_sales: Number(seller.total_sales ?? 0),
      years_experience: Number(seller.years_experience ?? 0),
      badge_level: String(seller.badge_level ?? "basic"),
      location_city: String(seller.location_city ?? row.location_city ?? ""),
      location_country: String(seller.location_country ?? row.location_country ?? ""),
      response_rate: Number(seller.response_rate ?? 100),
      response_time_hours: Number(seller.response_time_hours ?? 24),
      avatar_url: seller.avatar_url ?? null,
    },
  };
}

export type PublicListing = ReturnType<typeof formatListing>;

async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!hasMongoConfig()) return fallback;
  try {
    await connectDB();
    return await fn();
  } catch (error) {
    console.warn("Mongo public query skipped:", error);
    return fallback;
  }
}

const POPULATE = [
  { path: "species_id" },
  { path: "breed_id" },
  { path: "seller_id" },
  { path: "shelter_id" },
];

export async function getFeaturedListings(limit = 8): Promise<PublicListing[]> {
  return safeQuery(async () => {
    const rows = await Listing.find({ status: "active", listing_type: "sale" })
      .sort({ is_featured: -1, created_at: -1 })
      .limit(limit)
      .populate(POPULATE)
      .lean();
    return rows.map((r) => formatListing(r as JsonRecord));
  }, []);
}

export async function getVerifiedShelters(limit = 24) {
  return safeQuery(async () => {
    const rows = await ShelterProfile.find({ verification_status: "verified" })
      .sort({ rating: -1 })
      .limit(limit)
      .lean();
    return rows.map((s) => ({
      ...s,
      id: String((s as JsonRecord)._id),
      rating: Number(s.rating ?? 0),
      review_count: Number(s.review_count ?? 0),
    }));
  }, []);
}

export async function getShelterBySlug(slug: string) {
  return safeQuery(async () => {
    const shelter = await ShelterProfile.findOne({ slug, verification_status: "verified" }).lean<JsonRecord>();
    if (!shelter) return null;
    const listings = await Listing.find({ shelter_id: shelter._id, status: "active", listing_type: "adoption" })
      .sort({ created_at: -1 })
      .populate(POPULATE)
      .lean();
    return {
      shelter: { ...shelter, id: String(shelter._id) },
      listings: listings.map((r) => formatListing(r as JsonRecord)),
    };
  }, null);
}

export async function getSpeciesList(): Promise<{ slug: string; name: LocalizedText }[]> {
  return safeQuery(async () => {
    const rows = await Species.find().sort({ slug: 1 }).lean();
    return rows.map((s) => ({ slug: String(s.slug), name: localized(s.name, String(s.slug)) }));
  }, []);
}

export async function getSpeciesPage(slug: string) {
  return safeQuery(async () => {
    const species = await Species.findOne({ slug }).lean<JsonRecord>();
    if (!species) return null;
    const [breeds, listings] = await Promise.all([
      Breed.find({ species_id: species._id }).sort({ slug: 1 }).lean(),
      Listing.find({ species_id: species._id, status: "active", listing_type: "sale" })
        .sort({ is_featured: -1, created_at: -1 }).limit(24).populate(POPULATE).lean(),
    ]);
    return {
      species: { slug: String(species.slug), name: localized(species.name, slug) },
      breeds: breeds.map((b) => ({ slug: String(b.slug), name: localized(b.name, String(b.slug)) })),
      listings: listings.map((r) => formatListing(r as JsonRecord)),
    };
  }, null);
}

export async function getBreedPage(slug: string) {
  return safeQuery(async () => {
    const breed = await Breed.findOne({ slug }).populate({ path: "species_id", select: "slug name" }).lean<JsonRecord>();
    if (!breed) return null;
    const species = (breed.species_id as JsonRecord) ?? {};
    const listings = await Listing.find({ breed_id: breed._id, status: "active", listing_type: "sale" })
      .sort({ is_featured: -1, created_at: -1 }).limit(24).populate(POPULATE).lean();
    return {
      breed: {
        slug: String(breed.slug), name: localized(breed.name, slug),
        size: breed.size ?? null, energy_level: breed.energy_level ?? null,
        good_with_kids: Boolean(breed.good_with_kids), good_with_other_pets: Boolean(breed.good_with_other_pets),
        hypoallergenic: Boolean(breed.hypoallergenic),
      },
      species: { slug: String(species.slug ?? ""), name: localized(species.name, "") },
      listings: listings.map((r) => formatListing(r as JsonRecord)),
    };
  }, null);
}

export async function getBreedSlugs(): Promise<string[]> {
  return safeQuery(async () => (await Breed.find().select("slug").lean()).map((b) => String(b.slug)), []);
}

export async function getAdoptionListings(limit = 24): Promise<PublicListing[]> {
  return safeQuery(async () => {
    const rows = await Listing.find({ status: "active", listing_type: "adoption" })
      .sort({ is_featured: -1, created_at: -1 })
      .limit(limit)
      .populate(POPULATE)
      .lean();
    return rows.map((r) => formatListing(r as JsonRecord));
  }, []);
}

export async function getListingDetail(id: string): Promise<PublicListing | null> {
  return safeQuery(async () => {
    if (!/^[a-f0-9]{24}$/i.test(id)) return null;
    const row = await Listing.findOne({ _id: id, status: "active" }).populate(POPULATE).lean();
    return row ? formatListing(row as JsonRecord) : null;
  }, null);
}

export async function getPlatformStats() {
  return safeQuery(async () => {
    const [listings, breeders, shelters, vets] = await Promise.all([
      Listing.countDocuments({ status: "active" }),
      SellerProfile.countDocuments({ verification_status: "verified", has_breeder_profile: true }),
      ShelterProfile.countDocuments({ verification_status: "verified" }),
      VetProfile.countDocuments({ verification_status: "verified" }),
    ]);
    return { listings, breeders, shelters, vets };
  }, { listings: 0, breeders: 0, shelters: 0, vets: 0 });
}

export async function getSimilarListings(speciesSlug: string, excludeId: string, limit = 2): Promise<PublicListing[]> {
  return safeQuery(async () => {
    const rows = await Listing.find({ status: "active", _id: { $ne: excludeId } })
      .sort({ is_featured: -1, created_at: -1 })
      .populate(POPULATE)
      .lean();
    return rows
      .map((r) => formatListing(r as JsonRecord))
      .filter((l) => !speciesSlug || l.species.slug === speciesSlug)
      .slice(0, limit);
  }, []);
}

export async function getVerifiedSellers(limit = 24) {
  return safeQuery(async () => {
    const rows = await SellerProfile.find({ verification_status: "verified", has_breeder_profile: true })
      .sort({ rating: -1 })
      .limit(limit)
      .lean();
    return rows.map((s) => ({
      ...s,
      id: String((s as JsonRecord)._id),
      rating: Number(s.rating ?? 0),
      review_count: Number(s.review_count ?? 0),
      total_sales: Number(s.total_sales ?? 0),
      years_experience: Number(s.years_experience ?? 0),
      total_listings: Number(s.total_listings ?? 0),
      response_time_hours: Number(s.response_time_hours ?? 24),
      specialties: ["Verified breeder"],
    }));
  }, []);
}

export async function getCities(): Promise<string[]> {
  return safeQuery(async () => {
    const cities = await Listing.find({ status: "active" }).distinct("location_city");
    return (cities as string[]).filter(Boolean).sort();
  }, []);
}

export async function getSellerBySlug(slug: string) {
  return safeQuery(async () => {
    const seller = await SellerProfile.findOne({ slug, verification_status: "verified" }).lean<JsonRecord>();
    if (!seller) return null;
    const listings = await Listing.find({ seller_id: seller._id, status: "active", listing_type: "sale" })
      .sort({ is_featured: -1, created_at: -1 }).limit(24).populate(POPULATE).lean();
    return {
      seller: { ...seller, id: String(seller._id), rating: Number(seller.rating ?? 0), review_count: Number(seller.review_count ?? 0) },
      listings: listings.map((r) => formatListing(r as JsonRecord)),
      reviews: await reviewsFor({ seller_id: seller._id }),
    };
  }, null);
}

export async function getVetBySlug(slug: string) {
  return safeQuery(async () => {
    const vet = await VetProfile.findOne({ slug, verification_status: "verified" }).lean<JsonRecord>();
    if (!vet) return null;
    return { vet: { ...vet, id: String(vet._id), rating: Number(vet.rating ?? 0), review_count: Number(vet.review_count ?? 0) }, reviews: await reviewsFor({ vet_id: vet._id }) };
  }, null);
}

export async function getVerifiedVets(limit = 24) {
  return safeQuery(async () => {
    const rows = await VetProfile.find({ verification_status: "verified" })
      .sort({ rating: -1 })
      .limit(limit)
      .lean();
    return rows.map((v) => ({
      ...v,
      id: String((v as JsonRecord)._id),
      rating: Number(v.rating ?? 0),
      review_count: Number(v.review_count ?? 0),
      specializations: Array.isArray(v.specializations) ? v.specializations : [],
      languages: Array.isArray(v.languages) ? v.languages : [],
      telemedicine: Boolean(v.telemedicine),
      accepts_new_patients: Boolean(v.accepts_new_patients),
    }));
  }, []);
}
