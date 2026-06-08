import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseJson, rateLimit } from "@/lib/api-guard";
import { getAuthUser, requireAuth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Inquiry, Listing, SellerProfile, ShelterProfile, VetProfile, User } from "@/lib/models";
import { createNotification } from "@/lib/notifications";

const oid = /^[a-f0-9]{24}$/i;

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
  listing_id: z.string().regex(oid).optional(),
  seller_id: z.string().regex(oid).optional(),
  shelter_id: z.string().regex(oid).optional(),
  vet_id: z.string().regex(oid).optional(),
  buyer_name: z.string().trim().min(2).max(120).optional(),
  buyer_email: z.string().email().trim().toLowerCase().optional(),
  buyer_phone: z.string().trim().max(40).optional().nullable(),
  message: z.string().trim().min(2).max(4000),
});

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(request, "inquiries:create", { limit: 8, windowMs: 60_000 });
    if (limited) return limited;

    const parsed = await parseJson(request, inquirySchema);
    if (parsed instanceof NextResponse) return parsed;
    const { listing_id, seller_id, shelter_id, vet_id, buyer_phone, message } = parsed;

    if (!listing_id && !seller_id && !shelter_id && !vet_id) {
      return NextResponse.json({ error: "Missing recipient" }, { status: 400 });
    }

    const user = await getAuthUser(request);
    await connectDB();

    // Resolve buyer identity: prefer the form, else the logged-in user. Profile-level messages require login.
    let buyer_name = parsed.buyer_name;
    let buyer_email = parsed.buyer_email;
    if ((!buyer_name || !buyer_email) && user) {
      const u = await User.findById(user.userId).select("full_name email").lean<{ full_name?: string; email?: string }>();
      buyer_name = buyer_name || u?.full_name || u?.email || "Member";
      buyer_email = buyer_email || u?.email || "";
    }
    if (!buyer_name || !buyer_email) {
      return NextResponse.json({ error: "Sign in to send a message" }, { status: 401 });
    }

    const inquiry = await Inquiry.create({
      listing_id: listing_id ?? null,
      seller_id: seller_id ?? null,
      shelter_id: shelter_id ?? null,
      vet_id: vet_id ?? null,
      buyer_user_id: user?.userId ?? null,
      buyer_name, buyer_email,
      buyer_phone: buyer_phone || null,
      message,
      status: "new",
    });

    if (listing_id) await Listing.updateOne({ _id: listing_id }, { $inc: { inquiry_count: 1 } });

    // Resolve the recipient user to notify.
    try {
      let ownerUserId: string | null = null;
      let label = "your profile";
      if (listing_id) {
        const listing = await Listing.findById(listing_id).select("seller_id shelter_id title").lean<{ seller_id?: unknown; shelter_id?: unknown; title?: { en?: string } }>();
        label = listing?.title?.en ?? "your listing";
        const ownerId = listing?.seller_id ?? listing?.shelter_id;
        const Model = listing?.seller_id ? SellerProfile : ShelterProfile;
        if (ownerId) { const p = await Model.findById(ownerId).select("user_id").lean<{ user_id?: unknown }>(); ownerUserId = p?.user_id ? String(p.user_id) : null; }
      } else {
        const Model = seller_id ? SellerProfile : shelter_id ? ShelterProfile : VetProfile;
        const pid = seller_id || shelter_id || vet_id;
        const p = await Model.findById(pid).select("user_id").lean<{ user_id?: unknown }>();
        ownerUserId = p?.user_id ? String(p.user_id) : null;
      }
      if (ownerUserId) {
        await createNotification({
          userId: ownerUserId,
          type: "inquiry",
          title: "New message",
          body: `${buyer_name} sent you a message about ${label}.`,
          link: `/messages`,
        });
      }
    } catch { /* non-blocking */ }

    return NextResponse.json({ success: true, id: String(inquiry._id) }, { status: 201 });
  } catch (error) {
    console.error("Inquiry API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
