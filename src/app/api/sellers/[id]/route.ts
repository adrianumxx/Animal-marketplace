import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { SellerProfile } from "@/lib/models";

function formatSeller(row: Record<string, unknown>) {
  const user = (row.user_id as Record<string, unknown>) ?? {};
  const bio = (row.bio as Record<string, string> | null | undefined) ?? {};
  return {
    ...row,
    id: String(row._id),
    bio_en: bio.en ?? "",
    bio_fr: bio.fr ?? "",
    bio_nl: bio.nl ?? "",
    email: user.email,
    full_name: user.full_name,
    rating: Number(row.rating ?? 0),
  };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!/^[a-f0-9]{24}$/i.test(id)) return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    await connectDB();
    const seller = await SellerProfile.findById(id).populate({ path: "user_id", select: "email full_name" }).lean();
    if (!seller) return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    return NextResponse.json({ seller: formatSeller(seller as Record<string, unknown>) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const seller = await SellerProfile.findOne({ _id: id, user_id: user.userId });
    if (!seller) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    for (const key of ["business_name", "location_city", "location_country", "phone", "website_url", "approval_number", "years_experience", "cover_url", "avatar_url"]) {
      if (key in body) (seller as Record<string, unknown>)[key] = body[key];
    }
    if ("bio_en" in body || "bio_fr" in body || "bio_nl" in body) {
      seller.bio = {
        en: body.bio_en ?? seller.bio?.en ?? "",
        fr: body.bio_fr ?? seller.bio?.fr ?? "",
        nl: body.bio_nl ?? seller.bio?.nl ?? "",
      };
    }
    await seller.save();
    const populated = await SellerProfile.findById(id).populate({ path: "user_id", select: "email full_name" }).lean();
    return NextResponse.json({ seller: formatSeller(populated as Record<string, unknown>) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
