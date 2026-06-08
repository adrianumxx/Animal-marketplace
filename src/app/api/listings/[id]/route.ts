import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseJson, rateLimit } from "@/lib/api-guard";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Listing, RecentlyViewed } from "@/lib/models";
import { formatListing } from "../route";

const POPULATE = [{ path: "species_id" }, { path: "breed_id" }, { path: "seller_id" }];
const isOid = (id: string) => /^[a-f0-9]{24}$/i.test(id);

const listingUpdateSchema = z.object({
  price: z.coerce.number().int().positive().max(100_000_000).optional(),
  price_negotiable: z.boolean().optional(),
  gender: z.enum(["male", "female"]).optional().nullable(),
  age_weeks: z.coerce.number().int().min(0).max(2600).optional().nullable(),
  color: z.string().trim().max(80).optional().nullable(),
  microchip_number: z.string().trim().max(80).optional().nullable(),
  passport_number: z.string().trim().max(80).optional().nullable(),
  vaccinated: z.boolean().optional(),
  dewormed: z.boolean().optional(),
  vet_checked: z.boolean().optional(),
  pedigree: z.boolean().optional(),
  pedigree_organization: z.string().trim().max(120).optional().nullable(),
  ready_date: z.string().trim().max(40).optional().nullable(),
  location_city: z.string().trim().max(120).optional().nullable(),
  location_country: z.string().trim().min(2).max(3).optional(),
  breed_id: z.string().regex(/^[a-f0-9]{24}$/i).optional().nullable(),
  images: z.array(z.unknown()).optional(),
  documents: z.array(z.unknown()).optional(),
  title_en: z.string().trim().max(180).optional(),
  title_fr: z.string().trim().max(180).optional(),
  title_nl: z.string().trim().max(180).optional(),
  description_en: z.string().trim().max(8000).optional(),
  description_fr: z.string().trim().max(8000).optional(),
  description_nl: z.string().trim().max(8000).optional(),
  status: z.enum(["draft", "pending_review", "active", "sold", "expired", "archived"]).optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isOid(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const user = await getAuthUser(req);
    await connectDB();

    const doc = await Listing.findById(id).populate(POPULATE);
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const ownerUserId = String((doc.seller_id as { user_id?: unknown })?.user_id ?? "");
    if (doc.status !== "active" && (!user || ownerUserId !== user.userId)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await Listing.updateOne({ _id: id }, { $inc: { view_count: 1 } });

    // Per-customer memory: remember what this user viewed
    if (user) {
      await RecentlyViewed.updateOne(
        { user_id: user.userId, listing_id: id },
        { $set: { viewed_at: new Date() } },
        { upsert: true }
      );
    }

    return NextResponse.json({ listing: formatListing(doc.toObject()) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function assertOwner(id: string, userId: string) {
  const doc = await Listing.findById(id).populate({ path: "seller_id", select: "user_id" });
  if (!doc) return null;
  const ownerUserId = String((doc.seller_id as { user_id?: unknown })?.user_id ?? "");
  return ownerUserId === userId ? doc : null;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const limited = rateLimit(req, "listings:update", { limit: 60, windowMs: 60_000 });
    if (limited) return limited;

    const { id } = await params;
    if (!isOid(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const owned = await assertOwner(id, user.userId);
    if (!owned) return NextResponse.json({ error: "Not found or forbidden" }, { status: 403 });

    const parsed = await parseJson(req, listingUpdateSchema);
    if (parsed instanceof NextResponse) return parsed;
    const body = parsed as Record<string, unknown>;
    const updates: Record<string, unknown> = {};
    const direct = ["price", "price_negotiable", "gender", "age_weeks", "color", "microchip_number", "passport_number", "vaccinated", "dewormed", "vet_checked", "pedigree", "pedigree_organization", "ready_date", "location_city", "location_country", "breed_id", "images", "documents"];
    for (const key of direct) if (key in body) updates[key] = body[key];

    if ("title_en" in body || "title_fr" in body || "title_nl" in body) {
      updates.title = { en: body.title_en ?? "", fr: body.title_fr ?? body.title_en ?? "", nl: body.title_nl ?? body.title_en ?? "" };
    }
    if ("description_en" in body || "description_fr" in body || "description_nl" in body) {
      updates.description = { en: body.description_en ?? "", fr: body.description_fr ?? body.description_en ?? "", nl: body.description_nl ?? body.description_en ?? "" };
    }
    if ("status" in body) updates.status = body.status === "active" ? "pending_review" : body.status;

    if (Object.keys(updates).length === 0) return NextResponse.json({ error: "No valid fields" }, { status: 400 });

    await Listing.updateOne({ _id: id }, { $set: updates });
    const populated = await Listing.findById(id).populate(POPULATE).lean();
    return NextResponse.json({ listing: formatListing(populated as Record<string, unknown>) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!isOid(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const owned = await assertOwner(id, user.userId);
    if (!owned) return NextResponse.json({ error: "Not found or forbidden" }, { status: 403 });

    await Listing.deleteOne({ _id: id });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
