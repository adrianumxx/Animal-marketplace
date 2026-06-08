import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseJson, rateLimit } from "@/lib/api-guard";
import { getAuthUser, requirePermission } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Listing, Species, SellerProfile } from "@/lib/models";

const listingStatusSchema = z.enum(["draft", "pending_review", "active", "sold", "expired", "archived"]);
const oid = z.string().regex(/^[a-f0-9]{24}$/i);
const listingCreateSchema = z.object({
  species_id: oid,
  breed_id: oid.optional().nullable(),
  title_en: z.string().trim().min(2).max(180),
  title_fr: z.string().trim().max(180).optional().default(""),
  title_nl: z.string().trim().max(180).optional().default(""),
  description_en: z.string().trim().max(8000).optional().default(""),
  description_fr: z.string().trim().max(8000).optional().default(""),
  description_nl: z.string().trim().max(8000).optional().default(""),
  price: z.coerce.number().int().positive().max(100_000_000),
  price_negotiable: z.boolean().optional().default(false),
  gender: z.enum(["male", "female"]).optional().nullable(),
  age_weeks: z.coerce.number().int().min(0).max(2600).optional().nullable(),
  color: z.string().trim().max(80).optional().nullable(),
  microchip_number: z.string().trim().max(80).optional().nullable(),
  passport_number: z.string().trim().max(80).optional().nullable(),
  vaccinated: z.boolean().optional().default(false),
  dewormed: z.boolean().optional().default(false),
  vet_checked: z.boolean().optional().default(false),
  pedigree: z.boolean().optional().default(false),
  pedigree_organization: z.string().trim().max(120).optional().nullable(),
  ready_date: z.string().trim().max(40).optional().nullable(),
  location_city: z.string().trim().max(120).optional().nullable(),
  location_country: z.string().trim().min(2).max(3).optional().default("BE"),
  status: listingStatusSchema.optional().default("draft"),
  images: z.array(z.unknown()).optional().default([]),
  documents: z.array(z.unknown()).optional().default([]),
});

