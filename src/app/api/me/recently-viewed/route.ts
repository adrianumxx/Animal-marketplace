import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { RecentlyViewed } from "@/lib/models";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    await connectDB();
    const rows = await RecentlyViewed.find({ user_id: user.userId })
      .sort({ viewed_at: -1 })
      .limit(12)
      .populate({ path: "listing_id", populate: [{ path: "breed_id" }, { path: "seller_id" }] })
      .lean();
    return NextResponse.json({ recently_viewed: rows.filter((r) => r.listing_id) });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    await connectDB();
    await RecentlyViewed.deleteMany({ user_id: user.userId });
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
