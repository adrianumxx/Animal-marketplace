import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Inquiry, Listing, SellerProfile, ShelterProfile, VetProfile, Message } from "@/lib/models";

function err(e: unknown) {
  const m = e instanceof Error ? e.message : "Error";
  return NextResponse.json({ error: m }, { status: m === "Unauthorized" ? 401 : 500 });
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    await connectDB();

    // Profiles owned by me (as seller, shelter or vet)
    const [sp, shp, vp] = await Promise.all([
      SellerProfile.findOne({ user_id: user.userId }).select("_id").lean<{ _id: unknown }>(),
      ShelterProfile.findOne({ user_id: user.userId }).select("_id").lean<{ _id: unknown }>(),
      VetProfile.findOne({ user_id: user.userId }).select("_id").lean<{ _id: unknown }>(),
    ]);
    const ownerIds = [sp?._id, shp?._id].filter(Boolean);
    const myListingIds = ownerIds.length ? await Listing.find({ $or: [{ seller_id: { $in: ownerIds } }, { shelter_id: { $in: ownerIds } }] }).distinct("_id") : [];

    const targetOr: Record<string, unknown>[] = [{ buyer_user_id: user.userId }, { listing_id: { $in: myListingIds } }];
    if (sp?._id) targetOr.push({ seller_id: sp._id });
    if (shp?._id) targetOr.push({ shelter_id: shp._id });
    if (vp?._id) targetOr.push({ vet_id: vp._id });

    const inquiries = await Inquiry.find({ $or: targetOr })
      .sort({ created_at: -1 })
      .populate({ path: "listing_id", select: "title" })
      .lean();

    const convos = await Promise.all(inquiries.map(async (q) => {
      const id = String((q as Record<string, unknown>)._id);
      const last = await Message.findOne({ inquiry_id: id }).sort({ created_at: -1 }).lean<{ body?: string; created_at?: Date }>();
      const unread = await Message.countDocuments({ inquiry_id: id, read: false, sender_id: { $ne: user.userId } });
      const iAmBuyer = String(q.buyer_user_id ?? "") === user.userId;
      const listing = (q.listing_id as { _id?: unknown; title?: { en?: string } }) ?? {};
      return {
        id,
        listing_id: listing._id ? String(listing._id) : null,
        listing_title: listing._id ? (listing.title?.en ?? "Listing") : "Direct message",
        role: iAmBuyer ? "buyer" : "owner",
        counterpart: iAmBuyer ? "Breeder" : q.buyer_name,
        last_message: last?.body ?? q.message,
        updated_at: last?.created_at ?? q.created_at,
        unread,
      };
    }));

    return NextResponse.json({ conversations: convos });
  } catch (e) { return err(e); }
}
