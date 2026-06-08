import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseJson, rateLimit } from "@/lib/api-guard";
import { getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Review } from "@/lib/models";

const reviewSchema = z.object({
  seller_id: z.string().regex(/^[a-f0-9]{24}$/i),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional().default(""),
  body: z.string().trim().max(3000).optional().default(""),
});

export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(req, "reviews:create", { limit: 6, windowMs: 60_000 });
    if (limited) return limited;

    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const parsed = await parseJson(req, reviewSchema);
    if (parsed instanceof NextResponse) return parsed;
    const { seller_id, rating, title, body: reviewBody } = parsed;

    await connectDB();
    const existing = await Review.findOne({ reviewer_id: user.userId, seller_id }).lean();
    if (existing) return NextResponse.json({ error: "You already reviewed this seller" }, { status: 409 });

    const review = await Review.create({
      reviewer_id: user.userId,
      seller_id,
      rating,
      title: title || null,
      body: reviewBody || null,
    });
    return NextResponse.json({ review }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const seller_id = req.nextUrl.searchParams.get("seller_id");
    if (!seller_id) return NextResponse.json({ error: "seller_id required" }, { status: 400 });

    await connectDB();
    const rows = await Review.find({ seller_id })
      .sort({ created_at: -1 })
      .populate({ path: "reviewer_id", select: "full_name" })
      .lean();
    const reviews = rows.map((r) => {
      const reviewer = (r.reviewer_id as Record<string, unknown>) ?? {};
      return { ...r, id: String((r as Record<string, unknown>)._id), reviewer_name: (reviewer.full_name as string) ?? "Buyer" };
    });
    return NextResponse.json({ reviews });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
