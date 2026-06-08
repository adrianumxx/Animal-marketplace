import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseJson } from "@/lib/api-guard";
import { requireAuth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { ShelterProfile, Listing, Inquiry } from "@/lib/models";

function err(e: unknown) {
  const m = e instanceof Error ? e.message : "Error";
  return NextResponse.json({ error: m }, { status: m === "Unauthorized" ? 401 : 500 });
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    await connectDB();
    const profile = await ShelterProfile.findOne({ user_id: user.userId }).lean<Record<string, unknown>>();
    if (!profile) return NextResponse.json({ error: "No shelter profile" }, { status: 404 });

    const listings = await Listing.find({ shelter_id: profile._id }).sort({ created_at: -1 }).lean();
    const listingIds = listings.map((l) => (l as Record<string, unknown>)._id);
    const requests = listingIds.length
      ? await Inquiry.find({ listing_id: { $in: listingIds } }).sort({ created_at: -1 }).limit(20)
          .populate({ path: "listing_id", select: "title" }).lean()
      : [];

    return NextResponse.json({
      profile: { ...profile, id: String(profile._id) },
      stats: {
        listings: listings.length,
        active: listings.filter((l) => l.status === "active").length,
        adopted: listings.filter((l) => l.status === "sold").length,
        requests: requests.length,
      },
      listings: listings.map((l) => ({
        id: String((l as Record<string, unknown>)._id),
        title: (l.title as { en?: string })?.en ?? "Animal",
        status: l.status, view_count: l.view_count, inquiry_count: l.inquiry_count,
        image: (l.images as { url?: string }[])?.[0]?.url ?? null,
      })),
      requests: requests.map((q) => ({
        id: String((q as Record<string, unknown>)._id),
        buyer_name: q.buyer_name, buyer_email: q.buyer_email, message: q.message,
        listing_title: (q.listing_id as { title?: { en?: string } })?.title?.en ?? "Animal",
        created_at: q.created_at,
      })),
    });
  } catch (e) { return err(e); }
}

const putSchema = z.object({
  organization_name: z.string().trim().max(160).optional(),
  bio_en: z.string().trim().max(3000).optional(),
  location_city: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(40).optional(),
  website_url: z.string().trim().max(200).optional(),
  cover_url: z.string().trim().max(400).optional(),
});

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const parsed = await parseJson(req, putSchema);
    if (parsed instanceof NextResponse) return parsed;
    await connectDB();
    const profile = await ShelterProfile.findOne({ user_id: user.userId });
    if (!profile) return NextResponse.json({ error: "No shelter profile" }, { status: 404 });

    for (const k of ["organization_name", "location_city", "phone", "website_url", "cover_url"] as const) {
      if (parsed[k] !== undefined) (profile as Record<string, unknown>)[k] = parsed[k];
    }
    if (parsed.bio_en !== undefined) profile.bio = { ...(profile.bio ?? {}), en: parsed.bio_en };
    await profile.save();
    return NextResponse.json({ success: true });
  } catch (e) { return err(e); }
}