const POPULATE = [{ path: "species_id" }, { path: "breed_id" }, { path: "seller_id" }];

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    const sp = req.nextUrl.searchParams;

    const search = sp.get("search") ?? "";
    const species = sp.get("species") ?? "";
    const location = sp.get("location") ?? "";
    const minPrice = parseInt(sp.get("min_price") ?? "0") || 0;
    const maxPrice = parseInt(sp.get("max_price") ?? "0") || 0;
    const minAge = parseInt(sp.get("min_age") ?? "0") || 0;
    const maxAge = parseInt(sp.get("max_age") ?? "0") || 0;
    const gender = sp.get("gender") ?? "";
    const pedigree = sp.get("pedigree") === "true";
    const verified = sp.get("verified") === "true";
    const sellerId = sp.get("seller_id") ?? "";
    const type = sp.get("type") ?? "";
    const sort = sp.get("sort") ?? "newest";
    const page = Math.max(1, parseInt(sp.get("page") ?? "1") || 1);
    const pageSize = Math.min(50, parseInt(sp.get("page_size") ?? "20") || 20);

    const and: Record<string, unknown>[] = [];
    const filter: Record<string, unknown> = {};

    if (sellerId && /^[a-f0-9]{24}$/i.test(sellerId)) {
      const owner = await SellerProfile.findById(sellerId).select("user_id").lean<{ user_id: unknown }>();
      if (!user || String(owner?.user_id) !== user.userId) filter.status = "active";
      filter.seller_id = sellerId;
    } else {
      filter.status = "active";
    }

    if (species) {
      const s = await Species.findOne({ slug: species }).select("_id").lean<{ _id: unknown }>();
      filter.species_id = s?._id ?? null;
    }
    if (minPrice || maxPrice) filter.price = { ...(minPrice ? { $gte: minPrice } : {}), ...(maxPrice ? { $lte: maxPrice } : {}) };
    if (minAge || maxAge) filter.age_weeks = { ...(minAge ? { $gte: minAge } : {}), ...(maxAge ? { $lte: maxAge } : {}) };
    if (gender) filter.gender = gender;
    if (type === "sale" || type === "adoption") filter.listing_type = type;
    if (pedigree) filter.pedigree = true;
    if (verified) {
      const ids = await SellerProfile.find({ verification_status: "verified" }).distinct("_id");
      filter.seller_id = filter.seller_id ? filter.seller_id : { $in: ids };
    }
    if (location) and.push({ $or: [{ location_city: new RegExp(location, "i") }, { location_country: location.toUpperCase() }] });
    if (search) and.push({ $or: [{ "title.en": new RegExp(search, "i") }, { "description.en": new RegExp(search, "i") }] });
    if (and.length) filter.$and = and;

    const sortObj: Record<string, 1 | -1> =
      sort === "price_asc" ? { price: 1 } :
      sort === "price_desc" ? { price: -1 } :
      sort === "most_viewed" ? { view_count: -1 } : { created_at: -1 };

    const total = await Listing.countDocuments(filter);
    const rows = await Listing.find(filter)
      .sort(sortObj)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate(POPULATE)
      .lean();

    return NextResponse.json({
      listings: rows.map((r) => formatListing(r as JsonRecord)),
      total,
      page,
      page_size: pageSize,
      total_pages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(req, "listings:create", { limit: 30, windowMs: 60_000 });
    if (limited) return limited;

    let user;
    try {
      user = await requirePermission("create_sale_listing", req);
    } catch (e) {
      const m = e instanceof Error ? e.message : "Forbidden";
      return NextResponse.json({ error: m }, { status: m === "Unauthorized" ? 401 : 403 });
    }

    await connectDB();
    const seller = await SellerProfile.findOne({ user_id: user.userId }).select("_id").lean<{ _id: unknown }>();
    if (!seller) return NextResponse.json({ error: "Seller profile not found" }, { status: 404 });

    const parsed = await parseJson(req, listingCreateSchema);
    if (parsed instanceof NextResponse) return parsed;
    const p = parsed;
    const safeStatus = p.status === "active" ? "pending_review" : p.status;

    const created = await Listing.create({
      seller_id: seller._id,
      species_id: p.species_id,
      breed_id: p.breed_id || null,
      title: { en: p.title_en, fr: p.title_fr || p.title_en, nl: p.title_nl || p.title_en },
      description: { en: p.description_en, fr: p.description_fr || p.description_en, nl: p.description_nl || p.description_en },
      price: p.price,
      price_negotiable: p.price_negotiable,
      gender: p.gender || null,
      age_weeks: p.age_weeks ?? null,
      color: p.color || null,
      microchip_number: p.microchip_number || null,
      passport_number: p.passport_number || null,
      vaccinated: p.vaccinated,
      dewormed: p.dewormed,
      vet_checked: p.vet_checked,
      pedigree: p.pedigree,
      pedigree_organization: p.pedigree_organization || null,
      ready_date: p.ready_date || null,
      location_city: p.location_city || null,
      location_country: p.location_country,
      status: safeStatus,
      images: p.images,
      documents: p.documents,
    });

    const populated = await Listing.findById(created._id).populate(POPULATE).lean();
    return NextResponse.json({ listing: formatListing(populated as JsonRecord) }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

type JsonRecord = Record<string, unknown>;

function localized(value: unknown, fallback: string) {
  return (value as Record<string, string> | null | undefined) ?? { en: fallback, fr: fallback, nl: fallback };
}

export function formatListing(row: JsonRecord) {
  const species = (row.species_id as JsonRecord) ?? {};
  const breed = (row.breed_id as JsonRecord) ?? {};
  const seller = (row.seller_id as JsonRecord) ?? {};
  const speciesSlug = String(species.slug ?? "");

  return {
    ...row,
    id: String(row._id ?? ""),
    title: row.title ?? { en: "", fr: "", nl: "" },
    description: row.description ?? { en: "", fr: "", nl: "" },
    images: row.images ?? [],
    documents: row.documents ?? [],
    species: { id: String(species._id ?? ""), slug: species.slug, name: localized(species.name, speciesSlug) },
    breed: breed._id
      ? {
          id: String(breed._id),
          name: breed.name,
          size: breed.size,
          energy_level: breed.energy_level,
          good_with_kids: breed.good_with_kids,
          good_with_other_pets: breed.good_with_other_pets,
        }
      : null,
    seller: {
      id: String(seller._id ?? row.seller_id ?? ""),
      business_name: seller.business_name,
      slug: seller.slug,
      verification_status: seller.verification_status,
      rating: Number(seller.rating ?? 0),
      review_count: seller.review_count ?? 0,
      location_city: seller.location_city,
      location_country: seller.location_country,
      badge_level: seller.badge_level,
      response_time_hours: seller.response_time_hours,
      response_rate: seller.response_rate,
      total_sales: seller.total_sales,
      years_experience: seller.years_experience,
    },
  };
}
