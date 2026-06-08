import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseJson } from "@/lib/api-guard";
import { requireAuth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Favorite, Listing } from "@/lib/models";

const bodySchema = z.object({ listing_id: z.string().regex(/^[a-f0-9]{24}$/i) });

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    await connectDB();
    const favs = await Favorite.find({ user_id: user.userId })
      .sort({ created_at: -1 })
      .populate({ path: "listing_id", populate: [{ path: "species_id" }, { path: "breed_id" }, { path: "seller_id" }] })
      .lean();
    return NextResponse.json({ favorites: favs });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const parsed = await parseJson(req, bodySchema);
    if (parsed instanceof NextResponse) return parsed;
    await connectDB();
    const exists = await Listing.exists({ _id: parsed.listing_id });
    if (!exists) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    await Favorite.updateOne(
      { user_id: user.userId, listing_id: parsed.listing_id },
      { $setOnInsert: { user_id: user.userId, listing_id: parsed.listing_id } },
      { upsert: true }
    );
    return NextResponse.json({ success: true, favorited: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const parsed = await parseJson(req, bodySchema);
    if (parsed instanceof NextResponse) return parsed;
    await connectDB();
    await Favorite.deleteOne({ user_id: user.userId, listing_id: parsed.listing_id });
    return NextResponse.json({ success: true, favorited: false });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
