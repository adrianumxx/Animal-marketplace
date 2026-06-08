import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Inquiry, Listing, SellerProfile, ShelterProfile, Message } from "@/lib/models";

function err(e: unknown) {
  const m = e instanceof Error ? e.message : "Error";
  return NextResponse.json({ error: m }, { status: m === "Unauthorized" ? 401 : 500 });
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    await connectDB();

    // Listings owned by me (as seller or shelter)
    const [sp, shp] = await Promise.all([
      SellerProfile.findOne({ user_id: user.userId }).select("_id").lean<{ _id: unknown }>(),
      ShelterProfile.findOne({ user_id: user.userId }).select("_id").lean<{ _id: unknown }>(),
    ]);
    const ownerIds = [sp?._id, shp?._id].filter(Boolean);
    const myListingIds = ownerIds.length ? await Listing.find({ $or: [{ seller_id: { $in: ownerIds } }, { shelter_id: { $in: ownerIds } }] }).distinct("_id") : [];

    const inquiries = await Inquiry.find({ $or: [{ buyer_user_id: user.userId }, { listing_id: { $in: myListingIds } }] })
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
        listing_title: listing.title?.en ?? "Listing",
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
