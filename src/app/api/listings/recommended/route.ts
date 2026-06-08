import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User, Species, Listing, Favorite, RecentlyViewed } from "@/lib/models";
import { formatListing } from "../route";

const POPULATE = [{ path: "species_id" }, { path: "breed_id" }, { path: "seller_id" }];

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    await connectDB();

    const filter: Record<string, unknown> = { status: "active" };
    let speciesSlugs: string[] = [];
    let budgetMax: number | null = null;

    if (user) {
      const u = await User.findById(user.userId).select("preferences").lean<{ preferences?: { species?: string[]; budget_max?: number | null } }>();
      speciesSlugs = u?.preferences?.species ?? [];
      budgetMax = u?.preferences?.budget_max ?? null;

      // Derive from behaviour when no explicit prefs
      if (speciesSlugs.length === 0) {
        const favIds = await Favorite.find({ user_id: user.userId }).distinct("listing_id");
        const seenIds = await RecentlyViewed.find({ user_id: user.userId }).distinct("listing_id");
        const ids = [...favIds, ...seenIds];
        if (ids.length) {
          const spIds = await Listing.find({ _id: { $in: ids } }).distinct("species_id");
          if (spIds.length) filter.species_id = { $in: spIds };
        }
      }
    }

    if (speciesSlugs.length) {
      const ids = await Species.find({ slug: { $in: speciesSlugs } }).distinct("_id");
      if (ids.length) filter.species_id = { $in: ids };
    }
    if (budgetMax) filter.price = { $lte: budgetMax };

    const rows = await Listing.find(filter).sort({ is_featured: -1, created_at: -1 }).limit(8).populate(POPULATE).lean();
    return NextResponse.json({ listings: rows.map((r) => formatListing(r as Record<string, unknown>)), personalized: Boolean(user) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
