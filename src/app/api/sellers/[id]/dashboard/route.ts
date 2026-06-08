import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { SellerProfile, Listing, Inquiry } from "@/lib/models";
import { formatListing } from "../../../listings/route";

const POPULATE = [{ path: "species_id" }, { path: "breed_id" }, { path: "seller_id" }];

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!/^[a-f0-9]{24}$/i.test(id)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await connectDB();
    const seller = await SellerProfile.findOne({ _id: id, user_id: user.userId }).select("_id").lean<{ _id: unknown }>();
    if (!seller) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const listingRows = await Listing.find({ seller_id: id }).sort({ created_at: -1 }).populate(POPULATE).lean();

    const stats = {
      total_listings: listingRows.length,
      active_listings: listingRows.filter((l) => l.status === "active").length,
      total_views: listingRows.reduce((s, l) => s + (Number(l.view_count) || 0), 0),
      total_inquiries: listingRows.reduce((s, l) => s + (Number(l.inquiry_count) || 0), 0),
    };

    const listingIds = listingRows.map((l) => (l as Record<string, unknown>)._id);
    const inquiries = listingIds.length
      ? await Inquiry.find({ listing_id: { $in: listingIds } })
          .sort({ created_at: -1 })
          .limit(10)
          .populate({ path: "listing_id", select: "title" })
          .lean()
      : [];

    const recentMessages = inquiries.map((q) => {
      const listing = (q.listing_id as { title?: { en?: string } }) ?? {};
      return {
        id: String((q as Record<string, unknown>)._id),
        body: q.message,
        sender_name: q.buyer_name,
        sender_email: q.buyer_email,
        listing_title: listing.title?.en ?? "General inquiry",
        created_at: q.created_at,
      };
    });

    return NextResponse.json({
      stats,
      recent_listings: listingRows.slice(0, 10).map((l) => formatListing(l as Record<string, unknown>)),
      recent_messages: recentMessages,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
