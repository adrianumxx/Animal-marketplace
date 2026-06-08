import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseJson, rateLimit } from "@/lib/api-guard";
import { getAuthUser, requireAuth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Inquiry, Listing, SellerProfile, ShelterProfile } from "@/lib/models";
import { createNotification } from "@/lib/notifications";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await connectDB();
    const rows = await Inquiry.find({ buyer_user_id: user.userId })
      .sort({ created_at: -1 })
      .populate({ path: "listing_id", populate: [{ path: "breed_id" }, { path: "seller_id" }] })
      .lean();
    return NextResponse.json({ inquiries: rows });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}

const inquirySchema = z.object({
  listing_id: z.string().regex(/^[a-f0-9]{24}$/i),
  buyer_name: z.string().trim().min(2).max(120),
  buyer_email: z.string().email().trim().toLowerCase(),
  buyer_phone: z.string().trim().max(40).optional().nullable(),
  message: z.string().trim().min(10).max(4000),
});

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(request, "inquiries:create", { limit: 8, windowMs: 60_000 });
    if (limited) return limited;

    const parsed = await parseJson(request, inquirySchema);
    if (parsed instanceof NextResponse) return parsed;
    const { listing_id, buyer_name, buyer_email, buyer_phone, message } = parsed;

    const user = await getAuthUser(request);
    await connectDB();

    const inquiry = await Inquiry.create({
      listing_id,
      buyer_user_id: user?.userId ?? null,
      buyer_name,
      buyer_email,
      buyer_phone: buyer_phone || null,
      message,
      status: "new",
    });

    await Listing.updateOne({ _id: listing_id }, { $inc: { inquiry_count: 1 } });

    // Notify the listing owner (seller or shelter).
    try {
      const listing = await Listing.findById(listing_id).select("seller_id shelter_id title").lean<{ seller_id?: unknown; shelter_id?: unknown; title?: { en?: string } }>();
      let ownerUserId: string | null = null;
      if (listing?.seller_id) {
        const sp = await SellerProfile.findById(listing.seller_id).select("user_id").lean<{ user_id?: unknown }>();
        ownerUserId = sp?.user_id ? String(sp.user_id) : null;
      } else if (listing?.shelter_id) {
        const shp = await ShelterProfile.findById(listing.shelter_id).select("user_id").lean<{ user_id?: unknown }>();
        ownerUserId = shp?.user_id ? String(shp.user_id) : null;
      }
      if (ownerUserId) {
        await createNotification({
          userId: ownerUserId,
          type: "inquiry",
          title: "New inquiry",
          body: `${buyer_name} is interested in ${listing?.title?.en ?? "your listing"}.`,
          link: `/listings/${listing_id}`,
        });
      }
    } catch { /* non-blocking */ }

    return NextResponse.json({ success: true, id: String(inquiry._id) }, { status: 201 });
  } catch (error) {
    console.error("Inquiry API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
